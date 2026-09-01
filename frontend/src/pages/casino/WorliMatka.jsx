import { useState, useEffect, useCallback, memo, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bToastSuccess, bToastError } from '../../components/BToast';
import { fetchBalanceThunk } from '../../redux/userSlice';
import BetChip from '../../components/casino/BetChip';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableWorli3 from '../../components/casino/BetTableWorli3';
import CasinoRightSidebar from '../../components/casino/CasinoRightSidebar';
import MatkaLastResults from '../../components/casino/MatkaLastResults';
import { placeCasinoBet } from '../../apiservices/casinoService';
import { MATKA_TABS, CHIP_VALUES, CHIP_COLOR, TOTAL_CHIP_COLOR } from '../../utils/casinoUtils';
import Footer from '../../components/layout/Footer';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoMyBets from '../../hooks/casino/useCasinoMyBets';
import useCasinoStream from '../../hooks/casino/useCasinoStream';

// Fixed Matka payout RATE per board market (mirrors BetTableWorli's ODDS table +
// Jodi 90 / Single 9.5 shown on the worli3 board). The rate is required for two
// reasons: casinoController.placeBet rejects `!odds` (why every worli3 bet, whose
// payload hard-coded odds:0, failed to place), and resolveWorli3 is a boolean
// resolver so settlement pays stake*odds. The selection STRING is sent as the raw
// board key ("single-3", "sp-pana-590", "3-5"…) — the settlement resolver
// canonicalizes the format (canonicalizeWorliSelection), so it's the single
// source of truth, matching how worli/worli2 already store their raw keys.
// Returns 0 for markets the board can't drive (cycle/motor need a multi-digit
// pick it doesn't accumulate; ABR rate isn't configured — BetTableWorli leaves
// them 0 too) so they're skipped rather than placed at a bogus price.
function matkaRate(key) {
  const k = String(key).trim().toLowerCase();
  if (/^\d-\d$/.test(k))          return 90;   // Jodi "3-5"
  if (k.startsWith('single-'))    return 9.5;
  if (k.startsWith('sp-pana-'))   return 140;
  if (k.startsWith('dp-pana-'))   return 240;
  if (k.startsWith('tp-pana-'))   return 700;
  if (k.startsWith('sp-'))        return 140;
  if (k.startsWith('dp-'))        return 240;
  if (k === 'trio-all')           return 700;
  if (k.startsWith('c56-'))       return 140;
  if (k.startsWith('c64-'))       return 140;
  if (k.startsWith('commonsp-'))  return 140;
  if (k.startsWith('commondp-'))  return 240;
  if (k.startsWith('colordp-'))   return 240;
  return 0;                                    // cycle / motorsp / abr — not bettable
}

const RoundTab = memo(function RoundTab({ round, active, onClick }) {
  return (
    <li className="nav-item">
      <a href="javascript:void(0)" className={`nav-link${active ? ' active' : ''}`} onClick={onClick}>
        {round.mname}
        <div className="remaining-time">
          <img src="/assets/icons/clock.png" alt="" />
          <span>{round.ptime}</span>
        </div>
        <div className="game-time"><span>{round.mtime}</span></div>
      </a>
    </li>
  );
});

export default function WorliMatka() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const dispatch = useDispatch();

  // ── Data hooks ──
  const { data: rounds = [] } = useCasinoGame('worli3', { isArray: true });
  const { data: lastResults = [] } = useCasinoLastResults('worli3', {
    transform: (r) => r.win || r.result || '',
  });
  const { streamUrl } = useCasinoStream('worli3');

  // ── Local UI state ──
  // Reference: worli3's gif loader overlay (.loader-section.custom-loader) —
  // the page renders first, then after 1s the loader appears for 0.5s
  const [bootLoading, setBootLoading] = useState(false);
  useEffect(() => {
    const show = setTimeout(() => setBootLoading(true), 1000);
    const hide = setTimeout(() => setBootLoading(false), 1500);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  const [activeRound, setActiveRound] = useState(0);
  const [activeTab, setActiveTab] = useState('jodi');
  const [coinAmount, setCoinAmount] = useState(0);
  const [selectedChip, setSelectedChip] = useState(null);
  const [pendingBets, setPendingBets] = useState({});
  const [placing, setPlacing] = useState(false);

  const currentRound = rounds[activeRound] || null;
  const mid = currentRound?.mid ?? '';
  const { myBets, exposures } = useCasinoMyBets(mid, isAuth);
  const isAllSuspended = currentRound?.ptime === '00:00:00';
  const isJodiSuspended = isAllSuspended || currentRound?.mtype === 'CLOSED';

  // ── Handlers ──
  const handleChipClick = useCallback((amount) => {
    setSelectedChip(amount);
    setCoinAmount((prev) => prev + amount);
  }, []);

  const handleReset = useCallback(() => {
    setCoinAmount(0);
    setSelectedChip(null);
  }, []);

  const handleBet = useCallback((key) => {
    if (!isAuth) { bToastError('Please login to place bets'); return; }
    if (coinAmount <= 0) { bToastError('Select a coin amount first'); return; }
    setPendingBets((prev) => ({ ...prev, [key]: (prev[key] || 0) + coinAmount }));
  }, [coinAmount, isAuth]);

  const handleClear = useCallback(() => setPendingBets({}), []);

  const handlePlaceBet = useCallback(async () => {
    if (!isAuth) { bToastError('Please login'); return; }
    const entries = Object.entries(pendingBets);
    if (!entries.length) { bToastError('No bets placed'); return; }
    setPlacing(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = (user?.user_id || user?.id || '').toString();
      const mid = currentRound?.mid || '';
      let failed = false;
      let placed = 0;
      let skipped = 0;
      for (const [key, amount] of entries) {
        // Price the board key. Unbettable markets (cycle/motor/ABR — no configured
        // rate / need a multi-digit pick the board can't make) are skipped rather
        // than sent at odds 0. The raw key is the selection; the resolver
        // canonicalizes its format at settlement.
        const odds = matkaRate(key);
        if (!odds) { skipped++; continue; }
        const payload = {
          userId,
          player_name: key,
          gameId: mid.toString(),
          gameName: 'worli3',
          gtype: 'worli3',
          amount: parseFloat(amount) || 0,
          odds,
          selection: key,
          roundId: mid || 0,
          type: 'back',
          mtype: 'fancy',
        };
        const res = await placeCasinoBet(payload);
        if (!res?.success && res?.status !== 200) {
          bToastError(res?.error || res?.msg || 'Failed to place bet');
          failed = true;
          break;
        }
        placed += 1;
      }
      if (!failed) {
        if (placed > 0) {
          bToastSuccess('Bets placed successfully!');
          setPendingBets({});
          setCoinAmount(0);
          const token = localStorage.getItem('token');
          if (token) dispatch(fetchBalanceThunk(token));
        }
        if (skipped > 0) {
          bToastError(`${skipped} selection(s) not available for this market yet`);
        }
      }
    } catch { bToastError('Error placing bets'); }
    finally { setPlacing(false); }
  }, [isAuth, pendingBets, currentRound, dispatch]);

  return (
    <>
      <div className="casino-center">
        <div className="casino-container">
          {/* Boot loader — reference markup: loader-section custom-loader (full-
              screen overlay, the table renders underneath it) */}
          {bootLoading && (
            <div className="loader-section custom-loader">
              <div>
                <img src="/assets/animate/loader-ten.gif" alt="loader" />
              </div>
            </div>
          )}
          <div className="casino-table worli matka">

            {/* ── Time tabs ── */}
            <div className="matka-tabs">
              <ul className="nav nav-pills">
                {rounds.length === 0 ? (
                  <li className="nav-item">
                    <a href="javascript:void(0)" className="nav-link active">Loading...</a>
                  </li>
                ) : rounds.map((round, i) => (
                  <RoundTab key={round.mid} round={round} active={i === activeRound} onClick={() => setActiveRound(i)} />
                ))}
              </ul>
            </div>

            {/* ── Video ── */}
            <CasinoVideo streamUrl={streamUrl} />

            {/* ── Casino detail ── */}
            <div className="casino-detail">

              {/* ── Coins ── */}
              <div className="matka-coins">
                <div className="matka-coin-title">
                  <span className="d-none d-md-flex">SET YOUR COIN AMOUNT<br />AND START 1-CLICK BET!</span>
                  <span className="d-md-none">SET YOUR COIN AMOUNT AND START 1-CLICK BET!</span>
                  <button className="btn btn-danger btn-sm" onClick={handleReset}>Reset</button>
                </div>
                <div className="matka-total-coin">
                  <BetChip amount={coinAmount} color={TOTAL_CHIP_COLOR} />
                  <div>=</div>
                </div>
                <div className="matka-other-coins">
                  {CHIP_VALUES.map((val, i) => (
                    <Fragment key={val}>
                      <BetChip amount={val} color={CHIP_COLOR} selected={selectedChip === val} onClick={() => handleChipClick(val)} />
                      {i < CHIP_VALUES.length - 1 && <div>+</div>}
                    </Fragment>
                  ))}
                </div>
              </div>

              {/* ── Game tabs ── */}
              <div className="casino-tabs">
                <ul className="nav nav-tabs">
                  {MATKA_TABS.map((tab) => (
                    <li key={tab.id} className="nav-item">
                      <a href={`#${tab.id}`} data-toggle="tab"
                        className={`nav-link${activeTab === tab.id ? ' active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
                      >{tab.label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Bet table ── */}
              <BetTableWorli3
                activeTab={activeTab}
                isJodiSuspended={isJodiSuspended}
                isAllSuspended={isAllSuspended}
                onBet={handleBet} exposures={exposures}
                onClear={handleClear}
                onPlaceBet={handlePlaceBet}
              />

              {/* ── Last results (mobile only) ── */}
              <MatkaLastResults results={lastResults} className="d-none-desktop" />
            </div>
          </div>
        </div>
        <div className="market-show-icon d-none-desktop" role="button" tabIndex={0}>
          <span>{Object.keys(pendingBets).length}</span>
        </div>
        <div className="casino-banners"></div>
        <Footer />
      </div>

      {/* ── Right sidebar ── */}
      <CasinoRightSidebar lastResults={lastResults} myBets={myBets} />
    </>
  );
}
