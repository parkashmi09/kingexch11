import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ng, host } from '../ng';

const O = ng('kowl');
const CLONES = 2; // owl's loop clones on each side for a one-item stage

/**
 * owl-carousel-o (ngx-owl-carousel) as the dashboard configures it: one item,
 * looping, autoplay, dots from 600px. Renders owl's own markup — stage of
 * cloned + real items translated to the active one — so styles.css's owl
 * rules apply unchanged. `C` is the projecting component's scope (the images).
 */
export default function OwlCarousel({ C, slides }) {
  const outer = useRef(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const n = slides.length;

  // Measured before paint and again on window resize, as owl does. (Not a
  // ResizeObserver: the stage is wider than the box, and where the box can
  // grow with its content that would measure its own result forever.)
  useLayoutEffect(() => {
    const measure = () => setWidth(outer.current.clientWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (n < 2) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n]);

  const items = [
    ...Array.from({ length: CLONES }, (_, k) => [slides[(n * CLONES + k - CLONES) % n], true]),
    ...slides.map((s) => [s, false]),
    ...Array.from({ length: CLONES }, (_, k) => [slides[k % n], true]),
  ];
  const dots = window.innerWidth >= 600; // the dashboard's `dots` option

  return (
    <owl-carousel-o {...C} {...host('kowl')} className="custom-owl-carousel">
      <div {...O} className="owl-carousel owl-theme owl-loaded owl-responsive owl-drag">
        <div {...O} ref={outer} className="owl-stage-outer">
          <owl-stage {...O}>
            <div>
              <div
                className="owl-stage"
                style={{ width: width * items.length, transform: `translate3d(${-(index + CLONES) * width}px, 0px, 0px)`, transition: n > 1 ? 'all 0.25s' : 'all' }}
              >
                {items.map(([src, cloned], i) => (
                  <div key={i} className={`owl-item${cloned ? ' cloned' : i - CLONES === index ? ' active' : ''}`} style={{ width }}>
                    <img {...C} className="img img-responsive" src={src} alt="" />
                  </div>
                ))}
              </div>
            </div>
          </owl-stage>
        </div>
        <div {...O} className="owl-nav disabled">
          <div {...O} className="owl-prev" />
          <div {...O} className="owl-next" />
        </div>
        <div {...O} className={`owl-dots${dots && n > 1 ? '' : ' disabled'}`}>
          {dots && slides.map((s, i) => (
            <div {...O} key={i} className={`owl-dot${i === index ? ' active' : ''}`} onClick={() => setIndex(i)}>
              <span {...O} />
            </div>
          ))}
        </div>
      </div>
    </owl-carousel-o>
  );
}
