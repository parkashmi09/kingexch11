import { memo } from 'react';

function formatAmount(n) {
  if (!n && n !== 0) return '';
  const num = Number(n);
  if (num >= 100000) return `${num / 100000}L`;
  if (num >= 1000) return `${num / 1000}K`;
  return String(num);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

const BetTableLucky15 = memo(function BetTableLucky15({ gameData, onBet, exposures }) {
  const sub = gameData?.sub ?? [];

  return (
    <div className="market-6">
      <div className="bet-table">
        <div className="bet-table-header">
          <div className="nation-name">
            <span title="Runs">Runs</span>
          </div>
        </div>
        <div className="bet-table-body collapse show container-fluid container-fluid-5">
          <div className="row row5 d-none-mobile">
            <div className="col-6 col-md-4">
              <div className="fancy-tripple">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  <div className="back bl-title back-title">Back</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="fancy-tripple">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  <div className="back bl-title back-title">Back</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="fancy-tripple">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  <div className="back bl-title back-title">Back</div>
                </div>
              </div>
            </div>
          </div>
          <div className="row row5">
            {sub.map((item, i) => {
              const suspended = isSusp(item);
              const b = item?.b ?? item?.b1 ?? '';
              const bs = item?.bs ?? item?.bs1 ?? '';
              const min = item?.min ?? '';
              const max = item?.max ?? '';
              return (
                <div key={item?.sid ?? i} className="col-6 col-md-4">
                  <div className="fancy-tripple">
                    <div className="bet-table-mobile-row d-none-desktop">
                      <div className="bet-table-mobile-team-name">
                        <span>{item?.nat ?? ''}</span>
                        {(() => { const exp = exposures?.[item?.nat]; return exp && exp !== 0 ? <span className={exp < 0 ? 'book-red' : 'book-green'}>{Math.round(exp)}</span> : <span className="d-none"></span>; })()}
                      </div>
                    </div>
                    <div className="bet-table-row">
                      <div className="nation-name d-none-mobile">
                        <p>{item?.nat ?? ''}</p>
                        {(() => { const exp = exposures?.[item?.nat]; return exp && exp !== 0 ? <p className={`mb-0 ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</p> : <p className="mb-0 d-none"></p>; })()}
                      </div>
                      <div
                        data-title={suspended ? 'SUSPENDED' : 'OPEN'}
                        className={`bl-box back${suspended ? ' no-val suspended' : ''}`}
                        onClick={suspended ? undefined : () => onBet && onBet(item.sid, 'back', b, item)}
                      >
                        <span className="d-block odds">{suspended ? '—' : b}</span>
                        {!suspended && <span className="d-block">{formatAmount(bs)}</span>}
                      </div>
                      <div className="fancy-min-max">
                        Min:<span>{formatAmount(min)}</span> Max:<span>{formatAmount(max)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

export default BetTableLucky15;
