# Backend gaps — the reference's account pages

The account menu has been rebuilt to match `clickbetexchenge.com` exactly: the
same eight rows, the same eight pages, the same columns and filters on each.

Some of those pages ask the server for things this backend does not serve yet.
**Nothing on the backend was changed.** The pages are complete and wired; where
the data is missing they show their normal empty state ("No Data Found" /
"No Profit & Loss Found") instead of breaking.

This file lists, in plain terms, what is missing and what has to be built.

---

## 1. Profit Loss Report — the whole report is missing

**Page:** `/profitloss`
**Front-end call:** `POST /user/pnl`

### What's missing
There is no profit-and-loss endpoint at all. Nothing in the backend adds up a
user's winnings and losses over a date range.

### What it needs to do
Take a date range and return one row per *sport + market type* combination,
with that combination's total profit or loss for the period.

**Request**

```json
{ "from": "2026-08-01T00:00:00.000Z", "to": "2026-08-31T00:00:00.000Z" }
```

**Response**

```json
{
  "isSuccess": true,
  "items": [
    { "_id": { "et": "4", "mt": "MATCH_ODDS", "bt": "ODDS" }, "pnl": 1250.5, "commission": 0 },
    { "_id": { "et": "4", "mt": "FANCY",      "bt": "LINE" }, "pnl": -300,   "commission": 0 }
  ]
}
```

- `et` — sport id. Use **this app's own ids**: `4` cricket, `1` soccer,
  `2` tennis, `10` horse racing, `65` greyhound, `99` casino, `999` sportbook.
- `mt` — market type, e.g. `MATCH_ODDS`, `BOOKMAKER`, `FANCY`, `WIN`.
- `pnl` — settled profit (positive) or loss (negative) for that bucket.
- `commission` — commission for the same bucket; the page adds the two together.

The page already knows every sport/market pair it can display and only prints
the ones that come back non-zero, plus a Total row.

---

## 2. Bet History — settled bets cannot be fetched

**Page:** `/bethistory`
**Front-end call:** `GET /user/cricket/sports-bets/user?status=settled&fromDate=…&toDate=…`

### What's missing
The existing bets route only returns **open** bets. It understands
`status=matchbet | unmatchbet | deletebet`, and it ignores dates entirely.
There is no way to ask for bets that have already been settled.

### What it needs to do
Extend the same route (no new route needed):

1. Accept `status=settled` — return bets whose `result_status` is `WON`,
   `LOST`, `VOID` or `DECLARED`.
2. Accept `fromDate` and `toDate` (ISO strings) and filter on the bet's
   placement time. This applies to the open-bets case too — see gap 4.

The response shape stays exactly as it is today:

```json
{ "success": true, "data": [ …bets… ], "pagination": { "total": 120 } }
```

The Casino half of this page already works — it reads the settled side of
`GET /jsGames/history`.

---

## 3. Results — declared match results are not served

**Page:** `/results`
**Front-end calls:**
- `GET /user/cricket/results?sportId=4`
- `GET /user/cricket/results/markets?eventId=…`

### What's missing
There is no sports-results endpoint. Only *casino* results exist
(`POST /casino/casino/result-report`), which is a different thing.

### What it needs to do

**a) The list — events settled today and yesterday, for one sport**

Request: `GET /user/cricket/results?sportId=4`

```json
{
  "isSuccess": true,
  "today_result": [
    {
      "event_id": "34567891",
      "event_name": "India v Australia",
      "competition_name": "ODI Series",
      "open_date": "2026-09-01 09:30:00",
      "declared_date": "2026-09-01 17:12:00"
    }
  ],
  "yesterday_result": []
}
```

Dates are `"YYYY-MM-DD HH:mm:ss"` in **UTC** — the page converts to local time,
matching how every other date in this app is handled.

**b) The drill-down — every market that event settled**

Request: `GET /user/cricket/results/markets?eventId=34567891`

```json
{
  "isSuccess": true,
  "items": [
    { "marketId": "1.234", "marketName": "Match Odds", "winnerName": "India",
      "createdAt": "2026-09-01 17:12:00" }
  ]
}
```

---

## 4. Unsettled Bet — no date filter, and no profit/loss figures

**Page:** `/unsettledbet`
**Front-end call:** `GET /user/cricket/sports-bets/user?fromDate=…&toDate=…`

### What's missing

**a) Date range is ignored.** The page has a From/To filter because the
reference has one, but the route does not filter on dates — so today it returns
all open bets regardless of what the user picks. Same fix as gap 2, point 2.

**b) The bets carry no potential profit / potential loss.** The reference's
rows include `potentialProfit` and `potentialLoss` straight from the server.
Ours don't, so the page **calculates them in the browser** from stake, odds,
side and market type, using the same helper the bet slip uses to show its own
Profit figure.

This is correct for the markets we handle (decimal odds, and the percentage
quotes used by bookmaker / fancy / tied-match), but it is a duplicate of logic
that really belongs on the server — settlement uses the server's numbers, so if
the two ever drift apart, the report is the one that will be wrong.

**Recommended:** store `potential_profit` and `potential_loss` on the bet at
placement time and return them on this route. The page will prefer them as soon
as they appear.

---

## 5. Account Statement — no opening/closing balance, and one missing filter

**Page:** `/accountstatement`
**Front-end call:** `POST /user/account-statement-v2`

### What's missing

**a) Opening and closing balance.** The reference shows a small two-row summary
table beside the filters, and a "Closing Balance" seed row at the top of the
statement. Both read from the response. Ours doesn't send them, so all three
figures currently read `0.00`.

Add to the response:

```json
{ "success": true, "data": [...], "total": 240,
  "openingBalance": 15000.00, "closingBalance": 12430.50 }
```

- `openingBalance` — the balance immediately **before** the first row on the
  current page.
- `closingBalance` — the balance **after** the last row on the current page.

**b) The `SETTLEMENT` report type.** The filter has four options because the
reference has four. Three of them map onto what the route already understands:

| What the user picks | What we send |
|---|---|
| ALL | `ALL` ✅ |
| BALANCE REPORT | `TRANSACTION` ✅ |
| GAME REPORT | `SPORTS` ✅ |
| SETTLEMENT REPORT | `SETTLEMENT` ❌ not supported |

`SETTLEMENT` should return settlement / commission ledger entries only. Until
it does, picking that option returns nothing.

---

## 6. Set Stake — casino stake buttons have no page

**Page:** `/setstake`
**Front-end calls:** `GET` / `POST /user/stake-button-values`

### Not a backend gap — a note
The reference has **one** set of six stake buttons. This app stores **two**:
`game_buttons` and `casino_buttons`.

The page edits `game_buttons`, because that is the set the sports bet slip
reads. `casino_buttons` has no screen in the reference's design and is no
longer editable from the account menu. If the casino screens need them
editable, that needs a product decision — the reference offers no place to
put it.

No backend change required.

---

## 7. P&L figure in the account panel

**Where:** the "P&L" row in the slide-out account panel.

The panel reads `user.pnl`. The backend never sends that field, so the row
always shows `0.00`. It should carry the user's current unsettled profit/loss,
the same figure the Profit Loss report totals — add `pnl` to the user profile /
balance payload and the row fills itself in.

---

## Summary

| Reference page | Status |
|---|---|
| Account Statement | Works. Missing opening/closing balance + `SETTLEMENT` filter (gap 5) |
| Profit Loss Report | **Blocked** — no endpoint (gap 1) |
| Bet History | Casino works. Sports **blocked** — no settled-bets query (gap 2) |
| Unsettled Bet | Works. Date filter ignored; PP/PL computed client-side (gap 4) |
| Set Stake | Works (gap 6 is a note, not a blocker) |
| Rules | Works |
| Change Password | Works |
| Results | **Blocked** — no endpoint (gap 3) |

---

# Backend gaps — the casino lobbies

The Live Casino lobby (`/casino/LIVECASINO`) is rebuilt to the reference's
design. It runs on the jsGames catalog that is already there — again, nothing on
the backend was changed — but the catalog has some holes the page has to paper
over.

## 8. Most live-casino games have no artwork

The lobby is a wall of tiles, so this is the most visible one.

`GET /jsGames/games?vendor=<v>` returns a `game_icon` per game. Today:

| Vendor | Games | Artwork state |
|---|---|---|
| evolution | 128 | 78 of the first 100 point at a **boxbet.io image proxy** that refuses to serve anyone but its own site. Worked around (see below). |
| ezugi | 133 | 54 fine (S3), 25 fine (CloudFront), **6 dead** (`bc.imgix.net` answers `402 Payment Required`), **14 empty** |
| creedroomz | 135 | **99 of 100 are an empty string** — nearly the whole vendor shows the placeholder |

**The boxbet.io workaround.** Those rows store a URL of the form
`https://boxbet.io/_next/image?url=<real CDN url>&w=640&q=100`. The proxy 404s
for us, but the address in its own `url=` parameter (`cdn.softswiss.net/...`)
serves fine, so the front end unwraps it. That should not be permanent: the
catalog should store the real CDN address, not somebody else's proxy wrapper.

**What to do:** fill `game_icon` with a directly reachable image URL for every
active game — the unwrapped `cdn.softswiss.net` address for Evolution, and real
art for Creedroomz and the empty Ezugi rows. Until then those tiles show
`/assets/casino/games/default-2.jpeg`.

## 9. Five of the live-casino vendors are empty

The old lobby offered twelve provider tabs. Of the eight vendor ones, only three
return anything:

- has games: `evolution`, `ezugi`, `creedroomz`
- returns 0: `vivo`, `cockfight`, `winfinity`, `jacktop`, `holi`

The new lobby lists the three that work. If the other five are meant to be live,
their games need loading into the catalog; if they are dead, they should come
out of the old lobby's tab list too.

## 10. There is no "live casino" category, and `game_type` barely classifies

Two related things.

**a) No category.** `GET /jsGames/games/category/:c/...` answers:
`Invalid category. Allowed categories: crash, lottery, slot, fantasy`. There is
no live-casino category, so the front end has to hard-code *which vendors make
up a live-casino lobby* (`src/cb/casino/lobbies.js`). Every time a live-casino
vendor is added or removed, that list has to be edited and redeployed.

**Recommended:** add a `live_casino` (or `casino`) category so a lobby can be
one API call instead of a hard-coded vendor list.

**b) `game_type` is not a real classification.** The reference sorts a lobby on
three axes — provider, game type and category — and gives each its own control.
The catalog has two, and one of them barely varies:

| Vendor | `game_type` values |
|---|---|
| evolution | `CasinoLive` (all 100) |
| ezugi | `CasinoLive` (99), `Lobby` (1) |
| creedroomz | `roulette` (27), `other` (61), `blackjack` (11), `Lobby` (1) |

So the game-type strip is useful for Creedroomz and does nothing for Evolution
or Ezugi. Creedroomz shows the shape it should be: roulette, blackjack,
baccarat, poker, and so on per game.

**Recommended:** classify every game the way Creedroomz already is. Then the
strip works, and the Category dialog can be given the third axis it wants —
today the dialog and the strip are two entry points into the same game-type
filter, because there is no second thing to filter on.

## 11. Tile artwork is not one shape

Not a bug, just something to know. The reference's own art is uniformly
480×640, so its grid lines up on markup alone. The catalog's art comes from each
provider's CDN in portrait, square and landscape, so the tile is pinned to the
reference's 3:4 box and the art is cropped to fill
(`src/cb/casino-tiles.css`). Standardising the artwork would let that file go
away.
