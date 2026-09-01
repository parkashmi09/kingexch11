import { memo } from 'react';

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function findBySid(sub, sid) {
  return sub.find((s) => s.sid === sid);
}

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
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

const BetTableDum10 = memo(function BetTableDum10({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  // Main market: sid 1 carries the WHOLE market — back price in `b`, lay
  // price in `l`, one gstatus (verified live: sid 1 OPEN with b=1.15/l=1.2
  // while sid 2 duplicates the nat but is permanently SUSPENDED with 0/0).
  // Driving the lay box off sid 2 kept it locked forever.
  const mainItem = findBySid(sub, 1);
  const mainNat = mainItem?.nat || 'Next Total 100 or More';
  const laySusp = isSusp(mainItem) || !Number(mainItem?.l);

  // Fancy markets
  const even = findByNat(sub, 'Even');
  const odd = findByNat(sub, 'Odd');
  const red = findByNat(sub, 'Red');
  const black = findByNat(sub, 'Black');

  return (
    <>
      {/* ── Main Market ──
          Booked two-way: the backend stores "<nat>back" = P/L if the total
          LANDS and "<nat>lay" = P/L if it doesn't. Shown stacked in one
          column, lands-value on top: for a back bet that reads profit over
          worst exposure, for a lay bet worst exposure over profit — exactly
          the two sides of the book. */}
      <div className="casino-box-row">
        <div className="casino-nation-name">
          <b>{mainNat}</b>
          <div className="float-right mr-2">
            <div className="d-block"><ExposureSpan value={exposures?.[`${mainNat}back`]} /></div>
            <div className="d-block"><ExposureSpan value={exposures?.[`${mainNat}lay`]} /></div>
          </div>
        </div>
        <div className="casino-bl-box">
          <div
            className={`back casino-bl-box-item${suspCls(mainItem)}`}
            onClick={isSusp(mainItem) ? undefined : () => handleBet(mainItem.sid, 'back', mainItem.b, mainItem)}
          >
            <span className="casino-box-odd">{mainItem?.b || 0}</span>
          </div>
          <div
            className={`lay casino-bl-box-item${laySusp ? ' suspended' : ''}`}
            onClick={laySusp ? undefined : () => handleBet(mainItem.sid, 'lay', mainItem.l, mainItem)}
          >
            <span className="casino-box-odd">{mainItem?.l || 0}</span>
          </div>
        </div>
      </div>

      {/* ── Fancy Markets (Even / Odd / Red / Black) ── */}
      <div className="dkd-other mt-2">
        {/* Header row: odds values */}
        <div className="casino-box-row">
          <div className="casino-bl-box"><b>{even?.b || 0}</b></div>
          <div className="casino-bl-box"><b>{odd?.b || 0}</b></div>
          <div className="casino-bl-box"><b>{red?.b || 0}</b></div>
          <div className="casino-bl-box"><b>{black?.b || 0}</b></div>
        </div>

        {/* Bet row: clickable cells */}
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
        </div>
      </div>
    </>
  );
});

export default BetTableDum10;
