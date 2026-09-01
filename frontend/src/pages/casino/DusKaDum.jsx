import { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DesktopTimer, MobileDigitTimer, MobileTimer } from '../../components/casino/CasinoTimer';
import BetTableDum10 from '../../components/casino/BetTableDum10';
import CasinoPlaceBetModal from '../../components/casino/CasinoPlaceBetModal';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import CasinoRightSidebar from '../../components/casino/CasinoRightSidebar';
import CasinoRulesModal from '../../components/casino/CasinoRulesModal';
import CasinoRulesSwitch from '../../components/casino/rules/CasinoRulesSwitch';
import Footer from '../../components/layout/Footer';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoMyBets from '../../hooks/casino/useCasinoMyBets';
import useCasinoStream from '../../hooks/casino/useCasinoStream';
import useCasinoBet from '../../hooks/casino/useCasinoBet';
import { getGameConfig } from '../../config/casinoGames';
import { cardSrc, parseCards } from '../../components/casino/cards/cardUtils';

const GAME_TYPE = 'dum10';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/dum10';
const INACTIVITY_TIMEOUT = 30 * 1000;

function useInactivity(timeout = INACTIVITY_TIMEOUT) {
  const [inactive, setInactive] = useState(false);
  const timerRef = useRef(null);
  const hiddenAtRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setInactive(false);
    hiddenAtRef.current = null;
    timerRef.current = setTimeout(() => setInactive(true), timeout);
  }, [timeout]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setInactive(true), timeout);
      } else {
        const hiddenFor = hiddenAtRef.current ? Date.now() - hiddenAtRef.current : 0;
        if (hiddenAtRef.current && hiddenFor >= timeout) setInactive(true);
        hiddenAtRef.current = null;
      }
    };
    const handleActivity = () => { if (!inactive) resetTimer(); };
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibility);
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [resetTimer, timeout, inactive]);

  const reconnect = useCallback(() => {
    setInactive(false);
    hiddenAtRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setInactive(true), timeout);
  }, [timeout]);

  return [inactive, reconnect];
}

export default function DusKaDum() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [inactive, reconnect] = useInactivity();

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt = gameData?.lt ?? 0;
  const ft = gameData?.ft ?? 20;
  const card = gameData?.card ?? '1';
  const csum = gameData?.csum ?? 0;
  const lcard = gameData?.lcard ?? '';

  const dealtCards = parseCards(lcard);
  const cardCount = dealtCards.length;

  // Card carousel — measure container to compute slide width dynamically
  const ITEMS_TO_SHOW = 3;
  const hooperRef = useRef(null);
  const [slideW, setSlideW] = useState(0);
  const [carouselOffset, setCarouselOffset] = useState(0);

  useEffect(() => {
    if (!hooperRef.current) return;
    const measure = () => {
      const w = hooperRef.current?.offsetWidth || 0;
      setSlideW(w > 0 ? w / ITEMS_TO_SHOW : 0);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const maxCarouselOffset = Math.max(0, (cardCount - ITEMS_TO_SHOW) * slideW);

  // LEFT button: cards slide RIGHT → show older from left
  const scrollLeft = useCallback(() => {
    setCarouselOffset((prev) => Math.max(0, prev - slideW * ITEMS_TO_SHOW));
  }, [slideW]);

  // RIGHT button: cards slide LEFT → show newer from right
  const scrollRight = useCallback(() => {
    setCarouselOffset((prev) => Math.min(maxCarouselOffset, prev + slideW * ITEMS_TO_SHOW));
  }, [maxCarouselOffset, slideW]);

  // Start at newest cards, reset when new round or cards change
  useEffect(() => {
    setCarouselOffset(maxCarouselOffset);
  }, [maxCarouselOffset]);

  // Main market nat for the dkd-total overlay
  const sub = gameData?.sub || [];
  const mainNat = sub.find((s) => s.subtype === 'dum10')?.nat || 'Next Total 100 or More';

  const { myBets, exposures, refetch: refetchBets } = useCasinoMyBets(mid, isAuth);

  const {
    showPlaceBet, betValue, betType, selectedItem,
    stakeAmount, setStakeAmount, placing,
    handleBet, handlePlaceBet, closeBetPanel,
  } = useCasinoBet({
    gameType: GAME_TYPE,
    matchId: mid,
    isAuth,
    onSuccess: refetchBets,
    gameData,
  });

  const handleResultClick = useCallback((r) => {
    setResultMid(r.mid || null);
  }, []);

  const renderResult = useCallback((r, i) => {
    if (r.win === '1') {
      return (
        <span key={i} className="resulta" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
          Y
        </span>
      );
    }
    return (
      <span key={i} className="resultb" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
        N
      </span>
    );
  }, [handleResultClick]);

  return (
    <>
      <div className="casino-center">
        <div className="casino-container">

          {/* Mobile progress timer */}
          <MobileTimer timeLeft={lt} fullTime={ft} />

          <div className={`casino-table ${GAME_CONFIG.tableClass}`}>

            {/* ── Video Section (inline — custom title with dkd-total) ── */}
            <div className="casino-video">
              {inactive && (
                <div className="disconnected-box">
                  <div className="disconnected-message">
                    <div className="text-center">
                      <i className="fas fa-exclamation-triangle mr-1"></i>{' '}
                      <b>Disconnection due to inactivity</b>
                    </div>
                    <div className="mt-1">
                      Are you there? You have been disconnected. Please go back to home or start playing again
                    </div>
                    <div className="disconnected-buttons mt-2">
                      <button type="button" className="btn btn-outline-primary" onClick={reconnect}>
                        Reconnect
                      </button>
                      <a href="/o_casino" className="btn btn-outline-danger">Home</a>
                    </div>
                  </div>
                </div>
              )}

              {/* Title bar with dkd-total */}
              <div className="casino-video-title">
                <span className="casino-name">{GAME_CONFIG.name}</span>
                <div className="casino-video-rid">Round ID: {mid}</div>
                <div className="dkd-total">
                  <div>
                    <div>
                      <div>Curr. Total:</div>
                      <div className="numeric mt-1 text-playerb">{csum}</div>
                    </div>
                    <div>Card #: {cardCount}</div>
                  </div>
                  <div>{mainNat}</div>
                </div>
              </div>

              {/* Video iframe */}
              <div className="video-box-container">
                <div className="video-box">
                  {!inactive && streamUrl && (
                    <iframe
                      key={streamUrl}
                      src={streamUrl}
                      title="Casino Stream"
                      allowFullScreen
                      allow="autoplay"
                      scrolling="no"
                    />
                  )}
                </div>
              </div>

              {/* Card carousel — last dealt cards (same pattern as CardCarousel in BetTableAB4) */}
              <div className="casino-video-cards">
                <div className="casino-cards-shuffle">
                  <i className="fas fa-grip-lines-vertical" />
                </div>
                <div className="casino-video-cards-container">
                  <div className="lastCards-container">
                    <section tabIndex="0" className="lastCards hooper" ref={hooperRef}>
                      <div className="hooper-list">
                        <ul
                          className="hooper-track"
                          style={{ transform: `translateX(-${carouselOffset}px)`, display: 'flex', transition: 'transform 0.3s ease', padding: 0, margin: 0, listStyle: 'none' }}
                        >
                          {dealtCards.map((code, i) => {
                            const scrollIdx = slideW > 0 ? Math.round(carouselOffset / slideW) : 0;
                            const rel = i - scrollIdx;
                            const cls = rel === 0 ? 'hooper-slide is-active is-current' : (rel > 0 && rel < ITEMS_TO_SHOW) ? 'hooper-slide is-active' : (rel >= ITEMS_TO_SHOW && rel < ITEMS_TO_SHOW + 3) ? 'hooper-slide is-next' : 'hooper-slide';
                            return (
                              <li
                                key={i}
                                className={cls}
                                aria-hidden={rel < 0 || rel >= ITEMS_TO_SHOW ? true : undefined}
                                style={{ width: `${slideW}px`, flexShrink: 0 }}
                              >
                                <img src={cardSrc(code)} alt={code} />
                              </li>
                            );
                          })}
                        </ul>
                        <div className="hooper-navigation is-rtl">
                          <button type="button" className={`hooper-prev${carouselOffset >= maxCarouselOffset || cardCount <= ITEMS_TO_SHOW ? ' is-disabled' : ''}`} onClick={scrollRight}>
                            <svg className="icon icon-arrowRight" viewBox="0 0 24 24" width="24px" height="24px">
                              <title>Arrow Right</title>
                              <path d="M0 0h24v24H0z" fill="none" />
                              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                            </svg>
                          </button>
                          <button type="button" className={`hooper-next${carouselOffset <= 0 ? ' is-disabled' : ''}`} onClick={scrollLeft}>
                            <svg className="icon icon-arrowLeft" viewBox="0 0 24 24" width="24px" height="24px">
                              <title>Arrow Left</title>
                              <path d="M0 0h24v24H0z" fill="none" />
                              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                            </svg>
                          </button>
                        </div>
                        <div aria-live="polite" aria-atomic="true" className="hooper-liveregion hooper-sr-only">
                          Item 1 of {cardCount}
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Current card */}
              <div className="casino-video-current-card">
                <div>
                  <span>
                    <img src={cardSrc(card)} alt="current card" />
                  </span>
                </div>
              </div>

              {/* Desktop timer */}
              <DesktopTimer timeLeft={lt} fullTime={ft} />

              {/* Mobile digit timer */}
              <MobileDigitTimer timeLeft={lt} />

              {/* Right icons */}
              <div className="casino-video-right-icons">
                <div title="Home" className="casino-video-home-icon">
                  <a href="/o_casino" style={{ color: 'var(--text-highlight)' }}>
                    <i className="fas fa-home" />
                  </a>
                </div>
                <div title="Rules" className="casino-video-rules-icon" onClick={() => setShowRules((v) => !v)}>
                  <i className="fas fa-info-circle" />
                </div>
              </div>

              {/* Desktop inline rules panel */}
              {showRules && (
                <div
                  id="casino-vieo-rules"
                  aria-modal="true"
                  className="casino-vieo-rules show d-none-small show-rules"
                  style={{ display: 'block' }}
                >
                  <div className="rules-header">
                    <div>Rules</div>
                    <i className="fas fa-times" onClick={() => setShowRules(false)} style={{ cursor: 'pointer' }} />
                  </div>
                  <div className="rules-body">
                    <CasinoRulesSwitch gameType={GAME_TYPE} />
                  </div>
                </div>
              )}

              {/* Mobile rules modal */}
              <CasinoRulesModal
                show={showRules}
                onClose={() => setShowRules(false)}
                tableClass={GAME_CONFIG.tableClass}
              >
                <CasinoRulesSwitch gameType={GAME_TYPE} />
              </CasinoRulesModal>
            </div>
            {/* end casino-video */}

            <div className="casino-detail">
              <BetTableDum10 gameData={gameData} onBet={handleBet} exposures={exposures} />

              <CasinoPlaceBetModal
                show={showPlaceBet && !!selectedItem}
                betType={betType}
                betName={selectedItem?.nat || ''}
                betValue={betValue}
                stakeAmount={stakeAmount}
                setStakeAmount={setStakeAmount}
                placing={placing}
                onSubmit={handlePlaceBet}
                onClose={closeBetPanel}
                minBet={selectedItem?.min}
                maxBet={selectedItem?.max}
              />

              <div className="casino-video-last-results d-none-desktop">
                {lastResults.map(renderResult)}
                <a href={REPORT_LINK} className="result-more">...</a>
              </div>
            </div>

          </div>
        </div>

        <div className="casino-banners"></div>
        <Footer />
      </div>

      <CasinoRightSidebar
        lastResults={lastResults}
        renderResult={renderResult}
        myBets={myBets}
        reportLink={REPORT_LINK}
        showPlaceBet={showPlaceBet && !!selectedItem}
        betName={selectedItem?.nat || ''}
        betValue={betValue}
        betType={betType}
        stakeAmount={stakeAmount}
        setStakeAmount={setStakeAmount}
        placing={placing}
        onSubmit={handlePlaceBet}
        onClose={closeBetPanel}
        minBet={selectedItem?.min}
        maxBet={selectedItem?.max}
      />

      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={GAME_TYPE}
        gameName={GAME_CONFIG.name}
        mid={resultMid}
      />
    </>
  );
}
