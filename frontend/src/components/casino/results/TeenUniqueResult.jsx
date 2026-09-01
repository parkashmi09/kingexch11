import { cardSrc } from './resultParsers';

export default function TeenUniqueResult({ detail }) {
  const cards = detail?.card ? detail.card.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="row row5 teenunique">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center w-100">
            <div className="casino-result-cards">
              {cards.map((code, i) => (
                <div key={i} className="casino-result-cards-item">
                  <img src={`/assets/front/img/sequence/s${i + 1}-icon.png`} alt="" />
                  <img src={cardSrc(code)} alt={code} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
