import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * A Bootstrap 5 modal driven by React instead of bootstrap.bundle.js.
 *
 * The reference keeps each modal in the DOM where its component renders it and
 * lets Bootstrap toggle it (`data-bs-toggle="modal"`). This reproduces what
 * Bootstrap leaves behind while one is open — `show` + `display: block` on the
 * modal, `modal-open` on <body>, a `.modal-backdrop.fade.show` appended to
 * <body> — and its dismissals: a click on the backdrop area or Escape.
 *
 * `attrs` carries the owning component's scope attribute, so the modal's own
 * rules from that component's stylesheet still match.
 */
export default function KxModal({ open, onClose, id, className = '', labelledBy, attrs, children }) {
  // Owners pass a fresh onClose each render; the effect below must only run
  // when `open` flips (it measures the scrollbar it is about to hide).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const { body, documentElement: html } = document;
    // Bootstrap's ScrollBarHelper: hide the page scrollbar and pad <body> by
    // its width so nothing behind the modal shifts. The reference's <html> is
    // overflow: visible, so body's `hidden` reaches the viewport; this app's
    // <html> sets its own overflow, so it is hidden directly as well.
    const scrollbar = window.innerWidth - html.clientWidth;
    const prev = { bodyOverflow: body.style.overflow, bodyPad: body.style.paddingRight, htmlOverflow: html.style.overflow };
    body.classList.add('modal-open');
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    html.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    return () => {
      body.classList.remove('modal-open');
      body.style.overflow = prev.bodyOverflow;
      body.style.paddingRight = prev.bodyPad;
      html.style.overflow = prev.htmlOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <div
        {...attrs}
        id={id}
        tabIndex={-1}
        aria-labelledby={labelledBy}
        aria-hidden={open ? undefined : 'true'}
        aria-modal={open ? 'true' : undefined}
        role={open ? 'dialog' : undefined}
        className={`modal fade${open ? ' show' : ''}${className ? ` ${className}` : ''}`}
        style={open ? { display: 'block' } : undefined}
        // Bootstrap's backdrop dismissal: a press that starts and ends on the
        // modal itself, i.e. outside .modal-dialog.
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {children}
      </div>
      {open && createPortal(<div className="modal-backdrop fade show"></div>, document.body)}
    </>
  );
}
