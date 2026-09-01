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

const BetTableTrap = memo(function BetTableTrap({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const playerA = findByNat(sub, 'Player A');
  const playerB = findByNat(sub, 'Player B');

  // High/Low: nested in odds[] of active subtype=highlow item
  const hlParent = sub.find((s) => s.subtype === 'highlow' && s.odds?.length > 0 && !isSusp(s))
    || sub.find((s) => s.subtype === 'highlow' && s.odds?.length > 0);
  const hlOdds = hlParent?.odds || [];
  const highEntry = hlOdds.find((o) => o.nat === 'High');
  const lowEntry = hlOdds.find((o) => o.nat === 'Low');
  const hlOpen = hlParent && !isSusp(hlParent);

  // JQK: nested in odds[] of active subtype=jqk item
  const jqkParent = sub.find((s) => s.subtype === 'jqk' && s.odds?.length > 0 && !isSusp(s))
    || sub.find((s) => s.subtype === 'jqk' && s.odds?.length > 0);
  const jqkOdds = jqkParent?.odds || [];
  const jqkEntry = jqkOdds.find((o) => o.nat === 'JQK');
  const jqkOpen = jqkParent && !isSusp(jqkParent);

  return (
    <>
      {/* Row 1: Player A vs Player B */}
      <div className="teen1daycasino-container">
        <div className="teen1dayleft">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>Player A</b>
              <div className="float-right">{exposures?.['Player A'] ? <span className={`mr-2 ${exposures['Player A'] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures['Player A'])}</span> : <span className="mr-2 d-none"></span>}</div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(playerA)}`}
                onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'back', playerA.b, playerA)}
              >
                <span className="casino-box-odd">{playerA?.b ?? 0}</span>
              </div>
              <div
                className={`lay casino-bl-box-item${suspCls(playerA)}`}
                onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'lay', playerA.l, playerA)}
              >
                <span className="casino-box-odd">{playerA?.l ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="teen1daycenter"></div>
        <div className="teen1dayright">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>Player B</b>
              <div className="float-right">{exposures?.['Player B'] ? <span className={`mr-2 ${exposures['Player B'] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures['Player B'])}</span> : <span className="mr-2 d-none"></span>}</div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(playerB)}`}
                onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'back', playerB.b, playerB)}
              >
                <span className="casino-box-odd">{playerB?.b ?? 0}</span>
              </div>
              <div
                className={`lay casino-bl-box-item${suspCls(playerB)}`}
                onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'lay', playerB.l, playerB)}
              >
                <span className="casino-box-odd">{playerB?.l ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: LOW/HIGH + JQK */}
      <div className="teen1daycasino-container">
        <div className="teen1dayleft">
          <div className="seven-up-down-box">
            <div
              className={`up-box${hlOpen ? '' : ' suspended'}`}
              onClick={!hlOpen ? undefined : () => handleBet(
                hlParent.sid, 'back', lowEntry?.b ?? 0,
                { ...hlParent, nat: `${hlParent.nat} Low`, b: lowEntry?.b ?? 0, selectedOddsSid: lowEntry?.sid }
              )}
            >
              {exposures?.['Low'] ? <div className={`up-down-book ${exposures['Low'] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures['Low'])}</div> : <div className="up-down-book d-none">0</div>}
              <div className="text-right">
                <div className="up-down-odds">{lowEntry?.b ?? 0}</div>
                <span>LOW</span>
              </div>
            </div>
            <div
              className={`down-box${hlOpen ? '' : ' suspended'}`}
              onClick={!hlOpen ? undefined : () => handleBet(
                hlParent.sid, 'back', highEntry?.b ?? 0,
                { ...hlParent, nat: `${hlParent.nat} High`, b: highEntry?.b ?? 0, selectedOddsSid: highEntry?.sid }
              )}
            >
              <div className="text-left">
                <div className="up-down-odds">{highEntry?.b ?? 0}</div>
                <span>HIGH</span>
              </div>
              {exposures?.['High'] ? <div className={`up-down-book ${exposures['High'] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures['High'])}</div> : <div className="up-down-book d-none">0</div>}
            </div>
            <div className="seven-box">
              <img src="/assets/front/img/trape-seven.png" alt="7" />
            </div>
          </div>
        </div>
        <div className="teen1daycenter"></div>
        <div className="teen1dayright">
          <div className="casino-box-row jqk-box">
            <div className="casino-nation-name">
              <span>
                <img src="/assets/front/img/cards/J.png" alt="J" />
                {' '}
                <img src="/assets/front/img/cards/Q.png" alt="Q" />
                {' '}
                <img src="/assets/front/img/cards/K.png" alt="K" />
              </span>
              <div className="float-right">{exposures?.['JQK'] ? <span className={`mr-2 ${exposures['JQK'] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures['JQK'])}</span> : <span className="mr-2 d-none"></span>}</div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${jqkOpen ? '' : ' suspended'}`}
                onClick={!jqkOpen ? undefined : () => handleBet(
                  jqkParent.sid, 'back', jqkEntry?.b ?? 0,
                  { ...jqkParent, nat: `${jqkParent.nat} JQK`, b: jqkEntry?.b ?? 0, selectedOddsSid: jqkEntry?.sid }
                )}
              >
                <span className="casino-box-odd">{jqkEntry?.b ?? 0}</span>
              </div>
              <div
                className={`lay casino-bl-box-item${jqkOpen ? '' : ' suspended'}`}
                onClick={!jqkOpen ? undefined : () => handleBet(
                  jqkParent.sid, 'lay', jqkEntry?.l ?? 0,
                  { ...jqkParent, nat: `${jqkParent.nat} JQK`, l: jqkEntry?.l ?? 0, selectedOddsSid: jqkEntry?.sid }
                )}
              >
                <span className="casino-box-odd">{jqkEntry?.l ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trap numbers — mobile only */}
      <div className="teen1daycasino-container trap-number d-none-desktop">
        <img src="/assets/front/img/trap13.png" className="img-fluid" alt="13" />
        {' '}
        <img src="/assets/front/img/trap14.png" className="img-fluid" alt="14" />
        {' '}
        <img src="/assets/front/img/trap15.png" className="img-fluid" alt="15" />
      </div>
    </>
  );
});

export default BetTableTrap;
