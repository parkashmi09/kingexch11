import { cardSrc, parseTeenCards, parseTeen20cRdesc } from './resultParsers';

export default function Teen20cResult({ detail, gameType }) {
  const cards = parseTeenCards(detail?.card);
  const rdesc = parseTeen20cRdesc(detail?.rdesc);
  const winValue = detail?.win;
  const winner = detail?.winnat || rdesc.winner || '';
  const isAWinner = winValue === '1' || winner === 'Player A';
  const isBWinner = winValue === '2' || winner === 'Player B';

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
            <div>{rdesc.winner || (isAWinner ? 'Player A' : isBWinner ? 'Player B' : '')}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>3 Baccarat</div>
            <div>{rdesc.baccarat}</div>
          </div>
          <div className="casino-result-desc-item">
            <div></div>
            <div>{rdesc.baccaratScores}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Total</div>
            <div>{rdesc.total}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Pair Plus</div>
            <div>{rdesc.pairPlus}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>{gameType === 'teen20' ? 'Red Black' : 'Color'}</div>
            <div>{rdesc.color}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
