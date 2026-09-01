import { cardSrc } from './resultParsers';

export default function Joker120Result({ detail }) {
  // joker120 has NO leading joker: 6 cards interleaved from index 0 (A1,B1,A2,B2,A3,B3)
  const c = (detail?.card || '').split(',').map((s) => s.trim()).filter(Boolean);
  const cards = {
    playerA: [c[0], c[2], c[4]].filter(Boolean),
    playerB: [c[1], c[3], c[5]].filter(Boolean),
  };

  return (
    <div className="row row5">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content joker-result">
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              <div className="d-inline-block">
                <h4 className="text-playerb">Joker</h4>
                <div className="casino-result-cards-item">
                  <img src="/assets/img/joker1/joker.png" alt="Joker" />
                </div>
              </div>
            </div>
          </div>
          <div className="casino-result-content-diveder d-none"></div>
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              <div className="d-inline-block">
                <h4>Player A</h4>
                {cards.playerA.map((code, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(code)} alt={code} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="casino-result-content-diveder"></div>
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              <div className="d-inline-block">
                <h4>Player B</h4>
                {cards.playerB.map((code, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(code)} alt={code} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
