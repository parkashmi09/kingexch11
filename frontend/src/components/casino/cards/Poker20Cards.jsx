import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Poker20 card layout — Player A (2 cards), Player B (2 cards), Board (5 cards)
 * Card string indices: Player A[0,1], Player B[2,3], Board[4,5,6,7,8]
 */
const Poker20Cards = memo(function Poker20Cards({ cardString = '' }) {
  const codes = parseCards(cardString);

  const playerA = [codes[0] || '1', codes[1] || '1'];
  const playerB = [codes[2] || '1', codes[3] || '1'];
  const board = [
    codes[4] || '1',
    codes[5] || '1',
    codes[6] || '1',
    codes[7] || '1',
    codes[8] || '1',
  ];

  return (
    <div className="casino-video-cards-container">
      <div className="playeracards">
        <div className="dealer-name w-100 mb-1">Player A</div>
        <div className="d-flex">
          {playerA.map((code, i) => (
            <span key={i}><img src={cardSrc(code)} alt={code} /></span>
          ))}
        </div>
      </div>
      <div className="playerbcards">
        <div className="dealer-name w-100 mb-1">Player B</div>
        <div className="d-flex">
          {playerB.map((code, i) => (
            <span key={i}><img src={cardSrc(code)} alt={code} /></span>
          ))}
        </div>
      </div>
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

export default Poker20Cards;
