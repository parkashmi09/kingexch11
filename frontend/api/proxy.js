// Same-origin proxy for the backend, used by the Vercel deployment.
//
// The backend only answers CORS for origins on its whitelist, so a new domain
// (kingexch11.vercel.app, a preview URL, a custom domain) had every API call
// and the socket blocked. The browser instead calls /api/* and /socket.io/* on
// its own origin; vercel.json rewrites those here, and this forwards them
// without the browser's Origin header, which the backend accepts from any
// server-to-server caller. Same idea as the Vite dev proxy in vite.config.js.

const TARGET = (process.env.API_PROXY_TARGET || 'https://apitenexch.codefactory.games').replace(/\/+$/, '');

// Request headers that describe the browser hop, not the request itself.
const DROP_REQUEST = ['host', 'origin', 'referer', 'connection', 'content-length', 'accept-encoding'];
// fetch() has already decoded the body and works out its own length.
const DROP_RESPONSE = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];

export const config = { maxDuration: 60 };

export default {
  async fetch(request) {
    const url = new URL(request.url);
    // vercel.json passes the original prefix and path as query parameters.
    const prefix = url.searchParams.get('__prefix') === 'socket.io' ? 'socket.io' : 'api';
    const path = url.searchParams.get('__path') || '';
    url.searchParams.delete('__prefix');
    url.searchParams.delete('__path');
    const query = url.searchParams.toString();
    const upstream = `${TARGET}/${prefix}/${path}${query ? `?${query}` : ''}`;

    const headers = new Headers(request.headers);
    DROP_REQUEST.forEach((h) => headers.delete(h));
    [...headers.keys()].filter((h) => h.startsWith('x-vercel-')).forEach((h) => headers.delete(h));
    // Keep the player's IP visible to the backend (activity log, rate limits).
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (ip) {
      headers.set('x-forwarded-for', ip);
      headers.set('x-real-ip', ip);
    }

    const hasBody = !['GET', 'HEAD'].includes(request.method);
    let res;
    try {
      res = await fetch(upstream, {
        method: request.method,
        headers,
        body: hasBody ? await request.arrayBuffer() : undefined,
        redirect: 'manual',
      });
    } catch {
      return Response.json({ success: false, message: 'Server is unreachable. Please try again.' }, { status: 502 });
    }

    const out = new Headers(res.headers);
    DROP_RESPONSE.forEach((h) => out.delete(h));
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
  },
};
