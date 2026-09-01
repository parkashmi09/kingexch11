// ─── Pure betting rules for PlaceBetPanel ────────────────────────────────────
// No React, no side effects — every function here is a pure decision/calc.
// Add new market behaviours by extending the switch blocks below, NOT by
// sprinkling conditions inside the component/hook.

import { calculateSingleBetPLValue } from '../../../utils/betHelpers';
import { BET_TOAST } from '../../../utils/betToastMessages';

// ─── name / class helpers ───────────────────────────────────────────────────

export const normalizeName = (s) => String(s || '').trim().toLowerCase();

export function plClass(n) { return n >= 0 ? 'book-green' : 'book-red'; }

export const isLaySide = (betType) => betType === 'lay' || betType === 'no';

// Which side of the FEED a slip's bet type reads.
//
// Line markets (fancy2 / dtype 14) invert it: LineMarketBlock renders the feed's
// BACK tiers under "No" and its LAY tiers under "Yes" (the feed quotes run
// LINES there, not prices). A "no" bet on such a market is therefore backed by a
// feed BACK entry — looking it up as a lay lands on a completely different set
// of numbers, and every live check reads a drift that never happened.
export const feedSideFor = (betType, inverted = false) => {
  const lay = isLaySide(betType);
  return (inverted ? !lay : lay) ? 'lay' : 'back';
};

// ─── profit / loss ──────────────────────────────────────────────────────────

export function calcPL(stake, odds, betType, marketType) {
  const { profit, loss } = calculateSingleBetPLValue({ stake, odds, betType, marketType });
  return { profit: Number(profit.toFixed(2)), loss: Number(loss.toFixed(2)) };
}

export function calcProfit(stake, odds, betType, marketType) {
  return calcPL(stake, odds, betType, marketType).profit;
}

// ─── market family ──────────────────────────────────────────────────────────
// Single source of truth for "which kind of market is this". New market types
// get a case here and every consumer (exposure filter, P&L section, win/loss
// calc) picks it up automatically.

export const MARKET_FAMILY = {
  MATCH_ODDS: 'MATCH_ODDS',
  BOOKMAKER: 'BOOKMAKER',
  TIED_MATCH: 'TIED_MATCH',
  OTHER: 'OTHER',
};

// Market types reach us in three spellings for the same thing: our internal
// label ('BOOKMAKER'), the feed's mname ('Bookmaker 2') and the exposure row's
// game_type (= market_type, so also 'Bookmaker 2'). Strip everything that is
// not a letter/digit so all three collapse onto one key — otherwise
// 'Bookmaker 2' fell through to OTHER and lost its runner book.
export function normalizeMarketKey(marketType) {
  return String(marketType || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function getMarketFamily(marketType) {
  switch (normalizeMarketKey(marketType)) {
    case 'MATCHODDS':
      return MARKET_FAMILY.MATCH_ODDS;
    case 'BOOKMAKER':
    case 'BOOKMAKER2':
      return MARKET_FAMILY.BOOKMAKER;
    case 'TIEDMATCH':
      return MARKET_FAMILY.TIED_MATCH;
    default:
      return MARKET_FAMILY.OTHER;
  }
}

// Markets that carry a per-runner book (win/loss + exposure display)
export function hasRunnerBook(marketType) {
  return getMarketFamily(marketType) !== MARKET_FAMILY.OTHER;
}

// ─── Limited-overs MATCH_ODDS rate cap ───────────────────────────────────────
// Operator rule: "Bet Not Accept Rate Over 4.00 on Oneday and T20" — on CRICKET
// limited-overs matches (ODI / T20), a MATCH_ODDS bet's rate (odds) may not
// exceed 4.00. Test matches are EXEMPT (high match-odds are normal there).
// Applies to MATCH_ODDS only (not Bookmaker/Fancy/Tied), to BACK and LAY alike
// (the "rate" is the odds value, side-independent).
export const MATCH_ODDS_MAX_RATE = 4.0;

// Cricket format detection from competition (cname) + event (ename) name. Test
// formats are the ONLY cricket where the cap does not apply; everything else
// (ODI, T20, franchise T20 leagues, The Hundred) is treated as limited-overs.
// Erring toward "limited-overs" is the SAFE default (applies the cap when unsure).
const TEST_FORMAT_RE = /\btest\b|ashes|first[\s-]?class|county\s+champ|sheffield\s+shield|ranji|plunket/i;

export function isCricketLimitedOvers({ sid, cname, ename }) {
  if (String(sid) !== '4') return false;            // cricket (sid 4) only
  if (TEST_FORMAT_RE.test(`${cname || ''} ${ename || ''}`)) return false; // Test → exempt
  return true;                                       // ODI / T20 / other limited-overs
}

// True when a MATCH_ODDS bet breaks the limited-overs rate cap → reject.
export function isOverRateBlocked({ marketType, odds, limitedOvers }) {
  if (!limitedOvers) return false;
  if (getMarketFamily(marketType) !== MARKET_FAMILY.MATCH_ODDS) return false;
  return Number(odds) > MATCH_ODDS_MAX_RATE;
}

// Does an exposure item from the API belong to the market this panel is on?
export function exposureItemMatchesMarket(itemGameType, ourMarketType) {
  const ourFamily = getMarketFamily(ourMarketType);
  switch (ourFamily) {
    case MARKET_FAMILY.MATCH_ODDS:
    case MARKET_FAMILY.BOOKMAKER:
      return getMarketFamily(itemGameType) === ourFamily;
    default:
      return true;
  }
}

// ─── odds editability ───────────────────────────────────────────────────────

const LOCKED_ODDS_TYPES = ['normal', 'over by over', 'fancy1', 'khado', 'meter', 'oddeven'];

export function isOddsLockedByType(marketType, mname) {
  return LOCKED_ODDS_TYPES.includes((marketType || '').toLowerCase()) ||
    LOCKED_ODDS_TYPES.includes((mname || '').toLowerCase());
}

// Bookmaker-family markets (gtype match1 — "Bookmaker", "Bookmaker 2",
// "BM 2nd Set Winner"…): odds render as a plain <span>, not an input
export function isBookmakerStyle(gtype, mname) {
  if (gtype === 'match1') return true;
  if (/bookmaker/i.test(mname)) return true;
  return /^\s*bm\b/i.test(mname);
}

// ─── odds tick ladder ───────────────────────────────────────────────────────
// Step size depends on the range the value sits in:
//   1–2: 0.01 | 2–3: 0.02 | 3–4: 0.05 | 4–6: 0.1 | 6–10: 0.2
//   10–20: 0.5 | 20–30: 1 | 30–50: 2 | 50–100: 5 | 100–1000: 10

const ODDS_TICK_BANDS = [
  [1, 2, 0.01], [2, 3, 0.02], [3, 4, 0.05], [4, 6, 0.1], [6, 10, 0.2],
  [10, 20, 0.5], [20, 30, 1], [30, 50, 2], [50, 100, 5], [100, 1000, 10],
];

function oddsStepFor(value, dir) {
  // Decrement at a band boundary uses the LOWER band's step (2.00 − → 1.99);
  // increment at the boundary uses the upper band (2.00 + → 2.02)
  const x = dir > 0 ? value : value - 0.000001;
  const band = ODDS_TICK_BANDS.find(([lo, hi]) => x >= lo && x < hi);
  if (band) return band[2];
  return x >= 1000 ? 10 : 0.01;
}

export function stepOdds(prevStr, dir) {
  const n = parseFloat(prevStr) || 0;
  const step = oddsStepFor(n, dir);
  const next = Math.max(1.01, Math.min(1000, Math.round((n + dir * step) * 100) / 100));
  // No decimal padding — 38 stays 38, 1.99 stays 1.99 (never 38.00)
  return String(Number(next.toFixed(2)));
}

// ─── live game status ───────────────────────────────────────────────────────

export function isBlockedGameStatus(gs) {
  switch (gs) {
    case 'SUSPENDED':
    case 'BALL RUNNING':
    case 'INACTIVE':
      return true;
    default:
      return false;
  }
}

export function suspensionToastMessage(gs) {
  switch (gs) {
    case 'BALL RUNNING':
      return BET_TOAST.BALL_RUNNING;
    default:
      return BET_TOAST.GAME_NOT_ACTIVE;
  }
}

// ─── pre-submit validation ──────────────────────────────────────────────────
// Returns a BET_ERROR code (or null when the bet is placeable). The hook maps
// each code to its toast/side-effect in ONE switch — add new rejection reasons
// here first, then handle the code there.

// Global minimum bet floor — no manual bet may be placed below this amount,
// regardless of the market's own (often 0) min. Cashout hedges are exempt
// (their stake is computed, not chosen). Applied in usePlaceBetPanel.
export const MIN_BET_AMOUNT = 100;

export const BET_ERROR = {
  EMPTY_STAKE: 'EMPTY_STAKE',
  ABSURD_SERVER: 'ABSURD_SERVER',   // 16+ zeros → fake loader, then "Server Error"
  ABSURD_INVALID: 'ABSURD_INVALID', // 12–15 zeros → instant "Bet Not Valid.."
  BELOW_MIN: 'BELOW_MIN',
  ABOVE_MAX: 'ABOVE_MAX',
  SUSPENDED: 'SUSPENDED',
  INVALID: 'INVALID',
};

export function getBetValidationError({ stakeNum, minStake, maxStake, suspended, isValid }) {
  if (stakeNum <= 0) return BET_ERROR.EMPTY_STAKE;
  if (stakeNum >= 1e16) return BET_ERROR.ABSURD_SERVER;
  // Amounts with 12–15 zeros (1e12 up to but not including 1e16) — reference
  // rejects these instantly with the "Bet Not Valid.." toast
  if (stakeNum >= 1e12) return BET_ERROR.ABSURD_INVALID;
  if (minStake > 0 && stakeNum < minStake) return BET_ERROR.BELOW_MIN;
  if (maxStake > 0 && stakeNum > maxStake) return BET_ERROR.ABOVE_MAX;
  if (suspended) return BET_ERROR.SUSPENDED;
  if (!isValid) return BET_ERROR.INVALID;
  return null;
}
