import { memo, useRef, useState, useCallback, useEffect } from 'react';
import { DesktopTimer, MobileDigitTimer } from './CasinoTimer';
import CasinoCardSwitch from './cards/CasinoCardSwitch';
import CasinoRulesModal from './CasinoRulesModal';
import CasinoRulesSwitch from './rules/CasinoRulesSwitch';
import CasinoDesktopRules from './CasinoDesktopRules';
import { parseCards } from './cards/cardUtils';

const INACTIVITY_LIMIT = 60 * 1000; // 1 minute (change to 3 * 60 * 1000 for production)

/** Returns true when every dealt card is still face-down (code '1' or '0') */
function allCardsHidden(cardString) {
  if (!cardString) return true;
  const codes = parseCards(cardString);
  return codes.length === 0 || codes.every((c) => c === '1' || c === '0');
}

/** Placeholder — called when user goes inactive */
function stopStream() {
  // TODO: disconnect socket, pause video stream, release resources
}

/** Placeholder — called when user reconnects */
function startStream() {
  // TODO: reconnect socket, resume video stream
}

/**
 * Hook: true once the boot splash has lifted and the app shell is really on
 * screen.
 *
 * On a hard refresh <body> carries `app-loading`, which hides `.wrapper`
 * (display:none) for ~2s. A casino page mounts inside that hidden subtree, so
 * the stream <iframe> is created with a 0x0 box — the player inside sizes its
 * video off that empty viewport on load and never re-lays-out when the shell
 * appears, which is why a refreshed page showed the stream permanently zoomed
 * in while SPA navigation (no splash) looked fine. Mounting the iframe only
 * after the reveal makes both paths identical.
 */
function useShellVisible() {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || !document.body.classList.contains('app-loading')
  );

  useEffect(() => {
    if (visible) return;
    // Re-check: the class may have been dropped between render and this effect
    if (!document.body.classList.contains('app-loading')) {
      setVisible(true);
      return;
    }
    const obs = new MutationObserver(() => {
      if (!document.body.classList.contains('app-loading')) {
        obs.disconnect();
        setVisible(true);
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    // Safety net: never leave the stream unmounted if the class removal is missed
    const fallback = setTimeout(() => { obs.disconnect(); setVisible(true); }, 5000);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [visible]);

  return visible;
}

/** Hook: detects browser tab hidden or user inactivity */
function useInactivity(timeout = INACTIVITY_LIMIT) {
  const [isDisconnected, setIsDisconnected] = useState(false);
  const timerRef = useRef(null);

  const reconnect = useCallback(() => {
    setIsDisconnected(false);
    startStream();
  }, []);

  useEffect(() => {
    if (isDisconnected) return;

    const clear = () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };

    const start = () => {
      clear();
      timerRef.current = setTimeout(() => {
        clear();
        console.log('[Inactivity] DISCONNECTED — showing overlay');
        setIsDisconnected(true);
        stopStream();
      }, timeout);
    };

    let lastActivity = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity < 1000) return;
      lastActivity = now;
      start();
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        lastActivity = 0;
        handleActivity();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibility);

    start();
    console.log(`[Inactivity] Timer started — ${timeout / 1000}s`);

    return () => {
      clear();
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isDisconnected, timeout]);

  return [isDisconnected, reconnect];
}

const CasinoVideo = memo(function CasinoVideo({
  streamUrl,
  gameName,
  roundId,
  gameType,
  cardString,
  timeLeft,
  fullTime,
  showCards = false,
  showTimers = false,
  tableClass = '',
  subTitle = null,
  ballPopup = null,
  customCards = null,
  customTitle = null,
  extraClass = '',
  children = null,
}) {
  const loadedRef = useRef(false);
  const [videoHidden, setVideoHidden] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isDisconnected, reconnect] = useInactivity();
  const shellVisible = useShellVisible();


  const toggleVideo = useCallback(() => setVideoHidden((v) => !v), []);

  // Per-gameType feature flags
  let showVideoToggle = true;
  let showShuffleIcon = true;
  let showRulesIcon = true;
  switch (gameType) {
    case 'dolidana':
      showVideoToggle = false;
      showShuffleIcon = false;
      break;
    case 'ab4':
    case 'teen41':
    case 'sicbo2':
    case 'ballbyball':
    case 'teen32':
    case 'teen9':
    case 'poker':
    case 'poker6':
    case 'baccarat':
    case 'baccarat2':
      showVideoToggle = false;
      break;
    case 'lucky5':
    case 'poison':
    case 'poison20':
    case 'joker1':
    case 'joker120':
    case 'joker20':
    case 'teenmuf':
    case 'teen20b':
    case 'lucky15':
    case 'teen42':
    case 'sicbo':
    case 'teensin':
    case 'teen3':
    case 'teen33':
    case 'teen20':
    case 'teen20v1':
    case 'teen8':
    case 'poker20':
    case 'cmeter1':
    case 'race2':
    case 'aaa2':
    case 'ab20':
    case '3cardj':
    case 'worli2':
    case 'queen':
      showVideoToggle = false;
      showRulesIcon = false;
      break;
    case 'war':
    case 'dt20':
    case 'dt6':
    case 'dtl20':
    case 'dt202':
      showVideoToggle = false;
      break;
    case 'btable':
    case 'btable2':
    case 'lottcard':
    case 'cmatch20':
    case 'cmeter':
    case 'teen6':
    case 'aaa':
    case 'lucky7':
    case 'lucky7eu':
    case 'lucky7eu2':
    case 'abj':
    case 'ab3':
    case 'teen1':
    case 'teen120':
    case 'card32':
    case 'card32eu':
    case 'notenum':
    case 'trio':
    case 'race17':
    case 'worli':
    case 'worli2':
    case 'patti2':
    case 'trap':
    case 'teenunique':
    case 'mogambo':
    case 'teen20c':
    case 'goal':
    case 'goal2':
    case 'race20':
    case 'ourroullete':
    case 'roulette11':
    case 'roulette12':
    case 'roulette13':
      showVideoToggle = false;
      break;
    default:
      break;
  }

  const hideCards = showCards && allCardsHidden(cardString);
  const cardClasses = [
    'casino-video-cards',
    hideCards ? 'hide-cards' : '',
    videoHidden ? 'no-video' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`casino-video${extraClass ? ' ' + extraClass : ''}`}>
      {/* Disconnected / Inactive overlay */}
      {isDisconnected && (
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

      {/* Title bar — customTitle overrides default */}
      {customTitle
        ? customTitle
        : gameName && (
          <div className="casino-video-title">
            <span className="casino-name">{gameName}</span>
            {roundId && <span className="casino-video-rid">Round ID: {roundId}</span>}
          </div>
        )
      }

      {subTitle && (
        <div className="casino-video-title mogambo-total">
          <span className="casino-name">{subTitle}</span>
        </div>
      )}

      {/* Video — container always in DOM for layout; only iframe hides */}
      <div className="video-box-container">
        <div className="video-box">
          {/* shellVisible: never create the iframe while the boot splash still
              hides .wrapper — a 0x0 iframe loads the player at the wrong scale */}
          {!videoHidden && !isDisconnected && streamUrl && shellVisible && (
            <iframe
              key={streamUrl}
              src={streamUrl}
              title="Casino Stream"
              allowFullScreen
              allow="autoplay"
              scrolling="no"
              onLoad={() => { loadedRef.current = true; }}
            />
          )}
          {ballPopup && ballPopup.text && (
            <div className="cricket20ballpopup">
              {ballPopup.img && <img src={ballPopup.img} alt="" />}
              <span>{ballPopup.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Joker card section — for joker120 and joker1 */}
      {(gameType === 'joker120' || gameType === 'joker1') && (
        <div className="joker-card">
          <h4 className="text-playerb">Joker</h4>
          <span><img src="/assets/img/joker1/joker.png" alt="joker" /></span>
        </div>
      )}

      {/* Cards — 'hide-cards' when all face-down, 'no-video' when video toggled off */}
      {showCards && (
        <div className={cardClasses}>
          {showShuffleIcon && (
            <div className="casino-cards-shuffle">
              <i className="fas fa-grip-lines-vertical" />
            </div>
          )}
          <CasinoCardSwitch gameType={gameType} cardString={cardString} />
        </div>
      )}

      {/* Custom cards (e.g. AB4 desktop carousel) */}
      {customCards}

      {/* Timers */}
      {showTimers && (
        <>
          <DesktopTimer timeLeft={timeLeft} fullTime={fullTime} />
          <MobileDigitTimer timeLeft={timeLeft} />
        </>
      )}

      <div className="casino-video-right-icons">
        {showVideoToggle && (
          <div className="casino-video-home-icon net-icon" onClick={toggleVideo}>
            <i className={`fas ${videoHidden ? 'fa-video' : 'fa-video-slash'}`} />
          </div>
        )}
        <div title="Home" className="casino-video-home-icon">
          <a href="/o_casino" style={{ color: 'var(--text-highlight)' }}>
            <i className="fas fa-home" />
          </a>
        </div>
        {showRulesIcon && (
          <div title="Rules" className="casino-video-rules-icon" onClick={() => setShowRules((v) => !v)}>
            <i className="fas fa-info-circle" />
          </div>
        )}
      </div>

      {/* Desktop inline rules panel — hidden on mobile via d-none-small; lottery uses modal instead */}
      {showRules && gameType !== 'lottcard' && (
        <CasinoDesktopRules onClose={() => setShowRules(false)}>
          <CasinoRulesSwitch gameType={gameType} />
        </CasinoDesktopRules>
      )}

      {/* Rules modal — mobile for most games, all screens for lottery */}
      <CasinoRulesModal
        show={showRules}
        onClose={() => setShowRules(false)}
        tableClass={(gameType || '').startsWith('roulette') ? '' : tableClass}
        gameType={gameType}
      >
        <CasinoRulesSwitch gameType={gameType} />
      </CasinoRulesModal>

      {children}
    </div>
  );
});

export default CasinoVideo;
