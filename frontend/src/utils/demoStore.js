// ─── Demo login store ───────────────────────────────────────────────────────
// ALL demo-mode logic lives here (see frontend/docs/DEMO_LOGIN.md).
// State persists in localStorage under `demo_state` so a refresh keeps the
// demo balance / exposure / bets. Components only branch on isDemoUser() and
// call demoPlaceBet / demoCasinoPlaceBet — the real API flows stay untouched.

import { calculateSingleBetPLValue, calculateMatchOddsResults } from './betHelpers';

const KEY = 'demo_state';
const TTL_MS = 24 * 60 * 60 * 1000; // stale demo state re-seeds after 24h

export const DEMO_STARTING_BALANCE = 1500;

export function isDemoUser(user) {
  return !user || user.username === 'Demo' || user.email === 'demo@mail.com';
}

export function isDemoToken() {
  return localStorage.getItem('token') === 'demo-token';
}

export function seedDemoState() {
  const state = {
    balance: DEMO_STARTING_BALANCE,
    exposure: 0,
    matchedBets: [],
    casinoBets: [],
    statements: [
      {
        date: new Date().toISOString(),
        credit: DEMO_STARTING_BALANCE,
        debit: null,
        closing: DEMO_STARTING_BALANCE,
        remark: 'Opening Balance',
      },
    ],
    createdAt: Date.now(),
  };
  saveDemoState(state);
  return state;
}

export function loadDemoState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || typeof state.balance !== 'number') return null;
    if (Date.now() - (state.createdAt || 0) > TTL_MS) return null; // stale → re-seed
    return state;
  } catch {
    return null;
  }
}

export function saveDemoState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* storage full/blocked — demo keeps working from redux */ }
}

export function clearDemoState() {
  localStorage.removeItem(KEY);
}

/** Load-or-seed — what setDemoUser uses to hydrate redux. */
export function getOrSeedDemoState() {
  return loadDemoState() || seedDemoState();
}

// ── Mutations ────────────────────────────────────────────────────────────────

/* Reference behavior: demo balance stays at the seed value; exposure is
   NEGATIVE (−total liability). Total liability is NOT the sum of per-bet
   liabilities — bets on the same MATCH_ODDS/BOOKMAKER market offset each
   other, so the market's liability is the worst-case book across runners. */

const BOOK_TYPES = ['MATCH_ODDS', 'BOOKMAKER', 'Bookmaker', 'Bookmaker2'];

function computeSportsExposure(matchedBets) {
  const byMarket = {};
  for (const b of matchedBets || []) {
    const key = String(b.market_id ?? '');
    (byMarket[key] ||= []).push(b);
  }

  let total = 0;
  for (const bets of Object.values(byMarket)) {
    const bookBets = bets.filter(b => BOOK_TYPES.includes(b.marketType));
    const otherBets = bets.filter(b => !BOOK_TYPES.includes(b.marketType));

    if (bookBets.length > 0) {
      // Worst-case book over the market's real runner list when the bets
      // carry it; otherwise fall back to bet runners + a synthetic "any
      // other runner" outcome (covers runners with no bets on them).
      const runnerLists = bookBets
        .map(b => b.runners)
        .filter(r => Array.isArray(r) && r.length >= 2);
      const teams = runnerLists.length > 0
        ? [...new Set(runnerLists.flat().filter(Boolean))]
        : [...new Set(bookBets.map(b => b.teamName)), '__OTHER__'];
      const nets = calculateMatchOddsResults(bookBets, null, teams);
      const worst = Math.min(...Object.values(nets));
      if (worst < 0) total += -worst;
    }

    // Fancy-type bets don't offset — each line risks its own loss
    for (const b of otherBets) {
      const { loss } = calculateSingleBetPLValue({
        stake: b.stake, odds: b.odds, betType: b.betType, marketType: b.marketType,
      });
      total += loss;
    }
  }
  return total;
}

function computeCasinoExposure(casinoBets) {
  let total = 0;
  for (const b of casinoBets || []) {
    total += b.betType === 'lay'
      ? Math.max((Number(b.odds) || 0) - 1, 0) * Number(b.stake)
      : Number(b.stake);
  }
  return total;
}

function recomputeExposure(state) {
  const liability = computeSportsExposure(state.matchedBets) + computeCasinoExposure(state.casinoBets);
  state.exposure = liability > 0 ? Number((-liability).toFixed(2)) : 0;
  return state;
}

function pushStatement(state, remark) {
  state.statements.push({
    date: new Date().toISOString(),
    credit: null,
    debit: null,
    closing: state.balance,
    remark,
  });
}

/**
 * Preview the total liability if this sports bet were placed — used to
 * enforce the demo exposure limit (the balance) BEFORE accepting the bet.
 * Returns { liability, balance }; reject when liability > balance.
 */
export function demoExposureAfterBet({ stake, odds, betType, teamName, marketType, market_id, runners }) {
  const state = getOrSeedDemoState();
  const bet = {
    stake: Number(stake),
    odds: Number(odds),
    betType,
    teamName,
    marketType,
    market_id: market_id || '',
    runners: Array.isArray(runners) ? runners.filter(Boolean) : [],
  };
  const liability =
    computeSportsExposure([...state.matchedBets, bet]) + computeCasinoExposure(state.casinoBets);
  return { liability: Number(liability.toFixed(2)), balance: Number(state.balance) };
}

/**
 * Sports demo placebet — mirrors old-code handleDemoBetSubmission.
 * Returns { liability, exposure } so the caller can dispatch
 * updateDemoBalanceAndExposure({ exposure: liability }) and addMatchedBet(bet).
 */
export function demoPlaceBet({ stake, odds, betType, teamName, marketType, market_id, runners, event_id, event_name, sport_id, sports, match_time }) {
  const { exposure: liability } = calculateSingleBetPLValue({ stake, odds, betType, marketType });

  const bet = {
    id: Date.now(),
    stake: Number(stake),
    odds: Number(odds),
    betType,
    teamName,
    marketType,
    market_id: market_id || '',
    // Full runner list of the market — needed for the worst-case book calc
    runners: Array.isArray(runners) ? runners.filter(Boolean) : [],
    // Event metadata — needed by the "My Market" modal grouping
    event_id: event_id || '',
    event_name: event_name || '',
    sport_id: sport_id || '',
    sports: sports || '',
    match_time: match_time || '',
    timestamp: new Date().toISOString(),
  };

  const state = getOrSeedDemoState();
  state.matchedBets.push(bet);
  recomputeExposure(state);
  pushStatement(state, `${teamName} — ${betType} @ ${odds}, stake ${stake} (sports)`);
  saveDemoState(state);

  return { bet, liability, exposure: state.exposure };
}

/**
 * Casino demo placebet. Liability: back = stake, lay = (odds − 1) × stake.
 * Returns { bet, liability, exposure } — caller dispatches the redux update
 * and shows the success toast.
 */
export function demoCasinoPlaceBet({ gameType, matchId, nat, stake, odds, betType }) {
  const stakeNum = Number(stake);
  const oddsNum = Number(odds) || 0;
  const liability = betType === 'lay'
    ? Number((Math.max(oddsNum - 1, 0) * stakeNum).toFixed(2))
    : stakeNum;

  const bet = {
    id: Date.now(),
    mid: matchId,
    gameType,
    nat,
    stake: stakeNum,
    odds: oddsNum,
    betType,
    timestamp: new Date().toISOString(),
  };

  const state = getOrSeedDemoState();
  state.casinoBets.push(bet);
  recomputeExposure(state);
  pushStatement(state, `${nat} — ${betType} @ ${oddsNum}, stake ${stakeNum} (${gameType})`);
  saveDemoState(state);

  return { bet, liability, exposure: state.exposure };
}

/** Demo casino bets for the current round — for the "My Bet" sidebar. */
export function getDemoCasinoBets(mid) {
  const state = loadDemoState();
  if (!state) return [];
  return state.casinoBets.filter((b) => String(b.mid) === String(mid));
}

/** Demo statements for the Account Statement page. */
export function getDemoStatements() {
  const state = loadDemoState();
  return state ? [...state.statements].reverse() : [];
}

/** All open demo bets — for the Current Bets page. */
export function getDemoOpenBets() {
  const state = loadDemoState();
  if (!state) return { matchedBets: [], casinoBets: [] };
  return { matchedBets: state.matchedBets, casinoBets: state.casinoBets };
}
