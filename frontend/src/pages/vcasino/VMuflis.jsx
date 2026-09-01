import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CasinoRulesModal from '../../components/casino/CasinoRulesModal';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import MuflisRules from '../../components/casino/rules/MuflisRules';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoBet from '../../hooks/casino/useCasinoBet';
import useVcasinoSound from '../../hooks/casino/useVcasinoSound';
import useIsDesktop from '../../hooks/useIsDesktop';
import VCasinoDeck from '../../components/vcasino/VCasinoDeck';
import { cardSrc, FACE_DOWN, isFaceDown } from '../../utils/vcasinoCards';
import { formatMax } from '../../utils/oddsHelpers';

const GAME_TYPE = 'vteenmuf';
// Two different slugs on the same element: the board is `vmuflis`, but the
// breakpoint class is `vteen` / `vteen-mobile` — it shares Teenpatti's layout
// rules. No other board splits these.
const BOARD_SLUG = 'vmuflis';
const BREAKPOINT_SLUG = 'vteen';
const VC = '/assets/virtual-casino';
const DEALER_BG = 8;
const DECK_SIZE = 20;
const CARDS_PER_ROUND = 6;   // three each for A and B
const STAKE_FALLBACK = [25, 50, 100, 200, 500, 1000];

// Three market pairs, each rendered as [A box, label, B box]. Sids verified
// name-by-name against live all-data.
const SECTIONS = [
  { label: 'Winner', a: 1, b: 2 },
  // Top 9 pays off the rules table (Card 9 -> 1 to 3, and so on), so a single
  // price says nothing. The reference prints the SIDE LETTER in the box
  // instead of the odds, and the feed's `b` is what the bet is placed at.
  { label: 'TOP 9', a: 3, b: 4, letters: true },
  { label: 'M Baccarat', a: 5, b: 6 },
];

// last-results `win`: 1 = Player A, 2 = Player B. The strip prints one letter
// per side in a fixed slot, so the class picks the slot.
const RESULT_BY_WIN = { 1: { cls: 'vresulta', letter: 'A' }, 2: { cls: 'vresultb', letter: 'B' } };

// Payout table the board shows twice: a button on mobile, the table itself on
// desktop.
const TOP9_RULES = [
  ['Card 9', '1 to 3'], ['Card 8', '1 to 4'], ['Card 7', '1 to 5'],
  ['Card 6', '1 to 8'], ['Card 5', '1 to 30'],
];

/**
 * One odds cell. Note the class order — `back casino-bl-box-item`, the reverse
 * of D T L's — and the book span carries no class here.
 */
function OddsBox({ sel, onBet, letter, book = 0 }) {
  const suspended = !sel || sel.gstatus !== 'OPEN';
  return (
    <div className="vodds-box">
      <div className="casino-bl-box">
        <div
          className={`back casino-bl-box-item${suspended ? ' suspended' : ''}`}
          onClick={suspended ? undefined : () => onBet(sel)}
        >
          <span className="casino-box-odd">{letter ?? (suspended ? 0 : sel.b)}</span>
          <span>{book}</span>
        </div>
      </div>
    </div>
  );
}

const Top9Table = () => (
  <table className="table">
    <thead><tr><th colSpan="2">Top 9 Rules</th></tr></thead>
    <tbody>
      {TOP9_RULES.map(([card, pays]) => (
        <tr key={card}><td>{card}</td><td>{pays}</td></tr>
      ))}
    </tbody>
  </table>
);

export default function VMuflis() {
  const isAuth = useSelector((st) => st.user.isAuthenticated);
  const casinoButtons = useSelector((st) => st.stakeButtons.casinoButtons);
  const isDesktop = useIsDesktop();
  const [showRules, setShowRules] = useState(false);
  const [showTop9, setShowTop9] = useState(false);
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { soundOn, musicOn, toggleSound, toggleMusic, play } = useVcasinoSound();

  const mid = gameData?.mid ?? '';
  const lt = Number(gameData?.lt ?? 0);
  const ft = Number(gameData?.ft ?? 20) || 20;
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

  // Every market here is back-only — the feed quotes no lay on any of the six.
  const onBet = (s) => s && handleBet(s.sid, 'back', s.b, s);

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
  const barClass = lt <= 0 ? 'bg-danger' : 'bg-success';

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
      <div className={`virtual-casino-container vcasino ${BOARD_SLUG} hidden-landscape ${BREAKPOINT_SLUG}${isDesktop ? '' : '-mobile'}`}>
        <div className="hide-landscape d-none-big">
          <div>Sorry for Inconvenience</div>
          <div>
            This Casino is not supported in Landscape Mode, Please Play in Portrait
            Mode.
          </div>
        </div>

        {/* Unlike the nvcasino boards, everything lives inside
            .virtual-casino-bg here — .w-100 has no other child. */}
        <div className="w-100 text-center">
          <div className="virtual-casino-bg">
            <div className="progress mobile-timer virtual">
              <div className={`progress-bar ${barClass}`} style={{ width: `${pct}%` }} />
            </div>

            <img src={`${VC}/dealer-bg/${DEALER_BG}.png`} className="main-bg d-none-mobile" alt="" />
            <img src={`${VC}/dealer-bg-mobile/${DEALER_BG}.png`} className="main-bg d-none-desktop" alt="" />

            {/* Title comes BEFORE the icons here; Lucky 7 has it the other way. */}
            <div className="vcasino-title">
              <div className="vcasino-name">V-Muflis Teenpatti</div>
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

            <div className="vcasino-last-results">
              {lastResults.slice(0, 10).map((r) => {
                const res = RESULT_BY_WIN[Number(r.win)];
                return (
                  <span className={res?.cls || 'vresulta'} key={r.mid} onClick={() => setResultMid(r.mid)}>
                    {res?.letter || ''}
                  </span>
                );
              })}
              <Link to={`/report/casinoresult/${GAME_TYPE}`} className="result-more">
                <span className="vresultall">+</span>
              </Link>
            </div>

            <div className="vcasino-my-bets">
              <span className="bets-count">0</span>
              <span className="bets-title">MY BETS</span>
            </div>

            {/* One slot per player; the winner's trophy fills its own. */}
            <div className="winner-trophy" />

            <div className="virtual-casino-odds">
              <VCasinoDeck dealt={DECK_SIZE} variant="muflis" />

              <div className="casino-detail table-actions">
                <div className="odds-title">
                  <div className="playera">PLAYER A</div>
                  <div>&nbsp;</div>
                  <div className="playerb">PLAYER B</div>
                </div>

                <div className="cards-showing-block">{flipCards}</div>
                <div className="cards-block">{flipCards}</div>

                <div className="main-odds">
                  {SECTIONS.map((s) => (
                    <div className="odds-section" key={s.label}>
                      <OddsBox sel={sel(s.a)} onBet={onBet} letter={s.letters ? 'A' : undefined} />
                      <div className="vodds-box"><b>{s.label}</b></div>
                      <OddsBox sel={sel(s.b)} onBet={onBet} letter={s.letters ? 'B' : undefined} />
                    </div>
                  ))}
                </div>

                {/* Mobile: a button that opens the same table the desktop
                    panel below shows inline. */}
                <div className="teen20rules d-none-desktop">
                  <div role="button" tabIndex={0} onClick={() => setShowTop9(true)}>Top 9 Rules</div>
                </div>
              </div>

              <div className="teen20rules d-none-mobile">
                <Top9Table />
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
        <MuflisRules />
      </CasinoRulesModal>

      <CasinoRulesModal show={showTop9} onClose={() => setShowTop9(false)}>
        <div className="teen20rules"><Top9Table /></div>
      </CasinoRulesModal>

      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={GAME_TYPE}
        gameName="V-Muflis Teenpatti"
        mid={resultMid}
      />

      <div className="casino-banners" />
    </div>
  );
}
