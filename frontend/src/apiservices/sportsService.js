import api from './axiosClient';

export function fetchSportData(sid) {
  return api.post('/user/cricket/all-data', { id: sid });
}

// One call returns the FULL sidebar tree for every sport at once:
// t1 = [{ name, etid, children: [{ name, cid, children: [{ name, gmid, etid }] }] }]
// t2 = racing (Horse/Greyhound) with race lists ({ name, gmid, etid, sdatetime }).
export function fetchSportsTree() {
  return api.get('/user/all/sports/tree');
}

// Hot / latest-events strip shown on the home top bar. Returns the raw list
// of events ({ sport, name, href }) as served by the diamond99 board.
export async function fetchLatestEvents() {
  const { data } = await api.get('/user/v1/sports-get_latest_events');
  return data;
}

export function fetchMatchPrivateData(gmid, sid) {
  return api.post('/user/cricket/get-match-private-data', { gmid, sid });
}

// Diamond-style v1 header/meta for a match (ename, cname, stime, iplay, tv,
// scard…). Header-only — no markets. Reliable source for the game-details
// header (the old get-sport-data-by-id 500s for many gmids). etid === sid.
export function fetchSportsGameDetail(gmid, etid) {
  return api.get('/user/v1/sports-gamedetailPrivate', { params: { gmid, etid } });
}

export function fetchGameDetails(gmid, sid) {
  return api.post('/user/cricket/get-sport-data-by-id', { gmid, sid });
}

/** Score-card iframe URL for non-cricket sports (football/tennis). Null on failure. */
export async function fetchScoreCardUrl(gmid, sid) {
  try {
    const { data } = await api.post('/user/cricket/score-card', { gmid, sid });
    return data?.data?.score_url ?? null;
  } catch {
    return null;
  }
}

// The bet endpoints answer a rejection with HTTP 400 + { success:false, error },
// so axios throws before the !data.success branch below can read it. Without
// this unwrap the toast would read "Request failed with status code 400"
// instead of the server's reason ("Insufficient balance", "Bet Not Confirm
// Check Exposure Limit And Balance", "Odds changed", …).
const betError = (e) =>
  new Error(e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Bet placement failed');

export async function sportsPlaceBet(payload) {
  let data;
  try {
    ({ data } = await api.post('/user/place', payload));
  } catch (e) {
    throw betError(e);
  }
  if (!data.success) throw new Error(data.error || data.message || 'Bet placement failed');
  return data;
}

// COMBINED (dutched) racing slip — one bet per runner, all-or-nothing on the
// server: if any leg is rejected, nothing is stored and the wallet is untouched.
export async function sportsPlaceCombinedBet(bets) {
  let data;
  try {
    ({ data } = await api.post('/user/place-combined', { bets }));
  } catch (e) {
    throw betError(e);
  }
  if (!data.success) throw new Error(data.error || data.message || 'Bet placement failed');
  return data;
}

export async function getMatchExposures(matchId, userId) {
  const { data } = await api.post('/user/matchexposures/match', { user_id: userId, match_id: matchId });
  return data;
}

// Open bets split into { matchedBets, unmatchedBets } (unmatched carry
// unmatched_odds = user's requested price and can be cancelled)
export async function getUserOpenBetsGrouped(eventId, userId) {
  const { data } = await api.get('/user/cricket/user-open-bets-grouped', {
    params: { eventid: eventId, user_id: userId },
  });
  return data;
}

// Cancel an UNMATCHED bet — backend soft-cancels, recomputes the market's
// exposure from the remaining bets and refunds the liability drop
export async function cancelSportsBet(betId) {
  const { data } = await api.post('/user/cancel-bet', { bet_id: betId });
  return data;
}

export async function getUserMatchedBets(eventId, userId) {
  const { data } = await api.get('/user/cricket/user-open-bets', { params: { eventid: eventId, user_id: userId } });
  return data;
}

export async function getFancyBets(runnerName, matchId, eventId, sid) {
  const { data } = await api.get('/user/fancy-bets', {
    params: { runner: runnerName, match_id: matchId, event_id: eventId, sport_id: sid },
  });
  return data;
}
