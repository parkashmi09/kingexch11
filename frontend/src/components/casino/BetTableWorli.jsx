import { memo } from 'react';

// ── Tab config: id → label, sid mapping ───────────────────────────────────────
export const WORLI_TABS = [
  { id: 'single',   label: 'Single',    sid: 1  },
  { id: 'pana',     label: 'Pana',      sid: 2  },
  { id: 'sp',       label: 'SP',        sid: 3  },
  { id: 'dp',       label: 'DP',        sid: 4  },
  { id: 'trio',     label: 'Trio',      sid: 5  },
  { id: 'cycle',    label: 'Cycle',     sid: 9  },
  { id: 'motorsp',  label: 'Motor SP',  sid: 6  },
  { id: 'card56',   label: '56 Charts', sid: 7  },
  { id: 'card64',   label: '64 Charts', sid: 8  },
  { id: 'abr',      label: 'ABR',       sid: 10 },
  { id: 'commonsp', label: 'Common SP', sid: 11 },
  { id: 'commondp', label: 'Common DP', sid: 12 },
  { id: 'colordp',  label: 'Color DP',  sid: 13 },
];

// Fixed odds per tab type
const ODDS = {
  single:   9.5,
  pana:     140,   // label says SP:140 | DP:240 | TP:700 but pana sub fixed at 140
  sp:       140,
  dp:       240,
  trio:     700,
  cycle:    0,
  motorsp:  140,
  card56:   140,
  card64:   140,
  abr:      0,
  commonsp: 140,
  commondp: 240,
  colordp:  240,
};

// ── Number rows ───────────────────────────────────────────────────────────────
const NUM_ROW_1 = [1, 2, 3, 4, 5];
const NUM_ROW_2 = [6, 7, 8, 9, 0];

function NumBox({ label, onClick }) {
  return (
    <div className="worli-odd-box back" onClick={onClick}>
      <span className="worli-odd">{label}</span>
    </div>
  );
}

function NumRows({ prefix, sid, odds, onBet }) {
  return (
    <>
      <div className="worli-box-row">
        {NUM_ROW_1.map((d) => (
          <NumBox key={d} label={d} onClick={() => onBet(sid, 'back', odds, { sid, nat: `${prefix}-${d}`, b: odds })} />
        ))}
      </div>
      <div className="worli-box-row">
        {NUM_ROW_2.map((d) => (
          <NumBox key={d} label={d} onClick={() => onBet(sid, 'back', odds, { sid, nat: `${prefix}-${d}`, b: odds })} />
        ))}
      </div>
    </>
  );
}

// ── 1. Single ─────────────────────────────────────────────────────────────────

const SingleTab = memo(function SingleTab({ sub, active, onBet }) {
  const sid = 1;
  const odds = ODDS.single;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="single" className={`tab-pane single${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-left">
          <div className="worli-box-title"><b>{odds}</b></div>
          <NumRows prefix="single" sid={sid} odds={odds} onBet={onBet} />
        </div>
        <div className="worli-right">
          <div className="worli-box-title"><b>{odds}</b></div>
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'single-line1', b: odds })}>
              <span className="worli-odd">LINE 1</span>
              <span className="d-block">1|2|3|4|5</span>
            </div>
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'single-odd', b: odds })}>
              <span className="worli-odd">ODD</span>
              <span className="d-block">1|3|5|7|9</span>
            </div>
          </div>
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'single-line2', b: odds })}>
              <span className="worli-odd">LINE 2</span>
              <span className="d-block">6|7|8|9|0</span>
            </div>
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'single-even', b: odds })}>
              <span className="worli-odd">EVEN</span>
              <span className="d-block">2|4|6|8|0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── 2. Pana ───────────────────────────────────────────────────────────────────

const PanaTab = memo(function PanaTab({ sub, active, onBet }) {
  const sid = 2;
  const odds = ODDS.pana;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="pana" className={`tab-pane pana${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-full">
          <div className="worli-box-title"><b>SP:140 | DP:240 | TP:700</b></div>
          <NumRows prefix="pana" sid={sid} odds={odds} onBet={onBet} />
        </div>
      </div>
    </div>
  );
});

// ── 3. SP ─────────────────────────────────────────────────────────────────────

const SpTab = memo(function SpTab({ sub, active, onBet }) {
  const sid = 3;
  const odds = ODDS.sp;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="sp" className={`tab-pane sp${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-box-title"><b>{odds}</b></div>
        <div className="worli-left">
          <NumRows prefix="sp" sid={sid} odds={odds} onBet={onBet} />
        </div>
        <div className="worli-right">
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'sp-all', b: odds })}>
              <span className="worli-odd">SP ALL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── 4. DP ─────────────────────────────────────────────────────────────────────

const DpTab = memo(function DpTab({ sub, active, onBet }) {
  const sid = 4;
  const odds = ODDS.dp;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="dp" className={`tab-pane dp${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-box-title"><b>{odds}</b></div>
        <div className="worli-left">
          <NumRows prefix="dp" sid={sid} odds={odds} onBet={onBet} />
        </div>
        <div className="worli-right">
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'dp-all', b: odds })}>
              <span className="worli-odd">DP ALL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── 5. Trio ───────────────────────────────────────────────────────────────────

const TrioTab = memo(function TrioTab({ sub, active, onBet }) {
  const sid = 5;
  const odds = ODDS.trio;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="trio" className={`tab-pane trio${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-full">
          <div className="worli-box-title"><b>{odds}</b></div>
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'trio-all', b: odds })}>
              <span className="worli-odd">ALL TRIO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── 6. Cycle ──────────────────────────────────────────────────────────────────

const CycleTab = memo(function CycleTab({ sub, active, onBet }) {
  const sid = 9;
  const odds = ODDS.cycle;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="cycle" className={`tab-pane cycle${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-box-title"><b>&nbsp;</b></div>
        <div className="worli-full">
          <NumRows prefix="cycle" sid={sid} odds={odds} onBet={onBet} />
        </div>
      </div>
    </div>
  );
});

// ── 7. Motor SP ───────────────────────────────────────────────────────────────

const MotorSpTab = memo(function MotorSpTab({ sub, active, onBet }) {
  const sid = 6;
  const odds = ODDS.motorsp;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="motorsp" className={`tab-pane motorsp${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-full">
          <div className="worli-box-title"><b>{odds}</b></div>
          <NumRows prefix="motorsp" sid={sid} odds={odds} onBet={onBet} />
        </div>
      </div>
    </div>
  );
});

// ── 8. 56 Charts ─────────────────────────────────────────────────────────────

const Card56Tab = memo(function Card56Tab({ sub, active, onBet }) {
  const sid = 7;
  const odds = ODDS.card56;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="card56" className={`tab-pane card56${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-box-title"><b>{odds}</b></div>
        <div className="worli-left">
          <NumRows prefix="c56" sid={sid} odds={odds} onBet={onBet} />
        </div>
        <div className="worli-right">
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'c56-all', b: odds })}>
              <span className="worli-odd">56 ALL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── 9. 64 Charts ─────────────────────────────────────────────────────────────

const Card64Tab = memo(function Card64Tab({ sub, active, onBet }) {
  const sid = 8;
  const odds = ODDS.card64;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="card64" className={`tab-pane card64${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-box-title"><b>{odds}</b></div>
        <div className="worli-left">
          <NumRows prefix="c64" sid={sid} odds={odds} onBet={onBet} />
        </div>
        <div className="worli-right">
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'c64-all', b: odds })}>
              <span className="worli-odd">64 ALL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── 10. ABR ───────────────────────────────────────────────────────────────────

const AbrTab = memo(function AbrTab({ sub, active, onBet }) {
  const sid = 10;
  const odds = ODDS.abr;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="abr" className={`tab-pane abr${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-box-title"><b>{odds}</b></div>
        <div className="worli-left">
          <div className="worli-box-row">
            {['A', 'B', 'R'].map((k) => (
              <div key={k} className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: `abr-${k}`, b: odds })}>
                <span className="worli-odd">{k}</span>
              </div>
            ))}
          </div>
          <div className="worli-box-row">
            {['AB', 'AR', 'BR'].map((k) => (
              <div key={k} className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: `abr-${k}`, b: odds })}>
                <span className="worli-odd">{k}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="worli-right">
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'abr-all', b: odds })}>
              <span className="worli-odd">ABR</span>
            </div>
          </div>
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'abr-cut', b: odds })}>
              <span className="worli-odd">ABR CUT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── 11. Common SP ─────────────────────────────────────────────────────────────

const CommonSpTab = memo(function CommonSpTab({ sub, active, onBet }) {
  const sid = 11;
  const odds = ODDS.commonsp;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="commonsp" className={`tab-pane commonsp${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-full">
          <div className="worli-box-title"><b>{odds}</b></div>
          <NumRows prefix="commonsp" sid={sid} odds={odds} onBet={onBet} />
        </div>
      </div>
    </div>
  );
});

// ── 12. Common DP ─────────────────────────────────────────────────────────────

const CommonDpTab = memo(function CommonDpTab({ sub, active, onBet }) {
  const sid = 12;
  const odds = ODDS.commondp;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="commondp" className={`tab-pane commondp${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-full">
          <div className="worli-box-title"><b>{odds}</b></div>
          <NumRows prefix="commondp" sid={sid} odds={odds} onBet={onBet} />
        </div>
      </div>
    </div>
  );
});

// ── 13. Color DP ──────────────────────────────────────────────────────────────

const ColorDpTab = memo(function ColorDpTab({ sub, active, onBet }) {
  const sid = 13;
  const odds = ODDS.colordp;
  const suspended = sub?.gstatus === 'SUSPENDED';
  return (
    <div id="colordp" className={`tab-pane colordp${active ? ' active' : ''}`}>
      <div className={`worlibox${suspended ? ' suspended' : ''}`}>
        <div className="worli-box-title"><b>{odds}</b></div>
        <div className="worli-left">
          <NumRows prefix="colordp" sid={sid} odds={odds} onBet={onBet} />
        </div>
        <div className="worli-right">
          <div className="worli-box-row">
            <div className="worli-odd-box back" onClick={() => onBet(sid, 'back', odds, { sid, nat: 'colordp-all', b: odds })}>
              <span className="worli-odd">COLOR DP ALL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Main BetTableWorli ────────────────────────────────────────────────────────

const BetTableWorli = memo(function BetTableWorli({ subMap, activeTab, onBet }) {
  return (
    <div className="casino-box tab-content">
      <SingleTab   sub={subMap[1]}  active={activeTab === 'single'}   onBet={onBet} />
      <PanaTab     sub={subMap[2]}  active={activeTab === 'pana'}     onBet={onBet} />
      <SpTab       sub={subMap[3]}  active={activeTab === 'sp'}       onBet={onBet} />
      <DpTab       sub={subMap[4]}  active={activeTab === 'dp'}       onBet={onBet} />
      <TrioTab     sub={subMap[5]}  active={activeTab === 'trio'}     onBet={onBet} />
      <CycleTab    sub={subMap[9]}  active={activeTab === 'cycle'}    onBet={onBet} />
      <MotorSpTab  sub={subMap[6]}  active={activeTab === 'motorsp'}  onBet={onBet} />
      <Card56Tab   sub={subMap[7]}  active={activeTab === 'card56'}   onBet={onBet} />
      <Card64Tab   sub={subMap[8]}  active={activeTab === 'card64'}   onBet={onBet} />
      <AbrTab      sub={subMap[10]} active={activeTab === 'abr'}      onBet={onBet} />
      <CommonSpTab sub={subMap[11]} active={activeTab === 'commonsp'} onBet={onBet} />
      <CommonDpTab sub={subMap[12]} active={activeTab === 'commondp'} onBet={onBet} />
      <ColorDpTab  sub={subMap[13]} active={activeTab === 'colordp'}  onBet={onBet} />
    </div>
  );
});

export default BetTableWorli;
