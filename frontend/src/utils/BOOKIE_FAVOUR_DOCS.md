# Bookie Favour — Odds Validation System

**File:** `src/utils/bookieFavour.js`
**Integrated in:** `src/components/betting/PlaceBetPanel.jsx`

---

## Scope

Applies **ONLY** to:
- `MATCH_ODDS`
- `BOOKMAKER` / `BOOKMAKER2`

All other markets (Fancy, Normal, Tied Match, etc.) skip this validation entirely.

---

## Terminology

| Term | Description |
|------|-------------|
| `selectedOdds` | Odds when user clicked the cell on the market table |
| `originalOdds` | Same as selectedOdds — stored at click time |
| `liveOdds` | Latest odds fetched from API after buffer timer completes |
| `editedOdds` | Odds value after user manually changed it via +/- buttons |
| `isManualEdit` | Boolean — true if user used +/- buttons to change odds |
| `bufferSeconds` | Monitoring period (currently 10s for testing) before placing bet |

---

## Flow Diagram

```
User clicks odds cell
        │
        ▼
┌─────────────────────────┐
│  Is manually edited?    │
│  (used +/- buttons)     │
└─────────┬───────────────┘
          │
    ┌─────┴─────┐
    │           │
   YES          NO
    │           │
    ▼           ▼
┌─────────┐  ┌──────────────────────┐
│ Check   │  │ Start buffer timer   │
│ instant │  │ (10s monitoring)     │
│         │  │ Log every 500ms      │
└────┬────┘  └──────────┬───────────┘
     │                  │
     ▼                  ▼
┌──────────────┐  ┌──────────────────┐
│ Unmatched?   │  │ Buffer complete  │
│ BACK: +edit  │  │ Run bookie       │
│ LAY: -edit   │  │ favour check     │
└──┬───────┬───┘  └──┬───────┬───────┘
   │       │         │       │
 REJECT  ACCEPT    REJECT  ACCEPT
 (instant)(buffer)  (toast) (place bet)
```

---

## Rules — Live Odds (No Manual Edit)

After buffer timer completes, compare `selectedOdds` vs `liveOdds`:

### BACK Bets

| Scenario | Example | Result | Reason |
|----------|---------|--------|--------|
| Odds go UP | 1.38 → 1.40 | ✅ Accept | Better payout for user |
| Odds stay SAME | 1.38 → 1.38 | ✅ Accept | No change |
| Odds go DOWN | 1.38 → 1.37 | ❌ Reject | Worse deal for user |

**Rule:** `liveOdds >= selectedOdds` → Accept

### LAY Bets

| Scenario | Example | Result | Reason |
|----------|---------|--------|--------|
| Odds go DOWN | 1.36 → 1.34 | ✅ Accept | Less liability for user |
| Odds stay SAME | 1.36 → 1.36 | ✅ Accept | No change |
| Odds go UP | 1.36 → 1.40 | ❌ Reject | More liability for user |

**Rule:** `liveOdds <= selectedOdds` → Accept

---

## Rules — Manual Edit (+/- Buttons)

When user manually edits odds, the check is **INSTANT** (no buffer) if the edit is unfavourable (unmatched). If the edit is in our favour, the buffer timer still runs.

### BACK Manual Edit

| Edit Direction | Example | Result | Timing |
|---------------|---------|--------|--------|
| Increased (+) | 1.38 → 1.40 | ❌ Reject | **Instant** — "Unmatched bet not allowed" |
| Decreased (-) | 1.38 → 1.30 | ✅ Accept | **After buffer** — user accepts lower odds |

**Rule:**
- `editedOdds > selectedOdds` → Instant reject (unmatched)
- `editedOdds <= selectedOdds` → Run buffer, then place bet

### LAY Manual Edit

| Edit Direction | Example | Result | Timing |
|---------------|---------|--------|--------|
| Increased (+) | 1.35 → 1.37 | ✅ Accept | **After buffer** — user accepts more liability |
| Decreased (-) | 1.35 → 1.34 | ❌ Reject | **Instant** — "Unmatched bet not allowed" |

**Rule:**
- `editedOdds < selectedOdds` → Instant reject (unmatched)
- `editedOdds >= selectedOdds` → Run buffer, then place bet

---

## Buffer Timer Behaviour

| Condition | Buffer runs? | Decision point |
|-----------|-------------|----------------|
| No manual edit | ✅ Yes | After buffer completes |
| Manual edit — unmatched direction | ❌ No | Instant reject before buffer |
| Manual edit — favour direction | ✅ Yes | After buffer completes |
| Market SUSPENDED during buffer | Tracked | Reject after buffer if still suspended |
| Market resumes during buffer | Tracked | Accept if conditions met at end |

---

## Functions Reference

### `isBookieFavourMarket(marketType)`
Returns `true` for MATCH_ODDS, BOOKMAKER, BOOKMAKER2.

### `isBackOddsAcceptable(selectedOdds, currentOdds)`
Returns `true` if `currentOdds >= selectedOdds` (within epsilon tolerance).

### `isLayOddsAcceptable(selectedOdds, currentOdds)`
Returns `true` if `currentOdds <= selectedOdds` (within epsilon tolerance).

### `validateBackManualEdit(selectedOdds, editedOdds)`
Returns `{ accept: false, reason: 'Unmatched bet not allowed' }` if `editedOdds > selectedOdds`.

### `validateLayManualEdit(selectedOdds, editedOdds)`
Returns `{ accept: false, reason: 'Unmatched bet not allowed' }` if `editedOdds < selectedOdds`.

### `bookieFavourCheck({ marketType, betType, selectedOdds, currentOdds, isManualEdit, editedOdds })`
Main entry point. Routes to the correct validator based on bet type and manual edit status.

Returns: `{ accept: boolean, reason: string, finalOdds: number }`

---

## Console Logs

### Click
```
[PlaceBet] ⏱ Click → 7:30:15.234 | BACK Mumbai Indians | Odds: 1.38 | Stake: 100 | Size: 60847
```

### Buffer Monitoring (every 500ms)
```
[PlaceBet] 🔍 0.5s | Check #1 | Selected: 1.38 | Live: 1.38 ✓ | Size: 60850 | All: [1.36 1.37 1.38 | 1.39 1.40 1.41]
[PlaceBet] 🔍 1.0s | Check #2 | Selected: 1.38 | Live: 1.40 ✗ | Size: 61200 | All: [1.38 1.39 1.40 | 1.41 1.42 1.43]
```

### Bookie Favour Decision
```
[PlaceBet] ✅ Bookie Favour → ACCEPT | Type: BACK | Selected: 1.38 | Live: 1.40 | Manual: NO
[PlaceBet] 🚫 Bookie Favour → REJECT | Type: LAY | Selected: 1.36 | Live: 1.40 | Manual: NO | Reason: Odds rose from 1.36 to 1.4
[PlaceBet] 🚫 Bookie Favour → REJECT | Type: BACK | Selected: 1.38 | Edited: 1.40 | Manual: YES | Reason: Unmatched bet not allowed
```

### Placed
```
[PlaceBet] ✅ Placed → 7:30:25.456 | BACK Mumbai Indians | Odds: 1.38 → 1.40 | Stake: 100 | Size: 60900 | Delay: 10.22s
```

---

## Integration Notes

- All logic lives in `src/utils/bookieFavour.js` — pure functions, no side effects
- `src/components/betting/placeBet/usePlaceBetPanel.js` is the only consumer (the logic hook behind `PlaceBetPanel.jsx`)
- Buffer timer value is configurable (`bufferSeconds` constant in usePlaceBetPanel)
- Epsilon tolerance: 0.001 for floating point comparison
- The `originalOdds` state in usePlaceBetPanel tracks the odds at click time
- The `isUserModifiedOdds` state tracks if +/- buttons were used
