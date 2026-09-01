import { useState } from 'react';
import { formatOdd, formatMax, isMarketSuspended, isSectionSuspended } from '../../utils/oddsHelpers';
import MarketTooltip from './MarketTooltip';
import PlaceBetPanel from '../betting/PlaceBetPanel';

/* market-1 — back-only grid markets (HT/FT etc.). Reference structure:
   .market-1 > .bet-table > .bet-table-header (span title + max-bet, no
   nation-name wrapper, no Cashout) + .bet-table-body > ONE .bet-table-row
   holding a .market-1-item per section: runner name column + a single back
   bl-box with odds only (no size span). */
function Market1Block({ market, marketIndex = 0, onBetClick, onBetChange, activeBet, marketsRef, matchId, eventName }) {
  const [expanded, setExpanded] = useState(true);
  const sections = market.section || [];
  const suspended = isMarketSuspended(market);
  const bodyTitle = (market.status || '').toUpperCase() || (suspended ? 'SUSPENDED' : 'OPEN');
  const displayMax = market.maxb > 0 ? market.maxb : market.max;
  const fmtMax = displayMax ? formatMax(displayMax) : '';

  const handleClick = (section, oddObj) => {
    if (suspended || !oddObj || !onBetClick) return;
    onBetClick({
      odds: oddObj.odds,
      betType: 'back',
      team: section.nat || '',
      teamName: section.nat || '',
      marketType: 'MATCH_ODDS',
      market_type: 'MATCH_ODDS',
      market_id: market.mid,
      selectionId: section.sid,
      event_id: matchId,
      event_name: eventName || '',
      market_name: market.mname || '',
      mname: market.mname || '',
      gtype: market.gtype || '',
      section: sections,
      runners: sections.map(s => s.nat || ''),
      outcomes: sections.map(s => s.nat || ''),
      team_one: sections[0]?.nat || '',
      team_two: sections[1]?.nat || '',
      min_stake: section.min || market.min || null,
      max_stake: section.max || market.max || null,
      maxb: market.maxb || null,
      back_size: oddObj.size,
      market,
    });
  };

  const showPanel = activeBet && (activeBet.market_id || activeBet.market?.mid) === market.mid;

  return (
    <div className="market-1" id={`goto-${market.mid}`}>
      <div className="bet-table">
        <div className="bet-table-header">
          <MarketTooltip
            text={market.mname}
            trigger="hover"
            data-toggle="collapse"
            data-target={`#market${marketIndex}`}
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            style={{ cursor: 'pointer' }}
          >{market.mname}</MarketTooltip>
          {fmtMax && (
            <span className="max-bet">
              <span title={`Max : ${fmtMax}`}>Max: <span>{fmtMax}</span></span>
            </span>
          )}
        </div>
        {expanded && (
          <div id={`market${marketIndex}`} data-title={bodyTitle} className={`bet-table-body collapse show${suspended ? ' suspendedfull' : ''}`}>
            <div className="bet-table-row">
              {sections.map((s, i) => {
                const o = (s.odds || []).find(x => x.odds > 0);
                // Per-cell suspension ONLY when the market itself is open —
                // a market-level SUSPENDED uses the body's suspendedfull
                // overlay instead, and cells stay plain (reference behavior).
                // Odds stay visible under the lock either way.
                const cellSusp = !suspended && isSectionSuspended(s);
                return (
                  <div key={s.sid || i} className="market-1-item">
                    <div className="d-flex flex-column"><span>{s.nat || ''}</span> <span></span></div>
                    {o ? (
                      <div
                        className={`bl-box back back${cellSusp ? ' suspended' : ''}`}
                        onClick={cellSusp ? undefined : () => handleClick(s, o)}
                        style={{ cursor: onBetClick && !suspended && !cellSusp ? 'pointer' : 'default' }}
                      >
                        <span className="d-block odds">{formatOdd(o.odds)}</span>
                      </div>
                    ) : (
                      <div className="bl-box back back suspended no-val">
                        <span className="d-block odds">—</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {showPanel && (
              <PlaceBetPanel
                betValue={activeBet}
                betType={activeBet.betType}
                teamName={activeBet.teamName}
                odds={activeBet.odds}
                marketType={activeBet.marketType}
                market={activeBet.market || market}
                section={sections.find(s => s.sid === activeBet.selectionId) || {}}
                suspended={suspended}
                marketsRef={marketsRef}
                matchId={matchId}
                onClose={() => onBetClick(null)}
                onBetChange={onBetChange}
              />
            )}
          </div>
        )}
      </div>
      {market.rem && (
        <div className="market-message">{market.rem}</div>
      )}
    </div>
  );
}

export default Market1Block;
