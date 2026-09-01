import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function ExposureSpan({ value }) {
  if (!value || value === 0) return <span className="d-none">0</span>;
  const cls = value < 0 ? 'book-red' : 'book-green';
  return <span className={cls}>{Math.round(value)}</span>;
}

const PLAYERS = ['Player 8', 'Player 9', 'Player 10', 'Player 11'];
const SINGLE_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

// ─── Section 1: Player back/lay + odd/even ────────────────────────────────────

const PlayerBackLayRow = memo(function PlayerBackLayRow({ name, item, onBet, exposures }) {
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

const PlayerOddEvenRow = memo(function PlayerOddEvenRow({ name, oddItem, evenItem, onBet, exposures }) {
  return (
    <div className="casino-box-row">
      <div className="casino-nation-name"><b>{name}</b></div>
      <div className="casino-bl-box">
        <div
          className={`back casino-bl-box-item${suspCls(oddItem)}`}
          onClick={isSusp(oddItem) ? undefined : () => onBet(oddItem.sid, 'back', oddItem.b, oddItem)}
        >
          <span className="casino-box-odd">{oddItem?.b ?? 0}</span>
          <ExposureSpan value={exposures?.[oddItem?.nat]} />
        </div>
        <div
          className={`back casino-bl-box-item${suspCls(evenItem)}`}
          onClick={isSusp(evenItem) ? undefined : () => onBet(evenItem.sid, 'back', evenItem.b, evenItem)}
        >
          <span className="casino-box-odd">{evenItem?.b ?? 0}</span>
          <ExposureSpan value={exposures?.[evenItem?.nat]} />
        </div>
      </div>
    </div>
  );
});

const Section1 = memo(function Section1({ sub, onBet, exposures }) {
  const find = (nat) => sub.find((s) => s.nat === nat);

  return (
    <>
    {/* Desktop: 2-column layout */}
    <div className="teen1daycasino-container d-none-small">
      <div className="teen1dayleft">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title"><div className="playerb"></div></div>
          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item"><b>Back</b></div>
            <div className="casino-bl-box-item"><b>Lay</b></div>
          </div>
        </div>
        {PLAYERS.map((name) => (
          <PlayerBackLayRow
            key={name}
            name={name}
            item={find(name)}
            onBet={onBet}
            exposures={exposures}
          />
        ))}
      </div>
      <div className="teen1daycenter"></div>
      <div className="teen1dayright">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title"><div className="playerb"></div></div>
          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item"><b>Odd</b></div>
            <div className="casino-bl-box-item"><b>Even</b></div>
          </div>
        </div>
        {PLAYERS.map((name) => {
          const num = name.replace('Player ', '');
          return (
            <PlayerOddEvenRow exposures={exposures}
              key={name}
              name={name}
              oddItem={find(`Player ${num} Odd`)}
              evenItem={find(`Player ${num} Even`)}
              onBet={onBet}
            />
          );
        })}
      </div>
    </div>
    {/* Mobile: single-column layout */}
    <div className="teen1daycasino-container d-none-big">
      <div className="casino-box-row">
        <div className="casino-nation-name no-border casino-bl-box-title"><div className="playerb"></div></div>
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item"><b>Back</b></div>
          <div className="casino-bl-box-item"><b>Lay</b></div>
        </div>
      </div>
      {PLAYERS.map((name) => (
        <PlayerBackLayRow
          key={name}
          name={name}
          item={find(name)}
          onBet={onBet}
          exposures={exposures}
        />
      ))}
      <div className="casino-box-row">
        <div className="casino-nation-name no-border casino-bl-box-title"><div className="playerb"></div></div>
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item"><b>Odd</b></div>
          <div className="casino-bl-box-item"><b>Even</b></div>
        </div>
      </div>
      {PLAYERS.map((name) => {
        const num = name.replace('Player ', '');
        return (
          <PlayerOddEvenRow exposures={exposures}
            key={name}
            name={name}
            oddItem={find(`Player ${num} Odd`)}
            evenItem={find(`Player ${num} Even`)}
            onBet={onBet}
          />
        );
      })}
      <div className="casino-box-row">
        <div className="casino-nation-name no-border casino-bl-box-title"><div className="playerb"></div></div>
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item"><b>Back</b></div>
          <div className="casino-bl-box-item"><b>Lay</b></div>
        </div>
      </div>
      <ColorBackLayRow label="Any 3 Card Black" item={find('Any Three Card Black')} onBet={onBet} />
      <ColorBackLayRow label="Any 3 Card Red" item={find('Any Three Card Red')} onBet={onBet} />
      <ColorBackLayRow label="Two Black Two Red" item={find('Two Black Two Red')} onBet={onBet} />
      <div className="casino-box-row">
        <div className="casino-nation-name no-border casino-bl-box-title"><div className="playerb"></div></div>
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item"><b>Back</b></div>
          <div className="casino-bl-box-item"><b>Back</b></div>
        </div>
      </div>
      <TotalDoubleRow label="8 & 9 Total" item={find('8 & 9 Total')} onBet={onBet} exposures={exposures} />
      <TotalDoubleRow label="10 & 11 Total" item={find('10 & 11 Total')} onBet={onBet} exposures={exposures} />
      <div className="text-center w-100 pr"><b>{(() => { const s = find('Single 1'); return s?.b || 9.5; })()}</b></div>
      <div className="cards32bextra">
        <div className="casino-bl-box">
          {SINGLE_LABELS.map((label) => {
            const sItem = find(`Single ${label}`);
            return (
              <div key={label} className={`casino-bl-box-item back${suspCls(sItem)}`} onClick={isSusp(sItem) ? undefined : () => onBet(sItem.sid, 'back', sItem.b, sItem)}>
                <span className="casino-box-odd">{label}</span>
                <ExposureSpan value={exposures?.[sItem?.nat]} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
});

// ─── Section 2: Color bets + Totals ──────────────────────────────────────────

const ColorBackLayRow = memo(function ColorBackLayRow({ label, item, onBet }) {
  return (
    <div className="casino-box-row">
      <div className="casino-nation-name"><b>{label}</b></div>
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

const TotalDoubleRow = memo(function TotalDoubleRow({ label, item, onBet, exposures }) {
  return (
    <div className="casino-box-row">
      <div className="casino-nation-name"><b>{label}</b></div>
      <div className="casino-bl-box">
        <div
          className={`back casino-bl-box-item${suspCls(item)}`}
          onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', item.b, item)}
        >
          <span className="casino-box-odd">{item?.b ?? 0}</span>
          <ExposureSpan value={exposures?.[item?.nat]} />
        </div>
        <div
          className={`back casino-bl-box-item${suspCls(item)}`}
          onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', item.b, item)}
        >
          <span className="casino-box-odd">{item?.b ?? 0}</span>
          <ExposureSpan value={exposures?.[item?.nat]} />
        </div>
      </div>
    </div>
  );
});

const Section2 = memo(function Section2({ sub, onBet, exposures }) {
  const find = (nat) => sub.find((s) => s.nat === nat);

  return (
    <div className="teen1daycasino-container mt-4 d-none-small">
      <div className="teen1dayleft">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title"><div className="playerb"></div></div>
          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item"><b>Back</b></div>
            <div className="casino-bl-box-item"><b>Lay</b></div>
          </div>
        </div>
        <ColorBackLayRow label="Any 3 Card Black" item={find('Any Three Card Black')} onBet={onBet} />
        <ColorBackLayRow label="Any 3 Card Red" item={find('Any Three Card Red')} onBet={onBet} />
        <ColorBackLayRow label="Two Black Two Red" item={find('Two Black Two Red')} onBet={onBet} />
      </div>
      <div className="teen1daycenter"></div>
      <div className="teen1dayright">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title"><div className="playerb"></div></div>
          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item"><b>Back</b></div>
            <div className="casino-bl-box-item"><b>Back</b></div>
          </div>
        </div>
        <TotalDoubleRow label="8 & 9 Total" item={find('8 & 9 Total')} onBet={onBet} exposures={exposures} />
        <TotalDoubleRow label="10 & 11 Total" item={find('10 & 11 Total')} onBet={onBet} exposures={exposures} />
      </div>
    </div>
  );
});

// ─── Section 3: Number strip ──────────────────────────────────────────────────

const Section3 = memo(function Section3({ sub, onBet, exposures }) {
  const find = (nat) => sub.find((s) => s.nat === nat);

  const singleOdd = SINGLE_LABELS.map((label) => {
    const item = find(`Single ${label}`);
    return item?.b ?? 0;
  });

  const headerOdd = singleOdd.find((v) => v > 0) || 9.5;

  return (
    <>
      <div className="text-center mt-4 d-none-small pr"><b>{headerOdd}</b></div>
      <div className="d-none-small cards32bextra mt-1">
        <div className="casino-bl-box">
          {SINGLE_LABELS.map((label) => {
            const item = find(`Single ${label}`);
            return (
              <div
                key={label}
                className={`casino-bl-box-item back${suspCls(item)}`}
                onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', item.b, item)}
              >
                <span className="casino-box-odd">{label}</span>
                <ExposureSpan value={exposures?.[item?.nat]} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});

// ─── Main export ──────────────────────────────────────────────────────────────

const BetTableCard32EU = memo(function BetTableCard32EU({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  return (
    <>
      <Section1 sub={sub} onBet={handleBet} exposures={exposures} />
      <Section2 sub={sub} onBet={handleBet} exposures={exposures} />
      <Section3 sub={sub} onBet={handleBet} exposures={exposures} />
    </>
  );
});

export default BetTableCard32EU;
