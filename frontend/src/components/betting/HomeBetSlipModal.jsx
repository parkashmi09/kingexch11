import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import usePlaceBetPanel from './placeBet/usePlaceBetPanel';
import { normalizeName, plClass } from './placeBet/placeBetRules';
import { fetchMatchPrivateData } from '../../apiservices/sportsService';
import { fetchMatchedBetsThunk, clearMatchedBets, addMatchedBet } from '../../redux/matchedBetsSlice';
import { isDemoUser, getDemoOpenBets } from '../../utils/demoStore';

// Home board "Bet Slip" modal — clicking an odds cell on the home bet table
// places a bet WITHOUT leaving the page. Same submit pipeline as GameDetails
// (usePlaceBetPanel: anti-spam → validation → manual-edit gate → buffer →
// suspension → bookie favour → place), different presentation: the reference
// home-bet-slip bootstrap modal.
//
// Live data: while the modal is open, get-match-private-data is polled every
// second (same engine GameDetails runs). marketsRef feeds the buffer monitor /
// suspension / favour checks with the freshest odds, and the MATCH_ODDS row's
// min/max/maxb land on the bet object as they arrive — the all-data snapshot
// the cell was clicked from carries no limits.
const POLL_INTERVAL = 1000;

// Reference stake-button labels are compact: value 1000 renders "+1k".
const kLabel = (v) => (v >= 1000 && v % 1000 === 0 ? `+${v / 1000}k` : `+${v}`);

export default function HomeBetSlipModal({ bet, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.user);
  const marketsRef = useRef([]);

  // ── live market poll (1s) while the slip is open ──────────────────────────
  useEffect(() => {
    if (!bet?.event_id) return;
    let active = true;
    const poll = async () => {
      try {
        const res = await fetchMatchPrivateData(bet.event_id, bet.sid);
        if (!active) return;
        const payload = res?.data;
        const data = payload?.data?.data || payload?.data;
        if (!Array.isArray(data)) return;
        marketsRef.current = data;
        const mo = data.find((m) => String(m.mid) === String(bet.market_id));
        if (mo) {
          // Limits land on the SAME bet object — its identity must not change
          // (usePlaceBetPanel wipes the typed stake when betValue changes), so
          // the live min/max/maxb are written in place. The hook reads them at
          // render/submit time, so the maxb:1 kill-switch and the min/max
          // validation work exactly as they do on GameDetails.
          bet.maxb = mo.maxb;
          bet.min_stake = mo.min;
          bet.max_stake = mo.max;
          bet.market = mo;
        }
      } catch { /* transient poll failure — keep the last snapshot */ }
    };
    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => { active = false; clearInterval(id); };
  }, [bet]);

  // ── matched bets for THIS event — the runner book below the slip ──────────
  // Redux may still hold the last GameDetails visit's bets; replace them with
  // this event's so the book preview is computed from the right bets.
  useEffect(() => {
    if (!bet?.event_id) return;
    if (isDemoUser(user)) {
      const { matchedBets: stored } = getDemoOpenBets();
      dispatch(clearMatchedBets());
      stored
        .filter((b) => String(b.event_id || '') === String(bet.event_id))
        .forEach((b) => dispatch(addMatchedBet(b)));
      return;
    }
    const userId = user?.user_id || user?.id;
    if (userId) dispatch(fetchMatchedBetsThunk({ eventId: bet.event_id, userId }));
  }, [bet, user, dispatch]);

  const {
    loading,
    displayProfit,
    quickAmounts,
    oddsValue,
    stakeValue,
    stakeNum,
    oddsEditable,
    outcomeNames,
    runnerWinLoss,
    exposureByRunner,
    handleOddsInputChange,
    handleQuickStake,
    handleStakeKeyPress,
    handleStakeChange,
    handleClear,
    handleClose,
    handleSubmit,
  } = usePlaceBetPanel({
    betValue: bet,
    marketsRef,
    matchId: bet?.event_id,
    onClose,
  });

  if (!bet) return null;

  const side = String(bet.betType).toLowerCase() === 'lay' ? 'lay' : 'back';

  return ReactDOM.createPortal(
    <div style={{ position: 'absolute', zIndex: 1040 }}>
      <div
        role="dialog"
        aria-modal="true"
        className="modal fade show home-bet-slip"
        style={{ display: 'block' }}
      >
        <div className="modal-dialog modal-md">
          <span tabIndex="0"></span>
          <div tabIndex="-1" className="modal-content">
            <header className="modal-header">
              <h5 className="modal-title">Bet Slip</h5>
              <button type="button" aria-label="Close" className="close" onClick={handleClose}>×</button>
            </header>
            <div className="modal-body">
              {/* Placing (buffer running): the reference shows the loader INSIDE
                  the modal body, above the slip — not a full-screen overlay. */}
              {loading && (
                <div className="loader-section">
                  <div>
                    <img src="/assets/animate/loader-ten.gif" alt="loader" />
                  </div>
                </div>
              )}
              <div className="bet-slip-container">
                <div className={`bet-slip-box ${side}`}>
                  <div className="bet-slip">
                    <div className="bet-nation"><span>{bet.event_name}</span></div>
                    <div className="bet-team">
                      <span className="bet-team-name">{bet.team} </span>
                      <span>{bet.mname}</span>
                    </div>
                  </div>
                  <div className="bet-amount-box">
                    <div>
                      <div className={`bet-input ${side}-border`}>
                        <input
                          type="number"
                          maxLength={9}
                          placeholder="Amount"
                          className="form-control"
                          value={stakeValue}
                          onKeyPress={handleStakeKeyPress}
                          onChange={handleStakeChange}
                        />
                      </div>
                      <div className="odds-box">
                        <div className="bet-input-box">
                          <div className="bet-input">
                            <input
                              type="text"
                              className="form-control"
                              value={oddsValue}
                              readOnly={!oddsEditable}
                              onChange={handleOddsInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Profit preview — rendered only once a stake is in
                        (reference: <!----> placeholder while empty). No decimal
                        padding: 168, not 168.00. */}
                    {displayProfit > 0 && (
                      <div className="possible-win">
                        <span>Profit:</span> <h1 className="mb-0">{String(Number(displayProfit.toFixed(2)))}</h1>
                      </div>
                    )}
                  </div>
                  <div className="bet-buttons">
                    {quickAmounts.map((q) => (
                      <button key={q.value} className="btn btn-primary" onClick={() => handleQuickStake(q.value)}>
                        <span>{kLabel(q.value)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="place-bet-btn">
                    <button className="btn btn-danger" onClick={handleClear}>
                      Clear
                    </button>
                    <button className="btn btn-primary" disabled={stakeNum <= 0 || loading} onClick={handleSubmit}>
                      <span>Place Bet</span>
                    </button>
                  </div>
                </div>
                {/* Runner book — existing exposure (center) and the book as it
                    would stand AFTER this bet (right), per runner. Both stay
                    blank at 0, exactly as the reference renders &nbsp;. */}
                <div className="container-fluid">
                  {outcomeNames.map((name) => {
                    const existing = Number(exposureByRunner?.[normalizeName(name)] ?? 0);
                    const net = Number(runnerWinLoss?.[name] ?? 0);
                    const total = Number((existing + net).toFixed(2));
                    return (
                      <div className="row row5 mt-2" key={name}>
                        <div className="col-4"><span>{name}</span></div>
                        <div className="col-4 text-center text-success">
                          <span className={existing !== 0 ? plClass(existing) : undefined}>
                            {existing !== 0 ? existing : ' '}
                          </span>
                        </div>
                        <div className="col-4 text-right text-danger">
                          <span className={stakeNum > 0 && total !== 0 ? plClass(total) : undefined}>
                            {stakeNum > 0 && total !== 0 ? total : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <span tabIndex="0"></span>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>,
    document.body
  );
}
