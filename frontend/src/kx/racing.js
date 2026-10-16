// Racing, the reference's way. Its sport ids (7 horse, 4339 greyhound) are
// what its URLs carry; our feed's are 10 and 65. Our feed nests country →
// venue → race; the reference names countries by its own codes.
export const RACING = {
  7: { sid: 10, title: 'Horse Racing Schedule' },
  4339: { sid: 65, title: 'Greyhound Racing Schedule' },
};

// Our feed's racing sid → the reference's sport id, and a race's page at the
// reference's own address.
export const REF_SPORT = { 10: 7, 65: 4339 };
export const raceRoute = (sid, gmid) => `/horse-racing/inplayHorseGame/${gmid}/${REF_SPORT[sid]}`;

export const COUNTRY ={ AU: 'AUS', FR: 'FRA', ZA: 'RSA', IE: 'IRE', US: 'USA', NZ: 'NZL', AE: 'UAE' };
export const countryName = (code) => COUNTRY[code] || code;

// "10/14/2026 5:35:00 PM" — the exchange's clock, read as local time.
export function startDate(stime) {
  const m = String(stime || '').match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
  if (!m) return null;
  const h = (+m[4] % 12) + (/pm/i.test(m[7] || '') ? 12 : 0);
  return new Date(+m[3], +m[1] - 1, +m[2], m[7] ? h : +m[4], +m[5], +(m[6] || 0));
}

// The racing feed (/all-data for 10 or 65) → the reference's model:
// tournaments (countries) and events (meetings, each with its races).
export function racingModel(t1, sid) {
  const tournaments = [];
  const events = [];
  for (const country of t1 || []) {
    const id = String(country.cid ?? country.cname);
    tournaments.push({ id, name: countryName(country.cname) });
    for (const venue of country.children || []) {
      events.push({
        name: venue.ename,
        tournamentId: id,
        races: (venue.children || []).map((r) => ({
          id: r.gmid,
          name: venue.ename,
          inPlay: !!r.iplay,
          start: startDate(r.stime),
          route: raceRoute(sid, r.gmid),
        })),
      });
    }
  }
  return { tournaments, events };
}
