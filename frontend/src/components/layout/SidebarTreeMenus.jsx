import { memo, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useSportsTree from '../../hooks/useSportsTree';

// gmid of the match whose game-details page is currently open (null elsewhere).
// Drives the reference behavior: the sidebar auto-expands the active match's
// sport + competition and marks its link active/aria-current.
function useActiveGmid() {
  const { pathname } = useLocation();
  const m = pathname.match(/^\/(?:gamedetails|tp-virtual-cricket)\/[^/]+\/([^/]+)/);
  return m ? m[1] : null;
}

// Shared sidebar menu blocks — used by BOTH the desktop sidebar (Sidebar.jsx)
// and the mobile drawer (Header's MobileSidebar). Both read the same module-
// cached /user/all/sports/tree data, so the tree is fetched ONCE no matter how
// many menus are mounted. Markup/classes mirror the reference (excpeted.txt)
// exactly; the same markup serves both views (the reference's mobile capture
// carries the identical classes — d-none-mobile icons etc.).

// Names shown until the tree's first response lands (reference order).
const FALLBACK_SPORT_NAMES = [
  'Politics', 'Cricket', 'Football', 'Tennis', 'Table Tennis', 'Badminton',
  'Esoccer', 'Basketball', 'Volleyball', 'Snooker', 'Ice Hockey', 'E Games',
  'Futsal', 'Handball', 'Kabaddi', 'Golf', 'Rugby League', 'Boxing',
  'Beach Volleyball', 'Mixed Martial Arts', 'MotoGP', 'Chess', 'Cycling',
  'Motorbikes', 'Athletics', 'Basketball 3X3', 'Sumo', 'Virtual sports',
  'Motor Sports', 'Baseball', 'Rugby Union', 'Darts', 'American Football',
  'Soccer', 'Esports', 'Boat Racing', 'Wrestling',
];

// "07/09/2026 11:40:00 PM" → "23:40"
function raceTime(sdatetime) {
  const d = new Date(sdatetime);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Virtual cricket competitions route to their own detail page (reference:
// /sport/tpVirtual | /sport/virtualcricket | /sport/virtualgame → here all
// map to /tp-virtual-cricket). Matched by competition name since the tree
// payload carries no iscc flag.
const VIRTUAL_COMP_NAMES = ['t5 xi', 't10 xi', 'virtual cricket league'];
function isVirtualComp(compName) {
  const n = String(compName || '').trim().toLowerCase();
  return VIRTUAL_COMP_NAMES.includes(n) || n.startsWith('dim cricket league');
}

function matchHref(m, compName) {
  if (Number(m.etid) === 4 && isVirtualComp(compName)) {
    return `/tp-virtual-cricket/${m.etid}/${m.gmid}`;
  }
  return `/gamedetails/${m.etid}/${m.gmid}`;
}

// Level 2 — competition: toggles its match list (level 3). Auto-opens when it
// contains the match whose game-details page is open (reference: li gets
// `show`, the active link gets router-link classes + aria-current).
const CompetitionNode = memo(function CompetitionNode({ comp, onNavigate, activeGmid }) {
  const [open, setOpen] = useState(false);
  const containsActive = !!activeGmid &&
    (comp.children || []).some((m) => String(m.gmid) === String(activeGmid));

  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  return (
    <li className={`text-dark${open ? ' show' : ''}`}>
      <a className="dropdown-item" onClick={() => setOpen((o) => !o)}>
        <i className={`far d-none-mobile ${open ? 'fa-minus-square' : 'fa-plus-square'}`} />{' '}
        <span className="ifTooltip">{comp.name}</span>
      </a>
      {/* Rendered only while open — keeping the full tree in the DOM made the
          drawer sluggish; closed nodes cost nothing this way. */}
      {open && (
        <ul className="dropdown-menu show">
          {(comp.children || []).map((m) => {
            const isActive = !!activeGmid && String(m.gmid) === String(activeGmid);
            return (
              <li className="text-dark" key={m.gmid}>
                <Link
                  to={matchHref(m, comp.name)}
                  className={`dropdown-item${isActive ? ' router-link-exact-active router-link-active active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={onNavigate}
                >
                  <span className="ifTooltip"><i className="fas fa-caret-right mr-1 d-none-mobile" />{m.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
});

// Level 1 — sport: each lives in its own <ul class="navbar-nav"> (reference DOM).
// Auto-opens when its subtree contains the active game-details match.
const SportNode = memo(function SportNode({ sport, onNavigate, activeGmid }) {
  const [open, setOpen] = useState(false);
  const containsActive = !!activeGmid &&
    (sport.children || []).some((c) =>
      (c.children || []).some((m) => String(m.gmid) === String(activeGmid))
    );

  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  return (
    <ul className="navbar-nav">
      <li className={open ? 'show' : ''}>
        <a className="dropdown-item dropdown-toggle" onClick={() => setOpen((o) => !o)}>
          <i className={`mr-1 d-none-mobile far ${open ? 'fa-minus-square' : 'fa-plus-square'}`} />{' '}
          <span className="sport-name ifTooltip">{sport.name}</span>
        </a>
        {/* Rendered only while open — keeping the full tree in the DOM made
            the drawer sluggish; closed sports cost nothing this way. */}
        {open && (
          <ul className="dropdown-menu show">
            {(sport.children || []).map((c) => (
              <CompetitionNode key={c.cid || c.name} comp={c} onNavigate={onNavigate} activeGmid={activeGmid} />
            ))}
          </ul>
        )}
      </li>
    </ul>
  );
});

// The Events accordion body: Sport → Competition → Match tree.
// `onNavigate` fires when a match link is clicked (mobile drawer closes itself).
// Memoized: the tree is thousands of DOM nodes — the drawer's own open/slide
// re-renders must not re-render it (callers pass a STABLE onNavigate).
export const EventsSportsTree = memo(function EventsSportsTree({ onNavigate }) {
  const { sports } = useSportsTree();
  const activeGmid = useActiveGmid();
  return (
    <span>
      {sports.length > 0
        ? sports.map((sport) => (
            <SportNode key={sport.etid ?? sport.name} sport={sport} onNavigate={onNavigate} activeGmid={activeGmid} />
          ))
        : FALLBACK_SPORT_NAMES.map((name) => (
            <ul className="navbar-nav" key={name}>
              <li className="">
                <a className="dropdown-item dropdown-toggle">
                  <i className="mr-1 d-none-mobile far fa-plus-square" />{' '}
                  <span className="sport-name ifTooltip">{name}</span>
                </a>
              </li>
            </ul>
          ))}
    </span>
  );
});

// Racing (Horse/Greyhound) — flat dropright menu of races with start times.
// The reference keeps the dropdown-menu ALWAYS in the DOM (race list included)
// and only toggles the `show` class + aria-expanded; the icon element exists
// on desktop but not in the mobile drawer capture.
function RacingItem({ sport, open, onToggle, onNavigate, mobile }) {
  const races = sport.children || [];
  const shown = open && races.length > 0;
  return (
    <li className={`nav-item dropdown dropright${shown ? ' show' : ''}`}>
      <a
        data-toggle="dropdown"
        aria-expanded={shown ? 'true' : 'false'}
        className={`dropdown-toggle sport${sport.etid}`}
        onClick={onToggle}
      >
        <span className="sport-name">{sport.name}</span>
      </a>
      {/* When open the reference (popper) inlines position:absolute so the menu
          overlays instead of pushing the list down; the reference CSS !important
          rules take over left/right/transform on desktop, and responsive.css
          forces position:relative on mobile — same net result as the real site. */}
      <div
        className={`dropdown-menu${shown ? ' show' : ''}`}
        x-placement={shown ? 'left-start' : undefined}
        style={shown ? { position: 'absolute', top: 0, left: 0, willChange: 'transform' } : undefined}
      >
        <h5>All {sport.name}</h5>
        <div className="horse-list-box">
          {races.map((r) => (
            <Link key={r.gmid} to={matchHref(r)} onClick={onNavigate}>
              <p className="dropdown-item d-inline-block">
                <span>{raceTime(r.sdatetime)}</span>{' '}
                <span className="ml-1">{r.name}</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </li>
  );
}

// The full "Racing Sports" block (heading + Horse/Greyhound dropdowns).
// Open menus close on any outside click (they overlay the page).
// Memoized like EventsSportsTree — callers must pass a STABLE onNavigate.
export const RacingSportsMenu = memo(function RacingSportsMenu({ onNavigate, mobile = false }) {
  const { racing } = useSportsTree();
  const [openEtid, setOpenEtid] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (openEtid == null) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenEtid(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [openEtid]);

  const racingList = racing.length > 0
    ? racing
    : [
        { etid: 10, name: 'Horse Racing', children: [] },
        { etid: 65, name: 'Greyhound Racing', children: [] },
      ];

  // Picking a race must fold the menu away. The outside-click listener above
  // can't do it — the race link lives INSIDE the menu — and the desktop
  // sidebar passes no onNavigate, so without this the dropdown stays open
  // over the race page it just opened.
  const handleNavigate = () => {
    setOpenEtid(null);
    if (onNavigate) onNavigate();
  };

  return (
    <div className="special-menu" ref={ref}>
      <h5 className="text-yellow pl-2">
        <u>Racing Sports</u>
      </h5>
      <ul className="navbar-nav">
        {racingList.map((sport) => (
          <RacingItem
            key={sport.etid}
            sport={sport}
            open={openEtid === sport.etid}
            onToggle={() => setOpenEtid((cur) => (cur === sport.etid ? null : sport.etid))}
            onNavigate={handleNavigate}
            mobile={mobile}
          />
        ))}
      </ul>
    </div>
  );
});
