import { useState, useCallback } from 'react';
import { cardSrc } from './resultParsers';

const VISIBLE = 15;

function ResultCarousel({ cards }) {
  const [offset, setOffset] = useState(0);
  const slideW = 75;
  const maxOffset = Math.max(0, (cards.length - VISIBLE) * slideW);

  const scrollPrev = useCallback(() => {
    setOffset((prev) => Math.max(0, prev - slideW * VISIBLE));
  }, []);

  const scrollNext = useCallback(() => {
    setOffset((prev) => Math.min(maxOffset, prev + slideW * VISIBLE));
  }, [maxOffset]);

  const atStart = offset <= 0;
  const atEnd = offset >= maxOffset || cards.length <= VISIBLE;

  return (
    <section tabIndex="0" className="lastCards-result hooper">
      <div className="hooper-list">
        <ul
          className="hooper-track"
          style={{ transform: `translate(-${offset}px, 0px)` }}
        >
          {cards.map((code, i) => (
            <li
              key={i}
              className={`hooper-slide is-active${i === 0 ? ' is-current' : ''}`}
              style={{ width: slideW }}
            >
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
          Item {Math.floor(offset / slideW) + 1} of {cards.length}
        </div>
      </div>
    </section>
  );
}

export default function AB20Result({ detail }) {
  const allCards = (detail?.card || '').split(',').map((c) => c.trim()).filter(Boolean);
  // Even indices (0,2,4...) = Bahar, Odd indices (1,3,5...) = Andar
  const andar = allCards.filter((_, i) => i % 2 === 1);
  const bahar = allCards.filter((_, i) => i % 2 === 0);

  return (
    <div className="row row5">
      <div className="col-12">
        <h5 className="text-center">Andar</h5>
        {andar.length > 0 && <ResultCarousel cards={andar} />}
      </div>
      <div className="col-12 mt-2">
        <h5 className="text-center">Bahar</h5>
        {bahar.length > 0 && <ResultCarousel cards={bahar} />}
      </div>
    </div>
  );
}
