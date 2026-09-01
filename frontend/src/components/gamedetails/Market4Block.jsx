import { useState, useRef, useEffect } from 'react';
import { formatOdd, formatSize, formatMax, classifyMarket, isMarketSuspended, isSectionSuspended, formatBookValue } from '../../utils/oddsHelpers';
import { marketHasCashoutPosition, computeCashoutClick } from '../../utils/cashoutUtil';
import { bToastError } from '../BToast';
import MarketTooltip from './MarketTooltip';
import PlaceBetPanel from '../betting/PlaceBetPanel';

function flashCell(el, curOdds, prevOdds) {
  if (!el || prevOdds === null || curOdds <= 0 || prevOdds <= 0 || curOdds === prevOdds) return;
  const cls = curOdds > prevOdds ? 'odds-up' : 'odds-down';
  el.classList.remove('odds-up', 'odds-down');
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove('odds-up', 'odds-down'), 600);
}

function formatPL(val) {
  if (val === undefined || val === null) return null;
  const n = Number(val);
  if (isNaN(n)) return null;
  // Zero is a REAL book value (e.g. 0.00 after offsetting bets) — reference
  // renders a plain "0" with NO book-green/book-red class
  if (n === 0) return { value: '0', className: '' };
  const abs = Math.abs(n);
  const formatted = abs >= 1000 ? abs.toLocaleString('en-IN') : String(Math.round(abs * 100) / 100);
  return { value: n > 0 ? formatted : `-${formatted}`, className: n > 0 ? 'book-green' : 'book-red' };
}

// Best available rung of one side (tno 0 = top of book)
function bestRung(section, otype) {
  return (section.odds || [])
    .filter(o => (o.otype || '').toUpperCase() === otype && o.odds > 0)
    .sort((a, b) => (a.tno || 0) - (b.tno || 0))[0];
}

function Market4Row({ section, marketSuspended, market, marketType, activeBet, onBetClick, onBetChange, runnerPL, matchExposures, marketsRef, matchId, eventName }) {
  const oddsArr = section.odds || [];
  const backs = oddsArr.filter(o => (o.otype || '').toUpperCase() === 'BACK').sort((a, b) => (b.tno || 0) - (a.tno || 0));
  const lays = oddsArr.filter(o => (o.otype || '').toUpperCase() === 'LAY').sort((a, b) => (a.tno || 0) - (b.tno || 0));

  const [b3, b2, b1] = [backs[0], backs[1], backs[2]];
  const [l1, l2, l3] = [lays[0], lays[1], lays[2]];
  const rawStatus = (section.gstatus || '').toUpperCase();
  const sectionActive = rawStatus === 'ACTIVE' || rawStatus === 'OPEN';
  const sectionSuspended = sectionActive ? false : isSectionSuspended(section);
  const suspended = marketSuspended || sectionSuspended;
  // Reference always stamps the row's own gstatus (ACTIVE/OPEN/SUSPENDED)
  const rowTitle = rawStatus || (suspended ? 'SUSPENDED' : 'OPEN');
  const isMatch1 = (market.gtype || '').toLowerCase() === 'match1';

  const cells = [b3, b2, b1, l1, l2, l3];
  const oddsValues = cells.map(c => c?.odds || 0);
  const prevRef = useRef(null);
  const refsArr = useRef([...Array(6)].map(() => null));

  useEffect(() => {
    if (prevRef.current) {
      for (let i = 0; i < 6; i++) {
        flashCell(refsArr.current[i], oddsValues[i], prevRef.current[i]);
      }
    }
    prevRef.current = [...oddsValues];
  });

  const handleCellClick = (oddObj, type) => {
    if (suspended || !oddObj || !onBetClick) return;
    const allSections = market.section || [];
    onBetClick({
      odds: oddObj.odds,
      betType: type,
      team: section.nat || '',
      teamName: section.nat || '',
      marketType,
      market_type: marketType,
      market_id: market.mid,
      selectionId: section.sid,
      event_id: matchId,
      event_name: eventName || '',
      market_name: market.mname || '',
      mname: market.mname || '',
      gtype: market.gtype || '',
      section: allSections,
      runners: allSections.map(s => s.nat || ''),
      outcomes: allSections.map(s => s.nat || ''),
      team_one: allSections[0]?.nat || '',
      team_two: allSections[1]?.nat || '',
      min_stake: section.min || market.min || null,
      max_stake: section.max || market.max || null,
      maxb: market.maxb || null,
      // Sizes must describe the CLICKED rung on the bet side — a plain find()
      // returned the first array element (back3, the worst rung), so a click on
      // back1 13.5/397.2 was reported with back3's 170.01. The opposite side
      // gets its BEST rung (tno 0), not whatever happened to be first.
      back_size: (type === 'back' ? oddObj : bestRung(section, 'BACK'))?.size,
      lay_size: (type === 'lay' ? oddObj : bestRung(section, 'LAY'))?.size,
      market,
    });
  };

  const showPanel = activeBet && activeBet.selectionId === section.sid && (activeBet.market_id || activeBet.market?.mid) === market.mid;

  // Per-runner P&L value from parent
  const runnerName = section.nat || '';
  const plData = runnerPL ? formatPL(runnerPL[runnerName]) : null;

  const runnerExposure = (() => {
    if (!matchExposures || !runnerName) return null;
    const key = runnerName.trim().toLowerCase();
    const mid = market.mid != null ? String(market.mid).trim() : '';
    const val = matchExposures[`${mid}:${key}`];
    // 0 (or 0.00) is a real book value — only an ABSENT key means "no book";
    // reference shows a plain 0 for it, empty only when no bets exist
    return val === undefined || val === null ? null : val;
  })();

  // Suspension is PER CELL (odds 0 → suspended no-val); a cell with live odds
  // keeps rendering them even when the row/market is suspended (reference:
  // Draw No Bet shows back odds under the SUSPENDED overlay).
  const Cell = (o, type, depth, idx) => {
    if (!o || !(o.odds > 0)) {
      return (
        <div key={idx} className={`bl-box ${type} ${depth} suspended no-val`}>
          <span className="d-block odds">—</span>
        </div>
      );
    }
    return (
      <div
        key={idx}
        ref={el => refsArr.current[idx] = el}
        className={`bl-box ${type} ${depth}`}
        onClick={() => handleCellClick(o, type)}
        style={{ cursor: onBetClick && !suspended ? 'pointer' : 'default' }}
      >
        <span className="d-block odds">{formatOdd(o.odds)}</span>
        <span className="d-block">{formatSize(o.size)}</span>
      </div>
    );
  };

  return (
    <>
      <div data-title={rowTitle} className={`bet-table-row${sectionSuspended && (isMatch1 || !marketSuspended) ? ' suspendedtext' : ''}`}>
        <div className="nation-name">
          <p>
            <span>{runnerName || '—'}</span>
            {plData && <span className={plData.className ? `float-right ${plData.className}` : 'float-right'}>{plData.value}</span>}
            {!plData && <span className="float-right"></span>}
          </p>
          {runnerExposure != null ? (
            <p className={`mb-0${runnerExposure > 0 ? ' book-green' : runnerExposure < 0 ? ' book-red' : ''}`}>{formatBookValue(runnerExposure)}</p>
          ) : (
            <p className="mb-0">{section.rem || ''}</p>
          )}
        </div>
        {Cell(b3, 'back', 'back2', 0)}
        {Cell(b2, 'back', 'back1', 1)}
        {Cell(b1, 'back', 'back', 2)}
        {Cell(l1, 'lay', 'lay', 3)}
        {Cell(l2, 'lay', 'lay1', 4)}
        {Cell(l3, 'lay', 'lay2', 5)}
      </div>
      {showPanel && (
        <PlaceBetPanel
          betValue={activeBet}
          betType={activeBet.betType}
          teamName={activeBet.teamName}
          odds={activeBet.odds}
          marketType={activeBet.marketType}
          market={activeBet.market || market}
          section={Array.isArray(activeBet.section) ? section : (activeBet.section || section)}
          suspended={suspended}
          marketsRef={marketsRef}
          matchId={matchId}
          onClose={() => onBetClick(null)}
          onBetChange={onBetChange}
        />
      )}
    </>
  );
}

export default function Market4Block({ market, marketIndex = 0, onBetClick, onBetChange, activeBet, runnerPL, matchExposures, marketsRef, matchId, eventName }) {
  const [expanded, setExpanded] = useState(true);
  const sections = market.section || [];
  const marketSusp = isMarketSuspended(market);
  const allSectionsSuspended = !marketSusp && sections.length > 0 && sections.every(s => {
    const gs = (s.gstatus || '').toUpperCase();
    if (gs === 'SUSPENDED' || gs === 'BALL RUNNING') return true;
    if (gs === 'ACTIVE') return false;
    const odds = s.odds || [];
    const hasValidBack = odds.some(o => (o.otype || '').toUpperCase() === 'BACK' && o.odds > 0);
    const hasValidLay = odds.some(o => (o.otype || '').toUpperCase() === 'LAY' && o.odds > 0);
    return !hasValidBack && !hasValidLay;
  });
  const suspended = marketSusp || allSectionsSuspended;
  // Determine the label for the full-market suspension overlay
  const marketSuspendLabel = allSectionsSuspended && sections.every(s => (s.gstatus || '').toUpperCase() === 'BALL RUNNING')
    ? 'BALL RUNNING' : 'SUSPENDED';
  const type = classifyMarket(market);
  const isMatch1 = (market.gtype || '').toLowerCase() === 'match1';
  // Header limit comes from maxb when present (reference: MATCH_ODDS shows 50K
  // from maxb 50000, not the max field); min shows only when > 0.
  const { min } = market;
  const displayMax = market.maxb > 0 ? market.maxb : market.max;
  const fmtMax = displayMax ? formatMax(displayMax) : '';
  const isBookmaker = type === 'BOOKMAKER';
  const wrapperClass = `market-4${isBookmaker ? ' width-75' : ''}`;

  // Body carries the market's own status; suspendedfull only for non-match1
  // markets (bookmaker conveys suspension per-row via suspendedtext instead)
  const bodyTitle = (market.status || '').toUpperCase() || (suspended ? marketSuspendLabel : 'OPEN');
  const bodyClass = `bet-table-body collapse show${suspended && !isMatch1 ? ' suspendedfull' : ''}`;

  // Cashout: enabled only when the user holds a position on an eligible
  // (Match Odds / Tied / Bookmaker) 2-runner market
  const cashoutReady = onBetClick && marketHasCashoutPosition(market, matchExposures);
  const handleCashout = (e) => {
    e.stopPropagation(); // header click toggles collapse
    const res = computeCashoutClick({ market, marketType: type, matchExposures, matchId, eventName });
    if (res.error) { bToastError(res.error); return; }
    onBetClick(res.betValue);
  };

  const maxBetContent = min ? (
    <>
      Min:<span>{min}</span>{' '}
      {fmtMax ? <>Max:<span>{fmtMax}</span></> : null}
    </>
  ) : fmtMax ? (
    <span title={`Max : ${fmtMax}`}>Max: <span>{fmtMax}</span></span>
  ) : null;

  return (
    <div className={wrapperClass} id={`goto-${market.mid}`}>
      <div className="bet-table">
        {/* Reference: the header div is plain `bet-table-header`; the COLLAPSE
            lives on the name span itself, which keeps a native `title` and
            carries data-toggle/data-target/aria-expanded. It is NOT a JS
            tooltip — the expected DOM has zero `data-toggle="tooltip"`, and a
            tooltip here popped open on tap on mobile. */}
        <div className="bet-table-header">
          <div className="nation-name">
            <MarketTooltip
              text={market.mname}
              trigger="hover"
              data-toggle="collapse"
              data-target={`#market${marketIndex}`}
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              style={{ cursor: 'pointer' }}
            >{market.mname}</MarketTooltip>
            {sections.length === 2 && (
              <button
                disabled={!cashoutReady}
                className="btn btn-success btn-sm"
                onClick={cashoutReady ? handleCashout : undefined}
              >Cashout</button>
            )}
            {maxBetContent && (
              <span className="max-bet d-none-desktop d-none-mobile">
                {maxBetContent}
              </span>
            )}
          </div>
        </div>
        {expanded && <div id={`market${marketIndex}`} data-title={bodyTitle} className={bodyClass}>
          <div className="bet-table-row">
            <div className="nation-name">
              {maxBetContent ? (
                <span className="max-bet text-left">
                  {maxBetContent}
                </span>
              ) : <span className="max-bet text-left"></span>}
            </div>
            <div translate="no" className="back bl-title back-title">Back</div>
            <div translate="no" className="lay bl-title lay-title">Lay</div>
          </div>
          {sections.map((s, i) => (
            <Market4Row
              key={s.sid || i}
              section={s}
              marketSuspended={suspended}
              market={market}
              marketType={type}
              activeBet={activeBet}
              onBetClick={onBetClick}
              onBetChange={onBetChange}
              runnerPL={runnerPL}
              matchExposures={matchExposures}
              marketsRef={marketsRef}
              matchId={matchId}
              eventName={eventName}
            />
          ))}
        </div>}
      </div>
      {market.rem && (
        <div className="market-message">{market.rem}</div>
      )}
    </div>
  );
}
