// The reference's own public feeds, for the screens our tenexch backend has no
// data for (lottery markets, Tips & Previews news). Its API answers any origin
// (Access-Control-Allow-Origin: *) and needs no session for these reads.
const REF_API = 'https://kingexch111.com';

// The reference's siteKey, sent with the reads that take one.
export const SITE_KEY = '2';

// getDataFromServices' cache: a feed with a lifetime (minutes) is answered from
// the last response until it expires; 0 always refetches.
const cache = new Map();

export async function refPost(path, body = {}, minutes = 0) {
  const key = path + JSON.stringify(body);
  const hit = cache.get(key);
  if (minutes && hit && hit.until > Date.now()) return hit.data;
  const res = await fetch(REF_API + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  const data = await res.json();
  if (minutes) cache.set(key, { data, until: Date.now() + minutes * 60000 });
  return data;
}

// Angular's date pipe, in local time like the pipe, for the tokens these
// screens use: yyyy (year), YYYY (week-numbering year), MMM, MM, dd, d, HH, H,
// hh, h, mm, ss, a.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function ngDate(value, format) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  const tokens = {
    yyyy: () => d.getFullYear(),
    // The ISO week's year: the year its Thursday falls in.
    YYYY: () => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3 - ((d.getDay() + 6) % 7)).getFullYear(),
    MMM: () => MONTHS[d.getMonth()],
    MM: () => pad(d.getMonth() + 1),
    dd: () => pad(d.getDate()),
    d: () => d.getDate(),
    HH: () => pad(d.getHours()),
    H: () => d.getHours(),
    hh: () => pad(d.getHours() % 12 || 12),
    h: () => d.getHours() % 12 || 12,
    mm: () => pad(d.getMinutes()),
    ss: () => pad(d.getSeconds()),
    a: () => (d.getHours() < 12 ? 'AM' : 'PM'),
  };
  return format.replace(/yyyy|YYYY|MMM|MM|dd|d|HH|H|hh|h|mm|ss|a/g, (t) => tokens[t]());
}

// Angular's number pipe with '1.2-2'.
export const ngNumber = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
