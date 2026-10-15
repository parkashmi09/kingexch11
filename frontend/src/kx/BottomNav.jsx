import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, KX } from './ng';
import { kx } from './assets';
import { openAgeModal } from './ageModal';
import { resetHome } from './exchange';
import { resetSportsPage } from './sports/Sports';
import { HomeIcon, InPlayIcon, SportsIcon, AccountIcon } from './bottomNavIcons';

const B = ng('kbn');

/**
 * app-bottom-nav — the phone's bottom bar: Home, In-Play, Sports, Casino,
 * Account. Logged out, Casino and Account ask for the age confirmation; logged
 * in, Account opens the account menu and Casino this app's casino (the
 * reference's opens its provider's mini-casino iframe, which isn't ours).
 */
export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAuth = useSelector((s) => s.user.isAuthenticated);

  // The reference's highlight: the url contains the entry's path.
  const on = (path) => (pathname.includes(path) ? ' active-link' : '');
  const go = (path, e) => { e.preventDefault(); resetSportsPage(); navigate(path); };

  return (
    <app-bottom-nav {...KX}>
      <nav {...B} className="mobile-footer-menu" id="mobile-footer-menuId">
        <ul {...B}>
          <li {...B}>
            <a {...B} href="/home" className={`ui-link${on(pathname === '/' ? '/' : '/home')}`} onClick={(e) => { resetHome(); go('/home', e); }}>
              <div {...B}>{HomeIcon(B)}</div>
              {' Home '}
            </a>
          </li>
          <li {...B}>
            <a {...B} href="/inplay" className={`ui-link${on('/inplay')}`} onClick={(e) => go('/inplay', e)}>
              <div {...B} className="icon-inplay">{InPlayIcon(B)}</div>
              {' In-Play '}
            </a>
          </li>
          <li {...B} className={`main-nav ${pathname === '/sports' ? 'isMarkedSports' : 'isNotMarkedSports'}`}>
            <a {...B} href="/sports" id="bottom-menu-allsports" className={`ui-link${on('/sports')}`} onClick={(e) => go('/sports', e)}>
              <div {...B} className="icon-sports">{SportsIcon(B)}</div>
              <span {...B}>Sports</span>
            </a>
          </li>
          <li {...B}>
            <a {...B} className="ui-link" onClick={(e) => (isAuth ? go('/livecasino', e) : openAgeModal())}>
              <div {...B} className="icon-pin">
                <img {...B} src={kx('assets/footer-logos/ChipRotate-(100x100).gif')} className="casinoimg" alt="" />
              </div>
              {' Casino '}
            </a>
          </li>
          <li {...B}>
            <a {...B} className={`ui-link${isAuth ? on('/account') : ''}`} onClick={(e) => (isAuth ? go('/account', e) : openAgeModal())}>
              <div {...B} className="icon-account">{AccountIcon(B)}</div>
              {' Account '}
            </a>
          </li>
        </ul>
      </nav>
    </app-bottom-nav>
  );
}
