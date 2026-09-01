import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import usePlaceBetPanel from '../../components/betting/placeBet/usePlaceBetPanel';
import { fetchMatchPrivateData } from '../../apiservices/sportsService';
import {
  fetchMatchedBetsThunk,
  clearMatchedBets,
  addMatchedBet,
} from '../../redux/matchedBetsSlice';
import { isDemoUser, getDemoOpenBets } from '../../utils/demoStore';

// While the slip is open the market is re-read every second, same engine the
// event page runs. The freshest odds feed the buffer / suspension / favour
// checks, and the market's limits land on the bet — the board snapshot the cell
// was clicked from carries none.
const POLL_INTERVAL = 1000;

// Two rows of six under the stake presets. The stylesheet shows these on a
// phone and hides them on desktop.
const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00', 'clear'];

/**
 * The bet slip.
 *
 * Not a modal — the reference opens it INLINE, as a panel at the foot of the
 * market you tapped, so the book stays on screen while you stake. It carries a
 * vertical Back/Lay tab down the left, then the odds stepper, stake and profit
 * boxes, the "{market} > {runner}" line with the limits, and the stake presets
 * above Cancel / Place Bet.
 *
 * Presentation only: placement is tenexch's usePlaceBetPanel exactly as the old
 * modal used it — anti-spam, validation, the manual-edit gate, the buffer, the
 * suspension and bookie-favour checks, then place.
 */
function BetSlip({ bet, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.user);
  const marketsRef = useRef([]);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!bet?.event_id) return undefined;
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
          // Written in place: usePlaceBetPanel wipes the typed stake whenever
          // the bet object's identity changes, so the live limits have to land
          // on the same object rather than a copy.
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

  // Matched bets for THIS event, so the hook's book preview is computed from
  // the right ones (redux may still hold a previous event's).
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
    oddsEditable,
    handleOddsInputChange,
    handleStakeChange,
    handleClose,
    handleSubmit,
  } = usePlaceBetPanel({
    betValue: bet,
    marketsRef,
    matchId: bet?.event_id,
    onClose,
  });

  // Opening below the fold is the common case on a long board.
  useEffect(() => {
    const el = boxRef.current;
    if (!el?.scrollIntoView) return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    } catch {
      el.scrollIntoView();
    }
  }, [oddsValue]);

  if (!bet) return null;

  const isBack = String(bet.betType).toLowerCase() !== 'lay';
  const sideCls = isBack ? 'betplace-back' : 'betplace-lay';
  const boxCls = isBack ? 'betplace-box-back' : 'betplace-box-lay';
  const stakeCls = isBack ? 'stakebtn-back' : 'stakebtn-lay';
  const nsmallCls = isBack ? 'nsmall-back' : 'nsmall-lay';
  const sideLabel = isBack ? 'Back' : 'Lay';

  // The stepper nudges the price by a tick. Only markets whose odds are
  // editable at all accept it — a bookmaker's price is take-it-or-leave-it.
  const nudge = (delta) => {
    if (!oddsEditable) return;
    const next = (parseFloat(oddsValue) + delta).toFixed(2);
    if (next.includes('-') || parseFloat(next) < 0) return;
    handleOddsInputChange(next);
  };

  const min = Number(bet.min_stake ?? bet.market?.min ?? 0);
  const rawMax = Number(bet.maxb) > 0 ? Number(bet.maxb) : Number(bet.max_stake ?? bet.market?.max ?? 0);
  const showLimits = Number.isFinite(min) && Number.isFinite(rawMax);

  return (
    <div ref={boxRef} className={`betplace-box ${sideCls}`} style={{ position: 'relative' }}>
      {loading && (
        <div
          className="betplace-slip-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: 'inherit',
          }}
          aria-live="polite"
          aria-busy="true"
        >
          <div className="betplace-slip-overlay-content" style={{ textAlign: 'center', color: '#fff', padding: '1rem' }}>
            <div className="mb-2">
              <i className="fa fa-spinner fa-spin" style={{ fontSize: '1.5rem' }} aria-hidden="true"></i>
            </div>
            <div>Your Bet is Getting Placed, Please wait</div>
          </div>
        </div>
      )}

      <div className={`backname ${sideCls}`}>{sideLabel}</div>

      <div className={`betplace-rightbox ${boxCls}`}>
        <div className="bp-right1-box mb-1">
          <div className="betplace-betbox">
            <div className="betp-bgbox betp-bgbox--odds">
              <button
                className={`odds-adj-btn odds-adj-btn--${isBack ? 'back' : 'lay'}`}
                type="button"
                tabIndex={-1}
                disabled={loading}
                onClick={() => nudge(-0.01)}
              >
                <i className="fa fa-minus"></i>
              </button>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="nsmall-box">
                  <span className={`nsmall ${nsmallCls}`}>{sideLabel}</span>
                  <span className="mx-1 pipe"></span>
                </div>
                <div>{oddsValue}</div>
              </div>
              <button
                className={`odds-adj-btn odds-adj-btn--${isBack ? 'back' : 'lay'}`}
                type="button"
                tabIndex={-1}
                disabled={loading}
                onClick={() => nudge(0.01)}
              >
                <i className="fa fa-plus"></i>
              </button>
            </div>

            <div className="betp-bgbox">
              <div className="nsmall-box">
                <span className={`nsmall ${nsmallCls}`}>Stake</span>
                <span className="mx-1 pipe"></span>
              </div>
              <div>
                <input
                  className="form-control betlplacestake"
                  placeholder=""
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={stakeValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || /^\d*\.?\d*$/.test(v)) handleStakeChange(v);
                  }}
                  name="stake"
                  disabled={loading}
                  readOnly={loading}
                />
              </div>
            </div>

            <div className="betp-bgbox">
              <div className="nsmall-box">
                <span className={`nsmall ${nsmallCls}`}>Profit</span>
                <span className="mx-1 pipe"></span>
              </div>
              <div>{displayProfit !== '' && displayProfit != null ? displayProfit : ''}</div>
            </div>
          </div>

          <div className="betname-place">
            {bet.mname}{' '}
            <span>
              <i className="fa fa-angle-right" aria-hidden="true"></i>
            </span>{' '}
            <span>{bet.team}</span>
          </div>

          {showLimits && (
            <div className="betplace-minmax text-muted small mt-1" style={{ fontSize: '0.8rem' }}>
              Min <span>{min.toFixed(2)}</span>
              <span className="mx-1">|</span>
              Max <span>{rawMax.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="bp-right1-box">
          <div className="stakebtn-box">
            {(quickAmounts || []).map((amount, i) => {
              // The button SETS the stake, it does not add to it — which is
              // what the reference does too — so it shows the bare figure.
              // tenexch's own label carries a "+" prefix that would read as
              // "add 1000" and mean the wrong thing here.
              const value = amount?.value ?? amount;
              return (
                <button
                  type="button"
                  className={`stakebtn ${stakeCls}`}
                  onClick={() => handleStakeChange(String(value))}
                  disabled={loading}
                  key={i}
                >
                  {value}
                </button>
              );
            })}
          </div>

          {[KEYPAD.slice(0, 6), KEYPAD.slice(6, 12)].map((row, r) => (
            <div className="stakebtn-box keypad-box" key={r}>
              {row.map((key) => (
                <button
                  type="button"
                  className={`stakebtn ${stakeCls} keypad`}
                  onClick={() => handleStakeChange(key === 'clear' ? '' : stakeValue + key)}
                  disabled={loading}
                  key={key}
                >
                  {key === 'clear' ? <i className="fa fa-window-close" aria-hidden="true"></i> : key}
                </button>
              ))}
            </div>
          ))}

          <div className="placebtn-box">
            <button type="button" className="Placebet cancelbg" onClick={handleClose}>
              Cancel
            </button>
            <button type="button" className="Placebet placebg" onClick={handleSubmit} disabled={loading}>
              Place Bet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BetSlip;
