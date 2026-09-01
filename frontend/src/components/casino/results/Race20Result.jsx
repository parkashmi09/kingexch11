import { cardSrc } from './resultParsers';

const SUITS = [
  { key: '1', label: 'Spade',   icon: '/assets/front/img/cards/spade.png',   king: 'KSS', suffix: 'SS' },
  { key: '2', label: 'Heart',   icon: '/assets/front/img/cards/heart.png',   king: 'KHH', suffix: 'HH' },
  { key: '3', label: 'Club',    icon: '/assets/front/img/cards/club.png',    king: 'KCC', suffix: 'CC' },
  { key: '4', label: 'Diamond', icon: '/assets/front/img/cards/diamond.png', king: 'KDD', suffix: 'DD' },
];

function parseSuitCards(cardString) {
  if (!cardString) return { SS: [], HH: [], CC: [], DD: [] };
  const all = cardString.split(',').map((c) => c.trim()).filter((c) => c && c !== '1');
  const groups = { SS: [], HH: [], CC: [], DD: [] };
  for (const c of all) {
    if (c.endsWith('SS')) groups.SS.push(c);
    else if (c.endsWith('HH')) groups.HH.push(c);
    else if (c.endsWith('CC')) groups.CC.push(c);
    else if (c.endsWith('DD')) groups.DD.push(c);
  }
  return groups;
}

export default function Race20Result({ detail }) {
  const win = String(detail?.win ?? '');
  const cards = parseSuitCards(detail?.card);
  const parts = (detail?.rdesc || '').split('#');
  const winner = parts[0] || detail?.winnat || '';
  const points = parts[1] || '';
  const totalCards = parts[2] || '';

  return (
    <div className="row row5">
      <div className="col-12 col-lg-9">
        <div className="race-result-box">
          {SUITS.map((suit) => {
            const isWinner = win === suit.key;
            const suitCards = cards[suit.suffix] || [];
            const nonKing = suitCards.filter((c) => !c.startsWith('K'));

            return (
              <div key={suit.key} className="pr mb-1">
                <span className="result-image">
                  <img src={suit.icon} alt={suit.label} />
                </span>
                {nonKing.map((c, i) => (
                  <span key={i} className="result-image">
                    <img src={cardSrc(c)} alt={c} />
                  </span>
                ))}
                {(nonKing.length > 0 || isWinner) && (
                  <>
                    {' '}
                    <span className="result-image k-image">
                      <img src={cardSrc(suit.king)} alt={suit.king} />
                    </span>
                  </>
                )}
                {isWinner && (
                  <div className="casino-result-cards-item">
                    <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                  </div>
                )}
              </div>
            );
          })}
          <div className="video-winner-text">
            {'WINNER'.split('').map((ch, i) => (
              <div key={i}>{ch}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-3">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winner || `K ${SUITS.find((s) => s.key === win)?.label || ''}`}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Points</div>
            <div>{points}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Cards</div>
            <div>{totalCards}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
