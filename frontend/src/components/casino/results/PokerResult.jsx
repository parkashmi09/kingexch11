import { cardSrc, parsePokerCards, parsePokerRdesc } from './resultParsers';

export default function PokerResult({ detail }) {
  const cards = parsePokerCards(detail?.card);
  const rdesc = parsePokerRdesc(detail?.rdesc);

  return (
    <div className="row row5">
      <div className="col-12 col-lg-5">
        <div className="casino-result-content mt-0">
          <div className="casino-reslt-content-item text-center">
            <div className="casino-result-cards">
              {detail?.win === '1' && (
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
              {detail?.win === '2' && (
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
      <div className="col-12 col-lg-4 d-flex align-items-center">
        <div className="casino-result-cards d-block w-100">
          <div className="text-center">
            <h4 className="text-center">Board</h4>
            {cards.board.map((code, i) => (
              <div key={i} className="casino-result-cards-item">
                <img src={cardSrc(code)} alt={code} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-3">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{detail?.winnat || rdesc.winner || '-'}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Other</div>
            <div>{rdesc.other || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
