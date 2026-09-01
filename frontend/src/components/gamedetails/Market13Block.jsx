import { useRef, useEffect } from 'react';
import { formatOdd, formatSize, formatMax, classifyMarket, isMarketSuspended, formatBookValue } from '../../utils/oddsHelpers';
import PlaceBetPanel from '../betting/PlaceBetPanel';

/* Greyhound racing (sid 65) MATCH_ODDS — the feed stamps it `dtype: 13` and the
   reference gives it its own block, `market-13`. It is NOT market-4:
     • the header carries NO market name and no Cashout button — just the
       mobile-only Max chip
     • the Back/Lay title row is `d-none-mobile`, and the four depth cells
       (back2/back1/lay1/lay2) are `d-none-mobile` too, so a phone shows only
       the best back and the best lay
     • each runner's name is preceded by its trap image, keyed off the feed's
       `sno` (1..8 — the trap/box number, not the array position)
   Horse racing (sid 10) never reaches here: it has its own page (RacingDetails,
   market-12 blocks) with silks, jockeys and the COMBINED slip. */

// Trap images are served 1..8 (9+ 404s upstream) — localized from the
// reference's CDN into public/assets/greyhound/.
const MAX_TRAP = 8;

// Column order, left→right. `tno` 0 is the top of the book, so the best pair
// sits in the middle and worse prices fan outwards. The four outer columns are
// desktop-only.
const TIERS = [
  { otype: 'back', tno: 2, cls: 'back2', mobileHidden: true },
  { otype: 'back', tno: 1, cls: 'back1', mobileHidden: true },
  { otype: 'back', tno: 0, cls: 'back', mobileHidden: false },
  { otype: 'lay', tno: 0, cls: 'lay', mobileHidden: false },
  { otype: 'lay', tno: 1, cls: 'lay1', mobileHidden: true },
  { otype: 'lay', tno: 2, cls: 'lay2', mobileHidden: true },
];

function flashCell(el, curOdds, prevOdds) {
  if (!el || prevOdds === null || prevOdds === undefined) return;
  if (curOdds <= 0 || prevOdds <= 0 || curOdds === prevOdds) return;
  const cls = curOdds > prevOdds ? 'odds-up' : 'odds-down';
  el.classList.remove('odds-up', 'odds-down');
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove('odds-up', 'odds-down'), 600);
}

function tierOddsOf(runner) {
  const odds = runner.odds || [];
  return TIERS.map(({ otype, tno }) =>
    odds.find((o) => (o.otype || '').toLowerCase() === otype && o.tno === tno));
}

// Best available price of one side, for the opposite-side size on a bet payload
function bestSideOdd(runner, side) {
  return (runner?.odds || []).find(
    (o) => (o.otype || '').toLowerCase() === side && o.tno === 0 && o.odds > 0
  ) || null;
}

function formatPL(val) {
  if (val === undefined || val === null) return null;
  const n = Number(val);
  if (isNaN(n)) return null;
  // 0 is a real book value (offsetting bets) — plain, with no green/red class
  if (n === 0) return { value: '0', className: '' };
  return { value: formatBookValue(n), className: n > 0 ? 'book-green' : 'book-red' };
}

function Market13Row({ runner, market, marketSuspended, activeBet, onBetClick, onBetChange, runnerPL, matchExposures, marketsRef, matchId, eventName }) {
  const tierOdds = tierOddsOf(runner);
  const cellRefs = useRef([]);
  const prevRef = useRef(null);
  useEffect(() => {
    const cur = tierOdds.map((o) => Number(o?.odds) || 0);
    if (prevRef.current) cur.forEach((v, i) => flashCell(cellRefs.current[i], v, prevRef.current[i]));
    prevRef.current = cur;
  });

  const gstatus = (runner.gstatus || '').toUpperCase();
  const runnerSuspended = gstatus !== '' && gstatus !== 'ACTIVE' && gstatus !== 'OPEN';
  const suspended = marketSuspended || runnerSuspended;

  const handleCellClick = (odd, tierIdx) => {
    if (!onBetClick || suspended) return;
    const type = TIERS[tierIdx].otype;
    const allSections = market.section || [];
    const names = allSections.map((s) => s.nat || '');
    onBetClick({
      odds: odd.odds,
      betType: type,
      team: runner.nat || '',
      teamName: runner.nat || '',
      marketType: classifyMarket(market),
      market_type: classifyMarket(market),
      market_id: market.mid,
      selectionId: runner.sid,
      event_id: matchId,
      event_name: eventName || '',
      mname: market.mname || '',
      market_name: market.mname || '',
      gtype: market.gtype || 'match',
      section: allSections,
      runners: names,
      outcomes: names,
      team_one: names[0] || '',
      team_two: names[1] || '',
      min_stake: market.min || null,
      // Racing `maxb` is a feed FLAG (ships as 1), never a stake cap — the real
      // cap is market.max. Passing maxb through would cap every bet at ₹1.
      max_stake: market.max || null,
      maxb: null,
      // Sizes describe the CLICKED rung on the bet side; the opposite side gets
      // its BEST rung (tno 0).
      back_size: (type === 'back' ? odd : bestSideOdd(runner, 'back'))?.size,
      lay_size: (type === 'lay' ? odd : bestSideOdd(runner, 'lay'))?.size,
      market,
    });
  };

  const showPanel = activeBet
    && String(activeBet.selectionId) === String(runner.sid)
    && String(activeBet.market_id || activeBet.market?.mid) === String(market.mid);

  const runnerName = runner.nat || '';
  // While the bet panel holds a valid stake the parent hands down a LIVE book
  // (existing exposure + what this pending bet would do); otherwise fall back
  // to the settled exposure map.
  const plData = runnerPL ? formatPL(runnerPL[runnerName]) : null;
  const exposure = (() => {
    if (!matchExposures || !runnerName) return null;
    const mid = market.mid != null ? String(market.mid).trim() : '';
    const val = matchExposures[`${mid}:${runnerName.trim().toLowerCase()}`];
    return val === undefined || val === null ? null : val;
  })();
  const book = plData || formatPL(exposure);

  const trap = Number(runner.sno);
  const trapImg = Number.isInteger(trap) && trap >= 1 && trap <= MAX_TRAP
    ? `/assets/greyhound/${trap}.png`
    : null;

  return (
    <>
      <div data-title={runner.gstatus || 'ACTIVE'} className={`bet-table-row${runnerSuspended ? ' suspendedtext' : ''}`}>
        <div className="nation-name">
          <p>
            <span>
              {/* Reference keeps a newline between the trap image and the name,
                  which renders as a space on top of the img's mr-1 margin. */}
              {trapImg && <><img src={trapImg} className="mr-1" alt="" />{' '}</>}
              {runnerName}
            </span>{' '}
            <span className={book?.className ? `float-right ${book.className}` : 'float-right'}>
              {book ? book.value : ''}
            </span>
          </p>
          <p className="mb-0">{runner.rem || ''}</p>
        </div>
        {TIERS.map(({ cls, mobileHidden, otype }, i) => {
          const odd = tierOdds[i];
          const hasVal = !!odd && odd.odds > 0;
          const clickable = hasVal && !suspended && !!onBetClick;
          // Two cell states, driven by the tier's PRICE, not the market status:
          //   odds > 0 → price + size
          //   odds 0 / tier missing → em-dash, class `no-val`, no size span
          // Plain `no-val` — NOT `suspended no-val`, which the cricket/football
          // blocks use. Verified against the live reference greyhound page: its
          // empty rungs on an ACTIVE runner carry only `no-val`, and the extra
          // `suspended` would lift `.bl-box.suspended:before` (z-index 1) into a
          // grey lock overlay the reference never draws here.
          const classes = [
            'bl-box',
            otype,
            cls,
            mobileHidden ? 'd-none-mobile' : null,
            hasVal ? null : 'no-val',
          ].filter(Boolean).join(' ');
          return (
            <div
              key={cls}
              ref={(el) => { cellRefs.current[i] = el; }}
              className={classes}
              onClick={clickable ? () => handleCellClick(odd, i) : undefined}
              style={clickable ? { cursor: 'pointer' } : undefined}
            >
              <span className="d-block odds">{hasVal ? formatOdd(odd.odds) : '—'}</span>
              {hasVal && odd.size ? <span className="d-block">{formatSize(odd.size)}</span> : null}
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
          section={runner}
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

export default function Market13Block({ market, onBetClick, onBetChange, activeBet, runnerPL, matchExposures, marketsRef, matchId, eventName }) {
  const runners = market.section || [];
  const marketSuspended = isMarketSuspended(market);
  // The Max chip reads `umaxbof`, NOT `maxb`. Verified against the live feed +
  // the reference page for this race: maxb ships as 1 (it's a flag, not an
  // amount), max is 2000, umaxbof is 10000 — and the reference chip reads
  // "Max: 10K". Reading maxb printed "Max: 1".
  const fmtMax = formatMax(market.umaxbof > 0 ? market.umaxbof : market.max);
  // Reference keeps a newline+indent between "Max:" and the value, which HTML
  // renders as a single space ("Max: 10K"). JSX would collapse it, so it's explicit.
  const maxBet = (
    <span title={`Max : ${fmtMax}`}>
      Max:{' '}
      <span>{fmtMax}</span>
    </span>
  );

  return (
    <div className="market-13" id={`goto-${market.mid}`}>
      <div className="bet-table">
        {/* No market name and no Cashout — the reference renders both as empty
            comment nodes here, leaving only the mobile Max chip. With nothing
            clickable there is no collapse toggle either: the body stays open. */}
        <div className="bet-table-header">
          <div className="nation-name">
            <span className="max-bet d-none-desktop">{maxBet}</span>
          </div>
        </div>
        <div id={`market-${market.mid}`} className="bet-table-body collapse show">
          <div className="bet-table-row d-none-mobile">
            <div className="nation-name"><span className="max-bet">{maxBet}</span></div>
            <div translate="no" className="back bl-title back-title">Back</div>
            <div translate="no" className="lay bl-title lay-title">Lay</div>
          </div>
          {runners.map((runner, i) => (
            <Market13Row
              key={runner.sid || i}
              runner={runner}
              market={market}
              marketSuspended={marketSuspended}
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
        </div>
      </div>
      {market.rem && <div className="market-message">{market.rem}</div>}
    </div>
  );
}
