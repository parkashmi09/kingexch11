import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

// The backend stores one legacy exposure row per selection (keyed by its exact
// nat). Big Card / Zero Card carry a trailing count ("… - 2") that advances
// during the round, so a bet placed at "- 2" won't match once the row reads
// "- 3"; the exposure hook also publishes a trailing-number-stripped base key
// ("Big Card (7,8,9) -"), so fall back to that.
function bookValue(exposures, item) {
  if (!exposures || !item?.nat) return 0;
  const exact = exposures[item.nat];
  if (exact) return exact;
  const base = item.nat.match(/^(.+?)\s+\d+$/)?.[1];
  return (base && exposures[base]) || 0;
}

function ExposureSpan({ value, className = '' }) {
  const v = Number(value) || 0;
  if (v === 0) return null;
  return (
    <span className={className} style={{ color: v < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)', fontSize: '10px', fontWeight: 'bold' }}>
      {v < 0 ? Math.round(v) : `+${Math.round(v)}`}
    </span>
  );
}

const MOBILE_LABELS = ['Main Bet', 'Big Card', 'Zero Card', 'Any Zero Card'];
const SUBTYPES = ['race17', 'bigcard', 'zerocard', 'anyzero'];

const BetTableRace17 = memo(function BetTableRace17({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const items = SUBTYPES.map((st) => sub.find((s) => s.subtype === st));

  return (
    <>
      {/* Desktop */}
      <div className="row row5 d-none-small">
        {items.map((item, i) => (
          <div key={i} className="col-3">
            <div className="casino-box-row">
              <div className="casino-nation-name">
                <b>{item?.nat || MOBILE_LABELS[i]}</b>
              </div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(item)}`}
                  onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                >
                  <span className="casino-box-odd">{item?.b || 0}</span>
                </div>
                <div
                  className={`lay casino-bl-box-item${suspCls(item)}`}
                  onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
                >
                  <span className="casino-box-odd">{item?.l || 0}</span>
                </div>
              </div>
              <div className="casino-nation-name text-center">
                <ExposureSpan value={bookValue(exposures, item)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="row row5 d-none-big">
        {items.map((item, i) => (
          <div key={i} className="casino-bl-box">
            <div className="casino-bl-box-item casino-odds-name">
              <b>{MOBILE_LABELS[i]}</b>
              <ExposureSpan value={bookValue(exposures, item)} className="float-right" />
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
            >
              <span className="casino-box-odd">{item?.b || 0}</span>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
            >
              <span className="casino-box-odd">{item?.l || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
});

export default BetTableRace17;
