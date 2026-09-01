import { useState, useMemo, memo } from 'react';
import { SP_PANA, DP_PANA, TP_PANA, DIGITS } from '../../utils/casinoUtils';

// ─── Jodi ─────────────────────────────────────────────────────────────────────

const JodiTab = memo(function JodiTab({ odd, suspended, onBet, active }) {
  const boxes = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= 9; i++)
      for (let j = 0; j <= 9; j++)
        arr.push(`${i}-${j}`);
    return arr;
  }, []);

  return (
    <div id="jodi" className={`tab-pane jodi${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-full">
          <div className="worli-box-title"><b>{odd}</b></div>
          <div className="worli-box-row">
            {boxes.map((label) => (
              <div key={label} className="worli-odd-box back" onClick={() => onBet(label)}>
                <span className="worli-odd">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Single ───────────────────────────────────────────────────────────────────

const SingleTab = memo(function SingleTab({ odd, suspended, onBet, active }) {
  return (
    <div id="single" className={`tab-pane single${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-left">
          <div className="worli-box-title"><b>{odd}</b></div>
          <div className="worli-box-row">
            {[1, 2, 3, 4, 5].map((d) => (
              <div key={d} className="worli-odd-box back" onClick={() => onBet(`single-${d}`)}>
                <span className="worli-odd">{d}</span>
              </div>
            ))}
          </div>
          <div className="worli-box-row">
            {[6, 7, 8, 9, 0].map((d) => (
              <div key={d} className="worli-odd-box back" onClick={() => onBet(`single-${d}`)}>
                <span className="worli-odd">{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="worli-right">
          <div className="worli-box-title"><b>{odd}</b></div>
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet('single-line1')}>
              <span className="worli-odd">LINE 1</span>
              <span className="d-block">1|2|3|4|5</span>
            </div>
            <div className="worli-odd-box back" onClick={() => onBet('single-odd')}>
              <span className="worli-odd">ODD</span>
              <span className="d-block">1|3|5|7|9</span>
            </div>
          </div>
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet('single-line2')}>
              <span className="worli-odd">LINE 2</span>
              <span className="d-block">6|7|8|9|0</span>
            </div>
            <div className="worli-odd-box back" onClick={() => onBet('single-even')}>
              <span className="worli-odd">EVEN</span>
              <span className="d-block">2|4|6|8|0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Pana ─────────────────────────────────────────────────────────────────────

const PanaTab = memo(function PanaTab({ spOdd, dpOdd, suspended, onBet, active }) {
  const [subTab, setSubTab] = useState('sppana');
  const digitOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div id="pana" className={`tab-pane pana${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-full">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <a data-toggle="pill" href="#sppana"
                className={`nav-link${subTab === 'sppana' ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); setSubTab('sppana'); }}
              >SP PANA({spOdd})</a>
            </li>
            <li className="nav-item">
              <a data-toggle="pill" href="#dppana"
                className={`nav-link${subTab === 'dppana' ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); setSubTab('dppana'); }}
              >DP PANA &amp; TRIO({dpOdd} &amp; {dpOdd})</a>
            </li>
          </ul>
          <div className="tab-content w-100">
            {subTab === 'sppana' && (
              <div id="sppana" className="tab-pane active">
                <div className="worli-box-row">
                  {digitOrder.map((digit) => (
                    <div key={digit} className="worli-odd-box">
                      <span className="worli-odd back">{digit}</span>
                      <div className="worli-sub-odd-box-container">
                        {SP_PANA[digit].map((num) => (
                          <div key={num} className="worli-sub-odd-box back" onClick={() => onBet(`sp-pana-${num}`)}>
                            <span className="worli-odd">{num}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {subTab === 'dppana' && (
              <div id="dppana" className="tab-pane active">
                <h4>DP PANA</h4>
                <div className="worli-box-row">
                  {digitOrder.map((digit) => (
                    <div key={digit} className="worli-odd-box">
                      <span className="worli-odd back">{digit}</span>
                      <div className="worli-sub-odd-box-container">
                        {DP_PANA[digit].map((num) => (
                          <div key={num} className="worli-sub-odd-box back" onClick={() => onBet(`dp-pana-${num}`)}>
                            <span className="worli-odd">{num}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <h4>TP PANA</h4>
                <div className="worli-box-row">
                  {TP_PANA.map((num) => (
                    <div key={num} className="worli-odd-box back" onClick={() => onBet(`tp-pana-${num}`)}>
                      <span className="worli-odd">{num}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Digit Grid (SP, DP, Cycle, Motor SP, 56/64, Common SP/DP, Color DP) ─────

const DigitGridTab = memo(function DigitGridTab({
  id, className, odd, suspended, onBet, prefix,
  rightLabel, onRightClick, rightLabel2, onRightClick2,
  showClearPlace, onClear, onPlaceBet,
  fullWidth, hideTitle, active,
}) {
  const hasRight = rightLabel || rightLabel2;
  return (
    <div id={id} className={`tab-pane ${className || id}${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        {!hideTitle && <div className="worli-box-title"><b>{odd ?? 0}</b></div>}
        {hideTitle && <div className="worli-box-title"><b>&nbsp;</b></div>}
        <div className={hasRight ? 'worli-left' : 'worli-full'}>
          <div className="worli-box-row">
            {[1, 2, 3, 4, 5].map((d) => (
              <div key={d} className="worli-odd-box back" onClick={() => onBet(`${prefix}-${d}`)}>
                <span className="worli-odd">{d}</span>
              </div>
            ))}
          </div>
          <div className="worli-box-row">
            {[6, 7, 8, 9, 0].map((d) => (
              <div key={d} className="worli-odd-box back" onClick={() => onBet(`${prefix}-${d}`)}>
                <span className="worli-odd">{d}</span>
              </div>
            ))}
          </div>
        </div>
        {hasRight && (
          <div className="worli-right">
            {rightLabel && (
              <div className="worli-box-row">
                <div className="worli-odd-box back" onClick={onRightClick}>
                  <span className="worli-odd">{rightLabel}</span>
                </div>
              </div>
            )}
            {rightLabel2 && (
              <div className="worli-box-row">
                <div className="worli-odd-box back" onClick={onRightClick2}>
                  <span className="worli-odd">{rightLabel2}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {showClearPlace && (
        <div className="card-clear-box">
          <div><span></span></div>
          <div>
            <button className="btn btn-danger" onClick={onClear}>Clear</button>
            <button className="btn btn-success ml-1" onClick={onPlaceBet} disabled={suspended}>Place Bet</button>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Trio ─────────────────────────────────────────────────────────────────────

const TrioTab = memo(function TrioTab({ odd, suspended, onBet, active }) {
  return (
    <div id="trio" className={`tab-pane trio${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-full">
          <div className="worli-box-title"><b>{odd}</b></div>
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet('trio-all')}>
              <span className="worli-odd">ALL TRIO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── ABR ──────────────────────────────────────────────────────────────────────

const AbrTab = memo(function AbrTab({ odd, suspended, onBet, active }) {
  return (
    <div id="abr" className={`tab-pane abr${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-box-title"><b>{odd}</b></div>
        <div className="worli-left">
          <div className="worli-box-row">
            {['A', 'B', 'R'].map((k) => (
              <div key={k} className="worli-odd-box back" onClick={() => onBet(`abr-${k}`)}>
                <span className="worli-odd">{k}</span>
              </div>
            ))}
          </div>
          <div className="worli-box-row">
            {['AB', 'AR', 'BR'].map((k) => (
              <div key={k} className="worli-odd-box back" onClick={() => onBet(`abr-${k}`)}>
                <span className="worli-odd">{k}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="worli-right">
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet('abr-all')}>
              <span className="worli-odd">ABR</span>
            </div>
          </div>
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet('abr-cut')}>
              <span className="worli-odd">ABR CUT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Main BetTableWorli3 ──────────────────────────────────────────────────────

const BetTableWorli3 = memo(function BetTableWorli3({
  activeTab, isJodiSuspended, isAllSuspended, onBet, onClear, onPlaceBet,
}) {
  return (
    <div className="casino-box tab-content">
      <JodiTab odd={90} suspended={isJodiSuspended} onBet={onBet} active={activeTab === 'jodi'} />
      <SingleTab odd="9.5" suspended={isAllSuspended} onBet={onBet} active={activeTab === 'single'} />
      <PanaTab spOdd={0} dpOdd={0} suspended={isAllSuspended} onBet={onBet} active={activeTab === 'pana'} />
      <DigitGridTab id="sp" odd={0} suspended={isAllSuspended} onBet={onBet} prefix="sp"
        rightLabel="SP ALL" onRightClick={() => DIGITS.forEach((d) => onBet(`sp-${d}`))} active={activeTab === 'sp'} />
      <DigitGridTab id="dp" odd={0} suspended={isAllSuspended} onBet={onBet} prefix="dp"
        rightLabel="DP ALL" onRightClick={() => DIGITS.forEach((d) => onBet(`dp-${d}`))} active={activeTab === 'dp'} />
      <TrioTab odd={0} suspended={isAllSuspended} onBet={onBet} active={activeTab === 'trio'} />
      <DigitGridTab id="cycle" suspended={isAllSuspended} onBet={onBet} prefix="cycle"
        fullWidth hideTitle showClearPlace onClear={onClear} onPlaceBet={onPlaceBet} active={activeTab === 'cycle'} />
      <DigitGridTab id="motorsp" odd={0} suspended={isAllSuspended} onBet={onBet} prefix="motorsp"
        fullWidth showClearPlace onClear={onClear} onPlaceBet={onPlaceBet} active={activeTab === 'motorsp'} />
      <DigitGridTab id="card56" odd={0} suspended={isAllSuspended} onBet={onBet} prefix="c56"
        rightLabel="56 ALL" onRightClick={() => DIGITS.forEach((d) => onBet(`c56-${d}`))} active={activeTab === 'card56'} />
      <DigitGridTab id="card64" odd={0} suspended={isAllSuspended} onBet={onBet} prefix="c64"
        rightLabel="64 ALL" onRightClick={() => DIGITS.forEach((d) => onBet(`c64-${d}`))} active={activeTab === 'card64'} />
      <AbrTab odd={0} suspended={isAllSuspended} onBet={onBet} active={activeTab === 'abr'} />
      <DigitGridTab id="commonsp" odd={0} suspended={isAllSuspended} onBet={onBet} prefix="commonsp"
        fullWidth active={activeTab === 'commonsp'} />
      <DigitGridTab id="commondp" odd={0} suspended={isAllSuspended} onBet={onBet} prefix="commondp"
        fullWidth active={activeTab === 'commondp'} />
      <DigitGridTab id="colordp" odd={0} suspended={isAllSuspended} onBet={onBet} prefix="colordp"
        rightLabel="COLOR DP ALL" onRightClick={() => DIGITS.forEach((d) => onBet(`colordp-${d}`))} active={activeTab === 'colordp'} />
    </div>
  );
});

export default BetTableWorli3;
