import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

// The Odd/Even/Black/Red/Low/High "Card N" runners carry a RUNNING card counter
// in their nat that climbs as the round deals cards ("Even Card 1" → "Even Card
// 7") and resets every round — so a bet stored at one count ("Even Card 6") stops
// matching the live nat moments later and its exposure would vanish from the
// runner. The exposure hook also publishes a counter-stripped base key ("Even
// Card") that aggregates every count, so look that up first and keep the
// worst-case figure pinned under the runner all round. Falls back to the exact
// nat if there is no trailing number. (Baccarat 1/2 and the Card-value bets keep
// EXACT-nat lookups instead: their number is an identity, not a counter, and a
// shared base key would collide the two hands / every card value.)
function cardRunnerBook(exposures, item) {
  if (!exposures || !item?.nat) return 0;
  const base = item.nat.match(/^(.+?)\s+\d+$/)?.[1];
  return (base && exposures[base]) || exposures[item.nat] || 0;
}

const ODD_VALS = ['A', '3', '5', '7', '9'];
const EVEN_VALS = ['2', '4', '6', '8', '10'];
const LOW_VALS = ['A', '2', '3', '4', '5'];
const HIGH_VALS = ['6', '7', '8', '9', '10'];
const CARD_GRID_VALS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

function CardImgRow({ vals }) {
  return (
    <div className="d-flex">
      {vals.map((v) => (
        <div key={v} className="card-image ml-1">
          <img src={`/assets/front/img/cards/single/${v}.jpg`} alt={v} />
        </div>
      ))}
    </div>
  );
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

const BetTableNoteNum = memo(function BetTableNoteNum({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const odd = sub.find((s) => s.subtype === 'odd');
  const even = sub.find((s) => s.subtype === 'even');
  const black = sub.find((s) => s.subtype === 'black');
  const red = sub.find((s) => s.subtype === 'red');
  const low = sub.find((s) => s.subtype === 'low');
  const high = sub.find((s) => s.subtype === 'high');
  const baccItems = sub.filter((s) => s.subtype === 'bacc');
  const bacc1 = baccItems[0] || null;
  const bacc2 = baccItems[1] || null;
  const cardItem = sub.find((s) => s.subtype === 'card');
  const cardOdds = cardItem?.odds || [];

  return (
    <>
      {/* ── Desktop layout ── */}
      <div className="container-fluid container-fluid-5">
        <div className="row row5 d-none-small">
          {/* Row 1: Odd, Black, Low */}
          <div className="col-4 oe-cards">
            <div className="casino-box-row">
              <div className="casino-nation-name">
                <b>{odd?.nat || 'Odd Card'}</b>
                <CardImgRow vals={ODD_VALS} />
              </div>
              <div className="casino-bl-box">
                <div className={`back casino-bl-box-item${suspCls(odd)}`} onClick={isSusp(odd) ? undefined : () => handleBet(odd.sid, 'back', odd.b, odd)}>
                  <span className="casino-box-odd">{odd?.b || 0}</span>
                </div>
                <div className={`lay casino-bl-box-item${suspCls(odd)}`} onClick={isSusp(odd) ? undefined : () => handleBet(odd.sid, 'lay', odd.l, odd)}>
                  <span className="casino-box-odd">{odd?.l || 0}</span>
                </div>
              </div>
              <div class="casino-nation-name"><ExposureSpan value={cardRunnerBook(exposures, odd)} /></div>
            </div>
          </div>
          <div className="col-4">
            <div className="casino-box-row">
              <div className="casino-nation-name">
                <div className="casino-card-img">
                  <span>
                    <img src="/assets/front/img/cards/spade.png" alt="spade" />
                    {' '}
                    <img src="/assets/front/img/cards/club.png" alt="club" />
                  </span>
                </div>
              </div>
              <div className="casino-bl-box">
                <div className={`back casino-bl-box-item${suspCls(black)}`} onClick={isSusp(black) ? undefined : () => handleBet(black.sid, 'back', black.b, black)}>
                  <span className="casino-box-odd">{black?.b || 0}</span>
                </div>
                <div className={`lay casino-bl-box-item${suspCls(black)}`} onClick={isSusp(black) ? undefined : () => handleBet(black.sid, 'lay', black.l, black)}>
                  <span className="casino-box-odd">{black?.l || 0}</span>
                </div>
              </div>
              <div class="casino-nation-name"><ExposureSpan value={cardRunnerBook(exposures, black)} /></div>
            </div>
          </div>
          <div className="col-4 oe-cards">
            <div className="casino-box-row">
              <div className="casino-nation-name">
                <b>{low?.nat || 'Low Card'}</b>
                <CardImgRow vals={LOW_VALS} />
              </div>
              <div className="casino-bl-box">
                <div className={`back casino-bl-box-item${suspCls(low)}`} onClick={isSusp(low) ? undefined : () => handleBet(low.sid, 'back', low.b, low)}>
                  <span className="casino-box-odd">{low?.b || 0}</span>
                </div>
                <div className={`lay casino-bl-box-item${suspCls(low)}`} onClick={isSusp(low) ? undefined : () => handleBet(low.sid, 'lay', low.l, low)}>
                  <span className="casino-box-odd">{low?.l || 0}</span>
                </div>
              </div>
              <div class="casino-nation-name"><ExposureSpan value={cardRunnerBook(exposures, low)} /></div>
            </div>
          </div>
          {/* Row 2: Even, Red, High */}
          <div className="col-4 oe-cards">
            <div className="casino-box-row">
              <div className="casino-nation-name">
                <b>{even?.nat || 'Even Card'}</b>
                <CardImgRow vals={EVEN_VALS} />
              </div>
              <div className="casino-bl-box">
                <div className={`back casino-bl-box-item${suspCls(even)}`} onClick={isSusp(even) ? undefined : () => handleBet(even.sid, 'back', even.b, even)}>
                  <span className="casino-box-odd">{even?.b || 0}</span>
                </div>
                <div className={`lay casino-bl-box-item${suspCls(even)}`} onClick={isSusp(even) ? undefined : () => handleBet(even.sid, 'lay', even.l, even)}>
                  <span className="casino-box-odd">{even?.l || 0}</span>
                </div>
              </div>
              <div class="casino-nation-name"><ExposureSpan value={cardRunnerBook(exposures, even)} /></div>
            </div>
          </div>
          <div className="col-4">
            <div className="casino-box-row">
              <div className="casino-nation-name">
                <div className="casino-card-img">
                  <span>
                    <img src="/assets/front/img/cards/heart.png" alt="heart" />
                    {' '}
                    <img src="/assets/front/img/cards/diamond.png" alt="diamond" />
                  </span>
                </div>
              </div>
              <div className="casino-bl-box">
                <div className={`back casino-bl-box-item${suspCls(red)}`} onClick={isSusp(red) ? undefined : () => handleBet(red.sid, 'back', red.b, red)}>
                  <span className="casino-box-odd">{red?.b || 0}</span>
                </div>
                <div className={`lay casino-bl-box-item${suspCls(red)}`} onClick={isSusp(red) ? undefined : () => handleBet(red.sid, 'lay', red.l, red)}>
                  <span className="casino-box-odd">{red?.l || 0}</span>
                </div>
              </div>
              <div class="casino-nation-name"><ExposureSpan value={cardRunnerBook(exposures, red)} /></div>
            </div>
          </div>
          <div className="col-4 oe-cards">
            <div className="casino-box-row">
              <div className="casino-nation-name">
                <b>{high?.nat || 'High Card'}</b>
                <CardImgRow vals={HIGH_VALS} />
              </div>
              <div className="casino-bl-box">
                <div className={`back casino-bl-box-item${suspCls(high)}`} onClick={isSusp(high) ? undefined : () => handleBet(high.sid, 'back', high.b, high)}>
                  <span className="casino-box-odd">{high?.b || 0}</span>
                </div>
                <div className={`lay casino-bl-box-item${suspCls(high)}`} onClick={isSusp(high) ? undefined : () => handleBet(high.sid, 'lay', high.l, high)}>
                  <span className="casino-box-odd">{high?.l || 0}</span>
                </div>
              </div>
              <div class="casino-nation-name"><ExposureSpan value={cardRunnerBook(exposures, high)} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="container-fluid container-fluid-5">
        <div className="row row5 d-none-big">
          <div className="casino-bl-box oe-cards">
            <div className="casino-bl-box-item casino-odds-name">
              <b>{odd?.nat || 'Odd Card'}</b>
              <CardImgRow vals={ODD_VALS} />
              <span className="text-left w-100"><ExposureSpan value={cardRunnerBook(exposures, odd)} /></span>
            </div>
            <div className={`back casino-bl-box-item${suspCls(odd)}`} onClick={isSusp(odd) ? undefined : () => handleBet(odd.sid, 'back', odd.b, odd)}>
              <span className="casino-box-odd">{odd?.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(odd)}`} onClick={isSusp(odd) ? undefined : () => handleBet(odd.sid, 'lay', odd.l, odd)}>
              <span className="casino-box-odd">{odd?.l || 0}</span>
            </div>
          </div>
          <div className="casino-bl-box oe-cards">
            <div className="casino-bl-box-item casino-odds-name">
              <b>{even?.nat || 'Even Card'}</b>
              <CardImgRow vals={EVEN_VALS} />
              <span className="text-left w-100"><ExposureSpan value={cardRunnerBook(exposures, even)} /></span>
            </div>
            <div className={`back casino-bl-box-item${suspCls(even)}`} onClick={isSusp(even) ? undefined : () => handleBet(even.sid, 'back', even.b, even)}>
              <span className="casino-box-odd">{even?.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(even)}`} onClick={isSusp(even) ? undefined : () => handleBet(even.sid, 'lay', even.l, even)}>
              <span className="casino-box-odd">{even?.l || 0}</span>
            </div>
          </div>
          <div className="casino-bl-box">
            <div className="casino-bl-box-item casino-odds-name">
              <div className="casino-card-img">
                <span>
                  <img src="/assets/front/img/cards/spade.png" alt="spade" />
                  {' '}
                  <img src="/assets/front/img/cards/club.png" alt="club" />
                </span>
              </div>
              <span className="text-left w-100"><ExposureSpan value={cardRunnerBook(exposures, black)} /></span>
            </div>
            <div className={`back casino-bl-box-item${suspCls(black)}`} onClick={isSusp(black) ? undefined : () => handleBet(black.sid, 'back', black.b, black)}>
              <span className="casino-box-odd">{black?.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(black)}`} onClick={isSusp(black) ? undefined : () => handleBet(black.sid, 'lay', black.l, black)}>
              <span className="casino-box-odd">{black?.l || 0}</span>
            </div>
          </div>
          <div className="casino-bl-box">
            <div className="casino-bl-box-item casino-odds-name">
              <div className="casino-card-img">
                <span>
                  <img src="/assets/front/img/cards/heart.png" alt="heart" />
                  {' '}
                  <img src="/assets/front/img/cards/diamond.png" alt="diamond" />
                </span>
              </div>
              <span className="text-left w-100"><ExposureSpan value={cardRunnerBook(exposures, red)} /></span>
            </div>
            <div className={`back casino-bl-box-item${suspCls(red)}`} onClick={isSusp(red) ? undefined : () => handleBet(red.sid, 'back', red.b, red)}>
              <span className="casino-box-odd">{red?.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(red)}`} onClick={isSusp(red) ? undefined : () => handleBet(red.sid, 'lay', red.l, red)}>
              <span className="casino-box-odd">{red?.l || 0}</span>
            </div>
          </div>
          <div className="casino-bl-box oe-cards">
            <div className="casino-bl-box-item casino-odds-name">
              <b>{low?.nat || 'Low Card'}</b>
              <CardImgRow vals={LOW_VALS} />
              <span className="text-left w-100"><ExposureSpan value={cardRunnerBook(exposures, low)} /></span>
            </div>
            <div className={`back casino-bl-box-item${suspCls(low)}`} onClick={isSusp(low) ? undefined : () => handleBet(low.sid, 'back', low.b, low)}>
              <span className="casino-box-odd">{low?.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(low)}`} onClick={isSusp(low) ? undefined : () => handleBet(low.sid, 'lay', low.l, low)}>
              <span className="casino-box-odd">{low?.l || 0}</span>
            </div>
          </div>
          <div className="casino-bl-box oe-cards">
            <div className="casino-bl-box-item casino-odds-name">
              <b>{high?.nat || 'High Card'}</b>
              <CardImgRow vals={HIGH_VALS} />
              <span className="text-left w-100"><ExposureSpan value={cardRunnerBook(exposures, high)} /></span>
            </div>
            <div className={`back casino-bl-box-item${suspCls(high)}`} onClick={isSusp(high) ? undefined : () => handleBet(high.sid, 'back', high.b, high)}>
              <span className="casino-box-odd">{high?.b || 0}</span>
            </div>
            <div className={`lay casino-bl-box-item${suspCls(high)}`} onClick={isSusp(high) ? undefined : () => handleBet(high.sid, 'lay', high.l, high)}>
              <span className="casino-box-odd">{high?.l || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Baccarat + Card grid (shared) ── */}
      <div className="container-fluid container-fluid-5">
        <div className="row row5">
          <div className="col-md-4 col-12 note-baccarat">
            <div className="casino-box-row">
              <div className="casino-nation-name">
                <b>Baccarat 1</b>
                <span className="text-yellow"> (1st, 2nd, 3rd card)</span>
              </div>
              <div className="casino-bl-box">
                <div className={`back casino-bl-box-item${suspCls(bacc1)}`} onClick={isSusp(bacc1) ? undefined : () => handleBet(bacc1.sid, 'back', bacc1.b, bacc1)}>
                  <span className="casino-box-odd">{bacc1?.b || 0}</span>
                  <ExposureSpan value={exposures?.[bacc1?.nat]} />
                </div>
              </div>
            </div>
            <div className="casino-box-row">
              <div className="casino-nation-name">
                <b>Baccarat 2</b>
                <span className="text-yellow"> (4th, 5th, 6th card)</span>
              </div>
              <div className="casino-bl-box">
                <div className={`back casino-bl-box-item${suspCls(bacc2)}`} onClick={isSusp(bacc2) ? undefined : () => handleBet(bacc2.sid, 'back', bacc2.b, bacc2)}>
                  <span className="casino-box-odd">{bacc2?.b || 0}</span>
                  <ExposureSpan value={exposures?.[bacc2?.nat]} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-8 col-12 note-cards">
            <div className="casino-cards text-center mt-1">
              {CARD_GRID_VALS.map((val, i) => {
                const oddsEntry = cardOdds.find((o) => o.sno === i + 1) || cardOdds[i] || null;
                const susp = isSusp(cardItem) || !oddsEntry;
                const cardOdd = oddsEntry?.b ?? 0;
                return (
                  <div
                    key={val}
                    className="casino-card-item"
                    onClick={susp ? undefined : () => handleBet(cardItem.sid, 'back', cardOdd, { ...oddsEntry, nat: `${cardItem.nat} ${val}` })}
                  >
                    <div className="casino-book">{cardOdd}</div>
                    <div className={`card-image${susp ? ' suspended' : ''}`}>
                      <img src={`/assets/front/img/cards/${val}.png`} alt={val} />
                    </div>
                    <ExposureSpan value={exposures?.[oddsEntry?.nat]} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default BetTableNoteNum;
