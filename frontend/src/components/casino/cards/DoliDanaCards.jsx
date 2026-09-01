import { memo } from 'react';
import { parseCards } from './cardUtils';

const DoliDanaCards = memo(function DoliDanaCards({ cardString }) {
  const codes = parseCards(cardString || '');
  const dice = codes.slice(0, 2).map((code) => {
    if (code === '1' || code === '0') return null;
    const num = parseInt(code, 10);
    if (num >= 1 && num <= 6) return num;
    return null;
  });

  return (
    <div className="casino-video-cards-container">
      <div>
        <span>
          {dice.map((val, i) => (
            val ? <img key={i} src={`/assets/front/img/dolidana/dice${val}.png`} alt={`Dice ${val}`} /> : null
          ))}
        </span>
      </div>
    </div>
  );
});

export default DoliDanaCards;
