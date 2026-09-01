import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * Returns the Race-to-17 point value of a card code.
 * A=1, 2-9=face value, 10/J/Q/K=0
 */
function cardValue(code) {
  if (!code || code === '1' || code === '0') return 0;
  const rank = code.replace(/(CC|DD|HH|SS)$/i, '');
  if (rank === 'A') return 1;
  const n = Number(rank);
  if (!isNaN(n) && n >= 2 && n <= 9) return n;
  return 0;
}

const Race17Cards = memo(function Race17Cards({ cardString = '' }) {
  const codes = parseCards(cardString);

  const total = codes.reduce((sum, c) => {
    if (c === '1' || c === '0') return sum;
    return sum + cardValue(c);
  }, 0);

  const slots = Array.from({ length: 5 }, (_, i) => codes[i] || '1');

  return (
    <div className="casino-video-cards-container">
      <div className="race-total">Total: {total}</div>
      {slots.map((code, i) => (
        <div key={i}>
          <span>
            <img src={cardSrc(code)} alt={code} />
          </span>
        </div>
      ))}
    </div>
  );
});

export default Race17Cards;
