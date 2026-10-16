import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { KX } from './ng';

// ngx-toastr, as the reference configures it (ToastrModule.forRoot): top
// centre, 700ms on screen, a repeat of a toast still showing is dropped, a tap
// dismisses it, hovering holds it and leaving gives it one more second. It fades
// in and out over 300ms ease-in. Its look is the reference's own toastr rules in
// styles.css, so the container carries data-kx.
const TIME_OUT = 700;
const EXTENDED_TIME_OUT = 1000;
const EASE_TIME = 300;

let toasts = [];
let nextId = 0;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };

function show(type, message, title) {
  if (toasts.some((t) => t.message === message)) return;
  toasts = [...toasts, { id: nextId++, type, message, title }];
  emit();
}
const remove = (id) => { toasts = toasts.filter((t) => t.id !== id); emit(); };

export const toastrError = (message, title) => show('toast-error', message, title);

function Toast({ toast }) {
  const [state, setState] = useState('inactive');
  const timer = useRef(null);

  const hide = () => {
    clearTimeout(timer.current);
    setState('removed');
    timer.current = setTimeout(() => remove(toast.id), EASE_TIME);
  };
  const hideIn = (ms) => { clearTimeout(timer.current); timer.current = setTimeout(hide, ms); };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setState('active'));
    hideIn(TIME_OUT);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      toast-component=""
      className={`ngx-toastr ${toast.type}`}
      style={{ opacity: state === 'active' ? 1 : 0, transition: `opacity ${EASE_TIME}ms ease-in` }}
      onClick={hide}
      onMouseEnter={() => { if (state !== 'removed') { clearTimeout(timer.current); setState('active'); } }}
      onMouseLeave={() => { if (state !== 'removed') hideIn(EXTENDED_TIME_OUT); }}
    >
      {toast.title && <div className="toast-title" aria-label={toast.title}>{toast.title}</div>}
      {toast.message && <div role="alert" className="toast-message" aria-label={toast.message}>{toast.message}</div>}
    </div>
  );
}

/** The overlay ngx-toastr keeps on <body>; mounted once at the app root. */
export default function KxToastr() {
  const list = useSyncExternalStore(subscribe, () => toasts);
  if (!list.length) return null;
  return createPortal(
    <div className="overlay-container" aria-live="polite" {...KX}>
      <div id="toast-container" className="toast-top-center toast-container">
        {list.map((t) => <Toast key={t.id} toast={t} />)}
      </div>
    </div>,
    document.body,
  );
}
