import { memo } from 'react';

function findByNatAndType(sub, nat, subtype) {
  return sub.find((s) => s.nat === nat && s.subtype === subtype);
}

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  if (!item) return true;
  if (item.gstatus === 'SUSPENDED' || item.gstatus === '0') return true;
  // Card items have odds array — check that instead of top-level b/l
  if (item.odds && Array.isArray(item.odds)) return false;
  if ((!item.b || item.b === 0) && (!item.l || item.l === 0)) return true;
  return false;
}

function getCardOdd(card) {
  const odds = card?.odds;
  if (!odds || !Array.isArray(odds)) return { odd: card?.b || 0, even: card?.l || 0 };
  const oddItem = odds.find((o) => o.nat === 'Odd') || odds[0];
  const evenItem = odds.find((o) => o.nat === 'Even') || odds[1];
  return { odd: oddItem?.b || 0, even: evenItem?.b || 0 };
}

function isCardSusp(card) {
  if (!card) return true;
  if (card.gstatus === 'SUSPENDED' || card.gstatus === '0') return true;
  const { odd, even } = getCardOdd(card);
  return odd === 0 && even === 0;
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function ExposureSpan({ value, className }) {
  if (!value || value === 0) return <span className={`mr-2 d-none`}></span>;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className={`mr-2`} style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
      {value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
    </span>
  );
}

function ExposureSpanCon({ value }) {
  if (!value || value === 0) return <span className="mr-2 d-none">0</span>;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className="mr-2" style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
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

  const cardItems = [];
  for (let i = 1; i <= 6; i++) {
    cardItems.push(findByNat(sub, `Card ${i}`));
  }

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
              <ExposureSpanCon value={exposures?.['Player A Consecutive'] ?? exposures?.['player a consecutive']} />
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
              <ExposureSpanCon value={exposures?.['Player B Consecutive'] ?? exposures?.['player b consecutive']} />
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

      {/* ODD/EVEN Cards — the feed nests BOTH prices in the card item's odds[]
          array (Odd/Even are each BACK prices), so every bet here is a back on
          "Card N Odd" / "Card N Even". The old payload sent the bare "Card N"
          nat with type back/lay standing in for odd/even — settlement expects
          the suffixed selection, so those bets could never settle. */}
      <div className="teen1dayother">
        {/* Header */}
        <div className="casino-box-row">
          <div className="casino-nation-name no-border"></div>
          {cardItems.map((c, i) => (
            <div key={i} className="casino-bl-box">
              <div className="casino-bl-box-item"><b>Card {i + 1}</b></div>
            </div>
          ))}
        </div>
        {/* Odd row */}
        <div className="casino-box-row">
          <div className="casino-nation-name"><b>Odd</b></div>
          {cardItems.map((c, i) => {
            const { odd } = getCardOdd(c);
            const susp = isCardSusp(c);
            return (
              <div key={i} className="casino-bl-box">
                <div className={`back casino-bl-box-item${susp ? ' suspended' : ''}`} onClick={susp ? undefined : () => onBet(c.sid, 'back', odd, { ...c, nat: `${c.nat} Odd`, b: odd, etype: 'fancy' })}>
                  <span className="casino-box-odd">{susp ? '' : odd}</span>
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
            const { even } = getCardOdd(c);
            const susp = isCardSusp(c);
            return (
              <div key={i} className="casino-bl-box">
                <div className={`back casino-bl-box-item${susp ? ' suspended' : ''}`} onClick={susp ? undefined : () => onBet(c.sid, 'back', even, { ...c, nat: `${c.nat} Even`, b: even, etype: 'fancy' })}>
                  <span className="casino-box-odd">{susp ? '' : even}</span>
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
  const oddEvenCards = [];
  for (let i = 1; i <= 6; i++) {
    const c = sub.find((s) => s.nat === `Card ${i}`);
    if (c) oddEvenCards.push(c);
  }

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

      {/* CONSECUTIVE */}
      <div className="casino-box-row">
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item casino-card-img"><b>Consecutive</b></div>
          <div className="casino-bl-box-item"><b>Back</b></div>
          <div className="casino-bl-box-item"><b>Lay</b></div>
        </div>
        {consecutive.map((item) => (
          <div key={item.sid} className="casino-bl-box">
            <div className="casino-bl-box-item casino-odds-name casino-nation-name">
              <span>{item.nat}</span>
              <span className="float-right">
                {/* Consecutive rows are stored as "<runner> Consecutive" — no bare-name fallback */}
                <ExposureSpan value={exposures?.[`${item.nat} Consecutive`] ?? exposures?.[`${item.nat} Consecutive`.toLowerCase()]} />
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

      {/* CARDS ODD/EVEN */}
      <div className="casino-box-row teen1dayodev">
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item casino-card-img"><b>Cards</b></div>
          <div className="casino-bl-box-item"><b>Odd</b></div>
          <div className="casino-bl-box-item"><b>Even</b></div>
        </div>
        {oddEvenCards.map((item) => {
          const { odd, even } = getCardOdd(item);
          const susp = isCardSusp(item);
          // Both cells are BACK bets on their own suffixed selection (see the
          // desktop layout note) — exposure rows are keyed the same way.
          const expOdd = exposures?.[`${item.nat} Odd`] || 0;
          const expEven = exposures?.[`${item.nat} Even`] || 0;
          return (
            <div key={item.sid} className="casino-bl-box">
              <div className="casino-bl-box-item casino-odds-name casino-nation-name">
                <span>{item.nat}</span>
              </div>
              <div className={`back casino-bl-box-item${susp ? ' suspended' : ''}`} onClick={susp ? undefined : () => onBet(item.sid, 'back', odd, { ...item, nat: `${item.nat} Odd`, b: odd, etype: 'fancy' })}>
                <span className="casino-box-odd">{susp ? '' : odd}</span>
                {expOdd !== 0 ? <span className={expOdd < 0 ? 'book-red' : 'book-green'}>{Math.round(expOdd)}</span> : <span className="d-none">0</span>}
              </div>
              <div className={`back casino-bl-box-item${susp ? ' suspended' : ''}`} onClick={susp ? undefined : () => onBet(item.sid, 'back', even, { ...item, nat: `${item.nat} Even`, b: even, etype: 'fancy' })}>
                <span className="casino-box-odd">{susp ? '' : even}</span>
                {expEven !== 0 ? <span className={expEven < 0 ? 'book-red' : 'book-green'}>{Math.round(expEven)}</span> : <span className="d-none">0</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Main export ─────────────────────────────────────────────────────────────

const BetTableTeen1Day = memo(function BetTableTeen1Day({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  return (
    <>
      <DesktopLayout sub={sub} onBet={handleBet} exposures={exposures} />
      <MobileLayout sub={sub} onBet={handleBet} exposures={exposures} />
    </>
  );
});

export default BetTableTeen1Day;
