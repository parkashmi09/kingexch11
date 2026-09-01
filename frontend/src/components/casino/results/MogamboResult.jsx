import { cardSrc, parseMogamboCards } from './resultParsers';

export default function MogamboResult({ detail }) {
  const cards = parseMogamboCards(detail?.card);
  const mogamboWinner = detail?.winnat || '';
  const isDagaWinner = mogamboWinner === 'Daga / Teja';
  const isMogamboWinner = mogamboWinner === 'Mogambo';

  return (
    <div className="row row5">
      <div className="col-12 col-lg-8">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {isDagaWinner && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Daga / Teja</h4>
                {cards.dagaTeja.map((code, i) => (
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
              {isMogamboWinner && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Mogambo</h4>
                {cards.mogambo.map((code, i) => (
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
            <div>{mogamboWinner || (isDagaWinner ? 'Daga / Teja' : isMogamboWinner ? 'Mogambo' : '')}</div>
          </div>
          {detail?.total && (
            <div className="casino-result-desc-item">
              <div>Total</div>
              <div>{detail.total}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
