import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

const NoteNumCards = memo(function NoteNumCards({ cardString = '' }) {
  const codes = parseCards(cardString);

  return (
    <div className="casino-video-cards-container">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i}>
          <span><img src={cardSrc(codes[i])} alt={codes[i] || ''} /></span>
        </div>
      ))}
    </div>
  );
});

export default NoteNumCards;
