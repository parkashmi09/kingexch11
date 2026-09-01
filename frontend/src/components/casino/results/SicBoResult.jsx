import { parseDice } from './resultParsers';

export default function SicBoResult({ detail }) {
  const diceValues = parseDice(detail?.card);

  return (
    <div className="row row5 worli-result">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center w-100">
            <div className="casino-result-cards">
              {diceValues.map((n, i) => (
                <div key={i} className="casino-result-cards-item">
                  <img src={`/assets/front/img/dice${n}.png`} alt={`Dice ${n}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-5">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item"><div>Desc</div><div>{detail?.card || ''}</div></div>
          <div className="casino-result-desc-item"><div>Win</div><div>{detail?.win || ''}</div></div>
        </div>
      </div>
    </div>
  );
}
