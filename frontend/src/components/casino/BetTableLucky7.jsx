import { memo, useMemo } from 'react';

const CARD_FACE_BASE = '/assets/front/img/cards/';
const CARD_FACES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const LINE_GROUPS = [
  { faces: ['A', '2', '3'], sid: 20 },
  { faces: ['4', '5', '6'], sid: 21 },
  { faces: ['8', '9', '10'], sid: 22 },
  { faces: ['J', 'Q', 'K'], sid: 23 },
];

function ExposureSpan({ value }) {
  if (!value || value === 0) return null;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className="casino-box-expo" style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
      {value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
    </span>
  );
}

function CasinoBook({ value }) {
  if (!value || value === 0) return <div className="casino-book d-none">0</div>;
  const cls = value < 0 ? 'book-red' : 'book-green';
  return <div className={`casino-book ${cls}`}>{value.toFixed(2)}</div>;
}

const BetTableLucky7 = memo(function BetTableLucky7({ gameData, onBet, exposures }) {
  const sub = gameData?.sub ?? [];

  const byId = useMemo(() => {
    const m = {};
    sub.forEach((s) => { m[s.sid] = s; });
    return m;
  }, [sub]);

  const lowItem = byId[1];
  const highItem = byId[2];
  const evenItem = byId[3];
  const oddItem = byId[4];
  const redItem = byId[5];
  const blackItem = byId[6];

  function isSusp(item) {
    return !item || item.gstatus === 'SUSPENDED' || item.b === 0 || item.b === '0';
  }

  function handleClick(item) {
    if (!isSusp(item) && onBet) onBet(item.sid, 'back', item.b, item);
  }

  // Individual card odds (all same, use first)
  const cardOdds = byId[7]?.b || 0;

  return (
    <>
      {/* Low / 7 card / High */}
      <div className="casino-box low-high-box">
        <div className={`low-odds${isSusp(lowItem) ? ' suspended' : ''}`} onClick={() => handleClick(lowItem)}>
          <div className="casino-odds">{lowItem?.b || 0}</div>
          <div className="text-center casino-buttons"><span>Low Card</span></div>
          <CasinoBook value={exposures?.[lowItem?.nat]} />
        </div>
        <div className="text-center lucky7-card">
          <img src={`${CARD_FACE_BASE}7.png`} className="img-fluid" alt="7" />
        </div>
        <div className={`high-odds${isSusp(highItem) ? ' suspended' : ''}`} onClick={() => handleClick(highItem)}>
          <div className="casino-odds">{highItem?.b || 0}</div>
          <div className="text-center casino-buttons"><span>High Card</span></div>
          <CasinoBook value={exposures?.[highItem?.nat]} />
        </div>
      </div>

      {/* Even / Odd / Black / Red */}
      <div className="casino-box sidebets-box">
        <div className="lucky7-extra-bets">
          <div className="lucky7-extra-bets-item-container">
            <div className={`lucky7-extra-bets-item${isSusp(evenItem) ? ' suspended' : ''}`} onClick={() => handleClick(evenItem)}>
              <div className="casino-odds">{evenItem?.b || 0}</div>
              <div className="casino-buttons">Even</div>
              <CasinoBook value={exposures?.[evenItem?.nat]} />
            </div>
          </div>
          <div className="lucky7-extra-bets-item-container">
            <div className={`lucky7-extra-bets-item${isSusp(oddItem) ? ' suspended' : ''}`} onClick={() => handleClick(oddItem)}>
              <div className="casino-odds">{oddItem?.b || 0}</div>
              <div className="casino-buttons">Odd</div>
              <CasinoBook value={exposures?.[oddItem?.nat]} />
            </div>
          </div>
          <div className="lucky7-extra-bets-item-container">
            <div className={`lucky7-extra-bets-item${isSusp(blackItem) ? ' suspended' : ''}`} onClick={() => handleClick(blackItem)}>
              <div className="casino-odds">{blackItem?.b || 0}</div>
              <div className="casino-buttons">
                <img src={`${CARD_FACE_BASE}spade.png`} alt="spade" />
                {' '}
                <img src={`${CARD_FACE_BASE}club.png`} alt="club" />
              </div>
              <CasinoBook value={exposures?.[blackItem?.nat]} />
            </div>
          </div>
          <div className="lucky7-extra-bets-item-container">
            <div className={`lucky7-extra-bets-item${isSusp(redItem) ? ' suspended' : ''}`} onClick={() => handleClick(redItem)}>
              <div className="casino-odds">{redItem?.b || 0}</div>
              <div className="casino-buttons">
                <img src={`${CARD_FACE_BASE}heart.png`} alt="heart" />
                {' '}
                <img src={`${CARD_FACE_BASE}diamond.png`} alt="diamond" />
              </div>
              <CasinoBook value={exposures?.[redItem?.nat]} />
            </div>
          </div>
        </div>
      </div>

      {/* Line groups (A-2-3, 4-5-6, 8-9-10, J-Q-K) */}
      <div className="casino-box cards-top">
        <div className="container-fluid container-fluid-5">
          <div className="row row5">
            {LINE_GROUPS.map((line) => {
              const item = byId[line.sid];
              const susp = isSusp(item);
              return (
                <div key={line.sid} className="col-6 col-md-3">
                  <div onClick={() => handleClick(item)}>
                    <div className="casino-odds">{item?.b || 0}</div>
                    <div className="casino-cards text-center mt-1">
                      <div className={`casino-box cards-top-box${susp ? ' suspended' : ''}`}>
                        {line.faces.map((face) => (
                          <div key={face} className="casino-card-item">
                            <div className="card-image">
                              <img src={`${CARD_FACE_BASE}${face}.png`} alt={face} />
                            </div>
                          </div>
                        ))}
                        <div className="w-100"><CasinoBook value={exposures?.[item?.nat]} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual 13 cards */}
      <div className="casino-box cards-box">
        <div className="w-100">
          <div className="casino-odds">{cardOdds}</div>
          <div className="casino-cards text-center mt-1">
            {CARD_FACES.map((face, i) => {
              const item = byId[7 + i];
              const susp = isSusp(item);
              return (
                <div key={face} className="casino-card-item" onClick={() => handleClick(item)}>
                  <div className={`card-image${susp ? ' suspended' : ''}`}>
                    <img src={`${CARD_FACE_BASE}${face}.png`} alt={face} />
                  </div>
                  <CasinoBook value={exposures?.[item?.nat]} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
});

export default BetTableLucky7;
