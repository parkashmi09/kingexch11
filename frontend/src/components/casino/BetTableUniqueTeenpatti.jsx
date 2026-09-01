import { memo, useState, useCallback, useEffect } from 'react';

const SEQUENCE_ICONS = [
  '/assets/front/img/sequence/s1-icon.png',
  '/assets/front/img/sequence/s2-icon.png',
  '/assets/front/img/sequence/s3-icon.png',
  '/assets/front/img/sequence/s4-icon.png',
  '/assets/front/img/sequence/s5-icon.png',
  '/assets/front/img/sequence/s6-icon.png',
];

const SELECTION_BALLS = [
  '/assets/front/img/sequence/s1.png',
  '/assets/front/img/sequence/s2.png',
  '/assets/front/img/sequence/s3.png',
  '/assets/front/img/sequence/s4.png',
  '/assets/front/img/sequence/s5.png',
  '/assets/front/img/sequence/s6.png',
];

const FACEDOWN_CARD = '/assets/front/img/sequence/1.jpg';
const LOST_CARD = '/assets/front/img/sequence/0.png';
const MAX_SELECTIONS = 3;

function isSusp(item) {
  return !item || item.gstatus === '0' || item.gstatus === 'SUSPENDED';
}

const BetTableUniqueTeenpatti = memo(function BetTableUniqueTeenpatti({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const cardString = gameData?.card ?? '';
  const cards = cardString ? cardString.split(',').map((c) => c.trim()) : [];
  const mainItem = sub[0];
  const susp = isSusp(mainItem);
  const handleBet = onBet || (() => {});

  const [selectedCards, setSelectedCards] = useState([]);

  // Reset selections when round changes
  const mid = gameData?.mid;
  useEffect(() => {
    setSelectedCards([]);
  }, [mid]);

  const openBetModal = useCallback((selections) => {
    if (!mainItem) return;
    // Build nat like "234" from selected indices (1-based)
    const nat = selections.map((i) => i + 1).sort((a, b) => a - b).join('');
    const betItem = {
      ...mainItem,
      nat,
      sid: mainItem.sid || mainItem.sr || 1,
    };
    handleBet(betItem.sid, 'back', betItem.b || 0, betItem);
  }, [mainItem, handleBet]);

  const toggleCard = useCallback((idx) => {
    setSelectedCards((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      }
      if (prev.length >= MAX_SELECTIONS) return prev;
      const next = [...prev, idx];
      return next;
    });
  }, [openBetModal]);

  const handleReset = useCallback(() => {
    setSelectedCards([]);
  }, []);

  return (
    <>
      <h4 className="unique-teen-title">
        Select any 3 cards of your choice and experience TeenPatti in a unique way.
        <i className="fas fa-hand-point-down ms-1"></i>
      </h4>

      <div className="unique-teen20-box">
        {SEQUENCE_ICONS.map((iconSrc, idx) => {
          const cardCode = cards[idx] || '1';
          const isRevealed = cardCode !== '1' && cardCode !== '0' && cardCode !== '';
          const isLost = cardCode === '0';
          const isFaceDown = !isRevealed && !isLost;
          const isSelected = selectedCards.includes(idx);
          const canSelect = !susp && isFaceDown && (isSelected || selectedCards.length < MAX_SELECTIONS);

          // When suspended + face-down → show 0.png (empty/waiting)
          // When open + face-down → show 1.jpg (clickable card back)
          // When revealed → show actual card
          // When lost (0) → show 0.png
          const showLost = isLost || (isFaceDown && susp);

          let cardImg;
          if (isRevealed) {
            cardImg = `/assets/front/img/cards/${cardCode}.png`;
          } else if (showLost) {
            cardImg = LOST_CARD;
          } else {
            cardImg = FACEDOWN_CARD;
          }

          return (
            <div
              key={idx}
              className="unique-teen20-card"
              onClick={canSelect ? () => toggleCard(idx) : undefined}
              style={canSelect ? { cursor: 'pointer' } : undefined}
            >
              <img src={iconSrc} alt="" />
              {showLost && <img src={LOST_CARD} className="" />}
              {!showLost && <img src={cardImg} className={isSelected ? 'select' : ''} />}
            </div>
          );
        })}
      </div>

      {/* Selection area — shows selected card balls + Reset/PlaceBet. Must show
          on ALL viewports: this game has no odds boxes, so the PlaceBet button
          is the only trigger for the bet panel (desktop right sidebar / mobile
          modal). It was previously d-xl-none, which hid it on desktop → no way
          to open the panel there. */}
      <div className="unique-teen20-place-balls">
        {selectedCards.length > 0 && (
          <>
            <div>
              {selectedCards.map((idx) => (
                <img key={idx} src={SELECTION_BALLS[idx]} alt={`s${idx + 1}`} />
              ))}
            </div>
            <div className="casino-place-bet-action-buttons">
              <button className="btn btn-reset" onClick={handleReset}>Reset</button>
              <button
                className="btn btn-primary"
                disabled={selectedCards.length !== MAX_SELECTIONS}
                onClick={() => openBetModal(selectedCards)}
              >
                PlaceBet
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
});

export default BetTableUniqueTeenpatti;
