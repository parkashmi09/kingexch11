import { useEffect, useLayoutEffect, useState } from 'react';
import { isDesktop } from '../../exchange';

// Small pieces the casino site's table pages share (app-pocker2020, app-dtl,
// app-dragon-tiger-1-day, app-ammar-akbar).

// Angular's DecimalPipe, en-US: num(v, '1.0-2') / num(v, '1.2-2'). No value (null,
// NaN) interpolates as '' — what the pipe's null shows.
export function num(v, digits = '1.0-3') {
  if (v == null || v === '' || Number.isNaN(Number(v))) return '';
  const [, min, max] = /^\d+\.(\d+)-(\d+)$/.exec(digits);
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: +min, maximumFractionDigits: +max });
}

// The site's shortNumber pipe: 1500 → "1.5k", 2000000 → "2M".
export function shortNumber(e) {
  if (e === null || e === undefined) return null;
  if (e === 0) return '0';
  let s = Math.abs(e);
  let d = '';
  const units = [['Q', 1e15], ['T', 1e12], ['B', 1e9], ['M', 1e6], ['k', 1e3]];
  for (const [key, value] of units) {
    const v = Math.round((s / value) * 10) / 10;
    if (v >= 1) { s = v; d = key; break; }
  }
  return (e < 0 ? '-' : '') + s + d;
}

/**
 * Bootstrap's data-bs-toggle="dropdown" on the pages' Min/Max info icons,
 * without bootstrap.bundle.js: one menu open at a time; the icon toggles its
 * own, the next click anywhere else closes it. `[open, toggle]`: open is the
 * key of the open menu (or null); toggle(key) is the icon's click handler maker.
 */
export function useInfoDropdown() {
  const [open, setOpen] = useState(null);
  useEffect(() => {
    if (open == null) return undefined;
    const close = () => setOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);
  const toggle = (key) => (e) => {
    e.stopPropagation();
    setOpen((cur) => (cur === key ? null : key));
  };
  return [open, toggle];
}

/**
 * Where Bootstrap's Popper puts an open info dropdown (measured on the
 * reference): 2px under its icon, left-aligned to it on desktop
 * ('bottom-start'), right-aligned on a phone ('bottom-end'). Runs after each
 * render while a menu is open; the open menu carries data-kc-pop.
 */
export function usePlaceDropdown(open) {
  useLayoutEffect(() => {
    if (open == null) return;
    const menu = document.querySelector('.dropdown-menu.show[data-kc-pop]');
    const icon = menu?.previousElementSibling;
    const op = menu?.offsetParent;
    if (!icon || !op) return;
    const i = icon.getBoundingClientRect();
    const o = op.getBoundingClientRect();
    const y = i.bottom - o.top - op.clientTop + op.scrollTop + 2;
    const end = !isDesktop;
    const x = end
      ? i.right - (o.left + op.clientLeft + op.clientWidth) + op.scrollLeft
      : i.left - o.left - op.clientLeft + op.scrollLeft;
    Object.assign(menu.style, { position: 'absolute', inset: end ? '0px 0px auto auto' : '0px auto auto 0px', margin: '0px', transform: `translate(${Math.round(x)}px, ${Math.round(y)}px)` });
    menu.setAttribute('data-popper-placement', end ? 'bottom-end' : 'bottom-start');
  });
}

// The pages' intoNumber(): parseInt.
export const intoNumber = (v) => parseInt(v, 10);

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

/**
 * Phone: the page's ngOnInit setMarketScrollHeight() — #marketScroll gets
 * floor(ios × innerHeight) px on iOS, floor(other × innerHeight) elsewhere —
 * and, when `lockHtml`, the html element stops scrolling until the page leaves.
 * Returns the height for #marketScroll's style (undefined on desktop).
 */
export function useMarketScroll(ios, other, lockHtml = true) {
  const [height] = useState(() => (isDesktop ? undefined : `${Math.floor((isIOS ? ios : other) * window.innerHeight)}px`));
  useEffect(() => {
    if (isDesktop || !lockHtml) return undefined;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = 'auto'; };
  }, [lockHtml]);
  return height;
}

/**
 * The pages' openBetslip() scroll: 50 ms after a slip opens, if #betslip is not
 * fully on screen, bring it into view — inside #marketScroll (scrollToBetslip()
 * of app-pocker2020 / app-dtl / app-ammar-akbar) or with scrollIntoView
 * ('center', app-dragon-tiger-1-day).
 */
export function useScrollToBetslip(key, intoView = false) {
  useEffect(() => {
    if (!key) return undefined;
    const t = setTimeout(() => {
      const el = document.getElementById('betslip');
      if (!el) return;
      const b = el.getBoundingClientRect();
      if (b.top >= 0 && b.bottom <= window.innerHeight) return;
      if (intoView) { el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'end' }); return; }
      const box = document.getElementById('marketScroll');
      if (!box) return;
      const s = box.getBoundingClientRect();
      const top = b.top - s.top;
      const bottom = b.bottom - s.top;
      const h = s.height;
      const y = top < h / 3 ? box.scrollTop + top - h / 3
        : bottom > (2 * h) / 3 ? box.scrollTop + bottom - (2 * h) / 3
          : box.scrollTop + top - h / 2 + b.height / 2;
      box.scrollTo({ behavior: 'smooth', top: y });
    }, 50);
    return () => clearTimeout(t);
  }, [key, intoView]);
}
