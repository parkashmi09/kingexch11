import { useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoAviator } from '../casino/launch';
import { useSelector } from 'react-redux';
import { ng } from '../ng';
import { kx } from '../assets';
import { setExchange, resetHome } from '../exchange';
import useListedSports from '../listedSports';

const C = ng('khn');

// The sports run of the bar. The reference builds it from its sports API
// (`sportId` "10122022" is its Vimaan/Aviator entry, drawn black with a pulsing
// icon); ours is static, in the order the live site shows, with each entry
// pointing at the page this app already has for it.
const NAV_SPORTS = [
  { name: 'Cricket', etid: 4, route: '/allsport-highlight/4' },
  { name: 'Vimaan', aviator: true },
  { name: 'Tennis', etid: 2, route: '/allsport-highlight/2' },
  { name: 'Soccer', etid: 1, route: '/allsport-highlight/1' },
  { name: 'Horse Racing', etid: 10, racing: true, route: '/allsport-highlight/7' },
  { name: 'Greyhound Racing', etid: 65, racing: true, route: '/allsport-highlight/4339' },
  { name: 'Lottery', route: '/allsport-highlight/66104' },
];

// The reference's casino menu (its exchange list minus ids 10/11): each
// switches the home board to that exchange.
const NAV_CASINO = [
  { name: 'Live Casino', exchange: '16' },
  { name: 'Tips & Previews', exchange: '98' },
];

// The highlighted entry, as the reference keeps it: whatever was last clicked
// in this bar (Home at first), not the current page — the left rail and the
// pages it leads to don't move it, the logo puts it back on Home. Outlives
// remounts, like the reference's one header.
let lastActive = 'Home';
const navSubs = new Set();
export const setNavActive = (name) => {
  lastActive = name;
  navSubs.forEach((fn) => fn());
};
const useNavActive = () => useSyncExternalStore((fn) => (navSubs.add(fn), () => navSubs.delete(fn)), () => lastActive);

/** app-header-nav — the desktop sports bar under the header. */
export default function HeaderNav({ onAgeConfirm }) {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const active = useNavActive();
  const navSports = useListedSports(NAV_SPORTS);
  const activate = setNavActive;

  const go = (name, route) => {
    activate(name);
    if (route) navigate(route);
  };

  return (
    <>
      <div {...C} className="menu-wrap">
        <div {...C} className="full-wrap">
          <ul {...C} className="tab-menu pull-left">
            <li {...C} className="ver-menu">
              <a {...C} className={`navbar-item${active === 'Home' ? ' active' : ''}`} onClick={() => { resetHome(); go('Home', '/home'); }}>
                Home
              </a>
            </li>
            <li {...C} className="ver-menu">
              <a
                {...C}
                className={`navbar-item${active === 'In-Play' ? ' active' : ''}`}
                href="/inplay"
                onClick={(e) => {
                  e.preventDefault();
                  go('In-Play', '/inplay');
                }}
              >
                In-Play
              </a>
            </li>
            {isAuth ? (
              <li {...C} className="ver-menu">
                <a {...C} href="/multimarket" className={`navbar-item${active === 'Multi Markets' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); go('Multi Markets', '/multimarket'); }}>Multi Markets</a>
              </li>
            ) : (
              <li {...C} className="ver-menu">
                <a {...C} className="navbar-item" onClick={onAgeConfirm}>Multi Markets</a>
              </li>
            )}
            {navSports.map((s) => (
              <li key={s.name} {...C} className={`ver-menu${s.aviator ? ' aviator' : ''}`}>
                <a
                  {...C}
                  className={`Virtual navbar-item${active === s.name ? ' active' : ''}${s.aviator ? ' heartBeat' : ''}`}
                  onClick={() => { if (s.aviator && isAuth) activate(s.name); if (s.aviator) gotoAviator(isAuth, navigate); else go(s.name, s.route); }}
                >
                  {s.aviator && <img {...C} src={kx('assets/casinoslpot/aviator.png')} className="aviatorImg" />}
                  {' '}{s.name}
                </a>
              </li>
            ))}
            {NAV_CASINO.map((c) => (
              <li key={c.name} {...C} className="ver-menu">
                <a {...C} className={`navbar-item${active === c.name ? ' active' : ''}`} onClick={() => (c.exchange ? (setExchange(c.exchange), go(c.name, '/home')) : activate(c.name))}>
                  {' '}{c.name}
                </a>
              </li>
            ))}
          </ul>
          <ul {...C} className="tab-menu pull-right"></ul>
          {isAuth && (
            <div {...C} className="settings">
              <a {...C} href="/setstake" onClick={(e) => { e.preventDefault(); navigate('/setstake'); }}>
                Setting
              </a>
              <i {...C} className="fa fa-cog ms-1"></i>
            </div>
          )}
        </div>
      </div>
      <br {...C} />
      <br {...C} />
    </>
  );
}
