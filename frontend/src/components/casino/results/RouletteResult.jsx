export default function RouletteResult({ detail }) {
  const win = detail?.result || detail?.win || detail?.desc || '';
  const num = String(win).replace(/\D/g, '').padStart(2, '0');

  return (
    <div className="row row5 worli-result">
      <div className="col-12">
        <div className="casino-result-content">
          <div className="casino-result-content-item text-center w-100">
            <div className="casino-result-cards">
              <div className="casino-result-cards-item">
                <img src={`/assets/casino/roulette-cards/${num}.png`} alt={num} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
