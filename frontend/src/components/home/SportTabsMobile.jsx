import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AviatorSvg from './AviatorSvg';

const TABS = [
  // `disabledLoggedOut`: rendered but inert (no navigation/function) when logged out.
  { label: 'Crash', to: '/crash', className: 'aviator', icon: true, disabledLoggedOut: true },
  // Sports Book is display-only: visible logged-out but click does nothing
  { label: 'Sports Book', to: '/home', hideAfterLogin: true, disabledLoggedOut: true },
  // Signed in, Lottery lands on the reference's /allsport-highlight/66104; signed out it is
  // inert like Crash and Exchange, so `to` is never followed in that state.
  { label: 'Lottery', to: '/allsport-highlight/66104', disabledLoggedOut: true },
  { label: 'Exchange', to: '/home', disabledLoggedOut: true },
  { label: 'Live Casino', to: '/o_casino' },
  { label: 'Slot', to: '/o_slot' },
  { label: 'Fantasy Games', to: '/o_fantasy' },
];

function SportTabsMobile() {
  const { pathname } = useLocation();
  const isAuth = useSelector((s) => s.user.isAuthenticated);

  return (
    <div className="sport-tabs menu-tabs d-none-desktop">
      <ul className="nav nav-tabs">
        {TABS
          .filter((tab) => !(tab.hideAfterLogin && isAuth) && !(tab.authOnly && !isAuth))
          .map((tab) => {
          // Home route ('/' or '/home'): default-selects Exchange ONLY when logged in.
          // Logged out → NO tab active on home. On any other route the tab whose `to`
          // matches the path is active.
          const isHome = pathname === '/' || pathname === '/home';
          const isActive = isHome ? (isAuth && tab.label === 'Exchange') : pathname === tab.to;
          const inert = !isAuth && tab.disabledLoggedOut;
          const className = `nav-link${tab.className ? ` ${tab.className}` : ''}${isActive ? ' router-link-exact-active router-link-active' : ''}`;
          const content = (
            <>
              {tab.icon && AviatorSvg}
              {tab.icon ? <span>{tab.label}</span> : tab.label}
            </>
          );
          return (
            <li key={tab.label} className="nav-item">
              {/* Logged out, Crash/Lottery/Exchange are inert — an <a> that does
                  nothing (preventDefault), no navigation. Otherwise a real <Link>.
                  Active tab uses the reference's router-link classes (styled by
                  responsive.css → green bg) + aria-current="page". */}
              {inert ? (
                <a href="javascript:void(0)" className={className} onClick={(e) => e.preventDefault()}>
                  {content}
                </a>
              ) : (
                <Link to={tab.to} aria-current={isActive ? 'page' : undefined} className={className}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SportTabsMobile;
