import { cardSrc, parseTeen9Cards } from './resultParsers';

export default function Teen9Result({ detail }) {
  const cards = parseTeen9Cards(detail?.card);
  const winner = detail?.winnat || '';
  const others = (() => {
    if (!detail?.rdesc) return '';
    const parts = detail.rdesc.split('#');
    return parts[1] && parts[1] !== '-' ? parts[1] : '';
  })();

  return (
    <div className="row row5 dtl20-result">
      {['Tiger', 'Lion', 'Dragon'].map((player) => {
        const playerCards = cards[player.toLowerCase()] || [];
        const isWinner = winner.toLowerCase().includes(player.toLowerCase());
        return (
          <div key={player} className="col-12 col-lg-3">
            <div className="casino-result-cards">
              {isWinner && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4 className="text-center">{player}</h4>
                {playerCards.map((code, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(code)} alt={code} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      <div className="col-12 col-lg-3">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winner}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Others</div>
            <div>{others || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
