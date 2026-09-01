// ─── Central toast strings for the sports bet-placement flow ─────────────────
// Single source of truth — keep the EXACT reference-site wording, including
// punctuation ("Bet Not Valid.." has two dots, "Game Not Active." has one).
// Used by usePlaceBetPanel / placeBetRules; add new bet toasts here first.

export const BET_TOAST = {
  ENTER_VALID_STAKE: 'Enter a valid stake amount',
  SERVER_ERROR: 'Server Error',
  BET_NOT_VALID: 'Bet Not Valid..',
  MIN_STAKE: (min) => `Minimum bet amount is ${min}`,
  MAX_STAKE: (max) => `Maximum bet amount is ${max}`,
  // Fixed reference wording/HTML for below-min / above-max stake
  MIN_BET_LIMIT: 'Check Minimum Bet Limit.',
  MAX_BET_LIMIT: 'Check Maximum Bet Limit2.',
  // Cricket limited-overs (ODI/T20) MATCH_ODDS rate cap — odds > 4.00 rejected
  RATE_OVER_LIMIT: 'Bet Not Accept Rate Over 4.00 on Oneday and T20',
  GAME_NOT_ACTIVE: 'Bet Not Confirm Reason Game Not Active.',
  // MATCH_ODDS maxb:1 kill-switch — the feed quotes maxb 1 when the market is
  // not bettable while still rendering OPEN. Reference: ~5s loader after
  // submit, then this exact toast (trailing "2", like "Check Maximum Bet Limit2.")
  GAME_NOT_ACTIVE_2: 'Game Not Active2.',
  // Cashout: the computed hedge stake falls outside the market's Min/Max
  // range (e.g. Min 100 / Max 1L header) — reference rejects with this text
  BET_NOT_CONFIRM_RANGE: 'Bet Not Confirm Reason Min and Max Bet Range Not Valid.',
  INVALID_BET: 'Invalid bet',
  BALL_RUNNING: 'Ball Running',
  ODDS_CHANGED: 'Odds changed',
  // Bookie-favour reject (live odds moved against the user) — reference shows
  // this fixed text, never the internal "Odds rose/dropped from X to Y" reason
  BET_NOT_CONFIRM_ODDS_CHANGE: 'Bet not confirm Odds change',
  CHECK_BALANCE: 'Bet Not Confirm Check Balance.',
  MULTIPLE_BET_NOT_ALLOWED: 'Multiple Bet Not Allowed On Same Time AND Same Market.',
  // Manual odds edit in the favourable direction (BACK edited>selected /
  // LAY edited<selected) — reference (lords BetSlip.js:337-351) rejects it for
  // every user, only the against-market direction is allowed as an unmatched bet.
  UNMATCHED_NOT_ALLOWED: 'Unmatched bet not allowed.',
  BET_PLACED: 'Bet placed Successfully',
  BET_CANCELLED: 'Bet cancelled successfully',
  CANCEL_FAILED: 'Failed to cancel bet',
  NETWORK_ERROR: 'Network error',
  GENERIC_ERROR: 'Something went wrong',
};
