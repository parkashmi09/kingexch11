import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RacingSportsMenu, EventsSportsTree } from './SidebarTreeMenus';

const CASINO_GAMES = [
  'Matka',
  'V VIP Teenpatti 1-day',
  'Dolidana',
  'Mogambo',
  '20-20 Teenpatti VIP1',
  'Lucky 6',
  'Beach Roulette',
  'Roulette',
  'Golden Roulette',
  'Teenpatti Poison One Day',
  'Unique Teenpatti',
  'Teenpatti Poison 20-20',
  'Andar Bahar',
  'Teen Patti',
  'Lucky 7',
  'Dragon Tiger',
  '32 Cards',
  'Hi Low',
  'Baccarat',
  'Poker',
];

function Sidebar() {
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

  return (
    <div className="sidebar-left d-none-mobile">
      {/* Racing Sports — always visible, no accordion */}
      <RacingSportsMenu />

      {/* Casino + Events share the same accordionExample parent */}
      <div id="accordionExample" className="menu-box accordion">
        {/* Casino accordion item */}
        <h5
          data-toggle="collapse"
          data-target="#showCasino"
          className="text-yellow pl-2"
          style={{ cursor: 'pointer' }}
          onClick={toggleCasino}
        >
          <u>Casino</u>
          <i className={`float-right fas text-white mr-1 ${casinoOpen ? 'fa-times' : 'fa-plus'}`} />
        </h5>
        <div
          id="showCasino"
          ref={casinoBodyRef}
          data-parent="#accordionExample"
          className={casinoCollapsing ? 'collapsing' : `accordion-collapse collapse${casinoOpen ? ' show' : ''}`}
        >
          <div className="all-menu">
            {/* Logged OUT: the accordion opens but the list is empty — casino
                items render only for logged-in (real/demo) users */}
            <ul className="navbar-nav">
              {isAuth && CASINO_GAMES.map((game) => (
                <li className="nav-item dropdown dropright" key={game}>
                  <a href="javascript:void(0);">
                    <span className="sport-name">{game}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Events accordion item — Sport → Competition → Match tree */}
        <h5
          ref={eventsHeadRef}
          data-toggle="collapse"
          data-target="#showEvent"
          className="text-yellow pl-2"
          style={{ cursor: 'pointer' }}
          onClick={toggleEvents}
        >
          <u>Events</u>{' '}
          <i className={`float-right fas text-white mr-1 ${eventsOpen ? 'fa-times' : 'fa-plus'}`} />
        </h5>
        <div
          className={`sports-list-content accordion-collapse collapse${eventsOpen ? ' show' : ''}`}
          id="showEvent"
          data-parent="#accordionExample"
        >
          <div className="all-menu">
            <EventsSportsTree />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
