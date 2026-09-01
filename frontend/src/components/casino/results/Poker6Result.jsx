import { cardSrc, parsePoker6Cards, parsePoker6Rdesc } from './resultParsers';

export default function Poker6Result({ detail }) {
  const cards = parsePoker6Cards(detail?.card);
  const winner = String(Number(detail?.win || 0) - 10);
  const rdesc = parsePoker6Rdesc(detail?.rdesc);

  return (
    <div className="row row5 poker6result">
      <div className="col-12 col-lg-8">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center">
            <div className="casino-open-result">
              {cards.players.map((pCards, idx) => {
                const num = String(idx + 1);
                const isWinner = winner === num;
                return (
                  <div key={idx} className="casino-open-result-item">
                    <h4>{num}</h4>
                    <div className="casino-result-cards">
                      <div className="casino-result-cards-item-container">
                        {pCards.map((code, i) => (
                          <div key={i} className="casino-result-cards-item">
                            <img src={cardSrc(code)} alt={code} />
                          </div>
                        ))}
                        {isWinner && (
                          <div className="casino-result-cards-item">
                            <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="casino-result-content-diveder"></div>
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              <div className="d-inline-block">
                <h4>Board</h4>
                {cards.board.map((code, i) => (
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
            <div>{detail?.winnat || rdesc.winner || '-'}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Pattern</div>
            <div>{rdesc.pattern || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
