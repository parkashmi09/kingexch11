import { cardSrc } from './resultParsers';

export default function ThreeCardJResult({ detail }) {
  const cards = (detail?.card || '').split(',').map((c) => c.trim()).filter((c) => c && c !== '1');
  const result = detail?.winnat || detail?.rdesc || '';

  return (
    <div className="row row5 worli-result">
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
            <div>Result</div>
            <div>{result}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
