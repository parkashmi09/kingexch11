import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

const CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function ExposureSpan({ value }) {
  if (!value || value === 0) return null;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className="casino-box-expo" style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
      {value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
    </span>
  );
}

function CasinoBook({ value }) {
  if (!value || value === 0) return <div className="casino-book d-none">0</div>;
  const cls = value < 0 ? 'book-red' : 'book-green';
  return <div className={`casino-book ${cls}`}>{Math.round(value)}</div>;
}

const BetTableAAA = memo(function BetTableAAA({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  // Main markets
  const amar = findByNat(sub, 'Amar');
  const akbar = findByNat(sub, 'Akbar');
  const anthony = findByNat(sub, 'Anthony');
  const players = [
    { item: amar, label: 'A. Amar' },
    { item: akbar, label: 'B. Akbar' },
    { item: anthony, label: 'C. Anthony' },
  ];

  // Fancy markets
  const even = findByNat(sub, 'Even');
  const odd = findByNat(sub, 'Odd');
  const black = findByNat(sub, 'Black');
  const red = findByNat(sub, 'Red');
  const under7 = findByNat(sub, 'Under 7');
  const over7 = findByNat(sub, 'Over 7');

  // Card markets
  const cardItems = CARD_VALUES.map((v) => findByNat(sub, `Card ${v}`));
  const cardOdds = cardItems[0]?.b || 0;

  return (
    <div className="container-fluid container-fluid-5">
      {/* ── Main: 3 players mobile ── */}
      <div className="row row5 d-none-big">
        {players.map(({ item, label }, i) => (
          <div key={i} className="casino-bl-box">
            <div className="casino-bl-box-item casino-odds-name">
              <b>{label}</b>
              {(() => { const exp = exposures?.[item?.nat]; return exp && exp !== 0 ? <span className={`float-right ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</span> : <span className="float-right d-none"></span>; })()}
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
            >
              <span className="casino-box-odd">{item?.b || 0}</span>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
            >
              <span className="casino-box-odd">{item?.l || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main: 3 players desktop ── */}
      <div className="row row5 d-none-small">
        {players.map(({ item, label }, i) => (
          <div key={i} className="col-4">
            <div className="casino-box-row">
              <div className="casino-nation-name"><b>{label}</b></div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(item)}`}
                  onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                >
                  <span className="casino-box-odd">{item?.b || 0}</span>
                </div>
                <div
                  className={`lay casino-bl-box-item${suspCls(item)}`}
                  onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
                >
                  <span className="casino-box-odd">{item?.l || 0}</span>
                </div>
              </div>
              {(() => { const exp = exposures?.[item?.nat]; return exp && exp !== 0 ? <div className={`casino-nation-name ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</div> : <div className="casino-nation-name d-none"></div>; })()}
            </div>
          </div>
        ))}
      </div>

      {/* ── Fancy: Even/Odd, Black/Red, Under/Over ── */}
      <div className="row row5 aaa-oe">
        {/* Even / Odd */}
        <div className="col-lg-4 col-12">
          <div className="casino-box-row">
            <div className="casino-bl-box"><b>{even?.b || 0}</b></div>
            <div className="casino-bl-box"><b>{odd?.b || 0}</b></div>
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
          </div>
        </div>

        {/* Black / Red */}
        <div className="col-lg-4 col-12">
          <div className="casino-box-row">
            <div className="casino-bl-box"><b>{black?.b || 0}</b></div>
            <div className="casino-bl-box"><b>{red?.b || 0}</b></div>
          </div>
          <div className="casino-box-row">
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item casino-card-img${suspCls(black)}`}
                onClick={isSusp(black) ? undefined : () => handleBet(black.sid, 'back', black.b, black)}
              >
                <span>
                  <img src="/assets/front/img/cards/spade.png" alt="spade" />
                  {' '}
                  <img src="/assets/front/img/cards/club.png" alt="club" />
                </span>
                <ExposureSpan value={exposures?.[black?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item casino-card-img${suspCls(red)}`}
                onClick={isSusp(red) ? undefined : () => handleBet(red.sid, 'back', red.b, red)}
              >
                <span>
                  <img src="/assets/front/img/cards/heart.png" alt="heart" />
                  {' '}
                  <img src="/assets/front/img/cards/diamond.png" alt="diamond" />
                </span>
                <ExposureSpan value={exposures?.[red?.nat]} />
              </div>
            </div>
          </div>
        </div>

        {/* Under 7 / Over 7 */}
        <div className="col-lg-4 col-12">
          <div className="casino-box-row">
            <div className="casino-bl-box"><b>{under7?.b || 0}</b></div>
            <div className="casino-bl-box"><b>{over7?.b || 0}</b></div>
          </div>
          <div className="casino-box-row">
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(under7)}`}
                onClick={isSusp(under7) ? undefined : () => handleBet(under7.sid, 'back', under7.b, under7)}
              >
                <span className="casino-box-odd">Under 7</span>
                <ExposureSpan value={exposures?.[under7?.nat]} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(over7)}`}
                onClick={isSusp(over7) ? undefined : () => handleBet(over7.sid, 'back', over7.b, over7)}
              >
                <span className="casino-box-odd">Over 7</span>
                <ExposureSpan value={exposures?.[over7?.nat]} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card betting grid (A through K) ── */}
      <div className="mt-2">
        <div className="text-center w-100">
          <div className="casino-bl-box casino-cards-odds-title">
            <div className="casino-bl-box-item"><b>{cardOdds}</b></div>
          </div>
        </div>
        <div className="casino-cards text-center mt-1">
          {CARD_VALUES.map((val, i) => {
            const item = cardItems[i];
            return (
              <div
                key={val}
                className="casino-card-item"
                onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
              >
                <div className={`card-image${suspCls(item)}`}>
                  <img src={`/assets/front/img/cards/${val}.png`} alt={val} />
                </div>
                <CasinoBook value={exposures?.[item?.nat]} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default BetTableAAA;
