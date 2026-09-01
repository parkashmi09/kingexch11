import { memo } from 'react';

function formatAmount(n) {
  if (!n && n !== 0) return '';
  const num = Number(n);
  if (num >= 100000) return `${num / 100000}L`;
  if (num >= 1000) return `${num / 1000}K`;
  return String(num);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0' || item.gstatus === 0;
}

const GoalMarket = function GoalMarket({ title, items, onBet, exposures }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="market-6">
      <div className="bet-table">
        <div className="bet-table-header">
          <div className="nation-name">
            <span title={title}>{title}</span>
          </div>
        </div>
        <div className="bet-table-body collapse show container-fluid container-fluid-5">
          <div className="row row5 d-none-mobile">
            <div className="col-12 col-md-12">
              <div className="fancy-tripple">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  <div className="back bl-title back-title">Back</div>
                </div>
              </div>
            </div>
          </div>
          <div className="row row5">
            {items.map((item, i) => {
              const suspended = isSusp(item);
              const b1 = item?.b1 || item?.b || item?.rate || '';
              const bs1 = item?.bs1 || item?.bs || '';
              const min = item?.min ?? '';
              const max = item?.max ?? '';
              return (
                <div key={item?.sid ?? i} className="col-12 col-md-12">
                  <div className="fancy-tripple">
                    <div className="bet-table-row">
                      <div className="nation-name">
                        <p>{item?.nat ?? ''}</p>
                        {exposures?.[item?.nat]
                          ? <p className={`mb-0 ${exposures[item.nat] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures[item.nat])}</p>
                          : <p className="mb-0"></p>
                        }
                      </div>
                      <div
                        data-title={suspended ? 'SUSPENDED' : 'OPEN'}
                        className={`bl-box back${suspended ? ' no-val suspended' : ''}`}
                        onClick={suspended ? undefined : () => onBet && onBet(item.sid, 'back', b1, item)}
                      >
                        <span className="d-block odds">{suspended ? '—' : b1}</span>
                        {!suspended && <span className="d-block">{formatAmount(bs1)}</span>}
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
}

// Exclusive method names (not "No Goal" since it appears in both markets)
const EXCLUSIVE_METHODS = ['shot goal', 'header goal', 'penalty goal', 'free kick goal'];

function BetTableGoal({ gameData, onBet, exposures }) {
  const sub = gameData?.sub ?? [];

  let playersMarket;
  let methodsMarket;

  // Try discriminator fields first (API sends subtype: "player" and subtype: "goal")
  const byPlayer = sub.filter((s) => s.subtype === 'player');
  const byMethod = sub.filter((s) => s.subtype === 'goal' || s.subtype === 'method');

  if (byPlayer.length > 0 || byMethod.length > 0) {
    playersMarket = byPlayer;
    methodsMarket = byMethod;
  } else {
    // Split by position: find where the first exclusive method name starts
    const splitIndex = sub.findIndex((s) =>
      EXCLUSIVE_METHODS.includes((s.nat || '').toLowerCase().trim())
    );
    if (splitIndex > 0) {
      playersMarket = sub.slice(0, splitIndex);
      methodsMarket = sub.slice(splitIndex);
    } else {
      playersMarket = sub;
      methodsMarket = [];
    }
  }

  return (
    <>
      <GoalMarket
        title="Who Will Goal Next?"
        items={playersMarket}
        onBet={onBet}
        exposures={exposures}
      />
      <GoalMarket
        title="Method Of Next Goal"
        items={methodsMarket}
        onBet={onBet}
        exposures={exposures}
      />
    </>
  );
}

export default BetTableGoal;
