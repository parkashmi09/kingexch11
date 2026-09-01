import { cardSrc } from './resultParsers';
import { parseCards } from '../cards/cardUtils';

const WINNER_ICON = '/assets/icons/winner.png';

export default function WarResult({ detail }) {
  const cards = parseCards(detail?.card);
  // 7 cards: indices 0–5 = players 1–6, index 6 = dealer
  const playerCards = cards.slice(0, 6);
  const dealerCard = cards[6] || '1';

  // win is comma-separated winning player numbers e.g. "2,3,4,5,6"
  const winStr = detail?.win || detail?.winnat || '';
  const winners = new Set(
    winStr.split(',').map((s) => s.trim()).filter(Boolean)
  );

  // rdesc: "Winner#Color row1~Color row2#OddEven row1~OddEven row2#Suit row1~Suit row2"
  const rdesc = (detail?.rdesc || '').split('#');
  const winnerText = rdesc[0] || '';
  const colorRows = (rdesc[1] || '').split('~');
  const oddEvenRows = (rdesc[2] || '').split('~');
  const suitRows = (rdesc[3] || '').split('~');

  return (
    <div className="row row5 war-rsult">
      <div className="col-12 col-lg-6">
        <div className="casino-open-result">
          {playerCards.map((code, i) => {
            const num = String(i + 1);
            const isWinner = winners.has(num);
            return (
              <div key={num} className="casino-open-result-item">
                <h4>{num}</h4>
                <div className="casino-result-cards">
                  <div className="casino-result-cards-item-container">
                    <div className="casino-result-cards-item">
                      <img src={cardSrc(code)} alt={`card-${num}`} />
                    </div>
                    {isWinner && (
                      <div className="casino-result-cards-item">
                        <img src={WINNER_ICON} className="winner-icon" alt="Winner" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="casino-open-result-item">
            <h4 className="text-playerb">D</h4>
            <div className="casino-result-cards">
              <div className="casino-result-cards-item-container">
                <div className="casino-result-cards-item">
                  <img src={cardSrc(dealerCard)} alt="dealer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-6">
        <div className="casino-result-desc">
          <div className="casino-result-desc-item">
            <div>Winner</div>
            <div>{winnerText}</div>
          </div>
          {colorRows.map((row, i) => (
            <div key={`color-${i}`} className="casino-result-desc-item">
              <div>{i === 0 ? 'Color' : ''}</div>
              <div>{row}</div>
            </div>
          ))}
          {oddEvenRows.map((row, i) => (
            <div key={`oe-${i}`} className="casino-result-desc-item">
              <div>{i === 0 ? 'Odd/Even' : ''}</div>
              <div>{row}</div>
            </div>
          ))}
          {suitRows.map((row, i) => (
            <div key={`suit-${i}`} className="casino-result-desc-item">
              <div>{i === 0 ? 'Suit' : ''}</div>
              <div>{row}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
