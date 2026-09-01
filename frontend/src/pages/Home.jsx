import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import NewEvents from '../components/home/NewEvents';
import BannerCarousel from '../components/home/BannerCarousel';
import SportTabsMobile from '../components/home/SportTabsMobile';
import SportTabsDesktop from '../components/home/SportTabsDesktop';
import BetTable from '../components/betting/BetTable';
import SportDetailView from '../components/betting/SportDetailView';
import RacingTable from '../components/betting/RacingTable';
import FirstLoginRulesModal from '../components/modals/FirstLoginRulesModal';
import WelcomeBannerModal from '../components/modals/WelcomeBannerModal';
import HomeCasinoCarousel from '../components/home/HomeCasinoCarousel';
import useHomeLoad from '../hooks/home/useHomeLoad';

function Home() {
  // All the load/logout choreography (state, cascade, logout sequence, safety nets,
  // derived render flags) lives in useHomeLoad — this component is just the layout.
  const {
    isAuth,
    booted,
    activeTab,
    reloadKey,
    newEventsKey,
    showEvents,
    sportLoading,
    sportConfig,
    isInplay,
    showFirstLoader,
    showNoRecords,
    showTabLoader,
    hideBoard,
    handleTabClick,
    onFirstLoad,
  } = useHomeLoad();
  const user = useSelector((s) => s.user.user);

  // First-login popups (welcome banner / rules) — independent of the reveal
  // choreography.
  //
  // The rules modal is driven by the ACCOUNT, not this browser: `rules_accepted`
  // comes from the profile API (see admin/bakend-docs/user-accept-rules.md) and
  // only flips to true when the player presses Accept, which persists it
  // server-side. A sessionStorage flag used to gate this, so the modal reappeared
  // on every new session/device and vanished for good once dismissed here —
  // neither matched the account's real state.
  const [showRules, setShowRules] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  useEffect(() => {
    if (!isAuth || !user) return;
    const needsRules = user.rules_accepted === false;
    const welcome = sessionStorage.getItem('showLoginPopup') === 'true';
    if (needsRules) {
      setShowRules(true);
      setShowWelcome(false);
    } else {
      setShowRules(false);
      if (welcome) { setShowWelcome(true); sessionStorage.removeItem('showLoginPopup'); }
    }
  }, [isAuth, user]);

  return (
    <>
    <div className="home-container">
      {/* Header area (events, banner, tabs) stays visible while the board loads.
          On logout the board comes first; NewEvents is delayed 2s then remounts. */}
      {showEvents && <NewEvents key={newEventsKey} />}
      <BannerCarousel />
      <SportTabsMobile />
      {/* Sports list appears in sync with NewEvents (same phase): empty (parent +
          arrows only) until NewEvents shows, then the tabs fill in together. */}
      <SportTabsDesktop activeTab={activeTab} onTabClick={handleTabClick} showTabs={showEvents} />

      {/* First In-Play load: a single "no records found" board shown until the
          first data arrives (replaces the per-sport "Loading…" blocks). */}
      {showNoRecords && (
        <div className="bet-table">
          <div className="bet-table">
            <div className="bet-table-header nodata">
              no records found
            </div>
          </div>
        </div>
      )}

      {/* In-board gif loader: on a page REFRESH (first In-Play load) and on tab
          return to In-Play — until the board reloads. */}
      {(showFirstLoader || showTabLoader) && (
        <div className="bet-table loader-section-parent">
          <div className="loader-section">
            <div>
              <img src="/assets/animate/loader-ten.gif" alt="loader" />
            </div>
          </div>
          <div className="bet-table ten"></div>
        </div>
      )}

      {/* Board content stays mounted but hidden during the FIRST-load hold so it
          keeps fetching (its onLoad drives the choreography above). On a TAB-CLICK
          loader, though, it fully UNMOUNTS — a display:none board keeps its live
          odds/"Live" animations running, and they re-sync/stick when revealed.
          Remounting starts everything fresh. */}
      <div style={hideBoard ? { display: 'none' } : undefined}>
        {showTabLoader ? null : isInplay ? (
          <>
            {/* Cricket: all-data fetched ONCE per visit (pollOnce) — no 5s
                repeat poll; tab clicks (reloadKey) still force a fresh fetch */}
            <BetTable sportId={4} title="Cricket" isFootball={false} onLoad={onFirstLoad} reloadKey={reloadKey} pollOnce />
            <BetTable sportId={1} title="Football" isFootball={true} reloadKey={reloadKey} />
            <BetTable sportId={2} title="Tennis" isFootball={false} reloadKey={reloadKey} />
          </>
        ) : sportConfig ? (
          /* Racing (horse/greyhound) has its own board: the feed is nested
             country > venue > race and carries no odds, so the match-row layout
             doesn't apply. */
          sportConfig.racing ? (
            <RacingTable sportId={sportConfig.sid} reloadKey={reloadKey} />
          ) : (
            <SportDetailView sportId={sportConfig.sid} isFootball={sportConfig.isFootball} virtual={sportConfig.virtual} reloadKey={reloadKey} />
          )
        ) : sportLoading ? (
          /* Unmapped tab (no API yet): brief 1s loader before the placeholder. */
          <div className="bet-table loader-section-parent">
            <div className="loader-section">
              <div>
                <img src="/assets/animate/loader-ten.gif" alt="loader" />
              </div>
            </div>
            <div className="bet-table ten"></div>
          </div>
        ) : (
          /* Unmapped tab (table tennis, esoccer, basketball, etc.): static
             placeholder, NO API call — nothing that fetches is even mounted. */
          <div className="bet-table">
            <div className="bet-table">
              <div className="bet-table-header nodata">
                no records found
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Casino carousel: shown only after login, and held until the boot splash is
          gone (booted) so it doesn't peek out below the grey overlay. It then reveals
          together with the rest of the page — not tied to the board data, so it's
          never "late". */}
      { isAuth && booted && <HomeCasinoCarousel />}
      <FirstLoginRulesModal show={showRules} onClose={() => setShowRules(false)} />
      <WelcomeBannerModal show={showWelcome} onClose={() => setShowWelcome(false)} />
    </div>
    {/* Casino promo banners placeholder now renders globally in App.jsx
        (before the footer, logged-in only) — no per-page copy needed. */}
    </>
  );
}

export default Home;
