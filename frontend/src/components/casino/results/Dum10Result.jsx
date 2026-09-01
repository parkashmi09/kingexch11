import { cardSrc, parseDum10Rdesc } from './resultParsers';
import ResultCarousel from './ResultCarousel';

export default function Dum10Result({ detail }) {
  const allCards = (detail?.card || '').split(',').map((s) => s.trim()).filter(Boolean);
  const prevCards = allCards.slice(0, -1);
  const lastCard = allCards[allCards.length - 1] || '';
  const rdesc = parseDum10Rdesc(detail?.rdesc);

  return (
    <>
      <div className="row row5 dum-result mt-2">
        <div className="col-10">
          <ResultCarousel cards={prevCards} />
        </div>
        <div className="col-2">
          <div className="casino-result-cards-item">
            <img src={cardSrc(lastCard)} alt={lastCard} />
          </div>
        </div>
      </div>
      <div className="row row5 justify-content-center">
        <div className="col-12 col-lg-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Card</div>
              <div>{rdesc.card}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Curr. Total</div>
              <div>{rdesc.currTotal}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Total</div>
              <div>{rdesc.total}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Odd/Even</div>
              <div>{rdesc.oddEven}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Red/Black</div>
              <div>{rdesc.redBlack}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
