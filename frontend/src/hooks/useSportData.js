import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { subscribeSport, getSportSnapshot, refreshSport } from './sportDataStore';

// useSportData — same public contract as always ({ data, tournaments, loading,
// error }, data sorted live-first, 5s poll, 3s boot delay, reloadKey forces a
// refetch) but now backed by the shared per-sport store (sportDataStore):
//   - every component viewing the same sid shares ONE poll + ONE cache
//   - returning to an already-loaded sport renders its cached board instantly
//     (loading is only true until that sid's FIRST data ever arrives) while a
//     fresh fetch updates it in the background — no more per-mount cold start.
// opts.poll=false → passive subscriber: ONE fetch when the sid was never
// loaded, then only the shared cache (no 5s loop). A reloadKey bump still
// forces a fresh fetch. Used by the home cricket board (fetch-once decision).
export default function useSportData(sid, reloadKey = 0, { poll = true } = {}) {
  const subscribe = useCallback(
    (cb) => subscribeSport(sid, cb, { poll }),
    [sid, poll]
  );
  const snapshot = useSyncExternalStore(subscribe, () => getSportSnapshot(sid));

  // Every reloadKey bump (tab click, even re-clicking the active tab) forces an
  // immediate refetch — same behaviour as before, minus the data blanking.
  useEffect(() => {
    if (reloadKey > 0) refreshSport(sid);
  }, [sid, reloadKey]);

  return snapshot;
}
