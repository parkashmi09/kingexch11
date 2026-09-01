import { fetchCarousel } from '../apiservices/authService';

// Shared banner cache. Lives outside BannerCarousel so the images can be warmed
// from anywhere — the app calls warmBanners() at startup on EVERY route, so by
// the time the user navigates to home the first banner is already decoded and
// the carousel paints instantly instead of starting a fetch on mount.

export const CACHE_KEY = 'ten:carousel';

// Image URLs already fetched AND decoded — the carousel only rotates onto these.
export const decoded = new Set();

// URLs the CDN doesn't have. The banner list outlives the files it points at —
// right now 3 of the 7 entries the API returns are 404s (the reference site has
// dead entries too). A dead first slide is what painted the banner box white,
// so these are dropped from the carousel entirely.
export const failed = new Set();

// A connection the user pays for or a 2g link: fetch what's on screen, nothing more.
const conn = typeof navigator !== 'undefined' ? navigator.connection : null;
export const frugal = !!(conn && (conn.saveData || /^(slow-)?2g$/.test(conn.effectiveType || '')));

function readCache() {
  try {
    const list = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(list) && list.length ? list : null;
  } catch {
    return null;
  }
}

// Seeded from localStorage so a returning visitor knows the banner URLs before
// /user/carousel answers — that API round-trip is what used to make the banner
// appear late (bundle → API → image was fully serial).
let slides = readCache();

export function getSlides() {
  return slides;
}

// Fetch + decode off-screen so a slide is fully paintable before it is ever
// shown — bootstrap keeps inactive slides display:none, so without this the
// browser only starts the download at the moment the slide appears.
// Resolves true only when this call actually learned something new (the image
// just decoded, or just turned out to be dead). Callers re-render on `true`, so
// an already-known URL MUST resolve false — otherwise the carousel's
// "re-render → re-check → re-render" cycle never settles.
export function preload(src, priority = 'auto') {
  if (!src || decoded.has(src) || failed.has(src)) return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    if ('fetchPriority' in img) img.fetchPriority = priority;
    const done = () => { decoded.add(src); resolve(true); };
    img.onload = () => (img.decode ? img.decode().then(done, done) : done());
    img.onerror = () => { failed.add(src); resolve(true); }; // 404 → drop the slide
    img.src = src;
  });
}

// index.html closes the boot splash on this signal (it fires the same event
// itself when the URL is already cached), so the home page is never revealed
// with an empty banner box.
let announced = false;
export function announceReady() {
  if (announced) return;
  announced = true;
  window.__bannerReady = true;
  window.dispatchEvent(new Event('banner-ready'));
}

// ── First banner, stored as bytes ───────────────────────────────────────────
// The URL cache above still needs a network round-trip on a cold start. So the
// first banner is also kept in localStorage as a data: URL — on every later
// visit it paints straight out of storage, during the splash, with zero
// requests. Only the first banner: it's the one that gates the splash, and
// localStorage is a small, synchronous budget.
const IMG_KEY = 'ten:banner0';
const IMG_MAX_BYTES = 400 * 1024;

export function getStoredFirst() {
  try {
    const o = JSON.parse(localStorage.getItem(IMG_KEY));
    return o?.url && o?.data ? o : null;
  } catch {
    return null;
  }
}

// Resolve a banner URL to whatever paints fastest: stored bytes if we have
// them for exactly this URL, otherwise the URL itself.
export function bannerSrc(url) {
  const stored = getStoredFirst();
  return stored && stored.url === url ? stored.data : url;
}

async function storeFirst(url) {
  if (!url || getStoredFirst()?.url === url) return; // already stored
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });
    if (!res.ok) return;
    const blob = await res.blob();
    if (blob.size > IMG_MAX_BYTES) return; // don't blow the localStorage budget
    const data = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
    localStorage.setItem(IMG_KEY, JSON.stringify({ url, data }));
  } catch {
    // CORS-blocked, offline, or quota exceeded — the plain URL path still works.
  }
}

let warming = null;

// Called once at app startup, on every route. Refreshes the list and gets the
// first image into the browser cache well before home is ever opened.
export function warmBanners() {
  if (warming) return warming;

  // Walk the list until one image actually loads — the first entries are not
  // guaranteed to exist on the CDN, and whatever we settle on is the banner the
  // splash waits for and the one shown underneath every other slide.
  async function warmFirstAlive(list) {
    for (const s of list.slice(0, 4)) {
      if (getStoredFirst()?.url === s.img) { decoded.add(s.img); return s.img; }
      await preload(s.img, 'high'); // deliberately serial: stop at the first that works
      if (decoded.has(s.img)) return s.img;
    }
    return null;
  }

  if (slides?.length) warmFirstAlive(slides).then(announceReady);

  warming = fetchCarousel()
    .then(async (list) => {
      if (!list?.length) return slides;
      slides = list;
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(list)); } catch { /* quota / private mode */ }
      const alive = await warmFirstAlive(list);
      announceReady();
      if (alive) {
        // Keep the bytes for next time — after the image is on screen, never before.
        const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 500));
        idle(() => storeFirst(alive));
      }
      return list;
    })
    .catch(() => slides); // keep whatever the cache had

  return warming;
}
