import axiosClient from './axiosClient';

export const getCasinoGameDetails = (type, signal) =>
  axiosClient.post('/casino/casino/all-data', { type, data: {} }, { signal }).then(r => r.data);

export const placeCasinoBet = (betData, signal) =>
  axiosClient.post('/casino/casino/placebet', betData, { signal }).then(r => r.data);

// Reverses open bets on a still-open round (instant-placement tables only —
// the roulettes). Identity comes from the auth token; body carries only
// { gameName, roundId, all }.
export const undoCasinoBet = (undoData, signal) =>
  axiosClient.post('/casino/casino/undobet', undoData, { signal }).then(r => r.data);

export const getMyBets = (userId, matchId, signal) =>
  axiosClient.post('/casino/casino/mybets', { user_id: userId, match_id: matchId }, { signal }).then(r => r.data);

export const getLastResults = (type, signal) =>
  axiosClient.post('/casino/casino/last-results', { type }, { signal }).then(r => r.data);

export const getDetailResults = (type, mid, signal) =>
  axiosClient.post('/casino/casino/detail-results', { type, mid }, { signal }).then(r => r.data);

export const getMatchExposure = (userId, matchId, signal) =>
  axiosClient.post('/user/exposures/get-exposure', { user_id: userId, match_id: matchId }, { signal }).then(r => r.data);

// Stake buttons are NOT fetched here. /user/stake-button-values is pulled once
// into redux (stakeButtonSlice, dispatched from App) and read from there — the
// copy that used to live in this file parsed a `btn1…btn6` shape the endpoint
// never returns (it answers { game_buttons, casino_buttons }), so it silently
// fell back to hardcoded defaults on every call and the account's real casino
// buttons never showed. It also refetched from each panel that mounted.
