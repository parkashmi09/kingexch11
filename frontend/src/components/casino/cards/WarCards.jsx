import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Casino War card layout — shows the dealer card (7th/last card).
 * Card string: "P1,P2,P3,P4,P5,P6,Dealer"
 * Video overlay displays only the dealer card (index 6).
 */
const WarCards = memo(function WarCards({ cardString = '' }) {
  const codes = parseCards(cardString);
  const dealerCard = codes[6];

  return (
    <div className="casino-video-cards-container">
      <div>
        {dealerCard && <span><img src={cardSrc(dealerCard)} alt={dealerCard} /></span>}
      </div>
    </div>
  );
});

export default WarCards;
