// ─── Platform bet-buffer (admin-configurable) ────────────────────────────────
// GET /user/buffer-time exposes Owner.platform_configurations.buffer_time.
// The value is fetched lazily on the first submit and cached for a minute so
// the admin can retune it without a frontend redeploy — 0 / fetch-failure
// falls back to the env default (BET_BUFFER_SECONDS) in the caller.

import api from '../../../apiservices/axiosClient';

const TTL_MS = 60 * 1000;
let cached = null;
let fetchedAt = 0;

export async function getPlatformBufferSeconds() {
  const now = Date.now();
  if (cached !== null && now - fetchedAt < TTL_MS) return cached;
  try {
    const { data } = await api.get('/user/buffer-time');
    cached = Number(data?.buffer_time) || 0;
  } catch {
    cached = 0; // caller falls back to the env default
  }
  fetchedAt = now;
  return cached;
}
