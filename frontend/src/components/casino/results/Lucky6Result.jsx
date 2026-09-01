import { cardSrc, parseRdesc } from './resultParsers';

export default function Lucky6Result({ detail }) {
  const cards = (detail?.card || '').split(',').map((c) => c.trim()).filter(Boolean);
  const rdesc = parseRdesc(detail?.rdesc);

  return (
    <div className="row row5">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center w-100">
            <div className="casino-result-cards">
              {cards.map((code, i) => (
                <div key={i} className="casino-result-cards-item">
                  <img src={cardSrc(code)} alt={code} />
                </div>
              ))}
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
          {rdesc.suits && (
            <div className="casino-result-desc-item">
              <div>Color</div>
              <div>{rdesc.suits}</div>
            </div>
          )}
          {rdesc.oddEven && (
            <div className="casino-result-desc-item">
              <div>Odd/Even</div>
              <div>{rdesc.oddEven}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
