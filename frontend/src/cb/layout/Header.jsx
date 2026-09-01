import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Marquee from 'react-fast-marquee';
import { user, common } from '../assets';
import { HEADER_NAV, CASINO_NAV, GROUPED_SPORTS, MOBILE_NAV_LEAD, iconSrc } from '../navItems';
import { useSportTab } from '../useSportTab';
import useViewportWidth from '../useViewport';
import LoginModal from './LoginModal';
import AccountPanel from './AccountPanel';

// The reference hides the In-Play entry below 767px because the strip is
// already tight there; both lists render it and CSS decides which list shows.
const IN_PLAY_MIN_WIDTH = 766;

function NavItem({ item, active, onClick }) {
  return (
    <li className={active ? 'active' : ''} onClick={onClick}>
      <a>
        <span className="sports-icon  sideiconbg">
          <img className="headernothover" src={iconSrc(item)} alt={item.alt || item.label} />
        </span>
        {item.label}
      </a>
    </li>
  );
}

// Desktop strip: every sport listed flat, then the casino entries.
function DesktopNav({ width, explicitTab, go }) {
  return (
    <ul>
      {HEADER_NAV.map((item) => {
        if (item.key === 'inplay' && width <= IN_PLAY_MIN_WIDTH) return false;
        // Only a sport the URL names is highlighted. On the bare home page the
        // reference highlights nothing here, In-Play included.
        const active = item.tab
          ? explicitTab === item.tab
          : window.location.pathname === item.route;
        return <NavItem key={item.key} item={item} active={active} onClick={() => go(item)} />;
      })}
    </ul>
  );
}

// Phone strip: the same row, except Soccer / Tennis / Horse / Greyhound are
// folded behind one "Sports" entry that opens a dropdown.
function MobileNav({ width, explicitTab, go }) {
  const [sportsOpen, setSportsOpen] = useState(false);
  const groupActive = GROUPED_SPORTS.some((s) => explicitTab === s.tab);

  return (
    <ul>
      {MOBILE_NAV_LEAD.map((item) => {
        if (item.key === 'inplay' && width <= IN_PLAY_MIN_WIDTH) return false;
        const active = item.tab
          ? explicitTab === item.tab
          : window.location.pathname === item.route;
        return <NavItem key={item.key} item={item} active={active} onClick={() => go(item)} />;
      })}

      <li
        className={`${groupActive ? 'active' : ''} ${sportsOpen ? 'open' : ''}`}
        onMouseLeave={() => setSportsOpen(false)}
      >
        <a
          className="sf-with-ul"
          onClick={(e) => {
            e.preventDefault();
            setSportsOpen((v) => !v);
          }}
        >
          <span className="sports-icon  sideiconbg">
            <img className="headernothover" src={common('sports-icon.png')} alt="soccer" />
          </span>
          Sports
        </a>
        <div className="header-menubox ">
          <div className="">
            <ul>
              {GROUPED_SPORTS.map((item) => (
                <li
                  key={item.key}
                  className={explicitTab === item.tab ? 'active' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSportsOpen(false);
                    go(item);
                  }}
                >
                  <a>
                    {/* Single space here, unlike the outer entries — the
                        reference's own spacing. */}
                    <span className="sports-icon sideiconbg">
                      <img className="headernothover" src={iconSrc(item)} alt={item.alt || item.label} />
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </li>

      {CASINO_NAV.map((item) => (
        <NavItem
          key={item.key}
          item={item}
          active={window.location.pathname === item.route}
          onClick={() => go(item)}
        />
      ))}
    </ul>
  );
}

function Header({ sideNavVisible, setSideNavVisible }) {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const balance = useSelector((s) => s.user.balance);
  const [, setActiveTab, explicitTab] = useSportTab();
  const width = useViewportWidth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

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
              <DesktopNav width={width} explicitTab={explicitTab} go={go} />
            </div>
            {isAuth ? (
              <div className="loginbtngroup loginbtngroup--loggedin">
                <div>
                  <button className="loginbtn" onClick={() => setAccountOpen(true)}>
                    {walletTotal.toFixed(2)}
                  </button>
                </div>
              </div>
            ) : (
              <div className="loginbtngroup">
                <button className="loginbtn" id="loginBtn" onClick={() => setLoginOpen(true)}>
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* The phone strip. It lives OUTSIDE <header> in the reference and is the
          one that shows on phones — .mobile-hide takes the desktop list away
          there, and this wrapper is hidden on desktop. */}
      <div className="mobile-menu">
        <div className="headermenu header-scroll-menu ">
          <MobileNav width={width} explicitTab={explicitTab} go={go} />
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

      {/* Login is a modal over the current page, not a route — the reference
          keeps it here, as a sibling of the header, and mounts it from this
          button. */}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      {accountOpen && <AccountPanel onClose={() => setAccountOpen(false)} />}
    </>
  );
}

export default Header;
