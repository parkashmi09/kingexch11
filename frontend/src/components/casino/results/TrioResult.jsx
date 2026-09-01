import { cardSrc } from './resultParsers';

export default function TrioResult({ detail }) {
  const allCards = (detail?.card || '').split(',').map((s) => s.trim()).filter(Boolean);
  const parts = (detail?.rdesc || '').split('#');
  const session = parts[0] || '';
  const judgement = parts[1] || '';
  const redBlack = parts[2] || '';
  const oddEven = parts[3] || '';
  const pattern = parts[4] || '';

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
            <div>Session (21)</div>
            <div>{session}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>1 2 4 / J Q K</div>
            <div>{judgement}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Red/Black</div>
            <div>{redBlack}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Odd/Even</div>
            <div>{oddEven}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Pattern</div>
            <div>{pattern}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
