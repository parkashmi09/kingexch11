import { memo, useMemo } from 'react';

/**
 * SID map:
 * 1  = Small      2  = BIG         3  = Any Triple
 * 4  = ODD        5  = Even
 * 6-11 = Double 1-6
 * 12-17 = Triple 1-6
 * 18 = Total 4    19 = Total 5     20 = Total 6
 * 21 = Total 7    22 = Total 8     23 = Total 9
 * 24 = Total 10   25 = Total 11    26 = Total 12
 * 27 = Total 13   28 = Total 14    29 = Total 15
 * 30 = Total 16   31 = Total 17
 * 32 = Combo 1&2  33 = Combo 1&3   34 = Combo 1&4
 * 35 = Combo 1&5  36 = Combo 1&6   37 = Combo 2&3
 * 38 = Combo 2&4  39 = Combo 2&5   40 = Combo 2&6
 * 41 = Combo 3&4  42 = Combo 3&5   43 = Combo 3&6
 * 44 = Combo 4&5  45 = Combo 4&6   46 = Combo 5&6
 * 47 = Single 1   48 = Single 2    49 = Single 3
 * 50 = Single 4   51 = Single 5    52 = Single 6
 */

const DICE_IMG = (n) => `/assets/front/img/dice${n}.png`;

const TOTAL_ODDS = [
  { sid: 18, num: 4,  odds: 50 },
  { sid: 19, num: 5,  odds: 20 },
  { sid: 20, num: 6,  odds: 15 },
  { sid: 21, num: 7,  odds: 12 },
  { sid: 22, num: 8,  odds: 8  },
  { sid: 23, num: 9,  odds: 6  },
  { sid: 24, num: 10, odds: 6  },
  { sid: 25, num: 11, odds: 6  },
  { sid: 26, num: 12, odds: 6  },
  { sid: 27, num: 13, odds: 8  },
  { sid: 28, num: 14, odds: 12 },
  { sid: 29, num: 15, odds: 15 },
  { sid: 30, num: 16, odds: 20 },
  { sid: 31, num: 17, odds: 50 },
];

const COMBOS = [
  { sid: 32, a: 1, b: 2 },
  { sid: 33, a: 1, b: 3 },
  { sid: 34, a: 1, b: 4 },
  { sid: 35, a: 1, b: 5 },
  { sid: 36, a: 1, b: 6 },
  { sid: 37, a: 2, b: 3 },
  { sid: 38, a: 2, b: 4 },
  { sid: 39, a: 2, b: 5 },
  { sid: 40, a: 2, b: 6 },
  { sid: 41, a: 3, b: 4 },
  { sid: 42, a: 3, b: 5 },
  { sid: 43, a: 3, b: 6 },
  { sid: 44, a: 4, b: 5 },
  { sid: 45, a: 4, b: 6 },
  { sid: 46, a: 5, b: 6 },
];

const TOTAL_ODDS_LOW  = TOTAL_ODDS.slice(0, 7);  // 4-10
const TOTAL_ODDS_HIGH = TOTAL_ODDS.slice(7);      // 11-17

const BetTableSicBo2 = memo(function BetTableSicBo2({ gameData, onBet, exposures }) {
  const subMap = useMemo(() => {
    const map = {};
    (gameData?.sub || []).forEach((item) => {
      map[item.sid] = item;
    });
    return map;
  }, [gameData]);

  const isSuspended = (sid) => {
    const item = subMap[sid];
    return !item || item.gstatus === 'SUSPENDED';
  };

  // Per user request, Sic Bo shows NO per-runner exposure/book figure in any
  // cell. The helper is still called from every cell but renders nothing; the
  // real liability lock + header exposure are unaffected (backend legacy
  // single-row, unchanged). `exposures` is intentionally left unused.
  const sbBook = () => null;

  const handleClick = (sid, betType = 'back') => {
    const item = subMap[sid];
    if (!item || item.gstatus === 'SUSPENDED') return;
    // The feed quotes NET "to 1" odds in `b` (Small 1:1, Any Triple 30:1,
    // Triple 150:1, Total 4 50:1 …). settleBetCommon pays stake*odds, so placing
    // at the raw net `b` underpays every winner by one stake and pays an
    // even-money winner ZERO profit. Place at the DECIMAL price b+1 and tag
    // `_netOdds` so useCasinoBet's buffer trusts the click-time decimal (Sic Bo
    // odds are fixed for the round) rather than re-reading the raw net `b` and
    // rejecting the bet. Back liability stays -stake regardless of odds.
    const netB = parseFloat(item.b) || 0;
    onBet(sid, betType, netB > 0 ? netB + 1 : netB, { ...item, _netOdds: true });
  };

  const getOdds = (sid) => subMap[sid]?.b ?? '';

  const suspClass = (sid) => isSuspended(sid) ? ' suspended' : '';

  return (
    <div className="casino-detail">

      {/* ── DESKTOP layout ── */}
      <div className="d-none d-xl-block">

        {/* sicbo-top: 3 flat static title boxes */}
        <div className="sicbo-top">
          <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
          <div className="sicbo-top-box sicbo-title-box">30:1</div>
          <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
        </div>

        <div className="sicbo-middle">

          {/* Small (left) */}
          <div
            className={`sicbo-middle-small sicbo-square-box${suspClass(1)}`}
            onClick={() => handleClick(1)}
          >
            <div>Small</div>
            <div className="sicbo-box-value">4-10</div>
            {sbBook(1)}
          </div>

          {/* Center */}
          <div className="sicbo-middle-midle">

            {/* Top row: ODD | 4-10 | Any Triple | 11-17 | EVEN */}
            <div className="sicbo-middle-top-row">

              <div
                className={`sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd${suspClass(4)}`}
                onClick={() => handleClick(4)}
              >
                <div>ODD</div>
                <div className="sicbo-box-value">{getOdds(4) || 1}:1</div>
                {sbBook(4)}
              </div>

              {TOTAL_ODDS_LOW.map(({ sid, num, odds }) => (
                <div
                  key={sid}
                  className={`sicbo-middle-top-box sicbo-square-box${suspClass(sid)}`}
                  onClick={() => handleClick(sid)}
                >
                  <div>{num}</div>
                  <div className="sicbo-box-value">{getOdds(sid) || odds}:1</div>
                  {sbBook(sid)}
                </div>
              ))}

              <div
                className={`sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd${suspClass(3)}`}
                onClick={() => handleClick(3)}
              >
                <div>Any Triple</div>
                {sbBook(3)}
              </div>

              {TOTAL_ODDS_HIGH.map(({ sid, num, odds }) => (
                <div
                  key={sid}
                  className={`sicbo-middle-top-box sicbo-square-box${suspClass(sid)}`}
                  onClick={() => handleClick(sid)}
                >
                  <div>{num}</div>
                  <div className="sicbo-box-value">{getOdds(sid) || odds}:1</div>
                  {sbBook(sid)}
                </div>
              ))}

              <div
                className={`sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd${suspClass(5)}`}
                onClick={() => handleClick(5)}
              >
                <div>EVEN</div>
                <div className="sicbo-box-value">{getOdds(5) || 1}:1</div>
                {sbBook(5)}
              </div>

            </div>

            {/* Middle row: Singles | Doubles | Triples */}
            <div className="sicbo-middle-middle-row">

              {/* Singles */}
              <div className="sicbo-cube-box-container">
                <div className="sicbo-top-box sicbo-title-box">
                  <span>1:1 On Single</span> <span>2:1 On Double</span> <span>3:1 On Triple</span>
                </div>
                <div className="sicbo-cube-box-group">
                  {[1, 2, 3, 4, 5, 6].map((n) => {
                    const sid = 46 + n;
                    return (
                      <div
                        key={sid}
                        className={`sicbo-cube-box sicbo-square-box sicbo-cube-single${suspClass(sid)}`}
                        onClick={() => handleClick(sid)}
                      >
                        <img src={DICE_IMG(n)} alt={`dice${n}`} />
                        {sbBook(sid)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Doubles */}
              <div className="sicbo-cube-box-container">
                <div className="sicbo-top-box sicbo-title-box">8:1 Each Double</div>
                <div className="sicbo-cube-box-group">
                  {[1, 2, 3, 4, 5, 6].map((n) => {
                    const sid = 5 + n;
                    return (
                      <div
                        key={sid}
                        className={`sicbo-cube-box sicbo-square-box sicbo-cube-double${suspClass(sid)}`}
                        onClick={() => handleClick(sid)}
                      >
                        <img src={DICE_IMG(n)} alt={`dice${n}`} />
                        <img src={DICE_IMG(n)} alt={`dice${n}`} />
                        {sbBook(sid)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Triples */}
              <div className="sicbo-cube-box-container">
                <div className="sicbo-top-box sicbo-title-box">150:1 Each Triple</div>
                <div className="sicbo-cube-box-group">
                  {[1, 2, 3, 4, 5, 6].map((n) => {
                    const sid = 11 + n;
                    return (
                      <div
                        key={sid}
                        className={`sicbo-cube-box sicbo-square-box sicbo-cube-tripple${suspClass(sid)}`}
                        onClick={() => handleClick(sid)}
                      >
                        <img src={DICE_IMG(n)} alt={`dice${n}`} />
                        <img src={DICE_IMG(n)} alt={`dice${n}`} />
                        <img src={DICE_IMG(n)} alt={`dice${n}`} />
                        {sbBook(sid)}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Big (right) */}
          <div
            className={`sicbo-middle-big sicbo-square-box${suspClass(2)}`}
            onClick={() => handleClick(2)}
          >
            <div>Big</div>
            <div className="sicbo-box-value">11-17</div>
            {sbBook(2)}
          </div>

        </div>

        {/* Bottom: combinations wrapped in container */}
        <div className="sicbo-bottom">
          <div className="sicbo-cube-box-container">
            <div className="sicbo-top-box sicbo-title-box">5:1 Two Dice</div>
            <div className="sicbo-cube-box-group">
              {COMBOS.map(({ sid, a, b: bVal }) => (
                <div
                  key={sid}
                  className={`sicbo-cube-box sicbo-square-box sicbo-cube-combination${suspClass(sid)}`}
                  onClick={() => handleClick(sid)}
                >
                  <img src={DICE_IMG(a)} alt={`dice${a}`} />
                  <img src={DICE_IMG(bVal)} alt={`dice${bVal}`} />
                  {sbBook(sid)}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── MOBILE layout ── */}
      <div className="d-xl-none">

        {/* sicbo-top: 3 cube-box-containers */}
        <div className="sicbo-top">

          <div className="sicbo-cube-box-container">
            <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
            <div className="sicbo-cube-box-group">
              <div
                className={`sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd${suspClass(1)}`}
                onClick={() => handleClick(1)}
              >
                <div>SMALL</div>
                <div className="sicbo-box-value">4-10</div>
                {sbBook(1)}
              </div>
              <div
                className={`sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd${suspClass(4)}`}
                onClick={() => handleClick(4)}
              >
                <div>ODD</div>
                <div className="sicbo-box-value">{getOdds(4) || 1}:1</div>
                {sbBook(4)}
              </div>
            </div>
          </div>

          <div className="sicbo-cube-box-container">
            <div className="sicbo-top-box sicbo-title-box">30:1</div>
            <div className="sicbo-cube-box-group">
              <div
                className={`sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd${suspClass(3)}`}
                onClick={() => handleClick(3)}
              >
                <div>Any Triple</div>
                {sbBook(3)}
              </div>
            </div>
          </div>

          <div className="sicbo-cube-box-container">
            <div className="sicbo-top-box sicbo-title-box">1:1 Lose if Any Triple</div>
            <div className="sicbo-cube-box-group">
              <div
                className={`sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd${suspClass(5)}`}
                onClick={() => handleClick(5)}
              >
                <div>EVEN</div>
                <div className="sicbo-box-value">{getOdds(5) || 1}:1</div>
                {sbBook(5)}
              </div>
              <div
                className={`sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd${suspClass(2)}`}
                onClick={() => handleClick(2)}
              >
                <div>BIG</div>
                <div className="sicbo-box-value">11-17</div>
                {sbBook(2)}
              </div>
            </div>
          </div>

        </div>

        <div className="sicbo-middle">

          {/* Left: Doubles + Triples */}
          <div className="sicbo-middle-left">

            <div className="sicbo-cube-box-container">
              <div className="sicbo-top-box sicbo-title-box">8:1 Each Double</div>
              <div className="sicbo-cube-box-group">
                {[1, 2, 3, 4, 5, 6].map((n) => {
                  const sid = 5 + n;
                  return (
                    <div
                      key={sid}
                      className={`sicbo-cube-box sicbo-square-box sicbo-cube-double${suspClass(sid)}`}
                      onClick={() => handleClick(sid)}
                    >
                      <img src={DICE_IMG(n)} alt={`dice${n}`} />
                      <img src={DICE_IMG(n)} alt={`dice${n}`} />
                      {sbBook(sid)}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sicbo-cube-box-container">
              <div className="sicbo-top-box sicbo-title-box">150:1 Each Triple</div>
              <div className="sicbo-cube-box-group">
                {[1, 2, 3, 4, 5, 6].map((n) => {
                  const sid = 11 + n;
                  return (
                    <div
                      key={sid}
                      className={`sicbo-cube-box sicbo-square-box sicbo-cube-tripple${suspClass(sid)}`}
                      onClick={() => handleClick(sid)}
                    >
                      <img src={DICE_IMG(n)} alt={`dice${n}`} />
                      <img src={DICE_IMG(n)} alt={`dice${n}`} />
                      <img src={DICE_IMG(n)} alt={`dice${n}`} />
                      {sbBook(sid)}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right: Numbers 4-17 + Combos + Singles */}
          <div className="sicbo-middle-right">

            <div className="sicbo-middle-top-row">
              {TOTAL_ODDS.map(({ sid, num, odds }) => (
                <div
                  key={sid}
                  className={`sicbo-middle-top-box sicbo-square-box${suspClass(sid)}`}
                  onClick={() => handleClick(sid)}
                >
                  <div>{num}</div>
                  <div className="sicbo-box-value">{getOdds(sid) || odds}:1</div>
                  {sbBook(sid)}
                </div>
              ))}
            </div>

            <div className="sicbo-bottom">
              <div className="sicbo-cube-box-container">
                <div className="sicbo-top-box sicbo-title-box">5:1 Two Dice</div>
                <div className="sicbo-cube-box-group">
                  {COMBOS.map(({ sid, a, b: bVal }) => (
                    <div
                      key={sid}
                      className={`sicbo-cube-box sicbo-square-box sicbo-cube-combination${suspClass(sid)}`}
                      onClick={() => handleClick(sid)}
                    >
                      <img src={DICE_IMG(a)} alt={`dice${a}`} />
                      <img src={DICE_IMG(bVal)} alt={`dice${bVal}`} />
                      {sbBook(sid)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sicbo-middle-middle-row">
              <div className="sicbo-cube-box-container">
                <div className="sicbo-top-box sicbo-title-box">
                  <span>1:1 On Single</span> <span>2:1 On Double</span> <span>3:1 On Triple</span>
                </div>
                <div className="sicbo-cube-box-group">
                  {[1, 2, 3, 4, 5, 6].map((n) => {
                    const sid = 46 + n;
                    return (
                      <div
                        key={sid}
                        className={`sicbo-cube-box sicbo-square-box sicbo-cube-single${suspClass(sid)}`}
                        onClick={() => handleClick(sid)}
                      >
                        <img src={DICE_IMG(n)} alt={`dice${n}`} />
                        {sbBook(sid)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
});

export default BetTableSicBo2;
