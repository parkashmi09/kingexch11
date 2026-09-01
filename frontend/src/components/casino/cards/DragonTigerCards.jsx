import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Dragon Tiger card layout — 1 card each side.
 * Dragon: index 0
 * Tiger:  index 1
 *
 * Used by: dt6, dt20, dragon, dragon6, dragonlion
 */
const DragonTigerCards = memo(function DragonTigerCards({ cardString = '' }) {
  const codes = parseCards(cardString);

  return (
    <div className="casino-video-cards-container">
      <div>
        {codes[0] && <span><img src={cardSrc(codes[0])} alt={codes[0]} /></span>}
        {codes[1] && <span><img src={cardSrc(codes[1])} alt={codes[1]} /></span>}
      </div>
    </div>
  );
});

export default DragonTigerCards;
