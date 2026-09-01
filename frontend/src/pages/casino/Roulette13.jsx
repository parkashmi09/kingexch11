import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { bToastSuccess, bToastError } from '../../components/BToast';
import { MobileTimer } from '../../components/casino/CasinoTimer';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableRoulette12 from '../../components/casino/BetTableRoulette12';
import Footer from '../../components/layout/Footer';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoMyBets from '../../hooks/casino/useCasinoMyBets';
import useCasinoStream from '../../hooks/casino/useCasinoStream';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import { placeCasinoBet, undoCasinoBet, getLastResults } from '../../apiservices/casinoService';
import { fetchBalanceThunk } from '../../redux/userSlice';

const GAME_TYPE = 'roulette13';
const REPORT_LINK = '/report/casinoresult/roulette13';

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

const CHIPS = [
  { amount: 10, color: '#00ddff' },
  { amount: 20, color: '#00ddff' },
  { amount: 50, color: '#00ddff' },
  { amount: 100, color: '#00ddff' },
  { amount: 200, color: '#99cc00' },
  { amount: 500, color: '#99cc00' },
];

function formatRange(val) {
  const num = parseFloat(val) || 0;
  if (num >= 10000000) return (num / 10000000).toFixed(0) + 'Cr';
  if (num >= 100000) return (num / 100000).toFixed(0) + 'L';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toFixed(0);
}

function resultColor(num) {
  if (num === 0) return 'green';
  return RED.has(num) ? 'red' : 'black';
}

export default function Roulette13() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const dispatch = useDispatch();
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  // Last results + stats — refetch every 1s
  const { data: lastResultsRaw } = useQuery({
    queryKey: ['casinoLastResults', GAME_TYPE],
    queryFn: () => getLastResults(GAME_TYPE),
    refetchInterval: 1000,
  });

  const lastResults = lastResultsRaw?.data?.data?.res || lastResultsRaw?.data?.res || [];
  const stats = lastResultsRaw?.data?.data?.g ?? null;

  const mid = gameData?.mid ?? '';
  const lt = gameData?.lt ?? 0;
  const ft = gameData?.ft ?? 20;
  const minBet = gameData?.min ?? '25';
  const maxBet = gameData?.max ?? '100000';

  // Detect newest result → pop-outin animation
  const prevLatestMidRef = useRef(null);
  const [latestWinNumber, setLatestWinNumber] = useState(-1);

  useEffect(() => {
    if (!lastResults.length) return;
    const newest = lastResults[0];
    const newestMid = newest?.mid;
    if (newestMid && newestMid !== prevLatestMidRef.current) {
      prevLatestMidRef.current = newestMid;
      const num = parseInt(newest.win || '0', 10);
      if (num >= 0 && num <= 36) setLatestWinNumber(num);
    }
  }, [lastResults]);

  const prevLtRef = useRef(0);
  useEffect(() => {
    if (lt > 0 && prevLtRef.current <= 0) setLatestWinNumber(-1);
    prevLtRef.current = lt;
  }, [lt]);

  const { myBets, refetch: refetchBets } = useCasinoMyBets(mid, isAuth);

  const subMap = useMemo(() => {
    const map = {};
    (gameData?.sub || []).forEach((item) => { map[item.i] = item; });
    return map;
  }, [gameData?.sub]);

  const [placing, setPlacing] = useState(false);
  const [placedBets, setPlacedBets] = useState([]);
  const [selectedChip, setSelectedChip] = useState(10);
  const [betMode, setBetMode] = useState('back');

  // Placed chips clear when a new round starts.
  useEffect(() => { setPlacedBets([]); }, [mid]);

  const handleBoardClick = useCallback(async (id) => {
    if (!isAuth) { bToastError('Please login to place bets'); return; }
    if (!selectedChip) { bToastError('Select a chip first'); return; }
    if (lt <= 0 || placing) return;
    const item = subMap[id];
    if (!item) return;

    setPlacing(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = (user?.user_id || user?.id || '').toString();
      const odds = betMode === 'lay' ? item.l : item.b;
      const payload = {
        userId,
        player_name: item.n || String(id),
        gameId: mid?.toString() || '',
        gameName: GAME_TYPE,
        gtype: GAME_TYPE,
        mtype: 'match',
        amount: selectedChip,
        odds: parseFloat(odds) || 0,
        selection: item.n || String(id),
        roundId: mid || 0,
        type: betMode,
      };
      const res = await placeCasinoBet(payload);
      if (res?.success || res?.status === 200) {
        bToastSuccess('Bet placed!');
        setPlacedBets((prev) => [...prev, { id, amount: selectedChip, mode: betMode }]);
        refetchBets?.();
        const token = localStorage.getItem('token');
        if (token) dispatch(fetchBalanceThunk(token));
      } else {
        bToastError(res?.error || res?.msg || 'Failed to place bet');
      }
    } catch {
      bToastError('Error placing bet');
    } finally {
      setPlacing(false);
    }
  }, [isAuth, selectedChip, betMode, lt, placing, subMap, mid, refetchBets]);

  // Undo/Clear reverse the server-side bets (money is locked on click). The
  // server refuses once betting closes (round mid + lt guard).
  const handleUndoServer = useCallback(async (all) => {
    if (placing) return;
    setPlacing(true);
    try {
      const res = await undoCasinoBet({ gameName: GAME_TYPE, roundId: mid, all });
      if (res?.success) {
        bToastSuccess(all ? 'Bets cleared' : 'Bet cancelled');
        setPlacedBets((prev) => (all ? [] : prev.slice(0, -1)));
        refetchBets?.();
        const token = localStorage.getItem('token');
        if (token) dispatch(fetchBalanceThunk(token));
      } else {
        bToastError(res?.error || res?.msg || 'Undo failed');
      }
    } catch (e) {
      bToastError(e?.response?.data?.error || 'Undo failed');
    } finally {
      setPlacing(false);
    }
  }, [placing, mid, refetchBets, dispatch]);

  const handleUndo = useCallback(() => handleUndoServer(false), [handleUndoServer]);
  const handleClear = useCallback(() => handleUndoServer(true), [handleUndoServer]);
  const hasBets = placedBets.length > 0;

  const renderResult = useCallback((r, i) => {
    const num = parseInt(r.win || '0', 10);
    const padded = String(r.win || '0').padStart(2, '0');
    return (
      <span key={i} className={`roulette-result ${resultColor(num)}`} onClick={() => setResultMid(r.mid || null)} style={{ cursor: 'pointer' }}>{padded}</span>
    );
  }, []);

  // Roulette card image from latest result
  const latestResultNum = lastResults[0] ? String(lastResults[0].win || '0').padStart(2, '0') : null;
  const rouletteCardImage = latestResultNum ? (
    <div className="casino-video-cards">
      <div className="casino-video-cards-container">
        <div>
          <span>
            <img src={`/assets/casino/roulette-cards/${latestResultNum}.png`} alt={latestResultNum} />
          </span>
        </div>
      </div>
    </div>
  ) : null;

  const customTitle = (
    <div className="casino-video-title">
      <span className="casino-name">Roulette</span>
      <div className="casino-video-rid">Round ID: {mid}</div>
      <div className="casino-video-rid">
        Range: <span>{formatRange(minBet)}</span>-<span>{formatRange(maxBet)}</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="casino-center">
        <div className="casino-container">

          <MobileTimer timeLeft={lt} fullTime={ft} />

          <div className="casino-table roulette roulette11 roulette13">

            <CasinoVideo
              streamUrl={streamUrl}
              gameName="Roulette"
              roundId={mid}
              gameType={GAME_TYPE}
              showTimers
              timeLeft={lt}
              fullTime={ft}
              tableClass="roulette roulette11 roulette13"
              customTitle={customTitle}
              customCards={rouletteCardImage}
              extraClass={lt <= 0 ? 'full' : ''}
            >
              {/* Coin selector + Undo/Repeat/Clear — visible when the round is open */}
              {lt > 0 && (
                <div className="casino-coins-container">
                  <div className="casino-coin-box">
                    {CHIPS.map((chip) => (
                      <div key={chip.amount} className={`casino-coin${selectedChip === chip.amount ? ' active' : ''}`} onClick={() => setSelectedChip(chip.amount)}>
                        <div className="bet-chip-holder" style={{ '--g-chip-inner-color': chip.color }}>
                          <div className="bet-chip">
                            <div className="bet-chip-front" />
                            <div className="bet-chip-top" />
                            <div className="bet-chip-amount">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 108 108" className="bet-chip-amount-in">
                                <text x="50%" y="53.5%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="700" className="bet-chip-amount-label">
                                  {chip.amount}
                                </text>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="coin-btns">
                    <div>
                      <button className={`btn btn-danger${!hasBets ? ' disabled' : ''}`} disabled={!hasBets} onClick={handleUndo}>
                        <i className="fas fa-undo" /> <span className="d-none d-md-flex">Undo Bet</span>
                      </button>
                      <span className="d-md-none">Undo Bet</span>
                    </div>
                    <div>
                      <button className="btn btn-info">
                        <i className="fas fa-redo" /> <span className="d-none d-md-flex">Repeat</span>
                      </button>
                      <span className="d-md-none">Repeat</span>
                    </div>
                    <div>
                      <button className={`btn btn-warning${!hasBets ? ' disabled' : ''}`} disabled={!hasBets} onClick={handleClear}>
                        <i className="fas fa-trash" /> <span className="d-none d-md-flex">Clear</span>
                      </button>
                      <span className="d-md-none">clear</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile back/lay switch + statistics label */}
              <div className="transfer-board d-md-none">
                <div className="switch-board-icon">
                  <div className={`back${betMode === 'back' ? ' active' : ''}`} onClick={() => setBetMode('back')}>Back</div>
                  <div className={`lay${betMode === 'lay' ? ' active' : ''}`} onClick={() => setBetMode('lay')}>Lay</div>
                </div>
                <h4 className="d-lg-none mb-0"><span>Statistics</span></h4>
              </div>
            </CasinoVideo>

            <div className="casino-detail">
              {/* Desktop back/lay switch */}
              <div className="transfer-board d-none d-md-flex">
                <div className="switch-board-icon">
                  <div className={`back${betMode === 'back' ? ' active' : ''}`} onClick={() => setBetMode('back')}>Back</div>
                  <div className={`lay${betMode === 'lay' ? ' active' : ''}`} onClick={() => setBetMode('lay')}>Lay</div>
                </div>
              </div>

              <BetTableRoulette12 gameData={gameData} onBet={handleBoardClick} latestWinNumber={latestWinNumber} />

              <div className="casino-video-last-results d-none-desktop">
                {lastResults.slice(0, 9).map(renderResult)}
                <a href={REPORT_LINK} className="result-more">...</a>
              </div>
            </div>

          </div>
        </div>

        <div className="casino-banners"></div>
        <Footer />
      </div>

      {/* Right sidebar */}
      <div id="right-sidebar-id" className="right-sidebar casino-right-sidebar teen2sidebar">
        <h5>Statistics</h5>
        {stats && (
          <div className="roulette11-table mt-2">
            <div className="roulette11-table-row">
              <div className="roulette11-table-cell"><span>1st12:</span> <b className="blink_me">{stats.C1st12}%</b></div>
              <div className="roulette11-table-cell"><span>2nd12:</span> <b className="blink_me">{stats.C2nd12}%</b></div>
              <div className="roulette11-table-cell"><span>3rd12:</span> <b className="blink_me">{stats.C3rd12}%</b></div>
            </div>
            <div className="roulette11-table-row">
              <div className="roulette11-table-cell"><span>1-34:</span> <b className="blink_me">{stats.R1st}%</b></div>
              <div className="roulette11-table-cell"><span>2-35:</span> <b className="blink_me">{stats.R2nd}%</b></div>
              <div className="roulette11-table-cell"><span>3-36:</span> <b className="blink_me">{stats.R3rd}%</b></div>
            </div>
            <div className="roulette11-table-row">
              <div className="roulette11-table-cell"><span>Red:</span> <b className="blink_me">{stats.Red}%</b></div>
              <div className="roulette11-table-cell"><span>Black:</span> <b className="blink_me">{stats.Blk}%</b></div>
            </div>
            <div className="roulette11-table-row">
              <div className="roulette11-table-cell"><span>Odd:</span> <b className="blink_me">{stats.Odd}%</b></div>
              <div className="roulette11-table-cell"><span>Even:</span> <b className="blink_me">{stats.Evn}%</b></div>
            </div>
            <div className="roulette11-table-row">
              <div className="roulette11-table-cell"><span>1to18:</span> <b className="blink_me">{stats.T01to18}%</b></div>
              <div className="roulette11-table-cell"><span>19to36:</span> <b className="blink_me">{stats.T19to36}%</b></div>
            </div>
          </div>
        )}

        <div className="casino-place-bet">
          <div className="casino-place-bet-title"><span>Last Results</span></div>
          <div className="casino-video-last-results">
            {lastResults.slice(0, 9).map(renderResult)}
            <a href={REPORT_LINK} className="result-more">...</a>
          </div>
        </div>

        <span></span>

        <div className="my-market-container">
          <div data-toggle="collapse" data-target="#market-data-1" className="my-market-title">
            <span>My Bet</span>
          </div>
          {myBets.length > 0 && (
            <div id="market-data-1" className="bet-slip-box collapse show">
              <table className="coupon-table table table-borderedless">
                <thead>
                  <tr className="theme1font">
                    <th style={{ width: '40%' }}>Nation</th>
                    <th className="text-right">Odds</th>
                    <th className="text-right p-r-15">Stake</th>
                  </tr>
                </thead>
                <tbody>
                  {myBets.map((bet, i) => (
                    <tr key={bet._id || i} className={bet.type || 'back'}>
                      <td><span>{bet.player_name || bet.selection || ''}</span></td>
                      <td className="text-right">{bet.odds ?? ''}</td>
                      <td className="text-right p-r-15">{bet.amount ?? bet.stake ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={GAME_TYPE}
        gameName="Roulette"
        mid={resultMid}
      />
    </>
  );
}
