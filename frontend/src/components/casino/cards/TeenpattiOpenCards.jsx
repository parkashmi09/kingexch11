import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Teenpatti Open card layout — single "Dealer" hand with 3 cards.
 * 27 cards dealt 9-way round-robin (8 players + dealer):
 *   Round 1: P1[0], P2[1], ..., P8[7], Dealer[8]
 *   Round 2: P1[9], P2[10], ..., P8[16], Dealer[17]
 *   Round 3: P1[18], P2[19], ..., P8[25], Dealer[26]
 */
const TeenpattiOpenCards = memo(function TeenpattiOpenCards({ cardString = '' }) {
  const codes = parseCards(cardString);

  const dealer = [codes[8] || '1', codes[17] || '1', codes[26] || '1'];

  return (
    <div className="casino-video-cards-container">
      <div className="dealer-name">Dealer</div>
      <div>
        {dealer.map((code, i) => (
          <span key={i}><img src={cardSrc(code)} alt={code} /></span>
        ))}
      </div>
    </div>
  );
});

export default TeenpattiOpenCards;
