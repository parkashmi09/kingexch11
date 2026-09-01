import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

/**
 * Find a sub item by nat. API sends nat as "Tiger Winner", "Lion Pair", etc.
 */
function findItem(sub, player, betLabel) {
  const nat = `${player} ${betLabel}`;
  return sub.find((s) => s.nat === nat);
}

const BET_TYPES = [
  { label: 'Winner' },
  { label: 'Pair' },
  { label: 'Flush' },
  { label: 'Straight' },
  { label: 'Trio' },
  { label: 'Straight Flush' },
];

const PLAYERS = ['Tiger', 'Lion', 'Dragon'];

function ExposureSpan({ value }) {
  if (!value || value === 0) return null;
  // Use the shared book-red/book-green classes (like every other casino table and
  // this game's own mobile layout) so the profit/loss colour + size match. The old
  // inline `casino-box-expo` span (unstyled class + a 10px-bold #00ff00 and a
  // "+X.XX" format) rendered a visibly different green from the standard book.
  return <span className={value < 0 ? 'book-red' : 'book-green'}>{Math.round(value)}</span>;
}

const BetTableTeenpattiTest = memo(function BetTableTeenpattiTest({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  return (
    <>
      {/* Desktop layout */}
      <div className="teen1daycasino-container d-none-small">
        <div className="teentestother">
          <div className="casino-box-row">
            <div className="casino-nation-name no-border"></div>
            {BET_TYPES.map((bt) => (
              <div key={bt.label} className="casino-bl-box">
                <div className="casino-bl-box-item"><b>{bt.label}</b></div>
              </div>
            ))}
          </div>
          {PLAYERS.map((player) => (
            <div key={player} className="casino-box-row">
              <div className="casino-nation-name"><b>{player}</b></div>
              {BET_TYPES.map((bt) => {
                const item = findItem(sub, player, bt.label);
                const susp = isSusp(item);
                return (
                  <div key={bt.label} className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item${suspCls(item)}`}
                      onClick={susp ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                    >
                      <span className="casino-box-odd">{item?.b || 0}</span>
                      <ExposureSpan value={exposures?.[item?.nat]} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile layout — transposed: players as columns, bet types as rows */}
      <div className="teen1daycasino-container d-none-big">
        <div className="casino-box-row teen1dayodev">
          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item casino-card-img"></div>
            {PLAYERS.map((p) => (
              <div key={p} className="casino-bl-box-item"><b>{p}</b></div>
            ))}
          </div>
          {BET_TYPES.map((bt) => (
            <div key={bt.label} className="casino-bl-box">
              <div className="casino-bl-box-item casino-odds-name"><span>{bt.label}</span></div>
              {PLAYERS.map((player) => {
                const item = findItem(sub, player, bt.label);
                const susp = isSusp(item);
                const exp = exposures?.[item?.nat] || 0;
                return (
                  <div
                    key={player}
                    className={`back casino-bl-box-item${suspCls(item)}`}
                    onClick={susp ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                  >
                    <span className="casino-box-odd">{item?.b || 0}</span>
                    {exp !== 0 ? <span className={exp < 0 ? 'book-red' : 'book-green'}>{Math.round(exp)}</span> : <span className="d-none">0</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
});

export default BetTableTeenpattiTest;
