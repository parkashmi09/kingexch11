import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Poker 6 Players card layout — only the 5 board cards shown in the video box.
 * Cards are dealt round-robin, so the 12 hole cards are Player N = [N-1, N-1+6];
 * the board is dealt after them at indices 12-16 (unaffected by the hole order).
 */
const Poker6Cards = memo(function Poker6Cards({ cardString = '' }) {
  const codes = parseCards(cardString);
  const board = [
    codes[12] || '1',
    codes[13] || '1',
    codes[14] || '1',
    codes[15] || '1',
    codes[16] || '1',
  ];

  return (
    <div className="casino-video-cards-container">
      <div>
        {board.map((code, i) => (
          <span key={i}><img src={cardSrc(code)} alt={code} /></span>
        ))}
      </div>
    </div>
  );
});

export default Poker6Cards;
