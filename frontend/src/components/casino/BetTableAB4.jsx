import { memo, useRef, useState, useCallback, useEffect } from 'react';
import { cardSrc, parseCards } from './cards/cardUtils';

const AB_CARD_BASE = '/assets/front/img/andar-bahar-cards/';

/** Position index (1-13) for each card suffix */
const SUFFIX_POS = {
  A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13,
};

function getCardPos(nat) {
  const suffix = nat.split(' ').slice(1).join(' ');
  return SUFFIX_POS[suffix] ?? 0;
}

function slideClass(i, scrollIdx) {
  const rel = i - scrollIdx;
  if (rel === 0) return 'hooper-slide is-active is-current';
  if (rel > 0 && rel < ITEMS_TO_SHOW) return 'hooper-slide is-active';
  if (rel >= ITEMS_TO_SHOW && rel < ITEMS_TO_SHOW + 3) return 'hooper-slide is-next';
  return 'hooper-slide';
}

const ITEMS_TO_SHOW = 3;

/** Hooper-style card carousel — uses CSS percentage width for reliable rendering */
const CardCarousel = memo(function CardCarousel({ cards, mt }) {
  const sectionRef = useRef(null);
  const maxIdx = Math.max(0, cards.length - ITEMS_TO_SHOW);
  const [scrollIdx, setScrollIdx] = useState(maxIdx);

  // Keep view at newest cards when new cards arrive
  useEffect(() => { setScrollIdx(maxIdx); }, [maxIdx]);

  // LEFT button (hooper-next, positioned left): cards slide RIGHT → show older from left
  const scrollLeft = useCallback(() => {
    setScrollIdx((prev) => Math.max(0, prev - ITEMS_TO_SHOW));
  }, []);

  // RIGHT button (hooper-prev, positioned right): cards slide LEFT → show newer from right
  const scrollRight = useCallback(() => {
    setScrollIdx((prev) => Math.min(maxIdx, prev + ITEMS_TO_SHOW));
  }, [maxIdx]);

  const atOldest = scrollIdx <= 0;
  const atNewest = scrollIdx >= maxIdx || cards.length <= ITEMS_TO_SHOW;

  // Calculate percentage-based transform
  const slidePercent = 100 / ITEMS_TO_SHOW;
  const translatePercent = -(scrollIdx * slidePercent);

  return (
    <div className="card-inner">
      <div className={`row row5${mt ? ' mt-1' : ''}`}>
        <div className="col-12">
          <div className="lastCards-container">
            <section tabIndex="0" className="lastCards hooper" ref={sectionRef}>
              <div className="hooper-list">
                <ul
                  className="hooper-track"
                  style={{ transform: `translateX(${translatePercent}%)`, display: 'flex', transition: 'transform 0.3s ease', padding: 0, margin: 0, listStyle: 'none' }}
                >
                  {cards.map((code, i) => (
                    <li key={i} className={slideClass(i, scrollIdx)} aria-hidden={i < scrollIdx || i >= scrollIdx + ITEMS_TO_SHOW ? true : undefined} style={{ width: `${slidePercent}%`, flexShrink: 0 }}>
                      <img src={cardSrc(code)} alt={code} />
                    </li>
                  ))}
                </ul>
                <div className="hooper-navigation is-rtl">
                  <button type="button" className={`hooper-prev${atNewest ? ' is-disabled' : ''}`} onClick={scrollRight}>
                    <svg className="icon icon-arrowRight" viewBox="0 0 24 24" width="24px" height="24px">
                      <title>Arrow Right</title>
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  </button>
                  <button type="button" className={`hooper-next${atOldest ? ' is-disabled' : ''}`} onClick={scrollLeft}>
                    <svg className="icon icon-arrowLeft" viewBox="0 0 24 24" width="24px" height="24px">
                      <title>Arrow Left</title>
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                    </svg>
                  </button>
                </div>
                <div aria-live="polite" aria-atomic="true" className="hooper-liveregion hooper-sr-only">
                  Item 1 of {cards.length}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
});

/** Desktop card strip — rendered inside casino-video via customCards prop */
export const DesktopCardsAB4 = memo(function DesktopCardsAB4({ andarCards, baharCards, nextCount, nextSide }) {
  return (
    <div className="casino-video-cards d-none-small">
      <div className="casino-cards-shuffle"><i className="fas fa-grip-lines-vertical" /></div>
      <div className="casino-video-cards-container">
        <div className="row row5">
          <div className="col-12 text-center next-count">
            Next Card Count: <span className="text-warning">{nextCount} / {nextSide}</span>
          </div>
        </div>
        <div className="row row5">
          <div className="col-3 abj-video-title">
            <div className="row row5"><div className="col-12"><b>ANDAR</b></div></div>
            <div className="row row5"><div className="col-12"><b>BAHAR</b></div></div>
          </div>
          <div className="col-9">
            <CardCarousel cards={andarCards} />
            <CardCarousel cards={baharCards} mt />
          </div>
        </div>
      </div>
    </div>
  );
});

/** Mobile card strip — rendered inside casino-detail */
const MobileCards = memo(function MobileCards({ andarCards, baharCards, nextCount, nextSide }) {
  return (
    <div className="casino-video-cards d-none-big">
      <div className="casino-video-cards-container">
        <div className="row row5">
          <div className="col-12 text-center next-count">
            Next Card Count: <span className="text-warning">{nextCount} / {nextSide}</span>
          </div>
        </div>
        <div className="row row5 align-items-center justify-content-center">
          <div className="col-2">
            <div className="row row5"><div className="col-12"><b>ANDAR</b></div></div>
            <div className="row row5"><div className="col-12"><b>BAHAR</b></div></div>
          </div>
          <div className="col-6">
            <CardCarousel cards={andarCards} />
            <CardCarousel cards={baharCards} mt />
          </div>
        </div>
      </div>
    </div>
  );
});

// ab3/ab4 pay a flat 100% of the stake — the per-card feed fields are `b`
// (0/1 bettable flag) and `l` (how many of that rank remain in the shoe),
// neither is a price. Sending `l` as odds paid a win `stake × (l−1)` — up to
// 11× too much at a fresh shoe. The card box keeps DISPLAYING `l` (that is the
// shoe count the real site shows); the server pins the same 2.0 on placebet.
const AB_FLAT_ODDS = 2;

/** 13-card betting grid for either Andar or Bahar */
const CardsBetBox = memo(function CardsBetBox({ boxClass, titleClass, title, items, isSuspended, onBet, exposures }) {
  return (
    <div className={`${boxClass} text-center${isSuspended ? ' suspended' : ''}`}>
      <h5 className={`w-100 text-center ${titleClass}`}>{title}</h5>
      {items.map((item) => {
        const pos = getCardPos(item.nat);
        const imgNum = (item.b && item.b !== '0') ? pos : 0;
        // `b` is the availability gate; a rank with l === 0 is exhausted in the
        // shoe and can never win, so it must not accept a bet.
        const bettable = !isSuspended && item.b && item.b !== '0' && Number(item.l) > 0;
        const exp = exposures?.[item.nat] || 0;
        const expClass = exp === 0 ? 'casino-book d-none' : exp < 0 ? 'casino-book book-red' : 'casino-book book-green';
        return (
          <div
            key={item.sid}
            className="casino-card-item"
            onClick={!bettable ? undefined : () => onBet && onBet(item.sid, 'back', AB_FLAT_ODDS, item)}
          >
            <div>{item.l || 0}</div>
            <div className="card-image">
              <img src={`${AB_CARD_BASE}${imgNum}.png`} alt={item.nat} />
            </div>
            <div className={expClass}>{exp}</div>
          </div>
        );
      })}
    </div>
  );
});

const BetTableAB4 = memo(function BetTableAB4({ gameData, onBet, exposures }) {
  const child = gameData?.child ?? [];
  const sub = gameData?.sub ?? [];
  const card = gameData?.card ?? '';

  // The feed pads undealt slots with "1" placeholders — drop them so the
  // strip grows card by card and the carousel auto-follows the newest deal.
  // Even indices (0,2,4…) = BAHAR, odd = ANDAR (matches result modal +
  // settlement).
  const allCards = parseCards(card).filter((c) => c !== '1' && c !== '0');
  const andarCards = allCards.filter((_, i) => i % 2 === 1);
  const baharCards = allCards.filter((_, i) => i % 2 === 0);

  const andarItems = child.filter((c) => c.nat.startsWith('Andar'));
  const baharItems = child.filter((c) => c.nat.startsWith('Bahar'));

  const globalSusp = sub.length > 0 && (sub[0].gstatus === 'SUSPENDED' || sub[0].gstatus === '0');
  const andarSusp = globalSusp || (andarItems.length > 0 && andarItems.every((c) => !c.b || c.b === '0'));
  const baharSusp = globalSusp || (baharItems.length > 0 && baharItems.every((c) => !c.b || c.b === '0'));

  // Next card info from sub[0]
  const nextCardItem = sub[0];
  const nextCount = nextCardItem ? String(nextCardItem.nat || '').replace('Card ', '') : '0';
  const nextSide = andarCards.length <= baharCards.length ? 'Andar' : 'Bahar';

  return (
    <>
      {/* Card carousel */}
      <MobileCards andarCards={andarCards} baharCards={baharCards} nextCount={nextCount} nextSide={nextSide} />

      {/* Betting grid */}
      <div>
        <div className="ab-bg">
          <CardsBetBox
            boxClass="andar-cards-box"
            titleClass="text-playera"
            title="Andar"
            items={andarItems}
            isSuspended={andarSusp}
            onBet={onBet}
            exposures={exposures}
          />
          <CardsBetBox
            boxClass="bahar-cards-box"
            titleClass="text-playerb"
            title="Bahar"
            items={baharItems}
            isSuspended={baharSusp}
            onBet={onBet}
            exposures={exposures}
          />
        </div>
      </div>
    </>
  );
});

export default BetTableAB4;
