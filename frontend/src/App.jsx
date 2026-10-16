import { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams, useNavigationType } from 'react-router-dom';
import BToastContainer from './components/BToast';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStakeButtonsThunk } from './redux/stakeButtonSlice';
import { fetchBalanceThunk, subscribeToRealTimeUpdates } from './redux/userSlice';
import { initializeSocket } from './apiservices/authService';
import { HeaderTop, MainHeader } from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import UpcomingFixture from './components/home/UpcomingFixture';
// The clickbet UI. It ships as its own tree under src/cb so the rebuild can
// land route by route: the home page renders through CbLayout below, every
// other route still goes through MainLayout until it is converted too.
import CbLayout from './cb/Layout';
import Dashboard from './kx/dashboard/Dashboard';
import Markets from './kx/markets/Markets';
import MarketDetails from './kx/market/MarketDetails';
import LiveCasino from './kx/casino/LiveCasino';
import InPlay from './kx/inplay/InPlay';
import Sports from './kx/sports/Sports';
import Account from './kx/account/Account';
import AccountStatement from './kx/account/AccountStatement';
import MyProfile from './kx/account/MyProfile';
import RollingCommission from './kx/account/RollingCommission';
import BetHistory from './kx/account/BetHistory';
import ProfitLoss from './kx/account/ProfitLoss';
import PasswordHistory from './kx/account/PasswordHistory';
import ActivityLog from './kx/account/ActivityLog';
import LotteryDetails from './kx/lottery/LotteryDetails';
import InplayHorseGames from './kx/racing/InplayHorseGames';
import { raceRoute } from './kx/racing';
import CbUnsettledBet from './cb/report/UnsettledBet';
import CbSetStake from './cb/report/SetStake';
import CbCasinoLobby from './cb/pages/CasinoLobby';
import LegacyStyles from './legacyStyles';
import VirtualCricket from './pages/VirtualCricket';
import VirtualCricketDetails from './pages/VirtualCricketDetails';
import Login from './kx/Login';
import TwoFactorAuth from './pages/TwoFactorAuth';
import TermsAndConditions from './pages/TermsAndConditions';
import ResponsibleGaming from './pages/ResponsibleGaming';
import CasinoHome from './pages/CasinoHome';
import SlotHome from './pages/SlotHome';
import FantasyHome from './pages/FantasyHome';
import CrashPage from './pages/CrashPage';
import { casinoRoutes, reportRoutes, vcasinoRoutes } from './routes';
import ForcePasswordChange from './components/ForcePasswordChange';
import useEntranceGlide from './hooks/useEntranceGlide';
import { rememberScroll, recallScroll } from './utils/scrollMemory';

// Entrance movement for EVERY casino game page (/casino/*). Same drift the
// casino list uses, but REVERSED: the page opens at the bottom and glides up to
// the top. Mounted once here rather than repeated across the ~90 game pages —
// they all render through this branch.
//
// Faster than the casino list's 2500ms: a game page is the destination, so the
// user wants to be at the table, not watching it arrive. The hold is short too —
// this one should read as starting immediately, not after a beat.
const CASINO_GAME_GLIDE_MS = 1100;
const CASINO_GAME_GLIDE_HOLD_MS = 150;

function CasinoGameEntranceGlide() {
  useEntranceGlide(
    () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Nothing to scroll (short page / desktop layout that fits) — skip
      if (max < 8) return null;
      return { from: max, to: 0 };
    },
    { durationMs: CASINO_GAME_GLIDE_MS, delayMs: CASINO_GAME_GLIDE_HOLD_MS }
  );
  return null;
}

const RACING_SIDS = ['10', '65'];

// Match details. A race lives at the reference's own race address
// (/horse-racing/inplayHorseGame/:eventId/:sportId); links still built the
// generic way are sent there.
function DetailRoute() {
  const { sid, gmid } = useParams();
  if (RACING_SIDS.includes(String(sid))) return <Navigate to={raceRoute(Number(sid), gmid)} replace />;
  return <CbLayout kx><MarketDetails /></CbLayout>;
}

// The old racing boards' address: racing lists are the reference's
// /allsport-highlight/7 (horse) and /4339 (greyhound) now.
function RaceRedirect() {
  const { sportId } = useParams();
  return <Navigate to={`/allsport-highlight/${sportId === '65' ? 4339 : 7}`} replace />;
}

// A My Account page: the kingexch chrome, and home for anyone logged out
// (the reference's login guard).
function Authed({ children }) {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  if (!isAuth) return <Navigate to="/" replace />;
  return <CbLayout kx>{children}</CbLayout>;
}

// Mobile-only news marquee shown above report boxes and the logged-in casino
// list (reference: news-box > news-bar > marquee-wrapper).
function NewsStrip() {
  return (
    <div className="news-box d-none-desktop">
      <div className="news-bar d-none-desktop">
        <div className="marquee-wrapper">
          <div className="marquee-content" style={{ animationDuration: '6.90667s' }}>
            Welcome to new version of TENEXCH, Enjoy more services...
          </div>
        </div>
        {/* The mobile strip and the header ticker are mirror images of each
            other: the header puts news-icon.png FIRST and leaves news-title
            empty, this one leaves the first slot empty and carries speaker.svg
            INSIDE news-title. Downloaded locally, never hotlinked. */}
        <div className="news-title">
          <img src="/assets/icons/speaker.svg" alt="" />
        </div>
      </div>
    </div>
  );
}

function MainLayout() {
  const isAuth = useSelector((state) => state.user.isAuthenticated);
  const stakeLoaded = useSelector((state) => state.stakeButtons.loaded);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigationType = useNavigationType();

  // Prefetch the stake buttons. They are PLATFORM settings — one set for the
  // whole site — and the endpoint reads without a token, so this no longer waits
  // for login: a logged-out visitor (and demo mode, whose sentinel token is
  // never sent upstream) gets the real ladder instead of the built-in fallback.
  useEffect(() => {
    if (!stakeLoaded) {
      dispatch(fetchStakeButtonsThunk());
    }
  }, [stakeLoaded, dispatch]);

  // App-level socket bootstrap (same pattern as the lords frontend App.js):
  // the shared socket + balanceUpdate subscription are armed at the app root
  // as soon as auth + user id exist, so the realtime chain never depends on
  // the Header's mount timing. The Header's 10s heartbeat still re-arms the
  // subscription and polls — this only guarantees the socket exists first.
  const authUser = useSelector((state) => state.user.user);
  const authUid = authUser?.user_id || authUser?.id || authUser?._id;
  useEffect(() => {
    if (!isAuth || !authUid) return;
    const token = localStorage.getItem('token');
    if (!token || token === 'demo-token') return;
    initializeSocket(token, authUid);
    dispatch(subscribeToRealTimeUpdates());
    dispatch(fetchBalanceThunk(token));
  }, [isAuth, authUid, dispatch]);

  // Keep this history entry's scroll position up to date, so a later BACK can
  // return to it. Also captured on unmount/navigation, which covers a jump made
  // without any scroll event firing first.
  useEffect(() => {
    const key = location.key;
    const onScroll = () => rememberScroll(key, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      rememberScroll(key, window.scrollY);
      window.removeEventListener('scroll', onScroll);
    };
  }, [location.key]);

  // Scroll positioning on navigation. A FORWARD navigation (push/replace) opens
  // at the top — location.key changes on each history entry, so even re-clicking
  // a link to the same route scrolls up (pathname alone would skip that case).
  //
  // A BACK/FORWARD navigation (POP) instead restores where the user was: scroll
  // half-way down /o_casino, open a game, press back, and the list is still
  // half-way down. Restoring is retried across two frames because the returning
  // page has to lay out before the position it needs even exists.
  useEffect(() => {
    if (navigationType === 'POP') {
      const y = recallScroll(location.key);
      if (y != null) {
        let tries = 0;
        const restore = () => {
          window.scrollTo(0, y);
          if (++tries < 3 && Math.abs(window.scrollY - y) > 2) {
            requestAnimationFrame(restore);
          }
        };
        requestAnimationFrame(restore);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.key, navigationType]);
  const isDetailPage = location.pathname.startsWith('/tp-virtual-cricket/');
  // /o_slot shares the casino list's page chrome exactly — the reference dumps
  // both pages with the same center-main-content > center-container wrapper —
  // so it rides the same branch instead of getting a near-duplicate of it.
  // `/o_slot` is the slot landing; `/slot/:id` is one provider deep-linked by id
  // (the reference navigates the rail that way, e.g. /slot/3 = Turbo Games).
  // The slot pages are their own family inside the casino group: same page
  // chrome, but they always take the report-container shell (see
  // renderContent), so they never want `tenopen` on the container either.
  // /o_fantasy is the same page shape over the fantasy category, so it rides
  // this branch too rather than getting a near-duplicate of it.
  const isSlotPage = location.pathname.startsWith('/o_slot')
    || location.pathname.startsWith('/slot/')
    || location.pathname.startsWith('/o_fantasy')
    || location.pathname.startsWith('/fantasy/');
  const isCasinoPage = location.pathname.startsWith('/o_casino') || isSlotPage;
  const isCasinoGamePage = location.pathname.startsWith('/casino/');
  // Virtual casino is its own family: no video stream, no casino-table markup,
  // and a full-bleed board that supplies its own container. It gets no sidebar,
  // no upcoming-fixture strip and no layout-level wrapper of any kind.
  const isVCasinoPage = location.pathname.startsWith('/vcasino/');
  const isReportPage = location.pathname.startsWith('/report/') || location.pathname.startsWith('/settings/');
  const isCrashPage = location.pathname.startsWith('/crash');

  // Container class mirrors the reference: logged IN → `logged-in`, logged OUT →
  // `tenopenhome` (the open-home / logged-out theme). This applies on EVERY page,
  // including game-details (the reference shows `main-container tenopenhome` there
  // when logged out), not just the home page.
  //
  // The casino list is the exception, and it splits by auth: logged OUT it is
  // `main-container tenopen` (that class carries the page's own layout —
  // `.tenopen .center-container` is width:100% and `.tenopen
  // .center-main-content` sets the top margin); logged IN the reference ships a
  // BARE `main-container` and puts the layout on the wrapper instead
  // (report-container + header-casino).
  // Virtual casino takes a BARE main-container — no `logged-in`, no
  // `tenopenhome`. Its spacing comes from `.sidebar-left ~ .main-container`
  // (ten rules across style.css/responsive.css), and `logged-in` overrides
  // those, so adding it here pushes the board out of position.
  // Slot pages take the BARE container in both auth states: their layout lives
  // on report-container, and `tenopen` (which the logged-out casino list needs)
  // would override it.
  const containerClass = isVCasinoPage || isSlotPage
    ? 'main-container'
    : isCasinoPage
      ? `main-container${isAuth ? '' : ' tenopen'}`
      : `main-container${isAuth ? ' logged-in' : ' tenopenhome'}`;

  function renderContent() {
    if (isVCasinoPage) {
      // Plain center-main-content (no casino-table-open — that belongs to the
      // /casino/* tables), with the mobile upcoming-fixture strip above the
      // board, exactly as the reference wraps a virtual table.
      return (
        <div className="center-main-content">
          <UpcomingFixture />
          <Routes>
            {vcasinoRoutes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            {/* The other twelve virtual tables aren't built yet — send them back
                to the list rather than to a blank page. */}
            <Route path="/vcasino/*" element={<Navigate to="/o_casino" replace />} />
          </Routes>
        </div>
      );
    }
    if (isCasinoGamePage) {
      return (
        <div className="center-main-content casino-table-open">
          <CasinoGameEntranceGlide />
          <UpcomingFixture />
          <Routes>
            {casinoRoutes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            {/* Redirect unregistered casino games to casino home */}
            <Route path="/casino/*" element={<Navigate to="/o_casino" replace />} />
          </Routes>
        </div>
      );
    }
    if (isDetailPage) {
      // Logged OUT: reference wraps game-details in the home-style container
      // (center-main-content center-home-content > center-container)
      return (
        <div className={`center-main-content${isAuth ? '' : ' center-home-content'}`}>
          <UpcomingFixture />
          <Routes>
            {/* Virtual cricket rounds open on their own route (reference:
                /tp-virtual-cricket/4/gmid) with their own named component */}
            <Route path="/tp-virtual-cricket/:sid/:gmid" element={<VirtualCricketDetails />} />
          </Routes>
        </div>
      );
    }
    if (isCasinoPage) {
      const casinoRoutesEl = (
        <Routes>
          <Route path="/o_casino" element={<CasinoHome />} />
          <Route path="/o_slot" element={<SlotHome />} />
          <Route path="/slot/:providerId" element={<SlotHome />} />
          {/* Same shape as the slot page, over the fantasy category */}
          <Route path="/o_fantasy" element={<FantasyHome />} />
          <Route path="/fantasy/:providerId" element={<FantasyHome />} />
        </Routes>
      );
      // The slot pages always take the report-container shell, signed in or
      // not — it carries the mobile news + upcoming-fixture strips above the
      // list. Only the casino list keeps the auth split below.
      //
      // Logged OUT the reference wraps the CASINO list in a plain
      // center-main-content > center-container (widths come from `tenopen` on
      // the container).
      if (!isAuth && !isSlotPage) {
        return (
          <div className="center-main-content">
            <div className="center-container">{casinoRoutesEl}</div>
          </div>
        );
      }
      // Logged IN it is a report-container carrying the same mobile news +
      // upcoming-fixture strip the report pages show, then the list itself.
      return (
        <div className="center-main-content report-container">
          <NewsStrip />
          <UpcomingFixture />
          {casinoRoutesEl}
        </div>
      );
    }
    if (isCrashPage) {
      // The reference puts `report-container` INSIDE center-main-content on this
      // page (not merged onto it as the report pages do), with the mobile news +
      // upcoming-fixture strips above it. CrashPage renders that inner div.
      return (
        <div className="center-main-content">
          <NewsStrip />
          <UpcomingFixture />
          <Routes>
            <Route path="/crash" element={<CrashPage />} />
          </Routes>
        </div>
      );
    }
    if (isReportPage) {
      // Fraud Report uses a plain center-main-content in the reference
      const isFraudReport = location.pathname.startsWith('/report/fraud-report');
      return (
        <div className={`center-main-content${isFraudReport ? '' : ' report-container'}`}>
          {/* Mobile-only news + upcoming fixture strip above the report box
              (reference shows these on every report page) */}
          <NewsStrip />
          <UpcomingFixture />
          <Routes>
            {reportRoutes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Routes>
        </div>
      );
    }
    return (
      <div className="center-main-content center-home-content">
        <div className="center-container">
          <Routes>
            {/* Standalone Virtual Cricket board (Dim/e-cricket leagues only) */}
            <Route path="/virtual-cricket" element={<VirtualCricket />} />
          </Routes>
        </div>
      </div>
    );
  }
  

  return (
    <div className="wrapper">
      {/* The tenexch stylesheets apply only while this old chrome is on screen. */}
      <LegacyStyles />
      <HeaderTop />
      {/* Hide left sidebar on casino home, crash and report pages; show on casino game pages */}
      {/* Virtual casino KEEPS the sidebar. It is `d-none-mobile` so it never
          shows on a phone, but its presence is what makes
          `.sidebar-left ~ .main-container` match — remove the element and the
          board loses every margin/padding rule that selector carries. */}
      {!isCasinoPage && !isReportPage && !isCrashPage && <Sidebar />}
      <div className={containerClass}>
        {/* Report/settings pages also use header-casino in the reference —
            `.header-casino ~ .center-main-content` drives the top margin. On
            the CASINO list only the logged-IN page carries it; logged out the
            reference ships a plain `header` and `.tenopen .center-main-content`
            sets the margin instead.
            The SLOT pages carry it in both auth states, because they always
            render the report-container shell and the rule that positions and
            sizes that shell is a SIBLING selector —
            `.header-casino ~ .center-main-content.report-container`
            (ten-custom.css, max-width:1279px: margin-top 50px + min-height).
            Without header-casino on the header, that rule never matches and the
            shell loses both its top margin and its height. */}
        <MainHeader extraClass={((isCasinoPage && isAuth) || isSlotPage || isReportPage || isCrashPage) ? 'header-casino' : ''} />
        <Suspense fallback={null}>{renderContent()}</Suspense>
        {/* Casino promo banners placeholder — sits right before the footer
            after login (reference layout). Casino game pages render their own
            copy next to their own footer, and the casino LIST page has none:
            its own grid already ends in a casino-banners block. */}
        {isAuth && !isCasinoGamePage && !isCasinoPage && !isVCasinoPage && <div className="casino-banners"></div>}
        {/* Footer goes inside main-container for non-casino pages;
            for casino game pages it's rendered inside casino-center by the page
            component. Casino home (/o_casino) shows it only AFTER login. */}
        {!isCasinoGamePage && !isVCasinoPage && !(isCasinoPage && !isAuth) && <Footer />}
      </div>
    </div>
  );
}

function App() {
  // Mirror the reference: keep the CSS var `--app-height` on <html> in sync with
  // the real viewport height (px), so `height: var(--app-height)` rules avoid the
  // mobile 100vh / address-bar problem. Updated on load and resize.
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  return (
    <>
    {/* The app's ONE toaster. It renders the reference's BootstrapVue markup
        (b-toaster-top-center > b-toast > toast-header + toast-body), so every
        toast has to go through bToastSuccess / bToastError / bToastWarning.
        react-hot-toast's <Toaster> used to sit alongside it and a handful of
        screens toasted through that instead, producing a second, differently
        styled toast for the same kind of event. */}
    <BToastContainer />
    {/* First login: the mandatory password change follows the user across
        routes and survives a refresh — the token is already stored by then, so
        a reload used to drop them into the app with the default password. */}
    <ForcePasswordChange />
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/authentication/2" element={<TwoFactorAuth />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/responsible-gaming" element={<ResponsibleGaming />} />

      {/* Routes rebuilt on the clickbet UI. Listed before the catch-all; the
          router still ranks these static paths above "/*". The page goes in as
          CbLayout's children rather than through a nested <Routes>: the parent
          match is exact, so a nested router would see an empty remaining path
          and render the "/" branch on every one of them. */}
      <Route path="/" element={<CbLayout kx><Dashboard /></CbLayout>} />
      <Route path="/home" element={<CbLayout kx><Dashboard /></CbLayout>} />
      <Route path="/allsport-highlight/:sportId" element={<CbLayout kx><Markets /></CbLayout>} />
      <Route path="/lottery/:sportId/:eventId" element={<CbLayout kx><LotteryDetails /></CbLayout>} />
      <Route path="/inplay" element={<CbLayout kx><InPlay /></CbLayout>} />
      <Route path="/sports" element={<CbLayout kx><Sports /></CbLayout>} />
      <Route path="/account" element={<CbLayout kx><Account /></CbLayout>} />
      <Route path="/livecasino" element={<CbLayout kx><LiveCasino /></CbLayout>} />
      <Route path="/horse-racing/inplayHorseGame/:eventId/:sportId" element={<CbLayout kx><InplayHorseGames /></CbLayout>} />
      <Route path="/race/:sportId" element={<RaceRedirect />} />
      {/* The My Account menu, at the reference's own paths (it requires a
          login there); the app's older addresses for them redirect. */}
      <Route path="/myprofile" element={<Authed><MyProfile /></Authed>} />
      <Route path="/rolling-commission" element={<Authed><RollingCommission /></Authed>} />
      <Route path="/account-statement" element={<Authed><AccountStatement /></Authed>} />
      <Route path="/bet-history" element={<Authed><BetHistory /></Authed>} />
      <Route path="/profit-loss" element={<Authed><ProfitLoss /></Authed>} />
      <Route path="/password-history" element={<Authed><PasswordHistory /></Authed>} />
      <Route path="/activity-log" element={<Authed><ActivityLog /></Authed>} />
      {[['/accountstatement', '/account-statement'], ['/report/accountstatement', '/account-statement'], ['/bethistory', '/bet-history'],
        ['/profitloss', '/profit-loss'], ['/changepassword', '/myprofile'], ['/report/activity', '/activity-log']].map(([from, to]) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}
      {/* The other old account pages, still on the clickbet UI. */}
      <Route path="/unsettledbet" element={<CbLayout><CbUnsettledBet /></CbLayout>} />
      <Route path="/setstake" element={<CbLayout><CbSetStake /></CbLayout>} />

      {/* The casino lobbies, at the reference's /casino/:id. Only the ids in
          cb/casino/lobbies.js are pages; anything else falls back to home. */}
      <Route path="/casino/INDIANPOKER" element={<CbLayout><CbCasinoLobby lobbyId="INDIANPOKER" /></CbLayout>} />
      <Route path="/casino/AVIATOR" element={<CbLayout><CbCasinoLobby lobbyId="AVIATOR" /></CbLayout>} />
      <Route path="/casino/CHICKENROAD" element={<CbLayout><CbCasinoLobby lobbyId="CHICKENROAD" /></CbLayout>} />
      <Route path="/casino/LIVECASINO" element={<CbLayout><CbCasinoLobby lobbyId="LIVECASINO" /></CbLayout>} />
      <Route path="/casino/INTERNATIONALCASINO" element={<CbLayout><CbCasinoLobby lobbyId="INTERNATIONALCASINO" /></CbLayout>} />
      <Route path="/casino/SLOT" element={<CbLayout><CbCasinoLobby lobbyId="SLOT" /></CbLayout>} />
      <Route path="/gamedetails/:sid/:gmid" element={<DetailRoute />} />

      {/* Everything else still renders in the old chrome. */}
      <Route path="/*" element={<MainLayout />} />
    </Routes>
    </>
  );
}

export default App;
