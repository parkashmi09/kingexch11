import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function ExposureSpan({ value }) {
  if (!value || value === 0) return <span className="mr-2 d-none"></span>;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className="mr-2" style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
      {value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
    </span>
  );
}

const PLAYERS = ['Player 8', 'Player 9', 'Player 10', 'Player 11'];

// ─── Mobile layout (d-none-big) ──────────────────────────────────────────────

const MobileLayout = memo(function MobileLayout({ sub, onBet, exposures }) {
  return (
    <div className="teen1daycasino-container d-none-big">
      {PLAYERS.map((name) => {
        const item = sub.find((s) => s.nat === name);
        return (
          <div key={name} className="casino-box-row">
            <div className="casino-nation-name"><b>{name}</b>
              <div className="float-right">
                <ExposureSpan value={exposures?.[name]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(item)}`}
                onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', item.b, item)}
              >
                <span className="casino-box-odd">{item?.b ?? 0}</span>
              </div>
              <div
                className={`lay casino-bl-box-item${suspCls(item)}`}
                onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'lay', item.l, item)}
              >
                <span className="casino-box-odd">{item?.l ?? 0}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// ─── Desktop layout (d-none-small) ───────────────────────────────────────────

const PlayerRow = memo(function PlayerRow({ name, item, onBet, exposures }) {
  return (
    <div className="casino-box-row">
      <div className="casino-nation-name"><b>{name}</b>
        <div className="float-right">
          <ExposureSpan value={exposures?.[name]} />
        </div>
      </div>
      <div className="casino-bl-box">
        <div
          className={`back casino-bl-box-item${suspCls(item)}`}
          onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', item.b, item)}
        >
          <span className="casino-box-odd">{item?.b ?? 0}</span>
        </div>
        <div
          className={`lay casino-bl-box-item${suspCls(item)}`}
          onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'lay', item.l, item)}
        >
          <span className="casino-box-odd">{item?.l ?? 0}</span>
        </div>
      </div>
    </div>
  );
});

const DesktopLayout = memo(function DesktopLayout({ sub, onBet, exposures }) {
  const find = (name) => sub.find((s) => s.nat === name);

  return (
    <div className="teen1daycasino-container d-none-small">
      <div className="teen1dayleft">
        <PlayerRow name="Player 8"  item={find('Player 8')}  onBet={onBet} exposures={exposures} />
        <PlayerRow name="Player 9"  item={find('Player 9')}  onBet={onBet} exposures={exposures} />
      </div>
      <div className="teen1daycenter"></div>
      <div className="teen1dayright">
        <PlayerRow name="Player 10" item={find('Player 10')} onBet={onBet} exposures={exposures} />
        <PlayerRow name="Player 11" item={find('Player 11')} onBet={onBet} exposures={exposures} />
      </div>
    </div>
  );
});

// ─── Main export ─────────────────────────────────────────────────────────────

const BetTableCard32 = memo(function BetTableCard32({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  return (
    <>
      <DesktopLayout sub={sub} onBet={handleBet} exposures={exposures} />
      <MobileLayout  sub={sub} onBet={handleBet} exposures={exposures} />
    </>
  );
});

export default BetTableCard32;
