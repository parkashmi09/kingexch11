import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { bToastError } from '../components/BToast';
import useRacingData from '../hooks/useRacingData';
import OneClickBetting from '../components/gamedetails/OneClickBetting';
import SportsStream from '../components/gamedetails/SportsStream';
import PlaceBetPanel from '../components/betting/PlaceBetPanel';
import CombinedBetSlip from '../components/betting/CombinedBetSlip';
import MatchedBetsTable from '../components/betting/MatchedBetsTable';
import { getOneClickButtons, updateOneClickButtons } from '../apiservices/oneClickButtonService';
import { getMatchExposures } from '../apiservices/sportsService';
import { fetchMatchedBetsThunk } from '../redux/matchedBetsSlice';
import { formatOdd, formatSize, formatMax, isMarketSuspended, classifyMarket, formatBookValue } from '../utils/oddsHelpers';
import { calcCombinedOdds, formatFeedIstTime, parseFeedIstTime, isRaceBettingOpen, RACE_WINDOW_TOAST } from '../utils/racingUtils';
import { isDemoUser } from '../utils/demoStore';

// Jockey silks are served per-market: race_icons/{mid}/{runner sid}.png — the
// feed's `himg` is just "{sid}.png", so the mid has to be prefixed here.
const SILK_BASE = 'https://sitethemedata.com/race_icons/';

// A COMBINED slip covers at most this many runners — the 5th checkbox is
// disabled until one is unticked (unticking is always allowed).
const MAX_COMBINED_RUNNERS = 4;

// The six columns map onto the feed's odds tiers by `tno`: back tno2/1/0 ->
// .back2/.back1/.back, lay tno0/1/2 -> .lay/.lay1/.lay2 — the best price sits
// in the middle pair and worse prices fan outwards.
const TIERS = [
  { otype: 'back', tno: 2, cls: 'back2', mobileHidden: true },
  { otype: 'back', tno: 1, cls: 'back1', mobileHidden: true },
  { otype: 'back', tno: 0, cls: 'back', mobileHidden: false },
  { otype: 'lay', tno: 0, cls: 'lay', mobileHidden: false },
  { otype: 'lay', tno: 1, cls: 'lay1', mobileHidden: true },
  { otype: 'lay', tno: 2, cls: 'lay2', mobileHidden: true },
];

// Flash a cell green (odds-up) / red (odds-down) for 600ms when its price
// moves — same helper the cricket market blocks use.
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

// Blink on price moves. Cells are keyed by tier index, so a runner that keeps
// its slot keeps its history across polls.
function useOddsFlash(tierOdds) {
  const cellRefs = useRef([]);
  const prevRef = useRef(null);
  useEffect(() => {
    const cur = tierOdds.map((o) => Number(o?.odds) || 0);
    if (prevRef.current) {
      cur.forEach((v, i) => flashCell(cellRefs.current[i], v, prevRef.current[i]));
    }
    prevRef.current = cur;
  });
  return cellRefs;
}

/* Three cell states, distinguished by whether the feed even carries an odds
   object for that tier — NOT by the market's SUSPENDED status:
     • value present            → the price + size
     • object exists, value 0   → em-dash "—", class `suspended no-val`
     • no object for this tier  → hyphen "-", class `no-val` (no `suspended`)
   An Indian pre-off race ships only back/lay tno0, so its depth columns
   (back2/back1/lay1/lay2) are the hyphen case while the centre pair is em-dash.
   `prefix` doubles the otype into the class (`bl-box back back2`) — market-4
   rows do that, market-12 rows don't. */
function oddCells(tierOdds, cellRefs, { prefix = false, onCellClick = null } = {}) {
  return TIERS.map(({ cls, mobileHidden }, i) => {
    const odd = tierOdds[i];
    const hasObject = !!odd;
    const hasVal = hasObject && odd.odds > 0;
    const clickable = hasVal && typeof onCellClick === 'function';
    const classes = [
      'bl-box',
      prefix ? (cls.startsWith('back') ? 'back' : 'lay') : null,
      cls,
      mobileHidden && !prefix ? 'd-none-mobile' : null,
      hasVal ? null : (hasObject ? 'suspended no-val' : 'no-val'),
    ].filter(Boolean).join(' ');
    return (
      <div
        key={cls}
        ref={(el) => { cellRefs.current[i] = el; }}
        className={classes}
        onClick={clickable ? () => onCellClick(odd, i) : undefined}
        style={clickable ? { cursor: 'pointer' } : undefined}
      >
        <span className="d-block odds">{hasVal ? formatOdd(odd.odds) : (hasObject ? '—' : '-')}</span>
        {hasVal && odd.size ? <span className="d-block">{formatSize(odd.size)}</span> : null}
      </div>
    );
  });
}

// Best available price of one side (tno 0 = top of book) for a racing runner
function bestSideOdd(runner, side) {
  return (runner?.odds || []).find(
    (o) => (o.otype || '').toLowerCase() === side && o.tno === 0 && o.odds > 0
  ) || null;
}

// betInfo builder shared by the runner rows (market-12 + market-4): everything
// the PlaceBetPanel pipeline and prepareBetPayload need about the clicked cell.
function buildRaceBetInfo({ market, runner, odd, tierIdx }) {
  const type = TIERS[tierIdx].otype; // 'back' | 'lay'
  const allSections = market.section || [];
  const names = allSections.map((s) => s.nat || '');
  return {
    odds: odd.odds,
    betType: type,
    team: runner.nat || '',
    teamName: runner.nat || '',
    marketType: classifyMarket(market),
    market_type: classifyMarket(market),
    market_id: market.mid,
    selectionId: runner.sid,
    mname: market.mname || '',
    market_name: market.mname || '',
    gtype: market.gtype || 'match',
    section: allSections,
    runners: names,
    outcomes: names,
    team_one: names[0] || '',
    team_two: names[1] || '',
    min_stake: market.min || null,
    // Racing maxb is a feed FLAG (always 1), never a stake cap — the real cap
    // is market.max. Passing maxb through would cap every bet at ₹1.
    max_stake: market.max || null,
    maxb: null,
    back_size: (type === 'back' ? odd : bestSideOdd(runner, 'back'))?.size,
    lay_size: (type === 'lay' ? odd : bestSideOdd(runner, 'lay'))?.size,
    market,
  };
}

// Right-aligned per-runner book (green/red) on the name line
function runnerBook(exposure) {
  if (exposure == null) return null;
  const cls = exposure > 0 ? 'book-green' : exposure < 0 ? 'book-red' : '';
  return <span className={cls}>{formatBookValue(exposure)}</span>;
}

/* A non-runner: the feed flips gstatus to REMOVED and fills in `adfa` (the
   Rule-4 deduction %) and `rdt` (when it was pulled). The reference spells
   that out in the row's tooltip — "REMOVED  -  22.12%,  7/17/2026 1:33:25 PM
   (IST)", double-spaced exactly like this, with rdt printed verbatim rather
   than reformatted — and marks the row suspendedtext + removed. */
function removedTitle(runner) {
  return `${runner.gstatus}  -  ${runner.adfa}%,  ${runner.rdt} (IST)`;
}

function RunnerRow({ runner, market, checked, checkDisabled = false, onToggleCheck, showCheckbox = true, activeBet, onBetClick, marketsRef, matchId, exposure }) {
  // Mobile-only jockey/trainer/age strip, collapsed behind the caret
  const [detailOpen, setDetailOpen] = useState(false);
  const tierOdds = tierOddsOf(runner);
  const cellRefs = useOddsFlash(tierOdds);
  const gstatus = (runner.gstatus || '').toUpperCase();
  const removed = gstatus === 'REMOVED';
  // A live-but-suspended runner (pre-off, or paused mid-race) gets the row's
  // suspendedtext class; only ACTIVE runners are left unstyled.
  const runnerSuspended = !removed && gstatus !== '' && gstatus !== 'ACTIVE';
  const inputRef = useRef(null);

  const handleCellClick = (odd, tierIdx) => {
    if (!onBetClick || removed || runnerSuspended) return;
    onBetClick(buildRaceBetInfo({ market, runner, odd, tierIdx }));
  };

  const showPanel = activeBet
    && String(activeBet.selectionId) === String(runner.sid)
    && String(activeBet.market_id) === String(market.mid);

  // Only the checkbox box selects — not the runner name / silk / jockey. The
  // real <input> is hidden behind its box (bootstrap z-index:-1), so a click
  // can't reach it; instead the label handles the click and toggles only when
  // the pointer is inside the input's own rect, which sits exactly over the
  // visible box. Everything else in the row is inert.
  const handleLabelClick = (e) => {
    e.preventDefault(); // never let the label's `for` toggle on its own
    const box = inputRef.current?.getBoundingClientRect();
    if (!box) return;
    if (e.clientX >= box.left && e.clientX <= box.right &&
        e.clientY >= box.top && e.clientY <= box.bottom) {
      onToggleCheck(rid);
    }
  };

  const rid = runner.sid;
  const cno = runner.cno || '';
  // Cloth number on top, stall draw in brackets — they genuinely differ
  // (cno 1 draw 5, cno 4 draw 1…). Indian races ship an empty cno (only a
  // draw), so the top number is omitted entirely there rather than blank.
  const draw = runner.sdraw || cno;
  // Real silks come from race_icons/{mid}/{sid}.png. Indian races carry no
  // himg — the reference falls back to a numbered horse silhouette by running
  // position (sno): horse/1.png, horse/2.png…
  const silk = runner.himg
    ? `${SILK_BASE}${market.mid}/${runner.sid}.png`
    : `/assets/horse/${runner.sno}.png`;

  const attrs = (
    <>
      <span className="horse-attr"><b>Jockey:</b> {runner.jname}</span>
      <span className="horse-attr"><b>Trainer:</b> {runner.tname}</span>
      <span className="horse-attr"><b>Age:</b> {runner.hage}</span>
    </>
  );

  return (
    <>
    <div
      data-title={removed ? removedTitle(runner) : (runner.gstatus || 'ACTIVE')}
      className={`bet-table-row${removed ? ' suspendedtext removed' : (runnerSuspended ? ' suspendedtext' : '')}`}
    >
      <div className="nation-name">
        <div className="custom-control custom-checkbox">
          {/* Greyhound (sid 65) renders NO checkbox at all — gated on the
              SPORT id, because sid-65 events can carry horse-shaped dtype-12
              markets. The label keeps its classes for layout; the box
              pseudo-elements are hidden via .no-checkbox. */}
          {showCheckbox && (
            <input
              ref={inputRef}
              type="checkbox"
              id={String(rid)}
              name={String(rid)}
              className="custom-control-input"
              checked={checked}
              disabled={checkDisabled}
              onChange={() => onToggleCheck(rid)}
            />
          )}
          {/* No htmlFor — the label click is geometry-gated in handleLabelClick
              so only the box toggles. :checked ~ label::before still styles the
              box (sibling selector, independent of `for`). */}
          <label
            className={`custom-control-label${showCheckbox ? '' : ' no-checkbox'}`}
            onClick={showCheckbox ? handleLabelClick : (e) => e.preventDefault()}
          >
            <div>
              {cno ? <span>{cno}</span> : null}
              <br />
              <span>({draw})</span>
            </div>
            <div>
              <img src={silk} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
            </div>
            <div>
              {/* `nat` already arrives numbered ("1. Scuzi Me") — render as-is */}
              <span><span>{runner.nat}</span></span>
              <div className="float-right">{runnerBook(exposure)}</div>
              <span className="d-none-mobile jockey-detail">
                <br />
                {attrs}
              </span>
            </div>
          </label>
          <span
            data-toggle="collapse"
            data-target={`#hDetail-${rid}`}
            className="d-none-desktop ml-2 horse-detail-arrow"
            aria-expanded={detailOpen ? 'true' : undefined}
            onClick={() => setDetailOpen((v) => !v)}
            style={{ cursor: 'pointer' }}
          >
            {/* Caret never flips — the reference keeps fa-angle-down even
                while the detail strip below is expanded */}
            <i className="fas fa-angle-down" />
          </span>
        </div>
      </div>

      {oddCells(tierOdds, cellRefs, { onCellClick: (removed || runnerSuspended) ? null : handleCellClick })}

      <div id={`hDetail-${rid}`} className={`d-none-desktop mt-1 jockey-mobile collapse${detailOpen ? ' show' : ''}`}>
        {attrs}
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
        section={runner}
        suspended={removed || runnerSuspended}
        marketsRef={marketsRef}
        matchId={matchId}
        onClose={() => onBetClick(null)}
      />
    )}
    </>
  );
}

// COMBINED (dutched) row above the market: one price per side, computed as
// 1/Σ(1/oddsᵢ) over the ticked runners. Each side is offered only when EVERY
// ticked runner has a live price on that side.
function CombinedTable({ index, numbers, backOdds, layOdds, onCombinedClick }) {
  const centre = (side, price) => {
    const clickable = price != null && typeof onCombinedClick === 'function';
    return (
      <div
        className={`bl-box ${side}${price != null ? '' : ' no-val'}`}
        onClick={clickable ? () => onCombinedClick(side, price) : undefined}
        style={clickable ? { cursor: 'pointer' } : undefined}
      >
        <span className="d-block odds">{price != null ? formatOdd(price) : '—'}</span>
      </div>
    );
  };
  return (
    <div className="bet-table">
      <div className="bet-table-header">
        <div className="nation-name">
          <span>COMBINED</span>
        </div>
      </div>
      <div id={`combined${index}`} className="bet-table-body collapse show">
        <div className="bet-table-row d-none-mobile">
          <div className="nation-name"><span className="max-bet"></span></div>
          <div className="back bl-title back-title">Back</div>
          <div className="lay bl-title lay-title">Lay</div>
        </div>
        <div className="bet-table-row">
          <div className="nation-name"><p>{numbers.join(' + ')}</p></div>
          <div className="bl-box no-val back2 d-none-mobile"><span className="d-block odds">-</span></div>
          <div className="bl-box no-val back1 d-none-mobile"><span className="d-block odds">-</span></div>
          {centre('back', backOdds)}
          {centre('lay', layOdds)}
          <div className="bl-box no-val lay1 d-none-mobile"><span className="d-block odds">-</span></div>
          <div className="bl-box no-val lay2 d-none-mobile"><span className="d-block odds">-</span></div>
        </div>
      </div>
    </div>
  );
}

// MATCH_ODDS (dtype 12): checkbox + silk + jockey rows, and the only market
// with a Max limit and the COMBINED table.
function RaceMarket({ market, index, sportId, race, gmid, activeBet, onBetClick, marketsRef, matchExposures, isAuth }) {
  const [expanded, setExpanded] = useState(true);
  const [checked, setChecked] = useState([]);
  // { side: 'back'|'lay', lockedOdds } — the open dutched slip
  const [combinedSlip, setCombinedSlip] = useState(null);
  const runners = market.section || [];
  const fmtMax = formatMax(market.maxb);
  // COMBINED (and its checkboxes) is a HORSE feature — greyhound events can
  // carry horse-shaped dtype-12 markets, so gate on the SPORT id, not dtype.
  const showCheckbox = String(sportId) === '10';

  const toggleCheck = (rid) => {
    const r = runners.find((x) => x.sid === rid);
    const gs = (r?.gstatus || '').toUpperCase();
    // Suspended / removed runners can't be ticked (unticking is always allowed)
    if (gs && gs !== 'ACTIVE' && !checked.includes(rid)) return;
    if (!checked.includes(rid) && checked.length >= MAX_COMBINED_RUNNERS) {
      bToastError(`You can combine at most ${MAX_COMBINED_RUNNERS} runners.`);
      return;
    }
    setChecked((cur) => (cur.includes(rid) ? cur.filter((x) => x !== rid) : [...cur, rid]));
  };

  // Close the slip whenever the ticked set changes — its price is stale
  const checkedKey = checked.join(',');
  useEffect(() => { setCombinedSlip(null); }, [checkedKey]);

  const checkedRunners = runners.filter((r) => checked.includes(r.sid));
  // Label is each runner's 1-based board POSITION, not its cloth number
  const checkedNumbers = runners
    .map((r, i) => ({ sid: r.sid, pos: i + 1 }))
    .filter(({ sid }) => checked.includes(sid))
    .map(({ pos }) => pos);

  // Combined price per side — only when every ticked runner quotes that side
  const combinedBack = checkedRunners.length >= 2
    ? calcCombinedOdds(checkedRunners.map((r) => bestSideOdd(r, 'back')?.odds || 0))
    : null;
  const combinedLay = checkedRunners.length >= 2
    ? calcCombinedOdds(checkedRunners.map((r) => bestSideOdd(r, 'lay')?.odds || 0))
    : null;

  const handleCombinedClick = (side, price) => {
    if (!isAuth) { bToastError('Please login to access!'); return; }
    if (String(sportId) === '10' && race?.stime && !isRaceBettingOpen(race.stime)) {
      bToastError(RACE_WINDOW_TOAST);
      return;
    }
    setCombinedSlip({ side, lockedOdds: price });
  };

  // Reference keeps a newline+indent between "Max:" and the value, which HTML
  // renders as a single space ("Max: 1"). JSX would otherwise collapse it to
  // "Max:1", so the space is explicit.
  const maxBet = (
    <span title={`Max : ${fmtMax}`}>
      Max:{' '}
      <span>{fmtMax}</span>
    </span>
  );

  return (
    <div className="market-12" id={`goto-${market.mid}`}>
      {checkedNumbers.length >= 2 && (
        <CombinedTable
          index={index}
          numbers={checkedNumbers}
          backOdds={combinedBack}
          layOdds={combinedLay}
          onCombinedClick={handleCombinedClick}
        />
      )}
      {checkedNumbers.length === 1 && <CombinedTable index={index} numbers={checkedNumbers} backOdds={null} layOdds={null} />}
      {combinedSlip && checkedRunners.length >= 2 && (
        <CombinedBetSlip
          market={market}
          checkedRunners={checkedRunners}
          side={combinedSlip.side}
          lockedOdds={combinedSlip.lockedOdds}
          onLockedOddsChange={(o) => setCombinedSlip((cur) => (cur ? { ...cur, lockedOdds: o } : cur))}
          gmid={gmid}
          sid={sportId}
          race={race}
          label={checkedNumbers.join(' + ')}
          onClose={() => setCombinedSlip(null)}
        />
      )}
      <div className="bet-table">
        <div className="bet-table-header">
          <div className="nation-name">
            <span
              title={market.mname}
              data-toggle="collapse"
              data-target={`#market${index}`}
              aria-expanded={expanded ? 'true' : 'false'}
              onClick={() => setExpanded((v) => !v)}
              style={{ cursor: 'pointer' }}
            >
              {market.mname}
            </span>
            <span className="max-bet d-none-desktop">{maxBet}</span>
          </div>
        </div>
        {/* No suspendedfull here — unlike market-4, a suspended market-12
            keeps a plain body and just blanks every price box. */}
        <div id={`market${index}`} className={`bet-table-body collapse${expanded ? ' show' : ''}`}>
          <div className="bet-table-row">
            <div className="nation-name"><span className="max-bet">{maxBet}</span></div>
            <div className="back bl-title back-title">Back</div>
            <div className="lay bl-title lay-title">Lay</div>
          </div>
          {runners.map((runner) => (
            <RunnerRow
              key={runner.sid}
              runner={runner}
              market={market}
              checked={checked.includes(runner.sid)}
              checkDisabled={checked.length >= MAX_COMBINED_RUNNERS && !checked.includes(runner.sid)}
              onToggleCheck={toggleCheck}
              showCheckbox={showCheckbox}
              activeBet={activeBet}
              onBetClick={onBetClick}
              marketsRef={marketsRef}
              matchId={gmid}
              exposure={matchExposures?.[`${String(market.mid).trim()}:${(runner.nat || '').trim().toLowerCase()}`]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BetMarketRow({ runner, market, marketSuspended, activeBet, onBetClick, marketsRef, matchId, exposure }) {
  const tierOdds = tierOddsOf(runner);
  const cellRefs = useOddsFlash(tierOdds);
  const gstatus = (runner.gstatus || '').toUpperCase();
  const runnerSuspended = gstatus !== '' && gstatus !== 'ACTIVE' && gstatus !== 'OPEN';
  const suspended = marketSuspended || runnerSuspended;

  const handleCellClick = (odd, tierIdx) => {
    if (!onBetClick || suspended) return;
    onBetClick(buildRaceBetInfo({ market, runner, odd, tierIdx }));
  };

  const showPanel = activeBet
    && String(activeBet.selectionId) === String(runner.sid)
    && String(activeBet.market_id) === String(market.mid);

  return (
    <>
    <div data-title={runner.gstatus || 'ACTIVE'} className="bet-table-row">
      <div className="nation-name">
        <p><span>{runner.nat}</span> <span className="float-right">{runnerBook(exposure)}</span></p>
        <p className="mb-0"></p>
      </div>
      {oddCells(tierOdds, cellRefs, { prefix: true, onCellClick: suspended ? null : handleCellClick })}
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
      />
    )}
    </>
  );
}

/* MATCH_BET (dtype 15) — a plain market-4 block, not market-12: no checkbox,
   no silk, no jockey strip and no Max (the reference renders those max-bet
   spans empty even though the feed sends maxb:1). Its runners are a subset of
   the MATCH_ODDS field, and the market is usually SUSPENDED — which the body
   carries via `suspendedfull` while each row keeps its own ACTIVE title. */
function RaceBetMarket({ market, index, gmid, activeBet, onBetClick, marketsRef, matchExposures }) {
  const [expanded, setExpanded] = useState(true);
  const marketSuspended = isMarketSuspended(market);
  return (
    <div className="market-4" id={`goto-${market.mid}`}>
      <div className="bet-table">
        <div className="bet-table-header">
          <div className="nation-name">
            <span
              title={market.mname}
              data-toggle="collapse"
              data-target={`#market${index}`}
              aria-expanded={expanded ? 'true' : 'false'}
              onClick={() => setExpanded((v) => !v)}
              style={{ cursor: 'pointer' }}
            >
              {market.mname}
            </span>
            <span className="max-bet d-none-desktop d-none-mobile"></span>
          </div>
        </div>
        <div
          id={`market${index}`}
          data-title={marketSuspended ? (market.status || 'SUSPENDED') : undefined}
          className={`bet-table-body collapse${expanded ? ' show' : ''}${marketSuspended ? ' suspendedfull' : ''}`}
        >
          <div className="bet-table-row">
            <div className="nation-name"><span className="max-bet text-left"></span></div>
            <div translate="no" className="back bl-title back-title">Back</div>
            <div translate="no" className="lay bl-title lay-title">Lay</div>
          </div>
          {(market.section || []).map((runner) => (
            <BetMarketRow
              key={runner.sid}
              runner={runner}
              market={market}
              marketSuspended={marketSuspended}
              activeBet={activeBet}
              onBetClick={onBetClick}
              marketsRef={marketsRef}
              matchId={gmid}
              exposure={matchExposures?.[`${String(market.mid).trim()}:${(runner.nat || '').trim().toLowerCase()}`]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Countdown to the off, shown in the banner while the race is still upcoming
// (the reference hides it once in-play). Seconds only appear inside the final
// hour; above that it counts hours + minutes, mirroring the reference which
// renders an empty node in place of the seconds.
function RaceTimer({ startMs }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = startMs - now;
  if (!(diff > 0)) return null;
  const total = Math.floor(diff / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return (
    <div className="horse-timer">
      <span>
        {h > 0 ? <>{h} <small>Hours</small>{' '}</> : null}
        {m} <small>Minutes</small>{' '}
        {h === 0 ? <>{s} <small>Seconds</small></> : null}
      </span>{' '}
      <span>Remaining</span>
    </div>
  );
}


/* Horse racing (sid 10) race page — the racing feed has no fancy/line markets
   and no market filter, so it gets its own page instead of a branch inside
   GameDetails: a banner built from the all-data country/venue walk, then one
   block per race market (MATCH_ODDS, MATCH_BET, Top 2 Finish…).
   Logged out the reference drops the tabs, the right sidebar and the TV. */
export default function RacingDetails() {
  const { sid, gmid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const user = useSelector((s) => s.user.user);
  const matchedBets = useSelector((s) => s.matchedBets?.matchedBets || []);
  const { markets, race, loading, error, noMarkets } = useRacingData(gmid, sid);
  const [activeTab, setActiveTab] = useState('game-data');
  const [showTv, setShowTv] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [activeBet, setActiveBet] = useState(null);
  const isHorse = String(sid) === '10';
  const sportName = isHorse ? 'Horse Racing' : 'Greyhound Racing';

  // Freshest market list for the submit pipeline's live checks (buffer
  // monitoring / suspension) — same pattern as GameDetails.
  const marketsRef = useRef([]);
  useEffect(() => { marketsRef.current = markets; }, [markets]);

  // Matched bets — poll every 5s + instant refresh on bet:placed
  useEffect(() => {
    if (!gmid || !user) return;
    const userId = user?.user_id || user?.id;
    if (!userId || isDemoUser(user)) return;
    dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId }));
    const iv = setInterval(() => dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId })), 5000);
    const onPlaced = () => dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId }));
    window.addEventListener('bet:placed', onPlaced);
    return () => { clearInterval(iv); window.removeEventListener('bet:placed', onPlaced); };
  }, [gmid, user?.user_id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Per-runner exposure rows — poll every 5s + instant refresh on bet:placed
  const [matchExposureRows, setMatchExposureRows] = useState([]);
  useEffect(() => {
    if (!gmid || !user) return;
    const userId = user?.user_id || user?.id;
    if (!userId || isDemoUser(user)) return;
    let alive = true;
    const fetchExp = () => {
      getMatchExposures(String(gmid), userId)
        .then((res) => {
          if (alive && res?.success && Array.isArray(res.data)) setMatchExposureRows(res.data);
        })
        .catch(() => {});
    };
    fetchExp();
    const id = setInterval(fetchExp, 5000);
    window.addEventListener('bet:placed', fetchExp);
    return () => { alive = false; clearInterval(id); window.removeEventListener('bet:placed', fetchExp); };
  }, [gmid, user?.user_id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Exposure rows → `${mid}:${runner}` map (rows carry match_id = market mid;
  // fall back to matching the market by its mname = row.game_type)
  const matchExposures = useMemo(() => {
    const map = {};
    if (!matchExposureRows.length || !markets.length) return map;
    const normName = (s) => String(s || '').trim().toLowerCase();
    const normType = (s) => String(s || '').toUpperCase().replace(/[\s_]+/g, '');
    for (const item of matchExposureRows) {
      const name = normName(item.team_name || item.teamName);
      const amt = Number(item.exposure_amount);
      if (!name || !Number.isFinite(amt)) continue;
      const rowMid = item.match_id != null ? String(item.match_id).trim() : '';
      let mkt = rowMid ? markets.find((m) => String(m.mid).trim() === rowMid) : null;
      if (!mkt) {
        const gt = normType(item.game_type);
        if (gt) {
          mkt = markets.find((m) => normType(m.mname) === gt
            && (m.section || []).some((s) => normName(s.nat) === name));
        }
      }
      if (!mkt) continue;
      const key = `${String(mkt.mid).trim()}:${name}`;
      map[key] = Number(((map[key] || 0) + amt).toFixed(2));
    }
    return map;
  }, [matchExposureRows, markets]);

  // Reveal content 2s after loading ends; while loading (or during that 2s
  // settle window) the loader stays on screen — same flow as GameDetails.
  useEffect(() => {
    if (loading) { setShowContent(false); return; }
    const t = setTimeout(() => setShowContent(true), 2000);
    return () => clearTimeout(t);
  }, [loading]);

  // The private-data API answered 404/500 (or {success:false}) for this gmid —
  // the race has no markets (usually: it just finished). Same reference
  // behavior as a cricket match: toast + back to home.
  useEffect(() => {
    if (!noMarkets) return;
    bToastError('There are no markets available in this game!');
    navigate('/', { replace: true });
  }, [noMarkets, navigate]);

  // 1-Click Betting — same per-user stakes as GameDetails (GET on mount, POST
  // on Save); localStorage only paints instantly until the fetch lands.
  const [oneClickEnabled, setOneClickEnabled] = useState(false);
  const [oneClickStakes, setOneClickStakes] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('oneClickStakes'));
      if (Array.isArray(s) && s.length === 3 && s.every((n) => Number.isFinite(n) && n > 0)) return s;
    } catch { /* fall through to defaults */ }
    return [100, 200, 300];
  });
  const [oneClickActiveIdx, setOneClickActiveIdx] = useState(0);
  useEffect(() => {
    if (!isAuth) return;
    let alive = true;
    getOneClickButtons().then((buttons) => {
      if (!alive) return;
      setOneClickStakes(buttons);
      localStorage.setItem('oneClickStakes', JSON.stringify(buttons));
    });
    return () => { alive = false; };
  }, [isAuth]);

  const oneClickProps = {
    enabled: oneClickEnabled,
    onToggle: (on) => { setOneClickEnabled(on); if (on) setOneClickActiveIdx(0); },
    stakes: oneClickStakes,
    onStakesChange: (stakes) => {
      setOneClickStakes(stakes);
      localStorage.setItem('oneClickStakes', JSON.stringify(stakes));
      updateOneClickButtons(stakes).catch(() => {});
      setOneClickActiveIdx(-1);
    },
    activeIdx: oneClickActiveIdx,
    onActiveChange: setOneClickActiveIdx,
  };

  const visibleMarkets = markets.filter((m) => m.section?.length > 0);

  // ── Bet placement ─────────────────────────────────────────────────────────
  const handleBetClick = useCallback((betInfo) => {
    if (!betInfo) { setActiveBet(null); return; }
    if (!isAuth) {
      bToastError('Please login to access!');
      return;
    }
    // Horse racing (sid 10) accepts bets only in the final 5 minutes before
    // the off — outside the window a click shows the toast and no slip opens.
    // Greyhound is not affected. The server enforces this too.
    if (isHorse && race?.stime && !isRaceBettingOpen(race.stime)) {
      bToastError(RACE_WINDOW_TOAST);
      return;
    }
    // A race has no team_one/team_two — the "match title" is the field
    const title = (betInfo.runners || []).filter(Boolean).join(' vs ');
    setActiveBet({
      ...betInfo,
      event_id: gmid,
      event_name: title,
      match_title: title,
      match_start_time: race?.stime || '',
      sid,
      sports: sportName,
      game_type: 'MATCH',
      team_one: betInfo.runners?.[0] || '',
      team_two: betInfo.runners?.[1] || '',
      oneClick: oneClickEnabled,
      oneClickStake: oneClickEnabled && oneClickActiveIdx >= 0 ? oneClickStakes[oneClickActiveIdx] : 0,
    });
  }, [gmid, sid, isAuth, isHorse, race?.stime, sportName, oneClickEnabled, oneClickStakes, oneClickActiveIdx]);

  // Reference header format: DD/MM/YYYY HH:mm:ss (UTC+05:30), 24-hour.
  // stime is an IST wall-clock string with no zone marker ("7/17/2026
  // 5:20:00 PM") — formatFeedIstTime reformats the IST parts WITHOUT
  // conversion, so every viewer sees the racecard time.
  const raceDate = race?.stime ? `${formatFeedIstTime(race.stime)} (UTC+05:30)` : '';

  // NOT the market status: the feed reports SUSPENDED for a race that is
  // already running (iplay true) while the reference banner reads IN-PLAY —
  // the in-play flag wins, and only an idle race shows the raw status.
  // parseFeedIstTime (NOT new Date): in any non-IST timezone new Date read
  // the stime 5h30m off, so the countdown and betting window were wrong.
  const startMs = race?.stime ? parseFeedIstTime(race.stime) : null;
  const status = race?.iplay ? 'IN-PLAY' : (visibleMarkets[0]?.status || '');
  const raceName = race ? `${race.cname} > ${race.venue}` : '';
  // "| 7f Nov Stks" on the reference. Our feed ships `rem` empty on every race
  // seen so far, so the span only appears if the backend starts filling it.
  const raceDesc = visibleMarkets[0]?.rem || '';

  /* One block per market, keyed off dtype:
       12 MATCH_ODDS   -> market-12 (checkbox/silk/jockey rows + COMBINED)
       15 MATCH_BET    -> market-4  (plain rows)
       16 Top N Finish -> NOT rendered. The feed ships Top 2/3/4 Finish with
          live prices, but neither reference capture puts them in the DOM, so
          the site evidently doesn't show them.
     The index drives #market{n} / #combined{n}, so it counts rendered blocks. */
  const marketList = visibleMarkets
    .filter((m) => m.dtype === 12 || m.dtype === 15)
    .map((market, i) => (market.dtype === 15
      ? <RaceBetMarket
          key={market.mid}
          market={market}
          index={i}
          gmid={gmid}
          activeBet={activeBet}
          onBetClick={handleBetClick}
          marketsRef={marketsRef}
          matchExposures={matchExposures}
        />
      : <RaceMarket
          key={market.mid}
          market={market}
          index={i}
          sportId={sid}
          race={race}
          gmid={gmid}
          activeBet={activeBet}
          onBetClick={handleBetClick}
          marketsRef={marketsRef}
          matchExposures={matchExposures}
          isAuth={isAuth}
        />));

  if (loading || !showContent) {
    // Same loader flow as GameDetails — up while loading AND for 2s after —
    // but wrapped in racing's own containers rather than cricket's.
    const loaderSection = (
      <div className="loader-section">
        <div>
          <img src="/assets/animate/loader-ten.gif" alt="loader" />
        </div>
      </div>
    );
    if (!isAuth) {
      return (
        <div className="center-container">
          <div className="horse-detail">
            <div className="detail-page-container loader-section-parent">{loaderSection}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="fullwidthdetail-container">
        <div className="horse-detail">
          <div className="casino-container">
            <div className="detail-page-container loader-section-parent">{loaderSection}</div>
          </div>
          <div id="right-sidebar-id" className="right-sidebar casino-right-sidebar">
            <Link to="/casino/worli3" className="">
              <div className="blink-message"><i className="fas fa-info-circle"></i> <div>Matka</div></div>
            </Link>
            <div className="user-settings">
              <div className="custom-control custom-switch">
                <input id="autocon-1" type="checkbox" name="autocon-1" className="custom-control-input" value="true" readOnly />
                <label htmlFor="autocon-1" className="custom-control-label">1 Click Betting</label>
              </div>
              <div className="one-click-bet float-left w-100"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && markets.length === 0) {
    return (
      <div className="fullwidthdetail-container">
        <div className="horse-detail">
          <div className="casino-container">
            <div className="detail-page-container">
              <div style={{ padding: '20px', textAlign: 'center' }}>Failed to load race data</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const banner = (
    <div
      className="banner scorecard-banner"
      style={{ backgroundImage: `url("/assets/events-banner/${sid}.png")` }}
    >
      <div className="scorecard">
        <div className="text-success">{status}</div>
        {isAuth ? (
          <>
            {/* Countdown until the off — hidden once the race is in-play */}
            {!race?.iplay && startMs ? <RaceTimer startMs={startMs} /> : null}
            <div className="time-detail">
              <p>{raceName}</p>
              <h5>
                <span>{raceDate}</span>
                {raceDesc ? <span>| {raceDesc}</span> : null}
              </h5>
            </div>
            <span className="d-none-desktop">
              <i className="fas fa-tv"></i> <small>Live TV</small>
            </span>
          </>
        ) : (
          /* Logged out the reference has no time-detail wrapper and no TV */
          <div>
            <p>{raceName}</p>
            <h5>{raceDate}</h5>
          </div>
        )}
      </div>
    </div>
  );

  // Logged out: center-container > horse-detail > detail-page-container, the
  // markets straight under the banner — no tabs, no sidebar.
  if (!isAuth) {
    return (
      <div className="center-container">
        <div className="horse-detail">
          <div className="detail-page-container">
            {banner}
            {marketList}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fullwidthdetail-container">
      <div className="horse-detail">
        <div className="casino-container">
          <div className="detail-page-container">
            {banner}

            {/* Mobile: Game Data / Matched Bets tabs. The markets render a
                SECOND time here — the reference keeps separate mobile and
                desktop copies rather than moving one between breakpoints. */}
            <div className="d-none-desktop w-100">
              <div className="text-right w-100 pr-2"></div>
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <a
                    data-toggle="tab"
                    href="#game-data"
                    className={`nav-link${activeTab === 'game-data' ? ' active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setActiveTab('game-data'); }}
                  >
                    Game Data
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    data-toggle="tab"
                    href="#matched-bet"
                    className={`nav-link${activeTab === 'matched-bet' ? ' active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setActiveTab('matched-bet'); }}
                  >
                    Matched Bets
                  </a>
                </li>
              </ul>
              <div className="tab-content">
                <div id="game-data" className={`tab-pane${activeTab === 'game-data' ? ' active' : ''}`}>
                  {/* Mobile live stream — toggled by the header TV icon, same as
                      the cricket game-details page (mount/unmount on showTv). */}
                  {showTv && <SportsStream gmid={gmid} className="d-none-desktop" />}
                  <div className="game-header">
                    <span className="game-header-name">
                      {raceName}
                      <div><small>{raceDate}</small></div>
                    </span>
                    <span>
                      <i
                        className={`fas fa-tv${showTv ? ' active-tab' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowTv((v) => !v)}
                      ></i>
                    </span>
                  </div>
                  <OneClickBetting id="autocon-1" {...oneClickProps}>
                    <Link to="/casino/worli3" className="">
                      <div className="blink-message"><i className="fas fa-info-circle"></i> <div>Matka</div></div>
                    </Link>
                  </OneClickBetting>
                  {marketList}
                </div>
                <div id="matched-bet" className={`tab-pane${activeTab === 'matched-bet' ? ' active' : ''}`}>
                  <MatchedBetsTable bets={matchedBets} idSuffix="m" />
                </div>
              </div>
            </div>

            {/* Desktop markets */}
            <div className="w-100 d-flex flex-wrap d-none-mobile">
              {marketList}
            </div>
          </div>
        </div>

        <div id="right-sidebar-id" className="right-sidebar casino-right-sidebar">
          <Link to="/casino/worli3" className="">
            <div className="blink-message"><i className="fas fa-info-circle"></i> <div>Matka</div></div>
          </Link>
          <OneClickBetting id="autocon-desktop" {...oneClickProps} />
          <div className="tv-container">
            <div
              className="tv-title"
              onClick={() => setShowTv((v) => !v)}
              style={{ cursor: 'pointer' }}
            >
              <span className="mb-0 bet-slip-title"><i className="fas fa-tv"></i> Live Match</span>
            </div>
            {showTv && <SportsStream gmid={gmid} className="mt-1" />}
          </div>

          {/* My Bet — Matched Bets list, same panel as the cricket page.
              Only renders once there are matched bets. */}
          {matchedBets.length > 0 && (
            <div className="my-market-container">
              <div data-toggle="collapse" className="my-market-title"><span>My Bet</span></div>
              <div id="market-data-1" className="bet-slip-box collapse show">
                <MatchedBetsTable bets={matchedBets} title="Matched Bets" idSuffix="d" />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="casino-banners"></div>
    </div>
  );
}
