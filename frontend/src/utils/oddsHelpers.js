export function formatOdd(val) {
  if (val === null || val === undefined || val === 0 || val === '--') return '--';
  const n = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(n)) return '--';
  // Render the feed value EXACTLY as-is (9.5 stays 9.5, not 9.50) — the
  // reference never pads decimals. String(n) drops trailing zeros.
  return String(n);
}

export function formatSize(size) {
  if (!size || size === 0) return '';
  const n = typeof size === 'number' ? size : Number(size);
  if (isNaN(n) || n === 0) return '';
  if (n >= 100000) { const v = n / 100000; return (v % 1 === 0 ? v.toString() : v.toFixed(2)) + 'L'; }
  if (n >= 1000) { const v = n / 1000; return (v % 1 === 0 ? v.toString() : v.toFixed(2)) + 'K'; }
  return String(n);
}

export function formatMax(val) {
  if (!val || val === 0) return '0';
  const n = typeof val === 'number' ? val : Number(val);
  if (isNaN(n) || n === 0) return '0';
  if (n >= 100000) { const v = n / 100000; return (v % 1 === 0 ? v.toString() : v.toFixed(2)) + 'L'; }
  if (n >= 1000) { const v = n / 1000; return (v % 1 === 0 ? v.toString() : v.toFixed(2)) + 'K'; }
  return String(n);
}

// MATCH_ODDS bettable limit depends on match state, never on the raw fields
// alone: pre-match (iplay false) -> umaxbof (the provider's tiny pre-match
// cap, e.g. 0/1); in-play -> maxb on cricket (sid 4), max on every other
// sport. maxb is folded into `max` so the header shows a single Max and the
// stake-validation chain picks the same number. Markets that never quote
// umaxbof (all-data summaries, racing) are returned untouched.
export function applyMatchOddsLimits(market, sid) {
  if ((market?.mname || '').toUpperCase() !== 'MATCH_ODDS') return market;
  if (market?.umaxbof === undefined) return market;
  const inPlayMax = Number(sid) === 4 ? market.maxb : market.max;
  const effectiveMax = Number(market.iplay ? inPlayMax : market.umaxbof) || 0;
  return { ...market, max: effectiveMax, maxb: 0 };
}

// Book/exposure display — en-IN comma grouping (99800 → "99,800",
// 200000 → "2,00,000"), same style the per-runner P&L uses
export function formatBookValue(val) {
  const n = Number(val);
  if (!Number.isFinite(n)) return '';
  const abs = Math.abs(n);
  const formatted = abs >= 1000 ? abs.toLocaleString('en-IN') : String(Math.round(abs * 100) / 100);
  return n < 0 ? `-${formatted}` : formatted;
}

export function classifyMarket(market) {
  const gtype = (market.gtype || '').toLowerCase();
  if (gtype === 'match') return 'MATCH_ODDS';
  if (gtype === 'match1') return 'BOOKMAKER';
  if (gtype === 'fancy2') return 'LINE_MARKET';
  if (gtype === 'oddeven') return 'ODD_EVEN';
  if (gtype === 'fancy' || gtype === 'normal' || gtype === 'fancy1' || gtype === 'meter' || gtype === 'khado') return 'FANCY';
  if (gtype === 'cricketcasino') return 'CRICKET_CASINO';

  const mname = (market.mname || '').toLowerCase();
  if (mname === 'match odds' || mname === 'match_odds' || mname === 'winner') return 'MATCH_ODDS';
  if (mname.includes('bookmaker')) return 'BOOKMAKER';
  if (mname === 'tied match' || mname === 'tied_match') return 'MATCH_ODDS';
  return 'FANCY';
}

export function isMarketSuspended(market) {
  const gtype = (market.gtype || '').toLowerCase();
  // For match1 (Bookmaker), ignore market-level status — only section.gstatus matters
  if (gtype === 'match1') return false;
  const s = (market.gstatus || market.status || '').toUpperCase();
  if (s === 'OPEN' || s === 'ACTIVE') return false;
  return s === 'SUSPENDED' || s === 'BALL RUNNING' || s === 'INACTIVE';
}

/**
 * Calculate per-runner win/loss for MATCH_ODDS / BOOKMAKER markets.
 * Given a current bet (from the open PlaceBetPanel), computes what each runner
 * would win/lose if that runner wins.
 *
 * @param {Object} currentBet - { stake, odds, betType, teamName, marketType }
 * @param {string[]} runnerNames - all runner names in the market
 * @returns {Object} { runnerName: netValue, ... }
 */
export function calculateRunnerPL(currentBet, runnerNames) {
  if (!currentBet || !runnerNames || runnerNames.length < 2) return {};
  const { stake, odds, betType, teamName, marketType } = currentBet;
  const s = Number(stake) || 0;
  const o = Number(odds) || 0;

  // Tolerate spaces/underscores: the payload and the exposure rows carry the
  // feed's mname ('Bookmaker 2'), not our internal label.
  const mt = String(marketType || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const isBook = mt === 'BOOKMAKER' || mt === 'BOOKMAKER2' || mt === 'TIEDMATCH';
  // Bookmaker/tied quotes are small percents (0.75, 1) — any positive odd is
  // valid. Decimal markets still require >= 1.01.
  if (s <= 0 || o <= 0 || (!isBook && o < 1.01)) return {};
  // EXACT mirror of the backend walk (this preview must equal what the
  // exposure API returns after placing). BM-family odds (Bookmaker + Tied
  // Match, gtype match1) are percent for EVERY quote — mult = o/100 UNFLOORED
  // (back 100 @ 1.25 → +1.25), no >=10 cutoff. A >=10 cutoff here showed +25
  // in the cell for a 1.25 tied quote while the backend booked 1.25.
  const mult = isBook ? o / 100 : o - 1;

  const results = {};
  for (const runner of runnerNames) {
    const isThisRunner = (runner || '').trim().toLowerCase() === (teamName || '').trim().toLowerCase();

    if (betType === 'back' || betType === 'yes') {
      results[runner] = isThisRunner ? mult * s : -s;
    } else {
      // lay / no
      results[runner] = isThisRunner ? -(mult * s) : s;
    }

    results[runner] = Number(results[runner].toFixed(2));
  }
  return results;
}

export function isSectionSuspended(section) {
  const s = (section.gstatus || section.status || '').toUpperCase();
  // Football feeds use gstatus "OPEN" for live rows (cricket uses "ACTIVE")
  if (s === 'ACTIVE' || s === 'OPEN') return false;
  if (s && s !== '') return true;
  // No explicit status — fall back to checking if any valid odds exist
  const odds = section.odds || [];
  return !odds.some(o => (o.otype || '').toUpperCase() === 'BACK' && o.odds > 0)
      && !odds.some(o => (o.otype || '').toUpperCase() === 'LAY' && o.odds > 0);
}
