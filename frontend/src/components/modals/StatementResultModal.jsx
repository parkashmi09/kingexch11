import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useEnterTransition from '../../hooks/useEnterTransition';
import MarketTooltip from '../gamedetails/MarketTooltip';

// BootstrapVue-style incrementing component ids (__BVID__8597 etc.)
let bvidCounter = 8596;
let rowIdCounter = 8637;

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'back', label: 'Back' },
  { id: 'lay', label: 'Lay' },
  { id: 'deleted', label: 'Deleted' },
];

// A bet's side, as the reference classes it: `lay-border` on lay/no rows.
// The API already resolves it into `side`; the raw `betType` is the fallback.
const isLayBet = (b) => {
  if (b.side) return String(b.side).toUpperCase() === 'LAY';
  const t = String(b.betType ?? b.bet_type ?? '').toLowerCase();
  return t === 'lay' || t === 'no';
};

// void / refund / cancelled bets — the Deleted tab, and out of the totals
const isDeletedBet = (b) => {
  if (b.deleted === true) return true;
  const s = `${b.status ?? ''} ${b.result_status ?? b.resultStatus ?? ''}`.toLowerCase();
  return s.includes('deleted') || s.includes('void') || s.includes('refund') || s.includes('cancel');
};

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// The endpoint returns raw SportsBet rows, so every column has two spellings:
// the documented slim one and the column name it actually ships. Numbers come
// as fixed-decimal strings ("130.0000", "100.00") — print them like the
// reference does, without the trailing zeros.
const cell = (...values) => {
  const v = values.find((x) => x !== undefined && x !== null && x !== '');
  if (v === undefined) return '';
  const n = Number(v);
  return Number.isFinite(n) && String(v).trim() !== '' ? Number(n.toFixed(2)) : v;
};

// Non-fancy markets carry no fancy_name — and some rows carry the *string*
// "NULL" rather than a real null — so fall through to the selection name.
const isBlank = (v) => v == null || String(v).trim() === '' || String(v).trim().toLowerCase() === 'null';

const betNation = (b) => [b.nation, b.fancy_name, b.selection_name].find((v) => !isBlank(v)) ?? '';

// Bet dates arrive as ISO strings; the reference prints them with the offset.
const formatBetDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d)) return String(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const oh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const om = String(Math.abs(offset) % 60).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}:${ss} (UTC${sign}${oh}:${om})`;
};

/**
 * The "Result" modal behind an account-statement row: the settled market's
 * header line, its winner, and every bet the user had on it.
 *
 * `bets` is supplied by the caller — this component only renders and filters.
 * There is no loading state on purpose: the caller runs its loader over the
 * statement table and mounts this only once the bets are in.
 */
export default function StatementResultModal({ show, onClose, ...content }) {
  const bvid = useRef(`__BVID__${++bvidCounter}`).current;
  const [filter, setFilter] = useState('all');
  const { mounted, entered } = useEnterTransition(show);

  // Closing clears the caller's state immediately, but the dialog stays mounted
  // for the fade — keep the last content so it doesn't empty out on the way out.
  const shown = useRef(content);
  if (show) shown.current = content;
  const { breadcrumb = '', winner = '', gameTime = '', bets = [], error = null } = shown.current;

  // A fresh open starts on All — the previous row's filter must not carry over
  useEffect(() => { if (show) setFilter('all'); }, [show]);

  // BootstrapVue marks the body while a modal is open (locks scroll, and the
  // reference CSS keys off it)
  useEffect(() => {
    if (!show) return;
    document.body.classList.add('modal-open');
    document.body.setAttribute('data-modal-open-count', '1');
    return () => {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-modal-open-count');
    };
  }, [show]);

  if (!mounted) return null;

  // Deleted bets live only under their own tab — All/Back/Lay exclude them.
  const visible = bets.filter((b) => {
    if (filter === 'deleted') return isDeletedBet(b);
    if (isDeletedBet(b)) return false;
    if (filter === 'all') return true;
    return filter === 'lay' ? isLayBet(b) : !isLayBet(b);
  });

  // Totals follow the VISIBLE rows, so switching to Back/Lay re-totals that side
  const totalWin = visible.reduce((sum, b) => sum + num(b.win), 0);

  return createPortal(
    <div id={`${bvid}___BV_modal_outer_`} style={{ position: 'absolute', zIndex: 1040 }}>
      <div
        id={bvid}
        role="dialog"
        aria-labelledby={`${bvid}___BV_modal_title_`}
        aria-describedby={`${bvid}___BV_modal_body_`}
        className={`modal fade${entered ? ' show' : ''}`}
        aria-modal="true"
        style={{ display: 'block' }}
        // Click-outside closes. On `.modal`, not the backdrop: `.modal` covers
        // the viewport and stacks above it, so the backdrop never sees the
        // click. The target check spares clicks bubbling out of the dialog.
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal-dialog modal-xl">
          {/* Focus sentinels — BootstrapVue renders one either side of the dialog */}
          <span tabIndex={0}></span>
          <div id={`${bvid}___BV_modal_content_`} tabIndex={-1} className="modal-content">
            <header id={`${bvid}___BV_modal_header_`} className="modal-header">
              <h5 id={`${bvid}___BV_modal_title_`} className="modal-title">Result</h5>
              <button type="button" aria-label="Close" className="close" onClick={onClose}>&times;</button>
            </header>
            <div id={`${bvid}___BV_modal_body_`} className="modal-body">
              <div className="mt-1">{breadcrumb}</div>
              <div className="mt-1">
                <div className="row">
                  <div className="col-6">Winner: {winner}</div>
                  <div className="col-6 text-right">
                    Game Time:{' '}
                    <span>{gameTime}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="mt-2">
                  {FILTERS.map((f) => (
                    <div key={f.id} className="custom-control custom-radio custom-control-inline">
                      <input
                        type="radio"
                        id={`soda-${f.id}`}
                        name="example"
                        value={f.id}
                        checked={filter === f.id}
                        onChange={() => setFilter(f.id)}
                        className="custom-control-input"
                      />
                      <label htmlFor={`soda-${f.id}`} className="custom-control-label">{f.label}</label>
                    </div>
                  ))}
                  <div className="custom-control-inline total-soda">
                    <div>
                      Total Bets:{' '}
                      <span className="text-success mr-2">{visible.length}</span> Total Win:{' '}
                      <span className={totalWin < 0 ? 'text-danger' : 'text-success'}>
                        {Number(totalWin.toFixed(2))}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="table-responsive report-table-modal mt-2 report-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="bet-nation"><div>Nation</div></th>
                        <th className="text-right bet-user-rate"><div>Rate</div></th>
                        <th className="text-right bet-user-rate"><div>Bhav</div></th>
                        <th className="text-right bet-amount"><div>Amount</div></th>
                        <th className="text-right bet-amount"><div>Win</div></th>
                        <th className="bet-date"><div>Date</div></th>
                        <th className="bet-ip"><div>Ip Address</div></th>
                        <th className="bet-remark"><div>Browser Details</div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {error ? (
                        <tr><td colSpan={8} className="text-center">{error}</td></tr>
                      ) : visible.length === 0 ? (
                        <tr><td colSpan={8} className="text-center">no records found</td></tr>
                      ) : visible.map((b, i) => {
                        const rowId = `__BVID__${++rowIdCounter}`;
                        const win = num(b.win);
                        return (
                          <tr key={b.id ?? i} className={isLayBet(b) ? 'lay-border' : 'back-border'}>
                            <td className="bet-nation">
                              <div>
                                <div className="d-inline-block vm custom-control custom-checkbox">
                                  <input type="checkbox" className="custom-control-input" value={i} id={rowId} readOnly />
                                  <label className="custom-control-label" htmlFor={rowId}></label>
                                </div>{' '}
                                <span className="d-inline">{betNation(b)}</span>
                              </div>
                            </td>
                            <td className="text-right bet-user-rate"><div>{cell(b.rate, b.odds)}</div></td>
                            <td className="text-right bet-user-rate"><div>{cell(b.bhav, b.size)}</div></td>
                            <td className="text-right bet-amount"><div>{cell(b.amount, b.stake_amount)}</div></td>
                            {/* `win` is null while the bet is still pending */}
                            <td className="text-right bet-amount"><div>{b.win == null ? '' : Number(win.toFixed(2))}</div></td>
                            <td className="bet-date"><div>{formatBetDate(b.date ?? b.created_at)}</div></td>
                            <td className="bet-ip"><div>{b.ipAddress ?? b.ip_address ?? ''}</div></td>
                            <td className="bet-remark">
                              {/* Reference shows the user-agent in a BootstrapVue
                                  tooltip below the cell, not the native title box */}
                              <MarketTooltip as="u" trigger="hover" placement="bottom" text={b.browser ?? ''}>
                                Detail
                              </MarketTooltip>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <span tabIndex={0}></span>
        </div>
      </div>
      <div
        id={`${bvid}___BV_modal_backdrop_`}
        className="modal-backdrop"
        // Faded inline rather than via `.fade`/`.show`, which would swap in
        // `.modal-backdrop.show` (opacity .9 on #131313) and darken the overlay
        style={{ transition: 'opacity .15s linear', opacity: entered ? undefined : 0 }}
      ></div>
    </div>,
    document.body
  );
}
