import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * One horizontally-scrolling row of filter pills, with the reference's edge
 * fades and arrow buttons.
 *
 * The reference writes this markup out twice — once for the provider row and
 * once for the game-type row — with a ref and a pair of fade flags each. It is
 * one component here because the two copies are identical apart from their
 * items; the rendered DOM is the same either way.
 *
 * (The reference's two copies share a fade flag between them by mistake, so its
 * provider row can show a right-hand arrow that belongs to the game-type row.
 * Each strip measures itself here.)
 */
function FilterStrip({ items, value, onSelect, keyPrefix }) {
  const scroller = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const overflows = el.scrollWidth > el.clientWidth;
    setShowLeft(overflows && el.scrollLeft > 0);
    setShowRight(overflows && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  // The reference measures 100ms after the list lands, once the pills have laid
  // out — scrollWidth is still the pre-paint value if you read it immediately.
  useEffect(() => {
    const t = setTimeout(measure, 100);
    return () => clearTimeout(t);
  }, [items, measure]);

  const scrollBy = (dir) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -750 : 750, behavior: 'smooth' });
    setTimeout(measure, 300);
  };

  return (
    <div
      className={`game-type-container position-relative prl5 ${showLeft ? 'show-left-fade' : ''} ${
        showRight ? 'show-right-fade' : ''
      }`}
    >
      {showLeft && (
        <button className="game-type-arrow game-type-arrow-left" onClick={() => scrollBy('left')}>
          <i className="fa fa-chevron-left"></i>
        </button>
      )}
      <div className="wacfilter-box-scroll" ref={scroller} onScroll={measure}>
        <div className="align-items-center d-flex mt-2 wacfilter-box flex-nowrap">
          <div className={`mr-1 ${value === '' ? 'active' : ''}`} onClick={() => onSelect('')}>
            ALL
          </div>
          {items.map((item) => (
            <div
              key={`${keyPrefix}_${item.id}`}
              className={`mr-1 ${value === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
      {showRight && (
        <button className="game-type-arrow game-type-arrow-right" onClick={() => scrollBy('right')}>
          <i className="fa fa-chevron-right"></i>
        </button>
      )}
    </div>
  );
}

export default FilterStrip;
