import { cardSrc, parseBtable2Rdesc } from './resultParsers';

export default function Btable2Result({ detail }) {
  const card = (detail?.card || '').trim();
  const rdesc = parseBtable2Rdesc(detail?.rdesc);

  return (
    <div className="row row5">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center" style={{ alignItems: 'flex-end' }}>
            <div className="casino-result-cards">
              {card && (
                <div className="casino-result-cards-item">
                  <img src={cardSrc(card)} alt={card} />
                </div>
              )}
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
            <div>Odd</div>
            <div>{rdesc.odd}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Dulha Dulhan/Barati</div>
            <div>{rdesc.dulhaBarati}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Color</div>
            <div>{rdesc.color}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Card</div>
            <div>{rdesc.card}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
