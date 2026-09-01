// Shared data-mapping layer for every cricket / sports bet-table (home In-Play
// board, per-sport detail view, logged-in and logged-out). It is a PURE
// transform from the `/user/cricket/all-data` response (t1 = real matches,
// t2 = virtual/e-cricket) into the row shape the UI renders. Because it is
// pure, the same output drives both the logged-in and the logged-out board —
// when no live odds are present every cell simply resolves to its suspended
// state, which is exactly what the reference markup shows.

// The API only sends ISO `openDate` (no `stime`); render it as the reference
// does: DD/MM/YYYY HH:MM:SS in IST.
export function formatOpenDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const p = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(d);
  return p.replace(',', '');
}

// Parse "M/D/YYYY h:mm:ss AM/PM" (e.g. "7/6/2026 11:00:00 PM") to a sortable
// timestamp. Built explicitly from numeric parts via new Date(y, m, d, ...) —
// never relies on Date's non-ISO string parsing, which is implementation-defined
// and can return NaN in some browsers (which would break the live-board sort).
export function stimeToMs(stime) {
  if (!stime) return 0;
  const m = String(stime).match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4})[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i
  );
  if (!m) {
    const t = new Date(stime).getTime();
    return Number.isFinite(t) ? t : 0;
  }
  let hour = Number(m[4]);
  const ap = (m[7] || '').toUpperCase();
  if (ap === 'PM' && hour !== 12) hour += 12;
  if (ap === 'AM' && hour === 12) hour = 0;
  return new Date(
    Number(m[3]), Number(m[1]) - 1, Number(m[2]),
    hour, Number(m[5]), Number(m[6] || 0)
  ).getTime();
}

// Format a game start time for the "Comming Up" rows exactly as the reference
// board does: a relative day label + a 24h HH:MM time, e.g. { day:'Today',
// time:'22:00' }, { day:'Tomorrow', ... }, { day:'Thursday', ... } or, for past
// / far-future dates, { day:'03 Jul', ... }. The `stime` clock value is used
// literally (already server/IST time) — no timezone shifting. Day label is
// relative to the local calendar day, consistent with stimeToMs's date parsing.
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatGameDate(stime) {
  const m = String(stime || '').match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4})[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i
  );
  if (!m) return { day: String(stime || ''), time: '' };

  const mon = Number(m[1]), dd = Number(m[2]), yyyy = Number(m[3]);
  let hour = Number(m[4]);
  const min = Number(m[5]);
  const ap = (m[7] || '').toUpperCase();
  if (ap === 'PM' && hour !== 12) hour += 12;
  if (ap === 'AM' && hour === 12) hour = 0;
  const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

  const target = new Date(yyyy, mon - 1, dd);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target - today) / 86400000);

  let day;
  if (diffDays === 0) day = 'Today';
  else if (diffDays === 1) day = 'Tomorrow';
  else if (diffDays >= 2 && diffDays <= 6) day = WEEKDAYS[target.getDay()];
  else day = `${String(dd).padStart(2, '0')} ${MONTHS_SHORT[mon - 1]}`;

  return { day, time };
}

// A single back/lay cell. The reference treats any non-positive / missing price
// as suspended ("—"). Verified against live data: virtual/between-round games
// come back with gstatus SUSPENDED *and* odds:0, so the `> 0` guard alone
// suspends them — no need to also read gstatus.
function getCell(sec, idx) {
  const o = sec?.odds?.[idx];
  if (!o || !(Number(o.odds) > 0)) return { odds: null, size: null };
  return { odds: String(o.odds), size: o.size || null };
}

// Cricket sections come keyed by `sno`: 1 = home team, 3 = away team, and
// 2 = the draw (only Test matches / football carry it — verified: West Indies v
// Sri Lanka Test returns sno 1/2/3, every T20 returns only 1/3). The draw column
// is therefore DATA-DRIVEN, never gated on `isFootball`: `oX.exists` reflects
// whether the sno=2 market is actually present. When it is missing the row shows
// the "no-val" suspended draw; when present it shows real odds (or "no-odds"
// suspended if that market alone is closed).
export function mapGame(game, sportId, { egames = false } = {}) {
  const s1 = game?.section?.find(s => s.sno === 1) || {};
  const sXsection = game?.section?.find(s => s.sno === 2);
  const s2 = game?.section?.find(s => s.sno === 3) || {};
  const sX = sXsection || {};

  return {
    id: game.gmid,
    teams: game.ename,
    league: game.cname || game.ename,
    inplay: !!game.iplay,
    // Game-level suspension: when the whole match is SUSPENDED the reference
    // still SHOWS the odds but greys every cell (adds `suspended`). This is
    // separate from a cell being empty (`no-odds`). Verified: Legia Warsaw etc.
    // come back status "SUSPENDED" with live odds present.
    suspended: String(game.status || '').toUpperCase() === 'SUSPENDED',
    date: game.stime || formatOpenDate(game.openDate),
    // Virtual cricket rounds (T5 XI / T10 XI / Virtual Cricket League + the Dim
    // "(e)" e-cricket league, iscc 4) open on their own detail route, same as
    // the reference (/sport/tpVirtual/...); everything else keeps /gamedetails.
    href: sportId === 4 && (isSkippedLeague(game) || Number(game.iscc) === 4)
      ? `/tp-virtual-cricket/${sportId}/${game.gmid}`
      : `/gamedetails/${sportId}/${game.gmid}`,
    icons: {
      f: !!game.f,
      f1: !!game.f1,
      bm: !!game.bm,
      tv: !!game.tv,
      // Leading icon-998 (virtual indicator) shows ONLY for cricket's Virtual
      // Cricket League, which the API tags uniquely as iscc === 2 (T5/T10 XI are
      // iscc 1, Dim is 4, real matches 0). Scoped to cricket so no other sport
      // ever renders it.
      virtual: sportId === 4 && Number(game.iscc) === 2,
      // The "e" badge (game-icon e-games) shows for cricket's e-cricket league
      // (Dim Cricket League, iscc === 4) — but ONLY when the caller opts in
      // (`egames: true`). That opt-in comes exclusively from formatCricketData
      // (the Cricket tab / detail view), so it never appears on the flat In-Play
      // home board.
      egames: egames && sportId === 4 && Number(game.iscc) === 4,
    },
    o1: { back: getCell(s1, 0), lay: getCell(s1, 1) },
    oX: { exists: !!sXsection, back: getCell(sX, 0), lay: getCell(sX, 1) },
    o2: { back: getCell(s2, 0), lay: getCell(s2, 1) },
    _raw: game,
  };
}

// Virtual leagues we never render on the cricket board (by `cname`). Matched
// case-insensitively after trimming.
const SKIP_CNAMES = new Set(['t5 xi', 'virtual cricket league', 't10 xi']);

function isSkippedLeague(game) {
  return SKIP_CNAMES.has(String(game?.cname || '').trim().toLowerCase());
}

// Football has its own skip-list, independent of cricket. Empty for now (nothing
// to hide on the football board yet); add cnames here when needed. Matched
// case-insensitively after trimming.
const FOOTBALL_SKIP_CNAMES = new Set([]);

function isSkippedFootballLeague(game) {
  return FOOTBALL_SKIP_CNAMES.has(String(game?.cname || '').trim().toLowerCase());
}

// Tennis has its own skip-list, independent of cricket/football. Empty for now;
// add cnames here when needed. Matched case-insensitively after trimming.
const TENNIS_SKIP_CNAMES = new Set([]);

function isSkippedTennisLeague(game) {
  return TENNIS_SKIP_CNAMES.has(String(game?.cname || '').trim().toLowerCase());
}

// Sport DETAIL board (home Cricket / Football / Tennis tab -> SportDetailView):
// groups every match into league tables exactly as the reference renders them.
// Pure transform from the /all-data response into a ready-to-render structure:
//   1. merge t1 (real matches) + t2 (virtual / outright / special-market leagues)
//   2. group by CID — one tournament can span multiple cnames (e.g. FIFA World
//      Cup "Play Offs" + "Quarter-Finals" share a cid and render under one
//      header); games with no cid fall back to grouping by cname
//   3. order groups by cid ASCENDING (verified against the reference)
//   4. logged in (skipLeagues = true) -> drop the SKIP_CNAMES virtual leagues
//      (T5 XI, T10 XI, Virtual Cricket League), exactly like the In-Play board;
//      logged out -> keep everything
//   5. within each group split into In Play (iplay) / Comming Up, each sorted by
//      start time ascending; the header is the earliest game's league name, and
//      every game is mapped to the UI row shape
// Returns: [{ id, leagueName, cid, inPlay: [row...], comingUp: [row...] }, ...]
export function formatCricketData(t1 = [], t2 = [], sportId = 4, { skipLeagues = false } = {}) {
  // Guard against cross-sport contamination (a stale response from another tab):
  // only keep games belonging to this sport.
  let allGames = [...(t1 || []), ...(t2 || [])].filter(g => g.etid === sportId);
  if (skipLeagues) allGames = allGames.filter(g => !isSkippedLeague(g));

  const groups = {};
  for (const game of allGames) {
    const key = game.cid ? `cid:${game.cid}` : `nm:${game.cname || game.ename}`;
    if (!groups[key]) groups[key] = { games: [], cid: game.cid || 0 };
    groups[key].games.push(game);
    if (game.cid > groups[key].cid) groups[key].cid = game.cid;
  }

  const byStime = (a, b) => stimeToMs(a.stime) - stimeToMs(b.stime);

  return Object.keys(groups)
    .sort((a, b) => groups[a].cid - groups[b].cid)
    .map(key => {
      const { cid } = groups[key];
      const games = [...groups[key].games].sort(byStime);
      const leagueName = games[0]?.cname || games[0]?.ename || '';
      const inPlay = games.filter(g => g.iplay).map(g => mapGame(g, sportId, { egames: true }));
      const comingUp = games.filter(g => !g.iplay).map(g => mapGame(g, sportId, { egames: true }));
      return { id: key, leagueName, cid, inPlay, comingUp };
    });
}

// Virtual Cricket tab (home "Cricket" virtual tab -> SportDetailView virtual). The
// INVERSE of the cricket board: renders ONLY the virtual leagues the main board
// hides when logged in (T5 XI, Virtual Cricket League, T10 XI). Same cid-ascending
// grouping + In Play / Comming Up split. `egames` is left off (virtual cricket
// never shows the e-badge). Verified order matches the reference: Virtual Cricket
// League (cid 8590658) -> T5 XI (46201121) -> T10 XI (56100513).
// Returns: [{ id, leagueName, cid, inPlay: [row...], comingUp: [row...] }, ...]
export function formatVirtualCricketData(t1 = [], t2 = [], sportId = 4) {
  const allGames = [...(t1 || []), ...(t2 || [])].filter(
    g => g.etid === sportId && isSkippedLeague(g)
  );

  const groups = {};
  for (const game of allGames) {
    const key = game.cid ? `cid:${game.cid}` : `nm:${game.cname || game.ename}`;
    if (!groups[key]) groups[key] = { games: [], cid: game.cid || 0 };
    groups[key].games.push(game);
    if (game.cid > groups[key].cid) groups[key].cid = game.cid;
  }

  const byStime = (a, b) => stimeToMs(a.stime) - stimeToMs(b.stime);

  return Object.keys(groups)
    .sort((a, b) => groups[a].cid - groups[b].cid)
    .map(key => {
      const { cid } = groups[key];
      const games = [...groups[key].games].sort(byStime);
      const leagueName = games[0]?.cname || games[0]?.ename || '';
      const inPlay = games.filter(g => g.iplay).map(g => mapGame(g, sportId));
      const comingUp = games.filter(g => !g.iplay).map(g => mapGame(g, sportId));
      return { id: key, leagueName, cid, inPlay, comingUp };
    });
}

// Football DETAIL board (home "Football" tab -> SportDetailView). Kept as its own
// function so it can diverge from cricket freely. Same shape:
//   1. merge t1 (real fixtures) + t2 (outright / special-market leagues — FIFA
//      World Cup winner, daily combo, play offs, etc.)
//   2. group by CID — one tournament can span multiple cnames (e.g. World Cup
//      "Play Offs" + "Quarter-Finals" share a cid, one header); no cid -> by cname
//   3. order groups by cid ASCENDING (verified against the reference)
//   4. logged in (skipLeagues = true) -> drop FOOTBALL_SKIP_CNAMES; logged out ->
//      keep everything
//   5. within each group split In Play (iplay) / Comming Up, each sorted by start
//      time ascending; header is the earliest game's league name
// Football never renders the cricket-only e-cricket / virtual icons.
// Returns: [{ id, leagueName, cid, inPlay: [row...], comingUp: [row...] }, ...]
export function formatFootballData(t1 = [], t2 = [], sportId = 1, { skipLeagues = false } = {}) {
  // Guard against cross-sport contamination (a stale response from another tab):
  // only keep games belonging to this sport.
  let allGames = [...(t1 || []), ...(t2 || [])].filter(g => g.etid === sportId);
  if (skipLeagues) allGames = allGames.filter(g => !isSkippedFootballLeague(g));

  const groups = {};
  for (const game of allGames) {
    const key = game.cid ? `cid:${game.cid}` : `nm:${game.cname || game.ename}`;
    if (!groups[key]) groups[key] = { games: [], cid: game.cid || 0 };
    groups[key].games.push(game);
    if (game.cid > groups[key].cid) groups[key].cid = game.cid;
  }

  const byStime = (a, b) => stimeToMs(a.stime) - stimeToMs(b.stime);

  return Object.keys(groups)
    .sort((a, b) => groups[a].cid - groups[b].cid)
    .map(key => {
      const { cid } = groups[key];
      const games = [...groups[key].games].sort(byStime);
      const leagueName = games[0]?.cname || games[0]?.ename || '';
      const inPlay = games.filter(g => g.iplay).map(g => mapGame(g, sportId));
      const comingUp = games.filter(g => !g.iplay).map(g => mapGame(g, sportId));
      return { id: key, leagueName, cid, inPlay, comingUp };
    });
}

// Tennis DETAIL board (home "Tennis" tab -> SportDetailView). Its own function so
// it can diverge from cricket/football freely. Same shape:
//   1. merge t1 (real matches) + t2 (outright markets — Wimbledon men/women
//      winner, etc.)
//   2. group by CID — a tournament can span multiple cnames (e.g. Wimbledon
//      QUARTER-FINALS singles + doubles + the base event share one cid, one
//      header); no cid -> by cname
//   3. order groups by cid ASCENDING (verified against the reference)
//   4. logged in (skipLeagues = true) -> drop TENNIS_SKIP_CNAMES; logged out ->
//      keep everything
//   5. within each group split In Play (iplay) / Comming Up, each sorted by start
//      time ascending; header is the earliest game's league name
// Tennis never has a draw, so the X column always renders the suspended "no-val"
// cell, and it never shows the cricket-only e-cricket / virtual icons.
// Returns: [{ id, leagueName, cid, inPlay: [row...], comingUp: [row...] }, ...]
export function formatTennisData(t1 = [], t2 = [], sportId = 2, { skipLeagues = false } = {}) {
  // Guard against cross-sport contamination (a stale response from another tab):
  // only keep games belonging to this sport.
  let allGames = [...(t1 || []), ...(t2 || [])].filter(g => g.etid === sportId);
  if (skipLeagues) allGames = allGames.filter(g => !isSkippedTennisLeague(g));

  const groups = {};
  for (const game of allGames) {
    const key = game.cid ? `cid:${game.cid}` : `nm:${game.cname || game.ename}`;
    if (!groups[key]) groups[key] = { games: [], cid: game.cid || 0 };
    groups[key].games.push(game);
    if (game.cid > groups[key].cid) groups[key].cid = game.cid;
  }

  const byStime = (a, b) => stimeToMs(a.stime) - stimeToMs(b.stime);

  return Object.keys(groups)
    .sort((a, b) => groups[a].cid - groups[b].cid)
    .map(key => {
      const { cid } = groups[key];
      const games = [...groups[key].games].sort(byStime);
      const leagueName = games[0]?.cname || games[0]?.ename || '';
      const inPlay = games.filter(g => g.iplay).map(g => mapGame(g, sportId));
      const comingUp = games.filter(g => !g.iplay).map(g => mapGame(g, sportId));
      return { id: key, leagueName, cid, inPlay, comingUp };
    });
}

// Cricket ordering for the home In-Play board. The /all-data endpoint is public
// (identical data logged in or out); the SKIP_CNAMES leagues are hidden ONLY on
// the logged-in board, so the caller opts in via `skipLeagues`:
//   1. merge t2 (live/virtual) then t1
//   2. keep rows for this sport (etid === sportId); fall back to the full list
//   3. In-Play tab -> only live matches (iplay), same as the other sports
//   4. logged in (skipLeagues = true) -> drop skipped virtual leagues (T5 XI,
//      Virtual Cricket League); logged out -> keep everything
//   5. sort by start time ascending; render every match individually (no grouping)
export function buildCricketRows(t1, sportId, t2 = [], { skipLeagues = false } = {}) {
  const merged = [...t2, ...t1];
  const bySport = merged.filter(g => g.etid === sportId);
  let rows = (bySport.length > 0 ? bySport : merged).filter(g => g.iplay);
  if (skipLeagues) rows = rows.filter(g => !isSkippedLeague(g));

  const sorted = [...rows].sort(
    (a, b) => stimeToMs(a.stime) - stimeToMs(b.stime)
  );

  return sorted.map(g => mapGame(g, sportId));
}

// Football ordering for the home In-Play board. Same shape as the cricket board
// but kept as its own function so the two can diverge freely:
//   1. merge t2 (outright/special markets — FIFA World Cup winner, daily combo,
//      etc.) then t1 (real fixtures)
//   2. keep rows for football (etid === sportId); fall back to the full list
//   3. only live matches (iplay)
//   4. logged in (skipLeagues = true) -> drop FOOTBALL_SKIP_CNAMES; logged out ->
//      keep everything
//   5. sort by start time ascending; render every match individually
// The draw (X) column stays data-driven via mapGame -> oX.exists (t2 outrights
// have only sno 1/3 so they render the suspended "no-val" draw).
export function buildFootballRows(t1, sportId, t2 = [], { skipLeagues = false } = {}) {
  const merged = [...t2, ...t1];
  const bySport = merged.filter(g => g.etid === sportId);
  let rows = (bySport.length > 0 ? bySport : merged).filter(g => g.iplay);
  if (skipLeagues) rows = rows.filter(g => !isSkippedFootballLeague(g));

  const sorted = [...rows].sort(
    (a, b) => stimeToMs(a.stime) - stimeToMs(b.stime)
  );

  return sorted.map(g => mapGame(g, sportId));
}

// Tennis ordering for the home In-Play board. Same shape as the cricket/football
// boards but kept as its own function so the three can diverge freely:
//   1. merge t2 (outright/special markets — Wimbledon men/women winner, etc.)
//      then t1 (real matches)
//   2. keep rows for tennis (etid === sportId); fall back to the full list
//   3. only live matches (iplay)
//   4. logged in (skipLeagues = true) -> drop TENNIS_SKIP_CNAMES; logged out ->
//      keep everything
//   5. sort by start time ascending -> live matches first, later-dated outright
//      winners fall to the end, exactly as the reference board renders them
// Tennis never has a draw, so mapGame -> oX.exists is always false and the X
// column always renders the suspended "no-val" cell.
export function buildTennisRows(t1, sportId, t2 = [], { skipLeagues = false } = {}) {
  const merged = [...t2, ...t1];
  const bySport = merged.filter(g => g.etid === sportId);
  let rows = (bySport.length > 0 ? bySport : merged).filter(g => g.iplay);
  if (skipLeagues) rows = rows.filter(g => !isSkippedTennisLeague(g));

  const sorted = [...rows].sort(
    (a, b) => stimeToMs(a.stime) - stimeToMs(b.stime)
  );

  return sorted.map(g => mapGame(g, sportId));
}
