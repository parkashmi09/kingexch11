import { useState, useEffect } from 'react';
import { fetchMatchPrivateData, fetchGameDetails, fetchSportData } from '../apiservices/sportsService';
import { getSportSnapshot } from './sportDataStore';
import { applyMatchOddsLimits } from '../utils/oddsHelpers';

const POLL_INTERVAL = 300;
// The details/all-data refresh piggybacks on the odds poll counter, so keep it
// expressed in wall-clock time — at a sub-second poll a fixed tick count would
// fire it several times a second.
const DETAILS_REFRESH_MS = 30000;

// Virtual / e-cricket games (T5-T10 XI, Virtual Cricket League, Dim "(e)"
// games) are NOT in get-sport-data-by-id — it 500s for their gmids. The old
// app fetched their name/time from the all-data list instead (find by gmid in
// t1+t2). Same here: try the shared sport-data cache first (free when the home
// board already polled this sport), else make one all-data call.
// Racing (Horse 10 / Greyhound 65) nests all-data COUNTRY > VENUE > RACE
// instead of shipping the flat t1 match list every other sport returns, and the
// race object carries no name of its own — the header's "GB > Nottingham" comes
// from the two levels above it. So a racing gmid is never found by the flat
// search, and greyhound (which stays on GameDetails) rendered an EMPTY header
// until this walk existed. cname/ename are named to match the flat shape, which
// is what the page reads for "{league} > {name}".
function findRaceInTree(countries, gmid) {
  for (const country of countries || []) {
    for (const venue of country.children || []) {
      for (const race of venue.children || []) {
        if (String(race.gmid) === String(gmid)) {
          return { ...race, cname: country.cname || '', ename: venue.ename || '' };
        }
      }
    }
  }
  return null;
}

async function findMatchInAllData(gmid, sid) {
  const snap = getSportSnapshot(Number(sid));
  const cached = [...(snap.tournaments || []), ...(snap.data || [])]
    .find((m) => String(m.gmid) === String(gmid));
  if (cached) return cached;
  // Racing home board already polled this sport → the tree is in the cache
  const cachedRace = findRaceInTree(snap.data, gmid);
  if (cachedRace) return cachedRace;

  const res = await fetchSportData(sid);
  const raw = res?.data?.data || res?.data;
  const t1 = Array.isArray(raw?.data?.t1) ? raw.data.t1 : [];
  const t2 = Array.isArray(raw?.data?.t2) ? raw.data.t2 : [];
  return [...t2, ...t1].find((m) => String(m.gmid) === String(gmid))
    || findRaceInTree(t1, gmid);
}

export default function useMatchData(gmid, sid, initialGame) {
  const [matchData, setMatchData] = useState(initialGame || null);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Set when the private-data API definitively reports this game has no
  // markets (body {success:false, error:"...404"} or an HTTP 4xx/5xx) before
  // any markets ever loaded — the page redirects home with a toast.
  const [noMarkets, setNoMarkets] = useState(false);

  useEffect(() => {
    if (!gmid || !sid) return;
    let active = true;
    // True once THIS match has returned markets — a later transient poll
    // failure must never trigger the no-markets redirect.
    let hadMarkets = false;
    setNoMarkets(false);
    // Per-EFFECT flag (not a shared ref): overlapping effect instances
    // (StrictMode double-mount, fast gmid navigation) would race on a shared
    // ref — one instance marks it done, the other skips, and the one that
    // fetched is already inactive, so the header never gets its data.
    let detailsDone = false;
    // Refresh match info every N polls (N * POLL_INTERVAL ≈ 30s) once the
    // initial details are in — keeps iplay current for the scorecard gate.
    let refreshTick = 0;
    const DETAILS_REFRESH_TICKS = Math.max(1, Math.round(DETAILS_REFRESH_MS / POLL_INTERVAL));
    // Client-side navigation to another match (sidebar link -> new gmid) must
    // refetch the header details and drop the previous match's data/markets —
    // otherwise the old match's name/time keeps showing over the new markets.
    // Route-state (initialGame) is kept only when it belongs to THIS gmid.
    setMatchData(initialGame && String(initialGame.gmid) === String(gmid) ? initialGame : null);
    setMarkets([]);

    const poll = async () => {
      try {
        const res = await fetchMatchPrivateData(gmid, sid);
        if (!active) return;
        const payload = res?.data;
        const data = payload?.data?.data || payload?.data;
        if (Array.isArray(data)) {
          hadMarkets = true;
          setMarkets(data.map((m) => applyMatchOddsLimits(m, sid))); setError(null);
        } else if (payload?.success === false && !hadMarkets) {
          // e.g. {success:false, error:"Request failed with status code 404"}
          setNoMarkets(true);
        }
      } catch (err) {
        if (!active) return;
        if (err?.response?.status && !hadMarkets) {
          // Server answered with 4xx/5xx — the game has no markets. (Pure
          // network blips have no response and just show the error state.)
          setNoMarkets(true);
        } else {
          setError(err?.message || 'Failed to fetch');
        }
      } finally {
        if (active) setLoading(false);
      }

      if (!detailsDone && active) {
        detailsDone = true;
        let found = null;
        try {
          const gRes = await fetchGameDetails(gmid, sid);
          const gp = gRes?.data;
          const arr = Array.isArray(gp?.data) ? gp.data
            : gp?.data?.data && Array.isArray(gp.data.data) ? gp.data.data
            : Array.isArray(gp) ? gp : null;
          if (arr?.length > 0) found = arr[0];
        } catch { /* virtual/e-cricket gmids 500 here — fall through to all-data */ }
        if (!found) {
          try { found = await findMatchInAllData(gmid, sid); } catch { /* keep route-state fallback */ }
        }
        if (active && found) setMatchData(found);
        else if (active && !found) detailsDone = false; // nothing found — retry next poll
      } else if (active && ++refreshTick >= DETAILS_REFRESH_TICKS) {
        // Periodic refresh of match info (iplay/tv flags flip when the match
        // goes live or ends) — fresh all-data, NOT the shared snapshot (that
        // cache can be stale when the home board isn't polling this sport).
        refreshTick = 0;
        try {
          const res = await fetchSportData(sid);
          const raw = res?.data?.data || res?.data;
          const t1 = Array.isArray(raw?.data?.t1) ? raw.data.t1 : [];
          const t2 = Array.isArray(raw?.data?.t2) ? raw.data.t2 : [];
          const fresh = [...t2, ...t1].find((m) => String(m.gmid) === String(gmid))
            || findRaceInTree(t1, gmid);
          if (active && fresh) setMatchData(fresh);
        } catch { /* keep current matchData */ }
      }
    };

    // Self-scheduling instead of setInterval: at a sub-second cadence the
    // upstream often takes longer than one tick, and setInterval would pile on
    // overlapping requests whose responses land out of order (older odds
    // overwriting newer). Each cycle starts POLL_INTERVAL after the previous
    // one BEGAN, or immediately if that already elapsed — so the interval is
    // honoured when the API keeps up and degrades to serial when it doesn't.
    let timer = null;
    const loop = async () => {
      const startedAt = performance.now();
      await poll();
      if (!active) return;
      timer = setTimeout(loop, Math.max(0, POLL_INTERVAL - (performance.now() - startedAt)));
    };

    setLoading(true);
    loop();
    return () => { active = false; clearTimeout(timer); };
  }, [gmid, sid]); // eslint-disable-line react-hooks/exhaustive-deps

  return { matchData, markets, loading, error, noMarkets };
}
