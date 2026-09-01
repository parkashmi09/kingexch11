import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

const PLAYERS = ['Player A', 'Player B', 'Player C', 'Player D'];

const Race2Cards = memo(function Race2Cards({ cardString = '' }) {
  const codes = parseCards(cardString);

  return (
    <div className="casino-video-cards-container">
      {PLAYERS.map((name, i) => (
        <div key={i}>
          <div className="dealer-name w-100 mb-1"><span>{name}</span></div>
          <div>
            {codes[i] && codes[i] !== '1' && codes[i] !== '0' && (
              <span><img src={cardSrc(codes[i])} alt={codes[i]} /></span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export default Race2Cards;
