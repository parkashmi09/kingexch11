import { cardSrc } from './resultParsers';

export default function Teen120Result({ detail }) {
  const allCards = (detail?.card || '').split(',').map((s) => s.trim()).filter(Boolean);
  const playerCard = allCards[0] || '';
  const dealerCard = allCards[1] || '';

  const parts = (detail?.rdesc || '').split('#');
  const winner = parts[0] || detail?.winnat || '';
  const pair = parts[1] || '';

  const isPlayerWinner = detail?.win === '1' || winner === 'Player';
  const isDealerWinner = detail?.win === '2' || winner === 'Dealer';

  return (
    <div className="row row5">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {isPlayerWinner && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Player</h4>
                <div className="casino-result-cards-item">
                  <img src={cardSrc(playerCard)} alt={playerCard} />
                </div>
              </div>
            </div>
          </div>

          <div className="casino-result-content-diveder"></div>

          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {isDealerWinner && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block">
                <h4>Dealer</h4>
                <div className="casino-result-cards-item">
                  <img src={cardSrc(dealerCard)} alt={dealerCard} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-5">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winner}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Pair</div>
            <div>{pair}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
