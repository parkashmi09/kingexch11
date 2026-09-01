import { cardSrc } from './resultParsers';

const LOW_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8'];
const SPADE_SPECIAL = ['9SS', '10SS'];

function extractRank(code) {
  if (!code || code === '1') return null;
  const m = code.match(/^(\d+|[AJQK])/);
  return m ? m[1] : null;
}

function isLowCard(code) {
  const rank = extractRank(code);
  if (!rank) return false;
  // 9SS and 10SS are special (shown separately)
  if (SPADE_SPECIAL.includes(code)) return false;
  return LOW_RANKS.includes(rank) || rank === '9';
}

function isHighCard(code) {
  const rank = extractRank(code);
  if (!rank) return false;
  if (SPADE_SPECIAL.includes(code)) return false;
  return ['10', 'J', 'Q', 'K'].includes(rank);
}

export default function CasinoMeterResult({ detail }) {
  const cards = (detail?.card || '').split(',').map(c => c.trim()).filter(c => c && c !== '1');
  const winner = detail?.winnat || detail?.rdesc || '';

  const lowCards = cards.filter(isLowCard);
  const highCards = cards.filter(isHighCard);
  const spadeCards = cards.filter(c => SPADE_SPECIAL.includes(c));

  return (
    <div className="row row5">
      <div className="col-12 col-lg-9">
        <div className="row align-items-center">
          <div className="col-10">
            <div className="row align-items-center">
              <div className="col-2"><b>Low Cards</b></div>
              <div className="col-10">
                {lowCards.map((c, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(c)} className="mr-2" alt={c} />
                  </div>
                ))}
              </div>
            </div>
            <div className="row align-items-center mt-3">
              <div className="col-2"><b>High Cards</b></div>
              <div className="col-10">
                {highCards.map((c, i) => (
                  <div key={i} className="casino-result-cards-item">
                    <img src={cardSrc(c)} className="mr-2" alt={c} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-2 text-center">
            {spadeCards.map((c, i) => (
              <div key={i} className="casino-result-cards-item">
                <img src={cardSrc(c)} className="mr-2" alt={c} />
              </div>
            ))}
          </div>
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
