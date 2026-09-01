import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Andar Bahar / Amar Akbar Anthony — 3 players, 1 card each.
 * Player A: index 0
 * Player B: index 1
 * Player C: index 2
 *
 * Used by: ab, a2, aaa
 */
const AndarBaharCards = memo(function AndarBaharCards({ cardString = '' }) {
  const codes = parseCards(cardString);

  return (
    <div className="casino-video-cards-container">
      <div>
        {codes[0] && <span><img src={cardSrc(codes[0])} alt={codes[0]} /></span>}
      </div>
      <div>
        {codes[1] && <span><img src={cardSrc(codes[1])} alt={codes[1]} /></span>}
      </div>
      <div>
        {codes[2] && <span><img src={cardSrc(codes[2])} alt={codes[2]} /></span>}
      </div>
    </div>
  );
});

export default AndarBaharCards;
