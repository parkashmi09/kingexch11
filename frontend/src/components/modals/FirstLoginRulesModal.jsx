import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RULES_DATA } from '../../data/rulesData';
import { acceptRules } from '../../apiservices/authService';
import { rulesAccepted, logout } from '../../redux/userSlice';
import { bToastError } from '../BToast';

// Served locally, not hotlinked from the reference CDN
const FLAG_URL = '/assets/icons/flag_english.png';

// BootstrapVue-style incrementing component ids (__BVID__163 etc.) — the
// reference markup carries them on the outer wrapper, dialog, content, header,
// title, body and backdrop, so they are mirrored here too.
let bvidCounter = 6007;

function FirstLoginRulesModal({ show, onClose }) {
  const bvid = useRef(`__BVID__${++bvidCounter}`).current;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openSport, setOpenSport] = useState(null);
  // Cancel doesn't dismiss — it swaps the footer for a lone red Close button
  // and starts the way out (see below).
  const [cancelled, setCancelled] = useState(false);
  const [openGames, setOpenGames] = useState({});
  const [accepting, setAccepting] = useState(false);
  // Bootstrap's dropdown JS isn't loaded, so the language menu is driven here.
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  // Accept persists server-side (`rules_accepted = true`), so the modal is gone
  // for good — on this device and every other one. Only close on success: if the
  // call fails the flag is still false, and closing anyway would hide the modal
  // for this session while the account stays un-accepted.
  const handleAccept = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      const res = await acceptRules();
      if (res?.success) {
        dispatch(rulesAccepted());
        onClose();
      } else {
        bToastError(res?.error || 'Could not save your acceptance. Please try again.');
      }
    } catch (err) {
      bToastError(err?.response?.data?.error || err?.message || 'Could not save your acceptance. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  // Declining the rules means not staying signed in: the account hasn't
  // accepted, so the session ends. Close fires it at once; doing nothing
  // fires it anyway two seconds after Cancel. The exit mirrors the Header's
  // logout exactly — flag + logout + home — so the logged-out landing (and
  // Home's post-logout choreography) is the same either way.
  const declineAndLogout = useCallback(() => {
    sessionStorage.setItem('justLoggedOut', '1');
    dispatch(logout());
    onClose();
    navigate('/', { replace: true });
  }, [dispatch, onClose, navigate]);

  useEffect(() => {
    if (!cancelled) return undefined;
    const t = setTimeout(declineAndLogout, 2000);
    return () => clearTimeout(t);
  }, [cancelled, declineAndLogout]);

  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [show]);

  // Click anywhere outside the toggle/menu closes it, like Bootstrap does.
  useEffect(() => {
    if (!langOpen) return undefined;
    const onDocClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [langOpen]);

  if (!show) return null;

  const toggleSport = (idx) => {
    setOpenSport((prev) => (prev === idx ? null : idx));
    setOpenGames({});
  };

  const toggleGame = (sportIdx, gameIdx) => {
    const key = `${sportIdx}-${gameIdx}`;
    setOpenGames((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return createPortal(
    // Reference wraps dialog + backdrop in one absolutely-positioned outer div,
    // with the backdrop as the LAST child (not a preceding sibling).
    <div id={`${bvid}___BV_modal_outer_`} style={{ position: 'absolute', zIndex: 1040 }}>
      <div
        id={bvid}
        role="dialog"
        aria-labelledby={`${bvid}___BV_modal_title_`}
        aria-describedby={`${bvid}___BV_modal_body_`}
        className="modal fade show"
        aria-modal="true"
        style={{ display: 'block' }}
      >
        <div className="modal-dialog modal-lg">
          {/* Focus sentinels — BootstrapVue renders one on each side of the dialog */}
          <span tabIndex={0}></span>
          <div id={`${bvid}___BV_modal_content_`} tabIndex={-1} className="modal-content">
            <header id={`${bvid}___BV_modal_header_`} className="modal-header">
              <h5 id={`${bvid}___BV_modal_title_`} className="modal-title">Rules</h5>
            </header>
            <div id={`${bvid}___BV_modal_body_`} className="modal-body">
              <div>
                <div className="main-rules-container">
                  <div
                    className={`dropdown rules-language-container${langOpen ? ' show' : ''}`}
                    ref={langRef}
                  >
                    <div
                      data-toggle="dropdown"
                      aria-expanded={langOpen ? 'true' : 'false'}
                      className="dropdown-toggle"
                      onClick={(e) => {
                        // Keep the click off document, otherwise the outside-click
                        // listener registered by the very same toggle closes it again.
                        e.stopPropagation();
                        setLangOpen((prev) => !prev);
                      }}
                    >
                      <img src={FLAG_URL} alt="English" />
                      {' '}English{' '}
                      <i className="fas fa-angle-down ml-1"></i>
                    </div>
                    <div
                      className={`dropdown-menu rules-language${langOpen ? ' show' : ''}`}
                      x-placement={langOpen ? 'bottom-start' : undefined}
                    >
                      <div onClick={() => setLangOpen(false)}>
                        <img src={FLAG_URL} alt="English" />{' '}
                        <span>English</span>
                      </div>
                    </div>
                  </div>

                  <div className="menu-box">
                    <div id="accordion">
                      {RULES_DATA.map((sport, sportIdx) => (
                        <div className="card" key={sportIdx}>
                          <div className="card-header" id={`eventhead${sportIdx}`}>
                            <a
                              href="javascript:void(0)"
                              data-toggle="collapse"
                              data-target={`#event${sportIdx}`}
                              aria-controls={`event${sportIdx}`}
                              className={openSport === sportIdx ? '' : 'collapsed'}
                              onClick={() => toggleSport(sportIdx)}
                            >
                              {sport.name}
                            </a>
                          </div>
                          <div
                            id={`event${sportIdx}`}
                            aria-labelledby={`eventhead${sportIdx}`}
                            data-parent="#accordion"
                            className={`collapse${openSport === sportIdx ? ' show' : ''}`}
                          >
                            <div className="card-body" id={`eventaccordion${sportIdx}`}>
                              {sport.games.map((game, gameIdx) => {
                                const gameKey = `${sportIdx}-${gameIdx}`;
                                const isGameOpen = !!openGames[gameKey];
                                return (
                                  <div className="card" key={gameIdx}>
                                    <div className="card-header">
                                      <a
                                        href="javascript:void(0)"
                                        data-toggle="collapse"
                                        data-target={`#event${sportIdx}game${gameIdx}`}
                                        className={isGameOpen ? '' : 'collapsed'}
                                        onClick={() => toggleGame(sportIdx, gameIdx)}
                                      >
                                        {game.title}
                                      </a>
                                    </div>
                                    <div
                                      className={`card-body collapse${isGameOpen ? ' show' : ''}`}
                                      data-parent={`#eventaccordion${sportIdx}`}
                                      id={`event${sportIdx}game${gameIdx}`}
                                    >
                                      {game.rules.map((rule, ruleIdx) => (
                                        <div
                                          key={ruleIdx}
                                          className={`rule-text${rule.danger ? ' text-danger' : ''}`}
                                        >
                                          {rule.text}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {cancelled ? (
                /* Post-Cancel footer: a lone red Close, as the reference shows.
                   Clicking it logs out immediately; ignoring it logs out on the
                   2s timer above either way. */
                <button type="button" className="btn btn-danger" onClick={declineAndLogout}>
                  Close
                </button>
              ) : (
                <>
                  <span>I agree all rules</span>
                  <div>
                    {/* Cancel does NOT accept — it flips the footer to Close and
                        arms the auto-logout. */}
                    <button type="button" className="btn btn-danger" onClick={() => setCancelled(true)} disabled={accepting}>
                      Cancel
                    </button>{' '}
                    <button type="button" className="btn btn-success" onClick={handleAccept} disabled={accepting}>
                      {accepting ? 'Accept' : 'Accept'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <span tabIndex={0}></span>
        </div>
      </div>
      <div id={`${bvid}___BV_modal_backdrop_`} className="modal-backdrop"></div>
    </div>,
    document.body
  );
}

export default FirstLoginRulesModal;
