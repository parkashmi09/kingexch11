import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host } from '../../ng';
import { KX_LOGO } from '../../assets';
import { setExchange, resetHome } from '../../exchange';
import { setNavActive } from '../../header/HeaderNav';
import ExposureModal from '../../header/ExposureModal';
import useHeaderSearch from '../../header/useHeaderSearch';
import useDropdown from '../../header/useDropdown';
import { ACCOUNT_MENU, money, useAccountActions } from '../../header/accountMenu';
import HeaderNav from './HeaderNav';

const T = ng('cth');

// The reference's exchangeTypeList (its exchange-type API minus ids 10 and
// 32), each tab leaving for the exchange; LOBBY stays on the casino site.
const EXCHANGES = [
  { exchangeId: '11', exchangeName: 'EXCHANGE', route: '/home' },
  { exchangeId: '16', exchangeName: 'LIVE CASINO', route: '/livecasino' },
  { exchangeId: '98', exchangeName: 'TIPS & PREVIEWS', route: '/home', exchange: '98' },
];

/**
 * app-top-header of the casino site — its desktop header: the logo, LOBBY and
 * the exchange tabs, the search toggle, balance / exposure, refresh and the
 * My Account menu, then the sports bar (app-header-nav).
 *
 * The casino site is only reached signed in, so its signed-out branches (the
 * Rules link, Login) never show. LOBBY is the selected tab: the reference only
 * moves the selection with a tab click, and every tab but LOBBY leaves the
 * site. Leaving lands the exchange as a fresh load would (Home highlighted,
 * the board on its first exchange), except Tips & Previews' board.
 */
export default function TopHeader({ attrs }) {
  const navigate = useNavigate();
  const { user, balance, exposure, balanceLoading } = useSelector((s) => s.user);
  const { reloadBalance, logoutUser } = useAccountActions();
  const search = useHeaderSearch();
  const account = useDropdown();
  const inputRef = useRef(null);

  const [isSearchShow, setIsSearchShow] = useState(false);
  const [isActiveSearch, setIsActiveSearch] = useState(false);
  const [isShowCloseIcon, setIsShowCloseIcon] = useState(true);
  const [inputPlaceholder, setInputPlaceholder] = useState('');
  const [exposureOpen, setExposureOpen] = useState(false);

  const toMainSite = (path, exchange) => {
    resetHome();
    if (exchange) setExchange(exchange);
    setNavActive('Home');
    navigate(path);
  };

  // closeSearch(): clears the field and refocuses it with a placeholder; the
  // box itself stays open until the toggle closes it.
  const closeSearch = () => {
    search.setValue('');
    inputRef.current?.focus();
    setIsActiveSearch(false);
    setInputPlaceholder('Search Events');
    setIsShowCloseIcon(false);
  };

  const onKeyUp = () => {
    setIsShowCloseIcon(true);
    setIsActiveSearch(true);
  };

  return (
    <app-top-header {...attrs} {...host('cth')} className="headerDesktop hideDekstop">
      <div {...T} className="site-header app-header">
        <div {...T} className="before-login-items">
          <div {...T} className="site-logo-con" style={{ display: 'flex', alignItems: 'center' }}>
            <img {...T} alt="" className="site-logo" style={{ cursor: 'pointer' }} src={KX_LOGO} onClick={() => toMainSite('/home')} />
            <div {...T} className="col col-lg-4 col-xl-4 text-start exchangeList loginexchangeList">
              <div {...T} className="Fancy-marketCategory position-relative">
                <ul {...T} id="scrollContainer" className="scrollContainer">
                  <li {...T} className="Fancy-marketCategoryList exch-nav-item selectedMarket" onClick={() => navigate('/livecasino')}>
                    <a {...T}> LOBBY </a>
                  </li>
                  {EXCHANGES.map((x) => (
                    <li key={x.exchangeId} {...T} className="Fancy-marketCategoryList exch-nav-item" onClick={() => toMainSite(x.route, x.exchange)}>
                      <a {...T}>{` ${x.exchangeName} `}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div {...T} className="login-signup-uname-pass">
            <ul {...T} className="desktopviewButton hideDekstop showDekstop" style={{ position: 'relative' }}>
              <li {...T}>
                {isSearchShow && (
                  <div
                    {...T}
                    className={`searchIconDiv me-2 ng-input 456456 slide-in${isActiveSearch ? ' border-bottom-0' : ''}`}
                    style={{ position: 'absolute', left: '-18.5rem', top: '3px' }}
                  >
                    <i {...T} aria-hidden="true" className="fa fa-search searchIcon"></i>
                    <input
                      {...T}
                      ref={inputRef}
                      type="text"
                      placeholder={inputPlaceholder}
                      aria-label="Search"
                      id="myInput"
                      autoComplete="OFF"
                      className={`form-control searchbar${inputPlaceholder ? ' afterPlaceholder' : ''}`}
                      value={search.value}
                      onChange={(e) => search.setValue(e.target.value)}
                      onKeyUp={onKeyUp}
                      onFocus={() => setIsActiveSearch(true)}
                    />
                    {isShowCloseIcon && (
                      <span {...T} aria-hidden="true" id="myClose" className="searchIconCross" onClick={closeSearch}>
                        ×
                      </span>
                    )}
                    {isActiveSearch && (
                      <div {...T} className="searchBox" style={{ position: 'absolute', left: 0, top: '23.5px' }}>
                        <div {...T} className="scrollSearchBox">
                          <ul {...T} className="search-game-ul" style={{ marginBottom: '0px' }}>
                            {search.results.map((r) => (
                              <li key={`${r.sid}-${r.gmid}`} {...T}>
                                <a
                                  {...T}
                                  style={{ width: '100%', display: 'block' }}
                                  onClick={() => { setIsActiveSearch(false); search.setValue(''); toMainSite(`/gamedetails/${r.sid}/${r.gmid}`); }}
                                >
                                  <div {...T} className="d-flex justify-content-between w-100">
                                    <div {...T} className="search-game-name d-flex"><b {...T}>{r.sportName}</b></div>
                                    <div {...T} className="text-end">{` ${r.date} `}</div>
                                  </div>
                                  <div {...T} className="game-teams w-100">{r.eventName}</div>
                                </a>
                              </li>
                            ))}
                            {!search.results.length && (
                              <li {...T} className="no-item-founds"><a {...T}>No items found</a></li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
              <li {...T} className="search float-left">
                <a {...T} onClick={() => setIsSearchShow((v) => !v)}>
                  <i {...T} id="searchiconDesktopID" className="fas fa-search-plus"></i>
                </a>
              </li>
            </ul>
            <div {...T} className="Myaccount-after-login">
              <div {...T} className="user-blnc">
                {balanceLoading && balance == null ? (
                  <div {...T} className="loadingBalance">
                    {Array.from({ length: 10 }, (_, i) => <span key={i} {...T}></span>)}
                  </div>
                ) : (
                  <div {...T} className="balance" style={{ textAlign: 'center' }}>
                    <p {...T} className="pti-ic" style={{ display: 'block' }}>
                      {' Main '}
                      <strong {...T}>
                        {'PTI '}
                        <span {...T} className="userTotalBalance">{money(balance)}</span>
                      </strong>
                    </p>
                    <p {...T} className="exp-topcount">
                      {'Exposure '}
                      <a {...T} className="text-white mouse-pointer" onClick={() => setExposureOpen(true)}>
                        <strong {...T}>
                          (
                          <span {...T} className="exp-red userTotalExposure">{money(exposure)}</span>
                          {') '}
                        </strong>
                      </a>
                    </p>
                  </div>
                )}
              </div>
              <div {...T} className="login-refresh-MAcnt-btn">
                <span {...T} className="head-refresh">
                  <a {...T} id="menuRefresh" style={{ cursor: 'pointer' }} onClick={() => { setIsSearchShow(false); reloadBalance(); }}>
                    <i {...T} className="fas fa-undo-alt"></i>
                  </a>
                </span>
                <a {...T} href="javascript:;" title="Setting" className="a-referesh"></a>
              </div>
              <div {...T} ref={account.ref} placement="bottom right" className="myaccnt hidden-xs">
                <a
                  {...T}
                  aria-haspopup="true"
                  id="accountPopup"
                  role="button"
                  aria-expanded={account.open ? 'true' : 'false'}
                  className={`nav-link My-acc-font${account.open ? ' show' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => account.setOpen((v) => !v)}
                >
                  <i {...T} className="fas fa-user"></i>
                  My Account
                  <i {...T} className="fas fa-sort-down" style={{ position: 'relative', top: '-2px' }}></i>
                </a>
                <ul
                  {...T}
                  className={`dropdown-menu align${account.open ? ' show' : ''}`}
                  // What Popper leaves on the reference's dropdown
                  // (placement "bottom right"): right-aligned under the toggle.
                  style={account.open ? { position: 'absolute', inset: '0px 0px auto auto', margin: 0, transform: 'translate(-20px, 27px)' } : undefined}
                >
                  <div {...T} className="dropdown-header text-left">
                    <strong {...T}>{user?.username || 'exchange'}</strong>
                  </div>
                  {ACCOUNT_MENU.map((m) => (
                    <a
                      key={m.label}
                      {...T}
                      className="dropdown-item"
                      onClick={() => { account.setOpen(false); toMainSite(m.route); }}
                    >
                      {m.label}
                    </a>
                  ))}
                  <a {...T} className="dropdown-item drp-logout">
                    <button {...T} className="btn btn-primary logout-btn" onClick={() => { account.setOpen(false); logoutUser(); }}>
                      {'LOGOUT '}
                      <i {...T} aria-hidden="true" className="fa fa-sign-out-alt"></i>
                    </button>
                  </a>
                </ul>
              </div>
            </div>
            <span {...T} className="err-invalid"></span>
          </div>
        </div>
      </div>

      <HeaderNav attrs={T} />

      <ExposureModal
        open={exposureOpen}
        onClose={() => setExposureOpen(false)}
        id="exposureModals"
        tableClass="table table-bordered"
        C={T}
      />
    </app-top-header>
  );
}
