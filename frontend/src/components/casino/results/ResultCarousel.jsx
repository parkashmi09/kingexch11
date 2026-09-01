import { useState, useCallback } from 'react';
import { cardSrc } from './resultParsers';

const SLIDE_W = 62;
const VISIBLE = 4;

export default function ResultCarousel({ cards }) {
  const [offset, setOffset] = useState(0);
  const maxOffset = Math.max(0, (cards.length - VISIBLE) * SLIDE_W);
  const atStart = offset <= 0;
  const atEnd = offset >= maxOffset || cards.length <= VISIBLE;

  const scrollPrev = useCallback(() => {
    setOffset((prev) => Math.max(0, prev - SLIDE_W * VISIBLE));
  }, []);

  const scrollNext = useCallback(() => {
    setOffset((prev) => Math.min(maxOffset, prev + SLIDE_W * VISIBLE));
  }, [maxOffset]);

  return (
    <section tabIndex="0" className="lastCards-result hooper">
      <div className="hooper-list">
        <ul className="hooper-track" style={{ transform: `translate(-${offset}px, 0px)` }}>
          {cards.map((code, i) => (
            <li key={i} className={`hooper-slide is-active${i === 0 ? ' is-current' : ''}`} style={{ width: SLIDE_W }}>
              <div className="casino-result-cards-item">
                <img src={cardSrc(code)} alt={code} />
              </div>
            </li>
          ))}
        </ul>
        <div className="hooper-navigation">
          <button type="button" className={`hooper-prev${atStart ? ' is-disabled' : ''}`} onClick={scrollPrev}>
            <svg className="icon icon-arrowLeft" viewBox="0 0 24 24" width="24px" height="24px">
              <title>Arrow Left</title>
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
            </svg>
          </button>
          <button type="button" className={`hooper-next${atEnd ? ' is-disabled' : ''}`} onClick={scrollNext}>
            <svg className="icon icon-arrowRight" viewBox="0 0 24 24" width="24px" height="24px">
              <title>Arrow Right</title>
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </button>
        </div>
        <div aria-live="polite" aria-atomic="true" className="hooper-liveregion hooper-sr-only">
          Item 1 of {cards.length}
        </div>
      </div>
    </section>
  );
}
