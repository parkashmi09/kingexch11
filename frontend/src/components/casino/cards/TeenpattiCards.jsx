import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Teenpatti card layout — 2 players, 3 cards each.
 * Player A: indices 0, 2, 4
 * Player B: indices 1, 3, 5
 *
 * Used by: teen62, teen, teen20, teen20c, teen41, teen42, teen33, teen32, teen8, teen9, teen120
 */
const TeenpattiCards = memo(function TeenpattiCards({ cardString = '' }) {
  const codes = parseCards(cardString);
  // Always show 3 cards per player; face-down ('1') for undealt slots
  const playerA = [codes[0] || '1', codes[2] || '1', codes[4] || '1'];
  const playerB = [codes[1] || '1', codes[3] || '1', codes[5] || '1'];

  return (
    <div className="casino-video-cards-container">
      <div>
        {playerA.map((code, i) => (
          <span key={i}><img src={cardSrc(code)} alt={code} /></span>
        ))}
      </div>
      <div>
        {playerB.map((code, i) => (
          <span key={i}><img src={cardSrc(code)} alt={code} /></span>
        ))}
      </div>
    </div>
  );
});

export default TeenpattiCards;
