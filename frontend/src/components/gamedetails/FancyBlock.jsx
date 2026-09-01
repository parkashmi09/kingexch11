import { useState, useRef } from 'react';
import { formatOdd, formatSize, isMarketSuspended, isSectionSuspended, formatBookValue } from '../../utils/oddsHelpers';
import PlaceBetPanel from '../betting/PlaceBetPanel';
import RunAmountModal from './RunAmountModal';
import MarketTooltip from './MarketTooltip';

function getExposure(matchExposures, marketMid, runnerName) {
  if (!matchExposures || !runnerName) return null;
  const name = runnerName.trim().toLowerCase();
  const mid = marketMid != null ? String(marketMid).trim() : '';
  const keyWithMid = `${mid}:${name}`;
  const val = matchExposures[keyWithMid] ?? null;
  if (val !== null) {
    console.log('[FancyExposure] Found:', keyWithMid, '=', val);
  }
  return val;
}

function FancyRow({ section, marketSuspended, market, activeBet, onBetClick, onBetChange, matchExposures, marketsRef, matchId, eventName, onRunnerClick, isFancy1 }) {
  // Lets the exposure <p> open the runner-name tooltip that lives on its sibling
  const nameTipRef = useRef(null);
  const oddsArr = section.odds || [];
  const backs = oddsArr.filter(o => (o.otype || '').toUpperCase() === 'BACK').sort((a, b) => (a.tno || 0) - (b.tno || 0));
  const lays = oddsArr.filter(o => (o.otype || '').toUpperCase() === 'LAY').sort((a, b) => (a.tno || 0) - (b.tno || 0));
  const rowCount = Math.max(backs.length, lays.length, 1);

  const rawStatus = (section.gstatus || '').toUpperCase();
  const sectionActive = rawStatus === 'ACTIVE';
  const sectionSuspended = sectionActive ? false : isSectionSuspended(section);
  const suspended = marketSuspended || sectionSuspended;
  const suspendLabel = section.gstatus && section.gstatus.toUpperCase() !== 'ACTIVE' ? section.gstatus : 'SUSPENDED';
  const min = section.min || 100;
  const max = section.max || 0;

  const showPanel = activeBet && activeBet.selectionId === section.sid && (activeBet.market_id || activeBet.market?.mid) === market.mid;

  const exposure = getExposure(matchExposures, market.mid, section.nat);
  const hasExposure = exposure !== null && exposure !== 0;

  // Null unless this runner actually has a book AND the market carries a ladder
  const openLadder = (hasExposure && onRunnerClick)
    ? () => onRunnerClick(section.nat, {
        success: true,
        data: Object.entries(matchExposures || {}).map(([k, v]) => ({
          team_name: k.includes(':') ? k.split(':').slice(1).join(':') : k,
          exposure_amount: String(v),
        })),
      })
    : null;

  const handleClick = (oddObj, betType) => {
    if (suspended || !oddObj || !onBetClick) return;
    onBetClick({
      odds: oddObj.odds,
      betType,
      team: section.nat || '',
      teamName: section.nat || '',
      marketType: 'FANCY',
      market_type: 'FANCY',
      market_id: market.mid,
      selectionId: section.sid,
      event_id: matchId,
      event_name: eventName || '',
      market_name: market.mname || '',
      mname: market.mname || '',
      gtype: market.gtype || '',
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

  const OddsCell = ({ oddObj, type }) => {
    if (!oddObj || suspended || !(oddObj.odds > 0)) {
      return <div className={`bl-box ${type} no-val suspended`}><span className="d-block odds">—</span></div>;
    }
    return (
      <div
        className={`bl-box ${type}`}
        onClick={() => handleClick(oddObj, type === 'lay' ? 'no' : 'yes')}
        style={{ cursor: onBetClick ? 'pointer' : 'default' }}
      >
        <span className="d-block odds">{formatOdd(oddObj.odds)}</span>
        {oddObj.size ? <span className="d-block">{formatSize(oddObj.size)}</span> : null}
      </div>
    );
  };

  return (
    <div className="fancy-tripple">
      {/* Primary row — has nation name and min/max */}
      <div data-title={suspended ? suspendLabel : ''} className={`bet-table-row${sectionSuspended && !marketSuspended ? ' suspendedtext' : ''}`}>
        <div className="nation-name">
          {/* Runner name with the same hover tooltip as the market header
              (reference: <p data-original-title=…>). Rendered as <p> (not a
              wrapping span) so `.nation-name > span:first-child { capitalize }`
              never matches it. */}
          {/* Either <p> in this cell opens the run ladder — the name as well as
              the book value. It only opens when the runner HAS a book: with no
              exposure there is nothing to lay out. */}
          <MarketTooltip
            ref={nameTipRef}
            as="p"
            text={section.nat || ''}
            disabled={suspended}
            onClick={openLadder || undefined}
          >{section.nat || '—'}</MarketTooltip>
          {hasExposure ? (
            <p
              className={`mb-0 ${exposure < 0 ? 'book-red' : 'book-green'}`}
              onClick={() => {
                // Suspended: no tooltip. The ladder still opens — it reports
                // settled bets, which suspension doesn't invalidate.
                if (!suspended) nameTipRef.current?.toggle();
                openLadder?.();
              }}
              style={{ cursor: 'pointer' }}
            >{formatBookValue(Math.round(exposure))}</p>
          ) : (
            <p className="mb-0"></p>
          )}
          {/* {hasExposure && ( */}
            {/* <span className="badla-icon"><span>Badlo</span></span> // after implementation we will do that  */}
          {/* )} */}
        </div>
        {isFancy1 ? (
          <>
            <OddsCell oddObj={backs[0]} type="back" />
            <OddsCell oddObj={lays[0]} type="lay" />
          </>
        ) : (
          <>
            <OddsCell oddObj={lays[0]} type="lay" />
            <OddsCell oddObj={backs[0]} type="back" />
          </>
        )}
        {/* Explicit newline text nodes — JSX trims newline+indent, the
            reference (Vue) keeps them, so we re-add them to match exactly */}
        <div className="fancy-min-max d-none-mobile">
          {'\n                                        Min:'}<span>{min}</span>
          {'\n                                        Max:'}<span>{max ? formatSize(max) : '0'}</span>{' '}
          {hasExposure && (
            <span className="badla-icon d-none-desktop"><span>Badlo</span></span>
          )}
        </div>
      </div>
      {/* Extra odds rows (tno 1, 2, ...) — no nation name, no min/max.
          Reference keeps these visible while suspended/Ball Running too. */}
      {rowCount > 1 && Array.from({ length: rowCount - 1 }, (_, i) => (
        <div key={i + 1} data-title={suspended ? suspendLabel : ''} className={`bet-table-row${sectionSuspended && !marketSuspended ? ' suspendedtext' : ''}`}>
          <div className="nation-name"></div>
          {isFancy1 ? (
            <>
              <OddsCell oddObj={backs[i + 1]} type="back" />
              <OddsCell oddObj={lays[i + 1]} type="lay" />
            </>
          ) : (
            <>
              <OddsCell oddObj={lays[i + 1]} type="lay" />
              <OddsCell oddObj={backs[i + 1]} type="back" />
            </>
          )}
        </div>
      ))}
      {/* Order matters: the bet slip sits directly under the odds row, and the
          MOBILE min/max strip comes AFTER it (reference: bet-table-row →
          place-bet → fancy-min-max.d-none-desktop). Rendering the strip first
          wedged a "Min: … Max: …" line between the row and its own slip. */}
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
      {section.rem && (
        <div className="market-message">{section.rem}</div>
      )}
    </div>
  );
}

function KhadoRow({ section, marketSuspended, market, activeBet, onBetClick, onBetChange, matchExposures, marketsRef, matchId, eventName }) {
  const oddsArr = section.odds || [];
  const backs = oddsArr.filter(o => (o.otype || '').toUpperCase() === 'BACK').sort((a, b) => (a.tno || 0) - (b.tno || 0));
  const lays = oddsArr.filter(o => (o.otype || '').toUpperCase() === 'LAY').sort((a, b) => (a.tno || 0) - (b.tno || 0));

  const rawStatus = (section.gstatus || '').toUpperCase();
  const sectionSuspended = rawStatus !== 'ACTIVE' && isSectionSuspended(section);
  const suspended = marketSuspended || sectionSuspended;
  const suspendLabel = section.gstatus && section.gstatus.toUpperCase() !== 'ACTIVE' ? section.gstatus : 'SUSPENDED';
  const min = section.min || 100;
  const max = section.max || 0;

  const layOdds = lays[0]?.odds || 0;
  const displayName = `${section.nat || '—'} - ${layOdds}`;

  const showPanel = activeBet && activeBet.selectionId === section.sid && (activeBet.market_id || activeBet.market?.mid) === market.mid;

  const exposure = getExposure(matchExposures, market.mid, section.nat);
  const hasExposure = exposure !== null && exposure !== 0;

  const handleClick = (oddObj) => {
    if (suspended || !oddObj || !onBetClick) return;
    onBetClick({
      odds: oddObj.odds,
      betType: 'yes',
      team: section.nat || '',
      teamName: section.nat || '',
      marketType: 'FANCY',
      market_type: 'FANCY',
      market_id: market.mid,
      selectionId: section.sid,
      event_id: matchId,
      event_name: eventName || '',
      market_name: market.mname || '',
      mname: market.mname || '',
      gtype: market.gtype || '',
      fancy_name: section.nat || '',
      section: market.section || [],
      runners: ['Yes', 'No'],
      outcomes: ['Yes', 'No'],
      min_stake: section.min || null,
      max_stake: section.max || null,
      maxb: market.maxb || null,
      back_size: oddObj.size,
      market,
    });
  };

  const backObj = backs[0];
  const backValid = backObj && !suspended && backObj.odds > 0;

  return (
    <>
      <div className="bet-table-row">
        <div className="nation-name">
          <p title={displayName}>{displayName}</p>
          {hasExposure ? (
            <p className={`mb-0 ${exposure < 0 ? 'book-red' : 'book-green'}`}>{formatBookValue(Math.round(exposure))}</p>
          ) : (
            <p className="mb-0"></p>
          )}
        </div>
        {backValid ? (
          <div className="bl-box back" onClick={() => handleClick(backObj)} style={{ cursor: 'pointer' }}>
            <span className="d-block odds">{formatOdd(backObj.odds)}</span>
            {backObj.size ? <span className="d-block">{formatSize(backObj.size)}</span> : null}
          </div>
        ) : (
          <div className="bl-box back no-val suspended"><span className="d-block odds">—</span></div>
        )}
        <div className="fancy-min-max">
          {'\n                                Min:'}<span>{min}</span>
          {'\n                                Max:'}<span>{max ? formatSize(max) : '0'}</span>
        </div>
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

export default function FancyBlock({ market, marketIndex = 0, onBetClick, onBetChange, activeBet, matchExposures, marketsRef, matchId, eventName }) {
  const sections = market.section || [];
  const suspended = isMarketSuspended(market);
  const gtype = (market.gtype || '').toLowerCase();
  // Markets that carry the run ladder. "Over By Over" settles the same way as
  // "Normal", so it opens the same Run Amount table with the same maths.
  const LADDER_MARKETS = ['normal', 'over by over'];
  const isNormalMarket = LADDER_MARKETS.includes(gtype)
    || LADDER_MARKETS.includes((market.mname || '').toLowerCase());
  const isFancy1 = gtype === 'fancy1';
  const isKhado = gtype === 'khado';
  const isOddEven = gtype === 'oddeven';
  const [expanded, setExpanded] = useState(true);
  const [ladderRunner, setLadderRunner] = useState(null);

  const handleRunnerClick = isNormalMarket ? (runnerName) => {
    setLadderRunner(runnerName);
  } : null;

  // Khado layout: only Back column, no Lay, lay value appended to name
  if (isKhado) {
    return (
      <div className="market-10" id={`goto-${market.mid}`}>
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
          {expanded && (
          <div id={`market${marketIndex}`} className="bet-table-body collapse show container-fluid container-fluid-5">
            <div className="row row5 d-none-mobile">
              <div className="col-12 col-md-6">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  <div className="back bl-title back-title">Back</div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  <div className="back bl-title back-title">Back</div>
                </div>
              </div>
            </div>
            <div className="row row5">
              {sections.map((s, i) => (
                <div key={s.sid || i} className="col-12 col-md-6">
                  <KhadoRow
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
          </div>
          )}
        </div>
        {market.rem && <div className="market-message">{market.rem}</div>}
      </div>
    );
  }

  const backLabel = isFancy1 ? 'Back' : 'Yes';
  const layLabel = isFancy1 ? 'Lay' : 'No';

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
        {expanded && (
        <div id={`market${marketIndex}`} data-title={(market.status || '').toUpperCase() || 'OPEN'} className="bet-table-body collapse show container-fluid container-fluid-5">
          <div className={`row row5${isFancy1 ? ' d-none-mobile' : ''}`}>
            <div className="col-12 col-md-6">
              <div className="fancy-tripple">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  {isFancy1 ? (
                    <>
                      <div className="back bl-title back-title">{backLabel}</div>
                      <div className="lay bl-title lay-title">{layLabel}</div>
                    </>
                  ) : (
                    <>
                      <div className="lay bl-title lay-title">{layLabel}</div>
                      <div className="back bl-title back-title">{backLabel}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 d-none-mobile">
              <div className="fancy-tripple">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  {isFancy1 ? (
                    <>
                      <div className="back bl-title back-title">{backLabel}</div>
                      <div className="lay bl-title lay-title">{layLabel}</div>
                    </>
                  ) : (
                    <>
                      <div className="lay bl-title lay-title">{layLabel}</div>
                      <div className="back bl-title back-title">{backLabel}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="row row5">
            {sections.map((s, i) => (
              <div key={s.sid || i} className="col-12 col-md-6">
                <FancyRow
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
                  onRunnerClick={handleRunnerClick}
                  isFancy1={isFancy1}
                />
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
      {market.rem && (
        <div className="market-message">{market.rem}</div>
      )}
      <RunAmountModal
        show={!!ladderRunner}
        onClose={() => setLadderRunner(null)}
        runnerName={ladderRunner}
        matchId={matchId}
        eventId={matchId}
        sid="4"
      />
    </div>
  );
}
