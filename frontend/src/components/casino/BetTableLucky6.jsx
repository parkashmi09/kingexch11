import { memo } from 'react';
import { parseCards } from './cards/cardUtils';

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0' || !item.b || item.b === 0;
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

// Display labels for card images
const CARD_DISPLAY = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J'];
// API nat values: Card 1, Card 2, ... Card 10, Card J
const CARD_API_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J'];

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

const BetTableLucky6 = memo(function BetTableLucky6({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const cardString = gameData?.card ?? '';
  const handleBet = onBet || (() => {});

  const lowItem  = findByNat(sub, 'Low Card');
  const highItem = findByNat(sub, 'High Card');
  const evenItem = findByNat(sub, 'Even');
  const oddItem  = findByNat(sub, 'Odd');
  const blackItem = findByNat(sub, 'Black') || findByNat(sub, 'Spade & Club') || findByNat(sub, 'Black Suits');
  const redItem   = findByNat(sub, 'Red') || findByNat(sub, 'Heart & Diamond') || findByNat(sub, 'Red Suits');

  const cardItems = CARD_API_KEYS.map((key) =>
    findByNat(sub, `Card ${key}`)
  );

  const cardsOdds = cardItems[0]?.b || 0;

  const codes = parseCards(cardString);
  const currentCardCode = codes[0] || null;
  const currentCardSrc = currentCardCode && currentCardCode !== '1' && currentCardCode !== '0'
    ? `/assets/front/img/cards/${currentCardCode}.png`
    : null;

  return (
    <>
      <div className="casino-box low-high-box">
        <div className={`low-odds${suspCls(lowItem)}`} onClick={isSusp(lowItem) ? undefined : () => handleBet(lowItem?.sid, 'back', lowItem?.b, lowItem)}>
          <div className="casino-odds">{lowItem?.b || 0}</div>
          <div className="text-center casino-buttons"><span>Low Card</span></div>
          <CasinoBook value={exposures?.['Low Card']} />
        </div>
        <div className="text-center lucky7-card">
          {currentCardSrc
            ? <img src={currentCardSrc} className="img-fluid" alt="card" />
            : <img src="/assets/front/img/cards/6.png" className="img-fluid" alt="card" />
          }
        </div>
        <div className={`high-odds${suspCls(highItem)}`} onClick={isSusp(highItem) ? undefined : () => handleBet(highItem?.sid, 'back', highItem?.b, highItem)}>
          <div className="casino-odds">{highItem?.b || 0}</div>
          <div className="text-center casino-buttons"><span>High Card</span></div>
          <CasinoBook value={exposures?.['High Card']} />
        </div>
      </div>

      <div className="casino-box sidebets-box">
        <div className="lucky7-extra-bets">
          <div className="lucky7-extra-bets-item-container">
            <div className={`lucky7-extra-bets-item${suspCls(evenItem)}`} onClick={isSusp(evenItem) ? undefined : () => handleBet(evenItem?.sid, 'back', evenItem?.b, evenItem)}>
              <div className="casino-odds">{evenItem?.b || 0}</div>
              <div className="casino-buttons">Even</div>
              <CasinoBook value={exposures?.['Even']} />
            </div>
          </div>
          <div className="lucky7-extra-bets-item-container">
            <div className={`lucky7-extra-bets-item${suspCls(oddItem)}`} onClick={isSusp(oddItem) ? undefined : () => handleBet(oddItem?.sid, 'back', oddItem?.b, oddItem)}>
              <div className="casino-odds">{oddItem?.b || 0}</div>
              <div className="casino-buttons">Odd</div>
              <CasinoBook value={exposures?.['Odd']} />
            </div>
          </div>
          <div className="lucky7-extra-bets-item-container">
            <div className={`lucky7-extra-bets-item${suspCls(blackItem)}`} onClick={isSusp(blackItem) ? undefined : () => handleBet(blackItem?.sid, 'back', blackItem?.b, blackItem)}>
              <div className="casino-odds">{blackItem?.b || 0}</div>
              <div className="casino-buttons">
                <img src="/assets/front/img/cards/spade.png" alt="spade" />
                <img src="/assets/front/img/cards/club.png" alt="club" />
              </div>
              <CasinoBook value={exposures?.['Black']} />
            </div>
          </div>
          <div className="lucky7-extra-bets-item-container">
            <div className={`lucky7-extra-bets-item${suspCls(redItem)}`} onClick={isSusp(redItem) ? undefined : () => handleBet(redItem?.sid, 'back', redItem?.b, redItem)}>
              <div className="casino-odds">{redItem?.b || 0}</div>
              <div className="casino-buttons">
                <img src="/assets/front/img/cards/heart.png" alt="heart" />
                <img src="/assets/front/img/cards/diamond.png" alt="diamond" />
              </div>
              <CasinoBook value={exposures?.['Red']} />
            </div>
          </div>
        </div>
      </div>

      <div className="casino-box cards-box">
        <div className="w-100">
          <div className="casino-odds">{cardsOdds}</div>
          <div className="casino-cards text-center mt-1">
            {CARD_DISPLAY.map((display, i) => {
              const item = cardItems[i];
              const apiKey = CARD_API_KEYS[i];
              return (
                <div
                  key={display}
                  className="casino-card-item"
                  onClick={isSusp(item) ? undefined : () => handleBet(item?.sid, 'back', item?.b, item)}
                >
                  <div className={`card-image${suspCls(item)}`}>
                    <img src={`/assets/front/img/cards/${display}.png`} alt={display} />
                  </div>
                  <CasinoBook value={exposures?.[`Card ${apiKey}`]} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
});

export default BetTableLucky6;
