import { cardSrc } from './resultParsers';

export default function Race17Result({ detail }) {
  const allCards = (detail?.card || '').split(',').map((s) => s.trim()).filter(Boolean);
  const parts = (detail?.rdesc || '').split('#');
  const raceTo17 = parts[0] || '';
  const bigCard = parts[1] || '';
  const zeroCard = parts[2] || '';
  const oneZero = parts[3] || '';

  return (
    <div className="row row5 worli-result">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center w-100">
            <div className="casino-result-cards">
              {allCards.map((code, i) => (
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
            <div>Race to 17</div>
            <div>{raceTo17}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Big Card</div>
            <div>{bigCard}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Zero Card</div>
            <div>{zeroCard}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>One Zero Card</div>
            <div>{oneZero}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
