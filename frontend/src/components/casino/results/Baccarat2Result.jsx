import { cardSrc, parseBaccarat2Cards, parseBaccarat2Rdesc } from './resultParsers';

export default function Baccarat2Result({ detail }) {
  const cards = parseBaccarat2Cards(detail?.card);
  const rdesc = parseBaccarat2Rdesc(detail?.rdesc);

  return (
    <div className="row row5">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-reslt-content-item text-center">
            <div className="casino-result-cards">
              {detail?.win === '1' && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Player</h4>
                {cards.p3 && (
                  <div className="casino-result-cards-item">
                    <img src={cardSrc(cards.p3)} alt="" />
                  </div>
                )}
                {cards.player.map((code, i) => (
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
                <h4>Banker</h4>
                {cards.banker.map((code, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(code)} alt={code} />
                  </div>
                ))}
                {cards.b3 && (
                  <div className="casino-result-cards-item">
                    <img src={cardSrc(cards.b3)} alt="" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-5">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{detail?.winnat || rdesc.winner || '-'}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Pair</div>
            <div>{rdesc.pair || '-'}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Score</div>
            <div>{rdesc.score || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
