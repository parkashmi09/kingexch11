import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { bToastSuccess, bToastError } from '../BToast';
import { getStakeButtonValues, updateStakeButtonValues } from '../../apiservices/stakeButtonService';
import { fetchStakeButtonsThunk } from '../../redux/stakeButtonSlice';

const EMPTY_ROW = { label: '', value: '' };
const makeRows = (count) => Array.from({ length: count }, () => ({ ...EMPTY_ROW }));

// The reference table always shows at least this many rows, even on an account
// that has fewer configured. It is a FLOOR, not a cap — see populateRows.
const MIN_ROWS = 6;

// BootstrapVue-style incrementing component ids (__BVID__162 etc.)
let bvidCounter = 160;

// The reference inputs carry inline onkeypress filters. React refuses lowercase
// on* string props, so the attributes are applied after render (see effect).
const LABEL_KEYPRESS =
  'return (event.charCode >= 48 && event.charCode <= 57) || (event.charCode >= 65 && event.charCode <= 90) || (event.charCode >= 97 && event.charCode <= 122)';
const VALUE_KEYPRESS = 'return event.charCode >= 48 && event.charCode <= 57';

// One row per button the server actually stores, padded out to MIN_ROWS so the
// table never looks empty. Previously this truncated to a fixed six, so an
// account with eight game buttons could not see — or keep — the last two: they
// were invisible in the editor AND dropped from the payload on the next save.
function populateRows(apiArr) {
  const list = Array.isArray(apiArr) ? apiArr : [];
  const rows = makeRows(Math.max(MIN_ROWS, list.length));
  list.forEach((btn, i) => {
    rows[i] = { label: btn.label ?? '', value: btn.value ?? '' };
  });
  return rows;
}

export default function SetButtonValueModal({ show, onClose }) {
  const dispatch = useDispatch();
  const bvid = useRef(`__BVID__${++bvidCounter}`).current;
  const [activeTab, setActiveTab] = useState('game');
  const [gameButtons, setGameButtons] = useState(makeRows(MIN_ROWS));
  const [casinoButtons, setCasinoButtons] = useState(makeRows(MIN_ROWS));
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // BootstrapVue marks the body while a modal is open (locks scroll and is
  // what the reference CSS keys off): class="modal-open" + open-count attr.
  useEffect(() => {
    if (!show) return;
    document.body.classList.add('modal-open');
    document.body.setAttribute('data-modal-open-count', '1');
    return () => {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-modal-open-count');
    };
  }, [show]);

  // Apply the reference's inline onkeypress attributes once the table renders
  useEffect(() => {
    if (!show || loading) return;
    document.querySelectorAll(`#${bvid} .button-value input[type="text"]`)
      .forEach((el) => el.setAttribute('onkeypress', LABEL_KEYPRESS));
    document.querySelectorAll(`#${bvid} .button-value input[type="number"]`)
      .forEach((el) => el.setAttribute('onkeypress', VALUE_KEYPRESS));
  }, [show, loading, bvid]);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    getStakeButtonValues()
      .then((data) => {
        setGameButtons(populateRows(data?.game_buttons));
        setCasinoButtons(populateRows(data?.casino_buttons));
      })
      .catch(() => {
        setGameButtons(makeRows(MIN_ROWS));
        setCasinoButtons(makeRows(MIN_ROWS));
      })
      .finally(() => setLoading(false));
  }, [show]);

  function updateGameButton(i, field, val) {
    setGameButtons((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  }

  function updateCasinoButton(i, field, val) {
    setCasinoButtons((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  }

  async function handleSubmit(type) {
    setSubmitting(true);
    try {
      const payload =
        type === 'game'
          ? { game_buttons: gameButtons.map((b) => ({ label: b.label, value: Number(b.value) })) }
          : { casino_buttons: casinoButtons.map((b) => ({ label: b.label, value: Number(b.value) })) };

      await updateStakeButtonValues(payload);
      dispatch(fetchStakeButtonsThunk());
      bToastSuccess('Update Button Value');
      onClose();
    } catch (err) {
      bToastError(err.message || 'Failed to update button values');
    } finally {
      setSubmitting(false);
    }
  }

  if (!show) return null;

  return createPortal(
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
        <div className="modal-dialog modal-md">
          <span tabIndex={0}></span>
          <div id={`${bvid}___BV_modal_content_`} tabIndex={-1} className="modal-content">
            <header id={`${bvid}___BV_modal_header_`} className="modal-header">
              <h5 id={`${bvid}___BV_modal_title_`} className="modal-title">Set Button Value</h5>
              <button type="button" aria-label="Close" className="close" onClick={onClose}>
                &times;
              </button>
            </header>
            <div id={`${bvid}___BV_modal_body_`} className="modal-body">
              {loading ? (
                <div className="text-center py-3">Loading...</div>
              ) : (
                <div className="">
                  <ul className="nav nav-tabs buttons-tabs">
                    <li className="nav-item">
                      <a
                        data-toggle="tab"
                        href="#game-btn"
                        className={activeTab === 'game' ? 'active nav-link' : 'nav-link'}
                        onClick={() => setActiveTab('game')}
                      >
                        <span>Game Buttons</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        data-toggle="tab"
                        href="#casino-btn"
                        className={activeTab === 'casino' ? 'active nav-link' : 'nav-link'}
                        onClick={() => setActiveTab('casino')}
                      >
                        <span>Casino Buttons</span>
                      </a>
                    </li>
                  </ul>
                  <div className="tab-content">
                    {/* Game Buttons Tab */}
                    <div
                      id="game-btn"
                      className={`bet-table tab-pane${activeTab === 'game' ? ' active' : ' fade'}`}
                    >
                      <div className="table-responsive">
                        <table className="table button-value">
                          <thead>
                            <tr>
                              <th>Price Label</th>
                              <th>Price Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gameButtons.map((btn, i) => (
                              <tr key={i}>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={btn.label}
                                    onChange={(e) => updateGameButton(i, 'label', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={btn.value}
                                    onChange={(e) => updateGameButton(i, 'value', e.target.value)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="text-right">
                        <button
                          className="btn btn-primary btn-block"
                          onClick={() => handleSubmit('game')}
                          disabled={submitting}
                        >
                          Submit
                        </button>
                      </div>
                    </div>

                    {/* Casino Buttons Tab */}
                    <div
                      id="casino-btn"
                      className={`bet-table tab-pane${activeTab === 'casino' ? ' active' : ' fade'}`}
                    >
                      <div className="table-responsive">
                        <table className="table button-value">
                          <thead>
                            <tr>
                              <th>Price Label</th>
                              <th>Price Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {casinoButtons.map((btn, i) => (
                              <tr key={i}>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={btn.label}
                                    onChange={(e) => updateCasinoButton(i, 'label', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={btn.value}
                                    onChange={(e) => updateCasinoButton(i, 'value', e.target.value)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="text-right">
                        <button
                          className="btn btn-primary btn-block"
                          onClick={() => handleSubmit('casino')}
                          disabled={submitting}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <span tabIndex={0}></span>
        </div>
      </div>
      <div id={`${bvid}___BV_modal_backdrop_`} className="modal-backdrop" onClick={onClose}></div>
    </div>,
    document.body
  );
}
