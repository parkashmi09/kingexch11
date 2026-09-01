import { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { cardSrc, parseCards } from './cards/cardUtils';

const AB_CARD_BASE = '/assets/front/img/andar-bahar-cards/';

/** Hooper-style card carousel for dealt cards */
const ITEMS_TO_SHOW = 3;

function slideClass(i, scrollIdx) {
  const rel = i - scrollIdx;
  if (rel === 0) return 'hooper-slide is-active is-current';
  if (rel > 0 && rel < ITEMS_TO_SHOW) return 'hooper-slide is-active';
  if (rel >= ITEMS_TO_SHOW && rel < ITEMS_TO_SHOW + 3) return 'hooper-slide is-next';
  return 'hooper-slide';
}

const CardCarousel = memo(function CardCarousel({ cards, mt }) {
  const maxIdx = Math.max(0, cards.length - ITEMS_TO_SHOW);
  const [scrollIdx, setScrollIdx] = useState(maxIdx);

  useEffect(() => { setScrollIdx(maxIdx); }, [maxIdx]);

  const scrollLeft = useCallback(() => {
    setScrollIdx((prev) => Math.max(0, prev - ITEMS_TO_SHOW));
  }, []);

  const scrollRight = useCallback(() => {
    setScrollIdx((prev) => Math.min(maxIdx, prev + ITEMS_TO_SHOW));
  }, [maxIdx]);

  const atOldest = scrollIdx <= 0;
  const atNewest = scrollIdx >= maxIdx || cards.length <= ITEMS_TO_SHOW;

  const slidePercent = 100 / ITEMS_TO_SHOW;
  const translatePercent = -(scrollIdx * slidePercent);

  return (
    <div className="lastCards-container">
      <section tabIndex="0" className="lastCards hooper">
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
  );
});

/** Desktop card strip — rendered inside casino-video via customCards prop */
export const DesktopCardsAB20 = memo(function DesktopCardsAB20({ andarCards, baharCards }) {
  return (
    <div className="casino-video-cards">
      <div className="casino-cards-shuffle"><i className="fas fa-grip-lines-vertical" /></div>
      <div className="casino-video-cards-container">
        <CardCarousel cards={andarCards} />
        <CardCarousel cards={baharCards} />
      </div>
    </div>
  );
});

/** 13-card betting grid for Andar or Bahar */
const CardsBetBox = memo(function CardsBetBox({ boxClass, titleClass, title, items, positions, rankBase, dealt, onBet, exposures }) {
  // During the betting window nothing has been dealt yet, so `positions`
  // (ares/bres, the per-rank RESULT codes) are all 0 → every card would render
  // face-down and the player can't see which rank each spot is. Once the deal
  // starts revealing (`dealt`), honour the result (winning side face-up, losing
  // side face-down). Before that, show each rank face-up so the betting options
  // are visible: Andar deck = 1..13 (A..K), Bahar deck = 21..33 (A..K).
  return (
    <div className={`${boxClass} text-center`}>
      <h5 className={`w-100 text-center ${titleClass}`}>{title}</h5>
      {items.map((item, idx) => {
        const imgNum = dealt ? (positions[idx] || 0) : rankBase + idx;
        // `b` is the back price (ab20 items carry no `l` at all — sending it
        // meant odds 0 at click, and the bet only got a real price if the
        // buffer's re-read happened to swap `b` in). Price the click directly
        // and refuse while no price is quoted.
        const isSusp = item.gstatus === 'SUSPENDED' || !(parseFloat(item.b) > 0);
        return (
          <div
            key={item.sid}
            className="casino-card-item"
            onClick={isSusp ? undefined : () => onBet && onBet(item.sid, 'back', item.b, item)}
          >
            <div className="card-image">
              <img src={`${AB_CARD_BASE}${imgNum}.png`} alt={item.nat} />
            </div>
            {(() => {
              const exp = exposures?.[item?.nat] || exposures?.[item?.nat?.toLowerCase()];
              if (exp && exp !== 0) return <div className={`casino-book ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</div>;
              return <div className="casino-book d-none">0</div>;
            })()}
          </div>
        );
      })}
    </div>
  );
});

const BetTableAB20 = memo(function BetTableAB20({ gameData, onBet, exposures }) {
  const sub = gameData?.sub ?? [];
  const aresStr = gameData?.ares || '';
  const bresStr = gameData?.bres || '';

  const andarItems = sub.filter((c) => c.nat.startsWith('Andar'));
  const baharItems = sub.filter((c) => c.nat.startsWith('Bahar'));

  const andarPositions = useMemo(() => aresStr.split(',').map(Number), [aresStr]);
  // Bahar positions from API use raw values (21=A, 22=2, ..., 33=K, 0=face-down)
  const baharPositions = useMemo(() => bresStr.split(',').map(Number), [bresStr]);

  // The round has started revealing once ANY rank slot (either side) carries a
  // result code. Shared by both boxes so they flip from face-up betting options
  // to the result reveal together (the deal opens with Bahar, so a per-box flag
  // would flash Bahar's result a beat before Andar's).
  const dealt = useMemo(
    () => andarPositions.some((p) => p > 0) || baharPositions.some((p) => p > 0),
    [andarPositions, baharPositions],
  );

  return (
    <div>
      <div className="ab-bg">
        <CardsBetBox
          boxClass="andar-cards-box"
          titleClass="text-playera"
          title="Andar"
          items={andarItems}
          positions={andarPositions}
          rankBase={1}
          dealt={dealt}
          onBet={onBet}
          exposures={exposures}
        />
        <CardsBetBox
          boxClass="bahar-cards-box"
          titleClass="text-playerb"
          title="Bahar"
          items={baharItems}
          positions={baharPositions}
          rankBase={21}
          dealt={dealt}
          onBet={onBet}
          exposures={exposures}
        />
      </div>
    </div>
  );
});

export default BetTableAB20;
