import { useEffect, useRef, useState } from 'react';
import { SCORE_SOCKET_URL } from '../config';

// ─── Live cricket score — raw Socket.IO v2 (Engine.IO v3) over WebSocket ──────
// The score provider runs Socket.IO v2 (handshake `?EIO=3`). Our app ships
// socket.io-client v4 which speaks EIO=4 and CANNOT talk to it, so we frame the
// few packets we need by hand — no dependency, no version clash.
//
// Engine.IO/Socket.IO v3 wire packets we handle:
//   "0{...}"  engine OPEN (sid, pingInterval)        → connection is up
//   "40"      socket.io CONNECT (default namespace)  → safe to emit
//   "2"       ping   (reply "3")   |   "3"  pong      → keepalive
//   "42[ev,payload]"  EVENT                           → the data we want
// We emit:  '42["subscribe_event",{eventId,providerId:"1"}]'
//           '2' every ~20s so the server doesn't drop us (pingInterval 25s).
//
// Returns the latest `summary.data` object (spnnation1, score1, balls, …) or
// null until the first summary_snapshot / summary_update arrives.
// config.js states the rule for every endpoint: a missing key resolves to '' so
// "a bad deploy fails visibly". This socket used to break that promise — an
// empty SCORE_SOCKET_URL made the URL relative (`/socket.io/?EIO=3…`), the
// WebSocket constructor threw, the catch below scheduled a retry, and the hook
// span every 2s forever with nothing in the console and no scorecard on screen.
// A config mistake looked exactly like "the socket stopped working".
//
// So the URL is validated once, up front: it has to be absolute and ws/wss (an
// https:// value is accepted and upgraded, which is the easy thing to get wrong
// in .env). Anything else is reported once and the hook stays idle instead of
// retrying something that can never connect.
function resolveSocketBase() {
  const raw = String(SCORE_SOCKET_URL || '').trim().replace(/\/+$/, '');
  if (!raw) return { error: 'VITE_SCORE_SOCKET_URL is not set' };
  if (/^wss?:\/\//i.test(raw)) return { base: raw };
  if (/^https:\/\//i.test(raw)) return { base: `wss://${raw.slice(8)}` };
  if (/^http:\/\//i.test(raw)) return { base: `ws://${raw.slice(7)}` };
  return { error: `VITE_SCORE_SOCKET_URL must be an absolute ws:// or wss:// URL (got "${raw}")` };
}

export default function useCricketScore(gmid, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!enabled || !gmid) { setData(null); return; }

    const { base, error } = resolveSocketBase();
    if (error) {
      // Loud and once per mount — this is a deploy/config fault, not a runtime
      // hiccup, so there is nothing to retry.
      console.error(`[cricket-score] live scorecard disabled: ${error}. ` +
        `Set it in frontend/.env (see .env.example) and restart the dev server.`);
      setData(null);
      return;
    }

    let closedByUs = false;
    let ws = null;
    let pingTimer = null;
    let retryTimer = null;
    const SUB = '42' + JSON.stringify(['subscribe_event', { eventId: String(gmid), providerId: '1' }]);

    const connect = () => {
      const url = `${base}/socket.io/?EIO=3&transport=websocket`;
      try { ws = new WebSocket(url); } catch { scheduleRetry(); return; }
      wsRef.current = ws;
      let subscribed = false;
      const subscribe = () => { if (!subscribed && ws.readyState === 1) { subscribed = true; ws.send(SUB); } };

      ws.onopen = () => {
        // Some deployments send "40" first, some don't — subscribe on a short
        // delay too, so we never miss the window.
        setTimeout(subscribe, 300);
        pingTimer = setInterval(() => { if (ws.readyState === 1) ws.send('2'); }, 20000);
      };

      ws.onmessage = (e) => {
        const m = typeof e.data === 'string' ? e.data : '';
        if (!m) return;
        if (m === '3') return;                       // pong
        if (m === '2') { ws.send('3'); return; }     // ping → pong
        if (m[0] === '0') return;                    // engine open
        if (m.startsWith('40')) { subscribe(); return; }
        if (m.startsWith('42')) {
          try {
            const [, payload] = JSON.parse(m.slice(2));
            const d = payload?.summary?.data;
            if (d && typeof d === 'object') setData(d);
          } catch { /* ignore malformed frame */ }
        }
      };

      ws.onclose = () => { cleanupSocket(); if (!closedByUs) scheduleRetry(); };
      ws.onerror = () => { try { ws.close(); } catch { /* noop */ } };
    };

    const cleanupSocket = () => {
      if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
    };
    const scheduleRetry = () => {
      if (closedByUs) return;
      retryTimer = setTimeout(connect, 2000);
    };

    connect();

    return () => {
      closedByUs = true;
      cleanupSocket();
      if (retryTimer) clearTimeout(retryTimer);
      if (ws) { try { ws.close(); } catch { /* noop */ } }
      wsRef.current = null;
    };
  }, [gmid, enabled]);

  return data;
}
