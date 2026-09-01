import { memo } from 'react';
import { computeUserBook } from '../../utils/casinoBook';

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

const BetTableTeenpatti2Cards = memo(function BetTableTeenpatti2Cards({ gameData, onBet, exposures, myBets }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const playerA   = findByNat(sub, 'Player A');
  const playerB   = findByNat(sub, 'Player B');
  const mbaccA    = findByNat(sub, 'Mini Baccarat A');
  const mbaccB    = findByNat(sub, 'Mini Baccarat B');
  const totalA    = findByNat(sub, 'Total A');
  const totalB    = findByNat(sub, 'Total B');
  const colorPlus = findByNat(sub, 'Color Plus');

  // Player A vs Player B is a two-way MATCH market — show the exchange book
  // (backed runner's profit, the other's −stake) under BOTH runners. This is
  // display-only, computed from the user's own bets: the backend keeps the SAFE
  // legacy single-row lock, because a tie loses both sides, so summed
  // independent rows lock a hedged bet correctly where a two-way book would
  // under-lock the tie (the exhaustiveness rule in casinoMarketBook.js). Only
  // Player A/B books this way — the other markets keep their backend figures.
  const playerBook = computeUserBook(myBets || [], [[
    { sid: playerA?.sid, nat: 'Player A' },
    { sid: playerB?.sid, nat: 'Player B' },
  ]]);

  function expSpan(name) {
    const exp = exposures?.[name];
    return exp ? <span className={`mr-2 ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</span> : <span className="mr-2 d-none">0</span>;
  }

  // Book figure for a Player A/B runner (from the computed book above).
  function playerSpan(name) {
    const v = Number(playerBook?.[name]) || 0;
    return v ? <span className={`mr-2 ${v < 0 ? 'book-red' : 'book-green'}`}>{Math.round(v)}</span> : <span className="mr-2 d-none">0</span>;
  }

  // Total A/B is a Fancy2 line market: b/l carry the run LINE (15/14),
  // bbhav/lbhav the RATE (105/95). The decimal price is rate/100+1 (back 2.05,
  // lay 1.95) — the odds the bet is priced/settled at — while the slip shows the
  // line. Tag _sessionRate so useCasinoBet re-derives the price from the rate.
  const totalOdds = (item, type) => {
    const rate = type === 'lay' ? Number(item?.lbhav) : Number(item?.bbhav);
    return rate > 0 ? rate / 100 + 1 : 0;
  };
  const totalItem = (item, type) => ({
    ...item,
    _sessionRate: true,
    _line: type === 'lay' ? item?.l : item?.b,
  });

  return (
    <>
    {/* Mobile layout */}
    <div className="d-none-big">
      <div className="casino-box-row">
        <div className="casino-nation-name"><b>Player A</b> <div className="float-right">{playerSpan('Player A')}</div></div>
        <div className="casino-bl-box">
          <div className={`back casino-bl-box-item${suspCls(playerA)}`} onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'back', playerA.b, playerA)}>
            <span className="casino-box-odd">{playerA?.b ?? 0}</span>
          </div>
          <div className={`lay casino-bl-box-item${suspCls(playerA)}`} onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'lay', playerA.l, playerA)}>
            <span className="casino-box-odd">{playerA?.l ?? 0}</span>
          </div>
        </div>
      </div>
      <div className="casino-box-row">
        <div className="casino-nation-name"><b>Player B</b> <div className="float-right">{playerSpan('Player B')}</div></div>
        <div className="casino-bl-box">
          <div className={`back casino-bl-box-item${suspCls(playerB)}`} onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'back', playerB.b, playerB)}>
            <span className="casino-box-odd">{playerB?.b ?? 0}</span>
          </div>
          <div className={`lay casino-bl-box-item${suspCls(playerB)}`} onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'lay', playerB.l, playerB)}>
            <span className="casino-box-odd">{playerB?.l ?? 0}</span>
          </div>
        </div>
      </div>
      <div className="casino-box-row">
        <div className="casino-nation-name"><b>Mini Baccarat A</b> <div className="float-right">{expSpan('Mini Baccarat A')}</div></div>
        <div className="casino-bl-box casino-bl-boxfull">
          <div className={`back casino-bl-box-item${suspCls(mbaccA)}`} onClick={isSusp(mbaccA) ? undefined : () => handleBet(mbaccA.sid, 'back', mbaccA.b, mbaccA)}>
            <span className="casino-box-odd">{mbaccA?.b ?? 0}</span>
          </div>
        </div>
      </div>
      <div className="casino-box-row">
        <div className="casino-nation-name"><b>Mini Baccarat B</b> <div className="float-right">{expSpan('Mini Baccarat B')}</div></div>
        <div className="casino-bl-box casino-bl-boxfull">
          <div className={`back casino-bl-box-item${suspCls(mbaccB)}`} onClick={isSusp(mbaccB) ? undefined : () => handleBet(mbaccB.sid, 'back', mbaccB.b, mbaccB)}>
            <span className="casino-box-odd">{mbaccB?.b ?? 0}</span>
          </div>
        </div>
      </div>
      <div className="casino-box-row">
        <div className="casino-nation-name"><b className="pointer">Total A</b> <div className="float-right">{expSpan('Total A')}</div></div>
        <div className="casino-bl-box total-odds">
          <div className={`lay casino-bl-box-item${suspCls(totalA)}`} onClick={isSusp(totalA) || !totalOdds(totalA, 'lay') ? undefined : () => handleBet(totalA.sid, 'lay', totalOdds(totalA, 'lay'), totalItem(totalA, 'lay'))}>
            <span>{totalA?.l ?? 14}</span> <span className="casino-box-odd">{totalA?.lbhav ?? 95}</span>
          </div>
          <div className={`back casino-bl-box-item${suspCls(totalA)}`} onClick={isSusp(totalA) || !totalOdds(totalA, 'back') ? undefined : () => handleBet(totalA.sid, 'back', totalOdds(totalA, 'back'), totalItem(totalA, 'back'))}>
            <span>{totalA?.b ?? 15}</span> <span className="casino-box-odd">{totalA?.bbhav ?? 105}</span>
          </div>
        </div>
      </div>
      <div className="casino-box-row">
        <div className="casino-nation-name"><b className="pointer">Total B</b> <div className="float-right">{expSpan('Total B')}</div></div>
        <div className="casino-bl-box total-odds">
          <div className={`lay casino-bl-box-item${suspCls(totalB)}`} onClick={isSusp(totalB) || !totalOdds(totalB, 'lay') ? undefined : () => handleBet(totalB.sid, 'lay', totalOdds(totalB, 'lay'), totalItem(totalB, 'lay'))}>
            <span>{totalB?.l ?? 14}</span> <span className="casino-box-odd">{totalB?.lbhav ?? 95}</span>
          </div>
          <div className={`back casino-bl-box-item${suspCls(totalB)}`} onClick={isSusp(totalB) || !totalOdds(totalB, 'back') ? undefined : () => handleBet(totalB.sid, 'back', totalOdds(totalB, 'back'), totalItem(totalB, 'back'))}>
            <span>{totalB?.b ?? 15}</span> <span className="casino-box-odd">{totalB?.bbhav ?? 105}</span>
          </div>
        </div>
      </div>
      <div className="teenpatti2cardsextra mt-3">
        <div className="casino-bl-box casino-bl-boxfull">
          <div className={`back casino-bl-box-item${suspCls(colorPlus)}`} onClick={isSusp(colorPlus) ? undefined : () => handleBet(colorPlus.sid, 'back', colorPlus.b, colorPlus)}>
            <span className="casino-box-odd">Color Plus</span>
          </div>
        </div>
        <div className="teenpatti2cardsextra-book">{expSpan('Color Plus')}</div>
      </div>
    </div>

    {/* Desktop layout */}
    <div className="d-none-small">
      <div className="teen1daycasino-container">

        {/* LEFT: Player A */}
        <div className="teen1dayleft">

          <div className="casino-box-row">
            <div className="casino-nation-name"><b>Player A</b><div className="float-right">{playerSpan('Player A')}</div></div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(playerA)}`}
                onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'back', playerA.b, playerA)}
              >
                <span className="casino-box-odd">{playerA?.b ?? ''}</span>
              </div>
              <div
                className={`lay casino-bl-box-item${suspCls(playerA)}`}
                onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'lay', playerA.l, playerA)}
              >
                <span className="casino-box-odd">{playerA?.l ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="casino-box-row">
            <div className="casino-nation-name"><b>Mini Baccarat A</b><div className="float-right">{exposures?.[mbaccA?.nat] ? <span className={`mr-2 ${exposures[mbaccA?.nat] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures[mbaccA?.nat])}</span> : <span className="mr-2 d-none"></span>}</div></div>
            <div className="casino-bl-box casino-bl-boxfull">
              <div
                className={`back casino-bl-box-item${suspCls(mbaccA)}`}
                onClick={isSusp(mbaccA) ? undefined : () => handleBet(mbaccA.sid, 'back', mbaccA.b, mbaccA)}
              >
                <span className="casino-box-odd">{mbaccA?.b ?? ''}</span>
              </div>
            </div>
          </div>

          <div className="casino-box-row">
            <div className="casino-nation-name"><b className="pointer">Total A</b><div className="float-right">{exposures?.[totalA?.nat] ? <span className={`mr-2 ${exposures[totalA?.nat] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures[totalA?.nat])}</span> : <span className="mr-2 d-none"></span>}</div></div>
            <div className="casino-bl-box total-odds">
              <div
                className={`lay casino-bl-box-item${suspCls(totalA)}`}
                onClick={isSusp(totalA) || !totalOdds(totalA, 'lay') ? undefined : () => handleBet(totalA.sid, 'lay', totalOdds(totalA, 'lay'), totalItem(totalA, 'lay'))}
              >
                <span>{totalA?.l ?? 14}</span><span className="casino-box-odd">{totalA?.lbhav ?? 95}</span>
              </div>
              <div
                className={`back casino-bl-box-item${suspCls(totalA)}`}
                onClick={isSusp(totalA) || !totalOdds(totalA, 'back') ? undefined : () => handleBet(totalA.sid, 'back', totalOdds(totalA, 'back'), totalItem(totalA, 'back'))}
              >
                <span>{totalA?.b ?? 15}</span><span className="casino-box-odd">{totalA?.bbhav ?? 105}</span>
              </div>
            </div>
          </div>

        </div>

        {/* CENTER */}
        <div className="teen1daycenter"></div>

        {/* RIGHT: Player B */}
        <div className="teen1dayright">

          <div className="casino-box-row">
            <div className="casino-nation-name"><b>Player B</b><div className="float-right">{playerSpan('Player B')}</div></div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(playerB)}`}
                onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'back', playerB.b, playerB)}
              >
                <span className="casino-box-odd">{playerB?.b ?? ''}</span>
              </div>
              <div
                className={`lay casino-bl-box-item${suspCls(playerB)}`}
                onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'lay', playerB.l, playerB)}
              >
                <span className="casino-box-odd">{playerB?.l ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="casino-box-row">
            <div className="casino-nation-name"><b>Mini Baccarat B</b><div className="float-right">{exposures?.[mbaccB?.nat] ? <span className={`mr-2 ${exposures[mbaccB?.nat] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures[mbaccB?.nat])}</span> : <span className="mr-2 d-none"></span>}</div></div>
            <div className="casino-bl-box casino-bl-boxfull">
              <div
                className={`back casino-bl-box-item${suspCls(mbaccB)}`}
                onClick={isSusp(mbaccB) ? undefined : () => handleBet(mbaccB.sid, 'back', mbaccB.b, mbaccB)}
              >
                <span className="casino-box-odd">{mbaccB?.b ?? ''}</span>
              </div>
            </div>
          </div>

          <div className="casino-box-row">
            <div className="casino-nation-name"><b className="pointer">Total B</b><div className="float-right">{exposures?.[totalB?.nat] ? <span className={`mr-2 ${exposures[totalB?.nat] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures[totalB?.nat])}</span> : <span className="mr-2 d-none"></span>}</div></div>
            <div className="casino-bl-box total-odds">
              <div
                className={`lay casino-bl-box-item${suspCls(totalB)}`}
                onClick={isSusp(totalB) || !totalOdds(totalB, 'lay') ? undefined : () => handleBet(totalB.sid, 'lay', totalOdds(totalB, 'lay'), totalItem(totalB, 'lay'))}
              >
                <span>{totalB?.l ?? 14}</span><span className="casino-box-odd">{totalB?.lbhav ?? 95}</span>
              </div>
              <div
                className={`back casino-bl-box-item${suspCls(totalB)}`}
                onClick={isSusp(totalB) || !totalOdds(totalB, 'back') ? undefined : () => handleBet(totalB.sid, 'back', totalOdds(totalB, 'back'), totalItem(totalB, 'back'))}
              >
                <span>{totalB?.b ?? 15}</span><span className="casino-box-odd">{totalB?.bbhav ?? 105}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Extra: Color Plus */}
      <div className="teenpatti2cardsextra mt-3">
        <div className="casino-bl-box casino-bl-boxfull">
          <div
            className={`back casino-bl-box-item${suspCls(colorPlus)}`}
            onClick={isSusp(colorPlus) ? undefined : () => handleBet(colorPlus.sid, 'back', colorPlus.b, colorPlus)}
          >
            <span className="casino-box-odd">Color Plus</span>
          </div>
        </div>
        <div className="teenpatti2cardsextra-book">{expSpan('Color Plus')}</div>
      </div>

    </div>
    </>
  );
});

export default BetTableTeenpatti2Cards;
