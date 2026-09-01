import { memo } from 'react';

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
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

const DICE_IMG_BASE = '/assets/front/img/';

const RULES_ROWS = [
  { win: [3, 3], loss: [1, 1] },
  { win: [5, 5], loss: [2, 2] },
  { win: [6, 6], loss: [4, 4] },
  { win: [5, 6], loss: [1, 2] },
];

const BetTableDoliDana = memo(function BetTableDoliDana({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const playerA   = findByNat(sub, 'Player A');
  const playerB   = findByNat(sub, 'Player B');
  const anyPair   = findByNat(sub, 'Any Pair');
  const odd       = findByNat(sub, 'Odd');
  const even      = findByNat(sub, 'Even');
  const lt7       = findByNat(sub, 'Less than 7');
  const gt7       = findByNat(sub, 'Greater than 7');

  const pairItems = [
    findByNat(sub, '1-1 Pair'),
    findByNat(sub, '2-2 Pair'),
    findByNat(sub, '3-3 Pair'),
    findByNat(sub, '4-4 Pair'),
    findByNat(sub, '5-5 Pair'),
    findByNat(sub, '6-6 Pair'),
  ];

  const sumItems = [
    findByNat(sub, 'Sum Total 2'),
    findByNat(sub, 'Sum Total 3'),
    findByNat(sub, 'Sum Total 4'),
    findByNat(sub, 'Sum Total 5'),
    findByNat(sub, 'Sum Total 6'),
    findByNat(sub, 'Sum Total 7'),
    findByNat(sub, 'Sum Total 8'),
    findByNat(sub, 'Sum Total 9'),
    findByNat(sub, 'Sum Total 10'),
    findByNat(sub, 'Sum Total 11'),
    findByNat(sub, 'Sum Total 12'),
  ];

  return (
    <>
      <div className="doli-main">
        <div className="players-bet">
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>Player A</b>
              <div className="float-right">
                <ExposureSpan value={exposures?.['Player A']} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(playerA)}`}
                onClick={isSusp(playerA) ? undefined : () => handleBet(playerA.sid, 'back', playerA.b, playerA)}
              >
                <span className="casino-box-odd">{playerA?.b || 0}</span>
              </div>
            </div>
          </div>
          <div className="casino-box-row">
            <div className="casino-nation-name">
              <b>Player B</b>
              <div className="float-right">
                <ExposureSpan value={exposures?.['Player B']} />
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`back casino-bl-box-item${suspCls(playerB)}`}
                onClick={isSusp(playerB) ? undefined : () => handleBet(playerB.sid, 'back', playerB.b, playerB)}
              >
                <span className="casino-box-odd">{playerB?.b || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="side-bets">
          <div className="any-pair">
            <div className="doli-odds-box">
              <div className="odd-name">Any Pair</div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(anyPair)}`}
                  onClick={isSusp(anyPair) ? undefined : () => handleBet(anyPair.sid, 'back', anyPair.b, anyPair)}
                >
                  <span className="casino-box-odd">{anyPair?.b || 0}</span>
                  <ExposureSpan value={exposures?.['Any Pair']} />
                </div>
              </div>
            </div>
          </div>

          <div className="odd-even-pair">
            <div className="bets-box">
              <div className="doli-odds-box">
                <div className="odd-name">Odd</div>
                <div className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item${suspCls(odd)}`}
                    onClick={isSusp(odd) ? undefined : () => handleBet(odd.sid, 'back', odd.b, odd)}
                  >
                    <span className="casino-box-odd">{odd?.b || 0}</span>
                    <ExposureSpan value={exposures?.['Odd']} />
                  </div>
                </div>
              </div>
              <div className="doli-odds-box">
                <div className="odd-name">Even</div>
                <div className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item${suspCls(even)}`}
                    onClick={isSusp(even) ? undefined : () => handleBet(even.sid, 'back', even.b, even)}
                  >
                    <span className="casino-box-odd">{even?.b || 0}</span>
                    <ExposureSpan value={exposures?.['Even']} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lucky7-pair">
            <div className="bets-box">
              <div className="doli-odds-box">
                <div className="odd-name">&lt; 7</div>
                <div className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item${suspCls(lt7)}`}
                    onClick={isSusp(lt7) ? undefined : () => handleBet(lt7.sid, 'back', lt7.b, lt7)}
                  >
                    <span className="casino-box-odd">{lt7?.b || 0}</span>
                    <ExposureSpan value={exposures?.['Less than 7']} />
                  </div>
                </div>
              </div>
              <div className="doli-odds-box">
                <div className="seven-box">
                  <img src={`${DICE_IMG_BASE}trape-seven.png`} alt="" />
                </div>
              </div>
              <div className="doli-odds-box">
                <div className="odd-name">&gt; 7</div>
                <div className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item${suspCls(gt7)}`}
                    onClick={isSusp(gt7) ? undefined : () => handleBet(gt7.sid, 'back', gt7.b, gt7)}
                  >
                    <span className="casino-box-odd">{gt7?.b || 0}</span>
                    <ExposureSpan value={exposures?.['Greater than 7']} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="doli-other-bets">
        <div className="particular-pair">
          <h4>Particular Pair</h4>
          <div className="bets-box">
            {pairItems.map((item, i) => (
              <div key={i} className="doli-odds-box">
                <div className="odd-name">{`${i + 1}-${i + 1} Pair`}</div>
                <div className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                  >
                    <span className="casino-box-odd">{item?.b || 0}</span>
                    <ExposureSpan value={exposures?.[`${i + 1}-${i + 1} Pair`]} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sum-odds">
          <h4>Odds of Sum Total</h4>
          <div className="bets-box">
            {sumItems.map((item, i) => (
              <div key={i} className="doli-odds-box">
                <div className="odd-name">{`Sum Total ${i + 2}`}</div>
                <div className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item${suspCls(item)}`}
                    onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                  >
                    <span className="casino-box-odd">{item?.b || 0}</span>
                    <ExposureSpan value={exposures?.[`Sum Total ${i + 2}`]} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 casino-rules-table doli-dana-rules d-none-big">
        <div className="casino-place-bet-title">Rules</div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Win</th>
                <th>Loss</th>
              </tr>
            </thead>
            <tbody>
              {RULES_ROWS.map((row, i) => (
                <tr key={i}>
                  <td>
                    {row.win.map((d, j) => (
                      <img key={j} src={`${DICE_IMG_BASE}dice${d}.png`} alt="" />
                    ))}
                  </td>
                  <td>
                    {row.loss.map((d, j) => (
                      <img key={j} src={`${DICE_IMG_BASE}dice${d}.png`} alt="" />
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
});

export default BetTableDoliDana;
