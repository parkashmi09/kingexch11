import { memo, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';

// Used while the stake buttons haven't loaded (same as CasinoRightSidebar's).
const DEFAULT_BUTTONS = [25, 50, 100, 200, 500, 1000];

function formatRange(val) {
  if (!val || val <= 0) return '0';
  if (val >= 100000) return `${val / 100000}L`;
  if (val >= 1000) return `${val / 1000}K`;
  return String(val);
}

const CasinoPlaceBetModal = memo(function CasinoPlaceBetModal({
  show,
  betType,
  betName,
  betValue,
  // Odds box display; defaults to betValue. Session-rate line markets pass the
  // run line here while betValue stays the priced decimal.
  betDisplayOdds,
  // Extra gate on the Submit button, e.g. 3 Card Judgement keeps it disabled
  // until the player has picked all 3 cards.
  submitDisabled = false,
  stakeAmount,
  setStakeAmount,
  placing,
  onSubmit,
  onClose,
  stakeButtons: stakeButtonsProp,
  minBet = 0,
  maxBet = 0,
  jokerCardSrc = null,
}) {
  // One source for the stake buttons: /user/stake-button-values is fetched once
  // into redux (App dispatches it on boot) and read here. This is a casino
  // table, so it takes the payload's `casino_buttons` half — the sports slip
  // uses `game_buttons`.
  const casinoButtons = useSelector((s) => s.stakeButtons.casinoButtons);
  const buttons = stakeButtonsProp
    || (casinoButtons.length ? casinoButtons.map((b) => b.value) : DEFAULT_BUTTONS);


  useEffect(() => {
    // This modal is mobile-only (d-md-none). On desktop the bet panel is the
    // right sidebar, so applying Bootstrap's `.modal-open` (body overflow:hidden)
    // would freeze the whole page's scroll while the panel is open for no reason
    // — the "scrolling stopped, had to refresh" bug. Lock body scroll only while
    // the mobile modal is actually on screen, and always release it on cleanup.
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
    setStakeAmount((prev) => {
      const current = parseInt(prev, 10) || 0;
      return String(current + val);
    });
  }, [setStakeAmount]);

  const handleClear = useCallback(() => {
    setStakeAmount('');
  }, [setStakeAmount]);

  const isDisabled = placing || !stakeAmount || Number(stakeAmount) <= 0 || submitDisabled;

  // Determine andar/bahar-specific styling
  const isAndar = betName.startsWith('Andar');
  const isBahar = betName.startsWith('Bahar');
  const boxBgClass = isAndar ? 'andar-bg' : isBahar ? 'bahar-bg' : (betType === 'lay' ? 'lay' : 'back');
  const borderClass = isAndar ? 'andar-border' : isBahar ? 'bahar-border' : (betType === 'lay' ? 'lay-border' : 'back-border');

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
              <h5 className="modal-title">
                Place Bet
                {(minBet > 0 || maxBet > 0) && (
                  <span className="casino-min-max ml-2">
                    Range:<span>{formatRange(minBet)}</span>-<span>{formatRange(maxBet)}</span>
                  </span>
                )}
              </h5>
              <button type="button" className="close" onClick={onClose}>
                &times;
              </button>
            </header>

            <div className="modal-body">
              {/* Reference: while the bet is submitting, a loader-section
                  overlay (gif) shows inside the modal body */}
              {placing && (
                <div className="loader-section">
                  <div>
                    <img src="/assets/animate/loader-ten.gif" alt="loader" />
                  </div>
                </div>
              )}
              <div className={`casino-place-bet-box ${boxBgClass}`}>
                <div className="bet-slip pl-0 pr-0">
                  <div className="bet-team mt-0">
                    <span className="bet-team-name">{betName}</span>
                    <span className="float-right">{betDisplayOdds ?? betValue}</span>
                  </div>
                </div>

                <div className="casino-place-bet-info">
                  <div className={`bet-input ml-0 ${borderClass}`}>
                    <input
                      type="number"
                      id="placebetAmountMobile"
                      maxLength="9"
                      placeholder="Amount"
                      className="form-control input-stake"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      disabled={placing}
                    />
                  </div>
                  {jokerCardSrc && (
                    <span className="float-right"><img src={jokerCardSrc} alt="joker" /></span>
                  )}
                </div>

                <div className="casino-place-bet-button-container">
                  {buttons.map((val) => (
                    <button
                      key={val}
                      className="btn btn-bet"
                      onClick={() => handleAdd(val)}
                      disabled={placing}
                    >
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

                <div className="casino-place-bet-action-buttons">
                  <button
                    className="btn btn-primary"
                    disabled={isDisabled}
                    onClick={onSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

export default CasinoPlaceBetModal;
