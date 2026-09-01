import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchPoster } from '../../apiservices/authService';

// Fallback used only if the poster API returns nothing.
const FALLBACK_URL = '/assets/welcome-banner.png';

function WelcomeBannerModal({ show, onClose }) {
  // Poster images from /user/poster — { img, is_mobile } for desktop + mobile.
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [show]);

  // Fetch once when the modal is about to show.
  useEffect(() => {
    if (!show) return;
    let alive = true;
    fetchPoster().then((list) => { if (alive) setPosters(list); }).catch(() => {});
    return () => { alive = false; };
  }, [show]);

  if (!show) return null;

  const desktop = posters.find((p) => !p.is_mobile)?.img;
  const mobile = posters.find((p) => p.is_mobile)?.img;

  return createPortal(
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show home-modal"
        role="dialog"
        aria-modal="true"
        style={{ display: 'block' }}
        onClick={onClose}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" tabIndex="-1">
            <header className="modal-header">
              <div className="close-home-modal" onClick={onClose} style={{ cursor: 'pointer' }}>
                <i className="fas fa-times"></i>
              </div>
            </header>
            <div className="modal-body">
              {/* Desktop + mobile variants, shown responsively via the app's
                  d-none classes; static fallback if the API returned nothing. */}
              {desktop || mobile ? (
                <>
                  {desktop && <img src={desktop} className="img-fluid d-none-mobile" alt="Welcome" />}
                  {mobile && <img src={mobile} className="img-fluid d-none-desktop" alt="Welcome" />}
                </>
              ) : (
                <img src={FALLBACK_URL} className="img-fluid" alt="Welcome" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default WelcomeBannerModal;
