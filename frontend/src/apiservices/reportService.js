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

/**
 * Profit & Loss, aggregated per sport and market type over a date range.
 *
 * NOT YET IMPLEMENTED SERVER-SIDE — see docs/BACKEND-GAPS.md. The reference
 * posts { from, to } (ISO strings) and gets back
 *   { isSuccess, items: [{ _id: { et, mt, bt, provider }, pnl, commission }] }
 * The report page groups those into the sport/market grid it renders. Until the
 * route exists this resolves to an empty result and the page reads
 * "No Profit & Loss Found" rather than erroring.
 * @param {Object} range - { from, to }
 */
export const getUserProfitLoss = async (range) => {
  try {
    const response = await api.post('/user/pnl', range);
    return response.data;
  } catch {
    return { isSuccess: false, items: [] };
  }
};

/**
 * Settled bets (WON / LOST / VOID) over a date range, for the Bet History page.
 *
 * PARTIALLY IMPLEMENTED SERVER-SIDE — see docs/BACKEND-GAPS.md. It reuses the
 * open-bets route with `status: 'settled'` and a date range, neither of which
 * that route understands today, so it currently returns nothing and the page
 * reads "No Data Found". The response shape it expects is the one the route
 * already uses: { success, data: [...], pagination: { total } }.
 * @param {Object} params - { fromDate, toDate, page, limit, category }
 *   category: 'SPORTS' | 'CASINO'
 */
export const getUserBetHistory = async (params) => {
  try {
    const response = await api.get('/user/cricket/sports-bets/user', {
      params: { ...params, status: 'settled' },
    });
    return response.data;
  } catch {
    return { success: false, data: [] };
  }
};

/**
 * Declared sports results for one sport, split into today's and yesterday's.
 *
 * NOT YET IMPLEMENTED SERVER-SIDE — see docs/BACKEND-GAPS.md. The reference
 * gets back { isSuccess, today_result: [...], yesterday_result: [...] }, each
 * row { event_id, event_name, competition_name, open_date, declared_date }.
 * @param {number|string} sportId
 */
export const getSportsResults = async (sportId) => {
  try {
    const response = await api.get('/user/cricket/results', { params: { sportId } });
    return response.data;
  } catch {
    return { isSuccess: false, today_result: [], yesterday_result: [] };
  }
};

/**
 * Every market's result for one declared event — the popup behind a Results row.
 *
 * NOT YET IMPLEMENTED SERVER-SIDE — see docs/BACKEND-GAPS.md. Expected:
 * { isSuccess, items: [{ marketId, marketName, winnerName, createdAt }] }.
 * @param {string|number} eventId
 */
export const getEventMarketResults = async (eventId) => {
  try {
    const response = await api.get('/user/cricket/results/markets', { params: { eventId } });
    return response.data;
  } catch {
    return { isSuccess: false, items: [] };
  }
};
