import { memo } from 'react';

function findBySid(sub, sid) {
  return sub.find((s) => s.sid === sid);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0' || item.b === 0;
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

// ─── Desktop layout (d-none-small) ───────────────────────────────────────────

function ExpoSpan({ exposures, name }) {
  const exp = exposures?.[name] || 0;
  if (exp === 0) return <span className="d-none"></span>;
  return <span className={`mr-2 ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</span>;
}

const DesktopLayout = memo(function DesktopLayout({ sub, onBet, exposures }) {
  const playerA = findBySid(sub, 1);
  const playerB = findBySid(sub, 2);
  const under21 = findBySid(sub, 3);
  const over21  = findBySid(sub, 4);

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
          <div className="casino-nation-name">
            <b>Main</b>
            <div className="float-right"><ExpoSpan exposures={exposures} name="Player A" /></div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(playerA)}`}
              onClick={isSusp(playerA) ? undefined : () => onBet(playerA.sid, 'back', playerA.b, playerA)}
            >
              <span className="casino-box-odd">{playerA?.b || 0}</span>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(playerA)}`}
              onClick={isSusp(playerA) ? undefined : () => onBet(playerA.sid, 'lay', playerA.l, playerA)}
            >
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
          <div className="casino-nation-name">
            <b>Main</b>
            <div className="float-right"><ExpoSpan exposures={exposures} name="Player B" /></div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(playerB)}`}
              onClick={isSusp(playerB) ? undefined : () => onBet(playerB.sid, 'back', playerB.b, playerB)}
            >
              <span className="casino-box-odd">{playerB?.b || 0}</span>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(playerB)}`}
              onClick={isSusp(playerB) ? undefined : () => onBet(playerB.sid, 'lay', playerB.l, playerB)}
            >
              <span className="casino-box-odd">{playerB?.l || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Under/Over section */}
      <div className="teen2uo">
        <div className="teen1dayleft"></div>
        <div className="teen1daycenter"></div>
        <div className="teen1dayright">
          <div className="casino-box-row d-none-big">
            <div className="casino-nation-name no-border casino-bl-box-title">
              <div className="playerb">Player B</div>
            </div>
            <div className="casino-bl-box casino-bl-box-title"></div>
          </div>
          <div className="casino-box-row">
            <div className="casino-nation-name"><b>Player B Under 21</b> <ExpoSpan exposures={exposures} name="Player B Under 21" /></div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(under21)}`}
                onClick={isSusp(under21) ? undefined : () => onBet(under21.sid, 'back', under21.b, under21)}
              >
                <span className="casino-box-odd">{under21?.b || 0}</span>
              </div>
            </div>
            <div className="casino-nation-name"><b>Player B Over 21</b> <ExpoSpan exposures={exposures} name="Player B Over 21" /></div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(over21)}`}
                onClick={isSusp(over21) ? undefined : () => onBet(over21.sid, 'back', over21.b, over21)}
              >
                <span className="casino-box-odd">{over21?.b || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Mobile layout (d-none-big) ──────────────────────────────────────────────

const MobileLayout = memo(function MobileLayout({ sub, onBet, exposures }) {
  const playerA = findBySid(sub, 1);
  const playerB = findBySid(sub, 2);
  const under21 = findBySid(sub, 3);
  const over21  = findBySid(sub, 4);

  return (
    <div className="teen1daycasino-container d-none-big">
      <div className="casino-box-row">
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item"><b>Main</b></div>
          <div className="casino-bl-box-item"><b>Back</b></div>
          <div className="casino-bl-box-item"><b>Lay</b></div>
        </div>
        {/* Player A row */}
        <div className="casino-bl-box">
          <div className="casino-bl-box-item casino-odds-name casino-nation-name">
            <span>Player A</span>
            <ExpoSpan exposures={exposures} name="Player A" />
          </div>
          <div
            className={`back casino-bl-box-item${suspCls(playerA)}`}
            onClick={isSusp(playerA) ? undefined : () => onBet(playerA.sid, 'back', playerA.b, playerA)}
          >
            <span className="casino-box-odd">{playerA?.b || 0}</span>
          </div>
          <div
            className={`lay casino-bl-box-item${suspCls(playerA)}`}
            onClick={isSusp(playerA) ? undefined : () => onBet(playerA.sid, 'lay', playerA.l, playerA)}
          >
            <span className="casino-box-odd">{playerA?.l || 0}</span>
          </div>
        </div>
        {/* Player B row */}
        <div className="casino-bl-box">
          <div className="casino-bl-box-item casino-odds-name casino-nation-name">
            <span>Player B</span>
            <ExpoSpan exposures={exposures} name="Player B" />
          </div>
          <div
            className={`back casino-bl-box-item${suspCls(playerB)}`}
            onClick={isSusp(playerB) ? undefined : () => onBet(playerB.sid, 'back', playerB.b, playerB)}
          >
            <span className="casino-box-odd">{playerB?.b || 0}</span>
          </div>
          <div
            className={`lay casino-bl-box-item${suspCls(playerB)}`}
            onClick={isSusp(playerB) ? undefined : () => onBet(playerB.sid, 'lay', playerB.l, playerB)}
          >
            <span className="casino-box-odd">{playerB?.l || 0}</span>
          </div>
        </div>
        {/* Under/Over section */}
        <div className="teen2uo">
          <div className="teen1dayleft"></div>
          <div className="teen1daycenter"></div>
          <div className="teen1dayright">
            <div className="casino-box-row d-none-big">
              <div className="casino-nation-name no-border casino-bl-box-title">
                <div className="playerb">Player B</div>
              </div>
              <div className="casino-bl-box casino-bl-box-title"></div>
            </div>
            <div className="casino-box-row">
              <div className="casino-nation-name"><b>Under 21</b> <ExpoSpan exposures={exposures} name="Player B Under 21" /></div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(under21)}`}
                  onClick={isSusp(under21) ? undefined : () => onBet(under21.sid, 'back', under21.b, under21)}
                >
                  <span className="casino-box-odd">{under21?.b || 0}</span>
                </div>
              </div>
              <div className="casino-nation-name"><b>Over 22</b> <ExpoSpan exposures={exposures} name="Player B Over 21" /></div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(over21)}`}
                  onClick={isSusp(over21) ? undefined : () => onBet(over21.sid, 'back', over21.b, over21)}
                >
                  <span className="casino-box-odd">{over21?.b || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Main export ─────────────────────────────────────────────────────────────

const BetTableTeen41 = memo(function BetTableTeen41({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  return (
    <>
      <DesktopLayout sub={sub} onBet={handleBet} exposures={exposures} />
      <MobileLayout sub={sub} onBet={handleBet} exposures={exposures} />
    </>
  );
});

export default BetTableTeen41;
