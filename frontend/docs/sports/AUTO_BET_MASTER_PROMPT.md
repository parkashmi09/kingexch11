# MASTER PROMPT — AUTO Bet (Bookie Favour, bina odds chhue) — Aasan Bhasha Mein
# Check bhi karo + jo missing hai implement bhi karo

> Kaise use kare: ye poora prompt AI tool mein paste karo, neeche `<CODE>` mein
> apni files daalo (bet-slip / place-bet pipeline / buffer / payload), run karo.
> Ye MANUAL-bet prompt ka jodidar hai — wahan user ne bhav haath se badla tha,
> yahan user ne bhav ko **haath nahi lagaya**.

---

## TU KAUN HAI
Tu ek betting-exchange ka senior engineer hai. Neeche wale rules SIMPLE bhasha
mein likhe hain. Inko padh, phir mera code check kar. Jo rule sahi laga hai
uska PROOF de (file + function + line). Jo galat/missing hai, MINIMAL change
se theek kar. Faltu refactor mat kar.

## SABSE BADA KANOON (ek line)
**Bookie kabhi apne current market rate se ghatiya deal execute nahi karta.**
Bhav user ke FAYDE mein hile → bet lagegi, **naye (behtar) bhav par**.
Bhav user ke NUKSAN mein hile → bet **reject**, kyunki user ne wo bhav manzoor
nahi kiya tha.

## AUTO BET KYA HAI (context)
User ne odds cell click kiya, sirf **stake** dala, aur submit kar diya —
`isUserModifiedOdds` false hai (ya user ne edit karke wapas wahi value kar di,
yaani `|E − X| ≤ 0.001` — wo bhi AUTO hi hai).

Do numbers hain:
- **X** = jis bhav par click kiya (slip khulte hi capture)
- **Y** = **buffer khatam hone par live bhav** (buffer ke doran har 500ms refetch)

Faisla **buffer ke BAAD** hota hai, X vs Y par. (Manual bet me faisla turant hota
hai aur E vs X par — wo alag prompt hai, use mat mila.)

---

## CHAARO CORE CASES — ratta maar table

| # | Side | Bhav kaise hila | Bookie ko | Kya hona chahiye |
|---|------|-----------------|-----------|------------------|
| A1 | BACK | Y > X (2.30 → 2.40) | fine (user ko behtar mila, market wahi de rahi) | **ACCEPT @ Y = 2.40** — payload/profit sab 2.40 se, 2.30 se NAHI |
| A2 | BACK | Y < X (2.30 → 2.20) | NUKSAN (2.30 dena market se upar hai) | **REJECT** — toast `Bet not confirm Odds change` |
| A3 | LAY | Y < X (2.30 → 2.20) | fine (user ki liability kam, market wahi maang rahi) | **ACCEPT @ Y = 2.20** — liability (2.20−1)×stake |
| A4 | LAY | Y > X (2.30 → 2.40) | NUKSAN (2.30 par lena market se neeche hai) | **REJECT** — same toast |
| A5 | any | Y == X (epsilon ke andar) | koi farak nahi | **ACCEPT @ Y** — barabar bhav hamesha accept. `>` / `<` strict + epsilon hona chahiye, `>=`/`<=` se equality reject ho jaayegi — ye classic bug hai |

**Yaad rakh:** AUTO me execution **hamesha Y (live)** par hoti hai, X par nahi.
X sirf ek kasauti hai — "market user ke khilaf to nahi hui".

---

## BUFFER KE NIYAM (ye alag se verify kar)

| # | Baat | Expected |
|---|------|----------|
| B1 | Buffer kahan se aata hai | Admin/platform config (API), env sirf fallback. Fancy ka apna chhota buffer. |
| B2 | Buffer ke doran kya hota hai | Har 500ms live market refetch; apni side ka **best** rate track (back1 / lay1, top tier) + uska size |
| B3 | Buffer ke doran reject | **Nahi** — sirf monitor + log. Reject buffer khatam hone ke baad. Exception: market/runner **suspend** ya odds gayab → wahin block |
| B4 | Buffer 0 ho to | Koi wait nahi, Y = X, aur baaki checks phir bhi chalein |
| B5 | Market list stale to nahi | Buffer ko **live ref** se padhna chahiye, snapshot copy se nahi — warna 4.50 → 4.90 wala move dikhega hi nahi aur bet 4.50 par lag jaayegi |
| B6 | Size | Buffer ka aakhri live size payload mein jaana chahiye (back_size / lay_size) |

---

## BAAKI GATES — poora pipeline order (har ek verify kar)

| # | Gate | Kab | Expected toast |
|---|------|-----|----------------|
| G0 | Anti-spam (ek hi market par baar-baar submit) | submit par | `Multiple Bet Not Allowed On Same Time AND Same Market.` |
| G1 | Stake khali / invalid | submit par | `Enter a valid stake amount` / `Invalid bet` |
| G1b | Absurd amount (12–15 zero / 16+ zero) | submit par | `Bet Not Valid..` / loader + `Server Error` |
| G1c | Min / Max stake | submit par | `Check Minimum Bet Limit.` / `Check Maximum Bet Limit2.` |
| G1d | Market/row already suspended | submit par | `Bet Not Confirm Reason Game Not Active.` |
| G2 | Cricket ODI/T20 MATCH_ODDS rate cap (>4.00) | submit par **entered odds** pe | `Bet Not Accept Rate Over 4.00 on Oneday and T20` (Test format exempt) |
| G3 | Buffer monitor: suspend / odds gayab | buffer ke doran | `Bet Not Confirm Reason Game Not Active.` |
| G4 | Final suspension check | buffer ke baad | status ke hisaab se (`Ball Running` / suspended wala) |
| G5 | Fancy strict drift (locked-odds markets) | buffer ke baad | `Odds changed` — slip ka bhav live tiers me ±0.01 ke andar hona chahiye |
| G6 | **Bookie favour (A1–A5)** | buffer ke baad | `Bet not confirm Odds change` |
| G7 | Rate cap **dobara**, ab FINAL Y par | favour ke baad | same rate-cap toast — kyunki A1 me Y upar ja kar 4.00 cross kar sakta hai |
| G8 | Balance / liability | payload se pehle | `Bet Not Confirm Check Balance.` |

**Cashout ka exception:** cashout bet favour check **skip** karti hai (jis bhav par
hedge calculate hua, usi par lagegi) — par suspension checks phir bhi lagte hain.

---

## KAUN SE MARKET PAR FAVOUR CHECK CHALTA HAI

| gtype | Markets | Odds | Favour check |
|-------|---------|------|--------------|
| `match` | MATCH_ODDS, TO_QUALIFY, HALF_TIME, OVER_UNDER_* | live, badalte hain | ✅ chale |
| `match1` | Bookmaker, BM_*, Tied Match | live | ✅ chale (BOOKMAKER family) |
| `fancy` | Normal, Over-by-Over, Khado, Meter, OddEven | **locked** | ❌ favour nahi — uski jagah G5 drift check |

> Dhyan: agar tumhare code ka favour-check sirf `MATCH_ODDS`/`BOOKMAKER` naam par
> filter karta hai, to `TO_QUALIFY` / `HALF_TIME` / `OVER_UNDER_*` **bina check ke
> nikal jaayenge** — ye ek chhupa hua hole hai, isko explicitly verify kar.

---

## PAYLOAD KA HISAAB (verify kar, badalna nahi)

Accept (A1/A3/A5) par:
- `odds` = **Y** (buffer-end live), **X nahi**
- `user_rate` = Y
- `unmatched` = `false`, `unmatched_odds` = `null`
- `back_size` / `lay_size` / `size` = buffer ka aakhri live size
- profit/liability preview + balance check bhi **Y** se

Reject (A2/A4) par: **koi API call nahi**, sirf toast.

**#1 verification:** A1 mein payload me 2.40 (live) ja raha hai ya galti se 2.30
(clicked)? File:line dikha.

---

## YE 8 CHEEZEIN CODE MEIN DHUNDH KE JAWAB DE

1. X kahan capture hota hai (click par) aur kya wo buffer ke doran galti se
   overwrite to nahi hota? Naya cell click karne par reset hota hai?
2. Y kahan se aata hai — buffer ka return value, ya kahin purana snapshot?
   Buffer live ref se padh raha hai ya stale copy se (B5)?
3. Favour compare `>` / `<` + epsilon hai ya `>=` / `<=`? A5 (equality) accept
   ho rahi hai? Epsilon ki value kya hai aur har jagah same hai?
4. Accept par execution **Y** par ho raha hai ya X par? Payload, profit preview,
   balance check — teeno jagah same number hai? (Ek jagah X, doosri jagah Y =
   mismatch bug.)
5. Buffer ke doran koi reject to nahi ho raha (B3)? Sirf suspension par block
   hona chahiye.
6. G7 (final Y par rate-cap dobara) laga hua hai? A1 me Y = 4.20 ho jaye to
   reject hona chahiye.
7. Fancy/locked markets favour path me to nahi ghus rahe? Unka drift check
   (±0.01) chal raha hai?
8. Cashout favour check skip karta hai par suspension checks nahi — confirm?

---

## PAKKE NIYAM
- UI FREEZE: JSX, CSS, layout, toast ke shabd, timing — kuch mat chhedna.
  Sirf logic / calculation / payload.
- Manual-bet ka code alag rakhna. AUTO ka function alag, MANUAL ka alag —
  ek ko theek karte hue doosra na tootey.
- Fix = chhota diff + before/after snippet + ek line "kaunsa rule (A1..A5 / B / G)
  theek hua".
- Backend ka jawab chahiye ho to guess mat kar, likh de:
  "BACKEND SE POOCHNA HAI: <exact sawal>".

---

## JAWAB IS FORMAT MEIN DE
1. **Verdict table:** A1–A5, B1–B6, G0–G8 — PASS/FAIL — proof (file:function:line)
2. **8 sawalon ke jawab**, har ek evidence ke saath
3. **Findings + Fixes:** sirf asli galtiyan, minimal diff, before/after
4. **8-line manual test** (neeche wala) run karke batao

## 8-LINE MANUAL TEST (tester UI par aise check kare)
1. BACK click @2.30, buffer me live 2.40 → bet lage **@2.40**, profit 2.40 se, payload 2.40
2. BACK click @2.30, buffer me live 2.20 → **reject** + `Bet not confirm Odds change`
3. LAY click @2.30, live 2.20 → lage **@2.20**, liability 1.20×stake
4. LAY click @2.30, live 2.40 → **reject** + same toast
5. Bhav bilkul na hile → lage @ wahi bhav (A5)
6. BACK @3.90 (ODI/T20), buffer me live 4.20 → **reject** rate-cap toast (G7)
7. Buffer ke beech market suspend → `Bet Not Confirm Reason Game Not Active.`
8. Fancy row par bet → favour check nahi, slip ka bhav live tiers me na mile to `Odds changed`

---

<CODE>
(yahan apna code paste kar — place-bet pipeline / buffer monitor / favour rules / payload)
</CODE>
