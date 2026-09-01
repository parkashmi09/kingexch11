import { cardSrc } from '../cards/cardUtils';

export default function AAA2Result({ detail }) {
  const cardCode = (detail?.card || '').trim();
  const parts = (detail?.rdesc || '').split('#');
  const winner = parts[0] || detail?.winnat || '';
  const oddEven = parts[1] || '';
  const color = parts[2] || '';
  const underOver = parts[3] || '';
  const cardVal = parts[4] || '';

  return (
    <div className="row row5">
      <div className="col-12 col-lg-7">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center" style={{ alignItems: 'flex-end' }}>
            <div className="casino-result-cards">
              {cardCode && (
                <div className="casino-result-cards-item">
                  <img src={cardSrc(cardCode)} alt={cardCode} />
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
          {oddEven && (
            <div className="casino-result-desc-item">
              <div>Odd/Even</div>
              <div>{oddEven}</div>
            </div>
          )}
          {color && (
            <div className="casino-result-desc-item">
              <div>Color</div>
              <div>{color}</div>
            </div>
          )}
          {underOver && (
            <div className="casino-result-desc-item">
              <div>Under/Over</div>
              <div>{underOver}</div>
            </div>
          )}
          {cardVal && (
            <div className="casino-result-desc-item">
              <div>Card</div>
              <div>{cardVal}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
