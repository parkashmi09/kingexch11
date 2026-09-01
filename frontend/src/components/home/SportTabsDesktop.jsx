import { useRef } from 'react';
import { useSelector } from 'react-redux';

// Desktop sport tabs — exact order/icons/labels of the reference #home_sports_list
// (logged-in state). `authOnly` tabs (the virtual Cricket tab) render only after
// login; `virtual` uses the special icon-998 + suits markup.
const SPORT_TABS = [
  { icon: 'icon-997', label: 'In Play', key: 'inplay', id: 'activeTabHome' },
  { icon: 'icon-4', label: 'Cricket', key: 'cricket' },
  { label: 'Cricket', key: 'virtualcricket', virtual: true, authOnly: true },
  { icon: 'icon-1', label: 'Football', key: 'football' },
  { icon: 'icon-2', label: 'Tennis', key: 'tennis' },
  { icon: 'icon-8', label: 'Table Tennis', key: 'tabletennis' },
  // Reference order: Horse Racing → Greyhound → Basketball → Esoccer (Esoccer
  // sits AFTER Basketball, not right after Table Tennis).
  { icon: 'icon-10', label: 'Horse Racing', key: 'horseracing' },
  { icon: 'icon-65', label: 'Greyhound Racing', key: 'greyhoundracing' },
  { icon: 'icon-15', label: 'Basketball', key: 'basketball' },
  { icon: 'icon-68', label: 'Esoccer', key: 'esoccer' },
  { icon: 'icon-69', label: 'Wrestling', key: 'wrestling' },
  { icon: 'icon-18', label: 'Volleyball', key: 'volleyball' },
  { icon: 'icon-22', label: 'Badminton', key: 'badminton' },
  { icon: 'icon-59', label: 'Snooker', key: 'snooker' },
  { icon: 'icon-57', label: 'Darts', key: 'darts' },
  { icon: 'icon-6', label: 'Boxing', key: 'boxing' },
  { icon: 'icon-3', label: 'Mixed Martial Arts', key: 'mma' },
  { icon: 'icon-58', label: 'American Football', key: 'americanfootball' },
  { icon: 'icon-11', label: 'E Games', key: 'egames' },
  { icon: 'icon-19', label: 'Ice Hockey', key: 'icehockey' },
  { icon: 'icon-9', label: 'Futsal', key: 'futsal' },
  { icon: 'icon-52', label: 'Motor Sports', key: 'motorsports' },
  { icon: 'icon-40', label: 'Politics', key: 'politics' },
  { icon: 'icon-66', label: 'Kabaddi', key: 'kabaddi' },
];

function SportTabsDesktop({ activeTab = 'inplay', onTabClick, showTabs = true }) {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  // Before the first board data arrives the sports list is empty (parent + arrows
  // only) — matching the reference, where #home_sports_list fills WITH the data.
  const tabs = showTabs ? SPORT_TABS.filter((tab) => !tab.authOnly || isAuth) : [];

  // Desktop-only horizontal scroll: the tab strip overflows past the viewport,
  // so the left/right arrows page through it. ~80% of the visible width per
  // click, smooth-scrolled; the ref points at the scrollable <ul>.
  const listRef = useRef(null);
  const scrollBy = (dir) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="sport-tabs">
      <a
        href="javascript:void(0)"
        className="arrow-tabs arrow-left"
        onClick={() => scrollBy(-1)}
      >
        <i className="fas fa-solid fa-angle-left"></i>
      </a>
      {/* Reference uses a DIFFERENT list id by auth: logged out →
          taj_home_sports_list, logged in → home_sports_list. */}
      <ul id={isAuth ? 'home_sports_list' : 'taj_home_sports_list'} ref={listRef} className="nav nav-tabs">
        {tabs.map((tab) => (
          <li key={tab.key} className="nav-item">
            <a
              href="javascript:void(0)"
              id={tab.id || ''}
              className={`nav-link${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => onTabClick && onTabClick(tab.key)}
            >
              {tab.virtual ? (
                <>
                  <i className="icon-998 d-icon"></i>
                  <div className="ml-1">+</div>
                  <i className="icon-suits d-icon ml-1"></i>
                </>
              ) : (
                <i className={`d-icon ${tab.icon}`}></i>
              )}
              <span>{tab.label}</span>
            </a>
          </li>
        ))}
      </ul>
      <a
        href="javascript:void(0)"
        className="arrow-tabs arrow-right"
        onClick={() => scrollBy(1)}
      >
        <i className="fas fa-solid fa-angle-right"></i>
      </a>
    </div>
  );
}

export default SportTabsDesktop;
