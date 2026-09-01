import { memo } from 'react';

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

const PLAYERS = ['Player A', 'Player B', 'Player C', 'Player D'];

// race2 is a four-runner book: the backend writes one exposure row per player
// (backed runner +profit, every other runner −stake), so each name shows its
// signed P/L for that outcome.
const BetTableRace2 = memo(function BetTableRace2({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const players = PLAYERS.map((name) => sub.find((s) => s.nat === name));

  return (
    <div className="container-fluid container-fluid-5">
      {/* Desktop layout */}
      <div className="row d-none-small">
        {players.map((item, i) => (
          <div key={i} className="col-3">
            <div className="casino-box-row">
              <div className="casino-nation-name"><b>{PLAYERS[i]}</b></div>
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
              {/* Book (signed P/L for this runner) sits AFTER the odds boxes */}
              <div className="casino-nation-name text-center">
                <ExposureSpan value={exposures?.[PLAYERS[i]]} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile layout */}
      <div className="row row5 d-none-big">
        {players.map((item, i) => (
          <div key={i} className="casino-bl-box">
            <div className="casino-bl-box-item casino-odds-name">
              <b>{PLAYERS[i]}</b>
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
            {/* Book (signed P/L for this runner) sits AFTER the odds boxes */}
            <div className="casino-bl-box-item casino-odds-name text-center">
              <ExposureSpan value={exposures?.[PLAYERS[i]]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default BetTableRace2;
