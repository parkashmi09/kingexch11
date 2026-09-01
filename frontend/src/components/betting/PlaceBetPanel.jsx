import ReactDOM from 'react-dom';
import FullScreenLoader from '../FullScreenLoader';
import usePlaceBetPanel from './placeBet/usePlaceBetPanel';

// Back-compat: calcProfit has historically been exported from this file
export { calcProfit } from './placeBet/placeBetRules';

/**
 * PlaceBetPanel — presentation layer ONLY.
 *
 * All logic lives in ./placeBet/:
 *   usePlaceBetPanel.js    — state, redux, derived values, submit pipeline
 *   placeBetRules.js       — pure rules (validation, market family, odds ladder)
 *   placeBetLiveChecks.js  — live-market checks (buffer, suspension, fancy drift)
 *
 * Keep this file free of business logic — new behaviours go in the hook/rules.
 */
export default function PlaceBetPanel(props) {
  const {
    isOneClick,
    loading,
    panelClass,
    effectiveTeam,
    displayProfit,
    quickAmounts,
    oddsValue,
    stakeValue,
    stakeNum,
    oddsEditable,
    isBookmakerPanel,
    handleOddsStep,
    handleOddsInputChange,
    handleQuickStake,
    handleStakeKeyPress,
    handleStakeChange,
    handleClear,
    handleClose,
    handleSubmit,
  } = usePlaceBetPanel(props);

  // One-click mode: no panel UI — only the full-screen loader while placing
  if (isOneClick) {
    return loading ? ReactDOM.createPortal(<FullScreenLoader />, document.body) : null;
  }

  return (
    <div className={panelClass}>
      {/* Full-screen loading overlay */}
      {loading && ReactDOM.createPortal(<FullScreenLoader />, document.body)}

      {/* No suspended overlay on the bet panel itself — the market rows carry
          the suspension UI; the panel stays clean (reference behavior) */}
      <div className="container-fluid">
        {/* Reference header: col-9 runner name + col-3 Profit — NO Min/Max */}
        <div className="row">
          <div className="col-9">
            <p><b>{effectiveTeam || 'Runner'}</b></p>
          </div>
          <div className="col-3 text-right">
            <div className="possible-win">
              {/* No decimal padding — 833, not 833.00 (12.5 stays 12.5) */}
              <span>Profit:</span> <b className="mb-0">{displayProfit > 0 ? String(Number(displayProfit.toFixed(2))) : '0'}</b>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Quick stake buttons */}
          <div className="col-md-6 col-7 d-flex flex-wrap align-items-center">
            {quickAmounts.map(q => (
              <button key={q.value} className="btn btn-bet" onClick={() => handleQuickStake(q.value)}>
                <span>{q.label}</span>
              </button>
            ))}
          </div>

          {/* Odds + Stake inputs */}
          <div className="col-5 col-md-6 d-flex justify-content-center flex-wrap flex-column align-items-end">
            <div>
              {isBookmakerPanel ? (
                /* Reference: bookmaker odds are a plain span — no input at all */
                <span>{oddsValue}</span>
              ) : (
                <>
                  {oddsEditable && (
                    <button className="stakeactionminus btn" onClick={() => handleOddsStep(-1)}>
                      <span className="fa fa-minus"></span>
                    </button>
                  )}
                  <input
                    type="text"
                    className="stakeinput"
                    value={oddsValue}
                    readOnly={!oddsEditable}
                    onChange={handleOddsInputChange}
                  />
                  {oddsEditable && (
                    <button className="stakeactionminus btn" onClick={() => handleOddsStep(1)}>
                      <span className="fa fa-plus"></span>
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="bet-input mt-1">
              <div className="bet-input">
                <input
                  type="number"
                  id="placebetAmountWeb1"
                  maxLength={9}
                  placeholder="Amount"
                  className="stakeinput ml-2"
                  value={stakeValue}
                  onKeyPress={handleStakeKeyPress}
                  onChange={handleStakeChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-1">
          <div className="col-6">
            <button className="btn btn-danger" onClick={handleClose}>Close</button>
            <button className="btn btn-warning" onClick={handleClear}>Clear</button>
          </div>
          <div className="col-6 d-flex justify-content-end">
            {/* Disabled ONLY while the stake is empty (reference behavior) —
                min/max/odds/suspension problems surface as toasts on click,
                not as a silently dead button */}
            <button className="btn btn-success" disabled={stakeNum <= 0} onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>

        {/* Per-runner P&L section — data comes from usePlaceBetPanel:
            { showPLSection, outcomeNames, runnerWinLoss, exposureByRunner }
            plus normalizeName / plClass from ./placeBet/placeBetRules */}
        {/* {showPLSection && (
          <div style={{ padding: '4px 0' }}>
            <div className="odds-count mt-1">
              {outcomeNames.map(name => {
                const net = runnerWinLoss?.[name] ?? 0;
                const apiExp = exposureByRunner[normalizeName(name)] ?? 0;
                const total = Number((apiExp + net).toFixed(2));
                return (
                  <div key={name} className="row row5 mt-1">
                    <div className="col-6"><span style={{ fontSize: '12px' }}>{name}</span></div>
                    <div className="col-3 text-center">
                      {apiExp !== 0 && <span style={{ fontSize: '12px' }} className={apiExp < 0 ? 'text-danger' : 'text-success'}>{apiExp > 0 ? `+${apiExp}` : apiExp}</span>}
                    </div>
                    <div className="col-3 text-end">
                      <span style={{ fontSize: '12px' }} className={plClass(total)}>{total > 0 ? `+${total}` : total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
