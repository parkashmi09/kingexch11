import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Dragon Tiger Lion card layout — 1 card each for Dragon, Tiger, Lion.
 * Dragon: index 0
 * Tiger:  index 1
 * Lion:   index 2
 *
 * Used by: dtl20
 */
const DragonTigerLionCards = memo(function DragonTigerLionCards({ cardString = '' }) {
  const codes = parseCards(cardString);

  return (
    <div className="casino-video-cards-container">
      <div>
        {codes[0] && <span><img src={cardSrc(codes[0])} alt={codes[0]} /></span>}
        {codes[1] && <span><img src={cardSrc(codes[1])} alt={codes[1]} /></span>}
        {codes[2] && <span><img src={cardSrc(codes[2])} alt={codes[2]} /></span>}
      </div>
    </div>
  );
});

export default DragonTigerLionCards;
