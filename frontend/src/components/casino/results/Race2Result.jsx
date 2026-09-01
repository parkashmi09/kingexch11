import { cardSrc } from './resultParsers';

const PLAYERS = ['Player A', 'Player B', 'Player C', 'Player D'];

export default function Race2Result({ detail }) {
  const cards = (detail?.card || '').split(',').map((s) => s.trim()).filter(Boolean);
  const winner = detail?.winnat || '';

  return (
    <div className="row row5 card32result">
      <div className="col-12 col-lg-9">
        <div className="row row5">
          {PLAYERS.map((name, i) => {
            const isWinner = winner === name;
            return (
              <div key={i} className="col-12 col-lg-3">
                <div className="casino-result-cards">
                  {isWinner && (
                    <div className="casino-result-cards-item">
                      <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                    </div>
                  )}
                  <div className="d-inline-block">
                    <h5>{name}</h5>
                    <div className="casino-result-cards-item">
                      <img src={cardSrc(cards[i])} alt={cards[i] || ''} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="col-12 col-lg-3">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winner}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
