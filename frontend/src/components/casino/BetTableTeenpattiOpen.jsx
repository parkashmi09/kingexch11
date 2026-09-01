import { memo } from 'react';
import { cardSrc, parseCards } from './cards/cardUtils';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

const PLAYERS = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * 27 cards dealt 9-way round-robin (8 players + dealer):
 *   Round 1: P1[0], P2[1], ..., P8[7], Dealer[8]
 *   Round 2: P1[9], P2[10], ..., P8[16], Dealer[17]
 *   Round 3: P1[18], P2[19], ..., P8[25], Dealer[26]
 */
function getPlayerCards(codes, n) {
  const i = n - 1;
  return [codes[i] || '1', codes[9 + i] || '1', codes[18 + i] || '1'];
}

function ExposureSpan({ value }) {
  if (!value || value === 0) return <span className="d-none">0</span>;
  return (
    <span className={value < 0 ? 'book-red' : 'book-green'}>
      {Math.round(value)}
    </span>
  );
}

const BetTableTeenpattiOpen = memo(function BetTableTeenpattiOpen({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const cardString = gameData?.card || '';
  const codes = parseCards(cardString);
  const handleBet = onBet || (() => {});

  const findItem = (nat) => sub.find((s) => s.nat === nat);

  return (
    <>
      {/* ── Desktop layout (d-none-small) ── */}
      <div className="casino-box mb-2 d-none-small">
        {/* Card grid */}
        <div className="casino-open-card-box">
          {PLAYERS.map((n) => {
            const cards = getPlayerCards(codes, n);
            return (
              <div key={n}>
                <div><b>{n}</b></div>
                <div>
                  {cards.map((c, i) => (
                    <span key={i}><img src={cardSrc(c)} alt={c} /></span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Header row — Player 1-8 as columns */}
        <div className="casino-box-header">
          <div className="casino-nation-name no-border"></div>
          <div className="casino-bl-box text-right">
            {PLAYERS.map((n) => (
              <div key={n} className="casino-bl-box-item"><span>Player {n}</span></div>
            ))}
          </div>
        </div>

        {/* Bet rows — Odds, Pair Plus, Total */}
        <div className="casino-box-content">
          {/* Odds row */}
          <div className="casino-box-row">
            <div className="casino-nation-name"><b>Odds</b></div>
            <div className="casino-bl-box">
              {PLAYERS.map((n) => {
                const item = findItem(`Player ${n}`);
                return (
                  <div key={n} className={`back casino-bl-box-item${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}>
                    <span className="casino-box-odd">{item?.b || 0}</span>
                    <ExposureSpan value={exposures?.[item?.nat]} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pair Plus row */}
          <div className="casino-box-row">
            <div className="casino-nation-name"><b>Pair Plus</b></div>
            <div className="casino-bl-box">
              {PLAYERS.map((n) => {
                const item = findItem(`Pair Plus ${n}`);
                return (
                  <div key={n} className={`back casino-bl-box-item${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}>
                    <span className="casino-box-odd open-pair">Pair Plus {n}</span>
                    <ExposureSpan value={exposures?.[item?.nat]} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total row */}
          <div className="casino-box-row">
            <div className="casino-nation-name"><b>Total</b></div>
            <div className="casino-bl-box">
              {PLAYERS.map((n) => {
                const item = findItem(`Total ${n}`);
                return (
                  <div key={n} className={`back casino-bl-box-item${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}>
                    <span className="casino-box-odd">{item?.b || 0}</span>
                    <ExposureSpan value={exposures?.[item?.nat]} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout (d-none-big) ── */}
      <div className="casino-box mb-2 d-none-big">
        <div className="casino-box-header">
          <div className="casino-nation-name no-border"></div>
          <div className="casino-bl-box text-right">
            <div className="casino-bl-box-item"><span>Odds</span></div>
            <div className="casino-bl-box-item"><span>Pair Plus</span></div>
            <div className="casino-bl-box-item"><span>Total</span></div>
          </div>
        </div>
        <div className="casino-box-content">
          {PLAYERS.map((n) => {
            const playerItem = findItem(`Player ${n}`);
            const pairItem   = findItem(`Pair Plus ${n}`);
            const totalItem  = findItem(`Total ${n}`);
            const cards = getPlayerCards(codes, n);

            return (
              <div key={n} className="casino-box-row">
                <div className="casino-nation-name">
                  <b>Player {n}</b>
                  <div className="">
                    {cards.map((c, i) => (
                      <span key={i}><img src={cardSrc(c)} alt={c} /></span>
                    ))}
                  </div>
                </div>
                <div className="casino-bl-box">
                  <div className={`back casino-bl-box-item${suspCls(playerItem)}`}
                    onClick={isSusp(playerItem) ? undefined : () => handleBet(playerItem.sid, 'back', playerItem.b, playerItem)}>
                    <span className="casino-box-odd">{playerItem?.b || 0}</span>
                    <ExposureSpan value={exposures?.[playerItem?.nat]} />
                  </div>
                  <div className={`back casino-bl-box-item${suspCls(pairItem)}`}
                    onClick={isSusp(pairItem) ? undefined : () => handleBet(pairItem.sid, 'back', pairItem.b, pairItem)}>
                    <span className="casino-box-odd">Pair Plus {n}</span>
                    <ExposureSpan value={exposures?.[pairItem?.nat]} />
                  </div>
                  <div className={`back casino-bl-box-item${suspCls(totalItem)}`}
                    onClick={isSusp(totalItem) ? undefined : () => handleBet(totalItem.sid, 'back', totalItem.b, totalItem)}>
                    <span className="casino-box-odd">{totalItem?.b || 0}</span>
                    <ExposureSpan value={exposures?.[totalItem?.nat]} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});

export default BetTableTeenpattiOpen;
