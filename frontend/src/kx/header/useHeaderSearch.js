import { useMemo, useState } from 'react';
import { getSportSnapshot } from '../../hooks/sportDataStore';

// The sports the header search looks through, in the reference's order.
const SEARCH_SPORTS = [
  { sid: 4, name: 'Cricket' },
  { sid: 1, name: 'Soccer' },
  { sid: 2, name: 'Tennis' },
];

/**
 * The header's event search. The reference filters an event list it keeps for
 * this; here the list is whatever the shared per-sport store has already loaded
 * (the home board and sport pages fill it), so searching never fires requests
 * of its own.
 */
export default function useHeaderSearch() {
  const [value, setValue] = useState('');
  const results = useMemo(() => {
    const term = value.trim().toLowerCase();
    if (!term) return [];
    return SEARCH_SPORTS.flatMap(({ sid, name }) =>
      (getSportSnapshot(sid)?.data || [])
        .filter((ev) => ev?.gmid && String(ev.ename || '').toLowerCase().includes(term))
        .map((ev) => ({ sid, sportName: name, gmid: ev.gmid, eventName: ev.ename, date: ev.stime || '' })),
    );
  }, [value]);
  return { value, setValue, results };
}
