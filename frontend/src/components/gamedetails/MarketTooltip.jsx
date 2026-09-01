import { useState, useRef, useEffect, useLayoutEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';

let tooltipCounter = 0;

// Click-triggered tooltips have no mouseleave to close them, so without this a
// tap on runner A and then runner B would leave BOTH on screen. Opening one
// closes whichever was open before.
let closeOpenTooltip = null;

// Half the visible arrow width (matches the reference: a 138px-wide tooltip
// puts its arrow at left 61px → 138/2 − 8).
const ARROW_HALF = 8;

// Popper's viewport padding — how close the bubble may get to the window edge
// before it stops following the trigger.
const VIEWPORT_PADDING = 5;
// Smallest gap between the arrow and the bubble's own corner.
const ARROW_EDGE_GAP = 4;

// `as` picks the trigger element (default <span> for market headers; the fancy
// runner name renders it as <p> to match the reference DOM). `className` is
// forwarded onto that element.
// `ref` exposes show()/hide()/toggle() so a SIBLING element can open this
// tooltip too — the exposure (book) value sits in the same nation-name cell and
// should surface the runner's full name as well, even though it is its own <p>.
// `disabled` — the row went SUSPENDED. A suspended runner must not open a
// tooltip, and one that is already open has to close itself: the row it
// describes is no longer bettable, and with a click-only tooltip nothing else
// would ever dismiss it.
// `trigger` — 'click' for runner names (a row has nothing else to click, and a
// tap has no hover), 'hover' for market headers (clicking those collapses the
// market, so a click-triggered tooltip would fire on every collapse).
// `placement` — 'top' (market/runner names) or 'bottom' (the report tables'
// "Detail" browser string, which the reference drops below the cell).
// Unknown props are forwarded to the trigger element, which is how a market
// header keeps its collapse attributes on the same span the reference uses.
const MarketTooltip = forwardRef(function MarketTooltip(
  { text, children, as: Tag = 'span', className, disabled = false, trigger = 'click', placement = 'top', ...rest },
  ref
) {
  const [show, setShow] = useState(false);
  // pos is computed AFTER the tooltip is in the DOM so its measured width can
  // center it over the trigger (Popper-style), not left-align it.
  const [pos, setPos] = useState(null);
  const spanRef = useRef(null);
  const tipRef = useRef(null);
  const idRef = useRef(`__bv_tooltip_${++tooltipCounter}__`);

  // CLICK ONLY — no hover. A tap has no hover to begin with, and on desktop a
  // tooltip that follows the pointer around the market list is noise.
  const hide = useCallback(() => {
    setShow((v) => { if (v && closeOpenTooltip) closeOpenTooltip = null; return false; });
  }, []);
  const open = useCallback(() => {
    if (disabled) return;
    if (closeOpenTooltip && closeOpenTooltip !== hide) closeOpenTooltip();
    closeOpenTooltip = hide;
    setShow(true);
  }, [hide, disabled]);
  const handleToggle = useCallback(() => {
    setShow((v) => {
      if (v) { if (closeOpenTooltip === hide) closeOpenTooltip = null; return false; }
      if (disabled) return false;
      if (closeOpenTooltip && closeOpenTooltip !== hide) closeOpenTooltip();
      closeOpenTooltip = hide;
      return true;
    });
  }, [hide, disabled]);

  // Suspension can land while the tooltip is open (the feed polls every 2s) —
  // drop it the moment that happens rather than leaving it stuck over a dead row.
  useEffect(() => {
    if (disabled) hide();
  }, [disabled, hide]);

  // Click anywhere else and it goes. A click-triggered tooltip has no
  // mouseleave to dismiss it, so without this it sat there while the user
  // carried on with the page — including behind the run-amount modal that the
  // very same click opens.
  useEffect(() => {
    if (!show) return;
    const onDocPointer = (e) => {
      // The trigger's own handler already toggles it; closing here as well
      // would fight that and leave a click doing nothing.
      if (spanRef.current?.contains(e.target)) return;
      if (tipRef.current?.contains(e.target)) return;
      hide();
    };
    const onKey = (e) => { if (e.key === 'Escape') hide(); };
    document.addEventListener('click', onDocPointer);
    document.addEventListener('touchstart', onDocPointer, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocPointer);
      document.removeEventListener('touchstart', onDocPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [show, hide]);

  useImperativeHandle(ref, () => ({ show: open, hide, toggle: handleToggle }), [open, hide, handleToggle]);

  // Center the tooltip horizontally over the trigger and drop the arrow at the
  // tooltip's midpoint — exactly how the reference (BootstrapVue + Popper)
  // places it. Runs in a layout effect so the measure→position happens before
  // paint (the tooltip renders hidden until pos lands, so there's no flicker).
  const place = useCallback(() => {
    const trigger = spanRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;
    const rect = trigger.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const centerX = rect.left + window.scrollX + rect.width / 2;

    // Centre on the trigger, then keep the whole tooltip on screen — Popper's
    // preventOverflow, which the reference relies on. A market near the left
    // edge centres to a NEGATIVE x and the label gets clipped by the viewport
    // (measured: ours sat at x -13 where the reference sat at x 5).
    const viewW = document.documentElement.clientWidth;
    const minX = window.scrollX + VIEWPORT_PADDING;
    const maxX = window.scrollX + viewW - tw - VIEWPORT_PADDING;
    const x = Math.min(Math.max(centerX - tw / 2, minX), Math.max(minX, maxX));

    // The arrow keeps pointing at the trigger even after that shift, so it is
    // measured from the tooltip's own left edge — not fixed at its midpoint.
    // Kept inside the bubble so it can never hang off a rounded corner.
    const arrowLeft = Math.min(
      Math.max(centerX - x - ARROW_HALF, ARROW_EDGE_GAP),
      Math.max(ARROW_EDGE_GAP, tw - ARROW_HALF * 2 - ARROW_EDGE_GAP)
    );

    setPos({
      x: Math.round(x),
      y: Math.round(
        placement === 'bottom'
          ? rect.bottom + window.scrollY
          : rect.top + window.scrollY - th
      ),
      arrowLeft: Math.round(arrowLeft),
    });
  }, [placement]);

  useLayoutEffect(() => {
    if (!show) { setPos(null); return; }
    place();
    // Keep it glued to the trigger while scrolling (capture phase catches the
    // scrolling market list, not just the window).
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [show, text, place]);

  return (
    <>
      <Tag
        {...rest}
        ref={spanRef}
        // BootstrapVue only moves `title` into `data-original-title` once the
        // tooltip has actually been shown — until then the reference element
        // still carries its plain `title` (see the 100+ `<p title="…">` fancy
        // runners in the expected DOM, versus the single hovered one that reads
        // `title="" data-original-title="…"`). It never emits
        // `data-toggle="tooltip"` at all.
        title={show ? '' : text}
        data-original-title={show ? text : undefined}
        className={className}
        onClick={(e) => {
          // Click-triggered tooltips still forward the caller's own onClick —
          // the fancy runner name both shows its tooltip and opens the run
          // ladder, so one must not swallow the other.
          if (trigger !== 'hover') handleToggle();
          if (rest.onClick) rest.onClick(e);
        }}
        onMouseEnter={trigger === 'hover' ? open : undefined}
        onMouseLeave={trigger === 'hover' ? hide : undefined}
        style={rest.style ?? (disabled ? undefined : { cursor: 'pointer' })}
        aria-describedby={show ? idRef.current : undefined}
      >
        {children}
      </Tag>
      {show && createPortal(
        <div
          id={idRef.current}
          ref={tipRef}
          role="tooltip"
          tabIndex="-1"
          // `fade` is what carries the transition (.fade → opacity .15s linear);
          // `show` releases it from opacity 0 to .9. Both were being set on the
          // first frame, so the bubble popped in with no fade at all. `show` now
          // waits until AFTER placement, which is also the frame the bubble
          // stops being `visibility: hidden` — measure, then fade in.
          className={`tooltip b-tooltip bs-tooltip-${placement} fade${pos ? ' show' : ''}`}
          x-placement={placement}
          style={{
            position: 'absolute',
            willChange: 'transform',
            top: 0,
            left: 0,
            // Hidden until measured so the first (uncentered) frame never flashes
            visibility: pos ? 'visible' : 'hidden',
            // `.fade:not(.show)` already zeroes opacity for the pre-frame
            transform: pos
              ? `translate3d(${pos.x}px, ${pos.y}px, 0px)`
              : 'translate3d(0px, 0px, 0px)',
          }}
        >
          <div className="arrow" style={{ left: `${pos ? pos.arrowLeft : 0}px` }} />
          <div className="tooltip-inner">{text}</div>
        </div>,
        document.body
      )}
    </>
  );
});

export default MarketTooltip;
