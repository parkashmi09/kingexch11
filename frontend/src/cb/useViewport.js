import { useEffect, useState } from 'react';

/**
 * The window's current width, re-rendering on resize.
 *
 * The reference keeps `window.innerWidth` in component state and branches on it
 * directly — several breakpoints, none of them the same (766 for the header's
 * In-Play entry, 768 for the phone/desktop split, 500 for the tile carousel) —
 * so this hands back the raw number rather than a set of booleans, and each
 * caller keeps the reference's own comparison.
 */
export default function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    // A resize between first render and this effect would otherwise be missed.
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}

/** The phone/desktop split the reference uses for layout and art. */
export const MOBILE_MAX = 768;
