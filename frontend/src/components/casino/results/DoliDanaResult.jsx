import { parseDice, parseDoliDanaRdesc } from './resultParsers';

export default function DoliDanaResult({ detail }) {
  const diceValues = parseDice(detail?.card);
  const rdesc = parseDoliDanaRdesc(detail?.rdesc);

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
          <div className="casino-result-desc-item"><div>Turn</div><div>{rdesc.turn}</div></div>
          <div className="casino-result-desc-item"><div>Any Pair</div><div>{rdesc.anyPair}</div></div>
          <div className="casino-result-desc-item"><div>Particulat Pair</div><div>{rdesc.particularPair}</div></div>
          <div className="casino-result-desc-item"><div>Sum Total</div><div>{rdesc.sumTotal}</div></div>
          <div className="casino-result-desc-item"><div>Odd/Even</div><div>{rdesc.oddEven}</div></div>
          <div className="casino-result-desc-item"><div>Lucky 7</div><div>{rdesc.lucky7}</div></div>
        </div>
      </div>
    </div>
  );
}
