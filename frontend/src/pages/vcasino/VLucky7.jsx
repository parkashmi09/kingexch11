import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CasinoRulesModal from '../../components/casino/CasinoRulesModal';
import Lucky7Rules from '../../components/casino/rules/Lucky7Rules';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import CasinoDesktopRules from '../../components/casino/CasinoDesktopRules';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useVcasinoSound from '../../hooks/casino/useVcasinoSound';
import useIsDesktop from '../../hooks/useIsDesktop';
import useCasinoBet from '../../hooks/casino/useCasinoBet';
import VCasinoDeck, { SHOE_SIZE } from '../../components/vcasino/VCasinoDeck';
import { cardSrc, FACE_DOWN, isFaceDown, lucky7Side } from '../../utils/vcasinoCards';
import { formatMax } from '../../utils/oddsHelpers';

const GAME_TYPE = 'vlucky7';
const CARDS = '/assets/cards';
const VC = '/assets/virtual-casino';

// Selections are addressed by SID, never by their position in the board. The
// board's suit pair reads spade+club first, but that is Black — sid 6 — while
// Red is sid 5, so laying the grid out in feed order would quietly bet the
// opposite suit. Every box below therefore names its sid explicitly, taken from
// live all-data rather than from the reference markup.
const SID = {
  LOW: 1, HIGH: 2, EVEN: 3, ODD: 4, RED: 5, BLACK: 6,
  LINE1: 20, LINE2: 21, LINE3: 22, LINE4: 23,
};
// Card 1 is the ACE — the feed names them "Card 1".."Card K" on sids 7..19 and
// the board shows A,2..10,J,Q,K in that same order.
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const CARD_SID_BASE = 7;
// Shown only until the platform ladder loads; the reference's own strip.
const STAKE_FALLBACK = [25, 50, 100, 200, 500, 1000];

const SUIT_IMGS = {
  [SID.BLACK]: ['spade', 'club'],
  [SID.RED]: ['heart', 'diamond'],
};
const LINE_IMGS = {
  [SID.LINE1]: ['A', '2', '3'],
  [SID.LINE2]: ['4', '5', '6'],
  [SID.LINE3]: ['8', '9', '10'],
  [SID.LINE4]: ['J', 'Q', 'K'],
};

/** One box in .other-odds — a name (text or images) plus odds and book. */
function BackBox({ sel, children, onBet }) {
  const suspended = !sel || sel.gstatus !== 'OPEN';
  return (
    <div
      className={`even-box back-box lock-top${suspended ? ' suspended' : ''}`}
      onClick={suspended ? undefined : () => onBet(sel)}
    >
      <div>
        <div className="dt-name">{children}</div>
        <div className="dt-odds">{sel?.b ?? 0}</div>
      </div>
      <div className="dt-book w-100">0</div>
    </div>
  );
}

export default function VLucky7() {
  const isAuth = useSelector((st) => st.user.isAuthenticated);
  const isDesktop = useIsDesktop();
  // The casino ladder, not the sports one — same split every /casino/* table
  // uses (the payload carries both halves).
  const casinoButtons = useSelector((st) => st.stakeButtons.casinoButtons);
  const [showRules, setShowRules] = useState(false);
  // Which past round's result is open. The strip's letters are the trigger.
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { soundOn, musicOn, toggleSound, toggleMusic, play } = useVcasinoSound();

  const mid = gameData?.mid ?? '';
  const lt = Number(gameData?.lt ?? 0);
  const ft = Number(gameData?.ft ?? 20) || 20;
  const card = gameData?.card ?? FACE_DOWN;
  const revealed = !isFaceDown(card);
  const side = lucky7Side(card);

  // The side class STICKS between rounds. A reference capture taken mid-betting
  // — face-down card, live odds, nothing suspended — still reads
  // `flip-card low`: only `show` is dropped and the back image resets to the
  // card back, while the previous round's side stays on the element. Clearing
  // it with the card would leave a bare `flip-card` the CSS never styles.
  const [shownSide, setShownSide] = useState(null);
  useEffect(() => {
    if (side) setShownSide(side);
  }, [side]);

  // sid -> selection, so the board can address the feed directly.
  const bySid = useMemo(() => {
    const map = new Map();
    for (const s of gameData?.sub || []) map.set(Number(s.sid), s);
    return map;
  }, [gameData]);
  const sel = (sid) => bySid.get(sid);

  // Bets go through the SAME hook every /casino/* table uses. It already
  // enforces this selection's own min/max, re-checks gstatus and the round
  // clock across the placement buffer, and handles demo mode — none of which
  // should be reimplemented here.
  //
  // The item handed over is the RAW feed row, so sid / nat / etype / min / max
  // reach the payload untouched. vlucky7 is all etype "Fancy", which the hook
  // maps to mtype 'fancy' — each selection its own market, no spread.
  const {
    showPlaceBet, betValue, selectedItem, stakeAmount, setStakeAmount, placing,
    handleBet, handlePlaceBet, closeBetPanel,
  } = useCasinoBet({ gameType: GAME_TYPE, matchId: mid, isAuth, gameData });

  const onBet = (s) => handleBet(s.sid, 'back', s.b, s);


  // The shoe. The feed carries no shoe position — rdesc's first field is a
  // rolling round counter, not a card index — so the stack is tracked here:
  // one card leaves the left deck each time the round id changes, and the shoe
  // resets after SHOE_SIZE rounds. It mirrors the reference's behaviour rather
  // than its exact server state; the two can drift after a long session.
  // Opening position. The feed carries no shoe index, so where the shoe sits on
  // arrival is ours to pick — and 1 was the worst pick available: it put the
  // board at the very edge of the cycle on EVERY page load, left deck at its
  // tallest and the right box empty, which the reference practically never
  // shows. Captures put it anywhere from 1 to 47; this is a mid-shoe start
  // taken from one of them. A wrap still resets to 1, which is the real cycle.
  const SHOE_START = 23;
  const [dealt, setDealt] = useState(SHOE_START);
  // `finish-deck` is the SHOE-EXHAUSTED state, not the card-revealed one. Two
  // reference captures prove it: both sat at a one-card right stack with the
  // card revealed and everything suspended, but one carried `finish-deck` on
  // both decks with the left deck EMPTY, while the other had 49 cards on the
  // left and no such class. Tying it to the reveal fired it every single round.
  const [shoeWrapped, setShoeWrapped] = useState(false);
  const lastMid = useRef(null);
  useEffect(() => {
    if (!mid || mid === lastMid.current) return;
    if (lastMid.current !== null) {
      setDealt((n) => {
        const wrapped = n >= SHOE_SIZE;
        setShoeWrapped(wrapped);
        return wrapped ? 1 : n + 1;
      });
      play('cardsMix');
    }
    lastMid.current = mid;
  }, [mid, play]);

  // Flip + winner stings fire once per reveal, not on every 1s poll.
  const flipped = useRef(null);
  useEffect(() => {
    if (!revealed || flipped.current === mid) return;
    flipped.current = mid;
    play('cardFlip');
    play('winner');
  }, [revealed, mid, play]);

  const pct = Math.max(0, Math.min(100, (lt / ft) * 100));

  const flipCard = (
    <div className={`flip-card${revealed ? ' show' : ''}${shownSide ? ` ${shownSide}` : ''}`}>
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

  return (
    <div className="fullwidthcasino-container">
      {/* Last class is breakpoint-dependent — `vlucky7` above 1280px,
          `vlucky7-mobile` below. animation.css and animation-mobile.css key off
          exactly that suffix with different offsets, so a hardcoded `-mobile`
          made the desktop board run the mobile animation rules. */}
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
            {/* Countdown. Green while the book is open, red the moment the feed
                suspends every selection at lt 0. */}
            <div className="progress mobile-timer virtual" style={{ width: '100%' }}>
              <div
                className={`progress-bar ${lt > 0 ? 'bg-success' : 'bg-danger'}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Dealer backdrop — 5 is Lucky 7's. Both ship; CSS picks one. */}
            <img src={`${VC}/dealer-bg/5.png`} className="main-bg d-none-mobile" alt="" />
            <img src={`${VC}/dealer-bg-mobile/5.png`} className="main-bg d-none-desktop" alt="" />

            <div className="vcasino-title">
              <div className="vcasino-name">V-Lucky 7 - A</div>
              <div className="vcasino-rid">{mid}</div>
            </div>

            {/* Muting swaps the ART as well as the class — the reference serves
                sound-off.png / music-off.png, it does not restyle the on icon.
                Using one image for both states leaves a muted table showing the
                unmuted symbol. */}
            <div className="vcasino-icons">
              <div
                className={`vcasino-icon sound-${soundOn ? 'on' : 'off'}-icon`}
                role="button"
                onClick={toggleSound}
              >
                <img src={`${VC}/icons/sound${soundOn ? '' : '-off'}.png`} alt="Sound" />
              </div>
              <div
                className={`vcasino-icon music-${musicOn ? 'on' : 'off'}-icon`}
                role="button"
                onClick={toggleMusic}
              >
                <img src={`${VC}/icons/music${musicOn ? '' : '-off'}.png`} alt="Music" />
              </div>
              {/* Reference links /owncasino; our casino list lives at /o_casino. */}
              <Link to="/o_casino">
                <div className="vcasino-icon home-icon">
                  <img src={`${VC}/icons/home.png`} alt="Home" />
                </div>
              </Link>
              <div className="vcasino-icon info-icon" role="button" onClick={() => setShowRules(true)}>
                <img src={`${VC}/icons/info.png`} alt="Rules" />
              </div>
            </div>

            {/* win 1 = Low, win 2 = High, anything else = the TIE state (the 7
                card, which wins neither side). The reference renders each span
                as one of THREE conditional letters — its markup shows the
                chosen one plus two empty slots — and styles the third through
                the shared `.vcasino-last-results span.vresulttie` rule.
                Unknown codes fall to tie rather than to High, so a value we
                have not seen can never be reported as a High win. (A tie comes
                through as win "0".)
                NEWEST GOES LEFT — the feed's order, printed as-is. Verified by
                aligning a reference strip against the live feed: the rare tie
                pinned the offset at exactly one round, and all nine remaining
                letters matched (a reversed reading scored 3/10, i.e. chance). */}
            <div className="vcasino-last-results">
              {lastResults.slice(0, 10).map((r) => {
                const win = String(r.win);
                const open = () => setResultMid(r.mid);
                if (win === '1') return <span className="vresulta" key={r.mid} onClick={open}>L</span>;
                if (win === '2') return <span className="vresultb" key={r.mid} onClick={open}>H</span>;
                return <span className="vresulttie" key={r.mid} onClick={open}>T</span>;
              })}
              <Link to={`/report/casinoresult/${GAME_TYPE}`} className="result-more">
                <span className="vresultall">+</span>
              </Link>
            </div>

            <div className="vcasino-my-bets">
              <span className="bets-count">0</span>
              <span className="bets-title">MY BETS</span>
            </div>

            {/* Inside .virtual-casino-bg, right after MY BETS — the panel is
                absolutely positioned and .virtual-casino-bg is the relative
                ancestor it anchors to, so hanging it off the page root instead
                put it at the wrong size in the wrong place. */}
            {showRules && (
              <CasinoDesktopRules onClose={() => setShowRules(false)}>
                <Lucky7Rules />
              </CasinoDesktopRules>
            )}

            <div className="winner-trophy">
              {revealed && side && side !== 'tie' && (
                <img
                  src="/assets/svg_casino/icons/winner-lucky7.png"
                  className={side === 'low' ? 'winnera' : 'winnerb'}
                  alt=""
                />
              )}
            </div>

            <div className="virtual-casino-odds">
              <VCasinoDeck dealt={dealt} finished={shoeWrapped} />

              <div className="casino-detail table-actions">
                <div className="odds-title">
                  <div className="playera">A TO 6</div>
                  <div className="tie">TIE</div>
                  <div className="playerb">8 TO K</div>
                </div>

                {/* The same card twice — the CSS shows one per breakpoint. */}
                <div className="cards-showing-block">{flipCard}</div>
                <div className="cards-block">{flipCard}</div>

                <div className="main-odds">
                  {[
                    { sid: SID.LOW, cls: 'low-box', label: 'Low Card' },
                    { sid: SID.HIGH, cls: 'high-box', label: 'High Card' },
                  ].map(({ sid, cls, label }) => {
                    const s = sel(sid);
                    const suspended = !s || s.gstatus !== 'OPEN';
                    return (
                      <div
                        key={sid}
                        className={`${cls} lh-box lock-top${suspended ? ' suspended' : ''}`}
                        onClick={suspended ? undefined : () => onBet(s)}
                      >
                        <div>
                          <div className="dt-name">{label}</div>
                          <div className="dt-odds">{s?.b ?? 0}</div>
                        </div>
                        <div className="dt-book w-100">0</div>
                      </div>
                    );
                  })}
                </div>

                <div className="other-odds">
                  <BackBox sel={sel(SID.EVEN)} onBet={onBet}>Even</BackBox>
                  <BackBox sel={sel(SID.ODD)} onBet={onBet}>Odd</BackBox>

                  {/* Board order is Black then Red — sid 6 before sid 5. */}
                  {[SID.BLACK, SID.RED].map((sid) => (
                    <BackBox key={sid} sel={sel(sid)} onBet={onBet}>
                      {SUIT_IMGS[sid].map((s) => (
                        <img key={s} src={`${CARDS}/${s}.png`} alt={s} />
                      ))}
                    </BackBox>
                  ))}

                  {[SID.LINE1, SID.LINE2, SID.LINE3, SID.LINE4].map((sid) => (
                    <BackBox key={sid} sel={sel(sid)} onBet={onBet}>
                      {LINE_IMGS[sid].map((r) => (
                        <img key={r} src={`${CARDS}/single/${r}.jpg`} alt={r} />
                      ))}
                    </BackBox>
                  ))}

                  <div className="vcasino-card-box-container">
                    {/* All thirteen share one price, so the reference prints it
                        once above the row rather than per box. */}
                    <div className="vcasino-card-odds">{sel(CARD_SID_BASE)?.b ?? 0}</div>
                    <div className="vcasino-card-box-top">
                      {RANKS.map((rank, i) => {
                        const s = sel(CARD_SID_BASE + i);
                        const suspended = !s || s.gstatus !== 'OPEN';
                        return (
                          <div
                            className="vcasino-card-box"
                            key={rank}
                            onClick={suspended ? undefined : () => onBet(s)}
                          >
                            <div className={`d-inline-block${suspended ? ' suspended' : ''}`}>
                              <img src={`${CARDS}/${rank}.png`} alt={rank} />
                            </div>
                            <div>0</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bet slip — third child of .virtual-casino-container, after
            .w-100, exactly where the reference puts it. Its own markup, not
            the /casino/* CasinoPlaceBetModal: this family has no modal, the
            slip sits inline under the board. */}
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
                  {/* Digits only, capped at 9 — the reference blocks every
                      other key rather than validating after the fact. */}
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
                {/* Submit stays disabled until there is a stake, so a stray
                    tap can never place a zero bet. */}
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!Number(stakeAmount) || placing}
                  onClick={handlePlaceBet}
                >
                  Submit
                </button>
                <button type="button" className="btn btn-reset" onClick={closeBetPanel}>
                  Reset
                </button>
              </div>
              <div className="place-bet-buttons">
                {/* Chips ADD to the stake (the reference labels them "+25"),
                    they do not replace it. */}
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

      {/* Rules render differently per breakpoint, and the reference ships both:
          a bootstrap modal on phones, an inline panel above the breakpoint.
          Each is hidden on the other's screens by CSS, so both can mount.
          Lucky 7's text is shared with /casino/lucky7 — one copy, not two. */}
      <CasinoRulesModal show={showRules} onClose={() => setShowRules(false)}>
        <Lucky7Rules />
      </CasinoRulesModal>

      {/* The /casino/* result modal, unchanged — it already renders the
          reference's casino-result / modal-xl / casino-result-round shell and
          delegates the body to ResultContentSwitch, where vlucky7 now maps to
          the existing Lucky7Result (same rdesc shape). */}
      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={GAME_TYPE}
        gameName="V-Lucky 7 - A"
        mid={resultMid}
      />

      {/* Sibling of .virtual-casino-container, not a child of it — the table is
          a fixed-height board (`height: calc(100vh - 2px)` on mobile) and the
          banners belong below it, outside that box. */}
      <div className="casino-banners" />
    </div>
  );
}
