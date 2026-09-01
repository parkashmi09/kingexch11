import { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';

// `children`, when given, REPLACE the default matched-bets table in the body —
// lottery renders its own `.casino-my-bet > .lottery-my-bets` list instead.
const CasinoMyBetsModal = memo(function CasinoMyBetsModal({ show, onClose, myBets = [], children }) {
  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [show]);

  if (!show) return null;

  return createPortal(
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        role="dialog"
        aria-modal="true"
        className="modal fade show mybetsmodal"
        style={{ display: 'block' }}
        onClick={onClose}
      >
        <div className="modal-dialog modal-md" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" tabIndex="-1">
            <header className="modal-header">
              <h5 className="modal-title">My Bets</h5>
              <button type="button" aria-label="Close" className="close" onClick={onClose}>
                &times;
              </button>
            </header>
            <div className="modal-body">
              {children ?? (<>
              <div className="casino-place-bet-header">
                <div>Matched Bets</div>
                <div>Odds</div>
                <div>Stake</div>
              </div>
              <div className="casino-place-bet-body">
                {myBets.length > 0 ? myBets.map((bet, i) => (
                  <div key={bet._id || i} className={`casino-place-bet-row ${bet.type === 'lay' ? 'lay-border' : 'back-border'}`}>
                    <div>{bet.player_name || bet.selection || ''}</div>
                    <div>{bet.odds ?? ''}</div>
                    <div>{bet.amount ?? bet.stake ?? ''}</div>
                  </div>
                )) : (
                  <div className="text-center p-2">No bets found</div>
                )}
              </div>
              </>)}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

export default CasinoMyBetsModal;
