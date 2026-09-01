import { cardSrc } from './resultParsers';

function parseTeenCards(cardString) {
  if (!cardString) return { playerA: [], playerB: [] };
  const cards = cardString.split(',').map((c) => c.trim());
  return {
    playerA: [cards[0], cards[2], cards[4]].filter(Boolean),
    playerB: [cards[1], cards[3], cards[5]].filter(Boolean),
  };
}

export default function MuflisResult({ detail }) {
  const cards = parseTeenCards(detail?.card);
  const parts = (detail?.rdesc || '').split('#');
  const winner = parts[0] || detail?.winnat || '';
  const top9 = parts[1] || '-';
  const mBaccarat = parts[2] || '';

  const isAWinner = detail?.win === '1' || winner === 'Player A';
  const isBWinner = detail?.win === '2' || winner === 'Player B';

  return (
    <div className="row row5 muf-res">
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
            <div>Top 9</div>
            <div>{top9}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>M Baccarat</div>
            <div>{mBaccarat}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
