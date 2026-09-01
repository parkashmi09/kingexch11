import { cardSrc, parseMeterCards, parseMeterRdesc } from './resultParsers';

export default function MeterResult({ detail }) {
  const cards = parseMeterCards(detail?.card);
  const rdesc = parseMeterRdesc(detail?.rdesc);

  return (
    <div className="row row5">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {(detail?.win === '1' || detail?.winnat === 'Fighter A') && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Fighter A</h4>
                <div className="casino-result-cards-item">
                  <img src={cardSrc(cards.fighterA)} alt={cards.fighterA} />
                </div>
              </div>
            </div>
          </div>
          <div className="casino-result-content-diveder"></div>
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {(detail?.win === '2' || detail?.winnat === 'Fighter B') && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Fighter B</h4>
                <div className="casino-result-cards-item">
                  <img src={cardSrc(cards.fighterB)} alt={cards.fighterB} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-5">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{rdesc.winner || detail?.winnat || ''}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Points</div>
            <div>{rdesc.points}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
