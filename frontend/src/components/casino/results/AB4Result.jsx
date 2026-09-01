import { useState, useCallback } from 'react';
import { cardSrc } from './resultParsers';

const VISIBLE = 4;

function AB4Carousel({ cards, indices }) {
  const [scrollIdx, setScrollIdx] = useState(0);
  const maxIdx = Math.max(0, cards.length - VISIBLE);

  const scrollPrev = useCallback(() => {
    setScrollIdx((prev) => Math.max(0, prev - VISIBLE));
  }, []);

  const scrollNext = useCallback(() => {
    setScrollIdx((prev) => Math.min(maxIdx, prev + VISIBLE));
  }, [maxIdx]);

  const atStart = scrollIdx <= 0;
  const atEnd = scrollIdx >= maxIdx || cards.length <= VISIBLE;
  const slidePercent = 100 / VISIBLE;
  const translatePercent = -(scrollIdx * slidePercent);

  return (
    <section tabIndex="0" className="lastCards-result hooper">
      <div className="hooper-list">
        <ul
          className="hooper-track"
          style={{ transform: `translateX(${translatePercent}%)`, display: 'flex', transition: 'transform 0.3s ease', padding: 0, margin: 0, listStyle: 'none' }}
        >
          {cards.map((code, i) => (
            <li key={i} className={`hooper-slide${i >= scrollIdx && i < scrollIdx + VISIBLE ? ' is-active' : ''}`} style={{ width: `${slidePercent}%`, flexShrink: 0 }}>
              <div className="casino-result-cards-item">
                <div className="text-center">{indices ? indices[i] : i + 1}</div>
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
          Item {scrollIdx + 1} of {cards.length}
        </div>
      </div>
    </section>
  );
}

export default function AB4Result({ detail }) {
  const allCards = (detail?.card || '').split(',').map((c) => c.trim()).filter(Boolean);
  // Andar = odd indices (1,3,5...), Bahar = even indices (0,2,4...)
  const andar = allCards.filter((_, i) => i % 2 === 1);
  const bahar = allCards.filter((_, i) => i % 2 === 0);
  // Original 1-based position numbers: Andar gets odd positions (1,3,5...), Bahar gets even (2,4,6...)
  const andarIndices = andar.map((_, i) => (i * 2) + 2);
  const baharIndices = bahar.map((_, i) => (i * 2) + 1);

  const win = String(detail?.win ?? '');
  const rdesc = detail?.rdesc || '';
  // Determine winner: winnat > rdesc containing Andar/Bahar > win code > last card side
  const winner = detail?.winnat ||
    (rdesc.toLowerCase().includes('andar') ? 'Andar' : rdesc.toLowerCase().includes('bahar') ? 'Bahar' : '') ||
    (win === '1' ? 'Andar' : win === '2' ? 'Bahar' : '') ||
    (allCards.length > 0 ? (allCards.length % 2 === 0 ? 'Bahar' : 'Andar') : '');
  const andarWon = winner.toLowerCase() === 'andar';
  const baharWon = winner.toLowerCase() === 'bahar';

  return (
    <div className="row row5 ab2-result ab4-result">
      <div className="col-12 col-lg-8">
        <div className="row row5">
          <div className="col-2 abj-title col-md-1">
            <div className="row row5"><div className="col-12 mt-2"><b>ANDAR</b></div></div>
            <div className="row row5"><div className="col-12 mt-2"><b>BAHAR</b></div></div>
          </div>
          <div className="col-10 col-md-11">
            <div className="card-inner">
              <div className="row row5">
                <div className="col-10">
                  {andar.length > 0 && <AB4Carousel cards={andar} indices={andarIndices} />}
                </div>
                <div className="col-2">
                  {andarWon && (
                    <div className="casino-result-cards-item">
                      <img src="/assets/front/img/winner.png" className="winner-icon" alt="winner" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="card-inner mt-4 mb-3">
              <div className="row row5">
                <div className="col-10">
                  {bahar.length > 0 && <AB4Carousel cards={bahar} indices={baharIndices} />}
                </div>
                <div className="col-2">
                  {baharWon && (
                    <div className="casino-result-cards-item">
                      <img src="/assets/front/img/winner.png" className="winner-icon" alt="winner" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-4">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winner}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
