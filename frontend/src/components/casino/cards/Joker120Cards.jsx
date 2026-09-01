import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Unlimited Joker 20-20 (joker120) card layout — 2 players, 3 cards each.
 * Unlike joker20 there is NO leading joker card: the string is 6 values,
 * interleaved from index 0 — A1, B1, A2, B2, A3, B3.
 */
const Joker120Cards = memo(function Joker120Cards({ cardString = '' }) {
  const codes = parseCards(cardString);
  // Cards are interleaved from index 0: A1, B1, A2, B2, A3, B3
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

export default Joker120Cards;
