import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

const SUITS = [
  { nat: 'K of spade',   king: '/assets/front/img/cards/KSS.png' },
  { nat: 'K of heart',   king: '/assets/front/img/cards/KHH.png' },
  { nat: 'K of club',    king: '/assets/front/img/cards/KCC.png' },
  { nat: 'K of diamond', king: '/assets/front/img/cards/KDD.png' },
];

const WIN_WITH_PAIRS = [
  { lo: 'Win with 5',  hi: 'Win with 15' },
  { lo: 'Win with 6',  hi: 'Win with 16' },
  { lo: 'Win with 7',  hi: 'Win with 17' },
];

const BetTableRace20 = memo(function BetTableRace20({ gameData, onBet, exposures, totalCards, totalPoints }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const suits = SUITS.map(({ nat, king }) => ({
    king,
    nat,
    item: sub.find((s) => s.nat === nat),
  }));

  // Total points / Total cards are over/under line markets, but the feed exposes no
  // usable line (b/l = 0) and resolveRace20 has no settlement rule for them — a
  // placed bet would freeze forever. Keep them UNPLACEABLE (isSusp(null) → rendered
  // suspended, labels preserved) until the vendor's line + over/under rule is
  // confirmed; re-enable by restoring the sub.find lookups below.
  const totalPointsItem = null; // sub.find((s) => s.nat === 'Total points');
  const totalCardsItem  = null; // sub.find((s) => s.nat === 'Total cards');

  const winWithItems = WIN_WITH_PAIRS.map(({ lo, hi }) => ({
    lo: sub.find((s) => s.nat === lo),
    hi: sub.find((s) => s.nat === hi),
    loLabel: lo,
    hiLabel: hi,
  }));

  return (
    <>
      {/* ── Desktop layout ── */}
      <div className="d-none-small">
        <div className="text-right d-none-big">
          Total Cards: {totalCards} | Total Points: {totalPoints}
        </div>

        <div className="row row5">
          {suits.map(({ king, nat, item }, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="casino-box-row">
                <div className="casino-nation-name">
                  <img src={king} alt={nat} />
                </div>
                <div className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                  >
                    <span className="casino-box-odd">{item?.b ?? 0}</span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
                  >
                    <span className="casino-box-odd">{item?.l ?? 0}</span>
                  </div>
                </div>
                {(() => { const exp = exposures?.[nat]; return exp && exp !== 0
                  ? <div className="casino-nation-name"><span className={exp < 0 ? 'text-danger' : 'text-success'}>{Math.round(exp)}</span></div>
                  : <div className="casino-nation-name d-none"></div>;
                })()}
              </div>
            </div>
          ))}
        </div>

        <div className="row mt-2">
          <div className="col-12 col-md-4">
            <div className="casino-yn">
              <div></div>
              <div className="casino-bl-box">
                <div className="casino-bl-box-item"><b>No</b></div>
                <div className="casino-bl-box-item"><b>Yes</b></div>
              </div>
            </div>

            {[totalPointsItem, totalCardsItem].map((item, i) => (
              <div key={i} className="casino-odds-box casino-yn">
                <div className="casino-odds-box-bhav">
                  <b>{item?.nat || (i === 0 ? 'Total points' : 'Total cards')}</b>
                </div>
                <div className="casino-bl-box">
                  <div
                    className={`lay casino-bl-box-item${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
                  >
                    <span className="casino-box-odd">{item?.l ?? 0}</span>
                    <span>{item?.ls ?? 0}</span>
                  </div>
                  <div
                    className={`back casino-bl-box-item${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                  >
                    <span className="casino-box-odd">{item?.b ?? 0}</span>
                    <span>{item?.bs ?? 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-12 col-md-8 win-with">
            <div className="row row5">
              {winWithItems.map(({ lo, hi, loLabel, hiLabel }, i) => (
                <div key={i} className="col-4">
                  {[{ item: lo, label: loLabel }, { item: hi, label: hiLabel }].map(({ item, label }, j) => (
                    <div key={j} className="casino-odds-box">
                      <div className="casino-odds-box-bhav"><b>{label}</b></div>
                      <div className="casino-bl-box">
                        <div
                          className={`back casino-bl-box-item${suspCls(item)}`}
                          onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                        >
                          <span className="casino-box-odd">{item?.b ?? 0}</span>
                          {(() => { const exp = exposures?.[item?.nat]; return exp && exp !== 0
                            ? <span className={exp < 0 ? 'text-danger' : 'text-success'}>{Math.round(exp)}</span>
                            : <span className="d-none">0</span>;
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="d-none-big">
        <div className="total-points">
          <div>
            <span>Total Cards:</span>
            <span className="text-playerb">{totalCards}</span>
          </div>
          <div>
            <span>Total Points:</span>
            <span className="text-playerb">{totalPoints}</span>
          </div>
        </div>

        <div>
        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item casino-odds-name"></div>
          <div className="casino-bl-box-item">Back</div>
          <div className="casino-bl-box-item">Lay</div>
        </div>

        {suits.map(({ king, nat, item }, i) => {
          const exp = exposures?.[nat];
          return (
          <div key={i} className="casino-bl-box">
            <div data-toggle="modal" className="casino-bl-box-item casino-odds-name">
              <img src={king} alt={nat} />
              {exp && exp !== 0
                ? <span className={`text-success ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</span>
                : <span className="text-success d-none"></span>
              }
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
            >
              <span className="casino-box-odd">{item?.b ?? 0}</span>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
            >
              <span className="casino-box-odd">{item?.l ?? 0}</span>
            </div>
          </div>
          );
        })}

        <div className="casino-bl-box casino-bl-box-title">
          <div className="casino-bl-box-item casino-odds-name"></div>
          <div className="casino-bl-box-item">No</div>
          <div className="casino-bl-box-item">Yes</div>
        </div>

        {[totalPointsItem, totalCardsItem].map((item, i) => {
          const exp = exposures?.[item?.nat];
          return (
          <div key={i} className="casino-bl-box">
            <div data-toggle="modal" className="casino-bl-box-item casino-odds-name">
              <div>
                <span className="d-block">{item?.nat || (i === 0 ? 'Total points' : 'Total cards')}</span>
                {exp && exp !== 0
                  ? <div className={exp < 0 ? 'text-danger' : 'text-success'}>{Math.round(exp)}</div>
                  : <div className="text-success d-none">0</div>
                }
              </div>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
            >
              <span className="casino-box-odd">{item?.l ?? 0}</span>
              <span>{item?.ls ?? 0}</span>
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
            >
              <span className="casino-box-odd">{item?.b ?? 0}</span>
              <span>{item?.bs ?? 0}</span>
            </div>
          </div>
          );
        })}

        <div className="containter container-fluid">
          <div className="row row5 win-with">
            {winWithItems.map(({ lo, hi, loLabel, hiLabel }, i) => (
              <div key={i} className="col-4">
                {[{ item: lo, label: loLabel }, { item: hi, label: hiLabel }].map(({ item, label }, j) => (
                  <div key={j} className="casino-box-row">
                    <div className="casino-nation-name"><b>{label}</b></div>
                    <div className="casino-bl-box">
                      <div
                        className={`back casino-bl-box-item${suspCls(item)}`}
                        onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                      >
                        <span className="casino-box-odd">{item?.b ?? 0}</span>
                        {(() => { const exp = exposures?.[item?.nat]; return exp && exp !== 0
                          ? <span className={exp < 0 ? 'text-danger' : 'text-success'}>{Math.round(exp)}</span>
                          : <span className="d-none">0</span>;
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </>
  );
});

export default BetTableRace20;
