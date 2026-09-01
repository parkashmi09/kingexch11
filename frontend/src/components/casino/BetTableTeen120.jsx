import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

// Each runner is an independent back-only market → the backend stores one
// legacy exposure row per selection (keyed by its nat), holding the worst case
// (−stake) under the backed runner. Render it in the flex-book stub.
function Book({ value }) {
  const v = Number(value) || 0;
  if (v === 0) return <span className="d-block d-none">0</span>;
  return (
    <span className="d-block" style={{ color: v < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)', fontSize: '10px', fontWeight: 'bold' }}>
      {v < 0 ? Math.round(v) : `+${Math.round(v)}`}
    </span>
  );
}

const BetTableTeen120 = memo(function BetTableTeen120({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const player = findByNat(sub, 'Player');
  const dealer = findByNat(sub, 'Dealer');
  const tie = findByNat(sub, 'Tie');
  const pair = findByNat(sub, 'Pair');

  return (
    <div className="dtobx-top">
      <div
        className={`dragon-box${isSusp(player) ? ' suspended' : ''}`}
        onClick={isSusp(player) ? undefined : () => handleBet(player.sid, 'back', player.b, player)}
      >
        <div className="flex-book">
          <b>Player</b>
          <Book value={exposures?.[player?.nat]} />
        </div>
        <div className="text-center flex-odds">
          <span className="d-block"><b>{player?.b || 0}</b></span>
        </div>
      </div>

      <div
        className={`tiebox${isSusp(tie) ? ' suspended' : ''}`}
        onClick={isSusp(tie) ? undefined : () => handleBet(tie.sid, 'back', tie.b, tie)}
      >
        <div><b>Tie</b></div>
        <div className="text-center flex-odds">
          <span className="d-block"><b>{tie?.b || 0}</b></span>
          <Book value={exposures?.[tie?.nat]} />
        </div>
      </div>

      <div
        className={`tiger-box${isSusp(dealer) ? ' suspended' : ''}`}
        onClick={isSusp(dealer) ? undefined : () => handleBet(dealer.sid, 'back', dealer.b, dealer)}
      >
        <div className="flex-book">
          <b>Dealer</b>
          <Book value={exposures?.[dealer?.nat]} />
        </div>
        <div className="text-center flex-odds">
          <span className="d-block"><b>{dealer?.b || 0}</b></span>
        </div>
      </div>

      <div
        className={`pair-box${isSusp(pair) ? ' suspended' : ''}`}
        onClick={isSusp(pair) ? undefined : () => handleBet(pair.sid, 'back', pair.b, pair)}
      >
        <div><b>Pair</b></div>
        <div className="text-center flex-odds">
          <span className="d-block"><b>{pair?.b || 0}</b></span>
          <Book value={exposures?.[pair?.nat]} />
        </div>
      </div>
    </div>
  );
});

export default BetTableTeen120;
