import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { common } from '../assets';
import { SPORT_NAV, CASINO_NAV, iconSrc } from '../navItems';
import { useSportTab } from '../useSportTab';

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

// A branch's children.
//
// The reference builds this with react-accessible-treeview, and the stylesheet
// hangs every size on the class names that library emits — `.tree-node img` is
// what constrains an icon to 32px, and `.sidetree ul.sidebartree li div` is
// what gives a row its 35px height. Rendering plain divs (as this did) matched
// none of those selectors, so the icons fell back to their natural size and the
// rows grew with them.
//
// Our rows are all leaves, so they take the leaf class names the library uses
// for a childless node; nothing here needs the library itself until the tree
// gains real depth.
function SideTree({ items, onSelect }) {
  return (
    <div className="sidetree">
      <ul className="tree sidebartree" role="tree">
        {items.map((item) => (
          <li className="tree-leaf-list-item" key={item.key}>
            {/* The reference wires its click to `.innertext` alone; taking the
                whole row keeps the icon clickable too. */}
            <div className="tree-node tree-node__leaf" onClick={() => onSelect(item)}>
              <img src={iconSrc(item)} alt="homeicon" />
              <span className="innertext">{item.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
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
          {sportsOpen && <SideTree items={SPORT_CHILDREN} onSelect={go} />}
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
        {casinoOpen && <SideTree items={CASINO_NAV} onSelect={go} />}

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
