import { memo, useMemo } from 'react';
import { cardSrc } from '../results/resultParsers';

const SUITS = [
  { suffix: 'SS', icon: '/assets/front/img/cards/spade.png',   king: '/assets/front/img/cards/KSS.png' },
  { suffix: 'HH', icon: '/assets/front/img/cards/heart.png',   king: '/assets/front/img/cards/KHH.png' },
  { suffix: 'CC', icon: '/assets/front/img/cards/club.png',     king: '/assets/front/img/cards/KCC.png' },
  { suffix: 'DD', icon: '/assets/front/img/cards/diamond.png', king: '/assets/front/img/cards/KDD.png' },
];

const Race20Cards = memo(function Race20Cards({ cardString = '' }) {
  const groups = useMemo(() => {
    const all = cardString.split(',').map((c) => c.trim()).filter((c) => c && c !== '1' && c !== '0');
    const g = { SS: [], HH: [], CC: [], DD: [] };
    for (const c of all) {
      const upper = c.toUpperCase();
      if (upper.endsWith('SS')) g.SS.push(c);
      else if (upper.endsWith('HH')) g.HH.push(c);
      else if (upper.endsWith('CC')) g.CC.push(c);
      else if (upper.endsWith('DD')) g.DD.push(c);
    }
    return g;
  }, [cardString]);

  return (
    <div className="casino-video-cards-container">
      {SUITS.map((suit) => {
        const dealt = groups[suit.suffix] || [];
        const nonKing = dealt.filter((c) => !c.toUpperCase().startsWith('K'));
        const hasKing = dealt.some((c) => c.toUpperCase().startsWith('K'));
        return (
          <div key={suit.suffix}>
            <span><img src={suit.icon} alt={suit.suffix} /></span>
            {nonKing.map((c, i) => (
              <span key={i}><img src={cardSrc(c)} alt={c} /></span>
            ))}
            {hasKing && (
              <>
                {' '}
                <span><img src={suit.king} alt={`K${suit.suffix}`} /></span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default Race20Cards;
