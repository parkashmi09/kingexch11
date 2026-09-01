import { memo } from 'react';

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

const JOKER_CARDS = Array.from({ length: 13 }, (_, i) => i + 1);

const BetTableJoker120 = memo(function BetTableJoker120({ gameData, onBet, selectedJoker, onSelectJoker, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const playerA = findByNat(sub, 'Player A');
  const playerB = findByNat(sub, 'Player B');
  const allSuspended = isSusp(playerA) && isSusp(playerB);

  return (
    <div className="teen1daycasino-container mt-2">
      {!allSuspended && (
        <div className="teen1dayleft">
          <div className="joker1-box">
            <div className="joker1-other-cards">
              <h4>Select your Joker</h4>
              <div>
                {JOKER_CARDS.map((n) => (
                  <img
                    key={n}
                    src={`/assets/img/joker1/${n}.png`}
                    className={selectedJoker === n ? 'select' : ''}
                    alt={String(n)}
                    onClick={() => onSelectJoker && onSelectJoker(n)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="teen1daycenter"></div>

      <div className="teen1dayright joker-other">
        <div className="casino-box-row">
          <div className="casino-nation-name">
            <b>Player A</b>
            <div className="float-right">
              {exposures?.['Player A'] ? <span className={`mr-2 ${exposures['Player A'] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures['Player A'])}</span> : <span className="mr-2 d-none"></span>}
            </div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(playerA)}`}
              onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'back', playerA.b, playerA)}
            >
              <span className="casino-box-odd">{playerA?.b || 0}</span>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(playerA)}`}
              onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'lay', playerA.l, playerA)}
            >
              <span className="casino-box-odd">{playerA?.l || 0}</span>
            </div>
          </div>
        </div>

        <div className="casino-box-row">
          <div className="casino-nation-name">
            <b>Player B</b>
            <div className="float-right">
              {exposures?.['Player B'] ? <span className={`mr-2 ${exposures['Player B'] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures['Player B'])}</span> : <span className="mr-2 d-none"></span>}
            </div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(playerB)}`}
              onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'back', playerB.b, playerB)}
            >
              <span className="casino-box-odd">{playerB?.b || 0}</span>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(playerB)}`}
              onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'lay', playerB.l, playerB)}
            >
              <span className="casino-box-odd">{playerB?.l || 0}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default BetTableJoker120;
