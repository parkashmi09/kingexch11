// ─── Racing helpers: COMBINED (dutched) betting + IST feed times ─────────────
//
// COMBINED betting: tick 2+ runners on the racecard → one stake is split
// across them so that WHICHEVER selected runner wins, the return is the same.
// It is not one wager — it is one bet per runner, each at its own price.

export const RACE_BET_WINDOW_MINUTES = 5;
export const RACE_WINDOW_TOAST = `Betting opens ${RACE_BET_WINDOW_MINUTES} minutes before the race starts.`;

// combinedOdds = 1 / Σ(1/oddsᵢ)   e.g. 38 & 2.72 → 2.54. Same formula for
// back and lay. Rounded to 2 dp; suppressed (null) below 1.01.
export function calcCombinedOdds(oddsList) {
  if (!Array.isArray(oddsList) || oddsList.length < 2) return null;
  let sum = 0;
  for (const o of oddsList) {
    const n = Number(o);
    if (!Number.isFinite(n) || n <= 0) return null;
    sum += 1 / n;
  }
  if (!(sum > 0)) return null;
  const combined = Math.round((1 / sum) * 100) / 100;
  return combined >= 1.01 ? combined : null;
}

// Dutching split: stakeᵢ = total × (1/oddsᵢ) / Σ(1/oddsⱼ) — proportional to
// implied probability, so stakeᵢ×oddsᵢ is equal on every leg. Each part is
// rounded to 2 dp and the rounding remainder goes to the LARGEST leg, so the
// parts always sum to EXACTLY the typed total.
export function splitCombinedStake(total, oddsList) {
  const t = Number(total);
  if (!Number.isFinite(t) || t <= 0 || !Array.isArray(oddsList) || oddsList.length < 2) return null;
  const inv = oddsList.map((o) => 1 / Number(o));
  if (inv.some((v) => !Number.isFinite(v) || v <= 0)) return null;
  const sum = inv.reduce((a, b) => a + b, 0);
  const parts = inv.map((v) => Math.round((t * v / sum) * 100) / 100);
  const partsSum = parts.reduce((a, b) => a + b, 0);
  const remainder = Math.round((t - partsSum) * 100) / 100;
  if (remainder !== 0) {
    let iMax = 0;
    parts.forEach((p, i) => { if (p > parts[iMax]) iMax = i; });
    parts[iMax] = Math.round((parts[iMax] + remainder) * 100) / 100;
  }
  return parts;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// The feed sends stime as an IST wall-clock string with NO zone marker
// ("7/22/2026 1:44:00 AM"). new Date(stime) resolves it in the VIEWER's
// timezone — correct only for users in India. Parse the parts explicitly
// as IST so the countdown and the betting window are right everywhere.
export function parseFeedIstTime(stime) {
  if (!stime || typeof stime !== 'string') return null;
  const m = stime.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) {
    const d = new Date(stime);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  }
  const [, mo, day, yr, hh, mi, ss, ap] = m;
  let h = Number(hh);
  if (ap) {
    const up = ap.toUpperCase();
    if (up === 'PM' && h !== 12) h += 12;
    if (up === 'AM' && h === 12) h = 0;
  }
  return Date.UTC(Number(yr), Number(mo) - 1, Number(day), h, Number(mi), Number(ss || 0)) - IST_OFFSET_MS;
}

// "7/22/2026 2:21:00 AM" → "22/07/2026 02:21:00" — reformats the IST parts
// WITHOUT conversion, so every viewer sees the racecard time.
export function formatFeedIstTime(stime) {
  const ms = parseFeedIstTime(stime);
  if (ms == null) return String(stime || '');
  const d = new Date(ms + IST_OFFSET_MS); // UTC getters now read IST wall-clock
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

// "7/26/2026 5:28:00 PM" → "17:28" — the racecard clock shown on the home
// board's time chips. Same no-conversion rule as formatFeedIstTime: every
// viewer sees the feed's IST wall-clock, not their own timezone.
export function formatFeedIstClock(stime) {
  const ms = parseFeedIstTime(stime);
  if (ms == null) return '';
  const d = new Date(ms + IST_OFFSET_MS); // UTC getters now read IST wall-clock
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

export function minutesUntilRaceStart(stime) {
  const ms = parseFeedIstTime(stime);
  return ms == null ? null : (ms - Date.now()) / 60000;
}

// A horse race accepts bets only in the final N minutes before the off.
// Unreadable start time → open (fail open); the server is authoritative.
export function isRaceBettingOpen(stime, windowMinutes = RACE_BET_WINDOW_MINUTES) {
  const m = minutesUntilRaceStart(stime);
  return m == null ? true : m <= windowMinutes;
}
