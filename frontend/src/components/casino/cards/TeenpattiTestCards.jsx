import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Teenpatti Test card layout — 3 hands: Tiger, Lion, Dragon.
 * Cards are dealt round-robin:
 * Tiger:  indices 0, 3, 6
 * Lion:   indices 1, 4, 7
 * Dragon: indices 2, 5, 8
 */
const TeenpattiTestCards = memo(function TeenpattiTestCards({ cardString = '' }) {
  const codes = parseCards(cardString);

  const tiger  = [codes[0] || '1', codes[3] || '1', codes[6] || '1'];
  const lion   = [codes[1] || '1', codes[4] || '1', codes[7] || '1'];
  const dragon = [codes[2] || '1', codes[5] || '1', codes[8] || '1'];

  return (
    <div className="casino-video-cards-container">
      <div>
        <div className="dealer-name w-100 mb-1">Tiger</div>
        <div>
          {tiger.map((code, i) => (
            <span key={i}><img src={cardSrc(code)} alt={code} /></span>
          ))}
        </div>
      </div>
      <div>
        <div className="dealer-name w-100 mb-1">Lion</div>
        <div>
          {lion.map((code, i) => (
            <span key={i}><img src={cardSrc(code)} alt={code} /></span>
          ))}
        </div>
      </div>
      <div>
        <div className="dealer-name w-100 mb-1">Dragon</div>
        <div>
          {dragon.map((code, i) => (
            <span key={i}><img src={cardSrc(code)} alt={code} /></span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default TeenpattiTestCards;
