# Account Statement V2 — Bets APIs

Base URL: `https://api.tenexchn.com`

Both APIs are **user-panel** APIs and need the logged-in user's auth token:

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 1. Account Statement V2

### `POST /api/user/account-statement-v2`

Returns the logged-in user's statement rows (point_ledger based). Each row now
also carries the identifiers needed to open the Result modal (sports) or show
game info (casino).

### Body

| Field        | Type   | Required | Notes                                              |
|--------------|--------|----------|----------------------------------------------------|
| `reportType` | string | no       | `ALL` (default) \| `TRANSACTION` \| `SPORTS`       |
| `fromDate`   | string | no       | `YYYY-MM-DD` — max range 31 days                   |
| `toDate`     | string | no       | `YYYY-MM-DD` (full day included)                   |
| `search`     | string | no       | partial match on description/remark                |
| `page`       | number | no       | default `1`                                        |
| `limit`      | number | no       | default `25`                                       |

### Response

```json
{
  "success": true,
  "total": 120,
  "totalPages": 5,
  "currentPage": 1,
  "data": [ /* rows, see below */ ]
}
```

#### Row — SPORTS

```json
{
  "date": "2026-07-30T16:32:05.000Z",
  "credit": "9.00",
  "debit": "-",
  "closing": "1058.10",
  "description": "Cricket / Southern Brave W v Birmingham Phoenix W / oddeven / 1",
  "fromto": "-",
  "category": "SPORTS",
  "betId": 48211,
  "gamename": null,
  "roundId": null,
  "sportId": "4",
  "eventId": "34644567",
  "matchId": "1.246789123",
  "marketType": "oddeven",
  "gameType": "FAN"
}
```

- `matchId` = market id (mid), `eventId` = match id (gmid).
- Pass `matchId` + `eventId` to the Result modal API below.
- The last segment of `description` is the winner label.

#### Row — CASINO

```json
{
  "date": "2026-07-26T01:20:06.857Z",
  "credit": "9.00",
  "debit": "-",
  "closing": "-",
  "description": "Mogambo / R.No : 192260726064843 / Yes",
  "fromto": "-",
  "category": "CASINO",
  "betId": 90311,
  "gamename": "Mogambo",
  "roundId": "192260726064843",
  "sportId": null,
  "eventId": null,
  "matchId": null,
  "marketType": null,
  "gameType": null
}
```

#### Row — TRANSACTION (deposit / withdraw etc.)

`category` is `null`, all bet fields (`betId`, `gamename`, `roundId`, `sportId`,
`eventId`, `matchId`, `marketType`, `gameType`) are `null`.

---

## 2. Result Modal — Market Bets

### `POST /api/user/account-statement-v2/bets`

For one SPORTS statement row: returns **all of the logged-in user's bets on that
market** (from the SportsBet table) plus the **winner** (parsed from the
settlement entry in credits_ledger). Powers the Result popup
(Nation / Rate / Bhav / Amount / Win / Date / Ip Address / Browser Details).

### Body

| Field     | Type   | Required | Notes                                            |
|-----------|--------|----------|--------------------------------------------------|
| `matchId` | string | **yes**  | market id (mid) — from the statement row         |
| `eventId` | string | **yes**  | match id (gmid) — from the statement row         |

```json
{
  "matchId": "1.246789123",
  "eventId": "34644567"
}
```

### Response — 200

```json
{
  "success": true,
  "header": {
    "sportId": "4",
    "sportName": "Cricket",
    "eventId": "34644567",
    "matchId": "1.246789123",
    "matchTitle": "Southern Brave W v Birmingham Phoenix W",
    "marketType": "oddeven",
    "gameType": "FAN",
    "gameTime": "2026-07-30T16:32:05.000Z"
  },
  "winner": "1",
  "description": "Cricket / Southern Brave W v Birmingham Phoenix W / oddeven / 1",
  "settledAt": "2026-07-30T18:05:11.000Z",
  "totalBets": 2,
  "totalWin": 9,
  "bets": [
    {
      "id": 549,
      "user_id": "19",
      "game_type": "FAN",
      "match_title": "Birmingham Phoenix W v Welsh Fire W",
      "team_one": "Yes",
      "team_two": "No",
      "selection_name": "1 to 25 Balls runs BP W(BP W vs WF W)adv",
      "category": "1",
      "bet_type": "no",
      "market_type": "Normal",
      "odds": "30.0000",
      "stake_amount": "100.00",
      "event_name": null,
      "original_currency": "INR",
      "original_amount": "100.00",
      "usd_amount": "1.18",
      "liability": "100.00",
      "match_start_time": "2026-08-01T13:30:00.000Z",
      "match_end_time": null,
      "created_at": "2026-07-31T20:16:44.289Z",
      "updated_at": "2026-07-31T20:16:44.289Z",
      "match_id": "237301565068",
      "exposure_after_bet": "100.00",
      "status": "open",
      "eventid": "866533236",
      "job_id": null,
      "ip_address": "122.173.25.191",
      "browser": "Mozilla/5.0 (Linux; Android 15; Pixel 9) ...",
      "fancy_name": "1 to 25 Balls runs BP W(BP W vs WF W)adv",
      "result_status": "pending",
      "fixed": 0,
      "counts": 2,
      "sport_id": "4",
      "unmatched": false,
      "unmatched_odds": null,
      "size": 100,
      "runners": ["Yes", "No"],
      "gtype": "fancy",
      "user": { "username": "testuser1" },
      "sport_name": "Cricket",
      "side": "LAY",
      "win": null,
      "deleted": false
    }
  ]
}
```

### Field reference

**Top level**

| Field         | Type          | Notes                                                           |
|---------------|---------------|-----------------------------------------------------------------|
| `header`      | object\|null  | market info for the modal title; `null` if no bets found        |
| `winner`      | string\|null  | winner label; `null` while the market is unsettled              |
| `description` | string\|null  | full settlement description (`Sport / Match / Market / Winner`) |
| `settledAt`   | string\|null  | when the market was settled                                     |
| `totalBets`   | number        | count of non-deleted bets (green "Total Bets")                  |
| `totalWin`    | number        | signed net P/L of non-deleted settled bets (green "Total Win")  |
| `bets`        | array         | all bets on the market, oldest first                            |

**Per bet** — the FULL raw SportsBet row (every column, decimals as strings:
`odds`, `stake_amount`, `liability`, …) plus these extra fields:

| Field        | Type          | Modal use        | Notes                                                 |
|--------------|---------------|------------------|-------------------------------------------------------|
| `user`       | object        | —                | `{ "username": "testuser1" }` (logged-in user)        |
| `sport_name` | string\|null  | header           | resolved from `sport_id` (4 → Cricket)                |
| `side`       | string\|null  | Back/Lay tabs    | `BACK` (back/yes) \| `LAY` (lay/no)                   |
| `win`        | number\|null  | Win              | signed P/L (same math as statement); `null` = pending |
| `deleted`    | boolean       | Deleted tab      | void/refund/cancelled bets; excluded from totals      |

Modal columns map straight onto raw fields: **Nation** = `fancy_name` (fallback
`selection_name`), **Rate** = `odds`, **Bhav** = `size`, **Amount** =
`stake_amount`, **Win** = `win`, **Date** = `created_at`, **Ip Address** =
`ip_address`, **Browser Details** = `browser`.

### Tabs (client-side filtering)

- **All** — every bet with `deleted: false`
- **Back** — `side === "BACK" && !deleted`
- **Lay** — `side === "LAY" && !deleted`
- **Deleted** — `deleted === true`

### Errors

| Status | Body                                                              | When                          |
|--------|-------------------------------------------------------------------|-------------------------------|
| 400    | `{ "success": false, "message": "matchId and eventId required" }` | missing/empty params          |
| 401    | `{ "success": false, "message": "User not authenticated..." }`    | missing/invalid token         |
| 500    | `{ "success": false, "error": "..." }`                            | server error                  |

No bets on that market → `200` with `bets: []`, `header: null`, `totalBets: 0`.

---

## 3. Result Modal — Casino Round Bets

### `POST /api/user/account-statement-v2/casino-bets`

For one CASINO statement row: returns **all of the logged-in user's bets on that
casino round** (from the casino_bets table) plus the **winner** (provider
`winnat`, e.g. `"Daga/Teja"`, `"Player A"`). Same modal as sports
(Nation / Rate / Amount / Win / Date / Ip Address / Browser Details).

### Body

| Field     | Type          | Required | Notes                                                        |
|-----------|---------------|----------|--------------------------------------------------------------|
| `roundId` | string/number | yes*     | `roundId` from the statement row — fetches the whole round   |
| `betId`   | number        | no*      | fallback for legacy rows whose `roundId` is `null` — fetches just that one bet |

\* At least one of the two is required; `roundId` wins when both are sent.

```json
{
  "roundId": "192260730193212"
}
```

### Response — 200

```json
{
  "success": true,
  "header": {
    "gamename": "Mogambo",
    "gameCode": "mogambo",
    "roundId": "192260730193212",
    "eventId": "192260730193212",
    "gameTime": "2026-07-30T14:02:35.691Z"
  },
  "winner": "Daga/Teja",
  "settledAt": "2026-07-30T14:03:46.300Z",
  "totalBets": 1,
  "totalWin": 47,
  "bets": [
    {
      "id": "664",
      "user_id": "24",
      "player_name": "Daga / Teja",
      "odds": "1.47",
      "stake": "100.00",
      "selection": "Daga / Teja",
      "exposer": "-100.00",
      "libality": "-100.00",
      "game_name": "mogambo",
      "type": "back",
      "mtype": "match",
      "status": "closed",
      "event_id": "192260730193212",
      "round_id": "192260730193212",
      "job_id": null,
      "result_status": "won",
      "credit_amt": "147.00",
      "ip_address": "122.173.28.54",
      "browser": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 ...) ...",
      "created_at": "2026-07-30T14:02:35.691Z",
      "updated_at": "2026-07-30T14:02:35.691Z",
      "processing_at": "2026-07-30T14:03:43.745Z",
      "user": { "username": "saluser1" },
      "game_label": "Mogambo",
      "side": "BACK",
      "win": 47,
      "deleted": false
    }
  ]
}
```

### Field reference

**Top level**

| Field       | Type          | Notes                                                                  |
|-------------|---------------|------------------------------------------------------------------------|
| `header`    | object\|null  | round info for the modal title; `null` if no bets found                |
| `winner`    | string\|null  | provider winner label; `null` if the provider has no result (yet)      |
| `settledAt` | string\|null  | when the round was settled (latest casino ledger entry)                |
| `totalBets` | number        | count of non-deleted bets (green "Total Bets")                         |
| `totalWin`  | number        | signed net P/L of non-deleted settled bets (green "Total Win")         |
| `bets`      | array         | all of the user's bets on the round, oldest first                      |

**Header**

| Field      | Type         | Notes                                              |
|------------|--------------|----------------------------------------------------|
| `gamename` | string       | display name (`"Mogambo"`)                         |
| `gameCode` | string\|null | tableid (`"mogambo"`)                              |
| `roundId`  | string\|null | round number shown as `R.No` in the modal          |
| `eventId`  | string\|null | provider event id (usually equals `roundId`)       |
| `gameTime` | string\|null | first bet's `created_at`                           |

**Per bet** — the FULL raw casino_bets row (every column, decimals as strings:
`odds`, `stake`, `credit_amt`, …) plus these extra fields:

| Field        | Type          | Modal use     | Notes                                                          |
|--------------|---------------|---------------|----------------------------------------------------------------|
| `user`       | object        | —             | `{ "username": "saluser1" }` (logged-in user)                  |
| `game_label` | string        | header        | display name resolved from `game_name`                         |
| `side`       | string\|null  | Back/Lay tabs | `BACK` \| `LAY` (from `type`)                                  |
| `win`        | number\|null  | Win           | signed P/L: won → payout − stake lock, lost → −`credit_amt`; `null` = pending/void |
| `deleted`    | boolean       | Deleted tab   | void/refund/cancelled bets; excluded from totals               |

Modal columns map straight onto raw fields: **Nation** = `selection` (fallback
`player_name`), **Rate** = `odds`, **Amount** = `stake`, **Win** = `win`,
**Date** = `created_at`, **Ip Address** = `ip_address`, **Browser Details** =
`browser`.

`winner` note: served from the `casinoresult` table when present; on a miss the
server fetches it live from the provider's detail-results API and caches it
back, so a null `winner` only means the provider itself has no result for that
round.

### Tabs (client-side filtering)

- **All** — every bet with `deleted: false`
- **Back** — `side === "BACK" && !deleted`
- **Lay** — `side === "LAY" && !deleted`
- **Deleted** — `deleted === true`

### Errors

| Status | Body                                                            | When                  |
|--------|-----------------------------------------------------------------|-----------------------|
| 400    | `{ "success": false, "message": "roundId or betId required" }`  | missing/empty params  |
| 401    | `{ "success": false, "message": "User not authenticated..." }`  | missing/invalid token |
| 500    | `{ "success": false, "error": "..." }`                          | server error          |

No bets on that round → `200` with `bets: []`, `header: null`, `winner` still
looked up if `roundId` was sent, `totalBets: 0`.
