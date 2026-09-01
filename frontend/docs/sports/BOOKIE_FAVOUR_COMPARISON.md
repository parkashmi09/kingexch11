# Bookie-Favour / "Bet Not Allowed" — Ours vs Lords (Reference)

> Goal: humare bet-place mein bookie-favour (odds-change accept/reject) conditions
> lords-exch jaisa **perfectly** kaam karein. Ye doc dono ka logic ek jagah rakhta
> hai taaki ek-ek condition verify karke fix ki ja sake.
>
> **Status:** ✅ verified · ❗ mismatch/bug · ➖ minor diff
>
> **Files**
> - Ours: `src/components/betting/placeBet/usePlaceBetPanel.js` (submit pipeline),
>   `src/utils/bookieFavour.js` (rules), `placeBet/placeBetLiveChecks.js` (buffer),
>   `src/utils/betHelpers.js` (payload), `src/pages/GameDetails.jsx` (handleBetClick)
> - Lords: `cricketMobileDetails/index.js` (render) → `Market/index.js` (odds cells) →
>   **`components/bettingComponent/market/BetSlip.js` → `executeBet()`** (SAARA logic yahan),
>   `utils/realUserUtils.js` (payload), `apiservices/SportsApi.js` → `sportsPlaceBet`

---

## 0. TL;DR — Asli problem (✅ FIXED 2026-07-16)

**Lords ka manual-edit reject gate (`BetSlip.js:337-351`) SAB users pe chalta hai.
Humara same reject SIRF demo users pe tha — real user ka koi bhi edit bina reject ke
UNMATCHED place ho jaata tha.** Isliye "Unmatched bet not allowed." real users pe kabhi
nahi dikhta tha.

**✅ FIX APPLIED:** `usePlaceBetPanel.js` — manual-edit directional gate ab SAB users pe
chalta hai. Reject-direction (BACK edited>selected / LAY edited<selected) → toast
`Unmatched bet not allowed.` + return. Allow-direction → real user unmatched place, demo
normal flow. Naya toast `BET_TOAST.UNMATCHED_NOT_ALLOWED`.

Live-odds BACK/LAY accept/reject rule dono mein pehle se **same** hai — wo theek tha.

---

## 1. Lords ka flow (VERIFIED via source)

```
Odds cell click (Market/index.js:103)  →  suspended/blank? block at click
  → BetSlip khulti hai
  → Submit (BetSlip:1706) → handlePlaceBet → executeBet() (BetSlip:280-1379)
      1. Validation: virtual-block, stake<50, min/max range
      2. MANUAL-EDIT GATE (:337-351)  ← SAB users, buffer se PEHLE
      3. Buffer wait (platformConfig.buffer_time, per-sport×market, default 3s, else 0)
         → har 500ms live odds refetch (getLatestMarketData)
         → BACK/LAY favour compare (:519-547, EPS 0.001)
      4. Post-buffer: suspension / unfavourable → reject
         (ya buffer=0 → final re-check :901-1000, EPS 0.01)
      5. payload build (realUserUtils.prepareRealBetPayload) + unmatched fields
      6. sportsPlaceBet → POST /user/place
```

---

## 2. Condition-by-condition (ek-ek)

| # | Condition | Ours | Lords | Verdict |
|---|-----------|------|-------|---------|
| **C1** | Eligible markets (favour check) | `bookieFavour.js`: MATCH_ODDS/BOOKMAKER/BOOKMAKER2 only | bet **type** (back/lay) pe chalta hai, market-name pe nahi; buffer per-market-type se on/off hota hai | ➖ approach alag, outcome ~same (fancy = oddsLocked, skip) |
| **C2** | EPSILON | **0.001** har jagah | **0.001** buffer-monitor; **0.01** sirf no-buffer final check | ➖ minor (sirf buffer=0 pe farق) |
| **C3** | BACK live-odds rule | `live ≥ selected−EPS` accept @ live, warna reject | `current > original` accept @ current, `else` reject (compare tabhi jab `|Δ|>0.001`) | ✅ **same** |
| **C4** | LAY live-odds rule | `live ≤ selected+EPS` accept @ live, warna reject | `current < original` accept @ current, `else` reject | ✅ **same** |
| **C5** | **Manual edit BACK** | ✅ **ab SAB users**: `edited>selected` → REJECT `Unmatched bet not allowed.`; `edited<selected` → unmatched | `entered ≥ original` → REJECT; `entered < original` → unmatched | ✅ **FIXED** |
| **C6** | **Manual edit LAY** | ✅ **ab SAB users**: `edited<selected` → REJECT `Unmatched bet not allowed.`; `edited>selected` → unmatched | `entered ≤ original` → REJECT; `entered > original` → unmatched | ✅ **FIXED** |
| **C7** | Buffer source | GET /user/buffer-time (single number), env 10s, fancy 3s | Redux `platformConfig.buffer_time`, **nested per sport×market** (cricket/football/tennis × MATCH_ODDS/Bookmaker/others), default 3s / 0 | ➖ ours flat, lords granular |
| **C8** | Live odds refetch in buffer | yes, 500ms (`monitorOddsBuffer`) | yes, 500ms (`getLatestMarketData`) | ✅ same |
| **C9** | Cashout skips favour | yes (`isCashout` → skip) | yes (`is_cashout` → skip score/status/change checks) | ✅ same |
| **C10** | selectedOdds source | `parseFloat(originalOdds) \|\| oddsNum`; `originalOdds` = clicked odds, sync on betValue change (line 119-124) | `originalOdds` state = clicked odds | ✅ ok (verified sync effect sahi hai) |
| **C11** | Reject toast text | fixed `Bet not confirm Odds change` (live), demo manual `Unmatched bet not allowed` | live: `Odds changed unfavorably...`; manual: `Unmatched bet not allowed.` | ➖ wording alag |
| **C12** | Suspension / odds-gone | buffer + final check → reject | buffer + final + per-status messages (ball running, suspended, etc.) | ➖ lords zyada granular messages |
| **C13** | Min stake | ₹100 floor (humne set kiya) | Rs.50 (`Minimum bet amount is Rs.50`) | ➖ business choice |
| **C14** | Confirm toggle | nahi | `isOn` → pehla submit confirm panel, doosra place karta hai | ➖ UX diff, favour se unrelated |
| **C15** | Cricket ODI/T20 rate cap | ✅ MATCH_ODDS odds>4.00 → REJECT `Bet Not Accept Rate Over 4.00 on Oneday and T20` (Test exempt). **Frontend (Step 1b+finalOdds) + Backend (STEP 4.6, format from live feed)** | operator rule | ✅ **ADDED 2026-07-16** (front+back) |

---

## 3. THE FIX (C5 + C6) — sabse zaroori

**Kahan:** `usePlaceBetPanel.js`, manual-edit branch (line ~365-435).

**Abhi (galat):**
```js
if (isEdited && isDemoUser(user)) {
  const preCheck = bookieFavourCheck({...});   // reject sirf demo
  if (!preCheck.accept) { bToastError(preCheck.reason); return; }
} else if (isEdited) {
  // REAL USER: seedha unmatched place — koi directional reject nahi ❌
  ...sportsPlaceBet(unmatched payload)...
}
```

**Lords jaisa (sahi):** directional gate SAB users pe chale. Reject-direction pe
`"Unmatched bet not allowed."`, allow-direction (BACK entered<original / LAY entered>original)
pe hi unmatched place ho.

```js
if (isEdited) {
  // Lords BetSlip.js:337-351 — applies to ALL users
  const gate = bookieFavourCheck({
    marketType: effectiveMarketType, betType: effectiveBetType,
    selectedOdds: selOdds, currentOdds: oddsNum,
    isManualEdit: true, editedOdds: oddsNum,
  });
  if (!gate.accept) {
    bToastError(BET_TOAST.UNMATCHED_NOT_ALLOWED); // 'Unmatched bet not allowed.'
    return;
  }
  if (isDemoUser(user)) {
    // accept → normal demo flow (fall through)
  } else {
    // accept → real user unmatched placement (existing code) + return
  }
}
```

**Direction recap (dono same, sirf scope badalna hai):**
- BACK: `edited > selected` → REJECT ; `edited < selected` → unmatched allow
- LAY:  `edited < selected` → REJECT ; `edited > selected` → unmatched allow

> Note: humara `isEdited` already `|edited−selected|>0.001` check karta hai, isliye
> edit-then-revert normal matched flow rehta hai (lords se behtar — wahan revert bhi
> reject ho sakta). Ye behavior rakhna hai.

**Naya toast constant** `betToastMessages.js`:
```js
UNMATCHED_NOT_ALLOWED: 'Unmatched bet not allowed.',
```

---

## 4. Optional aligns (baad mein, agar chahiye)

- **C2**: no-buffer path pe EPSILON 0.01 (lords) vs 0.001 (ours). Sirf tab matter karega
  jab buffer=0 ho. Chaho to `bookieFavour.js` mein live-path EPS ko 0.01 kar dein.
- **C7**: per-sport×market-type buffer resolution (lords). Bada change — abhi zaroorat nahi.
- **C11/C12**: reject toast wording lords-exact karni ho to `betToastMessages.js` update.

---

## 5. Payload diff (reference)

| Field | Ours | Lords |
|-------|------|-------|
| `odds` | original clicked (unmatched pe) | `originalOdds` (unmatched pe) — same |
| `unmatched` / `unmatched_odds` | yes / requested | yes / typed — same |
| `is_cashout` | payload mein bhejte hain ✨ | **payload mein NAHI** (sirf client bypass) |
| `requested_odds` | nahi | nahi |

> `is_cashout` ka humara backend use karta hai — wo humari extension hai, lords se
> intentionally alag. Isko mat hatao.
