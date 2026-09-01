import { cardSrc, parseDtCards, parseDtRdesc } from './resultParsers';

export default function DragonTigerResult({ detail }) {
  const cards = parseDtCards(detail?.card);
  const rdesc = parseDtRdesc(detail?.rdesc);

  return (
    <div className="row row5">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {(detail?.win === '1' || rdesc.winner === 'Dragon') && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Dragon</h4>
                {cards.dragon && (
                  <div className="casino-result-cards-item">
                    <img src={cardSrc(cards.dragon)} alt={cards.dragon} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="casino-result-content-diveder"></div>
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {(detail?.win === '2' || rdesc.winner === 'Tiger') && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Tiger</h4>
                {cards.tiger && (
                  <div className="casino-result-cards-item">
                    <img src={cardSrc(cards.tiger)} alt={cards.tiger} />
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
            <div>{detail?.winnat || rdesc.winner || ''}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Pair</div>
            <div>{rdesc.pair || ''}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Odd/Even</div>
            <div>{rdesc.oddEven || ''}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Color</div>
            <div>{rdesc.color || ''}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Card</div>
            <div>{rdesc.card || ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
