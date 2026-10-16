// The helpers the casino site's teen-patti family of table pages share
// (app-casino-teen-pati, app-teenpatti, app-one-day-dragon-tiger,
// app-eu-teenpatti): Angular's number and shortNumber pipes, Bootstrap's
// collapse as the market cards use it, and the page behaviour around
// #marketScroll.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isDesktop } from '../../exchange';

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

// Angular's DecimalPipe (en-US): `num(v, '1.0-2')`; null / '' / undefined → ''.
const FORMATS = {};
export function num(v, digits = '1.0-3') {
  if (v == null || v === '') return '';
  if (!FORMATS[digits]) {
    const [, min, max] = /^\d+\.(\d+)-(\d+)$/.exec(digits);
    FORMATS[digits] = new Intl.NumberFormat('en-US', { minimumFractionDigits: +min, maximumFractionDigits: +max });
  }
  return FORMATS[digits].format(Number(v));
}

// The casino site's shortNumber pipe: 1000 → "1k", 1500000 → "1.5M".
export function shortNumber(v) {
  if (v === null) return null;
  if (v === 0) return '0';
  let s = Math.abs(v);
  let key = '';
  for (const [k, value] of [['Q', 1e15], ['T', 1e12], ['B', 1e9], ['M', 1e6], ['k', 1e3]]) {
    const r = Math.round((s / value) * 10) / 10;
    if (r >= 1) { s = r; key = k; break; }
  }
  return `${v < 0 ? '-' : ''}${s}${key}`;
}

export const cx = (...c) => c.filter(Boolean).join(' ');

/**
 * Bootstrap 5's collapse, as the market header's data-bs-toggle="collapse"
 * drives it: the body slides shut (.collapsing, height → 0 over .35s) and stays
 * `.collapse`; the toggle takes `.collapsed` / aria-expanded="false".
 * Returns { ref, className, style, expanded, toggle } for the `.collapse` body
 * (`base`: its other classes, kept where Bootstrap's class edits leave them).
 */
export function useCollapse(base) {
  const ref = useRef(null);
  // phase: 'initial' (shown, never toggled) | 'hiding' | 'hidden' | 'showing' | 'shown'
  const [st, setSt] = useState({ phase: 'initial', height: null });
  const busy = st.phase === 'hiding' || st.phase === 'showing';

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (st.phase === 'hiding' && st.height != null) {
      void el.offsetHeight; // reflow at the full height, then let it fall to 0
      setSt({ phase: 'hiding', height: null });
    } else if (st.phase === 'showing' && st.height == null) {
      void el.offsetHeight;
      setSt({ phase: 'showing', height: el.scrollHeight });
    }
  }, [st]);

  useEffect(() => {
    if (!busy) return undefined;
    const t = setTimeout(() => setSt({ phase: st.phase === 'hiding' ? 'hidden' : 'shown', height: null }), 355);
    return () => clearTimeout(t);
  }, [busy, st.phase]);

  const toggle = useCallback(() => {
    if (busy) return;
    if (st.phase === 'shown' || st.phase === 'initial') setSt({ phase: 'hiding', height: ref.current?.getBoundingClientRect().height ?? 0 });
    else setSt({ phase: 'showing', height: null });
  }, [busy, st.phase]);

  return {
    ref,
    className: busy ? cx(base, 'collapsing')
      : st.phase === 'initial' ? cx('collapse', base, 'show')
        : st.phase === 'shown' ? cx(base, 'collapse', 'show')
          : cx(base, 'collapse'),
    style: st.height != null ? { height: `${st.height}px` } : undefined,
    expanded: st.phase === 'initial' || st.phase === 'shown' || st.phase === 'showing',
    toggle,
  };
}

function scrollToBetslip() {
  const n = document.getElementById('marketScroll');
  const i = document.getElementById('betslip');
  if (!n || !i) return;
  const s = n.getBoundingClientRect();
  const a = i.getBoundingClientRect();
  const u = a.top - s.top;
  const d = a.bottom - s.top;
  const f = s.height;
  n.scrollTo(u < f / 3 ? { behavior: 'smooth', top: n.scrollTop + u - f / 3 }
    : d > (2 * f) / 3 ? { behavior: 'smooth', top: n.scrollTop + d - (2 * f) / 3 }
      : { behavior: 'smooth', top: n.scrollTop + u - f / 2 + a.height / 2 });
}

/**
 * The page behaviour app-casino-teen-pati and app-teenpatti share: on a phone
 * #marketScroll gets 62% (iOS) / 63% of the window and the page itself stops
 * scrolling (until the page is left); a suspended round drops the open slip; a
 * struck price opens the slip and scrolls it into view; one header info
 * dropdown open at a time, closed by the next click anywhere.
 */
export function useTablePage(table) {
  useEffect(() => {
    if (isDesktop) return undefined;
    const el = document.getElementById('marketScroll');
    if (el) el.style.height = `${Math.floor((isIOS ? 0.62 : 0.63) * window.innerHeight)}px`;
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = 'auto'; };
  }, []);

  const { game, slip, closeBetslip, openBetslip } = table;
  useEffect(() => {
    if (game.status === 'SUSPEND' && slip) closeBetslip();
  }, [game.status, slip, closeBetslip]);

  const [info, setInfo] = useState(null);
  useEffect(() => {
    if (info == null) return undefined;
    const close = () => setInfo(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [info]);
  const onInfo = useCallback((id) => setInfo((cur) => (cur === id ? null : id)), []);

  const strike = useCallback((marketId, selectionId, price) => {
    setTimeout(() => {
      const el = document.getElementById('betslip');
      if (el) {
        const g = el.getBoundingClientRect();
        if (!(g.top >= 0 && g.bottom <= window.innerHeight)) scrollToBetslip();
      }
    }, 50);
    openBetslip(marketId, selectionId, 'back', price);
  }, [openBetslip]);

  return { info, onInfo, strike };
}
