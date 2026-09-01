# Task Report — Sports Bet Logic Audit & Fixes (2026-07-15)

> Is din ke saare changes ka record: **pehle kaisa tha → ab kaisa hai**, kis rule/finding
> ki wajah se badla, aur kaise verify hua. Frontend + backend dono.

---

## A. Frontend Changes

### A1. Scorecard — khali box render hona band
**File:** `src/components/gamedetails/Scorecard.jsx`

| | |
|---|---|
| **Pehle** | Backend se `score_url` milte hi banner (`.banner.scorestats`) render ho jata tha. Scorecard host (`scorecard.avrkhub.in`) tennis/football ke liye response hi nahi deta (connection accept karke hang — 9 gmids pe live test kiya), to user ko sirf background image ka **khali dark-blue box** dikhta tha. |
| **Ab** | Banner `display:none` rehta hai jab tak iframe ka `onLoad` fire na ho. Host respond kare to box dikh jata hai; hang ho to kuch render nahi hota. Provider kal serve karne lage to bina code-change ke khud theek. |
| **Kyu** | Live curl test: `etid=2/1` → 0 bytes timeout; `etid=4` (cricket) → 200 + HTML. `score_url` har match ke liye aata hai, to URL presence koi signal nahi. |
| **Verify** | esbuild compile pass; iframe DOM me rehta hai (hidden iframes bhi load karte hain). |

### A2. Max-stake validation = display wali chain (Audit K6)
**File:** `src/components/betting/placeBet/usePlaceBetPanel.js`

| | |
|---|---|
| **Pehle** | Validation: `bv.max_stake \|\| section.max \|\| market.max` — `maxb` ignore. Header display: `maxb > 0 ? maxb : max`. Live feed me MATCH_ODDS ka `max=2000, maxb=100000` tha → **user ko "Max: 100K" dikhta, par 2000 se upar bet reject ho jati.** |
| **Ab** | `rawMax = maxb > 0 ? maxb : (max_stake \|\| section.max \|\| market.max)` — display, frontend validation aur backend validation teeno ek hi chain pe. |
| **Kyu** | K6: "display aur validation must read the SAME resolution chain, maxb wins". |
| **Verify** | Saare market blocks (`Market1/2/4`, `Fancy`, `Line`, `OddEven`, Virtual) pehle se `maxb` pass karte hain — ek hi jagah fix laga. Vite build pass. |

### A3. Buffer time — admin config se (Audit R4)
**Files:** `src/components/betting/placeBet/bufferTime.js` (naya), `usePlaceBetPanel.js`

| | |
|---|---|
| **Pehle** | Buffer hardcoded env se: `BET_BUFFER_SECONDS` (10s) / `FANCY_BUFFER_SECONDS` (3s). Server pe `GET /api/user/buffer-time` (admin-configurable) endpoint tha **par frontend use hi nahi karta tha** — admin setting ka koi asar nahi. |
| **Ab** | Submit pe (non-fancy) admin value fetch hoti hai (60s cache). Value > 0 → wahi buffer; 0/fail → env default. Fancy apna chhota env buffer rakhta hai. |
| **Kyu** | R4: "Buffer seconds come from platform config (`buffer_time`)". |
| **Verify** | Vite build pass. Deployed pe `curl /api/user/buffer-time` test pending (DB me value set honi chahiye — backend Req 3). |

### A4. Market-level suspension buffer me bhi (Audit K9 / R4)
**File:** `src/components/betting/placeBet/placeBetLiveChecks.js`

| | |
|---|---|
| **Pehle** | Buffer monitoring (har 500ms) aur final check **sirf section-level** `gstatus/status` dekhte the. Market-level `status='SUSPENDED'` mid-buffer aa jaye (sections abhi ACTIVE dikhein) to bet nikal jati thi. |
| **Ab** | Non-`match1` markets pe market-level `status` bhi check hota hai — buffer ke har tick pe aur final check me. `match1` (bookmaker) ka section-only rule **preserve** hai (wahi reference behavior hai). |
| **Kyu** | R4: "`match1` suspension uses SECTION-level only; other gtypes ALSO honor market-level `status`". |
| **Verify** | Vite build pass; console log style same rakha (prod debugging). |

---

## B. Backend Changes (`server/`)

### B1. Scorecard URL probe
**File:** `services/CricketService.js`

| | |
|---|---|
| **Pehle** | `fetchScoreCard` upstream ka `scorecard_url` seedha frontend ko de deta tha — har match ke liye, chahe host us match ko serve hi na kare. |
| **Ab** | URL dene se pehle 4s-timeout GET probe (5 min in-process memoized). Host answer na kare → `score_url: null` → frontend kuch render nahi karta. |
| **Verify** | Node harness: tennis probe → false (4s), cricket → true (0.5s, 200 + 11KB). |

### B2. Min/Max stake validation (Requirement 2, P0)
**File:** `sportsbet/sportbetscontroller.js` — placeBet STEP 4.5 (naya) + `resolveMarketLimits` helper

| | |
|---|---|
| **Pehle** | Sirf `stake <= 0` check. Postman se ₹10 lakh ki bet 25K-limit market pe lag jati thi; ₹1 ki bet bhi. |
| **Ab** | Limits **live upstream feed se** (redis-cached `GetMatchPrivateData`) — client input pe bharosa nahi. Precedence: `maxb>0` → market `max` → section `max`; min: section → market. Feed fail → env caps (`MAX_STAKE_HARD_CAP`=500000, `MIN_STAKE_DEFAULT`=0) — betting band nahi hoti. Error text frontend toasts jaisa: `"Minimum/Maximum bet amount is X"`. |

### B3. Cancel-bet endpoint (Requirement 1, P0)
**Files:** `sportsbet/sportbetscontroller.js` (`cancelBet`), `sportsbet/routes.js` (`POST /cancel-bet`)

| | |
|---|---|
| **Pehle** | Cancel ka **koi endpoint hi nahi tha** — unmatched bet ka paisa settlement tak locked. |
| **Ab** | `POST /api/user/cancel-bet { bet_id }` (auth): ownership/unmatched/open guards → **soft cancel** (status='cancelled', kabhi delete nahi) → bachi hui open bets se exposure **replay/recompute** → wallet refund = worst-case liability ka drop → `bet_cancelled` ledger row → TotalExposure refresh. Sab ek transaction me. |
| **Critical design** | Blind exposure-clear NAHI — replay hi karta hai, warna usi market ki **matched** bets ka locked paisa galti se free ho jata (K15 wala bug). |
| **Verify** | 9-case math harness pass: matched(500@2.0)+unmatched(200@3.0) → cancel unmatched → refund exactly 200, matched exposure 500 बचा; single-bet cancel → rows zero + full refund; lay liability; 3-runner Draw. |

### B4. Matched/Unmatched listing (Requirement 4, P1)
**Files:** `controller/sports/cricket/cricketController.js`, `routes/user/gamesRoutes.js`

| | |
|---|---|
| **Pehle** | `user-open-bets` me `unmatched` pe koi filter nahi — unmatched bet bhi "Matched Bets" tab me dikh jati. Grouped endpoint tha hi nahi. |
| **Ab** | `user-open-bets` → sirf `unmatched=false/NULL`. Naya `GET /user/cricket/user-open-bets-grouped` → `{ matchedBets, unmatchedBets }`. |

### B5. `is_cashout` flag (Requirement 5, P2)
**Files:** `model/user/SportsBet.js`, placeBet create

| | |
|---|---|
| **Pehle** | Flag ka column nahi tha. |
| **Ab** | `is_cashout BOOLEAN DEFAULT false` — reporting-only; money logic me zero change. Boot pe `sequelize.sync({alter:true})` column bana dega. |

### B6. Shared helpers (hygiene)
`calculateRunnerExposure` placeBet ke andar se **module scope** pe (placeBet + cancelBet ek formula); `TOTAL_EXPOSURE_SQL` shared constant (STEP 10 + cancel me same query).

---

## C. Audit me sahi nikle (koi change nahi)

| Checkpoint | Status |
|---|---|
| K1 — manual-edit equality ACCEPT | ✅ Pehle se sahi (`> selected + EPS` / `< selected − EPS`) |
| K3 — odds tick ladder | ✅ `stepOdds` me exact bands (1–2:0.01 … 100–1000:10) |
| K7 — liability-vs-balance client check | ✅ Step 8 me maujood (lay = s(o−1), BM% = s·o/100) |
| R1 — bookie favour (live path) | ✅ Back: live≥selected accept; Lay: live≤selected accept; equality accept; finalOdds hi payload me jata hai |
| R6 formulas | ✅ MO s(o−1); BM `o≥10` pe percent (R5 ke conditional se consistent) |

## D. Baad me (usi din) IMPLEMENT ho gaya — user approval ke baad

### D1. Cashout engine ✅ (pehle flagged tha)
**Files:** `src/utils/cashoutUtil.js` (naya), `Market2Block.jsx`, `Market4Block.jsx`, `usePlaceBetPanel.js`, `betHelpers.js`

| | |
|---|---|
| **Pehle** | Cashout button hamesha-disabled placeholder tha. |
| **Ab** | Working reference (`D:\Developer\lords-exch-new` ka `cahoutUtil.js`) se verify karke pura engine: PRIMARY lay-higher / FALLBACK back-lower, percent detection (Tied always; Bookmaker odds≥10), safest-first sort, guards (no_position → already_balanced → no_odds → worsens → below_min/above_max) reference-exact toasts ke saath. Button tabhi enable hota hai jab us market pe position ho; click → panel pre-filled stake ke saath khulta hai; submit pe bookie-favour skip hota hai (stake COMPUTED odds pe bana tha), suspension/balance checks nahi skip hote. Payload me `is_cashout: true`. Selection name untrimmed `section.nat` se — runners array se byte-identical. |
| **Verify** | 24-case unit harness pass (spec ke dono worked examples included). **LIVE E2E production pe:** Ireland W +292 / WI −200 position → engine bola lay Ireland @ 3.1 stake 158.71 → place kiya → book exactly balanced (−41.29 / −41.29), ₹158.71 release (cash 6806 → 6964.71). |

### D2. Unmatched place + Cancel UI ✅ (pehle flagged tha)
**Files:** `usePlaceBetPanel.js`, `matchedBetsSlice.js`, `sportsService.js`, `GameDetails.jsx`

| | |
|---|---|
| **Pehle** | Manual odds edit → instant reject ("Unmatched bet not allowed"). Unmatched bets ki koi list/cancel UI nahi. |
| **Ab** | Reference behavior (lords-exch `BetSlip.js` se verified): **koi bhi** odds edit → bet UNMATCHED place hoti hai — `odds` = original clicked (exposure isi pe lock), `unmatched_odds` = requested price. Edit-then-revert = normal matched flow (K1 preserve). Unmatched pe buffer/bookie-favour skip (limit order), suspension + balance check rehte hain. Demo users purane instant accept/reject pe hain. Matched Bets tab me naya "Unmatched Bets" section — requested price + Cancel button; cancel pe backend refund, phir lists/balance/exposure sab refresh. `matchedBetsSlice` ab grouped endpoint (`user-open-bets-grouped`) use karta hai. |
| **Verify** | Vite build pass; backend cancel flow pehle hi live-tested (refund exact, matched exposure preserved). |

## E. Flagged / Pending

1. **Epsilon (K4)** — bookieFavour 0.001 pe hai; spec ka "0.01" karne se 1-tick ka against-move bhi accept ho jayega (odds ka smallest tick hi 0.01 hai). Sawal user ke paas.

- [ ] Backend deploy → `BACKEND_TESTING_GUIDE.md` ke 12 tests
- [ ] `buffer_time` DB me set/confirm
- [ ] Deployed pe live smoke test (usertwo)
