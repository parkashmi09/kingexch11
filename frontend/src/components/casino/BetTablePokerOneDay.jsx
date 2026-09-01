import { memo } from 'react';
import { cardSrc, parseCards } from './cards/cardUtils';

function findBySid(sub, sid) {
  return sub.find((s) => s.sid === sid);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function ExpoSpan({ exposures, name }) {
  const exp = exposures?.[name] || 0;
  if (exp === 0) return <span className="d-none"></span>;
  return <span className={exp < 0 ? 'book-red' : 'book-green'}>{Math.round(exp)}</span>;
}

const BetTablePokerOneDay = memo(function BetTablePokerOneDay({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const cardString = gameData?.card ?? '';
  const codes = parseCards(cardString);

  // Card indices: 0,1 = Player A hole; 2,3 = Player B hole; 4–8 = Board (5)
  const cardA1 = codes[0] || '1';
  const cardA2 = codes[1] || '1';
  const cardB1 = codes[2] || '1';
  const cardB2 = codes[3] || '1';
  const boardCards = [
    codes[4] || '1',
    codes[5] || '1',
    codes[6] || '1',
    codes[7] || '1',
    codes[8] || '1',
  ];

  // Sub items by sid
  const playerA   = findBySid(sub, 1); // Player A back/lay
  const playerB   = findBySid(sub, 2); // Player B back/lay
  const a2card    = findBySid(sub, 3); // Player A 2 card Bonus
  const a7card    = findBySid(sub, 4); // Player A 7 card bonus
  const b2card    = findBySid(sub, 5); // Player B 2 card Bonus
  const b7card    = findBySid(sub, 6); // Player B 7 card bonus

  const handleBet = onBet || (() => {});

  return (
    <>
      {/* Player A box */}
      <div className="playerabox">
        <div className="casino-box-row playerafabcy">
          <div className="casino-nation-name"><b>Player A</b></div>
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
          <div className="casino-nation-name text-center w-100"><ExpoSpan exposures={exposures} name="Player A" /></div>
        </div>
        <div className="casino-box poker1dayother mt-2">
          <div className="casino-bl-box">
            <div
              className={`casino-bl-box-item back${suspCls(a2card)}`}
              onClick={isSusp(a2card) ? undefined : () => handleBet(a2card.sid, 'back', a2card.b, a2card)}
            >
              <span className="casino-box-odd">2 Cards Bonus</span>
              <ExpoSpan exposures={exposures} name={a2card?.nat} />
            </div>
            <div
              className={`casino-bl-box-item back${suspCls(a7card)}`}
              onClick={isSusp(a7card) ? undefined : () => handleBet(a7card.sid, 'back', a7card.b, a7card)}
            >
              <span className="casino-box-odd">7 Cards Bonus</span>
              <ExpoSpan exposures={exposures} name={a7card?.nat} />
            </div>
          </div>
        </div>
      </div>

      {/* Player A & B hole cards */}
      <div className="playerabcardbox">
        <div className="poker-icon"><img src="/assets/icons/poker.png" alt="poker" /></div>
        <div className="row row5 w-100">
          <div className="col-12 col-md-6">
            <div className="dealer-name playera">Player A</div>
            <div className="mt-1">
              <span><img src={cardSrc(cardA1)} alt={cardA1} /></span>
              <span><img src={cardSrc(cardA2)} alt={cardA2} /></span>
            </div>
          </div>
          <div className="col-12 col-md-6 text-right">
            <div className="dealer-name playerb">Player B</div>
            <div className="mt-1">
              <span><img src={cardSrc(cardB1)} alt={cardB1} /></span>
              <span><img src={cardSrc(cardB2)} alt={cardB2} /></span>
            </div>
          </div>
        </div>
      </div>

      {/* Player B box */}
      <div className="playerbbox">
        <div className="casino-box-row playerbfabcy">
          <div className="casino-nation-name"><b>Player B</b></div>
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
          <div className="casino-nation-name text-center w-100"><ExpoSpan exposures={exposures} name="Player B" /></div>
        </div>
        <div className="casino-box poker1dayother mt-2">
          <div className="casino-bl-box">
            <div
              className={`casino-bl-box-item back${suspCls(b2card)}`}
              onClick={isSusp(b2card) ? undefined : () => handleBet(b2card.sid, 'back', b2card.b, b2card)}
            >
              <span className="casino-box-odd">2 Cards Bonus</span>
              <ExpoSpan exposures={exposures} name={b2card?.nat} />
            </div>
            <div
              className={`casino-bl-box-item back${suspCls(b7card)}`}
              onClick={isSusp(b7card) ? undefined : () => handleBet(b7card.sid, 'back', b7card.b, b7card)}
            >
              <span className="casino-box-odd">7 Cards Bonus</span>
              <ExpoSpan exposures={exposures} name={b7card?.nat} />
            </div>
          </div>
        </div>
      </div>

      {/* Remark marquee */}
      <div className="casino-remark mt-1">
        <div className="remark-icon"><img src="/assets/icons/remark.png" alt="remark" /></div>
        <div className="marquee-wrapper">
          <div className="marquee-content" style={{ animationDuration: '25s' }}>{gameData?.remark || 'Play Our New Game Premium Teenpatti 1 Day'}</div>
        </div>
      </div>
    </>
  );
});

export default BetTablePokerOneDay;
