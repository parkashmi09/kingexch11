import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Lucky 7 card layout — single card.
 * Card: index 0
 *
 * Used by: lucky7, lucky7eu
 */
const Lucky7Cards = memo(function Lucky7Cards({ cardString = '' }) {
  const codes = parseCards(cardString);

  return (
    <div className="casino-video-cards-container">
      <div>
        {codes[0] && <span><img src={cardSrc(codes[0])} alt={codes[0]} /></span>}
      </div>
    </div>
  );
});

export default Lucky7Cards;
