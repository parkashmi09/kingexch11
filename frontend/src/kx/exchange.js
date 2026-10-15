import { useSyncExternalStore } from 'react';

// The home board's exchange, as the reference's tabsService keeps it: "11"
// (the exchange: slider, highlights, casino) or "16" (Live Casino: the casino
// block alone). Set by the header's Live Casino and the phone strip; it lasts
// until something resets it (Home, a sport in the strip) or a reload, so
// leaving the board and coming back finds it as it was.
let exchange = '11';
const subs = new Set();

export const setExchange = (id) => {
  if (id === exchange) return;
  exchange = id;
  subs.forEach((fn) => fn());
};

// Home (the header's, the bottom bar's) also puts the board back on its first
// sport; `homeResets` counts those so the board can follow.
let homeResets = 0;
export const resetHome = () => {
  homeResets += 1;
  exchange = '11';
  subs.forEach((fn) => fn());
};

const subscribe = (fn) => (subs.add(fn), () => subs.delete(fn));
export const useExchange = () => useSyncExternalStore(subscribe, () => exchange);
export const useHomeResets = () => useSyncExternalStore(subscribe, () => homeResets);

// ngx-device-detector's isDesktop(): by user agent, not width.
export const isDesktop = !/Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(navigator.userAgent);

// ngx-device-detector's isMobile(): a phone by user agent (tablets are neither).
export const isMobile = /iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile|BlackBerry|Opera Mini/i.test(navigator.userAgent);
