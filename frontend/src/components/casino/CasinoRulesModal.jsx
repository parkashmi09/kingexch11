import { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CasinoRulesModal = memo(function CasinoRulesModal({
  show,
  onClose,
  tableClass = '',
  gameType = '',
  children,
}) {
  const isLottery = gameType === 'lottcard';
  // Lottery uses full modal on all screens; others only on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const shouldShow = isLottery ? show : (show && isMobile);

  useEffect(() => {
    if (shouldShow) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [shouldShow]);

  if (!shouldShow) return null;

  const modalClass = isLottery
    ? 'modal fade show casino-rules lottery-rules'
    : `modal fade show casino-rules teenpatti2-rule-modal ${tableClass ? `${tableClass}-rule-modal` : ''}`;

  return createPortal(
    <>
      {/* Plain `modal-backdrop`, exactly as the reference renders it — adding
          `show` would match `.modal-backdrop.show` (style.css: opacity .9 on
          #131313), which is more specific than the `.modal-backdrop`
          opacity .5 that App.css sets for this very markup. */}
      <div className="modal-backdrop"></div>
      <div
        role="dialog"
        aria-modal="true"
        className={modalClass}
        style={{ display: 'block' }}
        onClick={onClose}
      >
        <div className={`modal-dialog ${isLottery ? 'modal-lg' : 'modal-md'}`} onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" tabIndex="-1">
            <header className="modal-header">
              <h5 className="modal-title">Rules</h5>
              <button type="button" aria-label="Close" className="close" onClick={onClose}>
                &times;
              </button>
            </header>
            <div className="modal-body">
              {isLottery ? children : (
                <div className="casino-vieo-rules show-rules show">
                  <div className="rules-body">
                    {children}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

export default CasinoRulesModal;
