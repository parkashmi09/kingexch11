import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

const Teen1Cards = memo(function Teen1Cards({ cardString = '' }) {
  const codes = parseCards(cardString);

  return (
    <div className="casino-video-cards-container">
      <div>
        <div className="dealer-name w-100 mb-1">Player</div>
        <div>
          <span><span><img src={cardSrc(codes[0])} alt={codes[0] || ''} /></span></span>
        </div>
      </div>
      <div>
        <div className="dealer-name w-100 mb-1">Dealer</div>
        <div>
          <span><span><img src={cardSrc(codes[1])} alt={codes[1] || ''} /></span></span>
        </div>
      </div>
    </div>
  );
});

export default Teen1Cards;
