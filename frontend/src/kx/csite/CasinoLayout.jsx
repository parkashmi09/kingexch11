import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { isMobile } from '../exchange';
import SideBar from '../SideBar';
import TopHeader from './shell/TopHeader';
import T20Header from './shell/T20Header';
import RightNav from './shell/RightNav';
import BottomNav from './shell/BottomNav';
import CasinoRoom, { useCasinoMenuOpen } from './shell/CasinoRoom';
import CasinoMenu from './shell/CasinoMenu';

const Y = ng('cly');

// The casino site's pages are their own [data-kc] subtree: its global
// stylesheet, theme and body (css/styles.css, theme.css, css/kc-base.css) apply
// there instead of the main site's.
export const KC = { 'data-kc': '' };

const isIPhone = navigator.userAgent.includes('iPhone');

/**
 * app-layout of the casino site (casino.kingexch111.com), the frame every
 * Universe table opens in: its own top header (desktop) or exchange header
 * (phone), the sports rail and under it the games menu (app-casino-menu) its
 * gear opens, the game in the middle with that gear (app-casino-room), the
 * Open Bets rail and the bottom bar.
 *
 * The casino site only opens with a session (its /authentication/:token link);
 * signed out, this app sends the visitor home.
 */
export default function CasinoLayout({ children }) {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const menuOpen = useCasinoMenuOpen();
  if (!isAuth) return <Navigate to="/" replace />;

  return (
    <app-layout {...host('cly')} {...KX} {...KC}>
      <div {...Y} className={`prevent-select${isIPhone ? ' iphone-con' : ''}`}>
        {!isMobile && <TopHeader attrs={Y} />}
        {isMobile && <T20Header attrs={Y} />}
        <div {...Y} className="d-flex app-body adjust-height-100">
          <div {...Y} className="sidebar showDesktop hideDekstop">
            <SideBar casino />
            {menuOpen && <CasinoMenu attrs={Y} />}
          </div>
          <div {...Y} id="marketScroll1" className="content responsiveMobile">
            <CasinoRoom attrs={Y} />
            {children}
          </div>
          <div {...Y} className="sidebarright hideDekstop" style={{ width: '27vw' }}>
            {!isMobile && <RightNav attrs={Y} />}
          </div>
        </div>
        <BottomNav attrs={Y} />
      </div>
    </app-layout>
  );
}
