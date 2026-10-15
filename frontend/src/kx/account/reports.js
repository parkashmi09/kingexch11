import { useEffect, useState } from 'react';
import { refPost, SITE_KEY } from '../refApi';

// What the reference's report pages (statement, bet history, P&L, rolling
// commission) share: their date defaults, the Data Source rule, the request
// range and the sport list.

const ymd = (d) => ({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() });

// The pages start from "yesterday" built field by field (today's day - 1, so
// day 0 on the 1st, as there) to today.
export function initialRange() {
  const t = new Date();
  return { start: { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() - 1 }, end: ymd(t) };
}

// The date pickers' window every report page sets: from the month before
// last's end (disableUntil) to today (disableSince).
export function reportWindow() {
  const t = new Date();
  return {
    disableUntil: { year: t.getFullYear(), month: t.getMonth(), day: t.getDate() - 15 },
    disableSince: { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() + 1 },
  };
}

// moment().subtract(n, 'months'): the same day n months back, clamped to that
// month's last day.
function monthsAgo(n) {
  const t = new Date();
  const last = new Date(t.getFullYear(), t.getMonth() - n + 1, 0).getDate();
  return new Date(t.getFullYear(), t.getMonth() - n, Math.min(t.getDate(), last));
}

// backendService.dateManager(): choosing a Data Source moves the start date
// (LIVE today, BACKUP three months back, OLD a year back); the end stays.
export function dateManager(source) {
  if (source === 'BACKUP') return ymd(monthsAgo(3));
  if (source === 'LIVE') return ymd(new Date());
  return ymd(monthsAgo(12));
}

// getStartDate()/getEndDate(): the start day's midnight to the end day's 23:59.
export const startOf = (d) => new Date(d.year, d.month - 1, d.day);
export function endOf(d) {
  const e = new Date(d.year, d.month - 1, d.day);
  e.setHours(23, 59, 0, 0);
  return e;
}

// The reference's sport list (SportsList, cached a day), less 66103.
export function useRefSports() {
  const [sports, setSports] = useState([]);
  useEffect(() => {
    let live = true;
    refPost('/api/exchange/sports/sportsList', { key: SITE_KEY }, 1440)
      .then((res) => live && setSports((res?.data || []).filter((s) => s.sportId !== '66103')))
      .catch(() => {});
    return () => { live = false; };
  }, []);
  return sports;
}

// The reference's sport ids → this app's (racing is 7/4339 there, 10/65 here).
const OUR_SPORT = { 4: 4, 2: 2, 1: 1, 7: 10, 4339: 65 };
export const ourSportId = (refId) => OUR_SPORT[refId] ?? null;

// Angular's number pipe with its default '1.0-3'.
export const ngNum = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 3 });
