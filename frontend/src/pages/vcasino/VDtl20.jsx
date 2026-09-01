import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CasinoRulesModal from '../../components/casino/CasinoRulesModal';
import CasinoDesktopRules from '../../components/casino/CasinoDesktopRules';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import DTL20Rules from '../../components/casino/rules/DTL20Rules';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoBet from '../../hooks/casino/useCasinoBet';
import useVcasinoSound from '../../hooks/casino/useVcasinoSound';
import useIsDesktop from '../../hooks/useIsDesktop';
import VCasinoDeck from '../../components/vcasino/VCasinoDeck';
import { cardSrc, FACE_DOWN, isFaceDown } from '../../utils/vcasinoCards';

const GAME_TYPE = 'vdtl20';
// The board's own slug is `vdtl`, not the route/report key `vdtl20` — the
// stylesheets key off `.vdtl` / `.vdtl-mobile`.
const BOARD_SLUG = 'vdtl';
const VC = '/assets/virtual-casino';
const CARDS = '/assets/cards';
const DEALER_BG = 13;
const DECK_SIZE = 20;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Three players, each with the identical block of markets. Verified name-by-name
// against live all-data: base+0 Winner, +1 Black, +2 Red, +3 Odd, +4 Even, then
// base+5 .. base+17 for cards A..K. The gaps between 18→21 and 38→41 are the
// feed's, not ours.
const PLAYERS = [
  { key: 'dragon', name: 'Dragon', cls: 'vplayera', base: 1 },
  { key: 'tiger', name: 'Tiger', cls: 'vplayerb', base: 21 },
  { key: 'lion', name: 'Lion', cls: 'vplayerc', base: 41 },
];
const MAIN_OFFSETS = [0, 1, 2, 3, 4];   // Winner, Black(♠♣), Red(♥♦), Odd, Even
const CARD_OFFSET = 5;

// Coin stakes, as the reference prints them.
const COINS = [
  { value: 25, label: '25' }, { value: 50, label: '50' }, { value: 100, label: '100' },
  { value: 200, label: '200' }, { value: 500, label: '500' }, { value: 1000, label: '1K' },
];

// last-results `win` is the winning sid: 1 = Dragon, 21 = Tiger, 41 = Lion, and
// the strip prints one letter per player in a fixed slot.
const RESULT_BY_WIN = { 1: { cls: 'vresulta', letter: 'D' }, 21: { cls: 'vresultb', letter: 'T' }, 41: { cls: 'vresultc', letter: 'L' } };

/** One back-only odds cell. Every D-T-L market is back-only — no lay side. */
function OddsCell({ sel, onBet, book = 0 }) {
  const suspended = !sel || sel.gstatus !== 'OPEN';
  return (
    <div className="v-odd-box">
      <div className="casino-bl-box">
        <div
          className={`casino-bl-box-item back${suspended ? ' suspended' : ''}`}
          onClick={suspended ? undefined : () => onBet(sel)}
        >
          <span className="casino-box-odd">{suspended ? 0 : sel.b}</span>
          <span className="book-odd">{book}</span>
        </div>
      </div>
    </div>
  );
}

const SuitPair = ({ a, b }) => (
  <div className="v-odd-box">
    <img src={`${CARDS}/${a}.png`} alt={a} /> <img src={`${CARDS}/${b}.png`} alt={b} />
  </div>
);

export default function VDtl20() {
  const isAuth = useSelector((st) => st.user.isAuthenticated);
  const isDesktop = useIsDesktop();
  const [showRules, setShowRules] = useState(false);
  const [resultMid, setResultMid] = useState(null);
  const [coin, setCoin] = useState(COINS[0].value);
  const [tab, setTab] = useState('home');        // desktop: home | menu1
  const [player, setPlayer] = useState('dragon'); // mobile: dragon | tiger | lion

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
    showPlaceBet, stakeAmount, setStakeAmount, handleBet, handlePlaceBet,
  } = useCasinoBet({ gameType: GAME_TYPE, matchId: mid, isAuth, gameData });

  // D T L stakes by COIN, not by a bet slip — the reference has no place-bet
  // panel at all. handlePlaceBet reads stakeAmount from state, so the stake is
  // set first and the placement fires on the next render, once the hook's
  // callback has closed over the fresh value.
  const [autoPlace, setAutoPlace] = useState(false);
  const onBet = (s) => {
    if (!s) return;
    handleBet(s.sid, 'back', s.b, s);
    setStakeAmount(String(coin));
    setAutoPlace(true);
  };
  useEffect(() => {
    if (!autoPlace || !showPlaceBet || !stakeAmount) return;
    setAutoPlace(false);
    handlePlaceBet();
  }, [autoPlace, showPlaceBet, stakeAmount, handlePlaceBet]);

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

  // The reference's base-timer arc. Solved against four captures and exact on
  // all of them: t=20→283, t=15→209, t=9→120, t=1→1.
  const rawFraction = ft > 0 ? lt / ft : 0;
  const dash = Math.round(Math.max(0, rawFraction - (1 / ft) * (1 - rawFraction)) * 283);
  // Green while the book is open; red from 7 seconds down, where the copy also
  // changes to "Time Up" / "No More Bets".
  const timerColour = lt <= 7 ? 'red' : 'green';
  // Two spans for a two-digit count, one for a single digit — exactly how the
  // reference splits it.
  const digits = lt >= 10 ? [String(lt)[0], String(lt)[1]] : [String(lt)];

  const flipCards = Array.from({ length: 3 }, (_, i) => {
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

  /** The five main markets for one player, in board order. */
  const mainCells = (p) => MAIN_OFFSETS.map((o) => (
    <OddsCell key={o} sel={sel(p.base + o)} onBet={onBet} />
  ));
  /** All thirteen card markets for one player, A..K. */
  const cardCells = (p, from = 0, to = 13) => RANKS.slice(from, to).map((_, i) => (
    <OddsCell key={from + i} sel={sel(p.base + CARD_OFFSET + from + i)} onBet={onBet} />
  ));
  const rankLabels = (from, to) => RANKS.slice(from, to).map((r) => (
    <div className="v-odd-box" key={r}><b>{r}</b></div>
  ));

  return (
    <div className="fullwidthcasino-container">
      {/* `nvcasino` marks the newer virtual-casino shell (circular timer, coin
          staking). Last class is breakpoint-dependent — see useIsDesktop. */}
      <div className={`virtual-casino-container vcasino nvcasino ${BOARD_SLUG} hidden-landscape ${BOARD_SLUG}${isDesktop ? '' : '-mobile'}`}>
        <div className="hide-landscape d-none-big">
          <div>Sorry for Inconvenience</div>
          <div>
            This Casino is not supported in Landscape Mode, Please Play in Portrait
            Mode.
          </div>
        </div>

        {/* Unlike Lucky 7 and Trio, the icons / results / my-bets sit OUTSIDE
            `.virtual-casino-bg`, and this wrapper carries an explicit z-index. */}
        <div className="w-100 text-center" style={{ zIndex: 10 }}>
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

          {/* Title BEFORE count here — Lucky 7 and Trio print it the other way. */}
          <div className="vcasino-my-bets">
            <span className="bets-title">My Bets</span>
            <span className="bets-count">0</span>
          </div>

          <div className="virtual-casino-bg">
            <img src={`${VC}/dealer-bg/${DEALER_BG}.png`} className="main-bg d-none-mobile" alt="" />
            <img src={`${VC}/dealer-bg-mobile/${DEALER_BG}.png`} className="main-bg d-none-desktop" alt="" />

            {/* The whole timer unmounts once the clock hits zero and the deal
                begins — the reference renders an empty placeholder there. */}
            {lt > 0 && (
              <div className="casino-timer nvtimer">
                <span className={`warning-text ${timerColour}`}>
                  {timerColour === 'red' ? 'Time Up' : 'Sec. to Bets'}
                </span>
                <div className="base-timer">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="base-timer__svg">
                    <g className="base-timer__circle">
                      <circle cx="50" cy="50" r="45" className={`base-timer__path-elapsed ${timerColour}`} />
                      <path
                        strokeDasharray={`${dash} 283`}
                        d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
        "
                        className={`base-timer__path-remaining ${timerColour}`}
                      />
                    </g>
                  </svg>
                  <span className={`base-timer__label ${timerColour}`}>
                    {digits.map((d, i) => <span key={i}>{d}</span>)}
                  </span>
                </div>
                <span className="bet-msg">
                  {timerColour === 'red' ? 'No More Bets' : 'Place Your Bets, Please'}
                </span>
              </div>
            )}

            <div className="vcasino-title">
              <div className="vcasino-name">V-20-20 D T L</div>
              <div className="vcasino-rid">{mid}</div>
            </div>

            <div className="virtual-casino-odds">
              <div className="vdtl-trophy"><div /><div /><div /></div>
              <div className="vdtl-title">
                {PLAYERS.map((p) => <div className={p.cls} key={p.key}>{p.name}</div>)}
              </div>

              <VCasinoDeck dealt={DECK_SIZE} variant="dtl" />

              <div className="casino-detail table-actions">
                <div className="cards-showing-block">{flipCards}</div>
                <div className="cards-block">{flipCards}</div>
              </div>
            </div>

            {/* The pill strip is the LAST child of .virtual-casino-bg, not a
                sibling of it — outside the board it falls below the odds
                table instead of sitting on the felt. */}
            <ul className="nav nav-pills d-none-mobile">
              <li className="nav-item">
                <a className={`nav-link${tab === 'home' ? ' active' : ''}`} onClick={() => setTab('home')}>Main Odds</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link${tab === 'menu1' ? ' active' : ''}`} onClick={() => setTab('menu1')}>Cards Odds</a>
              </li>
            </ul>
          </div>

          {/* Desktop board: one grid, all three players as rows. */}
          <div className="main-odds d-none-mobile">
            <div className="tab-content">
              <div id="home" className={`tab-pane${tab === 'home' ? ' active' : ' fade'}`}>
                <div className="main-odds-left">
                  <div className="v-odd-row">
                    <div className="v-odd-box"><b>&nbsp;</b></div>
                    <div className="v-odd-box"><b>Winner</b></div>
                    <SuitPair a="spade" b="club" />
                    <SuitPair a="heart" b="diamond" />
                    <div className="v-odd-box"><b>Odd</b></div>
                    <div className="v-odd-box"><b>Even</b></div>
                  </div>
                  {PLAYERS.map((p) => (
                    <div className="v-odd-row" key={p.key}>
                      <div className="v-odd-box"><b>{p.name}</b></div>
                      {mainCells(p)}
                    </div>
                  ))}
                </div>
              </div>
              <div id="menu1" className={`tab-pane${tab === 'menu1' ? ' active' : ' fade'}`}>
                <div className="main-odds-right">
                  <div className="v-odd-row">
                    <div className="v-odd-box"><b>&nbsp;</b></div>
                    {rankLabels(0, 13)}
                  </div>
                  {PLAYERS.map((p) => (
                    <div className="v-odd-row" key={p.key}>
                      <div className="v-odd-box"><b>{p.name}</b></div>
                      {cardCells(p)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile board: one player per tab, cards wrapped 5 / 5 / 3. */}
          <div className="main-odds d-none-desktop">
            <ul className="nav nav-pills">
              {PLAYERS.map((p) => (
                <li className="nav-item" key={p.key}>
                  <a className={`nav-link${player === p.key ? ' active' : ''}`} onClick={() => setPlayer(p.key)}>
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="virtual-coin-icon d-none-desktop">
              <div className="v-coin selected-coin">
                <span>Setting Coins</span>
                <img src={`${VC}/coins/setting-coin.png`} alt="Coins" />
              </div>
            </div>
            <div className="tab-content">
              {PLAYERS.map((p) => (
                <div id={p.key} className={`tab-pane${player === p.key ? ' active' : ' fade'}`} key={p.key}>
                  <div className="main-odds-left">
                    <div className="w-100">Main Odds</div>
                    <div className="v-odd-row">
                      <div className="v-odd-box"><b>Winner</b></div>
                      <SuitPair a="spade" b="club" />
                      <SuitPair a="heart" b="diamond" />
                      <div className="v-odd-box"><b>Odd</b></div>
                      <div className="v-odd-box"><b>Even</b></div>
                    </div>
                    <div className="v-odd-row">{mainCells(p)}</div>
                  </div>
                  <div className="main-odds-right">
                    <div className="w-100">Cards Odds</div>
                    {/* The reference's Lion tab labels this last group "J Q A";
                        the market behind that third box is Lion K (sid 58), so
                        the label is an upstream typo and K is printed here. */}
                    {/* Label row and cell row must BOTH be direct children of
                        .main-odds-right — wrapping each pair in a div makes them
                        grandchildren and the rows collapse into one long strip. */}
                    {[[0, 5], [5, 10], [10, 13]].map(([from, to]) => (
                      <Fragment key={from}>
                        <div className="v-odd-row">{rankLabels(from, to)}</div>
                        <div className="v-odd-row">{cardCells(p, from, to)}</div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="virtual-coins d-none-mobile">
            {COINS.map((c) => (
              <div
                className={`v-coin${coin === c.value ? ' selected-coin' : ''}`}
                key={c.value}
                onClick={() => setCoin(c.value)}
              >
                <img src={`${VC}/coins/3d/${COINS.indexOf(c) + 1}.png`} alt={c.label} />
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CasinoRulesModal show={showRules} onClose={() => setShowRules(false)}>
        <DTL20Rules />
      </CasinoRulesModal>
      {showRules && (
        <CasinoDesktopRules onClose={() => setShowRules(false)}>
          <DTL20Rules />
        </CasinoDesktopRules>
      )}

      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={GAME_TYPE}
        gameName="V-20-20 D T L"
        mid={resultMid}
      />

      <div className="casino-banners" />
    </div>
  );
}
