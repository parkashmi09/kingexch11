import { useRef, useEffect } from 'react';
import { formatSize } from '../../utils/oddsHelpers';

// Flash a bet cell green (odds-up) / red (odds-down) for 600ms whenever its price
// OR its size changes — same effect the GameDetails market blocks use. Direction
// follows the odds move; when only the size changes it follows the size move.
// Suspended / empty cells (no valid price) never flash.
function flashCell(el, cur, prev) {
  if (!el || !prev) return;
  const curOdds = Number(cur.odds);
  const prevOdds = Number(prev.odds);
  if (!(curOdds > 0) || !(prevOdds > 0)) return;
  const curSize = Number(cur.size) || 0;
  const prevSize = Number(prev.size) || 0;
  const oddsChanged = curOdds !== prevOdds;
  const sizeChanged = curSize !== prevSize;
  if (!oddsChanged && !sizeChanged) return;
  const up = oddsChanged ? curOdds > prevOdds : curSize > prevSize;
  const cls = up ? 'odds-up' : 'odds-down';
  el.classList.remove('odds-up', 'odds-down');
  void el.offsetWidth; // restart the CSS animation
  el.classList.add(cls);
  setTimeout(() => el.classList.remove('odds-up', 'odds-down'), 600);
}

// `sideFirst` mirrors the reference's class order for the "2" column, where the
// side class precedes bl-box (`back bl-box no-odds suspended`); column "1"
// keeps `bl-box no-odds back suspended`.
function OddsCell({ back, lay, header, showSize = false, sideFirst = false, suspended = false, onOddsClick }) {
  // `back`/`lay` are always { odds, size } objects from BetTable.mapGame.
  // Never fall back to the object itself — rendering it crashes React (#31).
  const backOdds = back?.odds ?? null;
  const layOdds = lay?.odds ?? null;
  const backSize = back?.size;
  const laySize = lay?.size;
  // `no-odds` = the price itself is missing (cell shows "—"). The suspended
  // class differs PER TEMPLATE in the reference (verified against live data,
  // Leevon PPK v FK Riga / Malaika Rapolu rows — game OPEN, one side odds:0):
  //  - normal template (col 1 / X / 3-outcome col 2): a missing price ALSO
  //    adds `suspended` → `bl-box no-odds lay suspended`.
  //  - sideFirst template (2-outcome col 2): missing price gets `no-odds`
  //    only → `back bl-box no-odds`; `suspended` there means the whole game
  //    is suspended (Kent v Surrey vs England U19).
  const backNoOdds = backOdds === null || backOdds === undefined;
  const layNoOdds = layOdds === null || layOdds === undefined;
  const backSuspended = suspended || (!sideFirst && backNoOdds);
  const laySuspended = suspended || (!sideFirst && layNoOdds);

  // Flash back/lay cells whenever their price or size changes across a poll.
  const prevRef = useRef(null);
  const backRef = useRef(null);
  const layRef = useRef(null);
  useEffect(() => {
    const cur = [
      { odds: backOdds, size: backSize },
      { odds: layOdds, size: laySize },
    ];
    if (prevRef.current) {
      flashCell(backRef.current, cur[0], prevRef.current[0]);
      flashCell(layRef.current, cur[1], prevRef.current[1]);
    }
    prevRef.current = cur;
  });

  return (
    <div className="point-title">
      {header && (
        <div className="text-center d-none-desktop point-title-header">{header}</div>
      )}
      <div
        ref={backRef}
        className={sideFirst
          ? `back bl-box${backNoOdds ? ' no-odds' : ''}${backSuspended ? ' suspended' : ''}`
          : `bl-box${backNoOdds ? ' no-odds' : ''} back${backSuspended ? ' suspended' : ''}`}
        onClick={onOddsClick && !backNoOdds && !backSuspended
          ? () => onOddsClick('back', { odds: backOdds, size: backSize })
          : undefined}
      >
        <span className="d-block odds">{backNoOdds ? '—' : backOdds}</span>
        {showSize && !backNoOdds && backSize ? <span className="d-block">{formatSize(backSize)}</span> : null}
      </div>
      <div
        ref={layRef}
        className={sideFirst
          ? `lay bl-box${layNoOdds ? ' no-odds' : ''}${laySuspended ? ' suspended' : ''}`
          : `bl-box${layNoOdds ? ' no-odds' : ''} lay${laySuspended ? ' suspended' : ''}`}
        onClick={onOddsClick && !layNoOdds && !laySuspended
          ? () => onOddsClick('lay', { odds: layOdds, size: laySize })
          : undefined}
      >
        <span className="d-block odds">{layNoOdds ? '—' : layOdds}</span>
        {showSize && !layNoOdds && laySize ? <span className="d-block">{formatSize(laySize)}</span> : null}
      </div>
    </div>
  );
}

export default OddsCell;
