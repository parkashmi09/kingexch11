# Cashout Logic — Frontend + Backend (with worked examples)

> 2-runner hedge cashout. Concept, formula, numeric examples (decimal + percent),
> aur frontend/backend split — sab ek jagah.
>
> **Files**
> - Frontend engine: `src/utils/cashoutUtil.js` (pure math, no React/network)
> - Button + panel: `Market2Block.jsx` / `Market4Block.jsx` → `PlaceBetPanel`
> - Backend: `server/sportsbet/sportbetscontroller.js` → `placeBet` (`is_cashout`)

---

## 1. Concept (ek line me)

Aapki ek 2-runner market (Match Odds / Bookmaker / Tied) pe already position hai →
har runner ka ek **exposure** (P&L agar wo runner jeete). Cashout ek **opposite hedge
bet** compute karke dono runner ka exposure **barabar** kar deta hai → jo bhi jeete,
aapko **same guaranteed amount** milta hai. Match khatam hone se pehle profit/loss lock.

---

## 2. Formula (`buildMarketCashout`)

```
expA, expB   = dono runner ke current exposure (P&L if that runner wins)
diff         = |expA − expB|                  ← gap jo close karna hai
H            = higher-exposure runner  → PRIMARY: ise LAY karo
L            = lower-exposure runner   → FALLBACK: ise BACK karo

stake = diff ÷ divisor
  decimal odds (Match Odds):        divisor = O
  percent odds (Tied / Bookmaker):  divisor = (O/100) + 1

mult (exposure walk):
  decimal:  O − 1
  percent:  O / 100

BACK sel:  sel += stake×mult ,  other −= stake
LAY  sel:  sel −= stake×mult ,  other += stake
```

Engine dono candidates (PRIMARY lay + FALLBACK back) project karke jiska **worst-case
floor sabse zyada** ho (safest) use chunta hai, phir market **max limit** check karta hai.
**Min-stake check NAHI** — hedge stake computed hai, chosen nahi (99.02 bhi valid).

---

## 3. Example A — Match Odds (decimal) 🧮

**Setup:** England vs India. Aapne pehle **Back England @ 2.0, stake 100** lagayi.

| Outcome | England exposure | India exposure |
|---|---|---|
| England jeeta | `+100` (profit = 100×(2.0−1)) | — |
| India jeeta | — | `−100` (stake gaya) |

→ **expEngland = +100, expIndia = −100**

Ab cashout dabaya. Live **England lay = 1.82**.

**Step 1 — gap:**
```
diff = |(+100) − (−100)| = 200
H = England (+100)  → LAY England
```

**Step 2 — hedge stake:**
```
O = 1.82 (decimal) → divisor = 1.82
stake = 200 ÷ 1.82 = 109.89
```

**Step 3 — LAY England 109.89 @ 1.82 → naya exposure:**
```
England (sel):  100 − 109.89×(1.82−1) = 100 − 90.11 = +9.89
India  (other): −100 + 109.89          =            = +9.89
```

✅ **Dono +9.89** → jo bhi jeete, guaranteed **~9.89 profit** lock ho gaya.

**FALLBACK cross-check (Back India @ 2.2):**
```
stake = 200 ÷ 2.2 = 90.91
India:   −100 + 90.91×(2.2−1) = −100 + 109.09 = +9.09
England:  100 − 90.91                          = +9.09
```
Engine LAY(+9.89) vs BACK(+9.09) me se **bada floor (9.89)** chunta hai → LAY jeet gaya.

---

## 4. Example B — Bookmaker (percent) 🧮

**Setup:** Aapne **Back India @ 87 (bookmaker), stake 100** lagayi.
Bookmaker profit = `stake × O/100 = 100×87/100 = 87`.

→ **expIndia = +87, expEngland = −100**

Live **India lay = 89** (percent).

```
diff = |(+87) − (−100)| = 187
H = India (+87) → LAY India
divisor = (89/100) + 1 = 1.89
stake = 187 ÷ 1.89 = 98.94

LAY India 98.94 @ 89 (mult = 89/100 = 0.89):
  India (sel):   87 − 98.94×0.89 = 87 − 88.06 = −1.06
  England (other): −100 + 98.94              = −1.06
```

✅ **Dono ≈ −1.06** → cashout ne **~1.06 ka chhota loss lock** kiya (market spread ki
wajah se). Point: cashout hamesha profit nahi — **jo current market allow kare wahi**
guaranteed value lock karta hai (profit ya minimal loss).

> Farق sirf `divisor`/`mult` ka — percent markets `O/100` use karte hain, decimal `O−1`.
> `cashoutUtil.js` `isPercent()` (Tied always, Bookmaker/`match1`) se branch chunta hai
> taaki frontend ka computed stake wahi book banaye jo backend actually likhta hai.

---

## 5. Button enable — `marketHasCashoutPosition()`

Cashout button tabhi enabled:
1. **Eligible market:** Match Odds / Bookmaker / Tied, **ya** gtype `match` / `match1`
2. **Exactly 2 runners** (3-way markets jaise 1X2 excluded — 2-runner hedge nahi ban sakta)
3. **User ki open position** ho (kisi runner ka exposure ≠ 0)

Reject reasons (click pe toast): `already_balanced` ("not eligible"), `no_odds`
(suspended/odds gone), `worsens`, `above_max`.

---

## 6. Frontend ↔ Backend split

**FRONTEND — `cashoutUtil.js` → `computeCashoutClick`**
- Upar wala hedge compute → `PlaceBetPanel` **pre-filled** khulta hai:
  `is_cashout: true`, `cashoutStake`, side/team/odds set.
- Submit pe: **bookie-favour SKIP** (tiny tick se hedge na toote) + **₹100 min-floor SKIP**
  + computed odds pe place.

**BACKEND — `placeBet` (`sportbetscontroller.js`)**
- Cashout = **normal bet** for exposure (wahi runner-walk se book recompute).
- `is_cashout === true` →
  - **min-stake check skip** (`:865`) — hedge stake market-min se neeche ho sakta
  - bet row pe `is_cashout: true` store (`:2327`)
- Wallet delta → worst-case liability change → book balance.

---

## 7. Ek line me

> **Cashout = `diff ÷ odds` jitna hedge stake laga ke dono runner ka exposure barabar
> karna → guaranteed value lock.** Higher-exposure runner LAY (primary) ya lower BACK
> (fallback), safest wala. Frontend compute + pre-fill, backend normal bet ki tarah book
> (min-check skip, `is_cashout` mark). Percent markets `O/100`, decimal `O−1`.
