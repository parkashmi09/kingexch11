import { useEffect, useState } from 'react';

// The reference's own breakpoint: its mobile rules run to 1279px.
//
// This is not only a layout concern. The virtual-casino container carries a
// per-breakpoint class — `vlucky7` above it, `vlucky7-mobile` below — and the
// animation stylesheets key off exactly that: animation.css styles `.vteen
// .decks-block`, animation-mobile.css styles `.vteen-mobile .decks-block`, with
// different offsets. Emit the wrong suffix and a desktop board silently picks
// up the mobile animation rules.
export const DESKTOP_MQ = '(min-width: 1280px)';

export default function useIsDesktop() {
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_MQ).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const onChange = (e) => setDesktop(e.matches);
    mq.addEventListener('change', onChange);
    setDesktop(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
}
