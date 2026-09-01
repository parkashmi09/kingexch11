import api from './axiosClient';

/**
 * Fetch the logged-in user's own account statement (V2 — point_ledger based).
 * @param {Object} filters - { fromDate, toDate, page, limit, reportType, search }
 *   reportType: 'ALL' | 'TRANSACTION' | 'SPORTS'
 */
export const getUserAccountStatement = async (filters) => {
  const response = await api.post('/user/account-statement-v2', filters);
  return response.data;
};

/**
 * Every bet the user had on one market, for a SPORTS statement row's Result
 * popup, plus the market's winner and header.
 * @param {Object} ids - { matchId, eventId } — both from the statement row
 *   (`matchId` is the market id / mid, `eventId` the match id / gmid)
 */
export const getStatementMarketBets = async ({ matchId, eventId }) => {
  const response = await api.post('/user/account-statement-v2/bets', { matchId, eventId });
  return response.data;
};

/**
 * Fetch account statement via admin endpoint (supports user search).
 * @param {Object} filters - { fromDate, toDate, page, limit, reportType }
 */
/**
 * Every bet the user had on one casino ROUND, for a CASINO statement row's
 * Result popup, plus the round's winner and header. Purpose-built for the
 * modal: each bet already carries `side`, `win` and `deleted`, and `winner`
 * falls back to a live provider lookup when the round isn't in casinoresult.
 * @param {Object} ids - { roundId } from the statement row; `betId` is the
 *   fallback for legacy rows whose roundId is null.
 */
export const getStatementCasinoBets = async ({ roundId, betId }) => {
  const response = await api.post('/user/account-statement-v2/casino-bets', { roundId, betId });
  return response.data;
};

export const getAccountStatement = async (filters) => {
  const response = await api.post('/admin/reports/accountstatement', filters);
  return response.data;
};

/**
 * Fetch current sports bets for the logged-in user.
 * @param {Object} params - { page, limit, search, betType }
 */
export const getCurrentSportsBets = async (params) => {
  const response = await api.get('/user/cricket/sports-bets/user', { params });
  return response.data;
};

/**
 * Fetch current casino bets for the logged-in user.
 * @param {string|number} userId
 */
export const getCurrentCasinoBets = async (userId) => {
  const response = await api.post('/casino/casino/bet-history', { user_id: userId });
  return response.data;
};

/**
 * Fetch activity logs (login history / password changes) for the logged-in user.
 * @param {Object} params - { startDate, endDate, logType, page, limit }
 */
export const getUserActivityLogs = async (params) => {
  const response = await api.get('/user/activity-logs', { params });
  return response.data;
};

/**
 * Fetch casino last results for a given game type.
 * @param {string} type - casino game type key (e.g. 'teen20', 'lucky7')
 */
export const getCasinoLastResults = async (type) => {
  const response = await api.post('/casino/casino/last-results', { type });
  return response.data;
};

/**
 * Casino result REPORT for a game type — the same feed last-results serves, but
 * each round also carries `winName`, the winner's label. That is what the
 * report page needs: last-results only returns `{ mid, win }`, a numeric code,
 * which had to be resolved either by a per-row detail-results call or by a
 * hardcoded per-game mapping.
 * @param {string} type - casino game type key (e.g. 'teen20v1', 'joker120')
 */
export const getCasinoResultReport = async (type) => {
  const response = await api.post('/casino/casino/result-report', { type });
  return response.data;
};

/**
 * Fetch live casino bets (settled or un-settled) for the logged-in user.
 * @param {Object} params - { reportType, date, casinoType, page, limit }
 *   reportType: 'results' (settled) | 'currentbets' (un-settled)
 */
export const getLiveCasinoBets = async (params) => {
  const response = await api.get('/jsGames/history', { params });
  return response.data;
};

/**
 * Fetch sportbook bets (settled or un-settled) for the logged-in user.
 * @param {Object} params - { reportType, date, sportType, page, limit }
 *   reportType: 'results' (settled) | 'currentbets' (un-settled)
 */
export const getSportBookBets = async (params) => {
  const response = await api.get('/jsGames/sportbook-history', { params });
  return response.data;
};
