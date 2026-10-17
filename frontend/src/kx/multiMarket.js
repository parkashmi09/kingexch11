import { useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Multi Markets, the reference's way: the pinned events live in localStorage
// under "multiMarket_<userName>" as [{ sportId, eventid }], in pin order. A
// pin toggles its event in or out; logged out it goes to /login instead.
const subs = new Set();
const storageKey = (user) => `multiMarket_${user ?? ''}`;
const subscribe = (fn) => (subs.add(fn), () => subs.delete(fn));

function read(raw) {
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

const EMPTY = [];
let cache = { raw: null, list: EMPTY };
const parse = (raw) => {
  if (raw !== cache.raw) cache = { raw, list: raw ? read(raw) : EMPTY };
  return cache.list;
};

/** The logged-in user's pins, live. */
export function useMultiMarkets() {
  const user = useSelector((s) => s.user.user?.username);
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const raw = useSyncExternalStore(subscribe, () => (isAuth ? localStorage.getItem(storageKey(user)) : null));
  return parse(raw);
}

/** A board's pins: `on(id)` for the pin-on class, `toggle(id, sportId)` for its click. */
export function useMultiMarketPin() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.user.user?.username);
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const pins = useMultiMarkets();
  const on = (id) => pins.some((p) => p.eventid === String(id));
  const toggle = (id, sportId) => {
    if (!isAuth) return navigate('/login');
    const key = storageKey(user);
    const list = [...read(localStorage.getItem(key))];
    const at = list.findIndex((p) => p.sportId === String(sportId) && p.eventid === String(id));
    if (at !== -1) list.splice(at, 1);
    else list.push({ sportId: String(sportId), eventid: String(id) });
    localStorage.setItem(key, JSON.stringify(list));
    subs.forEach((fn) => fn());
  };
  return { on, toggle };
}
