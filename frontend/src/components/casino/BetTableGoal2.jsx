import { useState } from 'react';

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

function ExposureLine({ exposures, nat, sid }) {
  const v = exposures?.[`sid:${sid}`] ?? exposures?.[nat];
  return v
    ? <p className={`mb-0 ${v < 0 ? 'book-red' : 'book-green'}`}>{Math.round(v)}</p>
    : <p className="mb-0 d-none"></p>;
}

/* Back + Lay market — "Who Will Goal Next?" / "Method Of Next Goal" */
function BackLayMarket({ id, title, items, onBet, exposures }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="market-6">
      <div className="bet-table">
        <div data-toggle="collapse" data-target={`#${id}`} aria-expanded="true" className="bet-table-header">
          <div className="nation-name">
            <span title={title}>{title}</span>
          </div>
        </div>
        <div id={id} className="bet-table-body collapse show container-fluid container-fluid-5">
          <div className="row row5 d-none-mobile">
            <div className="col-12 col-md-12">
              <div className="fancy-tripple">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  <div className="back bl-title back-title">Back</div>
                  <div className="lay bl-title lay-title">Lay</div>
                </div>
              </div>
            </div>
          </div>
          <div className="row row5">
            {items.map((item, i) => {
              const suspended = isSusp(item);
              const b1 = item?.b1 || item?.b || '';
              const bs1 = item?.bs1 || item?.bs || '';
              const l1 = item?.l1 || item?.l || '';
              const ls1 = item?.ls1 || item?.ls || '';
              return (
                <div key={item?.sid ?? i} className="col-12 col-md-12">
                  <div className="fancy-tripple">
                    <div className="bet-table-row">
                      <div className="nation-name">
                        <p>{item?.nat ?? ''}</p>
                        <ExposureLine exposures={exposures} nat={item?.nat} sid={item?.sid} />
                      </div>
                      <div
                        data-title={suspended ? 'SUSPENDED' : 'OPEN'}
                        className={`bl-box back${suspended ? ' no-val suspended' : ''}`}
                        onClick={suspended ? undefined : () => onBet && onBet(item.sid, 'back', b1, item)}
                      >
                        <span className="d-block odds">{suspended ? '—' : b1}</span>
                        {!suspended && <span className="d-block">{formatAmount(bs1)}</span>}
                      </div>
                      <div
                        className={`bl-box lay${suspended ? ' no-val suspended' : ''}`}
                        onClick={suspended ? undefined : () => onBet && onBet(item.sid, 'lay', l1, item)}
                      >
                        <span className="d-block odds">{suspended ? '—' : l1}</span>
                        {!suspended && <span className="d-block">{formatAmount(ls1)}</span>}
                      </div>
                      <div className="fancy-min-max">
                        Min:<span>{formatAmount(item?.min ?? '')}</span> Max:<span>{formatAmount(item?.max ?? '')}</span>
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

/* Back-only two-column market — "Method Of Combination Goal".
   Mobile hides the min/max column; the info button toggles it as a tooltip. */
function ComboMarket({ id, title, items, onBet, exposures }) {
  const [openInfoSid, setOpenInfoSid] = useState(null);

  if (!items || items.length === 0) return null;

  const headerCol = (
    <div className="col-6 col-md-6">
      <div className="fancy-tripple">
        <div className="bet-table-row">
          <div className="nation-name"></div>
          <div className="back bl-title back-title">Back</div>
          <div className="fancy-min-max"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="market-comb">
      <div className="bet-table">
        <div data-toggle="collapse" data-target={`#${id}`} aria-expanded="true" className="bet-table-header">
          <div className="nation-name">
            <span title={title}>{title}</span>
          </div>
        </div>
        <div id={id} className="bet-table-body collapse show container-fluid container-fluid-5">
          <div className="row row5 d-none-mobile">
            {headerCol}
            {headerCol}
          </div>
          <div className="row row5">
            {items.map((item, i) => {
              const suspended = isSusp(item);
              const b1 = item?.b1 || item?.b || '';
              const bs1 = item?.bs1 || item?.bs || '';
              const sid = item?.sid ?? i;
              return (
                <div key={sid} className="col-6 col-md-6">
                  <div className="fancy-tripple">
                    <div className="bet-table-row">
                      <div className="nation-name">
                        <p>{item?.nat ?? ''}</p>
                        <ExposureLine exposures={exposures} nat={item?.nat} sid={item?.sid} />
                      </div>
                      <button
                        type="button"
                        className="combo-info-btn d-none-desktop"
                        onClick={() => setOpenInfoSid((v) => (v === sid ? null : sid))}
                      >
                        <i className="fas fa-info-circle"></i>
                      </button>
                      <div className="combo-odds-wrap">
                        <div
                          data-title={suspended ? 'SUSPENDED' : 'OPEN'}
                          className={`bl-box back${suspended ? ' no-val suspended' : ''}`}
                          onClick={suspended ? undefined : () => onBet && onBet(item.sid, 'back', b1, item)}
                        >
                          <span className="d-block odds">{suspended ? '—' : b1}</span>
                          {!suspended && <span className="d-block">{formatAmount(bs1)}</span>}
                        </div>
                      </div>
                      <div className={`fancy-min-max${openInfoSid === sid ? ' combo-range-open' : ''}`}>
                        Min:<span>{formatAmount(item?.min ?? '')}</span> Max:<span>{formatAmount(item?.max ?? '')}</span>
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

// Combination selections read "<Player> and <Method>"
const isCombo = (s) =>
  ['combination', 'combo'].includes((s.subtype || '').toLowerCase()) ||
  / and /i.test(s.nat || '');

function BetTableGoal2({ gameData, onBet, exposures }) {
  const sub = gameData?.sub ?? [];

  const combos = sub.filter(isCombo);
  const rest = sub.filter((s) => !isCombo(s));

  let playersMarket;
  let methodsMarket;

  // Try discriminator fields first (goal API sends subtype: "player" / "goal")
  const byPlayer = rest.filter((s) => s.subtype === 'player');
  const byMethod = rest.filter((s) => s.subtype === 'goal' || s.subtype === 'method');

  if (byPlayer.length > 0 || byMethod.length > 0) {
    playersMarket = byPlayer;
    methodsMarket = byMethod;
  } else {
    // Split by position: find where the first exclusive method name starts
    const splitIndex = rest.findIndex((s) =>
      EXCLUSIVE_METHODS.includes((s.nat || '').toLowerCase().trim())
    );
    if (splitIndex > 0) {
      playersMarket = rest.slice(0, splitIndex);
      methodsMarket = rest.slice(splitIndex);
    } else {
      playersMarket = rest;
      methodsMarket = [];
    }
  }

  return (
    <>
      <BackLayMarket
        id="market-player"
        title="Who Will Goal Next?"
        items={playersMarket}
        onBet={onBet}
        exposures={exposures}
      />
      <BackLayMarket
        id="market-method"
        title="Method Of Next Goal"
        items={methodsMarket}
        onBet={onBet}
        exposures={exposures}
      />
      <ComboMarket
        id="market-combo"
        title="Method Of Combination Goal"
        items={combos}
        onBet={onBet}
        exposures={exposures}
      />
    </>
  );
}

export default BetTableGoal2;
