import { cardSrc, parseTeen8Cards, parseTeen8Rdesc } from './resultParsers';

export default function Teen8Result({ detail }) {
  const cards = parseTeen8Cards(detail?.card);
  const winners = (detail?.winnat || '').split(',').map((s) => s.trim());
  const rdesc = parseTeen8Rdesc(detail?.rdesc);

  return (
    <div className="row row5 casino-open">
      <div className="col-12 col-lg-7">
        <div className="casino-open-result">
          {cards.players.map((playerCards, idx) => {
            const playerNum = String(idx + 1);
            const isWinner = winners.includes(playerNum);
            return (
              <div key={idx} className="casino-open-result-item">
                <h4>{playerNum}</h4>
                <div className="casino-result-cards">
                  <div className="casino-result-cards-item-container">
                    {playerCards.map((code, i) => (
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
          <div className="casino-open-result-item">
            <h4 className="text-playerb">D</h4>
            <div className="casino-result-cards">
              <div className="casino-result-cards-item-container">
                {cards.dealer.map((code, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(code)} alt={code} />
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
            <div>{rdesc.winners || '-'}</div>
          </div>
          {rdesc.pairPlus && (
            <div className="casino-result-desc-item">
              <div>Pair Plus</div>
              <div>{rdesc.pairPlus}</div>
            </div>
          )}
          {rdesc.totals.length > 0 && rdesc.totals.map((line, i) => (
            <div key={i} className="casino-result-desc-item">
              <div>{i === 0 ? 'Total' : ''}</div>
              <div>{line}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
