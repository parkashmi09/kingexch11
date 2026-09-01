# Sports Place Bet — Complete Guide (Layman Language Mein)

> Ye document naye developers ke liye hai. Isme betting exchange ka poora concept
> zero se samjhaya gaya hai — Back/Lay kya hota hai, calculation kaise hoti hai,
> Bookie Favour kya hai, aur hamare code ka pura place-bet pipeline step-by-step.
>
> **Code files jo is document se related hain:**
> - `src/components/betting/PlaceBetPanel.jsx` — sirf UI (panel dikhna)
> - `src/components/betting/placeBet/usePlaceBetPanel.js` — POORA logic (submit pipeline)
> - `src/components/betting/placeBet/placeBetRules.js` — pure rules (validation, tick ladder)
> - `src/components/betting/placeBet/placeBetLiveChecks.js` — live checks (buffer, suspension)
> - `src/components/betting/placeBet/betAttemptTracker.js` — anti-spam
> - `src/utils/bookieFavour.js` — odds movement ka accept/reject logic
> - `src/utils/betHelpers.js` — saari P&L calculations + API payload

---

## PART 1 — Betting Exchange Ki Basics (Bilkul Zero Se)

### 1.1 Normal bookie vs Exchange — farak kya hai?

**Purana tarika (bookie):** Tum bookie ke paas jaate ho, wo bolta hai "India
jeetega to main tumhe 1 rupaye pe 80 paise dunga". Tum sirf **jeetne pe** paisa
laga sakte ho. Bookie apna margin rakh ke odds deta hai.

**Exchange (jaise hamara platform / Betfair):** Yaha tum do tarah se khel sakte ho:
- Kisi team ke **JEETNE pe** paisa lagao → ise **BACK** kehte hain
- Kisi team ke **HAARNE pe** paisa lagao → ise **LAY** kehte hain

Lay karne ka matlab: **tum khud chhote bookie ban gaye**. Koi aur banda us team
ko back kar raha hai, aur tum uski bet accept kar rahe ho.

### 1.2 Odds kya hote hain?

Odds ek number hai jo batata hai jeetne pe kitna milega. Hamare platform pe
**decimal odds** hote hain (jaise 1.38, 2.5, 90).

**Simple formula:** `Total wapas milne wala paisa = Stake × Odds`

Example: 100 rupaye, odds 2.5 pe back kiya, team jeet gayi:
- Total wapas = 100 × 2.5 = **250**
- Isme se 100 tumhara apna stake tha, to **profit = 150**

Isliye har jagah profit ka formula: **`Profit = (Odds − 1) × Stake`**

Odds jitna chhota (1.10, 1.20), team utni strong favourite. Odds jitna bada
(5.0, 10.0), team utna underdog.

### 1.3 BACK bet — "Ye JEETEGA"

> "Mujhe lagta hai India jeetega, main India pe 1000 lagata hoon odds 1.80 pe."

| Result | Kya hoga |
|---|---|
| India **jeeta** | Profit = (1.80 − 1) × 1000 = **+800** |
| India **haara** | Loss = poora stake = **−1000** |

Back mein:
- **Jeete to:** `(odds − 1) × stake` milta hai
- **Haare to:** poora `stake` doob jaata hai
- **Risk (liability) = stake** — isse zyada kabhi nahi doob sakta

Back ke liye **ZYADA odds better hai**. 1.80 ki jagah 1.90 mil jaye to same
1000 pe profit 800 ki jagah 900 ho jayega.

### 1.4 LAY bet — "Ye NAHI jeetega"

> "Mujhe lagta hai India NAHI jeetega (haarega ya draw hoga — kuch bhi, bas
> jeete na). Main India ko 1000 pe lay karta hoon odds 1.80 pe."

Lay mein tum bookie ho. Saamne wala banda India back kar raha hai. Tum uski
bet accept kar rahe ho:

| Result | Kya hoga |
|---|---|
| India **NAHI jeeta** | Tumne uska stake jeet liya = **+1000** (profit = stake) |
| India **jeet gaya** | Tumhe use uska profit dena padega = (1.80 − 1) × 1000 = **−800** |

Lay mein:
- **Jeete to (yaani team haari):** `stake` milta hai
- **Haare to (team jeet gayi):** `(odds − 1) × stake` dena padta hai — ise **liability** kehte hain

Lay ke liye **KAM odds better hai**. 1.80 pe lay karne pe liability 800 hai;
agar 1.50 pe lay kar pao to liability sirf 500 — same jeetne ka paisa (1000).

**Yaad rakhne ka aasan tarika:**
- BACK = "hoga" pe paisa. Odds upar = achha.
- LAY = "nahi hoga" pe paisa. Odds neeche = achha.

### 1.5 Ek line mein Back/Lay ka riship

Jab tum kisi ko 1.80 pe BACK karte ho, koi aur usi ko 1.80 pe LAY kar raha
hai. Tumhara profit = uska loss, aur ulta. Exchange bas dono ko milata hai.

---

## PART 2 — Market Types (Hamare Platform Pe)

Har match mein alag-alag "markets" hote hain. Har market ka apna calculation
style hai. Code mein ye `marketType` / `gtype` se decide hota hai
(`placeBetRules.js` → `getMarketFamily`).

### 2.1 MATCH_ODDS (gtype: `match`)

Sabse normal market — kaun jeetega. Decimal odds (1.38, 2.5...). Back + Lay
dono side available. Odds **editable** hain (+/− buttons se, sirf isi market mein).

### 2.2 BOOKMAKER (gtype: `match1`)

Match odds jaisa hi, lekin odds **percentage style** mein bhi aa sakte hain.
Rule (`betHelpers.js` → `calculateSingleBetPLValue`):

- Odds **< 10** → normal decimal jaisa treat hota hai
- Odds **>= 10** → **percentage** treat hota hai: `Profit = (odds / 100) × stake`

Example: Bookmaker mein "JT XI" back kiya odds **90** pe, stake 1000:
- Jeete to profit = (90 / 100) × 1000 = **+900**
- Haare to loss = **−1000**

Yaani odds 90 ka matlab "90 paisa per rupaya" — bilkul desi bookie style.
Bookmaker mein odds **edit nahi kar sakte** (plain text dikhte hain, input nahi).

### 2.3 FANCY / Session (gtype: `fancy`, `normal`, `fancy1`, `khado`, `meter`, `oddeven`)

"6 over mein kitne run banenge?" type markets. Yaha do cheezein hoti hain:

- **Line/run value** (jaise "25 runs") — Yes/No isi pe hota hai
- **Rate** (jaise 100, 90, 110) — ye **percentage odds** hai

Buttons ka matlab:
- **YES (back side)** = "25 ya usse zyada banenge"
- **NO (lay side)** = "25 se kam banenge"

Calculation (`marketType === 'FANCY'`):
- **Profit = (stake × rate) / 100**
- **Loss = poora stake** (dono side ke liye)

Example: "6 over run = 25" pe **YES** lagaya, rate 90, stake 1000:
- 25+ bane → profit = (1000 × 90) / 100 = **+900**
- 24 ya kam → loss = **−1000**

Fancy mein odds **locked** hain — user edit nahi kar sakta
(`isOddsLockedByType`), aur bet ke waqt rate exact match hona zaroori hai
(Part 5 mein "fancy drift check" dekho).

### 2.4 TIED_MATCH

"Match tie hoga ya nahi" — Yes/No market, calculation fancy jaisi hi
(percentage). `calculateTiedMatchResults` back→yes, lay→no normalize karke
wahi formula lagata hai.

---

## PART 3 — Matched vs Unmatched Bet

### 3.1 Concept

Exchange pe har bet ko **match** hona padta hai — yaani saamne koi opposite
bet lagane wala chahiye.

- **Matched bet** = tumhari bet kisi se match ho gayi. Ab pakki hai, result ka
  wait karo.
- **Unmatched bet** = tumne aisa rate manga jo market mein abhi available nahi
  hai. Bet queue mein padi hai, koi us rate pe aaye to match hogi, warna expire.

### 3.2 Hamare platform ka rule: UNMATCHED ALLOWED NAHI HAI

Bahut important: **hamara system unmatched bets accept hi nahi karta.**
Tumhe wahi rate milega jo market de raha hai — ya usse better. Agar tum market
se better rate maangoge to bet turant **reject** ho jayegi, toast aayega:
**"Unmatched bet not allowed"**.

Iske pe pura logic hai — **Bookie Favour** (agla part).

---

## PART 4 — BOOKIE FAVOUR (Sabse Important Concept)

File: `src/utils/bookieFavour.js` — sirf **MATCH_ODDS aur BOOKMAKER** pe
lagta hai. Fancy/Normal is check ko skip karte hain.

### 4.1 Problem kya hai?

Live match mein odds har second badalte hain. Tumne cell pe click kiya jab
odds **1.38** the. Panel khula, tumne stake type kiya, submit dabaya — is
beech odds **1.35** ho gaye. Ab kya kare?

- Tumhe 1.38 de dein? → Platform (bookie) ka nuksan, kyunki market ab 1.35 hai
- Chupchap 1.35 pe laga dein? → Tumhare saath dhokha, tumne 1.38 dekh ke lagaya tha

Iska solution: **jo bhi movement ho, wo platform ke favour mein ho tabhi bet
lagegi — warna reject.** Isi ko "Bookie Favour" kehte hain. Practical result ye
hai ki **user ko kabhi worse rate silently nahi milta** — worse hua to reject,
better hua to better rate mil jaata hai.

### 4.2 Rules — Live odds badle (user ne kuch edit NAHI kiya)

**BACK bet:** (yaad karo — back mein zyada odds better)

| Situation | Decision |
|---|---|
| Live odds >= selected odds (same ya upar gaye) | ✅ ACCEPT — user ko same/better rate mila |
| Live odds < selected (neeche gir gaye) | ❌ REJECT — "Bet Not Confirmed, odds changed" |

Example: 1.38 pe click kiya →
- Live 1.40 ho gaya → ✅ accept, bet **1.40** pe lagegi (better!)
- Live 1.37 ho gaya → ❌ reject

**LAY bet:** (lay mein kam odds better — liability kam)

| Situation | Decision |
|---|---|
| Live odds <= selected (same ya neeche) | ✅ ACCEPT |
| Live odds > selected (upar chadh gaye) | ❌ REJECT |

Example: 1.36 pe lay click kiya →
- Live 1.34 → ✅ accept (liability kam ho gayi)
- Live 1.40 → ❌ reject (liability badh jaati)

### 4.3 Rules — User ne odds MANUALLY edit kiye (+/− buttons)

Sirf MATCH_ODDS mein odds editable hain. Yaha comparison **selected vs edited**
hota hai, live odds ignore:

**BACK manual edit:**
- Edited **> selected** → ❌ REJECT — user market se ZYADA maang raha hai =
  unmatched bet = allowed nahi
- Edited **<= selected** → ✅ ACCEPT — user khud kam le raha hai, uski marzi
  (platform ko fayda hi hai)

**LAY manual edit:**
- Edited **< selected** → ❌ REJECT — user KAM liability maang raha = unmatched
- Edited **>= selected** → ✅ ACCEPT — user khud zyada liability le raha hai

**Ek line mein:** user apne against jitna marzi adjust kare — allowed. Apne
favour mein market se better maange — reject.

### 4.4 EPSILON kya hai?

Code mein `EPSILON = 0.001` hai. Floating point numbers (1.3800000001 type ki
computer ki gadbad) ki wajah se exact compare nahi karte — 0.001 ka margin
rakha hai. `1.38` aur `1.3800001` ko same maana jayega.

---

## PART 5 — Buffer Kya Hai? (Delay Kyun Hota Hai Bet Mein)

File: `placeBetLiveChecks.js` → `monitorOddsBuffer`
Config: `BET_BUFFER_SECONDS = 10` (match odds), `FANCY_BUFFER_SECONDS = 3` (fancy)

### 5.1 Concept

Submit dabate hi bet turant place NAHI hoti. Pehle ek **buffer period** chalta
hai (10 sec match odds / 3 sec fancy). Ye isliye:

1. **Live TV delay** — user TV pe 5-10 second pehle ka match dekh raha hota
   hai. Ball pe chauka lag chuka hai, user ko abhi nahi dikha, wo purane odds
   pe bet lagane ki koshish karega. Buffer is "courtsiding" se bachata hai.
2. **Fresh odds confirm karna** — buffer ke dauraan har **500ms** pe live
   market data check hota hai (jo page ka 2s poll `marketsRef` mein bharta
   rehta hai).

### 5.2 Buffer ke dauraan kya-kya hota hai

Har 500ms check pe:
- Runner ka `gstatus` dekha jaata hai — agar **SUSPENDED / BALL RUNNING /
  INACTIVE** ho gaya → turant `blocked = true`, buffer khatam, bet reject
- Odds hi gayab ho gaye (odds <= 0) → turant reject
- Match odds market: latest live odds + size track hote rehte hain (`finalOdds`)
- Fancy market: odds change track NAHI hote (locked hain), sirf size track hota hai

Buffer ke END pe jo `finalOdds` mila usi pe **Bookie Favour check** chalta hai
(Part 4). Console mein tumhe ye sab logs dikhenge:
`[PlaceBet] 🔍 2.5s | Check #5 | Selected: 1.38 | Live: 1.40 ✗ | ...`

### 5.3 Fancy ka strict check (`checkFancyOddsDrift`)

Fancy mein odds edit nahi ho sakte, to rule simple hai: **jo rate slip mein
hai wo live market mein ab bhi exist karna chahiye (±0.01)**. Buffer ke baad
live tiers mein se closest rate nikala jaata hai — agar slip ke rate se 0.01
se zyada door hai → reject, toast: "odds changed". Match hua to us tier ka
live size payload mein use hota hai.

---

## PART 6 — Exposure / Liability / Book

### 6.1 Exposure kya hai?

**Exposure = worst case mein tumhara kitna paisa doob sakta hai.** Platform
ye paisa tumhari balance mein se "hold" kar leta hai jab tak result nahi aata.

Per-bet exposure (`calculateSingleBetPLValue`):

| Bet | Exposure |
|---|---|
| BACK (decimal) | stake |
| LAY (decimal) | (odds − 1) × stake |
| BOOKMAKER back (odds >= 10) | stake |
| BOOKMAKER lay (odds >= 10) | (odds/100) × stake |
| FANCY (yes/no dono) | stake |

**Balance check rule (Step 8 in pipeline):** `betLiability > balance` → reject,
toast: "Check your balance". Yaani jitna doob sakta hai utna balance hona chahiye.

### 6.2 Book kya hai? (Per-runner P&L)

Jab tum ek hi market mein multiple bets lagate ho, har runner ke jeetne pe
tumhara NET kya hoga — ise **book** kehte hain. Ye wahi green/red numbers hain
jo market table mein har team ke naam ke neeche dikhte hain.

`calculateMatchOddsResults(bets, currentBet, teams)` har team ke liye loop
karta hai: "agar YE team jeeti to har bet ka kya hoga":

- Back on this team → `+(odds−1)×stake`; back on OTHER team → `−stake`
- Lay on this team → `−(odds−1)×stake`; lay on OTHER team → `+stake`

**Real example — book banana:**

Match: India vs Pakistan. Tumne 2 bets lagayi:
1. BACK India, odds 1.80, stake 1000
2. LAY Pakistan, odds 2.20, stake 500

Book calculation:

**Agar India jeeta:**
- Bet 1 (back India, India jeeta): +(1.80−1)×1000 = **+800**
- Bet 2 (lay Pakistan, Pakistan haara): **+500** (lay jeet gayi)
- **India book = +1300** (green)

**Agar Pakistan jeeta:**
- Bet 1 (back India, India haara): **−1000**
- Bet 2 (lay Pakistan, Pakistan jeeta): −(2.20−1)×500 = **−600**
- **Pakistan book = −1600** (red)

Market table mein dikhega: India ke neeche `+1300` green, Pakistan ke neeche
`−1600` red. Aur is market ka **exposure = 1600** (worst case).

Panel mein jab tum stake type karte ho, live preview isi function se banta
hai — existing matched bets + jo bet abhi lagane wale ho, dono mila ke.

### 6.3 Fancy book

`calculateFancyResults` — Yes side aur No side ka net:
- Har YES bet: `yesNet += stake×rate/100`, `noNet −= stake`
- Har NO bet: ulta

---

## PART 7 — Hamara Submit Pipeline (Code Ka Flow, Step by Step)

File: `usePlaceBetPanel.js` → `handleSubmit`. User "Submit" dabata hai, ye
8 steps chalte hain — **koi bhi step fail hua to wahi ruk jaata hai, toast
dikhta hai, bet nahi lagti:**

```
User clicks odds cell → panel khulta hai (odds + stake input)
User types stake → Submit
        │
Step 0  ├─ ANTI-SPAM: same market pe max 4 attempts ek waqt pe
        │   5th → "Multiple Bet Not Allowed"  (betAttemptTracker.js)
        │
Step 1  ├─ VALIDATION (placeBetRules.js → getBetValidationError):
        │   • stake khali/0            → "Enter valid stake"
        │   • stake >= 1e16 (16+ zero) → fake loader 1.5s, phir "Server Error"
        │   • stake >= 1e12 (12 zero)  → instant "Bet Not Valid.."
        │   • stake < min              → "Minimum stake is X"
        │   • stake > max              → "Maximum stake is X"
        │   • market suspended         → "Game Not Active"
        │
Step 2  ├─ MANUAL-EDIT INSTANT CHECK: agar user ne +/− se odds badle
        │   aur wo unmatched banta hai → turant reject, buffer waste nahi
        │   karte. ("Unmatched bet not allowed")
        │
Step 3  ├─ BUFFER (placeBetLiveChecks.js → monitorOddsBuffer):
        │   10s (match odds) / 3s (fancy) tak har 500ms live odds+status
        │   monitor. Suspend/Ball-Running/odds-gone → blocked.
        │
Step 4  ├─ FINAL SUSPENSION CHECK: buffer ke baad ek aakhri baar runner ka
        │   gstatus. SUSPENDED/INACTIVE → "Game Not Active",
        │   BALL RUNNING → "Ball Running" toast.
        │
Step 5  ├─ FANCY DRIFT CHECK (sirf locked-odds markets): slip ka rate live
        │   tiers mein ±0.01 pe exist kare, warna "odds changed".
        │
Step 6  ├─ BOOKIE FAVOUR (bookieFavour.js): Part 4 ke rules. Reject to
        │   "Bet Not Confirmed..." toast (detailed reason sirf console mein).
        │   Accept → finalOdds lock (better rate mila to wahi use hota hai).
        │
Step 7  ├─ DEMO USER: local flow — demoStore mein bet save, balance/exposure
        │   locally update. API call nahi jaati.
        │
Step 8  └─ REAL USER:
            • Balance check: is bet ki liability > available balance → 
              "Check your balance"
            • prepareBetPayload() → POST /user/place
            • Success flow (order matter karta hai):
              1) panel band  2) success toast  3) redux mein matched bet add,
              balance/exposure update  4) 250ms baad 'bet:placed' event →
              exposure API refetch → table mein book values update
```

### One-Click Betting

Alag mode: user pehle se stake set kar leta hai (100/200/300 buttons).
Phir kisi bhi odds pe click karte hi **panel dikhe bina** ye poora pipeline
auto-run ho jaata hai. Ek tricky bug ka fix bhi hai: GameDetails mobile+desktop
dono DOM render karta hai (CSS se ek hidden), to same bet do panels mein mount
hoti hai — `WeakSet` (`oneClickSubmittedBets`) ensure karta hai ki sirf ek hi
instance submit kare, double bet na lage.

---

## PART 8 — Real Case Scenarios (Practice Ke Liye)

### Scenario 1: Simple back bet, odds improve ho gaye
- User: BACK India @ **1.38**, stake 500. Submit.
- Buffer 10s chala, live odds **1.42** ho gaye.
- Bookie favour: back + live(1.42) >= selected(1.38) → ✅ ACCEPT
- Bet lagti hai **1.42** pe (user ko better rate mila!).
- Jeete to profit = (1.42−1)×500 = **+210**. Haare to −500.

### Scenario 2: Back bet, odds gir gaye
- User: BACK India @ **1.38**, stake 500. Submit.
- Buffer ke baad live **1.35**.
- Bookie favour: 1.35 < 1.38 → ❌ REJECT.
- Toast: "Bet Not Confirmed..." — user dobara fresh rate pe try karega.

### Scenario 3: Lay bet, wicket gir gayi beech mein
- User: LAY Pakistan @ **2.20**, stake 1000. Submit.
- Buffer ke 3rd second pe wicket → market **SUSPENDED**.
- 500ms check pe pakda gaya → `blocked = true` → "Game Not Active".
- (Yahi to buffer ka kaam hai — TV delay walo se bachna.)

### Scenario 4: Manual edit se unmatched attempt
- Market rate 1.38 hai. User BACK click karke +/− se odds **1.50** kar deta hai
  ("mujhe 1.50 pe chahiye").
- Step 2 instant check: back mein edited(1.50) > selected(1.38) = market se
  zyada maang raha = unmatched → ❌ turant reject, buffer bhi nahi chalta.

### Scenario 5: Manual edit apne against — allowed
- Market rate 1.38. User ne odds ghata ke **1.30** kar diye
  (koi bhi reason — jaldi match ho, guaranteed rate ho).
- Back mein edited(1.30) <= selected(1.38) → ✅ accept. Bet 1.30 pe lagegi.
- User ko kam profit milega, platform khush — isliye allowed.

### Scenario 6: Fancy bet, rate shift ho gaya
- "6 over run 25" pe YES @ rate **90**, stake 1000.
- 3s buffer ke baad live tiers mein 90 nahi hai, ab **85/110** chal raha hai.
- `checkFancyOddsDrift`: closest tier 85, |85−90| > 0.01 → mismatch → 
  "odds changed" toast.

### Scenario 7: Bookmaker percentage
- Bookmaker market, BT XI ka back **90** dikh raha hai (>= 10, matlab percent).
- Stake 2000 back: jeete to (90/100)×2000 = **+1800**, haare to −2000.
- Wahi runner LAY @ **94**, stake 2000: team haari to +2000, jeet gayi to
  (94/100)×2000 = **−1880** liability.

### Scenario 8: Balance kam hai
- Balance 500. User LAY @ 3.0, stake 400 lagata hai.
- Liability = (3.0−1)×400 = **800** > balance 500.
- Step 8 balance check → ❌ "Check your balance".
- (Note: same stake ka BACK lag jaata — uski liability sirf 400 hai.)

### Scenario 9: Spam clicks
- User ek hi market pe jaldi-jaldi 5 baar submit dabata hai.
- Pehli 4 attempts process hoti hain, 5th pe `registerBetAttempt` false → 
  "Multiple Bet Not Allowed".

### Scenario 10: Shararti user, absurd stake
- Stake mein `1000000000000000000` (18 zeros) type kiya.
- `>= 1e16` → fake loader 1.5 second ghoomta hai, phir "Server Error" — jaise
  server pe gaya ho. (Reference site ka exact behavior copy kiya hai.)
- 12–15 zeros hota to instant "Bet Not Valid..".

---

## PART 9 — Chhoti-Chhoti Details Jo Kaam Aayengi

### Odds Tick Ladder (`stepOdds`)
+/− button har jagah 0.01 nahi badhata. Value ke range pe step depend karta hai:

| Odds range | Step |
|---|---|
| 1–2 | 0.01 |
| 2–3 | 0.02 |
| 3–4 | 0.05 |
| 4–6 | 0.1 |
| 6–10 | 0.2 |
| 10–20 | 0.5 |
| 20–30 | 1 |
| 30–50 | 2 |
| 50–100 | 5 |
| 100–1000 | 10 |

Ye real exchange (Betfair) ka standard price ladder hai. Boundary pe: 2.00
se − dabao to 1.99 (neeche wale band ka step), + dabao to 2.02 (upar wala).

### Stake input — sirf digits
Stake mein decimal/letters type ho hi nahi sakte (keypress guard charCode
48–57). "1" phir "." phir "2" type karo to **12** banta hai, 1.2 nahi.

### betType naming
Code mein `back`/`lay` ke saath `yes`/`no` bhi aate hain (fancy se).
`isLaySide(betType)` → `lay` ya `no` dono ko lay side treat karta hai.
Calculations mein `back || yes` aur `lay || no` same treat hote hain.

### min/max stake kahan se aata hai
`bv.min_stake || section.min || market.min` — market data ke saath aata hai.
`maxb` sirf header display ke liye hai ("Max: 25K"), actual limit `max` hai.

### Success ke baad UI order (jaan ke rakha hai)
1. Panel band → 2. green toast → 3. book/balance update. Ye reference site ka
exact feel hai — pehle panel hatana, phir confirmation.

### Demo user
Demo ka poora alag flow hai (`demoStore.js`) — bets localStorage mein, exposure
client-side calculate (`calculateMarketLiability`), API pe kuch nahi jaata.
Rule wahi: total worst-case liability > balance → reject.

---

## PART 10 — Ek Poora End-to-End Trace (Sab Jod Ke)

**User story:** Ravi ke paas 5000 balance hai. India vs Pak match, MATCH_ODDS.
India back @ 1.38 dikh raha hai. Ravi 2000 lagana chahta hai.

1. Ravi **1.38 back cell** pe click karta hai → `GameDetails.handleBetClick`
   bet info banata hai (market, runner, odds, sid...) → `PlaceBetPanel` khulta hai.
2. Panel mein odds 1.38 pre-filled, Ravi **2000** stake dabata hai
   (quick button se). Panel live preview dikhata hai:
   profit +760 / India book +760 green, Pak book −2000 red.
3. **Submit.**
4. Step 0: pehla attempt — pass. Step 1: 2000 min/max ke andar — pass.
5. Step 2: odds edit nahi kiye — skip.
6. Step 3: **10 second buffer.** Har 500ms live check. Console mein
   `Check #1...#20` logs. 6th second pe odds 1.40 ho gaye — track hota rehta hai.
7. Step 4: final gstatus = ACTIVE — pass.
8. Step 5: fancy nahi hai — skip.
9. Step 6: bookie favour → back, live(1.40) >= selected(1.38) → **ACCEPT**,
   `finalOdds = 1.40`.
10. Step 8: liability = 2000 (back ka stake) <= 5000 balance — pass.
    `prepareBetPayload` payload banata hai → `POST /user/place`.
11. Server success → panel band → "Bet Placed" toast → redux mein matched bet
    add → balance/exposure update (balance ab effectively 3000 usable) →
    250ms baad `bet:placed` event → exposure API refetch → India ke neeche
    **+800** green (1.40 pe laga tha!), Pak ke neeche **−2000** red.
12. Ravi ki bet ab **Matched Bets** list mein dikhti hai (mobile tab /
    My Bet sidebar).

Bas — yahi poora system hai. Koi bhi naya market type aaye to:
- Calculation `betHelpers.js` mein add hoti hai
- Market family `placeBetRules.js` ke `getMarketFamily` mein
- Bookie favour applicable hai ya nahi — `isBookieFavourMarket` mein

---

*Document generated from the actual code in `src/components/betting/placeBet/`
and `src/utils/` — agar logic badle to ye doc bhi update karna.*
