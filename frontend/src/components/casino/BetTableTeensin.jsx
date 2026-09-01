import { memo } from 'react';

function findBySid(sub, sid) {
  return sub.find((s) => s.sid === sid);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

const BetTableTeensin = memo(function BetTableTeensin({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const playerA   = findBySid(sub, 1);
  const playerB   = findBySid(sub, 2);
  const highCardA = findBySid(sub, 3);
  const highCardB = findBySid(sub, 4);
  const pairA     = findBySid(sub, 5);
  const pairB     = findBySid(sub, 6);
  const colorPlusA = findBySid(sub, 7);
  const colorPlusB = findBySid(sub, 8);
  const lucky9     = findBySid(sub, 9);

  function expSpan(name) {
    const exp = exposures?.[name];
    return exp && exp !== 0
      ? <span className={exp < 0 ? 'book-red' : 'book-green'}>{Math.round(exp)}</span>
      : <span className="d-none">0</span>;
  }

  return (
    <>
      <div className="teen20casino-container">

        <div className="teen20left">
          <div className="casino-box-row">
            <div className="casino-nation-name no-border casino-bl-box-title">
              <div className="playera">Player A</div>
            </div>
          </div>

          <div className="casino-bl-box casino-bl-box-title d-none-small">
            <div className="casino-bl-box-item"><span>Winner</span></div>
            <div className="casino-bl-box-item"><span>High Card</span></div>
            <div className="casino-bl-box-item"><span>Pair</span></div>
            <div className="casino-bl-box-item"><span>Color Plus</span></div>
          </div>

          <div className="casino-bl-box">
            <div className="casino-bl-box-item d-none-big"><span>Winner</span></div>
            <div
              className={`back casino-bl-box-item${suspCls(playerA)}`}
              onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'back', playerA.b, playerA)}
            >
              <span className="casino-box-odd">{playerA?.b || 0}</span>
              {expSpan('Player A')}
            </div>

            <div className="casino-bl-box-item d-none-big"><span>High Card</span></div>
            <div
              className={`back casino-bl-box-item${suspCls(highCardA)}`}
              onClick={isSusp(highCardA) ? undefined : () => handleBet(highCardA.sid, 'back', highCardA.b, highCardA)}
            >
              <span className="casino-box-odd">{highCardA?.b || 0}</span>
              {expSpan('High Card A')}
            </div>

            <div className="casino-bl-box-item d-none-big"><span>Pair</span></div>
            <div
              className={`back casino-bl-box-item${suspCls(pairA)}`}
              onClick={isSusp(pairA) ? undefined : () => handleBet(pairA.sid, 'back', pairA.b, pairA)}
            >
              <span className="casino-box-odd">{pairA?.b || 0}</span>
              {expSpan('Pair A')}
            </div>

            <div className="casino-bl-box-item d-none-big"><span>Color Plus</span></div>
            <div
              className={`back casino-bl-box-item${suspCls(colorPlusA)}`}
              onClick={isSusp(colorPlusA) ? undefined : () => handleBet(colorPlusA.sid, 'back', colorPlusA.b, colorPlusA)}
            >
              <span className="casino-box-odd">A</span>
              {expSpan('Color Plus A')}
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

          <div className="casino-bl-box casino-bl-box-title d-none-small">
            <div className="casino-bl-box-item"><span>Winner</span></div>
            <div className="casino-bl-box-item"><span>High Card</span></div>
            <div className="casino-bl-box-item"><span>Pair</span></div>
            <div className="casino-bl-box-item"><span>Color Plus</span></div>
          </div>

          <div className="casino-bl-box">
            <div className="casino-bl-box-item d-none-big"><span>Winner</span></div>
            <div
              className={`back casino-bl-box-item${suspCls(playerB)}`}
              onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'back', playerB.b, playerB)}
            >
              <span className="casino-box-odd">{playerB?.b || 0}</span>
              {expSpan('Player B')}
            </div>

            <div className="casino-bl-box-item d-none-big"><span>High Card</span></div>
            <div
              className={`back casino-bl-box-item${suspCls(highCardB)}`}
              onClick={isSusp(highCardB) ? undefined : () => handleBet(highCardB.sid, 'back', highCardB.b, highCardB)}
            >
              <span className="casino-box-odd">{highCardB?.b || 0}</span>
              {expSpan('High Card B')}
            </div>

            <div className="casino-bl-box-item d-none-big"><span>Pair</span></div>
            <div
              className={`back casino-bl-box-item${suspCls(pairB)}`}
              onClick={isSusp(pairB) ? undefined : () => handleBet(pairB.sid, 'back', pairB.b, pairB)}
            >
              <span className="casino-box-odd">{pairB?.b || 0}</span>
              {expSpan('Pair B')}
            </div>

            <div className="casino-bl-box-item d-none-big"><span>Color Plus</span></div>
            <div
              className={`back casino-bl-box-item${suspCls(colorPlusB)}`}
              onClick={isSusp(colorPlusB) ? undefined : () => handleBet(colorPlusB.sid, 'back', colorPlusB.b, colorPlusB)}
            >
              <span className="casino-box-odd">B</span>
              {expSpan('Color Plus B')}
            </div>
          </div>
        </div>
      </div>

      <div className="sin-khal-box">
        <img src="/assets/front/img/lucky9.png" alt="Lucky 9" />
        <div className="casino-bl-box">
          <div
            className={`back casino-bl-box-item${suspCls(lucky9)}`}
            onClick={isSusp(lucky9) ? undefined : () => handleBet(lucky9.sid, 'back', lucky9.b, lucky9)}
          >
            <span className="casino-box-odd">{lucky9?.b || 0}</span>
          </div>
          <div
            className={`lay casino-bl-box-item${suspCls(lucky9)}`}
            onClick={isSusp(lucky9) ? undefined : () => handleBet(lucky9.sid, 'lay', lucky9.l, lucky9)}
          >
            <span className="casino-box-odd">{lucky9?.l || 0}</span>
          </div>
          {exposures?.['Lucky 9'] ? <div className={`sin-khal-box-book ${exposures['Lucky 9'] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures['Lucky 9'])}</div> : <div className="sin-khal-box-book d-none">0</div>}
        </div>
      </div>
    </>
  );
});

export default BetTableTeensin;
