# Casino Games — Verification Checklist

Har casino game me ja ke **calculation verify** karni hai: bet lagti hai to sahi
exposure banta hai, result aane par sahi P&L settle hota hai, aur rate/odds
reference se match karte hain. Ek game verify hone ke baad uska checkbox tick
karke Notes me kuch bhi issue likh do, phir agle game pe badho.

- **Total games:** 80
- **Verified:** 5 / 80  ← _yeh number update karte raho_

> **Loop tool:** `node scripts/casinoGameCheck.mjs [type...]` — har game ka live
> feed fetch karke BetTable ke `exposures['literal']` keys ko API `nat` se
> cross-check karta hai. **❌ DEAD** = literal kisi nat se match nahi (pakka bug,
> jaise `'Player A con'`); **🔍** = dynamic `${}` key ya positional `sub[n]`
> (khud dekho). Ye `nat`-key rule + con-suffix bug ko auto-pakadta hai.

## Tooling — diamond vs tenexch diff

Diamond source (`D:/Developer/jmd-exch/d99-frontend`) me functionality sahi hai
(UI alag hai). Uske saath place-bet + **exposure-mapping** compare karne ke liye
script hai:

```
node scripts/casinoFuncDiff.mjs
```

Yeh `src/pages/casino/FUNCTIONALITY_DIFF_REPORT.md` banata hai jisme har game ka
diff hai. Do tarah ke flags:
- **⚠️ exposure-key** — tenexch book ko diamond se alag dimension pe key kar raha
  hai → book galat cell pe / 0 aata hai. **Yahi pehle fix karo.**
- **🔍 bet-count** — clickable cells ki count alag (aksar sirf componentisation,
  eyeball karke confirm karo).

> **Sabse common bug (report se):** tenexch kaafi tables exposure ko **hardcoded
> string** (`'PlayerA'`, `'Even'`, `'AnyPair'`) ya local `name` var se key karti
> hain, jabki diamond API ke asli `item.nat` se. Server ab diamond-jaisa hai, to
> exposure key bhi `nat` se honi chahiye — warna book 0 dikhega.

**Workflow:** report se ek game utha → diamond ka `BetTable*` khol ke exposure
mapping dekho → tenexch me same `nat`-based mapping karo → us game ko is checklist
me ✅ karo → script dobara chala ke flag clear hua confirm karo.

## Har game me kya-kya check karna hai

Har game khol ke (local: `http://localhost:3091<route>`) yeh 5 cheezein dekhni hain:

1. **Bet lagana** — har market/section pe click → PlaceBet panel khulta hai, sahi
   `nat`/rate/`sid` uthata hai, min/max sahi hai.
2. **Exposure (book) calc** — stake daalne pe har outcome ka liability/profit sahi
   dikhta hai (green/red book values), aur balance se stake sahi cut hota hai.
3. **Result settlement** — round ka result aane par winner/loser sahi decide hota
   hai aur P&L (`win = stake*(rate-1)`, `loss = stake`) sahi credit/debit hota hai.
4. **Suspended / lock state** — `gstatus` ACTIVE na ho to cell lock, bet block.
5. **Rate/odds source** — odds feed se aa rahe hain (hardcoded nahi), aur reference
   game se match karte hain.

> Legend — Status: ⬜ pending · 🟨 in-progress · ✅ verified · ⚠️ issue found

---

## 1. Teenpatti family (22)

| ✓ | Game | Route | File | Status | Notes |
|---|------|-------|------|--------|-------|
| [x] | Teenpatti One Day | `/casino/teen` | `TeenpattiOneDay.jsx` | ✅ | Con book fixed (keyed by `nat` like diamond, was `'Player A con'` → 0) |
| [ ] | Teenpatti 2 (Teen 6) | `/casino/teen6` | `Teenpatti2.jsx` | ⬜ | |
| [x] | Teenpatti 20-20 | `/casino/teen20` | `Teenpatti20.jsx` | ✅ | Positional `sub[n]` mismatched API order → cells mislabelled; now `byNat` lookup |
| [ ] | Teen 20-C | `/casino/teen20c` | `Teen20c.jsx` | ⬜ | |
| [ ] | Teenpatti 20b | `/casino/teenpattit20b` | `Teenpatti20b.jsx` | ⬜ | |
| [ ] | Teen 41 | `/casino/teen41` | `Teen41.jsx` | ⬜ | |
| [ ] | Teen 42 | `/casino/teen42` | `Teen42.jsx` | ⬜ | |
| [x] | Teen 62 | `/casino/teen62` | `Teen62.jsx` | ✅ | Con book fixed (`'Player A con'` → `nat`), same as Teen One Day |
| [ ] | Teenpatti 2 Cards | `/casino/teenpatti2cards` | `Teenpatti2Cards.jsx` | ⬜ | |
| [ ] | Teenpatti Open | `/casino/teenpattiopen` | `TeenpattiOpen.jsx` | ⬜ | |
| [ ] | Teenpatti Test | `/casino/teenpattitest` | `TeenpattiTest.jsx` | ⬜ | |
| [ ] | Muflis Teenpatti | `/casino/teenmuf` | `MuflisTeenpatti.jsx` | ⬜ | |
| [ ] | Unique Teenpatti | `/casino/teenunique` | `UniqueTeenpatti.jsx` | ⬜ | |
| [ ] | Instant Teenpatti | `/casino/instantteenpatti` | `InstantTeenpatti.jsx` | ⬜ | |
| [ ] | Instant Teenpatti 2 | `/casino/instantteenpatti2` | `InstantTeenpatti2.jsx` | ⬜ | |
| [ ] | Instant Teenpatti 3 | `/casino/instantteenpatti3` | `InstantTeenpatti3.jsx` | ⬜ | |
| [ ] | Joker Teenpatti 1 | `/casino/jokerteenpatti1` | `JokerTeenpatti1.jsx` | ⬜ | |
| [ ] | Joker Teenpatti 20 | `/casino/jokerteenpatti20` | `JokerTeenpatti20.jsx` | ⬜ | |
| [ ] | Joker Teenpatti 120 | `/casino/jokerteenpatti120` | `JokerTeenpatti120.jsx` | ⬜ | |
| [x] | Poison (1 Day) | `/casino/poison` | `Poison.jsx` | ✅ | Poison section dead — finds used `'Even'`, feed is `'Poison Even'`; now `'Poison '`-prefix + `item.nat` |
| [ ] | Poison 20-20 | `/casino/poison20` | `Poison20.jsx` | ⬜ | |
| [ ] | Trio | `/casino/trio` | `Trio.jsx` | ⬜ | |

## 2. Dragon Tiger (4)

| ✓ | Game | Route | File | Status | Notes |
|---|------|-------|------|--------|-------|
| [ ] | Dragon Tiger 20-20 | `/casino/dt20` | `DragonTiger20.jsx` | ⬜ | |
| [ ] | Dragon Tiger 20-20 (2) | `/casino/dt202` | `DragonTiger202.jsx` | ⬜ | |
| [ ] | Dragon Tiger Lion 20-20 | `/casino/dtl20` | `DragonTigerLion20.jsx` | ⬜ | |
| [ ] | Dragon Tiger One Day | `/casino/dt6` | `DragonTigerOneDay.jsx` | ⬜ | |

## 3. Poker (4)

| ✓ | Game | Route | File | Status | Notes |
|---|------|-------|------|--------|-------|
| [ ] | Poker 20-20 | `/casino/poker20` | `Poker20.jsx` | ⬜ | |
| [ ] | Poker 6 Player | `/casino/poker6player` | `Poker6.jsx` | ⬜ | |
| [ ] | Poker One Day | `/casino/pokeroneday` | `PokerOneDay.jsx` | ⬜ | |
| [ ] | 3 Card Judgement | `/casino/3cardj` | `ThreeCardJ.jsx` | ⬜ | |

## 4. Baccarat (3)

| ✓ | Game | Route | File | Status | Notes |
|---|------|-------|------|--------|-------|
| [ ] | Baccarat | `/casino/baccarat` | `Baccarat.jsx` | ⬜ | |
| [ ] | Baccarat 2 | `/casino/baccarat2` | `Baccarat2.jsx` | ⬜ | |
| [ ] | 29 Card Baccarat | `/casino/29cardbaccarat` | `CardBaccarat29.jsx` | ⬜ | |

## 5. Andar Bahar (4)

| ✓ | Game | Route | File | Status | Notes |
|---|------|-------|------|--------|-------|
| [ ] | Andar Bahar 20-20 | `/casino/ab20` | `AndarBahar.jsx` | ⬜ | |
| [ ] | Andar Bahar J | `/casino/abj` | `AndarBahar2.jsx` | ⬜ | |
| [ ] | Andar Bahar (ab3) | `/casino/ab3` | `AndarBahar50.jsx` | ⬜ | |
| [ ] | Andar Bahar (ab4) | `/casino/ab4` | `AndarBahar150.jsx` | ⬜ | |

## 6. Lucky 7 / Lucky (5)

| ✓ | Game | Route | File | Status | Notes |
|---|------|-------|------|--------|-------|
| [ ] | Lucky 7 A | `/casino/lucky7` | `Lucky7A.jsx` | ⬜ | |
| [ ] | Lucky 7 B (EU) | `/casino/lucky7eu` | `Lucky7B.jsx` | ⬜ | |
| [ ] | Lucky 7 C (EU 2) | `/casino/lucky7eu2` | `Lucky7C.jsx` | ⬜ | |
| [x] | Lucky 6 | `/casino/lucky5` | `Lucky6.jsx` | ✅ | Primary keys match feed; removed dead `'Spade & Club'`/`'Red Suits'` fallbacks |
| [ ] | Lucky 15 | `/casino/lucky15` | `Lucky15.jsx` | ⬜ | |

## 7. 32 Cards / Note Number (3)

| ✓ | Game | Route | File | Status | Notes |
|---|------|-------|------|--------|-------|
| [ ] | 32 Cards A | `/casino/card32` | `Card32A.jsx` | ⬜ | |
| [ ] | 32 Cards B (EU) | `/casino/card32eu` | `Card32B.jsx` | ⬜ | |
| [ ] | Note Number | `/casino/notenum` | `NoteNumber.jsx` | ⬜ | |

## 8. Roulette (4)

| ✓ | Game | Route | File | Status | Notes |
|---|------|-------|------|--------|-------|
| [ ] | Our Roulette | `/casino/ourroullete` | `OurRoulette.jsx` | ⬜ | |
| [ ] | Roulette 11 | `/casino/roulette11` | `Roulette11.jsx` | ⬜ | |
| [ ] | Roulette 12 | `/casino/roulette12` | `Roulette12.jsx` | ⬜ | |
| [ ] | Roulette 13 | `/casino/roulette13` | `Roulette13.jsx` | ⬜ | |

## 9. Worli / Matka (5)

| ✓ | Game | Route | File | Status | Notes |
|---|------|-------|------|--------|-------|
| [ ] | Worli | `/casino/worli` | `WorliPage.jsx` | ⬜ | |
| [ ] | Instant Worli | `/casino/worli2` | `InstantWorli.jsx` | ⬜ | |
| [ ] | Worli Matka | `/casino/worli3` | `WorliMatka.jsx` | ⬜ | |
| [ ] | Mogambo | `/casino/mogambo` | `Mogambo.jsx` | ⬜ | |
| [ ] | Doli Dana | `/casino/dolidana` | `DoliDana.jsx` | ⬜ | |

## 10. Cricket casino (10)

| ✓ | Game | Route | File | Status | Notes |
|---|------|-------|------|--------|-------|
| [ ] | Ball By Ball | `/casino/ballbyball` | `BallByBall.jsx` | ⬜ | |
| [ ] | Cricket Match 20-20 | `/casino/cmatch20` | `CricketMatch20.jsx` | ⬜ | |
| [ ] | Five Cricket (v3) | `/casino/cricketv3` | `FiveCricket.jsx` | ⬜ | |
| [ ] | Super Over | `/casino/superover` | `SuperOver.jsx` | ⬜ | |
| [ ] | Super Over 2 | `/casino/superover2` | `SuperOver2.jsx` | ⬜ | |
| [ ] | Mini Super Over | `/casino/superover3` | `MiniSuperOver.jsx` | ⬜ | |
| [ ] | One Card 20-20 | `/casino/1card2020` | `OneCard2020.jsx` | ⬜ | |
| [ ] | One Card Meter | `/casino/cmeter1` | `OneCardMeter.jsx` | ⬜ | |
| [ ] | One Card One Day | `/casino/1card1day` | `OneCardOneDay.jsx` | ⬜ | |
| [ ] | Casino Meter | `/casino/cmeter` | `CasinoMeter.jsx` | ⬜ | |

## 11. Other table games (16)

| ✓ | Game | Route | File | Status | Notes |
|---|------|-------|------|--------|-------|
| [ ] | AAA (Amar Akbar Anthony) | `/casino/aaa` | `AAA.jsx` | ⬜ | |
| [ ] | AAA 2 | `/casino/aaa2` | `AAA2.jsx` | ⬜ | |
| [ ] | Bollywood Table | `/casino/btable` | `BollywoodTable.jsx` | ⬜ | |
| [ ] | Bollywood Table 2 | `/casino/bollywoodtable2` | `BollywoodTable2.jsx` | ⬜ | |
| [ ] | Queen | `/casino/queen` | `Queen.jsx` | ⬜ | |
| [ ] | Casino War | `/casino/war` | `CasinoWar.jsx` | ⬜ | |
| [ ] | Trap | `/casino/trap` | `Trap.jsx` | ⬜ | |
| [ ] | Goal | `/casino/goal` | `Goal.jsx` | ⬜ | |
| [ ] | Goal 2 | `/casino/goal2` | `Goal2.jsx` | ⬜ | |
| [ ] | Sic Bo | `/casino/sicbo` | `SicBo.jsx` | ⬜ | |
| [ ] | Sic Bo 2 | `/casino/sicbo2` | `SicBo2.jsx` | ⬜ | |
| [ ] | Dus Ka Dum | `/casino/dum10` | `DusKaDum.jsx` | ⬜ | |
| [ ] | Race To 17 | `/casino/raceto17` | `RaceTo17.jsx` | ⬜ | |
| [ ] | Race 2 | `/casino/race2` | `Race2.jsx` | ⬜ | |
| [ ] | Race 20-20 | `/casino/race20` | `Race20.jsx` | ⬜ | |
| [ ] | Lottery (Lott Card) | `/casino/lottcard` | `Lottery.jsx` | ⬜ | |

---

## Issues log

Jaise-jaise issue milte jaayein, yahan short note ke saath likhte jao (game + kya galat tha + fix status):

| Date | Game | Issue | Fix status |
|------|------|-------|-----------|
| 2026-07-18 | Teenpatti One Day | Consecutive (con) book always 0 — read `exposures['Player A con']`; con `nat` is actually `'Player A'` (sid 17/18), map never has `'…con'` key | ✅ fixed — `BetTableTeen1Day.jsx` now keys con by `item.nat` + lowercase (diamond parity) |
| 2026-07-18 | Teenpatti 20-20 | Positional `sub[0..11]` assumed A/B-interleaved order but feed is sid-order (Player, Pair Plus, Baccarat, Black/Red, Total) → Baccarat cell bet on Pair Plus, etc. All cells past Player mislabelled | ✅ fixed — `BetTableTeen20.jsx` uses `byNat(...)` lookup, order-independent |
