import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  decoded, failed, frugal, getSlides, preload, announceReady, warmBanners, bannerSrc,
} from '../../utils/bannerCache';

const AUTO_MS = 10000; // how long each banner stays before auto-advancing
const SWIPE_PX = 40;  // min horizontal travel that counts as a swipe
// Must match .carousel-item's transition in reference/bootstrap.min.css:6423 (.6s).
const SLIDE_MS = 600;

// Static fallback slides if the API returns nothing.
const FALLBACK = [
  '/assets/banners/1775793298223.webp',
  '/assets/banners/1775760958998.webp',
  '/assets/banners/1775761567448.webp',
];

// The carousel's casino gameName isn't the route slug (e.g. "poisonteenpatti20"
// → /casino/poison20). Map the known API names here; extend as new casino
// banners appear. Unknown names fall back to the casino home.
const CASINO_ROUTE = {
  poisonteenpatti20: 'poison20',
  poisonteenpatti: 'poison',
};

// The list + image cache lives in utils/bannerCache.js: main.jsx warms it at
// app startup on EVERY route, so by the time the user reaches home the banners
// are already downloaded and this component just paints them.

function slideHref(slide) {
  if (slide.category === 'sports' && slide.sports?.sportId && slide.sports?.eventId) {
    return `/gamedetails/${slide.sports.sportId}/${slide.sports.eventId}`;
  }
  if (slide.category === 'casino' && slide.casino?.gameName) {
    const name = String(slide.casino.gameName).toLowerCase();
    // Known remaps first (gameName != route slug, e.g. poisonteenpatti20 →
    // poison20); otherwise the gameName IS the slug (e.g. "dum10" → /casino/dum10).
    // A slug that has no registered route degrades to /o_casino via App.jsx's
    // /casino/* catch-all, so an unknown name is never a dead link.
    const slug = CASINO_ROUTE[name] || name;
    return `/casino/${slug}`;
  }
  return null; // 'others' — image only, no navigation
}

// Hand-rolled to match the reference DOM exactly (`.carousel-indicators > li`,
// clickable slides wrapped in <a>, others tagged non-clickable-banner) so the
// project's reference/bootstrap.min.css styles it — react-bootstrap's Carousel
// renders <button> indicators that CSS (which targets `li`) wouldn't hit.
function BannerCarousel() {
  // Banner navigation is a LOGGED-IN feature: sports/casino banners route only
  // after login; logged out they behave like 'others' (image only, no click).
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [slides, setSlides] = useState(getSlides);
  const [index, setIndex] = useState(0);
  // Bumped whenever a preload settles — re-runs the ready check and re-filters
  // whatever turned out to be a dead URL.
  const [readyTick, setReadyTick] = useState(0);

  // Already warmed at startup — this just picks up the result (and is a no-op
  // fetch-wise, warmBanners() reuses its in-flight promise).
  useEffect(() => {
    let alive = true;
    warmBanners().then((list) => { if (alive && list?.length) setSlides(list); });
    return () => { alive = false; };
  }, []);

  // Slides whose image 404s are dropped, not shown blank — the API's list keeps
  // pointing at files that no longer exist on the CDN. readyTick re-runs this as
  // each preload settles. If every URL is dead we fall back to the bundled ones.
  const items = useMemo(() => {
    const live = (slides || [])
      .filter((s) => s.img && !failed.has(s.img))
      // Logged out → no banner is clickable ('others' never is anyway); logged
      // in → sports/casino resolve to their route, 'others' stays null.
      .map((s) => ({ img: s.img, href: isAuth ? slideHref(s) : null, key: s.id }));
    return live.length
      ? live
      : FALLBACK.map((img, i) => ({ img, href: null, key: `f${i}` }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- readyTick is the failed-set signal
  }, [slides, readyTick, isAuth]);

  // Prefetch, but strictly in order of need. Slide 1 alone at high priority —
  // on mobile, downloading all banners at once is exactly what made the first
  // one arrive late. The rest queue up one at a time, only once slide 1 is
  // decoded and the main thread is idle, and not at all on saveData/2g.
  useEffect(() => {
    let alive = true;
    // Only re-render when a preload actually settled something new — bumping
    // unconditionally re-created `items`, which re-ran this effect, forever.
    const bump = (changed) => { if (changed && alive) setReadyTick((t) => t + 1); };
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));

    preload(items[0]?.img, 'high').then((changed) => {
      bump(changed);
      announceReady(); // the boot splash is waiting on this
      if (!alive || frugal) return;
      idle(async () => {
        for (const it of items.slice(1)) {
          if (!alive) return;
          bump(await preload(it.img, 'low')); // serial: never compete for bandwidth
        }
      });
    });

    return () => { alive = false; };
  }, [items]);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const indexRef = useRef(index);
  indexRef.current = index;

  // The slide transition, exactly as bootstrap 4 drives it (see
  // reference/bootstrap.min.css:6442-6455): the incoming slide is first parked
  // off-screen with .carousel-item-next/-prev, a reflow is forced, then
  // .carousel-item-left/-right on BOTH slides runs the .6s transform.
  const [anim, setAnim] = useState(null); // { to, dir: 1 | -1, moving }
  const animRef = useRef(null);
  animRef.current = anim;
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Move to the next/previous slide whose image is already decoded — never
  // rotate onto a blank frame. Paused while the tab is hidden (no wasted timers).
  const advance = useCallback((dir = 1) => {
    if (animRef.current) return; // a slide is already in flight
    const list = itemsRef.current;
    const n = list.length;
    if (n <= 1) return;
    const cur = indexRef.current % n;
    let to = -1;
    for (let step = 1; step <= n; step += 1) {
      const next = (((cur + dir * step) % n) + n) % n;
      if (decoded.has(list[next].img)) { to = next; break; }
    }
    if (to === cur) return;
    if (to < 0) {
      // Nothing decoded yet (frugal mode, or the prefetch is still running):
      // pull just the neighbour we need and rotate onto it when it lands.
      const next = (((cur + dir) % n) + n) % n;
      preload(list[next].img, 'high').then(() => {
        if (!decoded.has(list[next].img)) return; // it 404'd — the filter drops it
        if (indexRef.current === cur && !animRef.current) goTo(next, dir);
      });
      return;
    }
    goTo(to, dir);
  }, []);

  // Park → reflow → slide → commit. `moving` is flipped on the next frame so
  // the browser has actually painted the parked position first; without that
  // the transform would be coalesced and the slide would just pop.
  function goTo(to, dir) {
    setAnim({ to, dir, moving: false });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnim((a) => (a && a.to === to ? { ...a, moving: true } : a));
      });
    });
    timers.current.push(setTimeout(() => {
      setIndex(to);
      setAnim(null);
    }, SLIDE_MS));
  }

  // Indicator click / any jump: shortest sensible direction, same animation.
  const jumpTo = (to) => {
    if (animRef.current || to === indexRef.current) return;
    goTo(to, to > indexRef.current ? 1 : -1);
  };

  // Swipe. Horizontal drags flip the slide, vertical ones are left alone so the
  // page keeps scrolling normally under the finger.
  const drag = useRef(null);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    drag.current = { x: t.clientX, y: t.clientY, swiping: false };
  };

  const onTouchMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const t = e.touches[0];
    if (!d.swiping && Math.abs(t.clientX - d.x) > Math.abs(t.clientY - d.y) + 6) {
      d.swiping = true; // horizontal intent — this gesture belongs to the carousel
    }
    d.dx = t.clientX - d.x;
  };

  const swiped = useRef(false);

  const onTouchEnd = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.swiping && Math.abs(d.dx || 0) > SWIPE_PX) {
      swiped.current = true; // the tap-to-open that follows is not a real tap
      advance(d.dx < 0 ? 1 : -1);
    }
  };

  // A swipe that starts on a clickable banner still fires a click on touchend —
  // swallow it so a drag never navigates.
  const onClickCapture = (e) => {
    if (!swiped.current) return;
    swiped.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (items.length <= 1) return undefined;
    let timer = null;
    const tick = () => { if (!drag.current) advance(1); }; // don't yank mid-swipe
    const start = () => { if (!timer) timer = setInterval(tick, AUTO_MS); };
    const stop = () => { clearInterval(timer); timer = null; };
    const onVisibility = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [items.length, advance]);

  const active = index % (items.length || 1);
  // Bootstrap flips the indicator as soon as the slide starts moving.
  const marked = anim ? anim.to : active;

  // .active stays on the outgoing slide for the whole transition; the incoming
  // one carries -next/-prev, and both get -left/-right once it's moving.
  const slideClass = (i) => {
    if (!anim) return i === active ? ' active' : '';
    const shift = anim.moving ? (anim.dir === 1 ? ' carousel-item-left' : ' carousel-item-right') : '';
    if (i === active) return ` active${shift}`;
    if (i === anim.to) return `${anim.dir === 1 ? ' carousel-item-next' : ' carousel-item-prev'}${shift}`;
    return '';
  };

  // Two background layers: the slide's own banner on top, the FIRST banner
  // underneath. Slide 1 is the one kept in localStorage as bytes (bannerSrc()
  // hands back a data: URL when we have them), so it paints with no request at
  // all and fills what used to be a white gap while the current slide's image
  // is still in flight. Once that lands it simply covers this.
  const under = bannerSrc(items[0]?.img || FALLBACK[0]);
  const layers = (item) => (
    `url("${bannerSrc(item.img)}") center/cover no-repeat, url("${under}") center/cover no-repeat`
  );

  const renderItem = (item, i) => {
    const box = (
      <div
        role="listitem"
        className={`carousel-item carousal-23${slideClass(i)}${item.href ? '' : ' non-clickable-banner'}`}
        style={{ background: layers(item) }}
      />
    );
    return item.href
      ? <Link to={item.href} key={item.key}>{box}</Link>
      : <div key={item.key}>{box}</div>;
  };

  return (
    <div className="banner">
      <div className="carousel slide">
        <div
          className="carousel-inner"
          role="list"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onClickCapture={onClickCapture}
        >
          {items.map(renderItem)}
        </div>
        <ol className="carousel-indicators">
          {items.map((item, i) => (
            <li
              key={item.key}
              className={i === marked ? 'active' : ''}
              onClick={() => jumpTo(i)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}

export default BannerCarousel;
