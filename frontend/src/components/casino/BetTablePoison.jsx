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

function BookSpan({ value }) {
  if (!value || value === 0) return <span className="mr-2 d-none"></span>;
  const cls = value < 0 ? 'book-red' : 'book-green';
  return <span className={`mr-2 ${cls}`}>{Math.round(value)}</span>;
}

function ExposureSpan({ value }) {
  if (!value || value === 0) return <span className="d-none"></span>;
  const cls = value < 0 ? 'book-red' : 'book-green';
  return <span className={cls}>{Math.round(value)}</span>;
}

const BetTablePoison = memo(function BetTablePoison({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const playerA = findByNat(sub, 'Player A');
  const playerB = findByNat(sub, 'Player B');

  // Feed prefixes every poison market with "Poison " (Poison Even, Poison Red,
  // Poison Spade…). Bare 'Even'/'Red'/'Spade' find nothing → whole section dead.
  const evenItem  = findByNat(sub, 'Poison Even')  || findByNat(sub, 'Even');
  const oddItem   = findByNat(sub, 'Poison Odd')   || findByNat(sub, 'Odd');
  const redItem   = findByNat(sub, 'Poison Red')   || findByNat(sub, 'Red');
  const blackItem = findByNat(sub, 'Poison Black') || findByNat(sub, 'Black');

  const spadeItem   = findByNat(sub, 'Poison Spade')   || findByNat(sub, 'Spade');
  const heartItem   = findByNat(sub, 'Poison Heart')   || findByNat(sub, 'Heart');
  const diamondItem = findByNat(sub, 'Poison Diamond') || findByNat(sub, 'Diamond');
  const clubItem    = findByNat(sub, 'Poison Club')    || findByNat(sub, 'Club');

  return (
    <div className="teen1daycasino-container mt-2">
      {/* LEFT: Player A & B */}
      <div className="teen1dayleft">
        <div className="casino-box-row">
          <div className="casino-nation-name">
            <b>Player A</b>
            <div className="float-right"><BookSpan value={exposures?.['Player A']} /></div>
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
            <div className="float-right"><BookSpan value={exposures?.['Player B']} /></div>
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

      {/* CENTER divider */}
      <div className="teen1daycenter"></div>

      {/* RIGHT: Poison section */}
      <div className="teen1dayright joker-other">
        <div>
          {/* Poison title */}
          <div className="casino-box-row casino-odds">
            <div className="text-center w-100"><b className="text-playerb">Poison</b></div>
          </div>

          {/* Odds row */}
          <div className="casino-box-row">
            <div className="casino-bl-box"><b>{evenItem?.b || 0}</b></div>
            <div className="casino-bl-box"><b>{oddItem?.b || 0}</b></div>
            <div className="casino-bl-box"><b>{redItem?.b || 0}</b></div>
            <div className="casino-bl-box"><b>{blackItem?.b || 0}</b></div>
          </div>

          {/* Bet buttons row: Even, Odd, Red suits, Black suits */}
          <div className="casino-box-row">
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(evenItem)}`}
                onClick={isSusp(evenItem) ? undefined : () => handleBet(evenItem.sid, 'back', evenItem.b, evenItem)}
              >
                <span className="casino-box-odd">Even</span>
                <ExposureSpan value={exposures?.[evenItem?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(oddItem)}`}
                onClick={isSusp(oddItem) ? undefined : () => handleBet(oddItem.sid, 'back', oddItem.b, oddItem)}
              >
                <span className="casino-box-odd">Odd</span>
                <ExposureSpan value={exposures?.[oddItem?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item casino-card-img${suspCls(redItem)}`}
                onClick={isSusp(redItem) ? undefined : () => handleBet(redItem.sid, 'back', redItem.b, redItem)}
              >
                <span>
                  <img src="/assets/front/img/cards/heart.png" alt="heart" />
                  <img src="/assets/front/img/cards/diamond.png" alt="diamond" />
                </span>
                <ExposureSpan value={exposures?.[redItem?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item casino-card-img${suspCls(blackItem)}`}
                onClick={isSusp(blackItem) ? undefined : () => handleBet(blackItem.sid, 'back', blackItem.b, blackItem)}
              >
                <span>
                  <img src="/assets/front/img/cards/spade.png" alt="spade" />
                  <img src="/assets/front/img/cards/club.png" alt="club" />
                </span>
                <ExposureSpan value={exposures?.[blackItem?.nat]} />
              </div>
            </div>
          </div>
        </div>

        {/* Individual suits section */}
        <div className="mt-1">
          {/* Suit icons row */}
          <div className="casino-box-row">
            <div className="casino-bl-box">
              <div className="casino-bl-box-item casino-card-img">
                <img src="/assets/front/img/cards/spade.png" alt="spade" />
              </div>
            </div>
            <div className="casino-bl-box">
              <div className="casino-bl-box-item casino-card-img">
                <img src="/assets/front/img/cards/heart.png" alt="heart" />
              </div>
            </div>
            <div className="casino-bl-box">
              <div className="casino-bl-box-item casino-card-img">
                <img src="/assets/front/img/cards/diamond.png" alt="diamond" />
              </div>
            </div>
            <div className="casino-bl-box">
              <div className="casino-bl-box-item casino-card-img">
                <img src="/assets/front/img/cards/club.png" alt="club" />
              </div>
            </div>
          </div>

          {/* Suit odds row */}
          <div className="casino-box-row">
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(spadeItem)}`}
                onClick={isSusp(spadeItem) ? undefined : () => handleBet(spadeItem.sid, 'back', spadeItem.b, spadeItem)}
              >
                <span className="casino-box-odd">{spadeItem?.b || 0}</span>
                <ExposureSpan value={exposures?.[spadeItem?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(heartItem)}`}
                onClick={isSusp(heartItem) ? undefined : () => handleBet(heartItem.sid, 'back', heartItem.b, heartItem)}
              >
                <span className="casino-box-odd">{heartItem?.b || 0}</span>
                <ExposureSpan value={exposures?.[heartItem?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(diamondItem)}`}
                onClick={isSusp(diamondItem) ? undefined : () => handleBet(diamondItem.sid, 'back', diamondItem.b, diamondItem)}
              >
                <span className="casino-box-odd">{diamondItem?.b || 0}</span>
                <ExposureSpan value={exposures?.[diamondItem?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(clubItem)}`}
                onClick={isSusp(clubItem) ? undefined : () => handleBet(clubItem.sid, 'back', clubItem.b, clubItem)}
              >
                <span className="casino-box-odd">{clubItem?.b || 0}</span>
                <ExposureSpan value={exposures?.[clubItem?.nat]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BetTablePoison;
