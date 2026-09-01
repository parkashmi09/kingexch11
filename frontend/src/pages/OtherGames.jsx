import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { bToastError } from '../components/BToast';

// `/othergames/:id` — the reference's landing for the top-nav entries that have
// no catalogue of their own. Lottery is id 33.
//
// The reference ships exactly one thing here: a full-width panel framing
// /common/demoerrorpage/index.html, and a danger toast saying "No Record Found."
// Both are unconditional — there is no request behind this page, the toast is
// the page telling you the section is empty.
//
// The iframe document is served from public/ (downloaded, not hotlinked); the
// `.sports-books-page iframe` rule in reference/style.css sizes it, so this
// component ships no CSS of its own.
const DEMO_FRAME_SRC = '/common/demoerrorpage/index.html';
const EMPTY_MESSAGE = 'No Record Found.';

export default function OtherGames() {
  const { id } = useParams();

  // The toast waits for the page to actually be ON SCREEN. Two things gate it:
  //
  //   1. the framed document has loaded — announcing "No Record Found." over a
  //      still-blank panel reads as if the toast is the whole page;
  //   2. the boot splash is gone — on a hard refresh index.html keeps
  //      `body.app-loading` (which hides `.wrapper`) for ~2s, so a toast fired
  //      before that lands on the splash and is half over by the time the app
  //      appears. Same signal useEntranceGlide waits on.
  //
  // Both have to happen; whichever finishes last fires it.
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [shellReady, setShellReady] = useState(
    () => typeof document === 'undefined' || !document.body.classList.contains('app-loading')
  );
  // One toast per visit — the iframe can fire load again (bfcache, a re-render
  // that remounts it) and that must not re-announce.
  const announced = useRef(false);

  useEffect(() => {
    if (shellReady) return undefined;
    const done = () => {
      if (!document.body.classList.contains('app-loading')) {
        setShellReady(true);
        return true;
      }
      return false;
    };
    if (done()) return undefined;
    const obs = new MutationObserver(() => { if (done()) obs.disconnect(); });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, [shellReady]);

  // A different section is a different visit: re-arm so it announces again.
  useEffect(() => {
    announced.current = false;
    setFrameLoaded(false);
  }, [id]);

  useEffect(() => {
    if (!frameLoaded || !shellReady || announced.current) return;
    announced.current = true;
    bToastError(EMPTY_MESSAGE);
  }, [frameLoaded, shellReady]);

  const onFrameLoad = useCallback(() => setFrameLoaded(true), []);

  return (
    <div className="report-box casino-box w-100 sports-books-page">
      <iframe
        frameBorder="0"
        src={DEMO_FRAME_SRC}
        id="my-iframe"
        title="Other games"
        onLoad={onFrameLoad}
      />
    </div>
  );
}
