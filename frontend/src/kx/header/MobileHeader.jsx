import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { kx, KX_LOGO } from '../assets';
import KxModal from '../KxModal';
import { onAgeModal } from '../ageModal';
import ExposureModal from './ExposureModal';
import useHeaderSearch from './useHeaderSearch';
import useDropdown from './useDropdown';
import { ACCOUNT_MENU, money, useAccountActions } from './accountMenu';
import { BetsIcon, RefreshIcon, SettingIcon } from './icons';

const C = ng('kmh');
const L = ng('kl');

/**
 * app-header — the reference's header at 992px and below. Signed out it is the
 * logo and a Login button (the inline fields exist but its stylesheet hides
 * them at these widths); Login opens the 18+ confirmation, whose Confirm goes
 * to the login page. Signed in: the Bets button, balance/exposure and the
 * refresh + settings buttons.
 */
export default function MobileHeader() {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const { balance, exposure, balanceLoading } = useSelector((s) => s.user);
  const { reloadBalance, logoutUser } = useAccountActions();
  const search = useHeaderSearch();
  const account = useDropdown();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [ageOpen, setAgeOpen] = useState(false);
  useEffect(() => onAgeModal('(max-width: 992px)', () => setAgeOpen(true)), []);
  const [exposureOpen, setExposureOpen] = useState(false);
  const [isActiveSearch, setIsActiveSearch] = useState(false);

  const searchResults = (
    <div {...C} className="searchBox">
      {isActiveSearch && (
        <div {...C} className="scrollSearchBox">
          <ul {...C} className="searchDataList">
            {search.results.map((r) => (
              <li key={`${r.sid}-${r.gmid}`} {...C} className="searchList 2222">
                <a {...C} onClick={() => { setIsActiveSearch(false); navigate(`/gamedetails/${r.sid}/${r.gmid}`); }}>{r.eventName}</a>
              </li>
            ))}
            {isAuth && !search.results.length && (
              <li {...C} className="searchList 11111"><a {...C}>No items found</a></li>
            )}
          </ul>
        </div>
      )}
    </div>
  );

  const searchInput = (extraClass) => (
    <div {...C} className={`${extraClass}`}>
      <input
        {...C}
        type="text"
        placeholder=""
        aria-label="Search"
        id="myInput"
        className="form-control searchbar"
        value={search.value}
        onChange={(e) => search.setValue(e.target.value)}
        onFocus={() => setIsActiveSearch(true)}
      />
      <span {...C} aria-hidden="true" id="myClose" className="searchIconCross" onClick={() => { search.setValue(''); setIsActiveSearch(false); }}>
        ×
      </span>
    </div>
  );

  return (
    <app-header {...L} {...host('kmh')} {...KX} className="headerDesktop hideMobileHeader">
      <div {...C} className="site-header app-header">
        {!isAuth && (
          <div {...C} className="before-login-items">
            <div {...C} className="site-logo-con" style={{ display: 'flex', alignItems: 'center' }}>
              <img {...C} alt="" tabIndex={0} className="site-logo" src={KX_LOGO} onClick={() => navigate('/')} />
              {searchInput('searchIconDiv me-2 ng-input 456456')}
              {searchResults}
            </div>
            <div {...C} className="login-signup-uname-pass">
              <div {...C} className="header-uname-pass">
                <div {...C} className="d-flex align-items-center phoneNumberDiv me-2">
                  <input
                    {...C}
                    type="text"
                    tabIndex={1}
                    autoComplete="off"
                    name="userName"
                    id="userName"
                    placeholder="Username"
                    className="phoneNumberInput"
                    style={{ padding: 0, borderRadius: '3px', width: '100%' }}
                    maxLength={13}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <input
                  {...C}
                  type="password"
                  name="passwordformbl"
                  placeholder="Password"
                  className="password form-control me-2 username userPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div {...C} className="login-signup">
                <button {...C} className="btn login me-1" onClick={() => setAgeOpen(true)}>
                  <b {...C} style={{ width: '33px', height: '18px' }}>Login</b>
                  <i {...C} className="fa fa-sign-in ms-1"></i>
                </button>
              </div>
              <span {...C} className="err-invalid"></span>
            </div>
          </div>
        )}
        {isAuth && (
          <div {...C} className="after-login">
            <div {...C} className="after-login-bets-buttons">
              <a {...C} title="Setting" className="open-bets" onClick={() => navigate('/unsettledbet')}>
                {BetsIcon(C)}
                {'  Bets '}
              </a>
            </div>
            <div {...C} className="hideMobileHeader" style={{ display: 'flex', alignItems: 'center' }}>
              <img {...C} alt="logo" className="site-logo-after ms-1" src={KX_LOGO} onClick={() => navigate('/')} />
              {searchResults}
            </div>
            <div {...C} className="demo">
              <div {...C} className="Myaccount-after-login">
                <div {...C} className="user-blnc">
                  {balanceLoading && balance == null ? (
                    <div {...C} className="loadingBalance">
                      {Array.from({ length: 7 }, (_, i) => <span key={i} {...C}></span>)}
                    </div>
                  ) : (
                    <div {...C} className="balance" style={{ textAlign: 'center' }}>
                      <span {...C} className="pti-ic" style={{ display: 'block' }}>
                        {' Main '}
                        <strong {...C}>
                          {'PTI '}
                          <span {...C} className="userTotalBalance">{money(balance)}</span>
                        </strong>
                      </span>
                      <span {...C} className="exp-topcount" style={{ marginLeft: '20px' }}>
                        {'Exposure '}
                        <a {...C} className="mouse-pointer" onClick={() => setExposureOpen(true)}>
                          <strong {...C}>
                            (
                            <span {...C} className="exp-red userTotalExposure">{money(exposure)}</span>
                            {') '}
                          </strong>
                        </a>
                      </span>
                    </div>
                  )}
                </div>
                <div {...C} className="login-refresh-MAcnt-btn">
                  <span {...C} className="head-refresh">
                    <a {...C} id="menuRefresh" style={{ cursor: 'pointer' }} onClick={reloadBalance}></a>
                  </span>
                  <a {...C} href="javascript:;" title="Setting" className="a-referesh">
                    <img {...C} src={kx('assets/reload-bg-transparant.gif')} />
                  </a>
                </div>
                <div {...C} ref={account.ref} placement="bottom right" className="myaccnt hidden-xs">
                  <a
                    {...C}
                    aria-haspopup="true"
                    id="accountPopup"
                    role="button"
                    aria-expanded={account.open ? 'true' : 'false'}
                    className={`nav-link My-acc-font${account.open ? ' show' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => account.setOpen((v) => !v)}
                  >
                    My Account
                  </a>
                  <ul {...C} className={`dropdown-menu${account.open ? ' show' : ''}`}>
                    <div {...C} className="dropdown-header text-left">
                      <strong {...C}>exchange</strong>
                    </div>
                    {ACCOUNT_MENU.map((m) => (
                      <a
                        key={m.label}
                        {...C}
                        className="dropdown-item"
                        onClick={() => { account.setOpen(false); if (m.route) navigate(m.route); }}
                      >
                        {m.label}
                      </a>
                    ))}
                    <a {...C} className="dropdown-item drp-logout" onClick={() => { account.setOpen(false); logoutUser(); }}>
                      <button {...C} className="btn btn-primary logout-btn">
                        {'LOGOUT '}
                        <i {...C} aria-hidden="true" className="fa fa-sign-out-alt ms-2"></i>
                      </button>
                    </a>
                  </ul>
                </div>
              </div>
              <div {...C} className="reload-banking-btns">
                <div {...C} className="bet-refresh" onClick={reloadBalance}>
                  <a {...C} title="refesh" className="a-referesh">{RefreshIcon(C)}</a>
                </div>
                <div {...C} className="bet-setting setting-ic ml-2 mr-1">
                  <a {...C} title="Setting" className="a-setting a-referesh" onClick={() => navigate('/setstake')}>
                    {SettingIcon(C)}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <KxModal open={ageOpen} onClose={() => setAgeOpen(false)} id="ageconfirmationModal" labelledBy="ageconfirmationModal" attrs={C}>
        <div {...C} className="modal-dialog modal-dialog-centered">
          <div {...C} className="modal-content">
            <div {...C} className="login-popup-content">
              <div {...C} className="modal-body ageconfirmationModalclass">
                <div {...C} className="login-panel-container confirm-container">
                  <div {...C} className="confirm-text">
                    <div {...C} className="header-popup">
                      <a {...C} aria-label="Close" className="ui-link" onClick={() => setAgeOpen(false)}>
                        <i {...C} className="fas fa-times"></i>
                      </a>
                    </div>
                    <div {...C} className="text1 text-confirm-bold">Non-Gambling Territories.</div>
                    <hr {...C} className="confirm-line" />
                    <div {...C} className="text2">
                      Connecting to our site from non gambling countries, it will be User&apos;s responsibility to ensure that their use of the service is lawful.
                    </div>
                  </div>
                  <div {...C} className="confirm-text">
                    <div {...C} className="text1 text-confirm-bold">Underage gambling is prohibited.</div>
                    <hr {...C} className="confirm-line" />
                    <div {...C} className="text2">
                      Please confirm if you are <span {...C}>18 years old and above</span> as of today.{' '}
                    </div>
                  </div>
                  <div {...C} className="confirm-button">
                    <button {...C} tabIndex={0} className="btn-verification btn-confirm" onClick={() => { setAgeOpen(false); navigate('/login'); }}>
                      <span {...C}>Confirm</span>
                    </button>
                    <button {...C} className="btn-verification" onClick={() => setAgeOpen(false)}>
                      <a {...C} style={{ textDecoration: 'none' }}><span {...C}>Exit</span></a>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </KxModal>

      <ExposureModal
        open={exposureOpen}
        onClose={() => setExposureOpen(false)}
        id="exposureModals"
        tableClass="table table-responsive table-bordered"
        C={C}
      />
    </app-header>
  );
}
