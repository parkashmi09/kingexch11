import { memo } from 'react';

function findBySubtype(sub, subtype, nat) {
  return sub.find((s) => s.subtype === subtype && s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

const BetTableMuflis = memo(function BetTableMuflis({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const winnerA  = findBySubtype(sub, 'teenmuf', 'Player A');
  const winnerB  = findBySubtype(sub, 'teenmuf', 'Player B');
  const top9A    = findBySubtype(sub, 'top9',    'Top 9 A');
  const top9B    = findBySubtype(sub, 'top9',    'Top 9 B');
  const mbaccA   = findBySubtype(sub, 'mbacc',   'M Baccarat A');
  const mbaccB   = findBySubtype(sub, 'mbacc',   'M Baccarat B');

  function expSpan(name) {
    const exp = exposures?.[name];
    return exp && exp !== 0
      ? <span className={exp < 0 ? 'book-red' : 'book-green'}>{Math.round(exp)}</span>
      : <span className="d-none">0</span>;
  }

  return (
    <div className="teen1daycasino-container">

      <div className="teen1dayleft">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title">
            <div className="playera text-left">Player A</div>
          </div>
        </div>

        <div className="row row5">
          <div className="col-12 col-md-4">
            <div className="casino-box-row">
              <div className="casino-nation-name"><b>Winner</b></div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(winnerA)}`}
                  onClick={isSusp(winnerA) ? undefined : () => handleBet(winnerA.sid, 'back', winnerA.b, winnerA)}
                >
                  <span className="casino-box-odd">{winnerA?.b || 0}</span>
                  {expSpan('Player A')}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="casino-box-row">
              <div className="casino-nation-name"><b>Top 9</b></div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(top9A)}`}
                  onClick={isSusp(top9A) ? undefined : () => handleBet(top9A.sid, 'back', top9A.b, top9A)}
                >
                  <span className="casino-box-odd">A</span>
                  {expSpan('Top 9 A')}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="casino-box-row">
              <div className="casino-nation-name"><b>M Baccarat A</b></div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(mbaccA)}`}
                  onClick={isSusp(mbaccA) ? undefined : () => handleBet(mbaccA.sid, 'back', mbaccA.b, mbaccA)}
                >
                  <span className="casino-box-odd">{mbaccA?.b || 0}</span>
                  {expSpan('M Baccarat A')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="teen1daycenter"></div>

      <div className="teen1dayright">
        <div className="casino-box-row">
          <div className="casino-nation-name no-border casino-bl-box-title">
            <div className="playerb text-left">Player B</div>
          </div>
        </div>

        <div className="row row5">
          <div className="col-12 col-md-4">
            <div className="casino-box-row">
              <div className="casino-nation-name"><b>Winner</b></div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(winnerB)}`}
                  onClick={isSusp(winnerB) ? undefined : () => handleBet(winnerB.sid, 'back', winnerB.b, winnerB)}
                >
                  <span className="casino-box-odd">{winnerB?.b || 0}</span>
                  {expSpan('Player B')}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="casino-box-row">
              <div className="casino-nation-name"><b>Top 9</b></div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(top9B)}`}
                  onClick={isSusp(top9B) ? undefined : () => handleBet(top9B.sid, 'back', top9B.b, top9B)}
                >
                  <span className="casino-box-odd">B</span>
                  {expSpan('Top 9 B')}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="casino-box-row">
              <div className="casino-nation-name"><b>M Baccarat B</b></div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(mbaccB)}`}
                  onClick={isSusp(mbaccB) ? undefined : () => handleBet(mbaccB.sid, 'back', mbaccB.b, mbaccB)}
                >
                  <span className="casino-box-odd">{mbaccB?.b || 0}</span>
                  {expSpan('M Baccarat B')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
});

export default BetTableMuflis;
