import { useState, useRef, useEffect } from 'react';
import { formatOdd, formatSize, isMarketSuspended, isSectionSuspended } from '../../utils/oddsHelpers';
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

function LineMarketRow({ section, marketSuspended, market, activeBet, onBetClick, onBetChange, marketsRef, matchId, eventName }) {
  const oddsArr = section.odds || [];
  // Line markets (fancy2) invert the feed's otype vs every other market: the
  // reference site fills the LEFT "No" column from the feed's BACK triple and
  // the RIGHT "Yes" column from its LAY triple — verified live on
  // "West Indies 1st Innings 85 Over Line" (gmid 888545071), where the feed
  // sends back1/2/3 = 249/248/247 and lay1/2/3 = 0/0/0 while the reference
  // shows the numbers under No and the dashes under Yes. Feeding the columns by
  // otype (what we did before) left the whole No side blank.
  //
  // No column, left→right = lay2, lay1, lay → back3(tno2), back2(tno1), back1(tno0)
  const noOdds = oddsArr.filter(o => (o.otype || '').toUpperCase() === 'BACK').sort((a, b) => (b.tno || 0) - (a.tno || 0));
  // Yes column, left→right = back, back1, back2 → lay1(tno0), lay2(tno1), lay3(tno2)
  const yesOdds = oddsArr.filter(o => (o.otype || '').toUpperCase() === 'LAY').sort((a, b) => (a.tno || 0) - (b.tno || 0));

  const [noOuter, noMid, noBest] = noOdds;
  const [yesBest, yesMid, yesOuter] = yesOdds;

  const rawStatus = (section.gstatus || '').toUpperCase();
  const sectionSuspended = rawStatus === 'ACTIVE' ? false : isSectionSuspended(section);
  const suspended = marketSuspended || sectionSuspended;
  const suspendLabel = rawStatus === 'BALL RUNNING' ? 'BALL RUNNING' : 'SUSPENDED';

  // Cell order: lay2, lay1, lay, back, back1, back2
  const cells = [noOuter, noMid, noBest, yesBest, yesMid, yesOuter];
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
    onBetClick({
      odds: oddObj.odds,
      betType: type === 'lay' ? 'no' : 'yes',
      team: section.nat || '',
      teamName: section.nat || '',
      marketType: 'FANCY',
      market_type: market.mname || 'fancy2',
      market_id: market.mid,
      selectionId: section.sid,
      event_id: matchId,
      event_name: eventName || '',
      market_name: market.mname || 'Line Market',
      mname: market.mname || '',
      gtype: market.gtype || 'fancy2',
      section: market.section || [],
      runners: (market.section || []).map(s => s.nat || ''),
      outcomes: (market.section || []).map(s => s.nat || ''),
      min_stake: section.min || market.min || null,
      max_stake: section.max || market.max || null,
      maxb: market.maxb || null,
      fancy_name: section.nat || '',
      market,
    });
  };

  const showPanel = activeBet && activeBet.selectionId === section.sid && (activeBet.market_id || activeBet.market?.mid) === market.mid;
  const runnerName = market.mname || section.nat || '';

  const Cell = (o, type, depth, idx) => {
    if (!o || suspended || !(o.odds > 0)) {
      // A zero/missing price is just an empty cell (`no-val`, dash, no size) —
      // the reference only adds `suspended` when the market itself is down.
      return (
        <div key={idx} className={`bl-box ${type} ${depth}${suspended ? ' suspended' : ''} no-val`}>
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
        style={{ cursor: 'pointer' }}
      >
        <span className="d-block odds">{formatOdd(o.odds)}</span>
        <span className="d-block">{formatSize(o.size)}</span>
      </div>
    );
  };

  return (
    <>
      {/* Mobile team name row */}
      <div className="bet-table-mobile-row d-none-desktop">
        <div className="bet-table-mobile-team-name">
          <p className="mb-0">
            <span>{runnerName}</span>
            <span></span>
          </p>
          <button className="btn btn-primary btn-sm m-1">Book</button>
        </div>
      </div>

      {/* Odds row: lay first (No), then back (Yes) */}
      <div data-title={suspended ? suspendLabel : 'ACTIVE'} className={`bet-table-row${suspended ? ' suspendedtext' : ''}`}>
        <div className="nation-name d-none-mobile">
          <p>
            <span>{runnerName}</span>
            <span className="float-right"></span>
          </p>
          <button className="btn btn-primary btn-sm">Book</button>
        </div>
        {Cell(noOuter, 'lay', 'lay2', 0)}
        {Cell(noMid, 'lay', 'lay1', 1)}
        {Cell(noBest, 'lay', 'lay', 2)}
        {Cell(yesBest, 'back', 'back', 3)}
        {Cell(yesMid, 'back', 'back1', 4)}
        {Cell(yesOuter, 'back', 'back2', 5)}
      </div>

      {showPanel && (
        <PlaceBetPanel
          betValue={activeBet}
          betType={activeBet.betType}
          teamName={activeBet.teamName}
          odds={activeBet.odds}
          marketType="FANCY"
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

export default function LineMarketBlock({ market, marketIndex = 0, markets, onBetClick, onBetChange, activeBet, matchExposures, marketsRef, matchId, eventName }) {
  const [expanded, setExpanded] = useState(true);
  // Support grouped markets (array) or single market
  const allMarkets = markets || [market];
  const firstMarket = allMarkets[0] || market;
  const min = firstMarket.min || 0;
  const max = firstMarket.max || 0;

  return (
    <div className="market-14" id={`goto-${firstMarket.mid}`}>
      <div className="bet-table">
        <div className="bet-table-header">
          <div className="nation-name">
            <MarketTooltip
              text={'Line Market'}
              trigger="hover"
              data-toggle="collapse"
              data-target={`#market${marketIndex}`}
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              style={{ cursor: 'pointer' }}
            >{'Line Market'}</MarketTooltip>
            <span className="max-bet d-none-desktop">
              Min:<span>{min}</span>
              {' '}Max:<span>{max}</span>
            </span>
          </div>
        </div>
        {expanded && <div id={`market${marketIndex}`} data-title="OPEN" className="bet-table-body collapse show">
          {/* Desktop header: No (lay) | Yes (back) */}
          <div className="bet-table-row d-none-mobile">
            <div className="nation-name"></div>
            <div className="lay bl-title lay-title">No</div>
            <div className="back bl-title back-title">Yes</div>
          </div>

          {allMarkets.map((mkt) => {
            const mktSusp = isMarketSuspended(mkt);
            return (mkt.section || []).map((s, i) => (
              <LineMarketRow
                key={s.sid || `${mkt.mid}-${i}`}
                section={s}
                marketSuspended={mktSusp}
                market={mkt}
                activeBet={activeBet}
                onBetClick={onBetClick}
                onBetChange={onBetChange}
                marketsRef={marketsRef}
                matchId={matchId}
                eventName={eventName}
              />
            ));
          })}
        </div>}
      </div>
    </div>
  );
}
