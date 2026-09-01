import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

const PoisonCards = memo(function PoisonCards({ cardString = '' }) {
  const codes = parseCards(cardString);

  const poisonCard = codes[0] || '1';
  // Cards are interleaved: A1, B1, A2, B2, A3, B3
  const playerA = [codes[1] || '1', codes[3] || '1', codes[5] || '1'];
  const playerB = [codes[2] || '1', codes[4] || '1', codes[6] || '1'];

  return (
    <div className="casino-video-cards-container">
      <div className="joker-card">
        <h4 className="text-playerb">Poison</h4>
        <span><img src={cardSrc(poisonCard)} alt={poisonCard} /></span>
      </div>
      <div className="mt-2">
        {playerA.map((c, i) => (
          <span key={i}><img src={cardSrc(c)} alt={c} /></span>
        ))}
      </div>
      <div>
        {playerB.map((c, i) => (
          <span key={i}><img src={cardSrc(c)} alt={c} /></span>
        ))}
      </div>
    </div>
  );
});

export default PoisonCards;
