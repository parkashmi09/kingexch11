import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Worli Matka card layout — 3 cards in a single row.
 * All 3 cards inside one container div.
 */
const WorliCards = memo(function WorliCards({ cardString = '' }) {
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

export default WorliCards;
