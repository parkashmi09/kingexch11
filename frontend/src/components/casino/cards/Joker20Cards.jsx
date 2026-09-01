import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Joker Teenpatti 20-20 card layout.
 * Card string has 7 values: index 0 = joker, 1-3 = Player A, 4-6 = Player B.
 * The joker card is rendered inside the cards container with its own joker-card div.
 */
const Joker20Cards = memo(function Joker20Cards({ cardString = '' }) {
  const codes = parseCards(cardString);
  const joker = codes[0] || '1';
  // Cards are interleaved: A1, B1, A2, B2, A3, B3
  const playerA = [codes[1] || '1', codes[3] || '1', codes[5] || '1'];
  const playerB = [codes[2] || '1', codes[4] || '1', codes[6] || '1'];

  return (
    <div className="casino-video-cards-container">
      <div className="joker-card">
        <h4 className="text-playerb">Joker</h4>
        <span><img src={cardSrc(joker)} alt="joker" /></span>
      </div>
      <div className="mt-2">
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

export default Joker20Cards;
