import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Marquee from 'react-fast-marquee';
import { user } from '../assets';
import { HEADER_NAV, iconSrc } from '../navItems';
import { useSportTab } from '../useSportTab';

// The reference hides the In-Play entry below 767px because the mobile-menu
// copy of the same strip takes over there; both lists are rendered, and CSS
// decides which one is visible.
const IN_PLAY_MIN_WIDTH = 766;

function NavList({ width, explicitTab, go }) {
  return (
    <ul>
      {HEADER_NAV.map((item) => {
        if (item.key === 'inplay' && width <= IN_PLAY_MIN_WIDTH) return false;
        // Only a sport the URL names is highlighted. On the bare home page the
        // reference highlights nothing here, In-Play included.
        const active = item.tab
          ? explicitTab === item.tab && item.key !== 'cpl'
          : window.location.pathname === item.route;
        return (
          <li key={item.key} className={active ? 'active' : ''} onClick={() => go(item)}>
            <a>
              <span className="sports-icon  sideiconbg">
                <img className="headernothover" src={iconSrc(item)} alt={item.alt || item.label} />
              </span>
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function Header({ sideNavVisible, setSideNavVisible }) {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const balance = useSelector((s) => s.user.balance);
  const [, setActiveTab, explicitTab] = useSportTab();
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // A nav entry either switches the home board's sport (every sport entry) or
  // opens a route (the casino entries). Either way the mobile drawer closes.
  const go = (item) => {
    setSideNavVisible(false);
    if (item.route) navigate(item.route);
    else setActiveTab(item.tab);
  };

  // `balance` is the wallet total the header already polls for; the reference
  // shows exposure + balance + pnl combined, but tenexch keeps those on the
  // account panel, so the button carries the wallet figure alone.
  const walletTotal = Number(balance || 0);

  return (
    <>
      <header>
        <div className="container-fluid">
          <div className="header-inner">
            <div className="logo">
              <span className="mr-7" onClick={() => setSideNavVisible(!sideNavVisible)}>
                <i className="fa fa-bars" aria-hidden="true"></i>
              </span>
              <img src={user('logo.svg')} alt="" onClick={() => navigate('/')} />
            </div>
            <div className="headermenu header-scroll-menu mobile-hide">
              <NavList width={width} explicitTab={explicitTab} go={go} />
            </div>
            {isAuth ? (
              <div className="loginbtngroup loginbtngroup--loggedin">
                <div>
                  <button className="loginbtn" onClick={() => navigate('/report/account-statement')}>
                    {walletTotal.toFixed(2)}
                  </button>
                </div>
              </div>
            ) : (
              <div className="loginbtngroup">
                <button className="loginbtn" id="loginBtn" onClick={() => navigate('/login')}>
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Second copy of the same strip. It lives OUTSIDE <header> in the
          reference and is the one that shows on phones — .mobile-hide takes the
          first list away there, and this wrapper is hidden on desktop. */}
      <div className="mobile-menu">
        <div className="headermenu header-scroll-menu ">
          <NavList width={width} explicitTab={explicitTab} go={go} />
        </div>
      </div>

      <div className="marqueebox">
        <div className="container-fluid">
          <Marquee className="marqueetext">
            <i className="fa fa-bullhorn mr-6" aria-hidden="true"></i>
            Welcome To Our New Version Exchange.....{'  '}
            <span className="mw100"></span>
          </Marquee>
        </div>
      </div>
    </>
  );
}

export default Header;
