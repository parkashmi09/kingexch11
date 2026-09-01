import { cardSrc } from './resultParsers';

export default function Teen6Result({ detail }) {
  const cards = (detail?.card || '').split(',').map(c => c.trim()).filter(Boolean);
  const rdesc = detail?.rdesc || '';
  const parts = rdesc.split('#');

  const winner = parts[0] || detail?.winnat || '';
  const suit = parts[1] || '';
  const oddEven = parts[2] || '';
  const consecutive = parts[3] || '';
  const underOver = parts[4] || '';

  // Player A = first 3 cards, Player B = last 3
  const playerACards = cards.slice(0, 3);
  const playerBCards = cards.slice(3, 6);
  const isAWinner = winner.includes('Player A');

  return (
    <div className="row row5">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {isAWinner && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Player A</h4>
                {playerACards.map((c, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(c)} alt={c} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="casino-result-content-diveder"></div>
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {!isAWinner && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Player B</h4>
                {playerBCards.map((c, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(c)} alt={c} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-5">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winner}</div>
          </div>
          {suit && (
            <div className="casino-result-desc-item">
              <div>Suit</div>
              <div>{suit}</div>
            </div>
          )}
          {oddEven && (
            <div className="casino-result-desc-item">
              <div>Odd/Even</div>
              <div>{oddEven}</div>
            </div>
          )}
          {consecutive && (
            <div className="casino-result-desc-item">
              <div>Consecutive</div>
              <div>{consecutive}</div>
            </div>
          )}
          {consecutive && (
            <div className="casino-result-desc-item">
              <div>Cards</div>
              <div>{consecutive}</div>
            </div>
          )}
          {underOver && (
            <div className="casino-result-desc-item">
              <div>Under/Over</div>
              <div>{underOver}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
