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

function ExposureSpan({ value }) {
  if (!value || value === 0) return null;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className="casino-box-expo" style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
      {value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
    </span>
  );
}

const BetTableJoker20 = memo(function BetTableJoker20({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const playerA = findByNat(sub, 'Player A');
  const playerB = findByNat(sub, 'Player B');
  const even = findByNat(sub, 'Joker Even');
  const odd = findByNat(sub, 'Joker Odd');
  const redSuit = findByNat(sub, 'Joker Red');
  const blackSuit = findByNat(sub, 'Joker Black');
  const spade = findByNat(sub, 'Joker Spade');
  const heart = findByNat(sub, 'Joker Heart');
  const diamond = findByNat(sub, 'Joker Diamond');
  const club = findByNat(sub, 'Joker Club');

  return (
    <div className="teen1daycasino-container mt-2">
      <div className="teen1dayleft">
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

      <div className="teen1daycenter"></div>

      <div className="teen1dayright joker-other">
        <div>
          <div className="casino-box-row casino-odds">
            <div className="text-center w-100"><b className="text-playerb">Joker</b></div>
          </div>
          <div className="casino-box-row">
            <div className="casino-bl-box"><b>{even?.b || 0}</b></div>
            <div className="casino-bl-box"><b>{odd?.b || 0}</b></div>
            <div className="casino-bl-box"><b>{redSuit?.b || 0}</b></div>
            <div className="casino-bl-box"><b>{blackSuit?.b || 0}</b></div>
          </div>
          <div className="casino-box-row">
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(even)}`}
                onClick={isSusp(even) ? undefined : () => handleBet(even.sid, 'back', even.b, even)}
              >
                <span className="casino-box-odd">Even</span>
                <ExposureSpan value={exposures?.[even?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(odd)}`}
                onClick={isSusp(odd) ? undefined : () => handleBet(odd.sid, 'back', odd.b, odd)}
              >
                <span className="casino-box-odd">Odd</span>
                <ExposureSpan value={exposures?.[odd?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item casino-card-img${suspCls(redSuit)}`}
                onClick={isSusp(redSuit) ? undefined : () => handleBet(redSuit.sid, 'back', redSuit.b, redSuit)}
              >
                <span>
                  <img src="/assets/front/img/cards/heart.png" alt="heart" />
                  {' '}<img src="/assets/front/img/cards/diamond.png" alt="diamond" />
                </span>
                <ExposureSpan value={exposures?.[redSuit?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item casino-card-img${suspCls(blackSuit)}`}
                onClick={isSusp(blackSuit) ? undefined : () => handleBet(blackSuit.sid, 'back', blackSuit.b, blackSuit)}
              >
                <span>
                  <img src="/assets/front/img/cards/spade.png" alt="spade" />
                  {' '}<img src="/assets/front/img/cards/club.png" alt="club" />
                </span>
                <ExposureSpan value={exposures?.[blackSuit?.nat]} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-1">
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
          <div className="casino-box-row">
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(spade)}`}
                onClick={isSusp(spade) ? undefined : () => handleBet(spade.sid, 'back', spade.b, spade)}
              >
                <span className="casino-box-odd">{spade?.b || 0}</span>
                <ExposureSpan value={exposures?.[spade?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(heart)}`}
                onClick={isSusp(heart) ? undefined : () => handleBet(heart.sid, 'back', heart.b, heart)}
              >
                <span className="casino-box-odd">{heart?.b || 0}</span>
                <ExposureSpan value={exposures?.[heart?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(diamond)}`}
                onClick={isSusp(diamond) ? undefined : () => handleBet(diamond.sid, 'back', diamond.b, diamond)}
              >
                <span className="casino-box-odd">{diamond?.b || 0}</span>
                <ExposureSpan value={exposures?.[diamond?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(club)}`}
                onClick={isSusp(club) ? undefined : () => handleBet(club.sid, 'back', club.b, club)}
              >
                <span className="casino-box-odd">{club?.b || 0}</span>
                <ExposureSpan value={exposures?.[club?.nat]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BetTableJoker20;
