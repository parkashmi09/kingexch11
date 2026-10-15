// Our match feed (/user/cricket/get-match-private-data) reshaped into the
// reference's market model, so app-market-details renders it as-is:
//
//   { exMarketId, marketName, marketType, oddsType, popular, min, max, news,
//     oddsData: { status, totalMatched, runners: [{ selectionId, status,
//       price: { back: [{ price, size }…], lay: […] } }] },
//     runnersData: { [selectionId]: name }, _market, _section }
//
// Ladder books (gtype "match" — Match Odds; "match1" — the bookmaker books)
// keep one entry per market. The fancy family (fancy, odd/even, khado, the
// cricket-casino lines) is one entry per LINE, as the reference lists them.

// Section statuses → the reference's market statuses.
function lineStatus(market, section) {
  const g = String(section?.gstatus || '').toUpperCase().replace(/[\s_]+/g, '');
  if (g === 'SUSPENDED') return 'SUSPENDED';
  if (g === 'BALLRUNNING' || g === 'BALLRUN') return 'BALLRUN';
  return String(market.status || 'OPEN').toUpperCase();
}

// "back1".."back3" / "lay1".."lay3" → the reference's best-first arrays. A 0
// price is the feed's empty level. The reference's exchange (Match Odds) data
// has no entry there; its bookmaker and fancy data carry the 0 and print it.
function ladder(section, keepZero) {
  const side = (type) => [1, 2, 3].map((n) => {
    const o = (section.odds || []).find((x) => x.oname === `${type}${n}`)
      ?? (n === 1 ? (section.odds || []).find((x) => x.otype === type) : null);
    if (!o || (!keepZero && !(Number(o.odds) > 0))) return null;
    return { price: Number(o.odds) || 0, size: Number(o.size) || 0 };
  });
  return { back: side('back'), lay: side('lay') };
}

const LADDER_NAMES = { MATCH_ODDS: 'Match Odds' };

// The fancy tabs (the reference's fancyMarketList ids) each line falls under.
function fancyType(market) {
  const g = String(market.gtype || '').toLowerCase();
  const name = String(market.mname || '').toLowerCase();
  if (g === 'khado') return 'Khado';
  if (/ball\s*by\s*ball/.test(name)) return 'Ballbyball';
  if (g === 'meter') return 'Meter';
  if (/line/.test(name)) return 'Linemarket';
  return 'Fancy';
}

export function toModel(markets) {
  const ladders = [];
  const fancy = [];
  for (const m of markets || []) {
    const g = String(m.gtype || '').toLowerCase();
    if (g === 'match' || g === 'match1') {
      // Tied Match is a decimal-odds book of the Match Odds family (this app
      // classifies it so everywhere); it takes the exchange card.
      const isBook = g === 'match1' && !/tied/i.test(m.mname);
      // The bookmaker proper quotes per 100 (44 = 1.44): the reference's
      // "Bookmakers-2", whose stake preview reads price / 100. Other match1
      // books (Tied Match) quote decimal odds.
      const per100 = isBook && /bookmaker/i.test(m.mname);
      ladders.push({
        exMarketId: String(m.mid),
        marketName: LADDER_NAMES[m.mname] || m.mname,
        marketType: per100 ? 'Bookmakers-2' : isBook ? 'Bookmakers' : 'MATCH_ODDS',
        oddsType: isBook ? 'BOOKMAKERS' : 'MATCH_ODDS',
        popular: true,
        min: m.min,
        max: m.max,
        news: m.rem || '',
        oddsData: {
          status: String(m.status || 'OPEN').toUpperCase(),
          totalMatched: 0,
          runners: (m.section || []).map((s) => ({
            selectionId: String(s.sid),
            status: String(s.gstatus || '').toUpperCase() === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
            price: ladder(s, isBook),
            _section: s,
          })),
        },
        runnersData: Object.fromEntries((m.section || []).map((s) => [String(s.sid), s.nat])),
        _market: m,
      });
      continue;
    }
    for (const s of m.section || []) {
      fancy.push({
        exMarketId: `${m.mid}_${s.sid}`,
        marketName: s.nat,
        marketType: fancyType(m),
        oddsType: 'FANCY',
        min: s.min || m.min,
        max: s.max || m.max,
        news: s.rem || '',
        isSuperFancy: false,
        oddsData: {
          status: lineStatus(m, s),
          runners: [{ selectionId: String(s.sid), price: ladder(s, true), _section: s }],
        },
        _market: m,
        _section: s,
      });
    }
  }
  return { ladders, fancy };
}

// shortNumber: 2300 → "2.3K", 74100000 → "74.1M"; below 1000 it is the number.
export function shortNumber(t) {
  if (t == null || Number.isNaN(Number(t))) return '';
  const n = Number(t);
  if (n === 0) return '0';
  let l = Math.abs(n);
  let key = '';
  for (const [k, v] of [['Q', 1e15], ['T', 1e12], ['B', 1e9], ['M', 1e6], ['K', 1e3]]) {
    const r = Math.round((l / v) * 10) / 10;
    if (r >= 1) { l = r; key = k; break; }
  }
  return (n < 0 ? '-' : '') + l + key;
}

// The match's start as a Date. The feed's "10/14/2026 1:30:00 PM" is the
// exchange's own clock, read as local time like the reference's eventTime.
export function startDate(stime) {
  const m = String(stime || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!m) return null;
  let h = Number(m[4]);
  const ap = (m[7] || '').toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]), h, Number(m[5]), Number(m[6] || 0));
}

const pad = (n) => String(n).padStart(2, '0');

// DatePipe "dd-MM-YYYY hh:mm:ss a".
export function gameTime(d) {
  if (!d) return '';
  const h = d.getHours() % 12 || 12;
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(h)}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
}

// The countdown pipe: "hh:mm:ss" until the start, then "0".
export function countdown(d, now = Date.now()) {
  if (!d) return 'Invalid date';
  const z = Math.max(d.getTime() - now, 0);
  const s = `${pad(Math.floor(z / 36e5))}:${pad(Math.floor((z % 36e5) / 6e4))}:${pad(Math.floor((z % 6e4) / 1e3))}`;
  return s === '00:00:00' ? '0' : s;
}
