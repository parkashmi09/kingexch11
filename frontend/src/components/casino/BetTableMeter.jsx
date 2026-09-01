import { memo } from 'react';

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

// cmeter1 is a multiplier game (max 12×), so the backend reserves −12×stake as
// the legacy exposure row under the backed fighter — that reserved lock is what
// we show (the real ±rate×stake P/L isn't known until the cards reveal).
function Book({ value }) {
  const v = Number(value) || 0;
  if (v === 0) return <div className="text-center d-none">0</div>;
  return (
    <div className={`text-center ${v < 0 ? 'book-red' : 'book-green'}`}>{Math.round(v)}</div>
  );
}

const BetTableMeter = memo(function BetTableMeter({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const fighterA = findByNat(sub, 'Fighter A');
  const fighterB = findByNat(sub, 'Fighter B');

  return (
    <div className="text-right w-100 pr">
      <div className="meter-btns">
        <div className="meter-btn">
          <div className={`meter-btn-box${isSusp(fighterA) ? ' suspended' : ''}`}>
            <button
              className="btn btn-fighter-1"
              onClick={isSusp(fighterA) ? undefined : () => handleBet(fighterA.sid, 'back', fighterA.b || 0, fighterA)}
            >
              Fighter A
              <img src="/assets/front/img/fight.png" alt="Fight" />
            </button>
          </div>
          <Book value={exposures?.[fighterA?.nat]} />
        </div>
        <div className="meter-btn">
          <div className={`meter-btn-box${isSusp(fighterB) ? ' suspended' : ''}`}>
            <button
              className="btn btn-fighter-2"
              onClick={isSusp(fighterB) ? undefined : () => handleBet(fighterB.sid, 'back', fighterB.b || 0, fighterB)}
            >
              <img src="/assets/front/img/fight.png" alt="Fight" />
              Fighter B
            </button>
          </div>
          <Book value={exposures?.[fighterB?.nat]} />
        </div>
      </div>
    </div>
  );
});

export default BetTableMeter;
