// Every endpoint the app talks to is declared here and comes from .env — no
// host is hardcoded. A missing key resolves to '' rather than a baked-in
// default, so a bad deploy fails visibly instead of quietly reaching whatever
// server happened to be compiled into the bundle.
//
// A production build always calls the API on its own origin (/api, proxied to
// the backend by the host: vercel.json + api/proxy.js, or vite preview). The
// backend's CORS whitelist rejects any other site calling it directly, and a
// VITE_API_URL left in a host's dashboard would otherwise override
// .env.production and break every deploy. VITE_API_DIRECT=true opts out, for
// a domain the backend has whitelisted.
const DIRECT = !import.meta.env.PROD || import.meta.env.VITE_API_DIRECT === 'true';
export const API_URL = DIRECT ? import.meta.env.VITE_API_URL || '' : '/api';
// Socket host falls back to the API host (minus the /api suffix): a missing
// VITE_SOCKET_URL otherwise resolves to '' and socket.io silently connects to
// the PAGE origin (e.g. localhost:5173 in dev) — no call ever reaches the
// server and the header balance never updates in real time.
export const SOCKET_URL =
  (DIRECT && import.meta.env.VITE_SOCKET_URL) || API_URL.replace(/\/api\/?$/, '');
export const BRAND = import.meta.env.VITE_BRAND || 'tenexch';
export const SPORTS_STREAM_BASE = import.meta.env.VITE_SPORTS_STREAM_BASE || '';
export const SCORECARD_BASE = import.meta.env.VITE_SCORECARD_BASE || '';
// Casino game stream — read through here rather than straight from import.meta
// in the hook, so every endpoint in the app is declared in this one file.
export const CASINO_STREAM_BASE = import.meta.env.VITE_CASINO_STREAM_BASE || '';
// Live cricket score socket (Socket.IO v2 / EIO=3). providerId is always "1";
// the match gmid is sent as eventId. Emits summary_snapshot + summary_update.
export const SCORE_SOCKET_URL = import.meta.env.VITE_SCORE_SOCKET_URL || '';
export const BET_BUFFER_SECONDS = Number(import.meta.env.VITE_BET_BUFFER_SECONDS) || 10;
export const FANCY_BUFFER_SECONDS = Number(import.meta.env.VITE_FANCY_BUFFER_SECONDS) || 3;
export const CASINO_BUFFER_SECONDS = Number(import.meta.env.VITE_CASINO_BUFFER_SECONDS) || 5;

// Set brand attribute on html element
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-brand', BRAND);
}
