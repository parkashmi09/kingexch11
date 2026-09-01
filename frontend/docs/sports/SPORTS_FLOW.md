# Sports — Overall Flow (End to End)

> Sports betting ka pura flow ek jagah: data kahan se aata hai, page kaise banta hai,
> bet kaise lagti hai (frontend pipeline + backend steps), paisa/exposure kaise chalta
> hai, aur settlement tak kya hota hai. Last updated: **2026-07-15**.

---

## 1. High-Level Picture

```
Upstream feed (AVRKHUB)          Backend (server/)                Frontend (frontend/)
─────────────────────          ─────────────────────            ─────────────────────
highlighthomePrivate  ──────▶  /user/cricket/all-data  ───────▶  Home / sport lists
treedata              ──────▶  /user/all/sports/tree   ───────▶  Sidebar tree
gamedataPrivate       ──────▶  /user/cricket/get-match-────────▶  GameDetails markets
                               private-data (2s redis cache)      (useMatchData, 1s poll)
scorecard             ──────▶  /user/cricket/score-card ──────▶  Scorecard iframe
                               (+ URL probe)                      (onLoad-gated banner)
                               /user/place  ◀──────────────────  Bet submit pipeline
                               /user/cancel-bet (naya)
                               /user/buffer-time ──────────────▶  Buffer seconds
                               /user/matchexposures/match ─────▶  Runner books (5s poll)
                               /user/cricket/user-open-bets ───▶  Matched Bets tab (5s poll)
                               /user/cricket/user-open-bets-grouped (naya)
Settlement crons (pm2): results cron → settlement worker → wallet/ledger
```

---

## 2. Data Layer

### 2.1 Endpoints (frontend jo use karta hai)
| Endpoint | Kya deta hai | Kaun call karta hai |
|---|---|---|
| `POST /user/cricket/all-data` `{id: sid}` | Sport ke saare matches (t1 array: gmid, ename, stime, iplay, tv, MATCH_ODDS snapshot) | Home board, sport list pages |
| `POST /user/cricket/get-match-private-data` `{gmid, sid}` | Ek match ke SAARE markets (mid, mname, gtype, status, min/max/maxb, section[] with sid/nat/gstatus/odds[]) | `useMatchData` — GameDetails ka engine |
| `POST /user/cricket/score-card` `{gmid, sid}` | `{score_url}` — ab probe ke baad hi (hang → null) | `Scorecard.jsx` (football/tennis) |
| `GET /user/buffer-time` | Admin ka `buffer_time` (Owner.platform_configurations) | `bufferTime.js` (submit pe, 60s cache) |
| `POST /user/place` | Bet placement (niche section 5) | `sportsService.sportsPlaceBet` |
| `POST /user/cancel-bet` | Unmatched bet cancel (niche 5.4) | (UI pending — abhi curl/future) |
| `POST /user/matchexposures/match` | Per-runner exposure rows | GameDetails + PlaceBetPanel (5s poll + `bet:placed` event) |
| `GET /user/cricket/user-open-bets` | Matched bets (unmatched excluded) | matchedBetsSlice (5s poll) |
| `GET /user/cricket/user-open-bets-grouped` | `{matchedBets, unmatchedBets}` | (future unmatched UI) |

### 2.2 Feed quirks (dhyan rakhna)
- **`iplay` bharosemand NAHI** (tennis/football) — 9 ghante door wale match bhi `iplay:true`. "Match live?" ke liye **`stime <= now`** hi use karo.
- **`score_url` har match ke liye aata hai** — URL presence ≠ scorecard available. Scorecard host tennis/football pe **hang** karta hai (2026-07-15 se) — isliye backend probe + frontend onLoad gate.
- **`get-sport-data-by-id` upstream dead hai** — `get-match-private-data` hi use hota hai.
- Market data me `max` chhota / `maxb` bada ho sakta hai (MATCH_ODDS: max 2000, maxb 100000) — **effective limit = maxb**.

---

## 3. GameDetails Page (`/gamedetails/:sid/:gmid`)

**File:** `src/pages/GameDetails.jsx` + `src/hooks/useMatchData.js`

1. `useMatchData(gmid, sid)` — private-data ko ~1s pe poll karta hai → `markets[]`; match meta (ename, stime, tv) all-data se (~30s refresh). Private-data 404/500 → "no markets" toast + home redirect.
2. **Scorecard gating:** `matchStarted = stime <= now` (iplay nahi!). Cricket (sid 4) → fixed iframe hamesha; football/tennis (sid 1/2) → score-card API + `started` + iframe `onLoad` ke baad hi banner. Eye icon sirf football/tennis + `tv:true` + started.
3. **TV:** `matchData.tv === true` pe hi icon; eye/TV mutually exclusive.
4. **Market filter checkboxes** — fancy2 group "Line Market" ek entry.
5. **Exposure mapping** — `matchexposures` rows → `${mid}:${runnerName}` keys (strict; name-only fallback se leak hota tha). Row apna market dhundhti hai: exact mid → game_type=mname → market family.
6. Demo user ka pura flow client-side hai (demoStore) — real API untouched.

### Market blocks (gtype → component)
| gtype/mname | Block | CSS class |
|---|---|---|
| `match` (MATCH_ODDS, Game Winner…) | `Market2Block` (2-col back/lay) / `Market4Block` (6-col) | `market-2` / `market-4` |
| `match1` (Bookmaker, BM …) | `Market1Block` | `market-1` |
| `fancy`, `normal`, session | `FancyBlock` | `market-6` |
| `fancy2` (Line) | `LineMarketBlock` (grouped) | `market-11` |
| `oddeven` | `OddEvenBlock` | — |
| `cricketcasino` | `CricketCasinoBlock` | — |

Har block odds-cell click pe `betValue` object banata hai: `{team, betType, odds, market_id: mid, selectionId: sid, marketType, mname, gtype, min_stake, max_stake, maxb, size, runners, market, section...}` → `GameDetails.handleBetClick` isme event-level fields (event_id=gmid, ename, stime, sid, game_type) merge karke `activeBet` set karta hai → `PlaceBetPanel` khulta hai.

---

## 4. Bet Placement — Frontend Pipeline

**Files:** `src/components/betting/PlaceBetPanel.jsx` (sirf presentation) +
`placeBet/usePlaceBetPanel.js` (pura logic) + `placeBet/placeBetRules.js` (pure rules) +
`placeBet/placeBetLiveChecks.js` (live checks) + `utils/bookieFavour.js` + `utils/betHelpers.js`

**Submit pipeline (order fixed hai):**

```
0. Anti-spam        → 4 attempts/market/60s; 5th = "Multiple Bet Not Allowed..."
1. Validation       → stake khali/absurd(1e12/1e16)/min/max/suspended
                      min = max(₹100, market/section min) → toast "Check Minimum Bet Limit."
                      max = maxb>0 ? maxb : (section.max || market.max) → "Check Maximum Bet Limit2."
1b. Rate cap        → CRICKET (sid 4) ODI/T20 MATCH_ODDS only: odds > 4.00 → REJECT
                      toast "Bet Not Accept Rate Over 4.00 on Oneday and T20". Test exempt.
                      (isCricketLimitedOvers/isOverRateBlocked; entered + final-odds dono pe)
2. Manual-edit      → user ne odds +/- kiye (|Δ|>0.001)? NO unmatched concept —
                      koi bhi edit → REJECT "Unmatched bet not allowed." (bet sirf
                      live market odds pe). edit-then-revert (|Δ|≤0.001) = normal flow.
3. Buffer monitor   → seconds: admin /user/buffer-time (>0) warna env (10s); fancy env 3s
                      har 500ms: section gstatus + market status (non-match1) +
                      odds gone → reject; live odds/size track (finalOdds)
4. Final suspension → market status (non-match1) + section gstatus
5. Fancy drift      → slip odds ±0.01 me live tiers me ho, warna "Odds changed"
6. Bookie favour    → (MATCH_ODDS/BOOKMAKER only, epsilon 0.001)
                      BACK: live ≥ selected → ACCEPT @ live | else REJECT
                      LAY:  live ≤ selected → ACCEPT @ live | else REJECT
                      reject toast: "Bet not confirm Odds change" | cashout skip
                      (finalOdds pe rate-cap re-check — buffer-rise BACK 4.00 cross)
7. Demo user        → local placement (balance/exposure client-side)
8. Real user        → liability ≤ balance check → prepareBetPayload → POST /user/place
                      success: panel close → toast → redux book update → balance refetch
                      → 'bet:placed' event (exposure refetch)
```

**Cricket ODI/T20 rate cap (`placeBetRules.js`):** operator rule "Bet Not Accept
Rate Over 4.00 on Oneday and T20". `isCricketLimitedOvers({sid,cname,ename})` = cricket
(sid 4) AND format NOT Test (`/test|ashes|first-class|county champ|sheffield shield|ranji|plunket/i`).
`isOverRateBlocked` = limitedOvers AND MATCH_ODDS family AND odds > 4.00. Flag `limited_overs`
GameDetails.handleBetClick se betValue me aata hai. BACK+LAY dono pe. **Backend bhi enforce
karta hai** (STEP 4.6, `sportbetscontroller.js`): format LIVE FEED se (getSportDataById→cname),
client flag trust NAHI — sirf tab feed-call jab bet cap-cross kar rahi ho.

**Odds tick ladder** (`stepOdds`): 1–2:0.01 | 2–3:0.02 | 3–4:0.05 | 4–6:0.1 | 6–10:0.2 | 10–20:0.5 | 20–30:1 | 30–50:2 | 50–100:5 | 100–1000:10

**P&L formulas** (`calculateSingleBetPLValue`):
- MATCH_ODDS: profit `s(o−1)`, lay liability `s(o−1)`
- BOOKMAKER `o≥10`: percent — profit `s·o/100`
- FANCY/TIED: profit `s·o/100`, loss `s`

**Toast texts** — `utils/betToastMessages.js` me centralized, reference-exact wording.

---

## 5. Bet Placement — Backend (`POST /api/user/place`)

**File:** `server/sportsbet/sportbetscontroller.js` → `placeBet`

```
1-3. Locks         → hierarchy bet-lock, user bet-lock, platform lock, sports lock
4.   External API  → turnkeyxgaming post-market (non-blocking, 2s timeout)
4.5  Min/Max ✨    → limits LIVE FEED se (resolveMarketLimits, redis-cached):
                     max = maxb>0 → market.max → section.max; min = section → market
                     feed fail → env caps (MAX_STAKE_HARD_CAP=500000)
4.6  Rate cap ✨   → cricket(sid 4) ODI/T20 MATCH_ODDS + odds>4.00 → reject
                     "Bet Not Accept Rate Over 4.00 on Oneday and T20". Format LIVE
                     FEED se (getSportDataById→cname), Test exempt. Client flag trust NAHI.
5.   Exposure calc → market_type ke hisab se branch:
                     marketsforfancy → fancy walk (lay/back bhav)
                     MO → calculateRunnerExposure (module-scope, shared)
                     BM → normalizeOdds() then runner walk
                     nonfancy list / BM-fancy / big-runners → apne walks
6.   Wallet delta  → worst-case liability ka increase deduct / decrease release
7.   SportsBet row → status='open', unmatched, unmatched_odds, is_cashout ✨, runners JSON
8.   walletUpdate  → cash +/- , DebitLedger + CreditsLedger (bet_placed / exposure_release)
9-10. TotalExposure→ TOTAL_EXPOSURE_SQL (grouped worst-case + additive independents)
Resp: { success, exposure{match:{teams}}, newBalance, totalExposure }
```

### 5.4 Cancel (naya) — `POST /api/user/cancel-bet {bet_id}`
Guards: apni bet + `unmatched=true` + `status='open'` + MO/BM family. Phir:
soft-cancel (kabhi delete nahi) → us market ki **bachi hui open bets replay** karke
exposure recompute (blind clear NAHI — warna matched bets ka paisa bhi free ho jata) →
refund = worst-case liability drop → `bet_cancelled` ledger → TotalExposure refresh.

### Unmatched — REMOVED (2026-07-16)
- **Unmatched / limit-order concept khatam.** Koi bhi manual odds edit → seedha
  REJECT `"Unmatched bet not allowed."` (usePlaceBetPanel Step 2). Bet SIRF live
  market odds pe lagti hai. Edit-then-revert (|Δ|≤0.001) = normal matched flow.
- UI: GameDetails ka "Unmatched Bets" section + Cancel button + `UnmatchedBetsTable`
  hata diye. `unmatchedBets` selector/`handleCancelUnmatched` bhi removed.
- Redux `matchedBetsSlice` mein `unmatchedBets` field abhi hai (grouped endpoint se
  populate hota hai) par kahin render nahi hota — harmless. Backend cancel-bet
  endpoint bhi hai par UI se koi unmatched bet ab banti hi nahi.

### Cashout (LIVE — 2026-07-15 se)
- Engine: `src/utils/cashoutUtil.js` — 2-runner Match Odds/Tied/Bookmaker pe
  PRIMARY lay-higher / FALLBACK back-lower, percent rule (Tied always, BM ≥10),
  safest-first candidate sort, guards + toasts (reference-exact).
- Button (Market2Block/Market4Block) position hone par hi enable; click → panel
  computed stake ke saath khulta hai; submit pe bookie-favour skip (baaki checks
  normal); payload `is_cashout: true` (backend reporting column).
- Live E2E verified: +292/−200 book → lay 158.71 @ 3.1 → −41.29/−41.29 balanced.

---

## 6. Exposure / Book Display

- **Source of truth:** `user_exposures` table — (user_id, match_id=mid, game_type=market_type, team_name) → exposure_amount.
- Frontend `matchexposures` 5s poll + har `bet:placed` pe instant refetch.
- GameDetails me mapping strict `${mid}:${runner}` keys se — MATCH_ODDS/BOOKMAKER family
  cross-match sirf jab exact mid na mile.
- PlaceBetPanel typing ke waqt live preview: existing exposure + pending bet ka delta
  (`calculateRunnerPL`).
- Header balance/exposure: place ke response se instant + `fetchBalanceThunk`.

---

## 7. Settlement (pm2 workers — `backend.config.cjs`)

1. **results cron** (`sportsbet/betresult/newjobv2.js`) — AVRKHUB result API se khatam matches ke results per-market queue karta hai.
2. **settlement worker** (`settlementv2.js`) — queued results ke against `SportsBet` rows settle: winner calc (MO runner / fancy line / BM), wallet credit/debit, ledger, exposure clear, `result_status` update.
3. Cancelled bets (`status='cancelled'`) settlement me count NAHI hoti.
4. Manual settle tools `mannualSettle/` me.

---

## 8. Config Knobs

| Knob | Kahan | Default | Kya karta hai |
|---|---|---|---|
| `buffer_time` | Owner.platform_configurations (admin) | 0 | Match-odds bet buffer (frontend ab ise use karta hai) |
| `VITE_BET_BUFFER_SECONDS` | frontend env | 10 | Fallback buffer |
| `VITE_FANCY_BUFFER_SECONDS` | frontend env | 3 | Fancy buffer |
| `MAX_STAKE_HARD_CAP` | server env | 500000 | Feed-fail fallback max |
| `MIN_STAKE_DEFAULT` | server env | 0 | Feed-fail fallback min |
| `SPORTS_API_VERSION` | server env | v2 | AVRKHUB (v2) vs old Diamond (v1) |

---

## 9. Known Open Items

- [ ] Backend deploy pending → `BACKEND_TESTING_GUIDE.md` ke 12 tests chalane hain
- [ ] `buffer_time` DB me set karna hai
- [ ] Unmatched betting UI (cancel button, unmatched list) — approval ke baad
- [ ] Cashout engine (R5) — abhi button disabled placeholder hai, engine banana pending
- [ ] Epsilon decision (K4): bookieFavour 0.001 vs spec 0.01 — 0.01 pe 1-tick against-move
      accept ho jayega, isliye 0.001 rakha hai; final call user ka

**Related docs:** `TASK_REPORT_2026-07-15.md` (isi folder me), repo-root
`BACKEND_BET_LOGIC_REQUIREMENTS.md`, `BACKEND_TESTING_GUIDE.md`,
`src/utils/BOOKIE_FAVOUR_DOCS.md`
