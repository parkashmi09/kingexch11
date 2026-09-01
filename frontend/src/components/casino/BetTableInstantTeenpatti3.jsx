import { memo } from 'react';

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function ExposureSpan({ value }) {
  if (!value || value === 0) return null;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className="casino-box-expo" style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
      {value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
    </span>
  );
}

// ─── Desktop layout (d-none-small) ───────────────────────────────────────────

const DesktopLayout = memo(function DesktopLayout({ sub, onBet, exposures }) {
  const playerA = findByNat(sub, 'Player A');
  const playerB = findByNat(sub, 'Player B');

  return (
    <div className="teen1daycasino-container d-none-small">
      {/* LEFT: Player A */}
      <div className="teen1dayleft">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title">
            <div className="playera">Player A</div>
          </div>
          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item"><b>Back</b></div>
            <div className="casino-bl-box-item"><b>Lay</b></div>
          </div>
        </div>
        <div className="casino-box-row">
          <div className="casino-nation-name"><b>Main</b>
            <div className="float-right">
              <ExposureSpan value={exposures?.['Player A']} />
            </div>
          </div>
          <div className="casino-bl-box">
            <div className={`back casino-bl-box-item${suspCls(playerA)}`} onClick={isSusp(playerA) ? undefined : () => onBet(playerA.sid, 'back', playerA.b, playerA)}>
              <span className="casino-box-odd">{playerA?.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(playerA)}`} onClick={isSusp(playerA) ? undefined : () => onBet(playerA.sid, 'lay', playerA.l, playerA)}>
              <span className="casino-box-odd">{playerA?.l || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER divider */}
      <div className="teen1daycenter"></div>

      {/* RIGHT: Player B */}
      <div className="teen1dayright">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title">
            <div className="playerb">Player B</div>
          </div>
          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item"><b>Back</b></div>
            <div className="casino-bl-box-item"><b>Lay</b></div>
          </div>
        </div>
        <div className="casino-box-row">
          <div className="casino-nation-name"><b>Main</b>
            <div className="float-right">
              <ExposureSpan value={exposures?.['Player B']} />
            </div>
          </div>
          <div className="casino-bl-box">
            <div className={`back casino-bl-box-item${suspCls(playerB)}`} onClick={isSusp(playerB) ? undefined : () => onBet(playerB.sid, 'back', playerB.b, playerB)}>
              <span className="casino-box-odd">{playerB?.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(playerB)}`} onClick={isSusp(playerB) ? undefined : () => onBet(playerB.sid, 'lay', playerB.l, playerB)}>
              <span className="casino-box-odd">{playerB?.l || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Mobile layout (d-none-big) ──────────────────────────────────────────────

const MobileLayout = memo(function MobileLayout({ sub, onBet, exposures }) {
  const playerA = findByNat(sub, 'Player A');
  const playerB = findByNat(sub, 'Player B');
  const players = [playerA, playerB].filter(Boolean);

  return (
    <div className="teen1daycasino-container d-none-big">
      <div className="casino-box-row">
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item"><b>Main</b></div>
          <div className="casino-bl-box-item"><b>Back</b></div>
          <div className="casino-bl-box-item"><b>Lay</b></div>
        </div>
        {players.map((item) => (
          <div key={item.sid} className="casino-bl-box">
            <div className="casino-bl-box-item casino-odds-name casino-nation-name">
              <span>{item.nat}</span>
              <span className="float-right">
                <ExposureSpan value={exposures?.[item.nat]} />
              </span>
            </div>
            <div className={`back casino-bl-box-item${suspCls(item)}`} onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', item.b, item)}>
              <span className="casino-box-odd">{item.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(item)}`} onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'lay', item.l, item)}>
              <span className="casino-box-odd">{item.l || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ─── Main export ─────────────────────────────────────────────────────────────

const BetTableInstantTeenpatti3 = memo(function BetTableInstantTeenpatti3({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  return (
    <>
      <DesktopLayout sub={sub} onBet={handleBet} exposures={exposures} />
      <MobileLayout sub={sub} onBet={handleBet} exposures={exposures} />
    </>
  );
});

export default BetTableInstantTeenpatti3;
