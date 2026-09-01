import { memo, useMemo } from 'react';

function findByNatAndType(sub, nat, subtype) {
  return sub.find((s) => s.nat === nat && s.subtype === subtype);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

// Extract Odd/Even odds from the nested odds array on card items
function getCardOdds(cardItem) {
  const odds = cardItem?.odds || [];
  const oddEntry = odds.find((o) => o.nat === 'Odd') || odds[0];
  const evenEntry = odds.find((o) => o.nat === 'Even') || odds[1];
  return {
    oddVal: oddEntry?.b || 0,
    evenVal: evenEntry?.b || 0,
  };
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
  const playerA = findByNatAndType(sub, 'Player A', 'teen');
  const playerB = findByNatAndType(sub, 'Player B', 'teen');
  const conA = findByNatAndType(sub, 'Player A', 'con');
  const conB = findByNatAndType(sub, 'Player B', 'con');

  const cardItems = useMemo(() => {
    const items = [];
    for (let i = 1; i <= 6; i++) {
      items.push(findByNatAndType(sub, `Card ${i}`, 'oddeven'));
    }
    return items;
  }, [sub]);

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
        <div className="casino-box-row">
          <div className="casino-nation-name casino-card-img"><b>Consecutive</b>
            <div className="float-right">
              {/* Consecutive is its own market — the backend stores its row as
                  "<runner> Consecutive"; falling back to the bare runner name
                  would show the Main market's figure here. */}
              <ExposureSpan value={exposures?.['Player A Consecutive'] ?? exposures?.['player a consecutive']} />
            </div>
          </div>
          <div className="casino-bl-box">
            <div className={`back casino-bl-box-item${suspCls(conA)}`} onClick={isSusp(conA) ? undefined : () => onBet(conA.sid, 'back', conA.b, conA)}>
              <span className="casino-box-odd">{conA?.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(conA)}`} onClick={isSusp(conA) ? undefined : () => onBet(conA.sid, 'lay', conA.l, conA)}>
              <span className="casino-box-odd">{conA?.l || 0}</span>
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
        <div className="casino-box-row">
          <div className="casino-nation-name casino-card-img"><b>Consecutive</b>
            <div className="float-right">
              <ExposureSpan value={exposures?.['Player B Consecutive'] ?? exposures?.['player b consecutive']} />
            </div>
          </div>
          <div className="casino-bl-box">
            <div className={`back casino-bl-box-item${suspCls(conB)}`} onClick={isSusp(conB) ? undefined : () => onBet(conB.sid, 'back', conB.b, conB)}>
              <span className="casino-box-odd">{conB?.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(conB)}`} onClick={isSusp(conB) ? undefined : () => onBet(conB.sid, 'lay', conB.l, conB)}>
              <span className="casino-box-odd">{conB?.l || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ODD/EVEN Cards */}
      <div className="teen1dayother">
        {/* Header */}
        <div className="casino-box-row">
          <div className="casino-nation-name no-border"></div>
          {cardItems.map((_, i) => (
            <div key={i} className="casino-bl-box">
              <div className="casino-bl-box-item"><b>Card {i + 1}</b></div>
            </div>
          ))}
        </div>
        {/* Odd row */}
        <div className="casino-box-row">
          <div className="casino-nation-name"><b>Odd</b></div>
          {cardItems.map((c, i) => {
            const { oddVal } = getCardOdds(c);
            return (
              <div key={i} className="casino-bl-box">
                <div className={`back casino-bl-box-item${suspCls(c)}`} onClick={isSusp(c) ? undefined : () => onBet(c.sid, 'back', oddVal, { ...c, nat: `${c.nat} Odd`, b: oddVal })}>
                  <span className="casino-box-odd">{oddVal}</span>
                  <ExposureSpan value={exposures?.[`Card ${i + 1} Odd`]} />
                </div>
              </div>
            );
          })}
        </div>
        {/* Even row */}
        <div className="casino-box-row">
          <div className="casino-nation-name"><b>Even</b></div>
          {cardItems.map((c, i) => {
            const { evenVal } = getCardOdds(c);
            return (
              <div key={i} className="casino-bl-box">
                <div className={`back casino-bl-box-item${suspCls(c)}`} onClick={isSusp(c) ? undefined : () => onBet(c.sid, 'back', evenVal, { ...c, nat: `${c.nat} Even`, b: evenVal })}>
                  <span className="casino-box-odd">{evenVal}</span>
                  <ExposureSpan value={exposures?.[`Card ${i + 1} Even`]} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// ─── Mobile layout (d-none-big) ──────────────────────────────────────────────

const MobileLayout = memo(function MobileLayout({ sub, onBet, exposures }) {
  const mainPlayers = sub.filter((s) => s.subtype === 'teen');
  const consecutive = sub.filter((s) => s.subtype === 'con');
  const oddEvenCards = useMemo(() => {
    const items = [];
    for (let i = 1; i <= 6; i++) {
      const c = findByNatAndType(sub, `Card ${i}`, 'oddeven');
      if (c) items.push(c);
    }
    return items;
  }, [sub]);

  return (
    <div className="teen1daycasino-container d-none-big">
      {/* MAIN */}
      <div className="casino-box-row">
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item"><b>Main</b></div>
          <div className="casino-bl-box-item"><b>Back</b></div>
          <div className="casino-bl-box-item"><b>Lay</b></div>
        </div>
        {mainPlayers.map((item) => (
          <div key={item.sid} className="casino-bl-box">
            <div className="casino-bl-box-item casino-odds-name casino-nation-name">
              <span>{item.nat}</span>
              <span className={`float-right${exposures?.[item.nat] ? '' : ' d-none'}`}>
                {exposures?.[item.nat] ? <ExposureSpan value={exposures[item.nat]} /> : null}
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

      {/* CONSECUTIVE */}
      <div className="casino-box-row">
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item casino-card-img"><b>Consecutive</b></div>
          <div className="casino-bl-box-item"><b>Back</b></div>
          <div className="casino-bl-box-item"><b>Lay</b></div>
        </div>
        {consecutive.map((item) => {
          // Consecutive rows are stored as "<runner> Consecutive" — no bare-name fallback
          const conExp = exposures?.[`${item.nat} Consecutive`] ?? exposures?.[`${item.nat} Consecutive`.toLowerCase()];
          return (
          <div key={item.sid} className="casino-bl-box">
            <div className="casino-bl-box-item casino-odds-name casino-nation-name">
              <span>{item.nat}</span>
              <span className={`float-right${conExp ? '' : ' d-none'}`}>
                {conExp ? <ExposureSpan value={conExp} /> : '0'}
              </span>
            </div>
            <div className={`back casino-bl-box-item${suspCls(item)}`} onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', item.b, item)}>
              <span className="casino-box-odd">{item.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(item)}`} onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'lay', item.l, item)}>
              <span className="casino-box-odd">{item.l || 0}</span>
            </div>
          </div>
          );
        })}
      </div>

      {/* CARDS ODD/EVEN */}
      <div className="casino-box-row teen1dayodev">
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item casino-card-img"><b>Cards</b></div>
          <div className="casino-bl-box-item"><b>Odd</b></div>
          <div className="casino-bl-box-item"><b>Even</b></div>
        </div>
        {oddEvenCards.map((item) => {
          const { oddVal, evenVal } = getCardOdds(item);
          return (
            <div key={item.sid} className="casino-bl-box">
              <div className="casino-bl-box-item casino-odds-name casino-nation-name">
                <span>{item.nat}</span>
              </div>
              <div className={`back casino-bl-box-item${suspCls(item)}`} onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', oddVal, { ...item, nat: `${item.nat} Odd`, b: oddVal })}>
                <span className="casino-box-odd">{oddVal}</span>
                <ExposureSpan value={exposures?.[`${item.nat} Odd`]} />
              </div>
              <div className={`back casino-bl-box-item${suspCls(item)}`} onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', evenVal, { ...item, nat: `${item.nat} Even`, b: evenVal })}>
                <span className="casino-box-odd">{evenVal}</span>
                <ExposureSpan value={exposures?.[`${item.nat} Even`]} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Main export ─────────────────────────────────────────────────────────────

const BetTableTeen62 = memo(function BetTableTeen62({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  return (
    <>
      <DesktopLayout sub={sub} onBet={handleBet} exposures={exposures} />
      <MobileLayout sub={sub} onBet={handleBet} exposures={exposures} />
    </>
  );
});

export default BetTableTeen62;
