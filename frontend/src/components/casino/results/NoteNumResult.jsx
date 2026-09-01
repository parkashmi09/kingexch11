import { cardSrc } from './resultParsers';

export default function NoteNumResult({ detail }) {
  const allCards = (detail?.card || '').split(',').map((s) => s.trim()).filter(Boolean);
  const parts = (detail?.rdesc || '').split('#');
  const oddEven = parts[0] || '';
  const redBlack = parts[1] || '';
  const lowHigh = parts[2] || '';
  const cards = parts[3] || '';
  const baccarat = parts[4] || '';

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
            <div>Odd/Even</div>
            <div>{oddEven}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Red/Black</div>
            <div>{redBlack}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Low/High</div>
            <div>{lowHigh}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Cards</div>
            <div>{cards}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Baccarat</div>
            <div>{baccarat}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
