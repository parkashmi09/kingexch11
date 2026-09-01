import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Trio card layout — 3 cards in a single row.
 * Indices 0, 1, 2
 *
 * Used by: trio
 */
const TrioCards = memo(function TrioCards({ cardString = '' }) {
  const codes = parseCards(cardString);
  const cards = [codes[0] || '1', codes[1] || '1', codes[2] || '1'];

  return (
    <div className="casino-video-cards-container">
      <div>
        {cards.map((code, i) => (
          <span key={i}><img src={cardSrc(code)} alt={code} /></span>
        ))}
      </div>
    </div>
  );
});

export default TrioCards;
