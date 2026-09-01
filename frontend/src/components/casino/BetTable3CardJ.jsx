import { memo, useState, useMemo } from 'react';

const CARD_FACE_BASE = '/assets/front/img/cards/';
const CARD_FACES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const ITEMS_TO_SHOW = 10;

function slideClass(i) {
  if (i === 0) return 'hooper-slide is-active is-current';
  if (i < ITEMS_TO_SHOW) return 'hooper-slide is-active';
  if (i < ITEMS_TO_SHOW + 3) return 'hooper-slide is-next';
  return 'hooper-slide';
}

/** Mobile card carousel */
const MobileCardCarousel = memo(function MobileCardCarousel({ onCardClick, selectedCards = [] }) {
  const [scrollIdx, setScrollIdx] = useState(0);
  const maxIdx = Math.max(0, CARD_FACES.length - ITEMS_TO_SHOW);
  const slidePercent = 100 / ITEMS_TO_SHOW;
  const translatePercent = -(scrollIdx * slidePercent);

  return (
    <div className="lastCards-container threeCardJ mt-1">
      <section tabIndex="0" className="lastCards hooper">
        <div className="hooper-list">
          <ul
            className="hooper-track"
            style={{ transform: `translateX(${translatePercent}%)`, display: 'flex', transition: 'transform 0.3s ease', padding: 0, margin: 0, listStyle: 'none' }}
          >
            {CARD_FACES.map((face, i) => (
              <li key={face} className={slideClass(i)} aria-hidden={i >= ITEMS_TO_SHOW ? true : undefined} style={{ width: `${slidePercent}%`, flexShrink: 0 }}>
                <div className={selectedCards.includes(face) ? 'selected' : ''} onClick={() => onCardClick(face)}>
                  <img src={`${CARD_FACE_BASE}${face}.png`} alt={face} />
                </div>
              </li>
            ))}
          </ul>
          <div className="hooper-navigation">
            <button type="button" className={`hooper-prev${scrollIdx <= 0 ? ' is-disabled' : ''}`} onClick={() => setScrollIdx((p) => Math.max(0, p - ITEMS_TO_SHOW))}>
              <svg className="icon icon-arrowLeft" viewBox="0 0 24 24" width="24px" height="24px"><title>Arrow Left</title><path d="M0 0h24v24H0z" fill="none" /><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" /></svg>
            </button>
            <button type="button" className={`hooper-next${scrollIdx >= maxIdx ? ' is-disabled' : ''}`} onClick={() => setScrollIdx((p) => Math.min(maxIdx, p + ITEMS_TO_SHOW))}>
              <svg className="icon icon-arrowRight" viewBox="0 0 24 24" width="24px" height="24px"><title>Arrow Right</title><path d="M0 0h24v24H0z" fill="none" /><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg>
            </button>
          </div>
          <div aria-live="polite" aria-atomic="true" className="hooper-liveregion hooper-sr-only">
            Item 1 of {CARD_FACES.length}
          </div>
        </div>
      </section>
    </div>
  );
});

// Worst-case exposure figure shown in front of Yes / No.
function ExposureFig({ value }) {
  const v = Number(value) || 0;
  if (v === 0) return <span className="d-block ml-2 d-none">0</span>;
  return (
    <span className="ml-2" style={{ color: v < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)', fontSize: '11px', fontWeight: 'bold' }}>
      {v < 0 ? Math.round(v) : `+${Math.round(v)}`}
    </span>
  );
}

const BetTable3CardJ = memo(function BetTable3CardJ({ gameData, onCardSelect, pick, yesExposure, noExposure }) {
  const sub = gameData?.sub ?? [];
  const remark = gameData?.remark || '';
  const remarks = remark.split('|');

  const byId = useMemo(() => {
    const m = {};
    sub.forEach((s) => { m[s.sid] = s; });
    return m;
  }, [sub]);

  const yesItem = byId[1];
  const noItem = byId[2];

  function isSusp(item) {
    return !item || item.gstatus === 'SUSPENDED' || item.b === 0 || item.b === '0';
  }

  // Whether a card is currently picked on the given side.
  const isPicked = (side, face) => pick?.side === side && (pick?.cards || []).includes(face);
  const select = (face, side) => { if (onCardSelect) onCardSelect(face, side); };

  return (
    <>
      {/* Desktop layout */}
      <div className="threecardj-container d-none-small">
        {/* Yes box */}
        <div className="threecardj-bl-box back">
          <div className="threecardj-title">
            <b>Yes</b>
            <ExposureFig value={yesExposure} />
          </div>
          <div className="threecardj-cards">
            <div className="threecardj-odds text-center"><b>{yesItem?.b || 0}</b></div>
            <div className={`casino-cards text-center mt-1${isSusp(yesItem) ? ' suspended' : ''}`}>
              {CARD_FACES.map((face) => (
                <div key={face} className={`casino-card-item${isPicked('Yes', face) ? ' selected' : ''}`} onClick={() => select(face, 'Yes')}>
                  <div className="card-image">
                    <img src={`${CARD_FACE_BASE}${face}.png`} alt={face} />
                  </div>
                </div>
              ))}
            </div>
            <div className="casino-min-max text-right">
              <marquee>{remarks[0] || 'Select any 3 card and you will win if you will get at least 1 card from the 3 cards you have selected.'}</marquee>
            </div>
          </div>
        </div>
        {/* No box */}
        <div className="threecardj-bl-box lay">
          <div className="threecardj-title">
            <b>No</b>
            <ExposureFig value={noExposure} />
          </div>
          <div className="threecardj-cards">
            <div className="threecardj-odds text-center"><b>{noItem?.b || 0}</b></div>
            <div className={`casino-cards text-center mt-1${isSusp(noItem) ? ' suspended' : ''}`}>
              {CARD_FACES.map((face) => (
                <div key={face} className={`casino-card-item${isPicked('No', face) ? ' selected' : ''}`} onClick={() => select(face, 'No')}>
                  <div className="card-image">
                    <img src={`${CARD_FACE_BASE}${face}.png`} alt={face} />
                  </div>
                </div>
              ))}
            </div>
            <div className="casino-min-max text-right">
              <marquee>{remarks[1] || 'Select any 3 card and you will win If you do not get any card from the 3 cards you have selected.'}</marquee>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="threecardj-container d-none-big">
        {/* Yes box */}
        <div className="threecardj-bl-box back">
          <div className="threecardj-title">
            <span><b>Yes</b> <b className="ml-2">{yesItem?.b || 0}</b></span>
            <ExposureFig value={yesExposure} />
          </div>
          <div className="threecardj-cards">
            <div>
              <MobileCardCarousel
                onCardClick={(face) => select(face, 'Yes')}
                selectedCards={pick?.side === 'Yes' ? pick?.cards : []}
              />
            </div>
            <div className="casino-min-max text-right">
              <marquee>{remarks[0] || 'Select any 3 card and you will win if you will get at least 1 card from the 3 cards you have selected.'}</marquee>
            </div>
          </div>
        </div>
        {/* No box */}
        <div className="threecardj-bl-box lay">
          <div className="threecardj-title">
            <span><b>No</b> <b className="ml-2">{noItem?.b || 0}</b></span>
            <ExposureFig value={noExposure} />
          </div>
          <div className="threecardj-cards">
            <div>
              <MobileCardCarousel
                onCardClick={(face) => select(face, 'No')}
                selectedCards={pick?.side === 'No' ? pick?.cards : []}
              />
            </div>
            <div className="casino-min-max text-right">
              <marquee>{remarks[1] || 'Select any 3 card and you will win If you do not get any card from the 3 cards you have selected.'}</marquee>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default BetTable3CardJ;
