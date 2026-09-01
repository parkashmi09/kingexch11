import { cardSrc } from './resultParsers';

export default function CricketMatch20Result({ detail }) {
  const card = (detail?.card || '').trim();
  const run = detail?.rdesc || detail?.winnat || '';

  return (
    <div className="row row5 align-items-center">
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
            <div>Run</div>
            <div>{run}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
