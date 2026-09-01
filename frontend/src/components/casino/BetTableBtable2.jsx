import { memo } from 'react';

const LABELS = ['A. Don', 'B. Amar Akbar Anthony', 'C. Sahib Bibi Aur Ghulam', 'D. Dharam Veer', 'E. Kis Kis ko Pyaar Karoon', 'F. Ghulam'];
const CARD_FACES = ['J', 'Q', 'K', 'A'];
const CARD_SIDS = [10, 11, 12, 13];

function findBySid(sub, sid) {
  return sub.find((s) => s.sid === sid || s.sid === String(sid));
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

const BetTableBtable2 = memo(function BetTableBtable2({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const don    = findBySid(sub, 1);
  const aaa    = findBySid(sub, 2);
  const sahib  = findBySid(sub, 3);
  const dharam = findBySid(sub, 4);
  const kis    = findBySid(sub, 5);
  const ghulam = findBySid(sub, 6);
  const odd    = findBySid(sub, 7);
  const red    = findBySid(sub, 8);
  const black  = findBySid(sub, 9);
  const cardJ  = findBySid(sub, 10);
  const cardQ  = findBySid(sub, 11);
  const cardK  = findBySid(sub, 12);
  const cardA  = findBySid(sub, 13);
  const dulha  = findBySid(sub, 14);
  const barati = findBySid(sub, 15);

  const mainItems = [don, aaa, sahib, dharam, kis, ghulam];
  const cardItems = [cardJ, cardQ, cardK, cardA];
  const cardsOdds = cardJ?.b ?? cardQ?.b ?? cardK?.b ?? cardA?.b ?? '';

  return (
    <div className="container-fluid container-fluid-5">

      {/* ── DESKTOP: 6 movie items in two rows of 3 col-4s ── */}
      <div className="row row5 d-none-small">
        {mainItems.map((item, i) => (
          <div key={i} className="col-4">
            <div className="casino-box-row">
              <div className="casino-nation-name"><b>{LABELS[i]}</b></div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(item)}`}
                  onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                >
                  <span className="casino-box-odd">{item?.b ?? ''}</span>
                </div>
                <div
                  className={`lay casino-bl-box-item${suspCls(item)}`}
                  onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
                >
                  <span className="casino-box-odd">{item?.l ?? ''}</span>
                </div>
              </div>
              <div className="casino-nation-name">{exposures?.[item?.nat] ? <span className={exposures[item.nat] < 0 ? 'book-red' : 'book-green'}>{Math.round(exposures[item.nat])}</span> : null}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MOBILE: 6 movie items + Odd stacked ── */}
      <div className="row row5 d-none-big">
        {mainItems.map((item, i) => (
          <div key={i} className="casino-bl-box">
            <div className="casino-bl-box-item casino-odds-name">
              <b>{LABELS[i]}</b> <span className="float-right">{exposures?.[item?.nat] ? <span className={exposures[item.nat] < 0 ? 'book-red' : 'book-green'}>{Math.round(exposures[item.nat])}</span> : null}</span>
            </div>
            <div
              className={`back casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
            >
              <span className="casino-box-odd">{item?.b ?? ''}</span>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
            >
              <span className="casino-box-odd">{item?.l ?? ''}</span>
            </div>
          </div>
        ))}

        {/* Odd — mobile only (desktop version is in the shared row below) */}
        <div className="casino-bl-box">
          <div className="casino-bl-box-item casino-odds-name">
            <b>Odd</b> <span className="float-right d-none">0</span>
          </div>
          <div
            className={`back casino-bl-box-item${suspCls(odd)}`}
            onClick={isSusp(odd) ? undefined : () => handleBet(odd.sid, 'back', odd.b, odd)}
          >
            <span className="casino-box-odd">{odd?.b ?? ''}</span>
          </div>
          <div
            className={`lay casino-bl-box-item${suspCls(odd)}`}
            onClick={isSusp(odd) ? undefined : () => handleBet(odd.sid, 'lay', odd.l, odd)}
          >
            <span className="casino-box-odd">{odd?.l ?? ''}</span>
          </div>
        </div>
      </div>

      {/* ── Odd (desktop) + Dulha + Barati row ── */}
      <div className="row row5">
        <div className="col-lg-4 col-12 d-none-small">
          <div className="casino-box-row">
            <div className="casino-nation-name"><b>Odd</b></div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(odd)}`}
                onClick={isSusp(odd) ? undefined : () => handleBet(odd.sid, 'back', odd.b, odd)}
              >
                <span className="casino-box-odd">{odd?.b ?? ''}</span>
              </div>
              <div
                className={`lay casino-bl-box-item${suspCls(odd)}`}
                onClick={isSusp(odd) ? undefined : () => handleBet(odd.sid, 'lay', odd.l, odd)}
              >
                <span className="casino-box-odd">{odd?.l ?? ''}</span>
              </div>
            </div>
            <div className="casino-nation-name d-none">0</div>
          </div>
        </div>

        <div className="col-lg-4 col-6 bc-fancy">
          <div className="casino-box-row">
            <div className="casino-nation-name"><b>{dulha?.b ?? ''}</b></div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(dulha)}`}
                onClick={isSusp(dulha) ? undefined : () => handleBet(dulha.sid, 'back', dulha.b, dulha)}
              >
                <span className="casino-box-odd">Dulha Dulhan K-Q</span> <ExposureSpan value={exposures?.[dulha?.nat]} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-6 bc-fancy">
          <div className="casino-box-row">
            <div className="casino-nation-name"><b>{barati?.b ?? ''}</b></div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(barati)}`}
                onClick={isSusp(barati) ? undefined : () => handleBet(barati.sid, 'back', barati.b, barati)}
              >
                <span className="casino-box-odd">Barati J-A</span> <ExposureSpan value={exposures?.[barati?.nat]} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Suits + Cards row ── */}
      <div className="row row5">
        <div className="col-lg-6 col-12 aaa-oe">
          <div className="casino-box-row">
            <div className="casino-bl-box">
              <b>{black?.b ?? ''}</b>
            </div>
            <div className="casino-bl-box">
              <b>{red?.b ?? ''}</b>
            </div>
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

        <div className="col-lg-6 col-12">
          <div className="text-center w-100">
            <div className="casino-bl-box">
              <div className="casino-bl-box-item"><b>Cards {cardsOdds}</b></div>
            </div>
          </div>
          <div className="casino-cards text-center mt-1">
            {cardItems.map((item, i) => (
              <div key={i} className="casino-card-item">
                <div
                  className={`card-image${suspCls(item)}`}
                  onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                >
                  <img src={`/assets/front/img/cards/${CARD_FACES[i]}.png`} alt={CARD_FACES[i]} />
                </div>
                {exposures?.[item?.nat] ? <div className={`casino-book ${exposures[item.nat] < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exposures[item.nat])}</div> : <div className="casino-book d-none">0</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
});

export default BetTableBtable2;
