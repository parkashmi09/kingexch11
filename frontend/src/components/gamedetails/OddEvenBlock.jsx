import { useState, useRef } from 'react';
import { formatOdd, formatSize, isMarketSuspended, isSectionSuspended, formatBookValue } from '../../utils/oddsHelpers';
import PlaceBetPanel from '../betting/PlaceBetPanel';
import MarketTooltip from './MarketTooltip';

function getExposure(matchExposures, marketMid, runnerName) {
  if (!matchExposures || !runnerName) return null;
  const name = runnerName.trim().toLowerCase();
  const mid = marketMid != null ? String(marketMid).trim() : '';
  return matchExposures[`${mid}:${name}`] ?? null;
}

function OddEvenRow({ section, marketSuspended, market, activeBet, onBetClick, onBetChange, matchExposures, marketsRef, matchId, eventName }) {
  const oddsArr = section.odds || [];
  const oddSide = oddsArr.find(o => (o.otype || '').toUpperCase() === 'BACK');
  const evenSide = oddsArr.find(o => (o.otype || '').toUpperCase() === 'LAY');

  const rawStatus = (section.gstatus || '').toUpperCase();
  const sectionSuspended = rawStatus === 'ACTIVE' ? false : isSectionSuspended(section);
  const suspended = marketSuspended || sectionSuspended;
  const suspendLabel = section.gstatus && section.gstatus.toUpperCase() !== 'ACTIVE' ? section.gstatus : 'SUSPENDED';
  const min = section.min || 100;
  const max = section.max || 0;

  const showPanel = activeBet && activeBet.selectionId === section.sid && (activeBet.market_id || activeBet.market?.mid) === market.mid;
  const exposure = getExposure(matchExposures, market.mid, section.nat);
  // Lets the exposure <p> open the runner-name tooltip that lives on its sibling
  const nameTipRef = useRef(null);

  const handleClick = (oddObj, betType) => {
    if (suspended || !oddObj || !onBetClick) return;
    onBetClick({
      odds: oddObj.odds,
      betType,
      team: section.nat || '',
      teamName: section.nat || '',
      marketType: 'FANCY',
      market_type: 'oddeven',
      market_id: market.mid,
      selectionId: section.sid,
      event_id: matchId,
      event_name: eventName || '',
      market_name: market.mname || 'oddeven',
      mname: market.mname || 'oddeven',
      gtype: market.gtype || 'oddeven',
      fancy_name: section.nat || '',
      section: market.section || [],
      runners: ['Yes', 'No'],
      outcomes: ['Yes', 'No'],
      min_stake: section.min || null,
      max_stake: section.max || null,
      maxb: market.maxb || null,
      back_size: oddObj.size,
      lay_size: oddObj.size,
      market,
    });
  };

  const Cell = ({ oddObj, betType }) => {
    if (!oddObj || suspended || !(oddObj.odds > 0)) {
      return <div className="bl-box back no-val suspended"><span className="d-block odds">—</span></div>;
    }
    return (
      <div
        className="bl-box back"
        onClick={() => handleClick(oddObj, betType)}
        style={{ cursor: onBetClick ? 'pointer' : 'default' }}
      >
        <span className="d-block odds">{formatOdd(oddObj.odds)}</span>
        {oddObj.size ? <span className="d-block">{formatSize(oddObj.size)}</span> : null}
      </div>
    );
  };

  return (
    <div className="fancy-tripple">
      <div data-title={suspended ? suspendLabel : ''} className={`bet-table-row${sectionSuspended && !marketSuspended ? ' suspendedtext' : ''}`}>
        <div className="nation-name">
          {/* Reference puts the title on the <p> itself (`<p title="45 over run
              odd even NOR">`), not on a span nested inside it */}
          <MarketTooltip ref={nameTipRef} as="p" text={section.nat || ''} disabled={suspended}>{section.nat || '—'}</MarketTooltip>
          {exposure !== null && exposure !== 0 ? (
            /* Exposure value opens the runner-name tooltip too — same cell,
               and the name is what gets truncated there */
            <p
              className={`mb-0 ${exposure < 0 ? 'book-red' : 'book-green'}`}
              onClick={() => { if (!suspended) nameTipRef.current?.toggle(); }}
              style={suspended ? undefined : { cursor: 'pointer' }}
            >{formatBookValue(Math.round(exposure))}</p>
          ) : (
            <p className="mb-0"></p>
          )}
        </div>
        <Cell oddObj={oddSide} betType="yes" />
        <Cell oddObj={evenSide} betType="no" />
        <div className="fancy-min-max d-none-mobile">
          {'\n                                        Min:'}<span>{min}</span>
          {'\n                                        Max:'}<span>{max ? formatSize(max) : '0'}</span>
        </div>
      </div>

      {/* Bet slip first, mobile min/max after — same order as the reference
          (bet-table-row → place-bet → fancy-min-max.d-none-desktop). */}
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

      <div className="fancy-min-max d-none-desktop w-100">
        {'\n                                Min:'}<span>{min}</span>
        {'\n                                Max:'}<span>{max ? formatSize(max) : '0'}</span>
      </div>
    </div>
  );
}

export default function OddEvenBlock({ market, marketIndex = 0, onBetClick, onBetChange, activeBet, matchExposures, marketsRef, matchId, eventName }) {
  const [expanded, setExpanded] = useState(true);
  const sections = market.section || [];
  const suspended = isMarketSuspended(market);

  return (
    <div className="market-6" id={`goto-${market.mid}`}>
      <div className="bet-table">
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
          </div>
        </div>
        {expanded && <div id={`market${marketIndex}`} className="bet-table-body collapse show container-fluid container-fluid-5">
          {/* Column headers */}
          <div className="row row5">
            <div className="col-12 col-md-6">
              <div className="fancy-tripple">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  <div className="back bl-title back-title">Odd</div>
                  <div className="back bl-title back-title">Even</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 d-none-mobile">
              <div className="fancy-tripple">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  <div className="back bl-title back-title">Odd</div>
                  <div className="back bl-title back-title">Even</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sections in 2-column grid */}
          <div className="row row5">
            {sections.map((s, i) => (
              <div key={s.sid || i} className="col-12 col-md-6">
                <OddEvenRow
                  section={s}
                  marketSuspended={suspended}
                  market={market}
                  activeBet={activeBet}
                  onBetClick={onBetClick}
                  onBetChange={onBetChange}
                  matchExposures={matchExposures}
                  marketsRef={marketsRef}
                  matchId={matchId}
                  eventName={eventName}
                />
              </div>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
}
