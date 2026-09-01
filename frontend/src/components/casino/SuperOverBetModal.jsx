import { memo, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

const STAKE_BUTTONS = [10, 20, 50, 100, 200, 500];

function calcBookmakerPL(betType, odds, stake, isThisTeam) {
  if (!stake || !odds) return 0;
  const o = Number(odds);
  const s = Number(stake);
  const isPercent = o >= 10;
  const profit = isPercent ? (o / 100) * s : (o - 1) * s;
  if (betType === 'back') {
    return isThisTeam ? profit : -s;
  }
  // lay
  return isThisTeam ? -profit : s;
}

const SuperOverBetModal = memo(function SuperOverBetModal({
  show,
  onClose,
  gameName = 'Mini SuperOver',
  marketName = 'Bookmaker',
  betName = '',
  betValue = '',
  betType = 'back',
  stakeAmount = '',
  setStakeAmount,
  placing = false,
  onSubmit,
  exposures = {},
  teams = [],
}) {
  useEffect(() => {
    // Mobile-only modal (d-md-none). Don't lock body scroll on desktop, where
    // the panel is the sidebar — that froze the whole page (needed a refresh).
    // Lock only while the mobile modal is on screen; always release on cleanup.
    const isMobile = typeof window !== 'undefined'
      && window.matchMedia('(max-width: 767.98px)').matches;
    if (show && isMobile) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [show]);

  const handleAdd = useCallback((val) => {
    if (!setStakeAmount) return;
    setStakeAmount((prev) => String((parseInt(prev, 10) || 0) + val));
  }, [setStakeAmount]);

  const handleClear = useCallback(() => {
    if (setStakeAmount) setStakeAmount('');
  }, [setStakeAmount]);

  const stakeNum = parseFloat(stakeAmount) || 0;
  const oddsNum = parseFloat(betValue) || 0;

  const profit = stakeNum && oddsNum
    ? (stakeNum * (oddsNum - 1)).toFixed(2)
    : '0';

  // Per-team P&L: existing exposure + current bet preview
  const teamPL = useMemo(() => {
    if (!teams.length || !stakeNum || !oddsNum) return {};
    const result = {};
    teams.forEach((team) => {
      const existingExp = exposures[team] || 0;
      const isThisTeam = team === betName;
      const currentPL = calcBookmakerPL(betType, oddsNum, stakeNum, isThisTeam);
      result[team] = Number((existingExp + currentPL).toFixed(2));
    });
    return result;
  }, [teams, stakeNum, oddsNum, betType, betName, exposures]);

  const isDisabled = placing || !stakeAmount || Number(stakeAmount) <= 0;

  if (!show) return null;

  return createPortal(
    <>
      <div className="modal-backdrop fade show d-md-none"></div>
      <div
        role="dialog"
        aria-modal="true"
        className="modal fade show place-modal d-md-none"
        style={{ display: 'block' }}
        onClick={onClose}
      >
        <div className="modal-dialog modal-md" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" tabIndex="-1">
            <header className="modal-header">
              <h5 className="modal-title">Bet Slip</h5>
              <button type="button" aria-label="Close" className="close" onClick={onClose}>
                &times;
              </button>
            </header>
            <div className="modal-body">
              <div>
                <div className={`bet-slip-box ${betType}`}>
                  <div className="bet-slip">
                    <div className="bet-nation"><span>{gameName}</span></div>
                    <div className="match-result">{marketName}</div>
                    <div className="bet-team">
                      <span className="bet-team-name">{betName}</span>
                      <span className="float-right">{betValue}</span>
                    </div>
                  </div>
                  <div className={`bet-input ${betType === 'lay' ? 'lay-border' : 'back-border'}`}>
                    <input
                      type="number"
                      id="placebetAmountMobile"
                      maxLength="9"
                      placeholder="Amount"
                      className="form-control"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount && setStakeAmount(e.target.value.replace(/\D/g, ''))}
                      disabled={placing}
                    />
                  </div>
                  <div className="possible-win">
                    <span>Profit:</span>
                    <h1 className="mb-0">{profit}</h1>
                  </div>
                  <div className="bet-buttons">
                    {STAKE_BUTTONS.map((val) => (
                      <button key={val} className="btn btn-primary" onClick={() => handleAdd(val)} disabled={placing}>
                        <span>+{val}</span>
                      </button>
                    ))}
                    <button
                      className="btn btn-sm btn-link text-dark flex-fill text-right w-auto mw-auto"
                      onClick={handleClear}
                      disabled={placing}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="place-bet-btn">
                  <button className="btn btn-primary btn-block" disabled={isDisabled} onClick={onSubmit}>
                    <span>{placing ? 'Placing...' : 'Place Bet'}</span>
                  </button>
                </div>
                {teams.length > 0 && stakeNum > 0 && marketName === 'Bookmaker' && (
                  <div className="container-fluid">
                    {teams.map((t) => {
                      const pl = teamPL[t] || 0;
                      return (
                        <div key={t} className="row row5 mt-2">
                          <div className="col-6"><span>{t}</span></div>
                          <div className="col-6 text-right">
                            <span className={pl >= 0 ? 'book-green' : 'book-red'}>
                              {pl >= 0 ? `+${pl}` : pl}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

export default SuperOverBetModal;
