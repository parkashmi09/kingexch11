import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CasinoRulesModal from '../../components/casino/CasinoRulesModal';
import CasinoDesktopRules from '../../components/casino/CasinoDesktopRules';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import TrioRules from '../../components/casino/rules/TrioRules';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoBet from '../../hooks/casino/useCasinoBet';
import useVcasinoSound from '../../hooks/casino/useVcasinoSound';
import useIsDesktop from '../../hooks/useIsDesktop';
import VCasinoDeck from '../../components/vcasino/VCasinoDeck';
import { cardSrc, FACE_DOWN, isFaceDown } from '../../utils/vcasinoCards';
import { formatMax } from '../../utils/oddsHelpers';

const GAME_TYPE = 'vtrio';
const VC = '/assets/virtual-casino';
// Trio's dealer backdrop is 11 (Lucky 7's is 5) — the id is per game.
const DEALER_BG = 11;
// The right stack never moved off twenty in any capture, and the round only
// ever deals three cards, so the shoe is a fixed prop here rather than a
// counter that depletes the way Lucky 7's does.
const TRIO_DECK = 20;
const CARDS_PER_ROUND = 3;
const STAKE_FALLBACK = [25, 50, 100, 200, 500, 1000];

// Selections addressed by SID, taken from live all-data — never from the order
// the board happens to print them in.
const MAIN = [1, 2, 3];              // Session, 3 Card Judgement (1 2 4), (J Q K)
const OTHER = [4, 5, 6, 7];          // Two Red / Black / Odd / Even Only
const SUB = [8, 9, 10, 11, 12];      // Pair, Flush, Straight, Trio, Straight Flush
// Session quotes a run LINE in b/l and the RATE in bbhav/lbhav; every other
// market quotes a decimal price directly. useCasinoBet already knows this
// shape — it wants the selection tagged so it prices off the rate.
const SESSION_SID = 1;

/**
 * One `vodds-box`. Back/lay order is NOT uniform in the reference: the Session
 * box prints LAY first, every other two-sided box prints BACK first, and the
 * sub-odds boxes have no lay side at all.
 */
function OddsBox({ sel, onBet, book = 0 }) {
  if (!sel) return null;
  const suspended = sel.gstatus !== 'OPEN';
  const isSession = sel.sid === SESSION_SID;
  const hasLay = Number(sel.l) > 0;

  const item = (side) => {
    const rate = isSession ? (side === 'lay' ? sel.lbhav : sel.bbhav) : (side === 'lay' ? sel.l : sel.b);
    return (
      <div
        className={`${side} casino-bl-box-item${suspended ? ' suspended' : ''}`}
        key={side}
        onClick={suspended ? undefined : () => onBet(sel, side)}
      >
        {/* Session shows the line above the rate; the rest show only a price. */}
        {isSession && <span>{sel.b}</span>}
        <span className="casino-box-odd">{rate}</span>
      </div>
    );
  };

  return (
    <div className="vodds-box">
      <div className={`vrt17-odd-name${isSession ? ' pointer' : ''}`}>{sel.nat}</div>
      <div className="casino-bl-box">
        {isSession ? [item('lay'), item('back')] : [item('back'), hasLay ? item('lay') : null]}
      </div>
      <div className="w-100 odds-book text-center">{book}</div>
    </div>
  );
}

export default function VTrio() {
  const isAuth = useSelector((st) => st.user.isAuthenticated);
  const casinoButtons = useSelector((st) => st.stakeButtons.casinoButtons);
  const isDesktop = useIsDesktop();
  const [showRules, setShowRules] = useState(false);
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { soundOn, musicOn, toggleSound, toggleMusic, play } = useVcasinoSound();

  const mid = gameData?.mid ?? '';
  const lt = Number(gameData?.lt ?? 0);
  const ft = Number(gameData?.ft ?? 20) || 20;
  // Three cards per round, comma separated: "1,1,1" while face down.
  const cards = String(gameData?.card ?? '').split(',');
  const revealed = cards.some((c) => !isFaceDown(c));

  const bySid = useMemo(() => {
    const map = new Map();
    for (const s of gameData?.sub || []) map.set(Number(s.sid), s);
    return map;
  }, [gameData]);
  const sel = (sid) => bySid.get(sid);

  const {
    showPlaceBet, betValue, selectedItem, stakeAmount, setStakeAmount, placing,
    handleBet, handlePlaceBet, closeBetPanel,
  } = useCasinoBet({ gameType: GAME_TYPE, matchId: mid, isAuth, gameData });

  const onBet = (s, side) => {
    if (s.sid === SESSION_SID) {
      // Priced off the rate (rate/100 + 1), tagged with the line so settlement
      // can judge over/under against it — the hook's session-rate path.
      const rate = side === 'lay' ? s.lbhav : s.bbhav;
      handleBet(s.sid, side, Number(rate) / 100 + 1, { ...s, _sessionRate: true, _line: s.b });
      return;
    }
    handleBet(s.sid, side, side === 'lay' ? s.l : s.b, s);
  };

  const lastMid = useRef(null);
  useEffect(() => {
    if (!mid || mid === lastMid.current) return;
    if (lastMid.current !== null) play('cardsMix');
    lastMid.current = mid;
  }, [mid, play]);

  const flipped = useRef(null);
  useEffect(() => {
    if (!revealed || flipped.current === mid) return;
    flipped.current = mid;
    play('cardFlip');
    play('winner');
  }, [revealed, mid, play]);

  const pct = Math.max(0, Math.min(100, (lt / ft) * 100));
  // Three states, not two: the reference runs green, then amber, then red as
  // the book closes.
  const barClass = lt <= 0 ? 'bg-danger' : pct <= 30 ? 'bg-warning' : 'bg-success';

  const flipCards = Array.from({ length: CARDS_PER_ROUND }, (_, i) => {
    const card = cards[i] || FACE_DOWN;
    return (
      <div className={`flip-card${!isFaceDown(card) ? ' show' : ''}`} key={i}>
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <div className="card-item" style={{ backgroundImage: `url("${cardSrc(FACE_DOWN)}")` }} />
          </div>
          <div className="flip-card-back">
            <div className="card-item" style={{ backgroundImage: `url("${cardSrc(card)}")` }} />
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="fullwidthcasino-container">
      {/* Last class is breakpoint-dependent — `vtrio` above 1280px,
          `vtrio-mobile` below. The animation stylesheets key off exactly that
          suffix, so getting it wrong pulls the other breakpoint's rules in. */}
      <div className={`virtual-casino-container vcasino ${GAME_TYPE} hidden-landscape ${GAME_TYPE}${isDesktop ? '' : '-mobile'}`}>
        <div className="hide-landscape d-none-big">
          <div>Sorry for Inconvenience</div>
          <div>
            This Casino is not supported in Landscape Mode, Please Play in Portrait
            Mode.
          </div>
        </div>

        <div className="w-100 text-center">
          <div className="virtual-casino-bg">
            <div className="progress mobile-timer virtual" style={{ width: '100%' }}>
              <div className={`progress-bar ${barClass}`} style={{ width: `${pct}%` }} />
            </div>

            <img src={`${VC}/dealer-bg/${DEALER_BG}.png`} className="main-bg d-none-mobile" alt="" />
            <img src={`${VC}/dealer-bg-mobile/${DEALER_BG}.png`} className="main-bg d-none-desktop" alt="" />

            <div className="vcasino-title">
              <div className="vcasino-name">V-Trio</div>
              <div className="vcasino-rid">{mid}</div>
            </div>

            <div className="vcasino-icons">
              <div className={`vcasino-icon sound-${soundOn ? 'on' : 'off'}-icon`} role="button" onClick={toggleSound}>
                <img src={`${VC}/icons/sound${soundOn ? '' : '-off'}.png`} alt="Sound" />
              </div>
              <div className={`vcasino-icon music-${musicOn ? 'on' : 'off'}-icon`} role="button" onClick={toggleMusic}>
                <img src={`${VC}/icons/music${musicOn ? '' : '-off'}.png`} alt="Music" />
              </div>
              <Link to="/o_casino">
                <div className="vcasino-icon home-icon"><img src={`${VC}/icons/home.png`} alt="Home" /></div>
              </Link>
              <div className="vcasino-icon info-icon" role="button" onClick={() => setShowRules(true)}>
                <img src={`${VC}/icons/info.png`} alt="Rules" />
              </div>
            </div>

            {/* Trio has ONE result letter, not three: every last-results row
                comes back win "0" and the reference prints "R" for all of them. */}
            <div className="vcasino-last-results">
              {lastResults.slice(0, 10).map((r) => (
                <span className="vresulta" key={r.mid} onClick={() => setResultMid(r.mid)}>R</span>
              ))}
              <Link to={`/report/casinoresult/${GAME_TYPE}`} className="result-more">
                <span className="vresultall">+</span>
              </Link>
            </div>

            <div className="vcasino-my-bets">
              <span className="bets-count">0</span>
              <span className="bets-title">MY BETS</span>
            </div>

            {showRules && (
              <CasinoDesktopRules onClose={() => setShowRules(false)}>
                <TrioRules />
              </CasinoDesktopRules>
            )}

            {/* No winner-trophy and no odds-title here — Lucky 7 has both,
                Trio has neither. */}
            <div className="virtual-casino-odds">
              <VCasinoDeck dealt={TRIO_DECK} variant="trio" />

              <div className="casino-detail table-actions">
                <div className="cards-showing-block">{flipCards}</div>
                <div className="cards-block">{flipCards}</div>

                <div className="main-odds">
                  {MAIN.map((sid) => <OddsBox key={sid} sel={sel(sid)} onBet={onBet} />)}
                </div>
                <div className="other-odds">
                  {OTHER.map((sid) => <OddsBox key={sid} sel={sel(sid)} onBet={onBet} />)}
                </div>
                <div className="sub-odds">
                  {SUB.map((sid) => <OddsBox key={sid} sel={sel(sid)} onBet={onBet} />)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showPlaceBet && selectedItem && (
          <div className="virtual-casino-place-bet">
            <div className="place-bet-box-container">
              <div className="place-bet-nation">
                <div>{selectedItem.nat}</div>
                <div>
                  Min: <span>{formatMax(selectedItem.min)}</span>, Max:{' '}
                  <span>{formatMax(selectedItem.max)}</span>
                </div>
              </div>
              <div className="place-bet-value">
                <div>{betValue}</div>
                <div className="back-border">
                  <input
                    type="number"
                    id="placebetAmountMobile"
                    maxLength="9"
                    placeholder="Amount"
                    className="form-control input-stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!Number(stakeAmount) || placing}
                  onClick={handlePlaceBet}
                >
                  Submit
                </button>
                <button type="button" className="btn btn-reset" onClick={closeBetPanel}>Reset</button>
              </div>
              <div className="place-bet-buttons">
                {(casinoButtons.length ? casinoButtons.map((b) => b.value) : STAKE_FALLBACK).map((v) => (
                  <button
                    type="button"
                    className="btn btn-bet"
                    key={v}
                    onClick={() => setStakeAmount(String((Number(stakeAmount) || 0) + v))}
                  >
                    <span>+{v}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-link text-white flex-fill text-right w-auto mw-auto"
                  onClick={() => setStakeAmount('')}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CasinoRulesModal show={showRules} onClose={() => setShowRules(false)}>
        <TrioRules />
      </CasinoRulesModal>

      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={GAME_TYPE}
        gameName="V-Trio"
        mid={resultMid}
      />

      <div className="casino-banners" />
    </div>
  );
}
