import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import useEnterTransition from '../../hooks/useEnterTransition';
import { getFancyBets } from '../../apiservices/sportsService';

// BootstrapVue-style incrementing component ids (__BVID__163 etc.) — same
// scheme as ChangePasswordModal so this matches the reference modal DOM.
let bvidCounter = 8260;

export default function RunAmountModal({ show, onClose, runnerName, matchId, eventId, sid }) {
  const bvid = useRef(`__BVID__${++bvidCounter}`).current;
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const betsRef = useRef([]);

  // BootstrapVue marks the body while a modal is open (drives .modal-open rules
  // + the backdrop overlay), same as ChangePasswordModal.
  useEffect(() => {
    if (!show) return;
    document.body.classList.add('modal-open');
    document.body.setAttribute('data-modal-open-count', '1');
    return () => {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-modal-open-count');
    };
  }, [show]);

  // Ladder book: every fancy bet is a step function on the run number line —
  // yes/back wins when runValue >= line, no/lay wins when runValue < line.
  // Net P&L at each run value is the sum of every open bet's contribution.
  const calculatePositions = useCallback((bets) => {
    const parsed = bets
      .map(b => {
        const line = Number(b.odds);
        const stake = Number(b.stake_amount);
        const marketType = String(b.market_type || '').toLowerCase();
        // fancy1/oddeven persist market volume in `size`, not a bhav — derive
        // the bhav from the price instead (matches the server exposure tracker)
        const size = (marketType === 'fancy1' || marketType === 'oddeven')
          ? (line - 1) * 100
          : Number(b.size);
        const liability = Number(b.liability);
        const isYes = ['yes', 'back'].includes(String(b.bet_type || '').toLowerCase());

        const winAmt = isYes ? (stake * size) / 100 : stake;
        const loseAmt = isYes
          ? stake
          : (!isNaN(liability) && liability > 0 ? liability : (stake * size) / 100);

        return { line, isYes, winAmt, loseAmt };
      })
      .filter(b => !isNaN(b.line) && b.line > 0 && !isNaN(b.winAmt) && !isNaN(b.loseAmt));

    if (parsed.length === 0) { setPositions([]); return; }

    const pnlAt = (r) => {
      const total = parsed.reduce((sum, b) => {
        const won = b.isYes ? r >= b.line : r < b.line;
        return sum + (won ? b.winAmt : -b.loseAmt);
      }, 0);
      return Math.round(total * 100) / 100;
    };

    // Compact book: P&L only changes at the bet lines, so show one row per
    // region boundary — line-1 (just below) and line (at/above) for each
    // distinct line. A single no@138 bet renders as rows 137 and 138.
    const points = [...new Set(
      parsed.flatMap(b => [Math.ceil(b.line) - 1, Math.ceil(b.line)])
    )].filter(p => p >= 0).sort((a, b) => a - b);

    setPositions(points.map(p => ({ score: `${p}`, position: pnlAt(p) })));
  }, []);

  useEffect(() => {
    if (!show || !runnerName || !matchId) return;
    setLoading(true);
    setError(null);

    getFancyBets(runnerName, matchId, eventId, sid)
      .then(res => {
        const bets = res?.bets || [];
        betsRef.current = bets;
        calculatePositions(bets);
      })
      .catch((err) => {
        console.error('[RunAmountModal] Error:', err);
        setError('Failed to load book data');
        setPositions([]);
      })
      .finally(() => setLoading(false));
  }, [show, runnerName, matchId, eventId, sid, calculatePositions]);

  // Stay mounted through the closing transition (see the hook) — unmounting on
  // `show` alone would cut the leave animation off at frame one.
  const { mounted, entered } = useEnterTransition(show);
  if (!mounted) return null;

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
        // Click-outside closes. The handler belongs HERE, not on the backdrop:
        // `.modal` covers the viewport and sits above `.modal-backdrop`, so a
        // click beside the dialog never reaches the backdrop at all. The target
        // check keeps clicks that bubbled up from inside the dialog from
        // closing it.
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal-dialog modal-md">
          <span tabIndex={0}></span>
          <div id={`${bvid}___BV_modal_content_`} tabIndex={-1} className="modal-content">
            <header id={`${bvid}___BV_modal_header_`} className="modal-header">
              <h5 id={`${bvid}___BV_modal_title_`} className="modal-title">Run Amount</h5>
              <button type="button" aria-label="Close" className="close" onClick={onClose}>×</button>
            </header>
            <div id={`${bvid}___BV_modal_body_`} className="modal-body">
              {loading ? (
                <div className="text-center p-3">Loading...</div>
              ) : error ? (
                <div className="text-center p-3">{error}</div>
              ) : positions.length === 0 ? (
                <div className="text-center p-3">No bets placed on this runner</div>
              ) : (
                <div className="table-responsive run-amount-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Run</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((row, i) => (
                        <tr key={i}>
                          <td>{row.score}</td>
                          <td className={row.position >= 0 ? 'text-success' : 'text-danger'}>
                            {row.position}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <span tabIndex={0}></span>
        </div>
      </div>
      <div
        id={`${bvid}___BV_modal_backdrop_`}
        className="modal-backdrop"
        // Faded inline rather than via `.fade`/`.show`: those classes would
        // also swap in `.modal-backdrop.show` (style.css — opacity .9 on
        // #131313) and darken the overlay. Leaving opacity unset lets the
        // stylesheet's own value take over once it has faded in.
        style={{ transition: 'opacity .15s linear', opacity: entered ? undefined : 0 }}
        onClick={onClose}
      ></div>
    </div>,
    document.body
  );
}
