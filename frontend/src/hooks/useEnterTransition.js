import { useState, useEffect } from 'react';

/**
 * Two-frame mount so a CSS enter/leave transition can actually run.
 *
 * Bootstrap animates by class: `.fade` (and `.modal.fade .modal-dialog`) sets
 * the "before" state — opacity 0, dialog offset by -50px — and `.show` releases
 * it. Rendering both classes on the very first frame means the browser never
 * paints the before-state, so there is nothing to transition FROM and the panel
 * simply appears. Hence: mount without `show`, add it on the next frame.
 *
 * Leaving is the mirror: drop `show`, keep the node mounted for `durationMs`
 * so the transition can play, then unmount.
 *
 *   const { mounted, entered } = useEnterTransition(show);
 *   if (!mounted) return null;
 *   <div className={`modal fade${entered ? ' show' : ''}`}>
 */
export default function useEnterTransition(show, durationMs = 300) {
  const [mounted, setMounted] = useState(show);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      // Two frames, not one: the first only guarantees the node is in the DOM,
      // the second that it has been painted in its before-state.
      let inner;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setEntered(true));
      });
      return () => { cancelAnimationFrame(outer); if (inner) cancelAnimationFrame(inner); };
    }
    setEntered(false);
    const t = setTimeout(() => setMounted(false), durationMs);
    return () => clearTimeout(t);
  }, [show, durationMs]);

  return { mounted, entered };
}
