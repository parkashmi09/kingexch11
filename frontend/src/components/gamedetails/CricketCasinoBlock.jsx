import { useState } from 'react';
import { formatOdd, formatSize, formatMax, isMarketSuspended, isSectionSuspended, formatBookValue } from '../../utils/oddsHelpers';
import MarketTooltip from './MarketTooltip';
import PlaceBetPanel from '../betting/PlaceBetPanel';

function getExposure(matchExposures, marketMid, runnerName) {
  if (!matchExposures || !runnerName) return null;
  const name = runnerName.trim().toLowerCase();
  const mid = marketMid != null ? String(marketMid).trim() : '';
  return matchExposures[`${mid}:${name}`] ?? null;
}

function CricketCasinoRow({ section, marketSuspended, market, activeBet, onBetClick, onBetChange, matchExposures, marketsRef, matchId, eventName }) {
  const oddsArr = section.odds || [];
  const backOdds = oddsArr.find(o => (o.otype || '').toUpperCase() === 'BACK');

  const rawStatus = (section.gstatus || '').toUpperCase();
  const sectionSuspended = rawStatus === 'ACTIVE' ? false : isSectionSuspended(section);
  const suspended = marketSuspended || sectionSuspended;

  const showPanel = activeBet && activeBet.selectionId === section.sid && (activeBet.market_id || activeBet.market?.mid) === market.mid;
  const exposure = getExposure(matchExposures, market.mid, section.nat);

  const handleClick = () => {
    if (suspended || !backOdds || !onBetClick) return;
    onBetClick({
      odds: backOdds.odds,
      betType: 'back',
      team: section.nat || '',
      teamName: section.nat || '',
      marketType: 'CRICKET_CASINO',
      market_type: market.mname || 'cricketcasino',
      market_id: market.mid,
      selectionId: section.sid,
      event_id: matchId,
      event_name: eventName || '',
      market_name: market.mname || '',
      mname: market.mname || '',
      gtype: market.gtype || 'cricketcasino',
      fancy_name: section.nat || '',
      section: market.section || [],
      runners: (market.section || []).map(s => s.nat || ''),
      outcomes: (market.section || []).map(s => s.nat || ''),
      min_stake: section.min || market.min || null,
      max_stake: section.max || market.max || null,
      back_size: backOdds.size,
      lay_size: 0,
      market,
    });
  };

  return (
    <>
      <div className="bet-table-row">
        <div className="nation-name">
          <p>
            {section.nat || '—'}
            <span className="float-right"></span>
          </p>
          {exposure !== null && exposure !== 0 ? (
            <p className={`mb-0 ${exposure < 0 ? 'book-red' : 'book-green'}`}>{formatBookValue(Math.round(exposure))}</p>
          ) : (
            <p className="mb-0"></p>
          )}
        </div>
        {/* Reference: suspended rows KEEP their odds/size — the .suspended
            lock overlay is translucent so the values stay visible behind it.
            no-val (—) only when there are no odds at all. */}
        {backOdds && backOdds.odds > 0 ? (
          <div
            className={`bl-box back${suspended ? ' suspended' : ''}`}
            onClick={handleClick}
            style={{ cursor: onBetClick && !suspended ? 'pointer' : 'default' }}
          >
            <span className="d-block odds">{formatOdd(backOdds.odds)}</span>
            {backOdds.size ? <span className="d-block">{formatSize(backOdds.size)}</span> : null}
          </div>
        ) : (
          <div className="bl-box back no-val suspended"><span className="d-block odds">—</span></div>
        )}
      </div>
      {showPanel && (
        <PlaceBetPanel
          betValue={activeBet}
          betType="back"
          teamName={activeBet.teamName}
          odds={activeBet.odds}
          marketType="CRICKET_CASINO"
          market={activeBet.market || market}
          section={section}
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

export default function CricketCasinoBlock({ market, marketIndex = 0, onBetClick, onBetChange, activeBet, matchExposures, marketsRef, matchId, eventName }) {
  const [expanded, setExpanded] = useState(true);
  const sections = market.section || [];
  const suspended = isMarketSuspended(market);
  const min = sections[0]?.min || market.min || 100;
  const max = sections[0]?.max || market.max || 0;
  const fmtMax = max ? formatMax(max) : '0';

  return (
    <div className="market-9" id={`goto-${market.mid}`}>
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
            <span className="max-bet d-none-desktop">
              {'\n          Min:'}<span>{min}</span>
              {'\n          Max:'}<span>{fmtMax}</span>
            </span>
          </div>
        </div>
        {expanded && <div id={`market${marketIndex}`} data-title={(market.status || '').toUpperCase() || (suspended ? 'SUSPENDED' : 'OPEN')} className={`bet-table-body collapse show${suspended ? ' suspendedfull' : ''}`}>
          {/* Desktop header */}
          <div className="bet-table-row d-none-mobile">
            <div className="nation-name">
              <span className="max-bet">
                {'\n            Min:'}<span>{min}</span>
                {'\n            Max:'}<span>{fmtMax}</span>
              </span>
            </div>
            <div className="back bl-title back-title">Back</div>
          </div>
          {/* Rows */}
          {sections.map((s, i) => (
            <CricketCasinoRow
              key={s.sid || i}
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
          ))}
        </div>}
      </div>
    </div>
  );
}
