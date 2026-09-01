import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/* 18+ (underage gambling) modal — opens from the "18 years" link in the
   Login age-agreement text. Markup mirrors the reference BootstrapVue modal
   (id "plus-18", modal-xs, centered).

   Fade-in: mounts as `.modal.fade` (opacity 0, dialog translated up), then
   `.show` lands on the next frame so Bootstrap's 0.15s/0.3s transitions
   actually play — same soft open the reference has. */
const bvid = 'plus-18';

function Plus18Modal({ show, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) { setVisible(false); return; }
    // Double rAF: first frame paints the pre-transition state (fade, no show),
    // the class flip on the next frame triggers the CSS transition
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => { cancelAnimationFrame(raf1); if (raf2) cancelAnimationFrame(raf2); };
  }, [show]);

  if (!show) return null;

  return createPortal(
    <div id={`${bvid}___BV_modal_outer_`} style={{ position: 'absolute', zIndex: 1040 }}>
      <div
        id={bvid}
        role="dialog"
        aria-labelledby={`${bvid}___BV_modal_title_`}
        aria-describedby={`${bvid}___BV_modal_body_`}
        className={`modal fade${visible ? ' show' : ''}`}
        aria-modal="true"
        style={{ display: 'block' }}
      >
        <div className="modal-dialog modal-xs modal-dialog-centered">
          <span tabIndex={0}></span>
          <div id={`${bvid}___BV_modal_content_`} tabIndex={-1} className="modal-content">
            <header id={`${bvid}___BV_modal_header_`} className="modal-header">
              <h5 id={`${bvid}___BV_modal_title_`} className="modal-title">18+(underage gambling)</h5>
              <button type="button" aria-label="Close" className="close" onClick={onClose}>×</button>
            </header>
            <div id={`${bvid}___BV_modal_body_`} className="modal-body">
              <p>Over 18s only</p>
              <p>
                It is an offence for anyone under the age of 18 to open an account
                or to gamble on our exchange. We take its age-verification
                responsibilities very seriously. We carry out age-verification
                checks on all customers who use payment mechanisms which are
                available to under 18s and additionally perform random
                age-verification checks on customers using other forms of funding
                mechanisms. We may ask for information to verify your age and could
                restrict or suspend your account until your age is confirmed.
              </p>
              <p>
                PLEASE NOTE THAT ANYONE UNDER THE AGE OF 18 YEARS OLD FOUND TO BE
                USING THIS SITE WILL HAVE ANY WINNINGS FORFEITED AND MAY ALSO BE
                REPORTED TO THE POLICE.
              </p>
            </div>
          </div>
          <span tabIndex={0}></span>
        </div>
      </div>
      <div
        id={`${bvid}___BV_modal_backdrop_`}
        className="modal-backdrop"
        style={{ transition: 'opacity 0.15s linear', opacity: visible ? '' : '0' }}
        onClick={onClose}
      ></div>
    </div>,
    document.body
  );
}

export default Plus18Modal;
