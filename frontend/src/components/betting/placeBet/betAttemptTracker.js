// ─── Anti-spam guard for bet submits ─────────────────────────────────────────
// Max MAX_ATTEMPTS submit attempts per market within the rolling WINDOW_MS;
// the next attempt is blocked and the caller shows the reference toast
// "Multiple Bet Not Allowed On Same Time AND Same Market."
//
// Module-level so the count survives panel close/reopen on the same market.
// A blocked attempt is NOT recorded — once the oldest attempt falls out of
// the window, betting on that market opens up again by itself.

const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 4;

const attemptsByMarket = new Map();

export function registerBetAttempt(marketKey) {
  const key = String(marketKey || 'unknown');
  const now = Date.now();
  const recent = (attemptsByMarket.get(key) || []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attemptsByMarket.set(key, recent);
    return false; // 5th attempt at the same time on the same market — blocked
  }
  recent.push(now);
  attemptsByMarket.set(key, recent);
  return true;
}
