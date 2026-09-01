import api from './axiosClient';

// Casino Manage catalog — the owner-controlled VIP / Virtual / Premium game
// list (admin: Casino Manage). Rows carry route, min_balance and enabled;
// disabled rows are returned too so callers can hide a managed game wherever
// it appears (teen20v1 is also in the main Our Casino grid).
export async function getManagedCasinoGames({ signal } = {}) {
  const res = await api.get('/user/casino-manage/games', { signal });
  return res.data;
}
