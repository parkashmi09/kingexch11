import { memo } from 'react';

const CARD_IMG_BASE = '/assets/front/img/cards';

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

const DragonTigerDT6Side = memo(function DragonTigerDT6Side({
  label,
  labelClass,
  even,
  odd,
  black,
  red,
  spade,
  heart,
  club,
  diamond,
  onBet,
  exposures,
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

      <div className="mt-3">
        <div className="casino-box-row">
          <div className="casino-bl-box">
            <div className="casino-bl-box-item casino-card-img">
              <img src={`${CARD_IMG_BASE}/spade.png`} alt="spade" />
            </div>
          </div>
          <div className="casino-bl-box">
            <div className="casino-bl-box-item casino-card-img">
              <img src={`${CARD_IMG_BASE}/heart.png`} alt="heart" />
            </div>
          </div>
          <div className="casino-bl-box">
            <div className="casino-bl-box-item casino-card-img">
              <img src={`${CARD_IMG_BASE}/club.png`} alt="club" />
            </div>
          </div>
          <div className="casino-bl-box">
            <div className="casino-bl-box-item casino-card-img">
              <img src={`${CARD_IMG_BASE}/diamond.png`} alt="diamond" />
            </div>
          </div>
        </div>
        <div className="casino-box-row">
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(spade)}`}
              onClick={isSusp(spade) ? undefined : () => onBet(spade.sid, 'back', spade.b, spade)}
            >
              <span className="casino-box-odd">{spade?.b ?? 0}</span>
              <ExposureSpan value={exposures?.[spade?.nat]} />
            </div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(heart)}`}
              onClick={isSusp(heart) ? undefined : () => onBet(heart.sid, 'back', heart.b, heart)}
            >
              <span className="casino-box-odd">{heart?.b ?? 0}</span>
              <ExposureSpan value={exposures?.[heart?.nat]} />
            </div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(club)}`}
              onClick={isSusp(club) ? undefined : () => onBet(club.sid, 'back', club.b, club)}
            >
              <span className="casino-box-odd">{club?.b ?? 0}</span>
              <ExposureSpan value={exposures?.[club?.nat]} />
            </div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(diamond)}`}
              onClick={isSusp(diamond) ? undefined : () => onBet(diamond.sid, 'back', diamond.b, diamond)}
            >
              <span className="casino-box-odd">{diamond?.b ?? 0}</span>
              <ExposureSpan value={exposures?.[diamond?.nat]} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

function ExposureSpan({ value }) {
  if (!value || value === 0) return <span className="d-none">0</span>;
  const cls = value < 0 ? 'book-red' : 'book-green';
  return <span className={cls}>{Math.round(value)}</span>;
}

const BetTableDT6 = memo(function BetTableDT6({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const dragon = findByNat(sub, 'Dragon');
  const pair = findByNat(sub, 'Pair');
  const tiger = findByNat(sub, 'Tiger');

  const dragonEven = findByNat(sub, 'Dragon Even');
  const dragonOdd = findByNat(sub, 'Dragon Odd');
  const dragonBlack = findByNat(sub, 'Dragon Black');
  const dragonRed = findByNat(sub, 'Dragon Red');
  const dragonSpade = findByNat(sub, 'Dragon Spade');
  const dragonHeart = findByNat(sub, 'Dragon Heart');
  const dragonClub = findByNat(sub, 'Dragon Club');
  const dragonDiamond = findByNat(sub, 'Dragon Diamond');

  const tigerEven = findByNat(sub, 'Tiger Even');
  const tigerOdd = findByNat(sub, 'Tiger Odd');
  const tigerBlack = findByNat(sub, 'Tiger Black');
  const tigerRed = findByNat(sub, 'Tiger Red');
  const tigerSpade = findByNat(sub, 'Tiger Spade');
  const tigerHeart = findByNat(sub, 'Tiger Heart');
  const tigerClub = findByNat(sub, 'Tiger Club');
  const tigerDiamond = findByNat(sub, 'Tiger Diamond');

  return (
    <>
      <div className="text-right w-100 pr"></div>

      <div className="dt1dayfancy">
        <div className="casino-box-row dragonfancy">
          <div className="casino-nation-name"><b>Dragon</b></div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(dragon)}`}
              onClick={isSusp(dragon) ? undefined : () => handleBet(dragon.sid, 'back', dragon.b, dragon)}
            >
              <span className="casino-box-odd">{dragon?.b ?? 0}</span>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(dragon)}`}
              onClick={isSusp(dragon) ? undefined : () => handleBet(dragon.sid, 'lay', dragon.l, dragon)}
            >
              <span className="casino-box-odd">{dragon?.l ?? 0}</span>
            </div>
          </div>
          <div className="casino-nation-name text-center w-100">
            <ExposureSpan value={exposures?.[dragon?.nat]} />
          </div>
        </div>

        <div className="casino-box-row pairfancy">
          <div className="casino-nation-name"><b>Pair</b></div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(pair)}`}
              onClick={isSusp(pair) ? undefined : () => handleBet(pair.sid, 'back', pair.b, pair)}
            >
              <span className="casino-box-odd">{pair?.b ?? 0}</span>
            </div>
          </div>
          <div className="casino-nation-name text-center w-100">
            <ExposureSpan value={exposures?.[pair?.nat]} />
          </div>
        </div>

        <div className="casino-box-row tigerfancy">
          <div className="casino-nation-name"><b>Tiger</b></div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(tiger)}`}
              onClick={isSusp(tiger) ? undefined : () => handleBet(tiger.sid, 'back', tiger.b, tiger)}
            >
              <span className="casino-box-odd">{tiger?.b ?? 0}</span>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(tiger)}`}
              onClick={isSusp(tiger) ? undefined : () => handleBet(tiger.sid, 'lay', tiger.l, tiger)}
            >
              <span className="casino-box-odd">{tiger?.l ?? 0}</span>
            </div>
          </div>
          <div className="casino-nation-name text-center w-100">
            <ExposureSpan value={exposures?.[tiger?.nat]} />
          </div>
        </div>
      </div>

      <div className="teen1daycasino-container mt-2">
        <div className="teen1dayleft">
          <DragonTigerDT6Side exposures={exposures}
            label="Dragon"
            labelClass="text-playera"
            even={dragonEven}
            odd={dragonOdd}
            black={dragonBlack}
            red={dragonRed}
            spade={dragonSpade}
            heart={dragonHeart}
            club={dragonClub}
            diamond={dragonDiamond}
            onBet={handleBet}
          />
        </div>

        <div className="teen1daycenter"></div>

        <div className="teen1dayright">
          <DragonTigerDT6Side exposures={exposures}
            label="Tiger"
            labelClass="text-playerb"
            even={tigerEven}
            odd={tigerOdd}
            black={tigerBlack}
            red={tigerRed}
            spade={tigerSpade}
            heart={tigerHeart}
            club={tigerClub}
            diamond={tigerDiamond}
            onBet={handleBet}
          />
        </div>
      </div>
    </>
  );
});

export default BetTableDT6;
