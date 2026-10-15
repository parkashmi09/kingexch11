// The API's secure channel ("tenexch-cs-v1"). The backend encrypts its
// responses and socket pushes, and answers any request without a live session
// with 409 { code: 'CS_REHANDSHAKE' }. Ported from the live tenexch client.
//
// Handshake: POST /cs/handshake { pub, inflate } with an ephemeral ECDH P-256
// public key → { enabled, sid, pub }. Both sides derive an AES-256-GCM key
// with HKDF-SHA256 (salt = sid, info = "tenexch-cs-v1"). Every request then
// carries `X-CS-Id: <sid>`; a response with `x-enc: 1` is a frame:
//
//   [1, flags, iv(12), ciphertext]        session frame (the session key)
//   [2, flags, keyId(4), iv(12), cipher]  broadcast frame (a key the socket
//                                         hands out in `cs:bk` events)
//
// The header bytes are the GCM additional data; flags bit 0 = the plaintext
// is deflate-raw compressed. The plaintext is JSON.
//
// The crypto runs on WebCrypto, which browsers only expose on secure origins
// (https, localhost). On plain http — the dev server opened by LAN IP, e.g.
// from a phone — the same primitives come from @noble instead, loaded only then.

const subtle = globalThis.crypto?.subtle;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const INFO = encoder.encode('tenexch-cs-v1');
const CURVE = { name: 'ECDH', namedCurve: 'P-256' };

const toBase64 = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const fromBase64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const toBytes = (d) =>
  d instanceof Uint8Array ? d
    : ArrayBuffer.isView(d) ? new Uint8Array(d.buffer, d.byteOffset, d.byteLength)
      : new Uint8Array(d);
const isBinary = (d) => d instanceof ArrayBuffer || ArrayBuffer.isView(d);

const canInflate = (() => {
  try { new DecompressionStream('deflate-raw'); return true; } catch { return false; }
})();
const inflate = async (bytes) => {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

// keyPair() → { privateKey, pub (raw uncompressed point) };
// sessionKey(privateKey, serverPub, sid) and importKey(raw) → an AES key;
// decrypt(key, iv, aad, ciphertext) → plaintext bytes.
const webCrypto = {
  async keyPair() {
    const pair = await subtle.generateKey(CURVE, false, ['deriveBits']);
    return { privateKey: pair.privateKey, pub: new Uint8Array(await subtle.exportKey('raw', pair.publicKey)) };
  },
  async sessionKey(privateKey, serverPub, sid) {
    const peer = await subtle.importKey('raw', serverPub, CURVE, false, []);
    const bits = await subtle.deriveBits({ name: 'ECDH', public: peer }, privateKey, 256);
    const hkdf = await subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
    return subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: encoder.encode(sid), info: INFO },
      hkdf,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );
  },
  importKey: (raw) => subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']),
  decrypt: async (key, iv, additionalData, data) =>
    new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv, additionalData }, key, data)),
};

async function loadNoble() {
  const [{ p256 }, { hkdf }, { sha256 }, { gcm }] = await Promise.all([
    import('@noble/curves/p256'),
    import('@noble/hashes/hkdf'),
    import('@noble/hashes/sha2'),
    import('@noble/ciphers/aes'),
  ]);
  return {
    async keyPair() {
      const privateKey = p256.utils.randomPrivateKey();
      return { privateKey, pub: p256.getPublicKey(privateKey, false) };
    },
    async sessionKey(privateKey, serverPub, sid) {
      // WebCrypto's ECDH deriveBits(256) is the shared point's x coordinate.
      const x = p256.getSharedSecret(privateKey, serverPub, false).slice(1, 33);
      return hkdf(sha256, x, encoder.encode(sid), INFO, 32);
    },
    importKey: async (raw) => raw,
    decrypt: async (key, iv, aad, data) => gcm(key, iv, aad).decrypt(data),
  };
}

let enginePromise = null;
const getEngine = () => (enginePromise ||= subtle ? Promise.resolve(webCrypto) : loadNoble());

async function decryptFrame(data, sessionKey, broadcastKey) {
  const engine = await getEngine();
  const frame = toBytes(data);
  let headerLength;
  let key;
  if (frame[0] === 1) {
    headerLength = 2;
    key = sessionKey;
  } else if (frame[0] === 2) {
    headerLength = 6;
    key = broadcastKey?.(new DataView(frame.buffer, frame.byteOffset + 2, 4).getUint32(0));
  } else {
    throw new Error('secure channel: unknown frame');
  }
  if (!key) throw new Error('secure channel: no key for frame');
  const plain = await engine.decrypt(
    key,
    frame.subarray(headerLength, headerLength + 12),
    frame.subarray(0, headerLength),
    frame.subarray(headerLength + 12),
  );
  return JSON.parse(decoder.decode(frame[1] & 1 ? await inflate(plain) : plain));
}

export function createSecureChannel({ handshakeUrl }) {
  let session = null;
  let pending = null;
  const broadcastKeys = new Map();

  // One handshake at a time; `force` replaces a session the server dropped.
  const ensureSession = (force = false) => {
    if (session && !force) return Promise.resolve(session);
    if (!pending) {
      pending = (async () => {
        const engine = await getEngine();
        const pair = await engine.keyPair();
        const pub = toBase64(pair.pub);
        const res = await fetch(handshakeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pub, inflate: canInflate }),
        });
        const body = await res.json();
        session = body.enabled
          ? { enabled: true, sid: body.sid, key: await engine.sessionKey(pair.privateKey, fromBase64(body.pub), body.sid) }
          : { enabled: false };
        return session;
      })().finally(() => { pending = null; });
    }
    return pending;
  };

  const decodeResponse = async (res) => {
    const bytes = toBytes(res.data);
    if (String(res.headers?.['x-enc']) === '1') return decryptFrame(bytes, session?.key);
    const text = decoder.decode(bytes);
    try { return text && JSON.parse(text); } catch { return text; }
  };

  // Requests ride the session and take the body as bytes, so an encrypted
  // reply can be decrypted before anyone reads it. A 409 CS_REHANDSHAKE (the
  // server forgot the session) re-handshakes and retries once.
  const installHttp = (client) => {
    client.interceptors.request.use(async (config) => {
      const s = await ensureSession().catch(() => null);
      if (s?.enabled) {
        config.headers['X-CS-Id'] = s.sid;
        if (!config.responseType) {
          config.responseType = 'arraybuffer';
          config._cs = true;
        }
      }
      return config;
    });
    client.interceptors.response.use(
      async (res) => {
        if (res.config?._cs) res.data = await decodeResponse(res);
        return res;
      },
      async (error) => {
        const { config, response } = error;
        if (response && config?._cs) response.data = await decodeResponse(response).catch(() => response.data);
        if (response?.status === 409 && response.data?.code === 'CS_REHANDSHAKE' && config && !config._csRetried) {
          await ensureSession(true);
          return client.request({
            ...config,
            _csRetried: true,
            _cs: false,
            responseType: config._cs ? undefined : config.responseType,
          });
        }
        return Promise.reject(error);
      },
    );
    return client;
  };

  // socket.io `auth` as a callback, so every (re)connect carries the current sid.
  const socketAuth = (auth = {}) => (cb) => {
    ensureSession()
      .then((s) => cb({ ...auth, ...(s?.enabled ? { sid: s.sid } : {}) }))
      .catch(() => cb(auth));
  };

  // Decrypts binary event payloads before the app's listeners see them, in
  // arrival order. `cs:bk` delivers the broadcast keys.
  const LIFECYCLE = new Set(['connect', 'disconnect', 'connect_error', 'error']);
  const secureSocket = (socket) => {
    const on = socket.on.bind(socket);
    const off = socket.off.bind(socket);
    const wrapped = new Map(); // listener → event → wrapper
    let queue = Promise.resolve();
    const enqueue = (job) => {
      queue = queue.then(job).catch((err) => console.error('[secure socket]', err));
    };

    on('cs:bk', (payload) => enqueue(async () => {
      const { keys } = await decryptFrame(payload, session?.key);
      for (const k of keys) {
        if (!broadcastKeys.has(k.id)) {
          broadcastKeys.set(k.id, await (await getEngine()).importKey(fromBase64(k.k)));
        }
      }
    }));
    on('connect_error', (err) => {
      if (err?.message === 'CS_REHANDSHAKE') ensureSession(true).then(() => socket.connect()).catch(() => {});
    });

    socket.on = (event, listener) => {
      if (LIFECYCLE.has(event)) return on(event, listener);
      const wrapper = (...args) => enqueue(async () => {
        const decoded = await Promise.all(args.map((a) => (
          isBinary(a) ? decryptFrame(a, session?.key, (id) => broadcastKeys.get(id)) : a
        )));
        listener(...decoded);
      });
      if (!wrapped.has(listener)) wrapped.set(listener, new Map());
      wrapped.get(listener).set(event, wrapper);
      return on(event, wrapper);
    };
    socket.off = (event, listener) => {
      if (!listener) return off(event);
      const wrapper = wrapped.get(listener)?.get(event);
      wrapped.get(listener)?.delete(event);
      return off(event, wrapper || listener);
    };
    return socket;
  };

  return { ensureSession, installHttp, socketAuth, secureSocket };
}
