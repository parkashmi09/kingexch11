import { useState, memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getDetailResults } from '../../apiservices/casinoService';
import ResultContentSwitch from './results/ResultContentSwitch';

const CasinoResultModal = memo(function CasinoResultModal({
  show,
  onClose,
  gameType,
  gameName,
  mid,
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // The round id carries its own timestamp — <3-digit table><2-digit year>
  // <MMDD><HHMMSS> — which is how the reference prints Match Time the instant
  // the modal opens, before detail-results has landed. Verified against six
  // live rounds. Anything not matching the shape returns '' and the row simply
  // waits for the API value.
  const timeFromMid = (id) => {
    const v = String(id || '');
    if (!/^\d{15}$/.test(v)) return '';
    const [yy, MM, DD, hh, mi, ss] = [
      +v.slice(3, 5), +v.slice(5, 7), +v.slice(7, 9),
      +v.slice(9, 11), +v.slice(11, 13), +v.slice(13, 15),
    ];
    if (MM < 1 || MM > 12 || DD < 1 || DD > 31 || hh > 23 || mi > 59 || ss > 59) return '';
    return new Date(2000 + yy, MM - 1, DD, hh, mi, ss);
  };

  const formatMatchTime = (mtime) => {
    if (!mtime) return '';
    try {
      const d = new Date(mtime);
      if (isNaN(d)) return mtime;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      const offset = -d.getTimezoneOffset();
      const sign = offset >= 0 ? '+' : '-';
      const oh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
      const om = String(Math.abs(offset) % 60).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss} (UTC${sign}${oh}:${om})`;
    } catch { return mtime; }
  };

  useEffect(() => {
    if (!show || !mid || !gameType) return;
    let cancelled = false;
    setLoading(true);
    getDetailResults(gameType, mid.toString())
      .then((res) => {
        if (!cancelled) {
          const t1 = res?.data?.data?.t1 || res?.data?.t1 || res?.data || null;
          setDetail(t1);
        }
      })
      .catch((err) => { console.error('Detail results error:', err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [show, mid, gameType]);

  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [show]);

  if (!show) return null;

  const isDetailsTitle = gameType === 'teenunique' || gameType === 'lottcard';
  const isPlainResult = gameType === 'cricketv3';

  return createPortal(
    <>
      {/* Plain `modal-backdrop`, as the reference renders it — `show` would
          match `.modal-backdrop.show` (opacity .9 on #131313) and beat the
          opacity .5 App.css sets for this markup. */}
      <div className="modal-backdrop"></div>
      <div
        role="dialog"
        aria-modal="true"
        className="modal fade show casino-result"
        style={{ display: 'block' }}
        onClick={onClose}
      >
        <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" tabIndex="-1">
            <header className="modal-header">
              <h5 className="modal-title"> {isDetailsTitle ? 'Details' : isPlainResult ? 'Result' : `${gameName} Result`} </h5>
              <button type="button" aria-label="Close" className="close" onClick={onClose}>
                &times;
              </button>
            </header>
            <div className="modal-body">
              {detail || loading ? (
                <div>
                  {/* Round row shows IMMEDIATELY — the reference never blanks
                      the modal behind a "Loading" string. The id is already in
                      hand from the click and carries its own timestamp, so both
                      values are printable before the fetch returns; the API's
                      own mtime takes over once it arrives. */}
                  <div className="casino-result-round">
                    <div>Round ID: {detail?.rid || mid}</div>
                    <div>Match Time: <span>{formatMatchTime(detail?.mtime || timeFromMid(mid))}</span></div>
                  </div>
                  {detail ? (
                    <ResultContentSwitch gameType={gameType} detail={detail} />
                  ) : (
                    /* The reference's own loading shape: the content row is
                       there but empty. Written out literally rather than by
                       handing a null detail to ResultContentSwitch, which would
                       put every one of the 57 result components through a state
                       none of them were written for. */
                    <div className="row row5 align-items-center">
                      <div className="col-12 col-lg-5" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-3">No result data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

export default CasinoResultModal;
