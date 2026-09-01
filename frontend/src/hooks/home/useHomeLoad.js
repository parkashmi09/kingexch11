import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

// Every tab makes an /all-data API call on click and renders through
// SportDetailView. The `sid` is the tab's icon number in SportTabsDesktop
// (icon-4 Cricket -> 4, icon-1 Football -> 1, icon-8 Table Tennis -> 8, …),
// which the diamond feed uses as the etid. Any sport with no live games just
// resolves to "no records found" (SportDetailView), so an empty board is safe.
// In-Play (the default tab) is handled separately by its own three boards.
export const TAB_SPORT_MAP = {
  cricket:          { sid: 4,  isFootball: false },
  // Virtual Cricket: same cricket all-data (sid 4), but the view renders ONLY the
  // virtual leagues (T5 XI, Virtual Cricket League, T10 XI).
  virtualcricket:   { sid: 4,  isFootball: false, virtual: true },
  football:         { sid: 1,  isFootball: true },
  tennis:           { sid: 2,  isFootball: false },
  tabletennis:      { sid: 8,  isFootball: false },
  esoccer:          { sid: 68, isFootball: false },
  // Horse/Greyhound racing: the all-data payload is nested COUNTRY > VENUE >
  // RACE with no odds at all, so neither the home board nor the detail page can
  // use the standard match layout — `racing` routes the tab to RacingTable
  // (country pills + venue rows of start times), and the detail page to
  // RacingDetails.
  horseracing:      { sid: 10, isFootball: false, racing: true },
  greyhoundracing:  { sid: 65, isFootball: false, racing: true },
  basketball:       { sid: 15, isFootball: false },
  wrestling:        { sid: 69, isFootball: false },
  volleyball:       { sid: 18, isFootball: false },
  badminton:        { sid: 22, isFootball: false },
  snooker:          { sid: 59, isFootball: false },
  darts:            { sid: 57, isFootball: false },
  boxing:           { sid: 6,  isFootball: false },
  mma:              { sid: 3,  isFootball: false },
  americanfootball: { sid: 58, isFootball: false },
  egames:           { sid: 11, isFootball: false },
  icehockey:        { sid: 19, isFootball: false },
  futsal:           { sid: 9,  isFootball: false },
  motorsports:      { sid: 52, isFootball: false },
  politics:         { sid: 40, isFootball: false },
  kabaddi:          { sid: 66, isFootball: false },
};

// useHomeLoad — the entire home-page load choreography + logout flow, extracted from
// the Home page so the component stays presentational. It owns all the reveal state
// (which placeholder/loader/board shows and when), the boot-splash gate, the init
// cascade, the logout sequence, and every safety net. Returns exactly the flags the
// Home render needs. Behaviour is identical to the previous inline version.
export default function useHomeLoad() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [activeTab, setActiveTab] = useState('inplay');
  // Bumped on every tab click so the all-data API is re-called each time — even
  // when the already-active tab is clicked again.
  const [reloadKey, setReloadKey] = useState(0);
  const firstLoadRef = useRef(false);
  // On the very first In-Play load the board shows a SINGLE "no records found"
  // placeholder (not the per-sport "Loading…" blocks) until the first data
  // arrives — starts true, flipped false in onFirstLoad once data is in.
  const [firstNoRecords, setFirstNoRecords] = useState(true);
  // In-board loader shown when returning to the In-Play tab from another tab.
  const [tabReloading, setTabReloading] = useState(false);
  // Brief per-selection loader for sports we don't have an API for yet (unmapped,
  // non-In-Play tabs): ~1s spinner, then the static "no records found". Kept fully
  // separate from the In-Play choreography.
  const [sportLoading, setSportLoading] = useState(false);
  // Bumped on logout to remount NewEvents so it reloads.
  const [newEventsKey, setNewEventsKey] = useState(0);
  // Staged reveal on every home load: NewEvents at +1s, the board at +2s (relative
  // to the splash lifting — see the init-cascade effect). Both start HIDDEN so the
  // cascade (or the logout sequence) is what reveals them — no early flash.
  // Exception: a cross-page logout mount shows the board ("no records found")
  // from the very first frame — phase 1 of the logout choreography.
  const [showEvents, setShowEvents] = useState(false);
  const [boardReady, setBoardReady] = useState(
    () => sessionStorage.getItem('justLoggedOut') === '1'
  );
  // Guards so the init cascade fires exactly once and never fights the logout
  // sequence: `isLogoutMountRef` is captured at the first render (before the logout
  // effect clears the flag) so a cross-page logout mount skips the cascade;
  // `didInitStageRef` stops it re-triggering when a later (on-page) logout resets
  // the staged state.
  const isLogoutMountRef = useRef(sessionStorage.getItem('justLoggedOut') === '1');
  const didInitStageRef = useRef(false);
  const prevAuthRef = useRef(isAuth);
  const logoutTimersRef = useRef([]);
  // The boot splash (index.html) covers the whole page for ~2s, then main.jsx
  // removes `app-loading` from <body> when it reveals the page. Hold the casino
  // carousel until then so it doesn't peek out below the splash on mobile — it
  // then appears together with the rest of the page (never alone-early or late).
  const [booted, setBooted] = useState(
    () => typeof document === 'undefined' || !document.body.classList.contains('app-loading')
  );
  useEffect(() => {
    if (booted) return;
    // Re-check now: if `app-loading` was removed between the initial render and this
    // effect, the observer below would never see that mutation and `booted` would
    // be stuck false forever (blocking the whole reveal).
    if (!document.body.classList.contains('app-loading')) {
      setBooted(true);
      return;
    }
    const obs = new MutationObserver(() => {
      if (!document.body.classList.contains('app-loading')) {
        setBooted(true);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    // Fallback: the splash normally lifts by ~2s (main.jsx). If the class removal is
    // ever missed, never let `booted` stay false — that would block the whole reveal
    // cascade (NewEvents, tabs, loader all gated on it). Force it after 3s.
    const fallback = setTimeout(() => setBooted(true), 3000);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [booted]);

  // Post-logout choreography (back to In-Play), in three phases matching the design:
  //   phase 1 (t=0)  banner + tabs + "no records found" board shown immediately
  //                  (the preloaded shell); NewEvents still hidden. Fetch re-triggered.
  //   phase 2 (t=1s) NewEvents appears (remounted -> re-fetches logged-out events)
  //   phase 3 (data) real data arrives -> "no records" clears, full board shows
  const runLogoutSequence = useCallback(() => {
    logoutTimersRef.current.forEach(clearTimeout);
    setActiveTab('inplay');              // auto-select In-Play
    setShowEvents(false);                // NewEvents hidden until phase 2
    // Phase 1 — show the "no records found" board right away. Keep firstLoadRef TRUE
    // so the board's onLoad (data arrives from the reload below) does NOT clear the
    // placeholder early — we reveal the data on a fixed timer instead (phase 3).
    setBoardReady(true);
    firstLoadRef.current = true;
    setFirstNoRecords(true);
    setTabReloading(false);
    setReloadKey((k) => k + 1);
    logoutTimersRef.current = [
      setTimeout(() => {                 // phase 2 — t=0.5s: NewEvents
        setShowEvents(true);
        setNewEventsKey((k) => k + 1);
      }, 500),
      setTimeout(() => {                 // phase 3 — t=1.5s: board data
        setFirstNoRecords(false);
      }, 1500),
    ];
  }, []);

  // Cross-page logout: Header sets `justLoggedOut` before navigating to '/', so run
  // the sequence as soon as Home mounts (Home never saw the auth flip on remount).
  useEffect(() => {
    if (sessionStorage.getItem('justLoggedOut') === '1') {
      sessionStorage.removeItem('justLoggedOut');
      runLogoutSequence();
    }
    return () => logoutTimersRef.current.forEach(clearTimeout);
  }, [runLogoutSequence]);

  // Init cascade — the reveal choreography on every home load, in the same phase
  // order as the logout sequence:
  //   phase 1 (t=0, splash lifts) the board placeholder shows FIRST — "no records
  //           found" (logged out) or the gif loader (logged in); NewEvents+tabs hidden.
  //   phase 2 (+0.8s) NewEvents + the sport tabs appear together.
  //   phase 3 (+1.5s) real data replaces the placeholder in the bet table.
  // Tied to `booted` (splash lift) so the stagger is actually visible; if there's
  // no splash (client-side nav, booted already true) it cascades from mount. The
  // board stays mounted (display:none via hideBoard) and keeps fetching during the
  // hold. Runs once per mount; skipped on logout (that has its own sequence).
  useEffect(() => {
    if (didInitStageRef.current || isLogoutMountRef.current) return;
    if (!booted) return;
    didInitStageRef.current = true;
    // Phase 1 — placeholder first. Keep firstLoadRef TRUE so a fast/cached board
    // fetch can't flip firstNoRecords off early (flicker); data is revealed on the
    // fixed phase-3 timer instead.
    setBoardReady(true);
    firstLoadRef.current = true;
    setFirstNoRecords(true);
    setTabReloading(false);
    setReloadKey((k) => k + 1);
    const t1 = setTimeout(() => setShowEvents(true), 800);           // phase 2
    const t2 = setTimeout(() => setFirstNoRecords(false), 1500);     // phase 3
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [booted]);

  // On-page logout: auth true -> false while Home stays mounted (no remount).
  // useLayoutEffect so NewEvents is hidden BEFORE paint — no one-frame flash of
  // the old logged-in page.
  useLayoutEffect(() => {
    const wasAuth = prevAuthRef.current;
    prevAuthRef.current = isAuth;
    if (wasAuth && !isAuth) {
      sessionStorage.removeItem('justLoggedOut');
      runLogoutSequence();
    }
  }, [isAuth, runLogoutSequence]);

  // Fired when the cricket board's first data arrives. (The gif loader / splash
  // are hidden on timers in main.jsx, not here.)
  const onFirstLoad = useCallback(() => {
    if (!firstLoadRef.current) {
      firstLoadRef.current = true;
      // First In-Play data is in → drop the "no records found" placeholder and
      // reveal the real board.
      setFirstNoRecords(false);
    }
    // Tab-click loaders are cleared by the fixed 1s timer (above), not by data
    // arrival — a fast/cached fetch would otherwise hide the loader instantly.
  }, []);

  // Safety net: the first-load placeholder is normally cleared by onFirstLoad once
  // the board's first fetch resolves. If that never happens (e.g. the fetch keeps
  // erroring/retrying so `loading` stays true), force-reveal after 6s so the
  // loader / "no records found" can never get stuck.
  useEffect(() => {
    if (!firstNoRecords) return;
    const t = setTimeout(() => {
      firstLoadRef.current = true;
      setFirstNoRecords(false);
    }, 6000);
    return () => clearTimeout(t);
  }, [firstNoRecords]);

  // Safety net for the board hold itself: it's normally released by the init cascade
  // (booted + 2s) or the logout sequence (2s). If those signals never arrive (e.g.
  // the splash class is never removed), force-reveal after 6s so the board (and its
  // data) can never stay hidden — comfortably after the ~4s cascade reveal so the
  // normal path wins.
  useEffect(() => {
    if (boardReady) return;
    const t = setTimeout(() => setBoardReady(true), 6000);
    return () => clearTimeout(t);
  }, [boardReady]);

  // Same safety net for the tab-return In-Play loader: it's normally cleared by
  // onFirstLoad when the reload's data arrives, but if that onLoad never fires
  // again (data unchanged/cached, or the fetch keeps erroring) the loader would
  // stay stuck forever. Force-clear after 6s.
  useEffect(() => {
    if (!tabReloading) return;
    const t = setTimeout(() => setTabReloading(false), 6000);
    return () => clearTimeout(t);
  }, [tabReloading]);

  // Safety net for NewEvents + the sport tabs: they're revealed by the cascade (or
  // the logout sequence). If that signal is ever missed they'd stay hidden forever
  // (they have no other trigger), so force them visible after 4s — the normal
  // cascade (~1s) wins well before this.
  useEffect(() => {
    if (showEvents) return;
    const t = setTimeout(() => setShowEvents(true), 4000);
    return () => clearTimeout(t);
  }, [showEvents]);

  // Every tab click re-triggers the fetch (setActiveTab alone won't fire when the
  // same tab is re-clicked, so bump reloadKey too). Every tab shows the in-board
  // loader: In-Play clears it when the board reloads (onFirstLoad); mapped sport
  // tabs clear it on a short timer (below); unmapped tabs use sportLoading instead.
  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
    setReloadKey((k) => k + 1);
    setTabReloading(true);
  }, []);

  // Clear the tab-click loader on a fixed ~1s timer for EVERY tab (In-Play
  // included) — a guaranteed-visible loader; the board keeps fetching
  // underneath and simply reveals when the timer lifts. (A data-driven clear
  // would hide it instantly on fast/cached fetches, so it'd never be seen.)
  useEffect(() => {
    if (!tabReloading) return;
    const t = setTimeout(() => setTabReloading(false), 1000);
    return () => clearTimeout(t);
  }, [tabReloading, activeTab, reloadKey]);

  // Unmapped sports (no API yet): on each selection show a ~0.5s loader, then the
  // static "no records found". In-Play and the mapped sports are excluded.
  useEffect(() => {
    const unmapped = activeTab !== 'inplay' && !TAB_SPORT_MAP[activeTab];
    if (!unmapped) { setSportLoading(false); return; }
    setSportLoading(true);
    const t = setTimeout(() => setSportLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeTab, reloadKey]);

  const sportConfig = TAB_SPORT_MAP[activeTab];
  const isInplay = activeTab === 'inplay';
  const firstPending = boardReady && isInplay && firstNoRecords;
  // First In-Play placeholder: the gif loader when logged IN, the "no records found"
  // board when logged OUT. (In-Play only — firstPending already gates on isInplay.)
  const firstIsLoader = isAuth;
  // The In-Play gif loader (logged in) appears only once NewEvents + the sport tabs
  // are revealed (phase 2 / showEvents) — NOT from phase 1. So on load it goes:
  // nothing → NewEvents + tabs + loader together → data. (The logged-out "no records"
  // placeholder is unaffected — it still shows immediately.)
  const showFirstLoader = firstPending && firstIsLoader && showEvents;
  // Logged-OUT only: the "no records found" board is present from the very first
  // frame — NO delay, no cascade gate. The moment the page is revealed (splash
  // lifts) it's already there; the real board replaces it once data arrives. Logged-in
  // is unaffected (it shows the gif loader via firstPending), and logout is unaffected
  // (it's logged-out too, so this shows immediately — matching "board comes first").
  const showNoRecords = !isAuth && isInplay && firstNoRecords;
  // In-board loader on tab clicks: In-Play (until its board reloads) AND the
  // mapped sport tabs (1s timer above). Unmapped tabs keep their own
  // sportLoading placeholder path.
  const showTabLoader = boardReady && (isInplay || !!sportConfig) && tabReloading && !firstNoRecords;
  // While the board is held back (post-logout, until 2s) hide everything board-related.
  const hideBoard = !boardReady || firstPending || showTabLoader;

  return {
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
  };
}
