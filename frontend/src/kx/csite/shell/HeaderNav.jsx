import { useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host } from '../../ng';
import { resetHome } from '../../exchange';
import { setNavActive } from '../../header/HeaderNav';
import { gotoAviator } from '../../casino/launch';
import useListedSports from '../../listedSports';

const N = ng('chn');

// The casino site's sports run: its sports API (minus the `others`), plus the
// Vimaan entry it pushes itself (sportId "10122022", sequence 2), sorted by
// sequence (Greyhound Racing isn't among them). Here a static list, each sport
// leaving for that sport's highlight page (the reference's
// goToMainSite('/allsport-highlight/<sportId>')).
const NAV_SPORTS = [
  { name: 'Cricket', etid: 4, sportId: 4 },
  { name: 'Vimaan', aviator: true },
  { name: 'Tennis', etid: 2, sportId: 2 },
  { name: 'Soccer', etid: 1, sportId: 1 },
  { name: 'Horse Racing', etid: 10, racing: true, sportId: 7 },
  { name: 'Lottery', sportId: 66104 },
];

// The bar's activeItem: the sport last clicked here. Every entry but Vimaan
// leaves the casino site (whose page reload clears it); Vimaan stays on it, so
// it alone keeps the highlight. Outlives the layout's remounts, like the
// reference's one header.
let activeItem = '';
const subs = new Set();
const setActiveItem = (name) => {
  activeItem = name;
  subs.forEach((fn) => fn());
};
const useActiveItem = () => useSyncExternalStore((fn) => (subs.add(fn), () => subs.delete(fn)), () => activeItem);

/**
 * app-header-nav of the casino site (inside app-top-header): Home, In-Play,
 * Multi Markets, the sports, Vimaan and Setting. Each leaves for the matching
 * page of the exchange (the reference's goToMainSite reloads the main site, so
 * its header lands back on Home); Vimaan opens the Vimaan table on this site.
 */
export default function HeaderNav({ attrs }) {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const active = useActiveItem();
  const navSports = useListedSports(NAV_SPORTS);

  const toMainSite = (path) => {
    setActiveItem('');
    resetHome();
    setNavActive('Home');
    navigate(path);
  };

  const onSport = (s) => {
    if (s.aviator) {
      setActiveItem(s.name);
      gotoAviator(isAuth, navigate);
    } else toMainSite(`/allsport-highlight/${s.sportId}`);
  };

  return (
    <app-header-nav {...attrs} {...host('chn')} className="hideMobile">
      <div {...N} className="menu-wrap">
        <div {...N} className="full-wrap">
          <ul {...N} className="tab-menu pull-left">
            <li {...N} className="ver-menu">
              <a {...N} routerlinkactive="active" className="navbar-item" onClick={() => toMainSite('/home')}>
                Home
              </a>
            </li>
            <li {...N} className="ver-menu">
              <a {...N} className="navbar-item" onClick={() => toMainSite('/inplay')}>
                In-Play
              </a>
            </li>
            <li {...N} className="ver-menu">
              <a {...N} className="navbar-item" onClick={() => toMainSite('/multimarket')}>
                Multi Markets
              </a>
            </li>
            {navSports.map((s) => (
              <li key={s.name} {...N} className={`ver-menu${s.aviator ? ' aviator' : ''}`}>
                <a
                  {...N}
                  className={`Virtual navbar-item${active === s.name ? ' active' : ''}${s.aviator ? ' heartBeat' : ''}`}
                  onClick={() => onSport(s)}
                >
                  {s.aviator && <img {...N} src="/kingexch/casino-site/assets/vimaan.png" className="aviatorImg" />}
                  {` ${s.name}`}
                </a>
              </li>
            ))}
          </ul>
          <ul {...N} className="tab-menu pull-right"></ul>
          <div {...N} className="settings">
            <a
              {...N}
              routerlink="settings"
              href="/setstake"
              onClick={(e) => { e.preventDefault(); toMainSite('/setstake'); }}
            >
              Setting
            </a>
            <i {...N} className="fa fa-cog ms-1"></i>
          </div>
        </div>
      </div>
      <br {...N} />
      <br {...N} />
    </app-header-nav>
  );
}
