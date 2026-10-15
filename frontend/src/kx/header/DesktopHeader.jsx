import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { KX_LOGO } from '../assets';
import KxModal from '../KxModal';
import { onAgeModal } from '../ageModal';
import useLoginFlow from '../../hooks/useLoginFlow';
import HeaderNav, { setNavActive } from './HeaderNav';
import ExposureModal from './ExposureModal';
import useHeaderSearch from './useHeaderSearch';
import useDropdown from './useDropdown';
import { ACCOUNT_MENU, money, useAccountActions } from './accountMenu';

const C = ng('kdh');
const L = ng('kl'); // app-layout's scope, which the host element also carries

/**
 * app-desktop-header — the reference's header above 992px: logo, the search
 * toggle, inline Username/Password + Login (or, signed in, balance/exposure,
 * refresh and the My Account menu), then the sports bar (app-header-nav).
 *
 * Login follows the reference exactly: with both fields filled the button
 * opens the 18+ confirmation and Confirm signs in; with either one empty the
 * button does nothing, and Confirm (from Multi Markets) goes to /login.
 */
export default function DesktopHeader() {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const { user, balance, exposure, balanceLoading } = useSelector((s) => s.user);
  const login = useLoginFlow();
  const { reloadBalance, logoutUser } = useAccountActions();
  const search = useHeaderSearch();
  const account = useDropdown();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearchShow, setIsSearchShow] = useState(false);
  const [isActiveSearch, setIsActiveSearch] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  useEffect(() => onAgeModal('(min-width: 993px)', () => setAgeOpen(true)), []);
  const [exposureOpen, setExposureOpen] = useState(false);

  const hasCredentials = Boolean(userName && password);

  const submitLogin = async () => {
    setAgeOpen(false);
    if (password.length < 6) { setErrorMessage('Password must be 6 characters'); return; }
    const result = await login(userName.trim().toLowerCase(), password);
    if (!result.ok) {
      // The reference clears both fields on a failed attempt.
      setUserName('');
      setPassword('');
      setErrorMessage(result.error);
    }
  };

  const confirm = () => {
    if (hasCredentials) submitLogin();
    else { setAgeOpen(false); navigate('/login'); }
  };

  const toggleSearch = () => {
    setIsSearchShow((v) => !v);
    setIsActiveSearch(false);
  };

  return (
    <app-desktop-header {...L} {...host('kdh')} {...KX} className="headerDesktop hideDekstop">
      <div {...C} className="site-header app-header">
        <div {...C} className="before-login-items">
          <div {...C} className="site-logo-con" style={{ display: 'flex', alignItems: 'center' }}>
            <img {...C} alt="" className="site-logo" style={{ cursor: 'pointer' }} src={KX_LOGO} onClick={() => { setNavActive('Home'); navigate('/home'); }} />
          </div>
          <div {...C} className="login-signup-uname-pass">
            <ul {...C} className="desktopviewButton hideDekstop showDekstop" style={{ position: 'relative' }}>
              <li {...C}>
                {isSearchShow && (
                  <div
                    {...C}
                    className={`searchIconDiv me-2 ng-input 456456 slide-in${isActiveSearch ? ' border-bottom-0' : ''}`}
                    style={{ position: 'absolute', left: '-18.5rem', top: '3px' }}
                  >
                    <i {...C} aria-hidden="true" className="fa fa-search searchIcon"></i>
                    <input
                      {...C}
                      type="text"
                      aria-label="Search"
                      id="myInput"
                      placeholder=""
                      className="form-control searchbar"
                      value={search.value}
                      onChange={(e) => search.setValue(e.target.value)}
                      onFocus={() => setIsActiveSearch(true)}
                    />
                    <span {...C} aria-hidden="true" id="myClose" className="searchIconCross" onClick={() => { search.setValue(''); setIsSearchShow(false); setIsActiveSearch(false); }}>
                      ×
                    </span>
                    {isActiveSearch && (
                      <div {...C} className="searchBox" style={{ position: 'absolute', left: 0, top: '23.5px' }}>
                        <div {...C} className="scrollSearchBox">
                          <ul {...C} className="search-game-ul" style={{ marginBottom: '0px' }}>
                            {search.results.map((r) => (
                              <li key={`${r.sid}-${r.gmid}`} {...C}>
                                <a
                                  {...C}
                                  style={{ width: '100%', display: 'block' }}
                                  onClick={() => { setIsSearchShow(false); navigate(`/gamedetails/${r.sid}/${r.gmid}`); }}
                                >
                                  <div {...C} className="d-flex justify-content-between w-100">
                                    <div {...C} className="search-game-name d-flex"><b {...C}>{r.sportName}</b></div>
                                    <div {...C} className="text-end">{r.date}</div>
                                  </div>
                                  <div {...C} className="game-teams w-100">{r.eventName}</div>
                                </a>
                              </li>
                            ))}
                            {!search.results.length && (
                              <li {...C} className="no-item-founds"><a {...C}>No items found</a></li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
              <li {...C} className="search float-left">
                <a {...C} onClick={toggleSearch}>
                  <i {...C} id="searchiconDesktopID" className="fas fa-search-plus"></i>
                </a>
              </li>
              {!isAuth && (
                <li {...C} className="float-left account">
                  <div {...C} className="d-flex">
                    <div {...C} className="form-group mb-0">
                      <input
                        {...C}
                        name="usernameForLogin"
                        type="text"
                        placeholder="Username"
                        className="form-control uname"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </div>
                    <div {...C} className="form-group mb-0 margin-setting">
                      <input
                        {...C}
                        name="passForLogin"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Password"
                        className="form-control pass"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyUp={(e) => e.key === 'Enter' && hasCredentials && setAgeOpen(true)}
                      />
                    </div>
                  </div>
                  {errorMessage && <div {...C} className="err-invalid"> {errorMessage}</div>}
                </li>
              )}
            </ul>
            {isAuth && (
              <div {...C} className="Myaccount-after-login">
                <div {...C} className="user-blnc">
                  {balanceLoading && balance == null ? (
                    <div {...C} className="loadingBalance">
                      {Array.from({ length: 10 }, (_, i) => <span key={i} {...C}></span>)}
                    </div>
                  ) : (
                    <div {...C} className="balance" style={{ textAlign: 'center' }}>
                      <p {...C} className="pti-ic" style={{ display: 'block' }}>
                        {' Main '}
                        <strong {...C}>
                          {'PTI '}
                          <span {...C} className="userTotalBalance">{money(balance)}</span>
                        </strong>
                      </p>
                      <p {...C} className="exp-topcount">
                        {'Exposure '}
                        <a {...C} className="mouse-pointer" onClick={() => setExposureOpen(true)}>
                          <strong {...C}>
                            (
                            <span {...C} className="exp-red userTotalExposure">{money(exposure)}</span>
                            {') '}
                          </strong>
                        </a>
                      </p>
                    </div>
                  )}
                </div>
                <div {...C} className="login-refresh-MAcnt-btn">
                  <span {...C} className="head-refresh">
                    <a {...C} id="menuRefresh" style={{ cursor: 'pointer' }} onClick={reloadBalance}>
                      <i {...C} className="fas fa-undo-alt"></i>
                    </a>
                  </span>
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
                    <i {...C} className="fas fa-user"></i>
                    My Account
                    <i {...C} className="fas fa-sort-down" style={{ position: 'relative', top: '-2px' }}></i>
                  </a>
                  <ul
                    {...C}
                    className={`dropdown-menu align${account.open ? ' show' : ''}`}
                    // What Popper leaves on the reference's dropdown
                    // (placement "bottom right"): right-aligned under the toggle.
                    style={account.open ? { position: 'absolute', inset: '0px 0px auto auto', margin: 0, transform: 'translate(-20px, 27px)' } : undefined}
                  >
                    <li {...C}>
                      <div {...C} className="dropdown-header text-left">
                        <strong {...C}>{user?.username}</strong>
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
                          <i {...C} aria-hidden="true" className="fa fa-sign-out-alt"></i>
                        </button>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {!isAuth && (
              <div {...C} className="login-signup">
                <button {...C} className="btn login me-1 222" onClick={hasCredentials ? () => setAgeOpen(true) : undefined}>
                  <b {...C} style={{ width: '33px', height: '18px' }}> Login </b>
                  <i {...C} className="fa fa-sign-in"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <app-header-nav {...C} {...host('khn')} className="hideMobile">
        <HeaderNav onAgeConfirm={() => setAgeOpen(true)} />
      </app-header-nav>

      <ExposureModal
        open={exposureOpen}
        onClose={() => setExposureOpen(false)}
        id="exposureModalss"
        tableClass="table table-bordered"
        C={C}
      />

      <KxModal open={ageOpen} onClose={() => setAgeOpen(false)} id="ageconfirmationModalNew" labelledBy="ageconfirmationModalNew" attrs={C}>
        <div {...C} className="modal-dialog modal-dialog-centered">
          <div {...C} className="modal-content">
            <div {...C} className="modal-body ageconfirmationModalclass">
              <div {...C} className="header-popup">
                <a {...C} aria-label="Close" className="ui-link" onClick={() => setAgeOpen(false)}>
                  <i {...C} className="fas fa-times"></i>
                </a>
              </div>
              <div {...C} className="login-panel-container confirm-container">
                <div {...C} className="confirm-text">
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
                  <button {...C} tabIndex={0} className="btn-verification btn-confirm" onClick={confirm}>
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
      </KxModal>
    </app-desktop-header>
  );
}
