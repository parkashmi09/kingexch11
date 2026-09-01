import { useState, useCallback } from 'react';
import { cardSrc } from './resultParsers';

const SLIDE_W = 54;
const VISIBLE = 3;

function ABJCarousel({ cards }) {
  const [offset, setOffset] = useState(0);
  const maxOffset = Math.max(0, (cards.length - VISIBLE) * SLIDE_W);

  const scrollPrev = useCallback(() => {
    setOffset((prev) => Math.max(0, prev - SLIDE_W * VISIBLE));
  }, []);

  const scrollNext = useCallback(() => {
    setOffset((prev) => Math.min(maxOffset, prev + SLIDE_W * VISIBLE));
  }, [maxOffset]);

  const atStart = offset <= 0;
  const atEnd = offset >= maxOffset || cards.length <= VISIBLE;

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
          Item {Math.floor(offset / SLIDE_W) + 1} of {cards.length}
        </div>
      </div>
    </section>
  );
}

export default function ABJResult({ detail }) {
  const allCards = (detail?.card || '').split(',').map((c) => c.trim()).filter(Boolean);
  const trumpCard = allCards[0] && allCards[0] !== '1' ? allCards[0] : null;
  const dealt = allCards.slice(1).filter((c) => c !== '1' && c !== '0');
  // After trump: even indices = B, odd indices = A
  const aCards = dealt.filter((_, i) => i % 2 === 1);
  const bCards = dealt.filter((_, i) => i % 2 === 0);

  const aFirst = aCards[0];
  const aRest = aCards.slice(1);
  const bFirst = bCards[0];
  const bRest = bCards.slice(1);

  const winner = detail?.winnat || '';
  const rdesc = (detail?.rdesc || '').split('#');
  const isAWinner = winner.toLowerCase() === 'andar' || detail?.win === '1';
  const isBWinner = winner.toLowerCase() === 'bahar' || detail?.win === '2';

  return (
    <div className="row row5 ab2-result">
      <div className="col-12 col-lg-8">
        <div className="row row5">
          <div className="col-1 abj-title">
            <div className="row row5"><div className="col-12"><b>A</b></div></div>
            <div className="row row5"><div className="col-12"><b>B</b></div></div>
          </div>
          <div className="col-2 abj-common-card">
            {trumpCard && (
              <div className="casino-result-cards-item">
                <img src={cardSrc(trumpCard)} alt={trumpCard} />
              </div>
            )}
          </div>
          <div className="col-9">
            {/* A row */}
            <div className="card-inner">
              <div className="row row5">
                <div className="col-3">
                  {aFirst && (
                    <div className="casino-result-cards-item">
                      <img src={cardSrc(aFirst)} alt={aFirst} />
                    </div>
                  )}
                </div>
                <div className="col-7">
                  {aRest.length > 0 && <ABJCarousel cards={aRest} />}
                </div>
                <div className="col-2">
                  {isAWinner && (
                    <div className="casino-result-cards-item">
                      <img src="/assets/front/img/winner.png" className="winner-icon" alt="winner" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* B row */}
            <div className="card-inner">
              <div className="row row5">
                <div className="col-3">
                  {bFirst && (
                    <div className="casino-result-cards-item">
                      <img src={cardSrc(bFirst)} alt={bFirst} />
                    </div>
                  )}
                </div>
                <div className="col-7">
                  {bRest.length > 0 && <ABJCarousel cards={bRest} />}
                </div>
                <div className="col-2">
                  {isBWinner && (
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
            <div>{winner || rdesc[0] || ''}</div>
          </div>
          {rdesc[1] && (
            <div className="casino-result-desc-item">
              <div>Suit</div>
              <div>{rdesc[1]}</div>
            </div>
          )}
          {rdesc[2] && (
            <div className="casino-result-desc-item">
              <div>Odd/Even</div>
              <div>{rdesc[2]}</div>
            </div>
          )}
          {rdesc[3] && (
            <div className="casino-result-desc-item">
              <div>Joker</div>
              <div>{rdesc[3]}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
