import { useCallback, useSyncExternalStore } from 'react';
import { fetchSportsTree } from '../apiservices/sportsService';

// useSportsTree — the sidebar's Sport → Competition → Match tree, from ONE
// call to /user/all/sports/tree (returns ALL 37 sports + racing at once, so
// no per-sport all-data calls are ever needed for the sidebar).
//
// Module-level cache shared across every mount:
//   - one in-flight request max (concurrent mounts dedupe)
//   - result cached for TTL — remounts within it cost zero network
//   - first fetch held until ~3s after boot so the home board's data loads first
//   - on failure retries with backoff, then gives up quietly (loading -> false
//     so the sidebar falls back to its static sport names).
const TTL = 60_000;
const INITIAL_FETCH_AT = Date.now() + 3200;

const store = {
  snapshot: { sports: [], racing: [], loading: true },
  subs: new Set(),
  inflight: false,
  loadedAt: 0,
  timer: null,
};

function notify() {
  store.subs.forEach((fn) => fn());
}

function fetchTree(retry = 0) {
  if (store.inflight) return;
  store.inflight = true;
  fetchSportsTree()
    .then((res) => {
      store.inflight = false;
      // The body nests the payload a variable number of `data` levels deep
      // ({ success, data: { data: { data: { t1, t2 } } } } today) — unwrap
      // until t1 shows up instead of hardcoding the depth.
      let inner = res?.data;
      for (let i = 0; i < 5 && inner && !Array.isArray(inner.t1); i++) inner = inner.data;
      inner = inner || {};
      store.loadedAt = Date.now();
      store.snapshot = {
        sports: Array.isArray(inner.t1) ? inner.t1 : [],
        racing: Array.isArray(inner.t2) ? inner.t2 : [],
        loading: false,
      };
      notify();
    })
    .catch((err) => {
      store.inflight = false;
      if (store.subs.size > 0 && retry < 5) {
        const delay = Math.min(1000 * (retry + 1), 5000);
        console.warn(`Sports tree fetch failed (attempt ${retry + 1}), retrying in ${delay}ms...`, err.message);
        store.timer = setTimeout(() => fetchTree(retry + 1), delay);
      } else if (store.loadedAt === 0 && store.snapshot.loading) {
        store.snapshot = { ...store.snapshot, loading: false };
        notify();
      }
    });
}

function ensureFresh() {
  if (store.inflight || store.timer) return;
  if (Date.now() - store.loadedAt < TTL) return;
  const delay = Math.max(0, INITIAL_FETCH_AT - Date.now());
  store.timer = setTimeout(() => {
    store.timer = null;
    fetchTree();
  }, delay);
}

export default function useSportsTree() {
  const subscribe = useCallback((cb) => {
    store.subs.add(cb);
    ensureFresh();
    return () => {
      store.subs.delete(cb);
      if (store.subs.size === 0 && store.timer) {
        clearTimeout(store.timer);
        store.timer = null;
      }
    };
  }, []);
  return useSyncExternalStore(subscribe, () => store.snapshot);
}
