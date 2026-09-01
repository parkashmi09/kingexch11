import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Meter card layout — 2 cards side by side.
 * Card string format: "3DD,1" → [Fighter A card, Fighter B card]
 *
 * Used by: cmeter1
 */
const MeterCards = memo(function MeterCards({ cardString = '' }) {
  const codes = parseCards(cardString);

  return (
    <div className="casino-video-cards-container">
      <div>
        <span><img src={cardSrc(codes[0])} alt={codes[0] || ''} /></span>
        <span><img src={cardSrc(codes[1])} alt={codes[1] || ''} /></span>
      </div>
    </div>
  );
});

export default MeterCards;
