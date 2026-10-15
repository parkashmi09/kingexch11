import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';

/* Renders <a href="javascript:void(0)"> exactly like the reference — React
   blocks javascript: URLs passed as props, so the attribute is set via ref. */
function VoidLink({ children, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.setAttribute('href', 'javascript:void(0)');
  }, []);
  return <a ref={ref} {...props}>{children}</a>;
}
import { useSelector, useDispatch } from 'react-redux';
import { logout, fetchBalanceThunk, subscribeToRealTimeUpdates, setDemoUser } from '../../redux/userSlice';
import { getSocket, requestBalanceUpdate } from '../../apiservices/authService';
import { isDemoUser } from '../../utils/demoStore';
import SetButtonValueModal from '../modals/SetButtonValueModal';
import ChangePasswordModal from '../modals/ChangePasswordModal';
import MyMarketModal from '../modals/MyMarketModal';
import { RacingSportsMenu, EventsSportsTree } from './SidebarTreeMenus';

const AVIATOR_SVG = (
  <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 457.6 277.4">
    <g id="Layer_1-2" data-name="Layer 1">
      <g>
        <path d="M61.85,273.4c-1.8-3.5-2.3-3.9-4-3-3.2,1.7-5.5,1.1-9-2.5l-3.3-3.4,4.4-1.9c2.4-1.1,8-2.2,12.4-2.6,27.1-2.5,84.1-19.2,161-47.1,32.1-11.7,80.4-30.1,81.3-31,1.2-1.2-1-1.5-11.9-1.7-10.6-.2-11.7,0-16.5,2.4-13.1,6.8-74.6,31.2-92.8,36.7l-6.9,2.1-6.4-5-6.5-4.9-3.6,1.5c-21.3,9-88,36.4-89.2,36.6-1,.2-1.6-.6-1.8-2.3-.3-2.4.5-3,7.8-6.9,4.5-2.3,7.9-4.5,7.5-4.8-.3-.4-4.3-.9-8.9-1.3-9.7-.8-17.3-4-28.2-11.9-4.8-3.5-7.8-5-10-5-4.3,0-6.4.9-6.4,2.7,0,.8,6.8,8.7,15.1,17.6,13,13.7,14.9,16.2,13.3,16.8-3.7,1.5-4.8.8-16.3-10.3-6.4-6.2-14.6-14.2-18.3-17.7l-6.7-6.5-8.8,4.2-8.8,4.2-.3-3.4c-.2-2,.2-4.4.8-5.5s6.5-4.8,13.1-8.2c11.8-6,14.2-8,12.2-10-.7-.7-4.1.5-10.2,3.5l-9.1,4.6v-2.5c0-2,1.4-3.3,7.7-7,10.3-6,17.3-8.1,22.3-6.6,2.1.6,10.7,6.3,19.1,12.6,19,14.3,29.4,19.9,35.9,19.2,5.3-.5,34-13.7,61.9-28.5,18.3-9.7,21.6-12.1,19.5-14.2-.7-.7-7.1,1.8-21.4,8.5-14.7,7-20.5,9.3-21.1,8.4-1.2-2-.1-3.3,5.6-6.3,3-1.6,5.5-3.4,5.5-4,0-.7-1.3-2.5-2.8-4l-2.9-2.7-19.8,9.6c-10.9,5.2-20,9.3-20.2,9.1-.8-.7,2.5-12.8,3.8-14.1.8-.8,9.5-5.6,19.4-10.8,17.7-9.4,18-9.6,17.8-12.7,0-1.7-.4-3.4-.7-3.7s-3.9.9-8,2.7l-7.4,3.3-8.9-9.3c-4.8-5.1-8.9-9.6-9.1-10-.5-1.4,8.8-7.9,14.6-10.1,10.4-4,10.9-3.9,118.5,11.3,35.6,5,65.5,9.7,66.5,10.4,1.6,1.1,1.6,1.4-.1,4.8l-1.7,3.7,2.8,1c1.5.5,5.8,2.1,9.5,3.6l6.9,2.5,10.1-4.3c12.4-5.2,32.9-15.6,45.6-23.2l9.4-5.5,3.2,2.4c3.2,2.4,6.9,3.1,7.9,1.6.3-.5-2.5-6.9-6.3-14.3-3.7-7.4-8.7-18.4-11-24.4-2.4-6.1-4.8-11.6-5.4-12.4-.9-1-3.3-1.2-10.7-.8-10.8.5-18.1,2.6-42,12-15.4,6-67.7,31.5-70.6,34.4-1.3,1.4-3.4,1.4-19.2-.1-9.7-.9-18-1.6-18.4-1.6-1.4,0-.8-5.5,1.1-9.7,1.6-3.4,3.9-5.4,14-12.1,14.3-9.5,28.2-16.5,37.4-18.9l6.5-1.7,9.9,3.9c14.3,5.6,16.3,5.6,39.8-1,38.2-10.6,43.5-11.8,52.2-11.9,8-.1,8.3,0,11.6,3.3,2.6,2.5,5.7,8.3,12,23,4.7,10.8,9,21.3,9.7,23.5,1.7,5.4.8,11.9-2.4,16-6.7,8.8-38,25.2-82.1,42.8-22.8,9.1-61.8,21.9-162.5,53.3-31.1,9.7-64.7,20.3-74.6,23.6-10,3.2-18.9,5.9-19.8,5.9-.8,0-2.5-1.8-3.6-4ZM291.35,168.4c3.8-2.3,7.1-6.9,5.8-8-.6-.5-144.9-20.8-158.8-22.3-1.2-.1-2,.4-2,1.3,0,1.2,15.5,4.6,72,16.1,39.6,8.1,73.7,14.7,75.9,14.8,2.3.1,5.2-.7,7.1-1.9h0ZM247.65,122c4.2-2.3,11.2-5.8,15.4-7.7,4.3-1.9,7.8-3.7,7.8-4.1s-2.8-1.3-6.2-2c-7.7-1.7-13.7-.9-22.4,3.3-6.7,3.1-18.9,11.7-18.1,12.6.6.5,9.3,1.9,13.5,2.2,1.3,0,5.8-1.9,10-4.3h0ZM282.15,115.8c7.5-3.8,10.7-6,10.5-7.1-.4-2.1-18.3-9.2-23.4-9.3-2.2,0-4.9.6-6,1.4q-2.1,1.6,10.4,6.5c2.6,1,4.8,2.3,5,2.9s-1.9,2.2-4.7,3.6c-5.5,2.8-6.6,4-5.7,6.1.8,2.3,2.3,1.9,13.9-4.1h0Z" className="cls-1"></path>
        <path d="M440.55,196.2c-6.8-10.1-13.5-20.3-14.9-22.8-1.5-2.5-5.5-14.1-9.1-25.7l-6.5-21.3,5.1-5c2.7-2.8,5.1-4.9,5.2-4.8.1.2,5.2,9.4,11.4,20.6,11.9,21.3,15.8,31,23.1,58,3.3,11.9,3.3,12.3,1.7,15.7-.9,1.9-2.1,3.5-2.6,3.5s-6.5-8.2-13.4-18.2h0ZM454.65,206.5c.2-1.9-.5-4.6-1.7-6.7-1.8-3.1-22-30.4-24.3-32.9-1.2-1.3-3,1.5-2.2,3.5,1.2,3.4,26,39.9,26.9,39.6.6-.1,1.1-1.7,1.3-3.5h0Z" className="cls-1"></path>
        <path d="M295.35,148.3c-13.2-2.6-24.6-4.9-25.4-5.1-.8-.2,11.3-5.4,27-11.6l28.3-11.4,5.3,5.9c2.9,3.2,5.2,6.3,5.3,6.9,0,.6-2.3,5.5-5.1,10.8-4.8,9.1-5.2,9.6-8.2,9.5-1.8-.1-14-2.3-27.2-5h0Z" className="cls-1"></path>
        <path d="M334.85,152.1c0-.2,1.6-3.6,3.6-7.5,1.9-4,4.1-9,4.9-11.1l1.3-3.8-5.3-6.9c-5.3-6.8-5.4-6.9-3.2-8.1,2-1.1,2.6-.8,6.2,3.2,2.2,2.5,4.3,4.5,4.6,4.5s1.7-3.9,3-8.7l2.4-8.8.3,4.9c.2,2.6-.2,8-.8,11.8l-1,7,5.1,6.4,5.1,6.4-2.7,1c-2.2.9-2.9.6-5-1.8-1.3-1.5-2.5-3-2.5-3.4-.1-2.3-1.9-.1-3.9,4.6-1.2,3-2.8,5.9-3.5,6.5-1.4,1.1-8.6,4.3-8.6,3.8h0Z" className="cls-1"></path>
        <path d="M404.75,114.7c-7.2-16.1-7.3-16.4-5.8-17.5,1.5-1,21.2-.4,24.2.7.9.4,1.7,1.4,1.7,2.2,0,4.2-12.6,21.3-15.6,21.3-.9,0-2.8-2.9-4.5-6.7h0ZM414.15,104.7c4.8-2,8.7-4,8.7-4.4,0-1.2-4.4-1.9-13.2-1.9-8.2,0-8.8.1-8.8,2,0,2.4,2.7,8,3.8,8,.4,0,4.6-1.6,9.5-3.7Z" className="cls-1"></path>
        <path d="M385.05,75.9c-10.7-19.1-14-27.3-20.7-51.6-4-14.3-4.3-18.7-1.6-22l1.9-2.3,14.8,22.3,14.8,22.3,7.6,24.2c4.2,13.2,7.4,24.2,7.1,24.3-.3.1-3.5.3-7.1.6l-6.5.4-10.3-18.2h0ZM391.85,46.5c0-1.5-23.2-37.5-26.1-40.6-1.3-1.3-2.9,1.2-2.9,4.7,0,2.5,8.8,15.4,22.3,32.7,4.6,6,6.7,7,6.7,3.2Z" className="cls-1"></path>
      </g>
    </g>
  </svg>
);

// Casino menu — labels and order copied from the reference drawer; hrefs mapped
// to our registered casino routes (unregistered ones keep the reference slug).
const CASINO_MENU = [
  ['Teenpatti 1-day', '/casino/teen'],
  ['20-20 Teenpatti', '/casino/teen20'],
  ['Teenpatti Test', '/casino/teenpattitest'],
  ['Teenpatti Open', '/casino/teenpattiopen'],
  ['Poker 1-Day', '/casino/pokeroneday'],
  ['20-20 Poker', '/casino/poker20'],
  ['Poker 6 Players', '/casino/poker6player'],
  ['Baccarat', '/casino/baccarat'],
  ['Baccarat 2', '/casino/baccarat2'],
  ['20-20 Dragon Tiger', '/casino/dt20'],
  ['1 Day Dragon Tiger', '/casino/dt6'],
  ['20-20 D T L', '/casino/dtl20'],
  ['20-20 Dragon Tiger 2', '/casino/dt202'],
  ['32 Cards A', '/casino/card32'],
  ['32 Cards B', '/casino/card32eu'],
  ['Andar Bahar', '/casino/ab20'],
  ['Andar Bahar 2', '/casino/abj'],
  ['Lucky 7 - A', '/casino/lucky7'],
  ['Lucky 7 - B', '/casino/lucky7eu'],
  ['3 Cards Judgement', '/casino/3cardj'],
  ['Casino War', '/casino/war'],
  ['Worli Matka', '/casino/worli'],
  ['Instant Worli', '/casino/worli2'],
  ['Amar Akbar Anthony', '/casino/aaa'],
  ['Bollywood Casino', '/casino/btable'],
  ['Lottery', '/casino/lottcard'],
  ['5Five Cricket', '/casino/cricketv3'],
  ['Cricket Match 20-20', '/casino/cmatch20'],
  ['Casino Meter', '/casino/cmeter'],
  ['Teenpatti - 2.0', '/casino/teen6'],
  ['Queen', '/casino/queen'],
  ['Race20', '/casino/race20'],
  ['Lucky 7 - C', '/casino/lucky7eu2'],
  ['Super Over', '/casino/superover'],
  ['The Trap', '/casino/trap'],
  ['2 Cards Teenpatti', '/casino/teenpatti2cards'],
  ['29Card Baccarat', '/casino/29cardbaccarat'],
  ['Muflis Teenpatti', '/casino/teenmuf'],
  ['Race To 17', '/casino/raceto17'],
  ['20-20 Teenpatti B', '/casino/teenpattit20b'],
  ['Trio', '/casino/trio'],
  ['Note Number', '/casino/notenum'],
  ['1 CARD 20-20', '/casino/1card2020'],
  ['1 CARD ONE-DAY', '/casino/1card1day'],
  ['ANDAR BAHAR 50 cards', '/casino/ab3'],
  ['Amar Akbar Anthony 2', '/casino/aaa2'],
  ['Race to 2nd', '/casino/race2'],
  ['Instant Teenpatti', '/casino/instantteenpatti'],
  ['Dus ka Dum', '/casino/dum10'],
  ['1 Card Meter', '/casino/cmeter1'],
  ['Instant Teenpatti 2.0', '/casino/instantteenpatti2'],
  ['Ball by Ball', '/casino/ballbyball'],
  ['Sic Bo', '/casino/sicbo'],
  ['Instant Teenpatti 3.0', '/casino/instantteenpatti3'],
  ['Sic Bo2', '/casino/sicbo2'],
  ['Jack Top Open Teenpatti', '/casino/teen42'],
  ['Queen Top Open Teenpatti', '/casino/teen41'],
  ['Super Over2', '/casino/superover2'],
  ['Lucky 15', '/casino/lucky15'],
  ['ANDAR BAHAR 150 cards', '/casino/ab4'],
  ['Goal', '/casino/goal'],
  ['Mini Superover', '/casino/superover3'],
  ['Unique Roulette', '/casino/ourroullete'],
  ['Bollywood Casino 2', '/casino/bollywoodtable2'],
  ['20-20 Teenpatti C', '/casino/teen20c'],
  ['Unlimited Joker Oneday', '/casino/jokerteenpatti1'],
  ['Teenpatti Joker 20-20', '/casino/jokerteenpatti20'],
  ['Unlimited Joker 20-20', '/casino/jokerteenpatti120'],
  ['Teenpatti Poison 20-20', '/casino/poison20'],
  ['Unique Teenpatti', '/casino/teenunique'],
  ['Teenpatti Poison One Day', '/casino/poison'],
  ['Golden Roulette', '/casino/roulette11'],
  ['Roulette', '/casino/roulette13'],
  ['Beach Roulette', '/casino/roulette12'],
  ['Lucky 6', '/casino/lucky5'],
  ['20-20 Teenpatti VIP1', '/vip-casino/teen20v1'],
  ['Mogambo', '/casino/mogambo'],
  ['Dolidana', '/casino/dolidana'],
  ['V VIP Teenpatti 1-day', '/casino/teen62'],
  ['Matka', '/casino/worli3'],
  ['Goal 2', '/casino/goal2'],
];

function MobileSidebar({ open, onClose, width = '100%' }) {
  const [casinoOpen, setCasinoOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(true);
  // Casino list renders only for logged-in users (real or demo) — logged OUT
  // the accordion still opens/closes (plus/minus works) but shows no items.
  const isAuth = useSelector((s) => s.user.isAuthenticated);

  // True accordion: only ONE section (Casino / Events) open at a time —
  // opening one closes the other. Logged OUT the casino list is empty, so
  // its +/- toggle must NOT disturb Events (Events stays open).
  const toggleCasino = () => {
    setCasinoOpen((o) => {
      const next = !o;
      if (next && isAuth) setEventsOpen(false);
      return next;
    });
  };
  const eventsHeadRef = useRef(null);
  const casinoBodyRef = useRef(null);
  // Bootstrap's own collapse animation state: while true the casino body
  // carries the `.collapsing` class (height:0, overflow:hidden, transition
  // height .35s ease — bootstrap.min.css) so the fold-up animates exactly
  // like the reference. Driven via React state so re-renders can't clobber it.
  const [casinoCollapsing, setCasinoCollapsing] = useState(false);

  // Route change resets ONLY the internal child states (the expanded
  // sport/competition nodes inside the trees) via a remount key — the
  // Casino/Events accordion itself is left untouched.
  const location = useLocation();

  const toggleEvents = () => {
    const next = !eventsOpen;
    if (!next) { setEventsOpen(false); return; }
    setEventsOpen(true);
    const body = casinoBodyRef.current;
    if (!(isAuth && casinoOpen) || !body) {
      setCasinoOpen(false);
      return;
    }
    // Bootstrap collapse sequence: pin the current height inline, switch to
    // `.collapsing`, then release the inline height so the class's height:0
    // transitions smoothly — everything below scrolls up frame by frame.
    body.style.height = `${body.scrollHeight}px`;
    setCasinoCollapsing(true);
    requestAnimationFrame(() => {
      void body.offsetHeight; // commit the start height
      body.style.height = '';
    });
    setTimeout(() => {
      body.style.height = '';
      setCasinoCollapsing(false);
      setCasinoOpen(false);
    }, 360);
  };
  // Slide-in effect: the panel animates `left` (-100% -> 0) on its own;
  // display:none on the wrapper is applied only after the slide-out ends,
  // otherwise the transition can never play.
  const [visible, setVisible] = useState(open);
  const [slid, setSlid] = useState(open);

  useEffect(() => {
    if (open) {
      setVisible(true);
      // Wait one paint so the browser registers the off-screen start position,
      // otherwise the slide-in transition never plays.
      const t = setTimeout(() => setSlid(true), 60);
      return () => clearTimeout(t);
    }
    setSlid(false);
    const t = setTimeout(() => {
      setVisible(false);
      // Reset to the INITIAL accordion state (Events expanded, Casino
      // collapsed) AFTER the drawer has closed — doing it on open would
      // relayout the huge tree mid-slide and stutter the animation.
      setEventsOpen(true);
      setCasinoOpen(false);
    }, 300);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <>
      {/* b-sidebar-outer wrapper — matches reference wrapper.txt; the focus-trap
          tabindex divs exist only while the drawer is open (BootstrapVue behavior) */}
      <div tabIndex={-1} className="b-sidebar-outer">
        {visible && <div tabIndex={0}></div>}
        <div
          id="sidebar-border"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          className="b-sidebar shadow bg-light text-dark d-none-desktop"
          style={visible
            ? { width, transform: slid ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease-out' }
            /* Closed: keep the (huge) drawer LAID OUT off-screen instead of
               display:none — opening then only animates the transform
               (compositor-only) with no synchronous relayout of the whole
               tree, so the slide never stutters. */
            : { width, transform: 'translateX(-100%)', visibility: 'hidden' }}
          aria-hidden={open ? undefined : 'true'}
        >
          <header className="b-sidebar-header">
            <span></span>
            <button
              type="button"
              aria-label="Close"
              className="close text-dark"
              onClick={onClose}
            >
              <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img" aria-label="x" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi-x b-icon bi">
                <g><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></g>
              </svg>
            </button>
          </header>

          <div className="b-sidebar-body">
            <div id="sidebar-left-mo" className="sidebar-left">

              {/* Menu top bar */}
              <div className="menu-top">
                <div className="float-left home-icon">
                  <VoidLink onClick={onClose}>
                    <i className="fas fa-home"></i>
                  </VoidLink>
                </div>
                <div className="float-left logo">
                  <VoidLink onClick={onClose}>
                    <img src="/assets/brand/logo.png" className="img-fluid" alt="TENEXCH" />
                  </VoidLink>
                </div>
                <div className="float-right m-r-10 close-icon" onClick={onClose}>
                  <i className="fa fa-times"></i>
                </div>
              </div>

              <div className="menu-scrolable">

                {/* Racing Sports — dynamic race lists from the shared tree */}
                <RacingSportsMenu key={`race-${location.pathname}`} onNavigate={onClose} mobile />

                {/* Casino + Events */}
                <div id="accordionExample" className="menu-box accordion">

                  {/* Casino */}
                  <h5
                    data-toggle="collapse"
                    data-target="#showCasino"
                    className="text-yellow pl-2"
                    onClick={toggleCasino}
                  >
                    <u>Casino</u>
                    <i className={`float-right fas mr-1 ${casinoOpen ? 'fa-times' : 'fa-plus'}`} />
                  </h5>
                  <div
                    id="showCasino"
                    ref={casinoBodyRef}
                    data-parent="#accordionExample"
                    className={casinoCollapsing ? 'collapsing' : `accordion-collapse collapse${casinoOpen ? ' show' : ''}`}
                  >
                    <div className="all-menu">
                      {/* Logged OUT: the accordion opens but the list is empty —
                          casino items render only for logged-in (real/demo) users */}
                      <ul className="navbar-nav">
                        {isAuth && CASINO_MENU.map(([label, path]) => (
                          <li className="nav-item dropdown dropright" key={path}>
                            <Link to={path} className="" onClick={onClose}>
                              <span className="sport-name">{label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Events */}
                  <h5
                    ref={eventsHeadRef}
                    data-toggle="collapse"
                    data-target="#showEvent"
                    className="text-yellow pl-2"
                    onClick={toggleEvents}
                  >
                    <u>Events</u>{' '}
                    <i className={`float-right fas mr-1 ${eventsOpen ? 'fa-times' : 'fa-plus'}`} />
                  </h5>
                  <div
                    className={`sports-list-content accordion-collapse collapse${eventsOpen ? ' show' : ''}`}
                    id="showEvent"
                    data-parent="#accordionExample"
                  >
                    <div className="all-menu">
                      {/* Sport → Competition → Match tree; navigating closes the drawer */}
                      <EventsSportsTree key={`events-${location.pathname}`} onNavigate={onClose} />
                    </div>
                  </div>

                </div>{/* end #accordionExample */}

              </div>
            </div>
          </div>
        </div>
        {visible && <div tabIndex={0}></div>}

        {/* Backdrop — last child of b-sidebar-outer, behind the panel */}
        <div
          className="b-sidebar-backdrop bg-dark"
          style={open ? {} : { display: 'none' }}
          onClick={onClose}
        ></div>
      </div>
    </>
  );
}

function MobileUserSidebar({ open, onClose, username, balance, exposure, onLogout, onSetButtonValue, onChangePassword, isDemo = false }) {
  // Same left-to-right slide as the menu drawer (see MobileSidebar).
  const [visible, setVisible] = useState(open);
  const [slid, setSlid] = useState(open);

  // Heading reads "Menu casino" only while one of the drawer's own routes
  // (report pages / security auth) is active — plain "Menu" everywhere else.
  const location = useLocation();
  const onDrawerRoute =
    location.pathname.startsWith('/report/') || location.pathname.startsWith('/settings/');

  useEffect(() => {
    if (open) {
      setVisible(true);
      const t = setTimeout(() => setSlid(true), 60);
      return () => clearTimeout(t);
    }
    setSlid(false);
    const t = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <>
      <div tabIndex={-1} className="b-sidebar-outer">
        <div
          id="sidebar-border-right"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          className="b-sidebar shadow bg-light text-dark d-none-desktop"
          style={visible
            ? { width: '100%', transform: slid ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease-out' }
            : { width: '100%', display: 'none' }}
          aria-hidden={open ? undefined : 'true'}
        >
          <header className="b-sidebar-header">
            <span></span>
            <button type="button" aria-label="Close" className="close text-dark" onClick={onClose}>
              <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img" aria-label="x" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi-x b-icon bi">
                <g><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></g>
              </svg>
            </button>
          </header>
          <div className="b-sidebar-body">
            <div id="sidebar-left-mo" className="sidebar-left">
              <div className="menu-top">
                <div className="float-left home-icon">
                  <VoidLink onClick={onClose}><i className="fas fa-home"></i></VoidLink>
                </div>
                <div className="float-left logo">
                  <VoidLink onClick={onClose}>
                    <img src="/assets/brand/logo.png" className="img-fluid" alt="TENEXCH" />
                  </VoidLink>
                </div>
                <div className="float-right m-r-10 close-icon" onClick={onClose}><i className="fa fa-times"></i></div>
              </div>
              <div className="menu-scrolable">
                <div>
                  <span className="ml-2"><b>{username}</b></span>
                  <div className="ml-2">
                    <b>Balance: </b><span>{balance}</span>
                    {' | '}
                    <span><b>Exposure:</b> {exposure}</span>
                  </div>
                </div>
                <div className="menu-box">
                  <h5 className="text-yellow pl-2"><u>{onDrawerRoute ? 'Menu casino' : 'Menu'}</u></h5>
                  {/* Reference (Vue) marks the active route's link with
                      router-link-exact-active/router-link-active — the menu
                      CSS bolds it. NavLink reproduces that per current route. */}
                  {/* Demo mode (reference): only Account Statement, Current Bets,
                      Casino Results and Set Button Value are shown */}
                  <ul className="navbar-nav">
                    {[
                      ['/account-statement', 'Account Statement'],
                      ['/report/currentbets', 'Current Bets'],
                      ['/activity-log', 'Activity Log'],
                      ['/report/casinoresult', 'Casino Results'],
                      ['/report/livecasinoresult', 'Live Casino Bets'],
                      ['/report/sportbookresult', 'SportBook Bets'],
                    ]
                      .filter(([to]) => !isDemo || ['/account-statement', '/report/currentbets', '/report/casinoresult'].includes(to))
                      .map(([to, label]) => (
                        <li key={to}>
                          <NavLink
                            to={to}
                            onClick={onClose}
                            className={({ isActive }) => (isActive ? 'router-link-exact-active router-link-active' : '')}
                          >
                            {label}
                          </NavLink>
                        </li>
                      ))}
                    <li><VoidLink onClick={() => onSetButtonValue()}>Set Button Value</VoidLink></li>
                    {!isDemo && (
                      <>
                        <li><VoidLink onClick={() => onChangePassword()}>Change Password</VoidLink></li>
                        <li>
                          <NavLink to="/settings/secureauth" onClick={onClose} className={({ isActive }) => (isActive ? 'router-link-exact-active router-link-active' : '')}>
                            Security Auth Verification
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/report/fraud-report" onClick={onClose} className={({ isActive }) => (isActive ? 'router-link-exact-active router-link-active' : '')}>
                            Fraud Report
                          </NavLink>
                        </li>
                      </>
                    )}
                  </ul>
                  <div className="login-seperator"></div>
                  <VoidLink className="text-danger ml-2" onClick={onLogout}><b>Logout</b></VoidLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop — last child of b-sidebar-outer, behind the panel */}
        <div
          className="b-sidebar-backdrop bg-dark"
          style={open ? {} : { display: 'none' }}
          onClick={onClose}
        ></div>
      </div>
    </>
  );
}

/* HeaderTop — the top nav bar, direct child of .wrapper */
function HeaderTop() {
  const location = useLocation();
  const isAuth = useSelector((state) => state.user.isAuthenticated);
  // The casino list carries its own search (the magnifier beside its category
  // tabs), so a signed-in player on /o_casino would be looking at two search
  // boxes for two different things. Drop the nav one there and leave the
  // page's own. Signed OUT keeps it: the logged-out list is a different
  // layout and the reference still shows the nav search.
  //
  // No breakpoint test needed — responsive.css hides .header-top outright
  // below desktop, so this whole bar (and its search) is desktop-only already.
  const hideSearch = isAuth && location.pathname.startsWith('/o_casino');
  return (
    <div className="header-top">
      <ul>
        <li>
          <Link to="/crash" className="aviator">
            {AVIATOR_SVG}
            <span className="ml-1">Crash</span>
          </Link>
        </li>
        {/* Sports Book points at /login — a dead end once you ARE logged in
            (App.jsx bounces a direct hit on /login back to home), so it only
            shows to signed-out visitors. */}
        {!isAuth && <li><Link to="/login">Sports Book</Link></li>}
        {/* Lottery has no catalogue of its own — signed in it lands on
            /allsport-highlight/66104 (the reference's own id), signed out it sends you to
            login like the other gated entries. NavLink so the yellow active pill
            lights on the page, same as Exchange / Live Casino / Slot. */}
        <li>
          {isAuth ? (
            <NavLink to="/allsport-highlight/66104" className={({ isActive }) => isActive ? 'router-link-exact-active router-link-active' : ''}>
              Lottery
            </NavLink>
          ) : (
            <Link to="/login">Lottery</Link>
          )}
        </li>
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'router-link-exact-active router-link-active' : ''}>
            Exchange
          </NavLink>
        </li>
        {/* NavLink, not Link — the yellow active pill is
            `.header-top ul li a.router-link-exact-active` (ten-custom.css), a
            class only NavLink sets. As a plain Link this read as unselected on
            /o_casino and only lit up on hover. Same pattern as Exchange above. */}
        <li>
          <NavLink to="/o_casino" className={({ isActive }) => isActive ? 'router-link-exact-active router-link-active' : ''}>
            Live Casino
          </NavLink>
        </li>
        {/* Same NavLink treatment as Live Casino above — /o_slot is a real
            route now, so it has to be able to light its own active pill. */}
        <li>
          <NavLink to="/o_slot" className={({ isActive }) => isActive ? 'router-link-exact-active router-link-active' : ''}>
            Slot
          </NavLink>
        </li>
        <li><Link to="/o_fantasy">Fantasy Games</Link></li>
        {!hideSearch && (
          <div className="search-box-container">
            <div className="search-box float-right">
              <input type="text" name="" placeholder="Search" className="search_input" />
            </div>
          </div>
        )}
      </ul>
      <div className="depo-withdraw-btn"></div>
    </div>
  );
}

/* MainHeader — the fixed header bar, goes INSIDE .main-container */
function MainHeader({ extraClass = '' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileUserOpen, setMobileUserOpen] = useState(false);
  // Stable close callback: the drawer's tree menus are memoized on it — an
  // inline arrow here would re-render thousands of tree nodes every render.
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const [userDropdown, setUserDropdown] = useState(false);
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [showMyMarket, setShowMyMarket] = useState(false);
  // Ghost-click guard: the tap on the Demo button lands again on the Bal:/
  // username elements that replace it after the auth flip — which would pop
  // the user sidebar open. Ignore sidebar-open clicks briefly after demo login.
  const demoClickTs = useRef(0);
  const demoBusyRef = useRef(false);
  const openUserSidebar = () => {
    if (Date.now() - demoClickTs.current < 1200) return;
    setMobileUserOpen(true);
  };
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  // Reference uses a narrower (80%) menu drawer on report/settings pages
  const isReportPage = location.pathname.startsWith('/report/') || location.pathname.startsWith('/settings/');
  const isDetailPage = location.pathname.startsWith('/gamedetails') || location.pathname.startsWith('/tp-virtual-cricket/');
  const drawerWidth = isReportPage ? '80%' : '100%';

  const { user, isAuthenticated, balance, exposure } = useSelector((state) => state.user);
  const isAuth = isAuthenticated;

  // Belt & braces: whenever the auth state flips (demo/real login or logout),
  // arm the same guard and force the drawer closed — no path can pop it open
  // as a side effect of the header re-rendering under the user's finger.
  const prevAuthRef = useRef(isAuth);
  useEffect(() => {
    if (prevAuthRef.current !== isAuth) {
      prevAuthRef.current = isAuth;
      demoClickTs.current = Date.now();
      setMobileUserOpen(false);
    }
  }, [isAuth]);
  const username = user?.username || user?.name || 'User';
  const displayBalance = balance ?? 0;
  const displayExposure = exposure ?? 0;

  // Fetch balance on mount when authenticated (demo mode is client-side only —
  // its balance/exposure live in redux/localStorage, no API, no socket).
  // Real-time flow: the socket pushes balanceUpdate events; a 2s heartbeat
  // (a) re-arms the subscription if it never attached (uid arrived late,
  //     socket wasn't up yet — the thunk rejects in that case and retries here),
  // (b) asks the server for a fresh push over the socket, and
  // (c) falls back to the REST fetch while the socket is disconnected —
  // so the header balance/exposure can never go stale until refresh.
  const uid = user?.user_id || user?.id || user?._id;
  useEffect(() => {
    if (!isAuth) return;
    const token = localStorage.getItem('token');
    if (!token || token === 'demo-token') return;
    dispatch(fetchBalanceThunk(token));
    dispatch(subscribeToRealTimeUpdates());
    const iv = setInterval(() => {
      dispatch(subscribeToRealTimeUpdates()); // no-op when already attached
      const s = getSocket();
      if (s?.connected && uid) requestBalanceUpdate(uid);
      else dispatch(fetchBalanceThunk(token));
    }, 2000);
    return () => clearInterval(iv);
  }, [isAuth, uid, dispatch]);

  const handleLogout = () => {
    // Flag the logout so Home runs its post-logout sequence even when we're
    // logging out from another page (Home mounts fresh and never sees the auth
    // flip). Home consumes and clears this on mount.
    sessionStorage.setItem('justLoggedOut', '1');
    dispatch(logout());
    navigate('/', { replace: true });
  };

  return (
    <header className={`header${extraClass ? ` ${extraClass}` : ''}`}>
      {/* Mobile: back arrow on all pages except home, hamburger on home.
          Exception: logged-OUT game-details shows the hamburger (menu drawer),
          not the back arrow. */}
      {!isHomePage && !(isDetailPage && !isAuth) ? (
        <Link to="/" className="d-none-desktop" style={{ display: 'inline-block' }}>
          <div className="d-none-desktop d-inline-block top-home-icon">
            <i className="fa fas fa-chevron-left"></i>
          </div>
        </Link>
      ) : (
        <div
          className="menu-button-mobile d-none-desktop"
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          <span className="menu-button-bar"></span>
          <span className="menu-button-bar"></span>
          <span className="menu-button-bar"></span>
        </div>
      )}

      {/* Logo — reference (Vue) marks the active route on this anchor */}
      <div className="logo">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? 'router-link-exact-active router-link-active' : '')}
        >
          <img src="/assets/brand/logo.png" className="img-fluid" alt="TENEXCH" />
        </NavLink>
      </div>

      {/* Mobile sidebar — right (user menu, after login); reference renders it
          directly after the logo, before the left menu drawer */}
      {isAuth && (
        <MobileUserSidebar
          open={mobileUserOpen}
          onClose={() => setMobileUserOpen(false)}
          username={username}
          balance={displayBalance}
          exposure={displayExposure}
          onLogout={handleLogout}
          onSetButtonValue={() => setShowButtonModal(true)}
          onChangePassword={() => setShowChangePwd(true)}
          isDemo={isDemoUser(user) && localStorage.getItem('token') === 'demo-token'}
        />
      )}

      {/* Mobile sidebar — left (navigation) */}
      <MobileSidebar open={mobileMenuOpen} onClose={closeMobileMenu} width={drawerWidth} />

      {/* News ticker */}
      <div className="news-bar">
        <img src="/assets/icons/news-icon.png" alt="news" />
        <div className="marquee-wrapper">
          <div className="marquee-content" style={{ animationDuration: '6.90667s' }}>
            Welcome to new version of TENEXCH, Enjoy more services...
          </div>
        </div>
        <div className="news-title"></div>
      </div>

      {/* Header right — auth-aware */}
      <div className="float-right header-right">
        {isAuth ? (
          <>
            {/* Desktop balance */}
            <div className="balance d-none-mobile">
              <div><b>Balance: </b><span>{displayBalance}</span></div>
              <div onClick={() => setShowMyMarket(true)} style={{ cursor: 'pointer' }}>
                <u><b>Exposure:</b> {displayExposure}</u>
              </div>
            </div>

            {/* Desktop username dropdown */}
            <div
              data-toggle="collapse"
              data-target="#user-dropdown"
              className={`username-info d-none-mobile${userDropdown ? '' : ' collapsed'}`}
              aria-expanded={userDropdown ? 'true' : 'false'}
              onClick={() => setUserDropdown(v => !v)}
            >
              <span className="username">{username}</span>
              <i className="fas fa-caret-down ml-1"></i>
              <div id="user-dropdown" className={`collapse user-dropdown${userDropdown ? ' show' : ''}`}>
                <Link to="/account-statement">Account Statement</Link>
                <Link to="/report/currentbets">Current Bets</Link>
                <Link to="/activity-log">Activity Log</Link>
                <Link to="/report/casinoresult">Casino Results</Link>
                <Link to="/report/livecasinoresult">Live Casino Bets</Link>
                <Link to="/report/sportbookresult">SportBook Bets</Link>
                <VoidLink onClick={() => { setUserDropdown(false); setShowButtonModal(true); }}>Set Button Value</VoidLink>
                <VoidLink onClick={() => { setUserDropdown(false); setShowChangePwd(true); }}>Change Password</VoidLink>
                <Link to="/settings/secureauth" onClick={() => setUserDropdown(false)}>Security Auth Verification</Link>
                <Link to="/report/fraud-report">Fraud Report</Link>
                <div className="login-seperator"></div>
                <VoidLink onClick={handleLogout}>Logout</VoidLink>
              </div>
            </div>

            {/* Mobile balance */}
            <div className="d-none-desktop bal-point" onClick={openUserSidebar}>
              Bal: <span>{displayBalance}</span>
            </div>

            {/* Mobile username */}
            <div className="username-info d-none-desktop" onClick={openUserSidebar}>
              <u onClick={(e) => { e.stopPropagation(); setShowMyMarket(true); }}>Exp: <span>{displayExposure}</span></u>
              <div className="d-inline-block">
                <u><span className="username">{username}</span></u>
              </div>
            </div>
          </>
        ) : (
          <div>
            <Link to="/login">
              <button className="btn btn-secondary">Login</button>
            </Link>
            {' '}
            <button
              type="button"
              className="btn btn-secondary btn-demo"
              onClick={() => {
                if (demoBusyRef.current) return;
                demoBusyRef.current = true;
                demoClickTs.current = Date.now();
                // Same post-login welcome banner as a real login (Home reads this flag)
                sessionStorage.setItem('showLoginPopup', 'true');
                // Swap the header 300ms AFTER the tap so any duplicate/synthetic
                // click from the same gesture still hits this (now inert) button
                // instead of the Bal:/username elements that replace it.
                setTimeout(() => {
                  dispatch(setDemoUser());
                  navigate('/', { replace: true });
                  demoBusyRef.current = false;
                }, 300);
              }}
            >
              Demo
            </button>
          </div>
        )}
      </div>

      {/* Mobile search */}
      <div className="search-box-container d-none-desktop">
        <div className="search-box float-left">
          <input type="text" name="" placeholder="Search" className="search_input" />
        </div>
      </div>

      <SetButtonValueModal show={showButtonModal} onClose={() => setShowButtonModal(false)} />
      <ChangePasswordModal show={showChangePwd} onClose={() => setShowChangePwd(false)} />
      <MyMarketModal
        show={showMyMarket}
        onClose={() => setShowMyMarket(false)}
        userId={user?.user_id || user?.id || user?._id}
      />
    </header>
  );
}

export { HeaderTop, MainHeader };
