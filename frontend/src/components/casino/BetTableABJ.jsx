import { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { cardSrc, parseCards } from './cards/cardUtils';

const CARD_IMG_BASE = '/assets/cards/';
const CARD_FACE_BASE = '/assets/front/img/cards/';
const CARD_FACES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = [
  { name: 'spade', img: 'spade.png', sid: 20 },
  { name: 'heart', img: 'heart.png', sid: 22 },
  { name: 'club', img: 'club.png', sid: 21 },
  { name: 'diamond', img: 'diamond.png', sid: 23 },
];

const ITEMS_TO_SHOW = 3;

function slideClass(i, scrollIdx) {
  const rel = i - scrollIdx;
  if (rel === 0) return 'hooper-slide is-active is-current';
  if (rel > 0 && rel < ITEMS_TO_SHOW) return 'hooper-slide is-active';
  if (rel >= ITEMS_TO_SHOW && rel < ITEMS_TO_SHOW + 3) return 'hooper-slide is-next';
  return 'hooper-slide';
}

const CardCarousel = memo(function CardCarousel({ cards }) {
  const maxIdx = Math.max(0, cards.length - ITEMS_TO_SHOW);
  const [scrollIdx, setScrollIdx] = useState(maxIdx);

  useEffect(() => { setScrollIdx(maxIdx); }, [maxIdx]);

  const slidePercent = 100 / ITEMS_TO_SHOW;
  const translatePercent = -(scrollIdx * slidePercent);

  const atOldest = scrollIdx <= 0;
  const atNewest = scrollIdx >= maxIdx || cards.length <= ITEMS_TO_SHOW;

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
            <button type="button" className={`hooper-prev${atNewest ? ' is-disabled' : ''}`} onClick={() => setScrollIdx((p) => Math.min(maxIdx, p + ITEMS_TO_SHOW))}>
              <svg className="icon icon-arrowRight" viewBox="0 0 24 24" width="24px" height="24px"><title>Arrow Right</title><path d="M0 0h24v24H0z" fill="none" /><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg>
            </button>
            <button type="button" className={`hooper-next${atOldest ? ' is-disabled' : ''}`} onClick={() => setScrollIdx((p) => Math.max(0, p - ITEMS_TO_SHOW))}>
              <svg className="icon icon-arrowLeft" viewBox="0 0 24 24" width="24px" height="24px"><title>Arrow Left</title><path d="M0 0h24v24H0z" fill="none" /><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" /></svg>
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

/** Cards section shared by desktop (d-none-small) and mobile (d-none-big) */
const ABJCards = memo(function ABJCards({ trumpCard, aCards, bCards, className }) {
  const aFirst = aCards[0];
  const aRest = aCards.slice(1);
  const bFirst = bCards[0];
  const bRest = bCards.slice(1);

  // Hide entire section when no cards dealt yet
  if (!trumpCard && aCards.length === 0 && bCards.length === 0) return null;

  return (
    <div className={`casino-video-cards ${className}`}>
      {className === 'd-none-small' && (
        <div className="casino-cards-shuffle"><i className="fas fa-grip-lines-vertical" /></div>
      )}
      <div className="casino-video-cards-container">
        <div className="row row5 align-items-center">
          <div className="col-1">
            <div className="row row5"><div className="col-12"><b>A</b></div></div>
            <div className="row row5"><div className="col-12"><b>B</b></div></div>
          </div>
          <div className="col-2">
            {trumpCard && <span><img src={cardSrc(trumpCard)} className="card-right" alt="trump" /></span>}
          </div>
          <div className="col-9">
            <div className="card-inner">
              <div className="row row5">
                <div className="col-3">
                  {aFirst && <span><img src={cardSrc(aFirst)} alt={aFirst} /></span>}
                </div>
                <div className="col-9">
                  {aRest.length > 0 && <CardCarousel cards={aRest} />}
                </div>
              </div>
            </div>
            <div className="card-inner">
              <div className="row row5 mt-1">
                <div className="col-3">
                  {bFirst && <span><img src={cardSrc(bFirst)} alt={bFirst} /></span>}
                </div>
                <div className="col-9">
                  {bRest.length > 0 && <CardCarousel cards={bRest} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/** Desktop cards rendered inside CasinoVideo via customCards prop */
export const DesktopCardsABJ = memo(function DesktopCardsABJ({ trumpCard, aCards, bCards }) {
  return <ABJCards trumpCard={trumpCard} aCards={aCards} bCards={bCards} className="d-none-small" />;
});

/** SA/SB + First/Second Bet section */
function BetSide({ title, items, onBet, exposures }) {
  // suffix for API: A-side items get "SA", B-side get "SB"
  const suffix = title === 'A' ? 'SA' : 'SB';
  return (
    <div className={title === 'A' ? 'teen20left' : 'teen20right'}>
      <div className="ab2-title">{title}</div>
      {items.map((item) => {
        const isSusp = item.gstatus === 'SUSPENDED' || item.b === 0 || item.b === '0';
        const isSaSb = item.nat === 'SA' || item.nat === 'SB';
        const label = isSaSb ? item.nat : item.nat.replace('1st', 'First').replace('2nd', 'Second');
        const boxClass = isSaSb ? 'sa-sb-box' : 'ab2-bet';
        // For 1st Bet / 2nd Bet, append "SA"/"SB" so backend knows which side
        const apiNat = isSaSb ? item.nat : `${item.nat} ${suffix}`;
        // The book sits UNDER the clickable box, so the runner is a column
        // wrapper (carries the box width) holding the box + the book below it.
        return (
          <div key={item.sid} className={`ab2-runner ${isSaSb ? 'sa' : 'bet'}`}>
            <div
              className={`${boxClass} pr${isSusp ? ' suspended' : ''}`}
              onClick={isSusp ? undefined : () => onBet(item.sid, 'back', item.b, { ...item, nat: apiNat })}
            >
              <div>{label}</div>
              <div>{item.b || 0}</div>
            </div>
            <Book value={exposures?.[apiNat]} />
          </div>
        );
      })}
      <div className="ab2-title">{title}</div>
    </div>
  );
}

// Worst-case exposure "book" shown UNDER the runner box (diamond-standard),
// matching the casino-book pattern used across the other games. A hidden 0
// placeholder keeps the row height stable when there is no exposure.
function Book({ value }) {
  const v = Number(value) || 0;
  if (!v) return <div className="casino-book d-none">0</div>;
  return <div className={`casino-book ${v < 0 ? 'book-red' : 'book-green'}`}>{Math.round(v)}</div>;
}

const BetTableABJ = memo(function BetTableABJ({ gameData, onBet, exposures }) {
  const sub = gameData?.sub ?? [];
  const card = gameData?.card ?? '';
  const allCards = parseCards(card);

  const trumpCard = allCards[0] && allCards[0] !== '1' ? allCards[0] : null;
  const dealtCards = allCards.slice(1).filter((c) => c !== '1' && c !== '0');
  const aCards = dealtCards.filter((_, i) => i % 2 === 1);
  const bCards = dealtCards.filter((_, i) => i % 2 === 0);

  // Group sub items by sid
  const byId = useMemo(() => {
    const m = {};
    sub.forEach((s) => { m[s.sid] = s; });
    return m;
  }, [sub]);

  const aItems = [byId[1], byId[2], byId[3]].filter(Boolean);
  const bItems = [byId[4], byId[5], byId[6]].filter(Boolean);

  const oddItem = byId[24];
  const evenItem = byId[25];

  const jokerCards = CARD_FACES.map((face, i) => byId[7 + i]).filter(Boolean);
  const jokerOddsTitle = jokerCards[0]?.b || 0;

  return (
    <>
      {/* Mobile cards */}
      <ABJCards trumpCard={trumpCard} aCards={aCards} bCards={bCards} className="d-none-big" />

      {/* SA/SB + Bets */}
      <div className="teen20casino-container">
        <BetSide title="A" items={aItems} onBet={onBet} exposures={exposures} />
        <div className="teen20center"></div>
        <BetSide title="B" items={bItems} onBet={onBet} exposures={exposures} />
      </div>

      {/* Odd/Even + Suits */}
      <div className="teen20casino-container">
        <div className="teen20left ab2oddeven">
          <div className="casino-box-row">
            <div className="casino-bl-box"><div className="casino-bl-box-item"><b>Odd</b></div></div>
            <div className="casino-bl-box"><div className="casino-bl-box-item"><b>Even</b></div></div>
          </div>
          <div className="casino-box-row">
            {[oddItem, evenItem].map((item) => {
              if (!item) return null;
              const isSusp = item.gstatus === 'SUSPENDED' || item.b === 0 || item.b === '0';
              return (
                <div key={item.sid} className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item${isSusp ? ' suspended' : ''}`}
                    onClick={isSusp ? undefined : () => onBet(item.sid, 'back', item.b, item)}
                  >
                    <span className="casino-box-odd">{item.b || 0}</span>
                  </div>
                  <Book value={exposures?.[item?.nat]} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="teen20center"></div>
        <div className="teen20left ab2cards">
          <div className="casino-box-row">
            {SUITS.map((suit) => (
              <div key={suit.name} className="casino-bl-box">
                <div className="casino-bl-box-item casino-card-img">
                  <img src={`${CARD_FACE_BASE}${suit.img}`} alt={suit.name} />
                </div>
              </div>
            ))}
          </div>
          <div className="casino-box-row">
            {SUITS.map((suit) => {
              const item = byId[suit.sid];
              if (!item) return <div key={suit.name} className="casino-bl-box"><div className="back casino-bl-box-item suspended"><span className="casino-box-odd">0</span></div></div>;
              const isSusp = item.gstatus === 'SUSPENDED' || item.b === 0 || item.b === '0';
              return (
                <div key={suit.name} className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item${isSusp ? ' suspended' : ''}`}
                    onClick={isSusp ? undefined : () => onBet(item.sid, 'back', item.b, item)}
                  >
                    <span className="casino-box-odd">{item.b || 0}</span>
                  </div>
                  <Book value={exposures?.[item?.nat]} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 13 Cards */}
      <div className="teen20casino-container ab2allcards">
        <div className="text-center w-100">
          <div className="casino-bl-box casino-cards-odds-title">
            <div className="casino-bl-box-item"><b>{jokerOddsTitle}</b></div>
          </div>
        </div>
        <div className="casino-cards text-center mt-1">
          {CARD_FACES.map((face, i) => {
            const item = byId[7 + i];
            const isSusp = !item || item.gstatus === 'SUSPENDED' || item.b === 0 || item.b === '0';
            return (
              <div key={face} className="casino-card-item">
                <div
                  className={`card-image${isSusp ? ' suspended' : ''}`}
                  onClick={isSusp ? undefined : () => onBet(item.sid, 'back', item.b, item)}
                >
                  <img src={`${CARD_FACE_BASE}${face}.png`} alt={face} />
                </div>
                <Book value={exposures?.[item?.nat]} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});

export default BetTableABJ;
