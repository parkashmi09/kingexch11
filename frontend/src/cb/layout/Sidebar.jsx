import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { common } from '../assets';
import { SPORT_NAV, CASINO_NAV, iconSrc } from '../navItems';
import { useSportTab } from '../useSportTab';
import useSportsTree from '../../hooks/useSportsTree';
import SideTree from './SideTree';

// The reference's left rail. Top three entries are flat links; Sports and
// Casino are collapsible branches; then support, FAQ, the APK button and the
// theme switch.
//
// The two branches render their children from the same nav config the header
// uses, in place of the reference's API-driven tree widget — tenexch has no
// menu-tree endpoint, and a static list of the sports the board can actually
// show is honest about what is there.
const SIDEBAR_TOP = [
  { key: 'home',    label: 'Home',     icon: 'home-icon.png',   route: '/' },
  { key: 'inplay',  label: 'In-Play',  icon: 'inplay-icon.png', tab: 'inplay' },
  { key: 'cpl',     label: 'CPL 2026', icon: 'winner-icon.png', route: '/cpl' },
];

// Sports branch children: everything in SPORT_NAV that is an actual sport.
const SPORT_CHILDREN = SPORT_NAV.filter((s) => !['inplay', 'cpl'].includes(s.key));

// The five sports the reference lists, against the tree feed's own ids. Its
// racing arrives on a separate list (`racing`) and is one level shallower —
// a race hangs straight off the sport, with no competition between.
const SPORT_ETID = { cricket: 4, football: 1, tennis: 2, horseracing: 10, greyhoundracing: 65 };

// Sport > competition > event, or for racing, sport > race. A node with
// children renders as a branch; anything else is a leaf that opens its event.
function buildSportsTree(navItems, sports, racing) {
  return navItems.map((item) => {
    const etid = SPORT_ETID[item.key];
    const fromRacing = racing.find((r) => Number(r.etid) === etid);
    const source = fromRacing || sports.find((x) => Number(x.etid) === etid);

    const children = (source?.children || []).map((child, i) =>
      fromRacing
        ? { id: `r-${child.gmid}`, name: child.name, route: `/gamedetails/${etid}/${child.gmid}` }
        : {
            id: `c-${child.cid ?? i}`,
            name: child.name,
            children: (child.children || []).map((ev) => ({
              id: `e-${ev.gmid}`,
              name: ev.name,
              route: `/gamedetails/${ev.etid ?? etid}/${ev.gmid}`,
            })),
          }
    );

    return { id: item.key, name: item.label, icon: iconSrc(item), children };
  });
}

function Sidebar({ sideNavVisible, setSideNavVisible }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [, setActiveTab, explicitTab] = useSportTab();
  const [sportsOpen, setSportsOpen] = useState(false);
  const [casinoOpen, setCasinoOpen] = useState(false);
  // The palette hangs off `dark` on <html> (`:root.dark` in the stylesheet).
  // The reference boots LIGHT — the `dark-theme` class its index.html puts on
  // <body> is vestigial and styles nothing — so this starts false, and the
  // switch below is what turns the class on.
  const { sports, racing } = useSportsTree();
  const sportsTree = useMemo(
    () => buildSportsTree(SPORT_CHILDREN, sports, racing),
    [sports, racing]
  );

  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const go = (item) => {
    setSideNavVisible(false);
    if (item.route) navigate(item.route);
    else setActiveTab(item.tab);
  };

  // Home owns the bare '/' row; a sport row lights up only once the URL names
  // it. That keeps In-Play dark on the home page, as the reference has it.
  const isActive = (item) => {
    if (item.route) return pathname === item.route && (item.route !== '/' || !search);
    return pathname === '/' && explicitTab === item.tab;
  };

  return (
    <div id="sidebar" className={`sidebar ${sideNavVisible ? 'sidebar-show' : ''}`}>
      <ul>
        {SIDEBAR_TOP.map((item) => (
          <li key={item.key}>
            <a aria-expanded="true" className={isActive(item) ? 'active' : ''} onClick={() => go(item)}>
              <span className="sports-icon  sideiconbg ">
                <img src={common(item.icon)} alt="homeicon" />
              </span>{' '}
              {item.label}
            </a>
          </li>
        ))}

        <li>
          <a
            className={sportsOpen ? 'active' : ''}
            onClick={() => setSportsOpen((v) => !v)}
            aria-expanded="true"
          >
            <span className="sports-icon  sideiconbg">
              <img src={common('sports-icon.png')} alt="homeicon" />
            </span>{' '}
            Sports
            <span className="sidearrow">
              <i className={`fa fa-caret-${sportsOpen ? 'down' : 'right'}`} aria-hidden="true"></i>
            </span>
          </a>
          {sportsOpen && <SideTree nodes={sportsTree} onSelect={go} />}
        </li>

        <li>
          <a
            className={casinoOpen ? 'active' : ''}
            onClick={() => setCasinoOpen((v) => !v)}
            aria-expanded="true"
          >
            <span className="sports-icon casino sideiconbg">
              <img src={common('casino-icon.png')} alt="homeicon" />
            </span>{' '}
            Casino
            <span className="sidearrow">
              <i className={`fa fa-caret-${casinoOpen ? 'down' : 'right'}`} aria-hidden="true"></i>
            </span>
          </a>
        </li>
        {casinoOpen && (
          <SideTree
            nodes={CASINO_NAV.map((c) => ({ id: c.key, name: c.label, icon: iconSrc(c), route: c.route }))}
            onSelect={go}
          />
        )}

        <li>
          <a aria-expanded="true">
            <span className="sports-icon  sideiconbg">
              <img src={common('support-icon.png')} alt="suport" />
            </span>{' '}
            Supports
          </a>
        </li>
        <li>
          <a aria-expanded="true" onClick={() => go({ route: '/terms-and-conditions' })}>
            <span className="sports-icon  sideiconbg">
              <img src={common('faq-icon.png')} alt="faq" />
            </span>{' '}
            FAQ's
          </a>
        </li>

        <li className="mt-2 mb-2">
          <button className="loginbtn">Download APK</button>
        </li>

        <li className="mb-2 mt-2">
          <a className="align-items-baseline d-flex justify-content-between w-100">
            <div className="align-items-center d-flex w-75">
              <span className="sports-icon casino sideiconbg">
                <img
                  src={common(`${dark ? 'lighttheme' : 'darktheme'}-icon.png`)}
                  alt={dark ? 'lightmode' : 'darkmode'}
                />
              </span>
              <span>{dark ? 'Light' : 'Dark'} Theme</span>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input switch-bigger"
                type="checkbox"
                id="mySwitch"
                checked={dark}
                onChange={() => setDark((v) => !v)}
              />
            </div>
          </a>
        </li>
        <p> </p>
      </ul>
    </div>
  );
}

export default Sidebar;
