import { cardSrc, parseJoker1Cards } from './resultParsers';

export default function Joker1Result({ detail }) {
  const cards = parseJoker1Cards(detail?.card);

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
