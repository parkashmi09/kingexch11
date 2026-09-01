import { cardSrc, parseTeenCards, parseRdesc } from './resultParsers';

export default function GenericTeenpattiResult({ detail, gameType }) {
  const cards = parseTeenCards(detail?.card);
  const rdesc = parseRdesc(detail?.rdesc);
  const winValue = detail?.win;
  const winner = detail?.winnat || rdesc.winner || '';
  const isAWinner = winValue === '1' || winner === 'Player A';
  const isBWinner = winValue === '2' || winner === 'Player B';

  return (
    <div className="row row5">
      <div className="col-12 col-lg-7">
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
      <div className="col-12 col-lg-5">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winner || (isAWinner ? 'Player A' : isBWinner ? 'Player B' : '')}</div>
          </div>
          {rdesc.oddEven && (
            <div className="casino-result-desc-item">
              <div>Odd/Even</div>
              <div>{rdesc.oddEven}</div>
            </div>
          )}
          {rdesc.consecutive && (
            <div className="casino-result-desc-item">
              <div>Consecutive</div>
              <div>{rdesc.consecutive}</div>
            </div>
          )}
          {(gameType === 'teen41' || gameType === 'teen42') && (
            <>
              <div className="casino-result-desc-item">
                <div>Consecutive</div>
                <div></div>
              </div>
              {rdesc.suits && (
                <div className="casino-result-desc-item">
                  <div>Under/Over</div>
                  <div>{rdesc.suits}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
