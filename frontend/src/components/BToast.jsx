import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

const listeners = new Set();
let nextId = 0;

// How long a toast stays up before it dismisses itself.
const DEFAULT_DURATION_MS = 3000;

function notify(t) { listeners.forEach(fn => fn(t)); }

export function showBToast(message, variant = 'success', duration = DEFAULT_DURATION_MS) {
  notify({ id: ++nextId, message, variant, duration });
}
export function bToastSuccess(message) { showBToast(message, 'success'); }
export function bToastError(message) { showBToast(message, 'danger'); }
export function bToastWarning(message) { showBToast(message, 'warning'); }

export default function BToastContainer() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});
  const toastsRef = useRef([]);

  // Start (or restart) a toast's auto-dismiss countdown.
  const armDismiss = useCallback((t) => {
    timers.current[t.id] = setTimeout(() => {
      toastsRef.current = toastsRef.current.filter(x => x.id !== t.id);
      setToasts(toastsRef.current);
      delete timers.current[t.id];
    }, t.duration || DEFAULT_DURATION_MS);
  }, []);

  const addToast = useCallback((t) => {
    // Only one toast per message at a time — re-clicking while it is still
    // visible must not stack a duplicate (reference behavior).
    if (toastsRef.current.some(x => x.message === t.message && x.variant === t.variant)) {
      return;
    }
    toastsRef.current = [t, ...toastsRef.current];
    setToasts(toastsRef.current);
    armDismiss(t);
  }, [armDismiss]);

  useEffect(() => {
    listeners.add(addToast);

    // Re-arm anything already on screen without a live timer.
    //
    // This is not defensive padding — it fixes a toast that never went away.
    // React runs mount effects in tree order, then (StrictMode, and on any
    // remount) runs every cleanup and every effect a second time. A page that
    // toasts on arrival — /othergames/33 — fires during that same first pass,
    // so its dismiss timer is created BEFORE this cleanup runs and is killed by
    // it. The second pass re-registers the listener, but the toast is already in
    // toastsRef, so the dedupe drops the repeat and no new timer is ever set:
    // the toast sits there forever. Only a direct load / refresh of such a page
    // hit it, which is exactly how one gets tested.
    for (const t of toastsRef.current) {
      if (!timers.current[t.id]) armDismiss(t);
    }

    return () => {
      listeners.delete(addToast);
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, [addToast, armDismiss]);

  const remove = (id) => {
    toastsRef.current = toastsRef.current.filter(x => x.id !== id);
    setToasts(toastsRef.current);
    if (timers.current[id]) { clearTimeout(timers.current[id]); delete timers.current[id]; }
  };

  // The reference (BootstrapVue) only creates the toaster element when the
  // first toast fires — keep the DOM clean until then.
  if (toasts.length === 0) return null;

  return createPortal(
    <div id="b-toaster-top-center" className="b-toaster b-toaster-top-center">
      <div className="b-toaster-slot vue-portal-target">
        {toasts.map(t => (
          <div
            key={t.id}
            id={`__BVID__${t.id}__toast_outer`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className={`b-toast b-toast-prepend b-toast-${t.variant}`}
          >
            <div id={`__BVID__${t.id}`} tabIndex={0} className="toast">
              <header className="toast-header">
                <button type="button" aria-label="Close" className="close ml-auto mb-1" onClick={() => remove(t.id)}>&times;</button>
              </header>
              <div className="toast-body">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}
