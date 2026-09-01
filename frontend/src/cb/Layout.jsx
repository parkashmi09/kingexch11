import { useState } from 'react';
import { useSelector } from 'react-redux';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import Banner from './layout/Banner';
import Footer from './layout/Footer';
import MobileFooter from './layout/MobileFooter';
import Home from './home/Home';

/**
 * The clickbet page chrome.
 *
 * Structure is the reference's exactly: header (+ its mobile strip and the
 * marquee) above a `middlepart` holding the rail, the hero banner, the routed
 * page in `page-wrapper`, then the footer and the phone bottom bar.
 *
 * `page-wrapper-before` is what the reference puts on the wrapper while logged
 * OUT — the stylesheet hangs the logged-out spacing off it — and `mt-0` cancels
 * the wrapper's top margin on the pages that show the banner, since the banner
 * already supplies that gap.
 */
function Layout() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [sideNavVisible, setSideNavVisible] = useState(false);

  // The banner belongs to the landing page only.
  const showBanner = true;

  return (
    <>
      <Header sideNavVisible={sideNavVisible} setSideNavVisible={setSideNavVisible} />
      <div className="middlepart">
        <Sidebar sideNavVisible={sideNavVisible} setSideNavVisible={setSideNavVisible} />
        {showBanner && <Banner />}
        <div className={`page-wrapper  ${showBanner ? 'mt-0' : ''} ${isAuth ? '' : 'page-wrapper-before'} `}>
          <Home />
        </div>
        <Footer />
        <MobileFooter />
      </div>
    </>
  );
}

export default Layout;
