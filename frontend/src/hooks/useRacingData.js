import { useState, useEffect } from 'react';
import { fetchMatchPrivateData, fetchSportData } from '../apiservices/sportsService';

const POLL_INTERVAL = 2000;

// Racing's all-data is nested COUNTRY > VENUE > RACE, unlike every other
// sport's flat t1/t2 match list:
//   t1: [{ cname: "AU", cid, children: [{ ename: "Geelong",
//          children: [{ gmid, stime, iplay }] }] }]
// The race objects carry no name of their own — the banner's "AU > Geelong"
// comes from the two levels above them. get-sport-data-by-id is dead for
// racing gmids, so this walk is the only source for the header.
// The private-data body nests a variable number of `data` levels, and says
// "no markets" in two different ways:
//   markets    { success, data: { success, data: [ …markets ] } }
//   no record  { success, data: { success, data:
//                 { data: null, msg: "No Record Found.", status: 300, success: false } } }
// The no-record body arrives as HTTP 200 with success:true at BOTH outer
// levels — only the innermost object reports the failure — so unwrap until an
// array turns up and treat an explicit success:false at ANY depth as
// "this race has no markets" rather than a transport error.
export function readMarkets(body) {
  let node = body;
  let failed = false;
  for (let i = 0; i < 5 && node && typeof node === 'object'; i++) {
    if (Array.isArray(node)) return { list: node, noRecord: false };
    if (node.success === false) failed = true;
    node = node.data;
  }
  if (Array.isArray(node)) return { list: node, noRecord: false };
  return { list: null, noRecord: failed };
}

function findRace(raw, gmid) {
  const t1 = Array.isArray(raw?.data?.t1) ? raw.data.t1 : [];
  for (const country of t1) {
    for (const venue of country.children || []) {
      for (const race of venue.children || []) {
        if (String(race.gmid) === String(gmid)) {
          return { cname: country.cname || '', venue: venue.ename || '', stime: race.stime || '', iplay: race.iplay };
        }
      }
    }
  }
  return null;
}

/** Live markets + banner header (country/venue/start time) for one race. */
export default function useRacingData(gmid, sid) {
  const [markets, setMarkets] = useState([]);
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Set when the feed definitively has no markets for this gmid. Races retire
  // within minutes of finishing, and the API then answers HTTP 500 with
  // {success:false, error:"Request failed with status code 404"} — so this
  // fires far more often here than on a cricket match.
  const [noMarkets, setNoMarkets] = useState(false);

  useEffect(() => {
    if (!gmid || !sid) return;
    let active = true;
    let headerDone = false;
    // True once THIS race has returned markets — a later transient poll
    // failure must never bounce the user home mid-race.
    let hadMarkets = false;
    setMarkets([]);
    setRace(null);
    setNoMarkets(false);
    setLoading(true);

    const poll = async () => {
      try {
        const res = await fetchMatchPrivateData(gmid, sid);
        if (!active) return;
        const { list, noRecord } = readMarkets(res?.data);
        if (list) {
          hadMarkets = true;
          setMarkets(list);
          setError(null);
        } else if (noRecord && !hadMarkets) {
          setNoMarkets(true);
        }
      } catch (err) {
        if (!active) return;
        if (err?.response?.status && !hadMarkets) {
          // Server answered 4xx/5xx — the race is over/unknown. (A pure
          // network blip has no response and just shows the error state.)
          setNoMarkets(true);
        } else {
          setError(err);
        }
      } finally {
        if (active) setLoading(false);
      }

      // Header comes from ONE all-data call, not the 2s poll — a race's
      // country/venue/time never change while the page is open.
      if (!headerDone && active) {
        headerDone = true;
        try {
          const res = await fetchSportData(sid);
          const found = findRace(res?.data?.data || res?.data, gmid);
          if (active && found) setRace(found);
          else headerDone = false; // race not listed yet — retry next poll
        } catch {
          headerDone = false;
        }
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => { active = false; clearInterval(id); };
  }, [gmid, sid]);

  return { markets, race, loading, error, noMarkets };
}
