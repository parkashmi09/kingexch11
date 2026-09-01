import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Entrance glide timings, shared by every page that uses the movement.
// The reference recording runs its scroll in ~1.25s (motion spans 5.15s → 6.40s
// in the clip); ours is deliberately half that speed — the slower drift reads
// better on a phone.
export const GLIDE_DELAY_MS = 700;
export const GLIDE_MS = 2500;

// How long to keep waiting for a page to become scrollable before giving up.
const READY_POLL_MS = 100;
const READY_MAX_MS = 6000;

// easeInOutCubic — eases in and out, so the movement reads as a drift rather
// than a jump.
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/**
 * Slow entrance scroll, armed once the app shell is actually on screen.
 *
 * `resolve()` runs when the glide arms and returns `{ from, to }` as absolute
 * page Y coordinates, or null to skip. `from` is applied INSTANTLY (so a reverse
 * glide can open at the bottom of the page), then after a short hold the page
 * drifts to `to` over GLIDE_MS.
 *
 * Hand-rolled rAF rather than scrollIntoView({behavior:'smooth'}): the browser's
 * smooth scroll runs a fixed ~400ms and its duration is not configurable, which
 * is far too fast to read as a drift.
 *
 * Timed off the boot splash, not mount: on a hard refresh `body.app-loading`
 * hides `.wrapper` for ~2s, so a mount-time scroll would run against a hidden
 * page and be over before anything is visible.
 *
 * Keyed on `location.key`, so it re-arms on EVERY arrival at the route —
 * including re-clicking a link while already on the page, where the component
 * never unmounts and a mount-only effect would not fire again.
 */
export default function useEntranceGlide(resolve, { durationMs = GLIDE_MS, delayMs = GLIDE_DELAY_MS } = {}) {
  const location = useLocation();
  // Keep the latest resolver + timings without making them effect dependencies —
  // callers pass an inline arrow and an inline options object, which would
  // otherwise re-arm the glide on every render.
  const resolveRef = useRef(resolve);
  resolveRef.current = resolve;
  const timingRef = useRef(null);
  timingRef.current = { durationMs, delayMs };

  // Runs on EVERY arrival at the route — first load, hard refresh, SPA link, and
  // back/forward alike. It deliberately does NOT skip back/forward: React Router
  // reports the initial page load as navigationType "POP" too, so skipping POP
  // killed the glide on every refresh; and the page is wanted at its target
  // whichever way the user got here. Because the glide reads its start position
  // live, a restored scroll position simply becomes the point it drifts from.
  useEffect(() => {
    let raf = 0;
    let timer = 0;
    let done = false;

    const stop = () => {
      done = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
    };

    const start = (plan) => {
      // An explicit opening position lands before the hold, so the page is
      // already sitting where the movement starts while it waits. (Only the
      // reverse glide needs this — the casino list just starts wherever it is.)
      if (Number.isFinite(plan.from)) window.scrollTo(0, plan.from);

      const { durationMs: dur, delayMs: hold } = timingRef.current;

      timer = setTimeout(() => {
        if (done) return;

        // Re-read BOTH ends at the moment the animation actually begins. The
        // page may have moved during the readiness wait or the hold — the user
        // scrolling, or late content shifting the layout — and animating from
        // the stale `from` would yank them back to where the page used to be,
        // which reads as "scroll doesn't work". The glide just has to REACH the
        // target; where it starts from does not matter.
        const fresh = resolveRef.current?.();
        const to = Number.isFinite(fresh?.to) ? fresh.to : plan.to;
        const from = window.scrollY;
        if (Math.abs(to - from) < 2) { stop(); return; }

        // The user taking over always wins — abandon mid-glide, never fight them
        window.addEventListener('wheel', stop, { passive: true });
        window.addEventListener('touchstart', stop, { passive: true });

        const t0 = performance.now();
        const step = (now) => {
          if (done) return;
          const p = Math.min(1, (now - t0) / dur);
          window.scrollTo(0, from + (to - from) * ease(p));
          if (p < 1) raf = requestAnimationFrame(step);
          else stop();
        };
        raf = requestAnimationFrame(step);
      }, hold);
    };

    // Retry until the page is actually tall enough to move. Casino game routes
    // are React.lazy + Suspense and fill in from an async feed, so at the moment
    // the splash lifts the page is still empty — one resolve() attempt there
    // returns null and the glide would silently never happen. Poll until the
    // content lands, then give up so this can't spin forever (desktop, where the
    // target is display:none, never resolves at all).
    const arm = () => {
      const armedAt = performance.now();
      const attempt = () => {
        if (done) return;
        const plan = resolveRef.current?.();
        // `from` is optional — omit it to glide from wherever the page already
        // is (the casino list), give it to force an opening position first (the
        // reverse glide, which has to start at the bottom).
        const from = Number.isFinite(plan?.from) ? plan.from : window.scrollY;
        const usable = plan && Number.isFinite(plan.to) && Math.abs(plan.to - from) >= 8;
        if (usable) { start(plan); return; }
        if (performance.now() - armedAt < READY_MAX_MS) {
          timer = setTimeout(attempt, READY_POLL_MS);
        }
      };
      attempt();
    };

    if (!document.body.classList.contains('app-loading')) {
      arm(); // SPA navigation — no splash, start now
      return () => { clearTimeout(timer); stop(); };
    }

    const obs = new MutationObserver(() => {
      if (!document.body.classList.contains('app-loading')) {
        obs.disconnect();
        arm();
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => { obs.disconnect(); clearTimeout(timer); stop(); };
  }, [location.key]);
}
