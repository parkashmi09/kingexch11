import { useState, useEffect } from 'react';
import { fetchSportsGameDetail } from '../apiservices/sportsService';

const POLL_INTERVAL = 5000;

// Polls the diamond v1 sports-gamedetailPrivate endpoint every 5s for the
// match header/meta (ename, cname, stime, iplay, tv, scard, bm…). Returns the
// meta row (or null). Header-only — markets still come from useMatchData.
// Body shape: { success, data: { data: [ {…meta} ], msg, status, success } }.
export default function useSportsGameDetail(gmid, etid) {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!gmid || !etid) return;
    let active = true;
    setMeta(null);

    const poll = async () => {
      try {
        const res = await fetchSportsGameDetail(gmid, etid);
        const arr = res?.data?.data?.data;
        const row = Array.isArray(arr) ? arr[0] : null;
        if (active && row) setMeta(row);
      } catch { /* keep last good meta on a transient failure */ }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => { active = false; clearInterval(id); };
  }, [gmid, etid]);

  return meta;
}
