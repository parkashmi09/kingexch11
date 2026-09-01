import { fetchSportData } from '../apiservices/sportsService';

// Shared per-sport store for the /user/cricket/all-data poll.
//
// Before this store every component called useSportData independently, so two
// components viewing the same sport (e.g. the home In-Play cricket board + the
// cricket detail strip) each ran their OWN 5s poll — duplicate identical API
// calls. Now all subscribers of a sid share ONE cache entry and ONE poll loop:
//   - the poll runs only while at least one polling subscriber is mounted
//   - concurrent fetches for the same sid are deduped (single in-flight)
//   - remounts / tab returns serve the cached board instantly (no "Loading...")
//     while a fresh fetch updates it in the background
//   - passive subscribers (sidebar accordions) reuse whatever a poller already
//     fetched for free, and only trigger their own one-shot fetch when nothing
//     has loaded that sid yet.
const POLL_INTERVAL = 5000;

// The very first data fetch on page load / refresh is held back until 3s after
// the app boots (same boot choreography as before). Tab switches happen long
// after this, so they fetch immediately (delay resolves to 0).
const INITIAL_FETCH_AT = Date.now() + 3000;

const entries = new Map();

function getEntry(sid) {
  let e = entries.get(sid);
  if (!e) {
    e = {
      sid,
      loaded: false,        // first successful fetch done — loading = !loaded
      retryCount: 0,
      // Stable object identity between data changes — required by
      // useSyncExternalStore (a new object every read = infinite re-render).
      snapshot: { data: [], tournaments: [], loading: true, error: null },
      subs: new Set(),
      pollers: 0,
      timer: null,
      inflight: false,
    };
    entries.set(sid, e);
  }
  return e;
}

function commit(e, t1, t2) {
  // Live (iplay) first — same ordering contract the old hook returned.
  const data = [...t1].sort((a, b) => (b.iplay === true) - (a.iplay === true));
  e.snapshot = {
    data,
    tournaments: Array.isArray(t2) ? t2 : e.snapshot.tournaments,
    loading: false,
    error: null,
  };
  e.subs.forEach((fn) => fn());
}

function schedule(e, delay) {
  clearTimeout(e.timer);
  e.timer = setTimeout(() => fetchNow(e), delay);
}

function fetchNow(e) {
  if (e.inflight) return;
  e.inflight = true;

  fetchSportData(e.sid)
    .then((res) => {
      e.inflight = false;
      const raw = res?.data?.data || res?.data;
      const t1 = raw?.data?.t1;
      if (raw?.success && Array.isArray(t1)) {
        e.loaded = true;
        e.retryCount = 0;
        commit(e, t1, raw?.data?.t2);
        if (e.pollers > 0) schedule(e, POLL_INTERVAL);
      } else {
        throw new Error(raw?.msg || 'No data');
      }
    })
    .catch((err) => {
      e.inflight = false;
      if (e.subs.size === 0) return; // nobody cares anymore
      if (!e.loaded) {
        // Keep retrying until the first data arrives (backoff capped at 5s).
        const delay = Math.min(1000 * (e.retryCount + 1), 5000);
        e.retryCount += 1;
        console.warn(`Sport ${e.sid} data fetch failed (attempt ${e.retryCount}), retrying in ${delay}ms...`, err.message);
        schedule(e, delay);
      } else if (e.pollers > 0) {
        // Poll failures keep existing data and just try again next tick.
        schedule(e, POLL_INTERVAL);
      }
    });
}

// Subscribe a component to a sport's data. `poll: true` (boards) keeps the 5s
// loop alive; `poll: false` (sidebar) is passive — it reads the shared cache
// and only triggers a one-shot fetch when that sid was never loaded.
export function subscribeSport(sid, cb, { poll = true } = {}) {
  const e = getEntry(sid);
  e.subs.add(cb);

  const startDelay = Math.max(0, INITIAL_FETCH_AT - Date.now());
  if (poll) {
    e.pollers += 1;
    if (e.pollers === 1) schedule(e, startDelay); // first poller (re)starts the loop
  } else if (!e.loaded && !e.inflight && !e.timer) {
    schedule(e, startDelay); // lazy one-shot for a never-loaded sid
  }

  return () => {
    e.subs.delete(cb);
    if (poll) e.pollers -= 1;
    if (e.subs.size === 0) {
      // Last subscriber gone — stop all timers for this sid.
      clearTimeout(e.timer);
      e.timer = null;
    } else if (e.pollers === 0 && e.loaded) {
      // Only passive subscribers remain and data is in — no polling needed.
      clearTimeout(e.timer);
      e.timer = null;
    }
  };
}

export function getSportSnapshot(sid) {
  return getEntry(sid).snapshot;
}

// Force an immediate refetch (tab click / reloadKey bump). Existing data keeps
// showing while the fresh response loads — no flash back to "Loading...".
export function refreshSport(sid) {
  const e = getEntry(sid);
  clearTimeout(e.timer);
  e.timer = null;
  fetchNow(e);
}
