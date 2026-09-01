import { memo } from 'react';

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function findBySid(sub, sid) {
  return sub.find((s) => s.sid === sid || s.sid === String(sid));
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

const CARD_LABELS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const CARD_IMG_BASE = '/assets/front/img/cards';

function CardImg({ rank }) {
  return <img src={`${CARD_IMG_BASE}/${rank}.png`} alt={rank} />;
}

const DragonTigerSide = memo(function DragonTigerSide({
  label,
  labelClass,
  even,
  odd,
  black,
  red,
  cardItems,
  cardOdds,
  onBet, exposures,
}) {
  return (
    <>
      <div>
        <div className="casino-box-row justify-content-center casino-odds">
          <div className="text-left w-100">
            <b className={labelClass}>{label}</b>
          </div>
        </div>

        <div className="casino-box-row">
          <div className="casino-bl-box"><b>{even?.b ?? 0}</b></div>
          <div className="casino-bl-box"><b>{odd?.b ?? 0}</b></div>
          <div className="casino-bl-box"><b>{black?.b ?? 0}</b></div>
          <div className="casino-bl-box"><b>{red?.b ?? 0}</b></div>
        </div>

        <div className="casino-box-row">
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(even)}`}
              onClick={isSusp(even) ? undefined : () => onBet(even.sid, 'back', even.b, even)}
            >
              <span className="casino-box-odd">Even</span>
              <ExposureSpan value={exposures?.[even?.nat]} />
            </div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(odd)}`}
              onClick={isSusp(odd) ? undefined : () => onBet(odd.sid, 'back', odd.b, odd)}
            >
              <span className="casino-box-odd">Odd</span>
              <ExposureSpan value={exposures?.[odd?.nat]} />
            </div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item casino-card-img${suspCls(black)}`}
              onClick={isSusp(black) ? undefined : () => onBet(black.sid, 'back', black.b, black)}
            >
              <span>
                <img src={`${CARD_IMG_BASE}/spade.png`} alt="spade" />
                {' '}
                <img src={`${CARD_IMG_BASE}/club.png`} alt="club" />
              </span>
              <ExposureSpan value={exposures?.[black?.nat]} />
            </div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item casino-card-img${suspCls(red)}`}
              onClick={isSusp(red) ? undefined : () => onBet(red.sid, 'back', red.b, red)}
            >
              <span>
                <img src={`${CARD_IMG_BASE}/heart.png`} alt="heart" />
                {' '}
                <img src={`${CARD_IMG_BASE}/diamond.png`} alt="diamond" />
              </span>
              <ExposureSpan value={exposures?.[red?.nat]} />
            </div>
          </div>
        </div>
      </div>

      <div className="casino-box cards-box mt-3">
        <div className="w-100">
          <div className="casino-odds">
            <div className="text-center w-100"><b>{cardOdds ?? 0}</b></div>
          </div>
          <div className="casino-cards text-center mt-1">
            {CARD_LABELS.map((rank, i) => {
              const item = cardItems[i];
              return (
                <div key={rank} className="casino-card-item">
                  <div
                    className={`card-image${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', item.b, item)}
                  >
                    <CardImg rank={rank} />
                  </div>
                  {(() => {
                    const exp = exposures?.[item?.nat] || exposures?.[item?.nat?.toLowerCase()];
                    if (exp && exp !== 0) {
                      return <div className={`casino-book ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</div>;
                    }
                    return <div className="casino-book d-none">0</div>;
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
});

function ExposureSpan({ value }) {
  if (!value || value === 0) return <span className="d-block d-none">0</span>;
  const cls = value < 0 ? 'book-red' : 'book-green';
  return (
    <span className={`d-block ${cls}`}>
      {Math.round(value)}
    </span>
  );
}

const BetTableDT20 = memo(function BetTableDT20({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const dragon = findByNat(sub, 'Dragon');
  const tiger = findByNat(sub, 'Tiger');
  const tie = findByNat(sub, 'Tie');
  const pair = findByNat(sub, 'Pair');

  const dragonEven = findByNat(sub, 'Dragon Even');
  const dragonOdd = findByNat(sub, 'Dragon Odd');
  const dragonBlack = findByNat(sub, 'Dragon Black');
  const dragonRed = findByNat(sub, 'Dragon Red');

  const tigerEven = findByNat(sub, 'Tiger Even');
  const tigerOdd = findByNat(sub, 'Tiger Odd');
  const tigerBlack = findByNat(sub, 'Tiger Black');
  const tigerRed = findByNat(sub, 'Tiger Red');

  const makeCardItem = (side, rank, sideItem) => {
    const apiRank = rank === 'A' ? '1' : rank;
    const found = findByNat(sub, `${side} ${rank}`) || findByNat(sub, `${side} Card ${rank}`) || findByNat(sub, `${side} ${apiRank}`) || findByNat(sub, `${side} Card ${apiRank}`);
    if (found) return found;
    // Synthetic card item using pair odds and side's gstatus
    return {
      sid: `${side}_${rank}`,
      nat: `${side} Card ${rank}`,
      b: pair?.b ?? 0,
      gstatus: sideItem?.gstatus || 'SUSPENDED',
      min: pair?.min || sideItem?.min,
      max: pair?.max || sideItem?.max,
    };
  };

  const dragonCards = CARD_LABELS.map((rank) => makeCardItem('Dragon', rank, dragon));
  const tigerCards = CARD_LABELS.map((rank) => makeCardItem('Tiger', rank, tiger));

  return (
    <>
      <div className="text-right w-100 pr"></div>

      <div className="dtobx-top">
        <div
          className={`dragon-box${suspCls(dragon)}`}
          onClick={isSusp(dragon) ? undefined : () => handleBet(dragon.sid, 'back', dragon.b, dragon)}
        >
          <div className="flex-book">
            <b>Dragon</b>
            <ExposureSpan value={exposures?.[dragon?.nat]} />
          </div>
          <div className="text-center flex-odds">
            <span className="d-block"><b>{dragon?.b ?? 0}</b></span>
          </div>
        </div>

        <div
          className={`tiebox${suspCls(tie)}`}
          onClick={isSusp(tie) ? undefined : () => handleBet(tie.sid, 'back', tie.b, tie)}
        >
          <div>
            <b>Tie</b>
          </div>
          <div className="text-center flex-odds">
            <span className="d-block"><b>{tie?.b ?? 0}</b></span>
            <ExposureSpan value={exposures?.[tie?.nat]} />
          </div>
        </div>

        <div
          className={`tiger-box${suspCls(tiger)}`}
          onClick={isSusp(tiger) ? undefined : () => handleBet(tiger.sid, 'back', tiger.b, tiger)}
        >
          <div className="flex-book">
            <b>Tiger</b>
            <ExposureSpan value={exposures?.[tiger?.nat]} />
          </div>
          <div className="text-center flex-odds">
            <span className="d-block"><b>{tiger?.b ?? 0}</b></span>
          </div>
        </div>

        <div
          className={`pair-box${suspCls(pair)}`}
          onClick={isSusp(pair) ? undefined : () => handleBet(pair.sid, 'back', pair.b, pair)}
        >
          <div>
            <b>Pair</b>
          </div>
          <div className="text-center flex-odds">
            <span className="d-block"><b>{pair?.b ?? 0}</b></span>
            <ExposureSpan value={exposures?.[pair?.nat]} />
          </div>
        </div>
      </div>

      <div className="teen1daycasino-container mt-3">
        <div className="teen1dayleft">
          <DragonTigerSide exposures={exposures}
            label="Dragon"
            labelClass="text-playera"
            even={dragonEven}
            odd={dragonOdd}
            black={dragonBlack}
            red={dragonRed}
            cardItems={dragonCards}
            cardOdds={pair?.b}
            onBet={handleBet}
          />
        </div>

        <div className="teen1daycenter"></div>

        <div className="teen1dayright">
          <DragonTigerSide exposures={exposures}
            label="Tiger"
            labelClass="text-playerb"
            even={tigerEven}
            odd={tigerOdd}
            black={tigerBlack}
            red={tigerRed}
            cardItems={tigerCards}
            cardOdds={pair?.b}
            onBet={handleBet}
          />
        </div>
      </div>
    </>
  );
});

export default BetTableDT20;
