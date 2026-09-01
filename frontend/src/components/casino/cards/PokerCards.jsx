import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Poker card layout — Board (5 community cards) shown in video box.
 * Card string: Player A[0,1], Player B[2,3], Board[4,5,6,7,8]
 */
const PokerCards = memo(function PokerCards({ cardString = '' }) {
  const codes = parseCards(cardString);
  const board = [
    codes[4] || '1',
    codes[5] || '1',
    codes[6] || '1',
    codes[7] || '1',
    codes[8] || '1',
  ];

  return (
    <div className="casino-video-cards-container">
      <div className="playerboardcards">
        <div className="dealer-name w-100 mb-1">Board</div>
        <div className="d-flex">
          {board.map((code, i) => (
            <span key={i}><img src={cardSrc(code)} alt={code} /></span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default PokerCards;
