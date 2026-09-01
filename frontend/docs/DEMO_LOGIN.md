# Demo Login — Strategy & Implementation Tracker

> Living document — update this as demo-login work progresses.
> Last updated: 2026-07-10

## Goal

A full client-side "Demo" login: no backend token, static starting balance
(1500), balance/exposure maintained through a local statement ledger, working
sports placebet + casino placebet, and refresh-safe persistence.

---

## Current State (audit — 2026-07-10)

| Piece | Status | Where |
|---|---|---|
| `setDemoUser` (balance 1500, `demo-token`), `updateDemoBalanceAndExposure` | ✅ exists | `src/redux/userSlice.js` |
| Login page Demo button | ✅ wired | `src/pages/Login.jsx` (`handleDemoLogin`) |
| Sports placebet demo path (exposure delta + toast, no API) | ✅ exists | `src/components/betting/PlaceBetPanel.jsx` |
| `useExposure` skips API for demo | ✅ exists | `src/hooks/useExposure.js` |
| Header Demo button | ❌ does nothing | `src/components/layout/Header.jsx` (logged-out view) |
| Casino placebet demo path | ❌ missing — demo bet hits real API | `src/hooks/casino/useCasinoBet.js` |
| Persistence across refresh | ❌ redux-only, resets to 1500 | — |
| Demo statements / reports | ❌ report pages call real APIs → 401 | `src/pages/AccountStatement.jsx` etc. |
| 401 bounce bug: `demo-token` counts as `hadToken` → any 401 redirects to `/login` | ❌ must exempt | `src/apiservices/axiosClient.js` |
| `isDemoUser()` helper | ⚠ duplicated inside PlaceBetPanel — extract to shared util | `src/utils/` |

Reference implementation to port from: `old-code/d99-frontend/src/utils/demoUtils.js`
(`isDemoUser`, `calculateMarketLiability`, `calculateGlobalDemoExposure`,
`handleDemoBetSubmission`).

---

## Storage Decision: `localStorage` (NOT cookies)

- Cookies travel to the server on every request (pointless for pure
  client-side state, security surface) and cap at ~4KB — the bets array can
  easily reach 10–50KB.
- The app already keeps `token`/`user` in localStorage; same pattern.
- Single key **`demo_state`**, 24h TTL (`createdAt` check → stale state is
  re-seeded to a fresh 1500).

```js
// localStorage key: "demo_state"
{
  balance: 1421.5,
  exposure: 78.5,
  matchedBets: [ /* sports bets — needed for market-wise liability calc */ ],
  casinoBets:  [ /* { mid, gameType, nat, stake, odds, betType, date } */ ],
  statements:  [
    { date, credit: 1500, debit: null, closing: 1500, remark: 'Opening Balance' },
    { date, credit: null, debit: 100,  closing: 1400, remark: 'Teen20 bet' },
  ],
  createdAt: 1783690000000
}
```

---

## Implementation Plan (in order)

### 1. `src/utils/demoStore.js`  — ☑ DONE (2026-07-10)
- `loadDemoState()` / `saveDemoState(state)` / `clearDemoState()`.
- `seedDemoState()` → fresh `{ balance: 1500, exposure: 0, ... }` with an
  "Opening Balance" statement entry.
- `setDemoUser` reducer hydrates from localStorage when present (refresh-safe),
  otherwise seeds. Every demo mutation saves back. Logout → `clearDemoState()`.
- Also extract shared `isDemoUser(user)` here (or `src/utils/betHelpers.js`)
  and replace the copy inside PlaceBetPanel.

### 2. axios demo guard  — ☑ DONE (2026-07-10)
- `src/apiservices/axiosClient.js`: when `token === 'demo-token'`
  - don't attach the Authorization header;
  - exempt from the 401 → `/login` redirect (otherwise demo users get bounced
    the moment any private endpoint 401s).
- Header: skip `fetchBalanceThunk` + `subscribeToRealTimeUpdates` for demo
  (no socket, no balance overwrite).

### 3. Header Demo button  — ☑ DONE (2026-07-10, + demo drawer menu filtering)
- Wire logged-out header button: `dispatch(setDemoUser())` (same as Login
  page's `handleDemoLogin`), stay/navigate home.

### 4. `useCasinoBet` demo branch  — ☑ DONE (2026-07-10, + useCasinoMyBets demo read)
- Instead of `placeCasinoBet` API:
  - validate stake against demo balance;
  - liability: back = stake, lay = `(odds - 1) × stake`;
  - `dispatch(updateDemoBalanceAndExposure({ exposure: liability }))`;
  - push bet into `demo_state.casinoBets` + a debit statement entry;
  - success toast (same UX as real bet).
- `useCasinoMyBets`: in demo mode read bets for the current `mid` from
  `demo_state` so the "My Bet" sidebar shows them.

### 5. Report pages demo read  — ◐ partial (2026-07-10: AccountStatement done)
- On Submit, demo users render from `demo_state` instead of the API:
  - AccountStatement ← `statements` (date-range filtered);
  - CurrentBets ← open `matchedBets` + `casinoBets`.
- Other reports (ActivityLog, LiveCasinoBets, SportBookBets, FraudReport):
  empty + "No Record Found." is acceptable.

### 6. Phase 2 (optional) — settlement simulation  — ☐ not started
- MVP keeps demo bets open forever (exposure stays locked) — realistic enough.
- Later: watch casino round results (`last-results` poll already runs on game
  pages) and auto-settle demo bets — win credit / loss debit + statement
  entries + exposure release.

---

## Reference Behaviors (from live site, demo mode)

- **Mobile drawer (demo)** shows ONLY these menu items (rest are hidden):
  Account Statement, Current Bets, Casino Results, Set Button Value — plus
  Logout. Heading stays "Menu".
- **Drawer balance line (demo)**: `Balance: 1500 | Exposure: -100` —
  balance stays the static seed (1500); exposure accumulates as a NEGATIVE
  number (−liability). Balance is not reduced on bet placement.
- **PlaceBet split**: the real placebet flow stays untouched; the entry point
  checks `isDemoUser(user)` and routes to a separate `demoPlaceBet()` (sports)
  / `demoCasinoPlaceBet()` (casino) function instead.

## Architecture Rules

- ALL demo logic lives in `demoStore.js` (+ the shared `isDemoUser`).
  Components/hooks only branch: `if (isDemo) demoPath() else apiPath()`.
- Never let a demo flow reach axios. Guard at the hook level (placebet,
  mybets, reports), with the axios interceptor as the safety net.
- Balance/exposure math flows through `updateDemoBalanceAndExposure` only —
  one reducer, one place to debug.
- Sports liability math: reuse `calculateMarketLiability` /
  `calculateGlobalDemoExposure` port from old-code `demoUtils.js` (already
  partially in `src/utils/betHelpers.js`).

## Progress Log

- **2026-07-10** — Strategy finalized, this doc created. No implementation yet.
- **2026-07-10 (later)** — Core implemented (steps 1–4):
  - `src/utils/demoStore.js` — shared `isDemoUser`, localStorage `demo_state`
    (load/save/seed/clear, 24h TTL), `demoPlaceBet` (sports),
    `demoCasinoPlaceBet` (casino), read helpers for statements/bets.
  - `userSlice` — `setDemoUser` hydrates from store; boot-time rehydration on
    refresh (`_demoBoot`); `updateDemoBalanceAndExposure` now matches the
    reference (balance static, exposure accumulates NEGATIVE) and syncs
    localStorage; logout clears demo state.
  - `axiosClient` — never sends `demo-token` upstream; demo exempt from the
    401 → /login bounce.
  - Header — Demo button wired (`setDemoUser` + navigate home); balance
    fetch/socket skipped in demo; mobile drawer in demo shows only Account
    Statement / Current Bets / Casino Results / Set Button Value + Logout.
  - `PlaceBetPanel` — demo branch now routes through `demoPlaceBet()` (real
    flow untouched); local `isDemoUser` copy removed.
  - `useCasinoBet` — demo branch via `demoCasinoPlaceBet()` before the real
    API flow; `useCasinoMyBets` reads demo bets from the store (no API).
  - Demo login also fires the post-login welcome banner modal
    (`sessionStorage.showLoginPopup`) — both entry points (Login page +
    Header Demo button), same as a real login.
  - **Casino bets in demo: NOT supported** (reference behavior) — attempting
    a casino table bet in demo shows a danger toast **"Data Error1"** and
    places nothing (`useCasinoBet` demo branch). `demoCasinoPlaceBet` still
    exists in demoStore.js if this ever changes. Sports demo bets still work.
  - **AccountStatement (demo)**: Submit → 1s loader → always the same two
    static rows (reference): "Opening pts" (closing 0, dated 7 days ago
    midnight) + "User creation" (credit 1,500, dated demo createdAt). No API.
  - **`src/utils/fakeLoader.js`** — shared `FAKE_LOADER_MS` (1000) +
    `fakeLoaderDelay()`; used by useCasinoBet demo branch, CurrentBets initial
    loader, and AccountStatement demo submit. Use this for any future
    cosmetic-loader flows.
  - Pending: step 5 rest (CurrentBets demo read), step 6 (settlement sim).

