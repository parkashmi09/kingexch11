import { cardSrc } from './resultParsers';

function cardValue(code) {
  if (!code) return 0;
  const val = code.replace(/[SSDDHHCC]/g, '');
  if (val === '1' || val === 'A') return 1;
  if (val === 'J') return 11;
  if (val === 'Q') return 12;
  if (val === 'K') return 13;
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

function parseCards(cardString) {
  if (!cardString) return { aCards: [], bCards: [] };
  const all = cardString.split(',').map((c) => c.trim()).filter(Boolean);
  const a = [];
  const b = [];
  for (let i = 0; i < all.length; i++) {
    if (i % 2 === 0) a.push(all[i]);
    else b.push(all[i]);
  }
  return { aCards: a, bCards: b };
}

export default function TrapResult({ detail }) {
  const { aCards, bCards } = parseCards(detail?.card);
  const aTotal = aCards.reduce((s, c) => s + cardValue(c), 0);
  const bTotal = bCards.reduce((s, c) => s + cardValue(c), 0);

  const parts = (detail?.rdesc || '').split('#');
  const main = parts[0] || detail?.winnat || '';
  const seven = parts[1] || '';
  const pictureCard = parts[2] || '';

  const isAWinner = detail?.win === '1' || (detail?.winnat || '').includes('Player A');
  const isBWinner = detail?.win === '2' || (detail?.winnat || '').includes('Player B');

  return (
    <div className="row row5 trap-result">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center">
            <div className="casino-result-cards">
              {isAWinner && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block w-100">
                <h4>Player A ({aTotal})</h4>
                {aCards.map((code, i) => (
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
              {isBWinner && (
                <div className="casino-result-cards-item">
                  <img src="/assets/icons/winner.png" className="winner-icon" alt="Winner" />
                </div>
              )}
              <div className="d-inline-block w-100">
                <h4>Player B ({bTotal})</h4>
                {bCards.map((code, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(code)} alt={code} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-5">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Main</div>
            <div>{main}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Seven</div>
            <div>{seven}</div>
          </div>
          <div className="casino-result-desc-item">
            <div>Picture Card</div>
            <div>{pictureCard}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
