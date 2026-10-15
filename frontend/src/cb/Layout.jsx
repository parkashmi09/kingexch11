import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import KxHeader from '../kx/header/KxHeader';
import SideBar from '../kx/SideBar';
import RightNav from '../kx/RightNav';
import { ng, KX } from '../kx/ng';
import Footer from './layout/Footer';
import BottomNav from '../kx/BottomNav';

const L = ng('kl');

// The reference's fullMarketPage: switched on by a match page (/fullMarket
// there, /gamedetails here) and off again only by home — so it outlives the
// match on whatever page comes next, as it does there. It narrows the content
// column (sideLayout-fullmarket) and nudges the right rail.
let fullMarketPage = false;

/**
 * The page chrome, mid-conversion to kingexch111: its app-layout (header, then
 * left rail | content | right rail, then the bottom bar). `kx` pages are
 * already kingexch and fill `.content` themselves; the rest still render the
 * clickbet page inside it (wrapper, footer); `page-wrapper-before` is what
 * clickbet puts on the wrapper while logged OUT.
 */
function Layout({ kx = false, children }) {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const { pathname } = useLocation();
  // The reference: `adjust-height` on home/in-play, `adjust-height-100` elsewhere.
  const home = pathname === '/' || pathname === '/home';
  if (pathname.startsWith('/gamedetails/')) fullMarketPage = true;
  if (home) fullMarketPage = false;

  return (
    <div {...L} className="prevent-select">
      <ToastContainer />
      <KxHeader />
      <div {...L} className={`d-flex app-body ${home || pathname === '/inplay' ? 'adjust-height' : 'adjust-height-100'}`}>
        <div {...L} {...KX} className="sidebar showDesktop hideDekstop">
          <SideBar />
        </div>
        <div {...L} className={`content${fullMarketPage ? ' sideLayout-fullmarket' : ''}`}>
          {kx ? children : (
            <>
              <div className={`page-wrapper ${isAuth ? '' : 'page-wrapper-before'}`}>
                {children}
              </div>
              <Footer />
            </>
          )}
        </div>
        <div {...L} {...KX} className={`sidebarright hideDekstop${fullMarketPage ? ' sideLayout-fullmarket-right-side' : ''}`} style={{ width: '27vw' }}>
          <RightNav />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default Layout;
