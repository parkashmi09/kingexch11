import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useEnterTransition from '../../hooks/useEnterTransition';
import ResultContentSwitch from '../casino/results/ResultContentSwitch';
import MarketTooltip from '../gamedetails/MarketTooltip';

// BootstrapVue-style incrementing component ids (__BVID__7993 etc.)
let bvidCounter = 7992;
let rowIdCounter = 8029;

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'back', label: 'Back' },
  { id: 'lay', label: 'Lay' },
  { id: 'deleted', label: 'Deleted' },
];

// `side` is resolved by the endpoint (BACK | LAY); `type` is the raw column it
// came from, kept as the fallback.
const isLayBet = (b) => {
  if (b.side) return String(b.side).toUpperCase() === 'LAY';
  return String(b.type ?? b.bet_type ?? '').toLowerCase() === 'lay';
};

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Net P/L of a settled casino bet, the way the settlement worker computes it:
// on a win the payout is stake × odds and the exposure released is `stake` for
// a back / `stake × (odds − 1)` for a lay, so the profit is the mirror of what
// a loss costs. Un-settled and voided bets are worth 0.
const betWin = (b) => {
  // The statement endpoint already returns the settled P/L as `win` (same maths
  // the settlement worker used). Trust it; the derivation below only covers
  // rows that arrive without it.
  if (b.win !== undefined && b.win !== null) return num(b.win);
  const stake = num(b.stake ?? b.amount);
  const odds = num(b.odds ?? b.rate);
  const status = String(b.result_status ?? '').toLowerCase();
  const lay = isLayBet(b);
  if (status === 'won') return lay ? stake : stake * (odds - 1);
  if (status === 'lost') return lay ? -stake * (odds - 1) : -stake;
  return 0;
};

const formatDateTime = (value) => {
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
 * The Result modal behind a CASINO account-statement row: the round's dealt
 * cards / winner (the same per-game renderers the casino tables use) plus the
 * user's own bets on that round.
 *
 * `mid` is the round id from the statement row — the casino bet's `event_id`,
 * which is also what detail-results is keyed by. `detail` and `bets` are
 * fetched by the caller: the loader belongs over the statement table, so this
 * modal is only ever mounted with its content already in hand.
 */
export default function CasinoStatementResultModal({
  show,
  onClose,
  ...content
}) {
  const bvid = useRef(`__BVID__${++bvidCounter}`).current;
  const [filter, setFilter] = useState('all');
  const { mounted, entered } = useEnterTransition(show);

  // Closing clears the caller's state immediately, but the dialog stays mounted
  // for the fade — keep the last content so it doesn't empty out on the way out.
  const shown = useRef(content);
  if (show) shown.current = content;
  const { gameType, gameName, mid, detail = null, bets = [] } = shown.current;

  // A fresh open starts on All — the previous row's filter must not carry over
  useEffect(() => { if (show) setFilter('all'); }, [show]);

  // BootstrapVue marks the body while a modal is open (locks scroll, and the
  // reference CSS keys off it)
  useEffect(() => {
    if (!show) return undefined;
    document.body.classList.add('modal-open');
    document.body.setAttribute('data-modal-open-count', '1');
    return () => {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-modal-open-count');
    };
  }, [show]);

  if (!mounted) return null;

  // `deleted` comes straight off the endpoint; the string sniff is the fallback
  // for rows that predate it. Deleted bets show ONLY under their own tab —
  // All/Back/Lay exclude them, which is also how their totals stay honest.
  const isDeleted = (b) => {
    if (b.deleted !== undefined) return b.deleted === true;
    const s = `${b.status ?? ''} ${b.result_status ?? ''}`.toLowerCase();
    return s.includes('deleted') || s.includes('void');
  };

  const visible = bets.filter((b) => {
    if (filter === 'deleted') return isDeleted(b);
    if (isDeleted(b)) return false;
    if (filter === 'all') return true;
    return filter === 'lay' ? isLayBet(b) : !isLayBet(b);
  });

  const totalWin = visible.reduce((sum, b) => sum + betWin(b), 0);

  return createPortal(
    <div id={`${bvid}___BV_modal_outer_`} style={{ position: 'absolute', zIndex: 1040 }}>
      <div
        id={bvid}
        role="dialog"
        aria-labelledby={`${bvid}___BV_modal_title_`}
        aria-describedby={`${bvid}___BV_modal_body_`}
        className={`modal fade${entered ? ' show' : ''} casino-result`}
        aria-modal="true"
        style={{ display: 'block' }}
        // Click-outside closes. On `.modal`, not the backdrop: `.modal` covers
        // the viewport and stacks above it, so the backdrop never sees the click.
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal-dialog modal-xl">
          {/* Focus sentinels — BootstrapVue renders one either side of the dialog */}
          <span tabIndex={0}></span>
          <div id={`${bvid}___BV_modal_content_`} tabIndex={-1} className="modal-content">
            <header id={`${bvid}___BV_modal_header_`} className="modal-header">
              <h5 id={`${bvid}___BV_modal_title_`} className="modal-title">{gameName} Result</h5>
              <button type="button" aria-label="Close" className="close" onClick={onClose}>&times;</button>
            </header>
            <div id={`${bvid}___BV_modal_body_`} className="modal-body">
              {detail ? (
                <div>
                  <div className="casino-result-round">
                    <div>Round ID: {detail.rid || mid}</div>
                    <div>Match Time: <span>{formatDateTime(detail.mtime)}</span></div>
                  </div>
                  <ResultContentSwitch gameType={gameType} detail={detail} />
                </div>
              ) : (
                <div className="text-center p-3">No result data available</div>
              )}
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
                        <th className="text-right bet-amount"><div>Amount</div></th>
                        <th className="text-right bet-amount"><div>Win</div></th>
                        <th className="bet-date"><div>Date</div></th>
                        <th className="bet-ip"><div>Ip Address</div></th>
                        <th className="bet-remark"><div>Browser Details</div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.length === 0 ? (
                        <tr><td colSpan={7} className="text-center">no records found</td></tr>
                      ) : visible.map((b, i) => {
                        const rowId = `__BVID__${++rowIdCounter}`;
                        const win = betWin(b);
                        return (
                          <tr key={b.id ?? i} className={isLayBet(b) ? 'lay-border' : 'back-border'}>
                            <td className="bet-nation">
                              <div>
                                <div className="d-inline-block vm custom-control custom-checkbox">
                                  <input type="checkbox" className="custom-control-input" value={i} id={rowId} readOnly />
                                  <label className="custom-control-label" htmlFor={rowId}></label>
                                </div>{' '}
                                <span className="d-inline">{b.player_name ?? b.selection ?? ''}</span>
                              </div>
                            </td>
                            <td className="text-right bet-user-rate"><div>{b.odds ?? ''}</div></td>
                            <td className="text-right bet-amount"><div>{b.stake ?? ''}</div></td>
                            <td className="text-right bet-amount"><div>{Number(win.toFixed(2))}</div></td>
                            <td className="bet-date"><div>{formatDateTime(b.created_at)}</div></td>
                            <td className="bet-ip"><div>{b.ip_address ?? ''}</div></td>
                            <td className="bet-remark">
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
