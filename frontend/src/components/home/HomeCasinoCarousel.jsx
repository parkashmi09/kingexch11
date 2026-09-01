import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

// Fallback until the container is measured; real width is containerWidth /
// visibleCount so tiles always fill the row exactly (reference is ~143.467px on a
// typical mobile — it is NOT a fixed value, it scales with viewport width).
const DEFAULT_SLIDE_WIDTH = 143.467;
const AUTO_INTERVAL = 3000;

// Banners are mirrored locally under public/assets/casino/sidebanners/, in the
// reference site's order. A tile links to its own table when the game exists in
// CasinoHome's GAMES list (route /casino/<slug>, registered in
// routes/casinoRoutes.js). The reference's /slot/… tiles are third-party slots
// we don't host yet — they land on the casino home instead of a dead route.
const CASINO_SLIDES = [
  { route: '/o_casino',           img: 'slot-204.jpg' },
  { route: '/casino/mogambo',     img: 'mogambo.jpg' },
  { route: '/casino/superover2',  img: 'superover2.jpg' },
  { route: '/o_casino',           img: 'slot-51.jpg' },
  { route: '/casino/ourroullete', img: 'ourroullete.jpg' },
  { route: '/casino/sicbo2',      img: 'sicbo2.jpg' },
  { route: '/o_casino',           img: 'slot-200.jpg' },
  { route: '/casino/teen41',      img: 'teen41.jpg' },
  { route: '/o_casino',           img: 'trb-aero.webp' },
  { route: '/o_casino',           img: 'slot-197.webp' },
  { route: '/casino/poker20',     img: 'poker20.png' },
  { route: '/o_casino',           img: 'amigo-animalhousing.png' },
  { route: '/casino/queen',       img: 'queen.png' },
  { route: '/casino/aaa',         img: 'aaa.png' },
];

const NEW_GAMES_SLIDES = [
  { route: '/fantasy/smart/JetX',           img: 'jetx.webp' },
  { route: '/fantasy/jacktop/140511',       img: 'jacktop.webp' },
  { route: '/fantasy/darwin/AVIATSR',       img: 'aviatsr.png' },
  { route: '/fantasy/spribe/pilot-chicken', img: 'pilot-chicken.png' },
];

function Hooper({ slides, visibleCount = 3 }) {
  const count = slides.length;
  const [current, setCurrent] = useState(0);
  const [slideW, setSlideW] = useState(DEFAULT_SLIDE_WIDTH);
  const listRef = useRef(null);
  const trackRef = useRef(null);
  const timerRef = useRef(null);

  // Build 3 sets: original + duplicate + clones (matching reference structure)
  const allSlides = [...slides, ...slides, ...slides];

  // Responsive slide width = container width / visibleCount, recomputed on resize.
  useEffect(() => {
    const measure = () => {
      const w = listRef.current?.clientWidth;
      if (w) setSlideW(w / visibleCount);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [visibleCount]);

  const getOffset = useCallback((idx) => {
    return (idx + count) * slideW;
  }, [count, slideW]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => {
        const next = prev + 1;
        if (next >= count) {
          // Reset seamlessly
          requestAnimationFrame(() => {
            if (trackRef.current) {
              trackRef.current.style.transition = 'none';
              trackRef.current.style.transform = `translate(-${getOffset(0)}px, 0px)`;
              requestAnimationFrame(() => {
                if (trackRef.current) {
                  trackRef.current.style.transition = 'transform 0.3s ease';
                  trackRef.current.style.transform = `translate(-${getOffset(1)}px, 0px)`;
                }
              });
            }
          });
          return 1;
        }
        return next;
      });
    }, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [count, getOffset]);

  // Apply transform on current change
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.3s ease';
      trackRef.current.style.transform = `translate(-${getOffset(current)}px, 0px)`;
    }
  }, [current, getOffset]);

  const getSlideClass = (setIdx, itemIdx) => {
    const globalIdx = itemIdx;
    const isSecondSet = setIdx === 1;
    const isThirdSet = setIdx === 2;
    const classes = ['hooper-slide'];

    if (isThirdSet) classes.push('is-clone');

    if (isSecondSet) {
      if (globalIdx === current - 1 || (current === 0 && globalIdx === count - 1)) classes.push('is-prev');
      if (globalIdx >= current && globalIdx < current + visibleCount) {
        classes.push('is-active');
        if (globalIdx === current) classes.push('is-current');
      }
      if (globalIdx === current + visibleCount) classes.push('is-next');
    }

    return classes.join(' ');
  };

  return (
    <section tabIndex={0} className="hooper">
      <div className="hooper-list" ref={listRef}>
        <ul
          ref={trackRef}
          className="hooper-track"
          style={{ transform: `translate(-${getOffset(current)}px, 0px)` }}
        >
          {allSlides.map((slide, i) => {
            const setIdx = Math.floor(i / count);
            const itemIdx = i % count;
            const isVisible = setIdx === 1 && itemIdx >= current && itemIdx < current + visibleCount;
            return (
              <li
                key={i}
                className={getSlideClass(setIdx, itemIdx)}
                style={{ width: `${slideW}px` }}
                aria-hidden={!isVisible}
              >
                <Link to={slide.route}>
                  <div
                    className="carousal-63"
                    style={{ backgroundImage: `url('/assets/casino/sidebanners/${slide.img}')` }}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
        <div aria-live="polite" aria-atomic="true" className="hooper-liveregion hooper-sr-only">
          Item {current + 1} of {count}
        </div>
      </div>
    </section>
  );
}

export default function HomeCasinoCarousel() {
  return (
    <>
      <div className="home-casiono-icons d-none-desktop container-fluid">
        <Link to="/o_casino" className="w-100">
          <h4><span>Our Casino</span></h4>
        </Link>
        <div className="w-100">
          <Hooper slides={CASINO_SLIDES} />
        </div>
      </div>

      <div className="home-casiono-icons d-none-desktop container-fluid">
        <h4><span>New Games</span></h4>
        <div className="w-100">
          <Hooper slides={NEW_GAMES_SLIDES} />
        </div>
      </div>
    </>
  );
}
