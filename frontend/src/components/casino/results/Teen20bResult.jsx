import { cardSrc } from './resultParsers';

function parseTeenCards(cardString) {
  if (!cardString) return { playerA: [], playerB: [] };
  const cards = cardString.split(',').map((c) => c.trim());
  return {
    playerA: [cards[0], cards[2], cards[4]].filter(Boolean),
    playerB: [cards[1], cards[3], cards[5]].filter(Boolean),
  };
}

export default function Teen20bResult({ detail }) {
  const cards = parseTeenCards(detail?.card);
  const parts = (detail?.rdesc || '').split('#');
  const winner = parts[0] || detail?.winnat || '';
  const baccParts = (parts[1] || '').split('~');
  const baccarat = baccParts[0] || '';
  const baccaratScores = baccParts[1] || '';
  const total = parts[2] || '';
  const pairPlus = parts[3] || '';
  const color = parts[4] || '';

  const isAWinner = detail?.win === '1' || winner === 'Player A';
  const isBWinner = detail?.win === '2' || winner === 'Player B';

  return (
    <div className="row row5">
      <div className="col-12 col-lg-8">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {isAWinner && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Player A</h4>
                {cards.playerA.map((code, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(code)} alt={code} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="casino-result-content-diveder"></div>

          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {isBWinner && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Player B</h4>
                {cards.playerB.map((code, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(code)} alt={code} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winner}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>3 Baccarat</div>
            <div>{baccarat}</div>
          </div>
          <div className="casino-result-desc-item">
            <div></div>
            <div>{baccaratScores}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Total</div>
            <div>{total}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Pair Plus</div>
            <div>{pairPlus}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Color</div>
            <div>{color}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
