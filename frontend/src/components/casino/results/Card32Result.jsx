import { cardSrc } from './resultParsers';

const PLAYERS = ['Player 8', 'Player 9', 'Player 10', 'Player 11'];

function cardValue(code) {
  if (!code || code === '1' || code === '0') return 0;
  const val = code.replace(/(CC|DD|HH|SS)$/i, '');
  if (val === 'A') return 1;
  if (val === 'J' || val === 'Q' || val === 'K') return 10;
  return parseInt(val) || 0;
}

export default function Card32Result({ detail }) {
  const allCards = (detail?.card || '').split(',').map((s) => s.trim()).filter(Boolean);

  // Cards: indices 0-3 = round 1 (one per player), indices 4-7 = round 2
  const playerCards = PLAYERS.map((_, i) => {
    const c1 = allCards[i];
    const c2 = allCards[i + 4];
    const cards = [];
    if (c1 && c1 !== '1' && c1 !== '0') cards.push(c1);
    if (c2 && c2 !== '1' && c2 !== '0') cards.push(c2);
    return cards;
  });

  const scores = playerCards.map((cards) =>
    cards.reduce((sum, c) => sum + cardValue(c), 0)
  );

  // Derive winner from detail
  const winValue = detail?.win;
  const winnat = detail?.winnat || '';
  const winnerIdx = winnat
    ? PLAYERS.findIndex((p) => winnat.includes(p))
    : winValue ? Number(winValue) - 1 : -1;

  return (
    <div className="row row5 card32result">
      <div className="col-12 col-lg-9">
        <div className="row row5">
          {PLAYERS.map((name, i) => {
            const isWinner = i === winnerIdx;
            return (
              <div key={i} className="col-12 col-lg-3">
                <div className="casino-result-cards">
                  {isWinner && (
                    <div className="casino-result-cards-item">
                      <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                    </div>
                  )}
                  <div className="d-inline-block">
                    <h5>
                      {name} - <span className="text-playerb">{scores[i]}</span>
                    </h5>
                    {playerCards[i].map((code, j) => (
                      <div key={j} className="casino-result-cards-item">
                        <img src={cardSrc(code)} alt={code} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="col-12 col-lg-3">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winnat || (winnerIdx >= 0 ? PLAYERS[winnerIdx] : '')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
