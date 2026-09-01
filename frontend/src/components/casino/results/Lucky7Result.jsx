import { cardSrc } from './resultParsers';

export default function Lucky7Result({ detail }) {
  const card = detail?.card || '';
  const rdesc = (detail?.rdesc || '').split('#');
  const winner = detail?.winnat || rdesc[0] || '';

  return (
    <div className="row row5 align-items-center">
      {/* col-12, not col-2 — the reference gives the card column a full
          row on narrow screens and only splits 7/5 from lg up. */}
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center" style={{ alignItems: 'flex-end' }}>
            <div className="casino-result-cards">
              {card && card !== '1' && (
                <div className="casino-result-cards-item">
                  <img src={cardSrc(card)} alt={card} />
                </div>
              )}
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
          {rdesc[1] && (
            <div className="casino-result-desc-item">
              <div>Odd/Even</div>
              <div>{rdesc[1]}</div>
            </div>
          )}
          {rdesc[2] && (
            <div className="casino-result-desc-item">
              <div>Color</div>
              <div>{rdesc[2]}</div>
            </div>
          )}
          {rdesc[3] && (
            <div className="casino-result-desc-item">
              <div>Card</div>
              <div>{rdesc[3]}</div>
            </div>
          )}
          {rdesc[4] && (
            <div className="casino-result-desc-item">
              <div>Line</div>
              <div>{rdesc[4]}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
