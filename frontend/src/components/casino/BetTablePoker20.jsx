import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function findBySid(sub, sid) {
  return sub.find((s) => s.sid === sid);
}

// Player A sids: 11-19, Player B sids: 21-29
// Bet type rows in order: Winner, One Pair, Two Pair, Three of a Kind, Straight, Flush, Full House, Four of a Kind, Straight Flush
const BET_TYPES = [
  { label: 'Winner',          sidA: 11, sidB: 21 },
  { label: 'One Pair',        sidA: 12, sidB: 22 },
  { label: 'Two Pair',        sidA: 13, sidB: 23 },
  { label: 'Three of a Kind', sidA: 14, sidB: 24 },
  { label: 'Straight',        sidA: 15, sidB: 25 },
  { label: 'Flush',           sidA: 16, sidB: 26 },
  { label: 'Full House',      sidA: 17, sidB: 27 },
  { label: 'Four of a Kind',  sidA: 18, sidB: 28 },
  { label: 'Straight Flush',  sidA: 19, sidB: 29 },
];

// Desktop groups of 3 bet types each
const DESKTOP_GROUPS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];

function ExposureSpan({ value }) {
  if (!value || value === 0) return <span className="d-none">0</span>;
  return <span className={value < 0 ? 'book-red' : 'book-green'}>{Math.round(value)}</span>;
}

// The feed gives Player A (sids 11-19) and Player B (sids 21-29) the SAME `nat`
// ("Winner", "One Pair", …), so nat alone can't tell the two runners apart. The
// selection that settlement (isPoker20Winner) and the exposure row are keyed by
// must carry the side: the Winner row settles as "Player A"/"Player B"; every
// hand row settles as "<Hand> A"/"<Hand> B" (e.g. "One Pair A", "Full House B").
const selFor = (label, side) => (label === 'Winner' ? `Player ${side}` : `${label} ${side}`);

const BetTablePoker20 = memo(function BetTablePoker20({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const items = BET_TYPES.map(({ label, sidA, sidB }) => ({
    label,
    itemA: findBySid(sub, sidA),
    itemB: findBySid(sub, sidB),
  }));

  return (
    <>
      {/* Desktop layout */}
      <div className="poker20casino-container d-none-small">
        <div className="poker20left">
          {DESKTOP_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-1' : ''}>
              <div className="casino-bl-box casino-bl-box-title">
                {group.map((idx) => (
                  <div key={idx} className="casino-bl-box-item">
                    <span>{items[idx].label}</span>
                  </div>
                ))}
              </div>
              <div className="casino-bl-box">
                {group.map((idx) => {
                  const { itemA, label } = items[idx];
                  const sel = selFor(label, 'A');
                  return (
                    <div
                      key={idx}
                      className={`back casino-bl-box-item${suspCls(itemA)}`}
                      onClick={isSusp(itemA) ? undefined : () => handleBet(itemA.sid, 'back', itemA.b, { ...itemA, nat: sel })}
                    >
                      <span className="casino-box-odd">{itemA?.b || 0}</span>
                      <ExposureSpan value={exposures?.[sel]} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="poker20center"></div>

        <div className="poker20right">
          {DESKTOP_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-1' : ''}>
              <div className="casino-bl-box casino-bl-box-title">
                {group.map((idx) => (
                  <div key={idx} className="casino-bl-box-item">
                    <span>{items[idx].label}</span>
                  </div>
                ))}
              </div>
              <div className="casino-bl-box">
                {group.map((idx) => {
                  const { itemB, label } = items[idx];
                  const sel = selFor(label, 'B');
                  return (
                    <div
                      key={idx}
                      className={`back casino-bl-box-item${suspCls(itemB)}`}
                      onClick={isSusp(itemB) ? undefined : () => handleBet(itemB.sid, 'back', itemB.b, { ...itemB, nat: sel })}
                    >
                      <span className="casino-box-odd">{itemB?.b || 0}</span>
                      <ExposureSpan value={exposures?.[sel]} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="poker20casino-container d-none-big">
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item"></div>
          <div className="casino-bl-box-item playera">Player A</div>
          <div className="casino-bl-box-item playerb">Player B</div>
        </div>
        {items.map(({ label, itemA, itemB }, idx) => {
          const selA = selFor(label, 'A');
          const selB = selFor(label, 'B');
          return (
          <div key={idx} className="casino-bl-box">
            <div className="casino-bl-box-item casino-odds-name">
              <span>{label}</span>
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(itemA)}`}
              onClick={isSusp(itemA) ? undefined : () => handleBet(itemA.sid, 'back', itemA.b, { ...itemA, nat: selA })}
            >
              <span className="casino-box-odd">{itemA?.b || 0}</span>
              <ExposureSpan value={exposures?.[selA]} />
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(itemB)}`}
              onClick={isSusp(itemB) ? undefined : () => handleBet(itemB.sid, 'back', itemB.b, { ...itemB, nat: selB })}
            >
              <span className="casino-box-odd">{itemB?.b || 0}</span>
              <ExposureSpan value={exposures?.[selB]} />
            </div>
          </div>
          );
        })}
      </div>
    </>
  );
});

export default BetTablePoker20;
