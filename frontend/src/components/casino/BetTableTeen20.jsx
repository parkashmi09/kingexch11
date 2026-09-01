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

const BetTableTeen20 = memo(function BetTableTeen20({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  // Look up by nat, NOT by position: the feed's sub order is sid 1..12
  // (Player, Pair Plus, 3 Baccarat, Black/Red, Total) which does NOT match the
  // A/B-interleaved order the positional indices assumed — so `sub[2]` was
  // "Pair Plus A", not baccarat, mislabelling every cell past Player.
  const byNat = (n) => sub.find((s) => s.nat === n);
  const playerA = byNat('Player A');
  const playerB = byNat('Player B');
  const baccA   = byNat('3 Baccarat A');
  const baccB   = byNat('3 Baccarat B');
  const totalA  = byNat('Total A');
  const totalB  = byNat('Total B');
  const pairA   = byNat('Pair Plus A');
  const pairB   = byNat('Pair Plus B');
  const blackA  = byNat('Black A');
  const blackB  = byNat('Black B');
  const redA    = byNat('Red A');
  const redB    = byNat('Red B');

  return (
    <>
      {/* ── DESKTOP layout (d-none-small) ── */}
      <div className="teen20casino-container d-none-small">

        <div className="teen20left">
          <div className="casino-box-row">
            <div className="casino-nation-name no-border casino-bl-box-title">
              <div className="playera">Player A</div>
            </div>
          </div>

          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item"><span>Player A</span></div>
            <div className="casino-bl-box-item"><span>3 Baccarat A</span></div>
            <div className="casino-bl-box-item"><span>Total A</span></div>
            <div className="casino-bl-box-item"><span>Pair Plus A</span></div>
          </div>

          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(playerA)}`}
              onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'back', playerA.b, playerA)}
            >
              <span className="casino-box-odd">{playerA?.b ?? 0}</span> <ExposureSpan value={exposures?.[playerA?.nat]} />
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(baccA)}`}
              onClick={isSusp(baccA) ? undefined : () => handleBet(baccA.sid, 'back', baccA.b, baccA)}
            >
              <span className="casino-box-odd">{baccA?.b ?? 0}</span> <ExposureSpan value={exposures?.[baccA?.nat]} />
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(totalA)}`}
              onClick={isSusp(totalA) ? undefined : () => handleBet(totalA.sid, 'back', totalA.b, totalA)}
            >
              <span className="casino-box-odd">{totalA?.b ?? 0}</span> <ExposureSpan value={exposures?.[totalA?.nat]} />
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(pairA)}`}
              onClick={isSusp(pairA) ? undefined : () => handleBet(pairA.sid, 'back', pairA.b, pairA)}
            >
              <span className="casino-box-odd">A</span> <ExposureSpan value={exposures?.[pairA?.nat]} />
            </div>
          </div>

          <div className="casino-rb-box-container">
            <div className="casino-rb-box blackcontainer">
              <div
                className={`casino-rb-box-player blackbox back${suspCls(blackA)}`}
                onClick={isSusp(blackA) ? undefined : () => handleBet(blackA.sid, 'back', blackA.b, blackA)}
              >
                <div className="text-right">
                  <img src="/assets/front/img/cards/spade.png" alt="spade" />
                  {' '}
                  <img src="/assets/front/img/cards/club.png" alt="club" />
                </div>
                <div className="text-right">
                  <span className="d-block casino-box-odd">{blackA?.b ?? 0}</span>
                  <span className="text-right d-none">0</span>
                </div>
              </div>
            </div>
            <div className="casino-rb-box redcontainer">
              <div
                className={`casino-rb-box-player redbox back${suspCls(redA)}`}
                onClick={isSusp(redA) ? undefined : () => handleBet(redA.sid, 'back', redA.b, redA)}
              >
                <div>
                  <img src="/assets/front/img/cards/heart.png" alt="heart" />
                  {' '}
                  <img src="/assets/front/img/cards/diamond.png" className="diamond-icon" alt="diamond" />
                </div>
                <div className="text-right">
                  <span className="d-block casino-box-odd">{redA?.b ?? 0}</span>
                  <span className="text-right d-none">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="teen20center"></div>

        <div className="teen20right">
          <div className="casino-box-row">
            <div className="casino-nation-name no-border casino-bl-box-title">
              <div className="playerb">Player B</div>
            </div>
          </div>

          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item"><span>Player B</span></div>
            <div className="casino-bl-box-item"><span>3 Baccarat B</span></div>
            <div className="casino-bl-box-item"><span>Total B</span></div>
            <div className="casino-bl-box-item"><span>Pair Plus B</span></div>
          </div>

          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(playerB)}`}
              onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'back', playerB.b, playerB)}
            >
              <span className="casino-box-odd">{playerB?.b ?? 0}</span> <ExposureSpan value={exposures?.[playerB?.nat]} />
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(baccB)}`}
              onClick={isSusp(baccB) ? undefined : () => handleBet(baccB.sid, 'back', baccB.b, baccB)}
            >
              <span className="casino-box-odd">{baccB?.b ?? 0}</span> <ExposureSpan value={exposures?.[baccB?.nat]} />
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(totalB)}`}
              onClick={isSusp(totalB) ? undefined : () => handleBet(totalB.sid, 'back', totalB.b, totalB)}
            >
              <span className="casino-box-odd">{totalB?.b ?? 0}</span> <ExposureSpan value={exposures?.[totalB?.nat]} />
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(pairB)}`}
              onClick={isSusp(pairB) ? undefined : () => handleBet(pairB.sid, 'back', pairB.b, pairB)}
            >
              <span className="casino-box-odd">B</span> <ExposureSpan value={exposures?.[pairB?.nat]} />
            </div>
          </div>

          <div className="casino-rb-box-container">
            <div className="casino-rb-box blackcontainer">
              <div
                className={`casino-rb-box-player blackbox back${suspCls(blackB)}`}
                onClick={isSusp(blackB) ? undefined : () => handleBet(blackB.sid, 'back', blackB.b, blackB)}
              >
                <div>
                  <img src="/assets/front/img/cards/spade.png" alt="spade" />
                  {' '}
                  <img src="/assets/front/img/cards/club.png" alt="club" />
                </div>
                <div className="text-right">
                  <span className="d-block casino-box-odd">{blackB?.b ?? 0}</span>
                  <span className="text-right d-none">0</span>
                </div>
              </div>
            </div>
            <div className="casino-rb-box redcontainer">
              <div
                className={`casino-rb-box-player redbox back${suspCls(redB)}`}
                onClick={isSusp(redB) ? undefined : () => handleBet(redB.sid, 'back', redB.b, redB)}
              >
                <div>
                  <img src="/assets/front/img/cards/heart.png" alt="heart" />
                  {' '}
                  <img src="/assets/front/img/cards/diamond.png" className="diamond-icon" alt="diamond" />
                </div>
                <div className="text-right">
                  <span className="d-block casino-box-odd">{redB?.b ?? 0}</span>
                  <span className="text-right d-none">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── MOBILE layout (d-none-big) ── */}
      <div className="teen20casino-container d-none-big">

        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item"></div>
          <div className="casino-bl-box-item playera">Player A</div>
          <div className="casino-bl-box-item playerb">Player B</div>
        </div>

        <div className="casino-bl-box">
          <div className="casino-bl-box-item casino-odds-name casino-nation-name"><span>Player</span></div>
          <div
            className={`back casino-bl-box-item${suspCls(playerA)}`}
            onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'back', playerA.b, playerA)}
          >
            <span className="casino-box-odd">{playerA?.b ?? 0}</span> <ExposureSpan value={exposures?.[playerA?.nat]} />
          </div>
          <div
            className={`back casino-bl-box-item${suspCls(playerB)}`}
            onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'back', playerB.b, playerB)}
          >
            <span className="casino-box-odd">{playerB?.b ?? 0}</span> <ExposureSpan value={exposures?.[playerB?.nat]} />
          </div>
        </div>

        <div className="casino-bl-box">
          <div className="casino-bl-box-item casino-odds-name casino-nation-name"><span>3 Baccarat</span></div>
          <div
            className={`back casino-bl-box-item${suspCls(baccA)}`}
            onClick={isSusp(baccA) ? undefined : () => handleBet(baccA.sid, 'back', baccA.b, baccA)}
          >
            <span className="casino-box-odd">{baccA?.b ?? 0}</span> <ExposureSpan value={exposures?.[baccA?.nat]} />
          </div>
          <div
            className={`back casino-bl-box-item${suspCls(baccB)}`}
            onClick={isSusp(baccB) ? undefined : () => handleBet(baccB.sid, 'back', baccB.b, baccB)}
          >
            <span className="casino-box-odd">{baccB?.b ?? 0}</span> <ExposureSpan value={exposures?.[baccB?.nat]} />
          </div>
        </div>

        <div className="casino-bl-box">
          <div className="casino-bl-box-item casino-odds-name casino-nation-name"><span>Total</span></div>
          <div
            className={`back casino-bl-box-item${suspCls(totalA)}`}
            onClick={isSusp(totalA) ? undefined : () => handleBet(totalA.sid, 'back', totalA.b, totalA)}
          >
            <span className="casino-box-odd">{totalA?.b ?? 0}</span> <ExposureSpan value={exposures?.[totalA?.nat]} />
          </div>
          <div
            className={`back casino-bl-box-item${suspCls(totalB)}`}
            onClick={isSusp(totalB) ? undefined : () => handleBet(totalB.sid, 'back', totalB.b, totalB)}
          >
            <span className="casino-box-odd">{totalB?.b ?? 0}</span> <ExposureSpan value={exposures?.[totalB?.nat]} />
          </div>
        </div>

        <div className="casino-bl-box">
          <div className="casino-bl-box-item casino-odds-name casino-nation-name"><span>Pair Plus</span></div>
          <div
            className={`back casino-bl-box-item${suspCls(pairA)}`}
            onClick={isSusp(pairA) ? undefined : () => handleBet(pairA.sid, 'back', pairA.b, pairA)}
          >
            <span className="casino-box-odd">A</span> <ExposureSpan value={exposures?.[pairA?.nat]} />
          </div>
          <div
            className={`back casino-bl-box-item${suspCls(pairB)}`}
            onClick={isSusp(pairB) ? undefined : () => handleBet(pairB.sid, 'back', pairB.b, pairB)}
          >
            <span className="casino-box-odd">B</span> <ExposureSpan value={exposures?.[pairB?.nat]} />
          </div>
        </div>

        <div className="casino-bl-box">
          <div className="casino-bl-box-item casino-odds-name casino-nation-name">
            <div>
              <img src="/assets/front/img/cards/spade.png" alt="spade" />
              {' '}
              <img src="/assets/front/img/cards/club.png" alt="club" />
            </div>
          </div>
          <div
            className={`back casino-bl-box-item${suspCls(blackA)}`}
            onClick={isSusp(blackA) ? undefined : () => handleBet(blackA.sid, 'back', blackA.b, blackA)}
          >
            <span className="casino-box-odd">{blackA?.b ?? 0}</span> <ExposureSpan value={exposures?.[blackA?.nat]} />
          </div>
          <div
            className={`back casino-bl-box-item${suspCls(blackB)}`}
            onClick={isSusp(blackB) ? undefined : () => handleBet(blackB.sid, 'back', blackB.b, blackB)}
          >
            <span className="casino-box-odd">{blackB?.b ?? 0}</span> <ExposureSpan value={exposures?.[blackB?.nat]} />
          </div>
        </div>

        <div className="casino-bl-box">
          <div className="casino-bl-box-item casino-odds-name casino-nation-name">
            <div>
              <img src="/assets/front/img/cards/heart.png" alt="heart" />
              {' '}
              <img src="/assets/front/img/cards/diamond.png" alt="diamond" />
            </div>
          </div>
          <div
            className={`back casino-bl-box-item${suspCls(redA)}`}
            onClick={isSusp(redA) ? undefined : () => handleBet(redA.sid, 'back', redA.b, redA)}
          >
            <span className="casino-box-odd">{redA?.b ?? 0}</span> <ExposureSpan value={exposures?.[redA?.nat]} />
          </div>
          <div
            className={`back casino-bl-box-item${suspCls(redB)}`}
            onClick={isSusp(redB) ? undefined : () => handleBet(redB.sid, 'back', redB.b, redB)}
          >
            <span className="casino-box-odd">{redB?.b ?? 0}</span> <ExposureSpan value={exposures?.[redB?.nat]} />
          </div>
        </div>

      </div>
    </>
  );
});

export default BetTableTeen20;
