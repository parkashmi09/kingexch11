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

function Market2Row({ section, marketSuspended, market, marketType, activeBet, onBetClick, onBetChange, runnerPL, matchExposures, marketsRef, matchId, eventName }) {
  const oddsArr = section.odds || [];
  const backOdds = oddsArr.find(o => (o.otype || '').toUpperCase() === 'BACK');
  const layOdds = oddsArr.find(o => (o.otype || '').toUpperCase() === 'LAY');
  const rawStatus = (section.gstatus || '').toUpperCase();
  const sectionActive = rawStatus === 'ACTIVE' || rawStatus === 'OPEN';
  const sectionSuspended = sectionActive ? false : isSectionSuspended(section);
  // Market-level gstatus=SUSPENDED forces all rows suspended; section check stays independent
  const suspended = marketSuspended || sectionSuspended;
  // Reference always stamps the row's own gstatus (ACTIVE/OPEN/SUSPENDED)
  const rowTitle = rawStatus || (suspended ? 'SUSPENDED' : 'OPEN');
  const isMatch1 = (market.gtype || '').toLowerCase() === 'match1';

  const backVal = backOdds?.odds || 0;
  const layVal = layOdds?.odds || 0;
  const prevRef = useRef(null);
  const backRef = useRef(null);
  const layRef = useRef(null);

  useEffect(() => {
    if (prevRef.current) {
      flashCell(backRef.current, backVal, prevRef.current[0]);
      flashCell(layRef.current, layVal, prevRef.current[1]);
    }
    prevRef.current = [backVal, layVal];
  });

  const isFancy = marketType === 'FANCY' || marketType === 'CRICKET_CASINO';
  const backLabel = isFancy ? 'no' : 'back';
  const layLabel = isFancy ? 'yes' : 'lay';

  const buildBetValue = (oddObj, type) => {
    const allSections = market.section || [];
    return {
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
      back_size: backOdds?.size,
      lay_size: layOdds?.size,
      market,
    };
  };

  const handleBackClick = () => {
    if (suspended || !backOdds || !onBetClick) return;
    onBetClick(buildBetValue(backOdds, backLabel));
  };

  const handleLayClick = () => {
    if (suspended || !layOdds || !onBetClick) return;
    onBetClick(buildBetValue(layOdds, layLabel));
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

  const SuspendedCell = ({ type }) => (
    <div className={`bl-box ${type} ${type} suspended no-val`}>
      <span className="d-block odds">—</span>
    </div>
  );

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
        {/* Suspension is PER CELL (odds 0 → suspended no-val); cells with live
            odds keep showing them even when the row/market is suspended */}
        {backOdds && backOdds.odds > 0 ? (
          <div ref={backRef} className="bl-box back back" onClick={handleBackClick} style={{ cursor: onBetClick && !suspended ? 'pointer' : 'default' }}>
            <span className="d-block odds">{formatOdd(backOdds.odds)}</span>
            <span className="d-block">{backOdds.size ? formatSize(backOdds.size) : ''}</span>
          </div>
        ) : <SuspendedCell type="back" />}
        {layOdds && layOdds.odds > 0 ? (
          <div ref={layRef} className="bl-box lay lay" onClick={handleLayClick} style={{ cursor: onBetClick && !suspended ? 'pointer' : 'default' }}>
            <span className="d-block odds">{formatOdd(layOdds.odds)}</span>
            <span className="d-block">{layOdds.size ? formatSize(layOdds.size) : ''}</span>
          </div>
        ) : <SuspendedCell type="lay" />}
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

export default function Market2Block({ market, marketIndex = 0, onBetClick, onBetChange, activeBet, runnerPL, matchExposures, marketsRef, matchId, eventName }) {
  const [expanded, setExpanded] = useState(true);
  const sections = market.section || [];
  const marketSusp = isMarketSuspended(market);
  // Also treat as full-suspended when every section is individually suspended
  // Check both gstatus AND whether all back/lay odds are 0
  const allSectionsSuspended = !marketSusp && sections.length > 0 && sections.every(s => {
    const gs = (s.gstatus || '').toUpperCase();
    if (gs === 'SUSPENDED' || gs === 'BALL RUNNING') return true;
    if (gs === 'ACTIVE') return false;
    // Check if all odds are 0 or missing
    const odds = s.odds || [];
    const hasValidBack = odds.some(o => (o.otype || '').toUpperCase() === 'BACK' && o.odds > 0);
    const hasValidLay = odds.some(o => (o.otype || '').toUpperCase() === 'LAY' && o.odds > 0);
    return !hasValidBack && !hasValidLay;
  });
  const suspended = marketSusp || allSectionsSuspended;
  const marketSuspendLabel = allSectionsSuspended && sections.every(s => (s.gstatus || '').toUpperCase() === 'BALL RUNNING')
    ? 'BALL RUNNING' : 'SUSPENDED';
  const type = classifyMarket(market);
  const isMatch1 = (market.gtype || '').toLowerCase() === 'match1';
  // Header limit comes from maxb when present; min shows only when > 0
  const { min } = market;
  const displayMax = market.maxb > 0 ? market.maxb : market.max;
  const fmtMax = displayMax ? formatMax(displayMax) : '';
  // Reference class comes from dtype: Game Winner (dtype 11) → market-11,
  // everything else 2-column → market-2. NO width-25 on the bookmaker: the
  // football reference (sid 1, Tigre v Nacional) renders its 1-back/1-lay
  // bookmaker as a plain `market-2`, and `.market-2.width-25` has no rule in
  // style.css anyway — responsive.css only lists it to reset to full width on
  // mobile. (The cricket-style 3/3 bookmaker goes through Market4Block, which
  // keeps its width-75.)
  const isDtype11 = Number(market.dtype) === 11;
  const wrapperClass = `market-${isDtype11 ? 11 : 2}`;
  // Title attr uses K-format (maxb 100000 → "Max : 100K" even when the visible
  // text shows "1L")
  const titleMax = displayMax >= 1000
    ? `${(displayMax / 1000) % 1 === 0 ? displayMax / 1000 : (displayMax / 1000).toFixed(2)}K`
    : String(displayMax || '');

  // Body carries the market's own status; suspendedfull only for non-match1
  // markets (bookmaker conveys suspension per-row via suspendedtext instead)
  const bodyTitle = (market.status || '').toUpperCase() || (suspended ? marketSuspendLabel : 'OPEN');
  const bodyClass = `bet-table-body collapse show${suspended && !isMatch1 ? ' suspendedfull' : ''}`;

  const maxBetContent = min ? (
    <>
      Min:<span>{min}</span>{' '}
      {fmtMax ? <>Max:<span>{fmtMax}</span></> : null}
    </>
  ) : fmtMax ? (
    // market-11 reference: "Max:" hugs the value span (no space); market-2 keeps one
    <span title={`Max : ${titleMax}`}>Max:{isDtype11 ? '' : ' '}<span>{fmtMax}</span></span>
  ) : null;

  // Cashout: enabled only when the user holds a position on an eligible
  // (Match Odds / Tied / Bookmaker) 2-runner market; otherwise the button
  // stays the same disabled placeholder as before.
  const cashoutReady = onBetClick && marketHasCashoutPosition(market, matchExposures);
  const handleCashout = (e) => {
    e.stopPropagation(); // header click toggles collapse
    const res = computeCashoutClick({ market, marketType: type, matchExposures, matchId, eventName });
    if (res.error) { bToastError(res.error); return; }
    onBetClick(res.betValue);
  };

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
                <span className="max-bet">
                  {maxBetContent}
                </span>
              ) : null}
            </div>
            <div className="back bl-title back-title">{type === 'FANCY' ? 'No' : 'Back'}</div>
            <div className="lay bl-title lay-title">{type === 'FANCY' ? 'Yes' : 'Lay'}</div>
          </div>
          {sections.map((s, i) => (
            <Market2Row
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
