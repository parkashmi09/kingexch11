import { cardSrc } from './resultParsers';
import { parseCards } from '../cards/cardUtils';

export default function WorliResult({ detail }) {
  const cards = parseCards(detail?.card);
  const rdesc = (detail?.rdesc || '').split('#');
  const pana = rdesc[0] || detail?.winnat || '';
  const ocada = rdesc[1] || '';

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
            <div>Pana</div>
            <div>{pana}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Ocada</div>
            <div>{ocada}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
