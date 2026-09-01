import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import useMatchData from '../../hooks/useMatchData';

import { isCricketLimitedOvers } from '../../components/betting/placeBet/placeBetRules';
import { formatOpenDate } from '../../utils/betTableData';
import { cbToastError } from '../toast';
import EventMarket from './EventMarket';

const SPORT_NAME_BY_SID = { 1: 'Soccer', 2: 'Tennis', 4: 'Cricket' };

// "8/5/2020 6:30:00 AM" → "05/08/2020 06:30", the strip the reference prints
// beside the event name. The clock value is already server/IST time.
function eventClock(stime) {
  const m = String(stime || '').match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4})[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i
  );
  if (!m) return formatOpenDate(stime);
  let hour = Number(m[4]);
  const ap = (m[7] || '').toUpperCase();
  if (ap === 'PM' && hour !== 12) hour += 12;
  if (ap === 'AM' && hour === 12) hour = 0;
  const dd = String(Number(m[2])).padStart(2, '0');
  const mm = String(Number(m[1])).padStart(2, '0');
  return `${dd}/${mm}/${m[3]} ${String(hour).padStart(2, '0')}:${m[5]}`;
}

/**
 * The event view — every market for one event, with the matched-bet rail.
 *
 * This is the same page the reference serves for a tournament outright (/cpl,
 * /ipl, /bbl…) and for a single match (/event/:sid/:id); only the header strip
 * differs. Data and bet placement are tenexch's existing pipeline: useMatchData
 * polls private-data exactly as the old GameDetails page does, and a price tap
 * opens the same bet slip the home board uses.
 */
function EventPage({ gmid, sid, title, variant = 'tournament', showTitleStrip = true }) {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const { matchData, markets, loading, error, noMarkets } = useMatchData(gmid, sid);
  const [slipBet, setSlipBet] = useState(null);

  const eventName = (title || matchData?.ename || '').trim();
  // A match page leads with its competition; the outright board does not.
  const competition = (matchData?.cname || '').trim();
  const headerTitle =
    variant === 'match' && competition && competition !== eventName
      ? `${competition} - ${eventName}`
      : eventName;

  const onOddsClick = useCallback(
    (market, runner, side, price) => {
      if (!isAuth) {
        cbToastError('Please login to access!');
        return;
      }
      if (!market?.mid) return;
      const runners = (market.section || []).map((s) => s.nat).filter(Boolean);
      setSlipBet({
        team: runner.nat,
        betType: side,
        odds: price.odds,
        size: price.size,
        market_id: market.mid,
        selectionId: runner.sid,
        marketType: market.mname,
        mname: market.mname,
        gtype: market.gtype,
        market,
        section: runner,
        runners,
        event_id: gmid,
        event_name: eventName,
        match_title: eventName,
        match_start_time: matchData?.stime || '',
        sid,
        sports: SPORT_NAME_BY_SID[sid] || 'Cricket',
        game_type: 'MATCH',
        limited_overs: isCricketLimitedOvers({
          sid,
          cname: matchData?.cname,
          ename: matchData?.ename,
        }),
        team_one: runners[0] || '',
        team_two: runners[1] || '',
      });
    },
    [isAuth, gmid, sid, eventName, matchData]
  );

  return (
    <div className="eventdetails-box">
      {/* Same strip either way, but a match carries the banner background and a
          "{competition} - {event}" title, where a tournament outright is just
          its own name on the plain bar. */}
      {showTitleStrip && (
        <div className={variant === 'match' ? ' eventtitle-box mb-0 maintitlebgimage' : 'eventtitle-box mb-1'}>
          <div className="etitle">{headerTitle}</div>
          <div className="event-info-strip-meta">{eventClock(matchData?.stime)}</div>
        </div>
      )}

      <div className="eventdetail-main">
        <div className="eventdetails-leftside">
          {loading && !markets.length && (
            <div className="m-0 sportscardRow">
              <div className="marketOdd">
                <span>Loading events...</span>
              </div>
            </div>
          )}
          {!loading && (error || noMarkets) && (
            <div className="border-radius-0 m-0 sportscardRow">
              <div className="noevent">No Active Events Found </div>
            </div>
          )}
          {markets.map((market, i) => (
            <EventMarket
              key={market.mid ?? market.mname ?? i}
              market={market}
              sid={sid}
              onOddsClick={onOddsClick}
              // The slip opens at the foot of the market it was struck on, so
              // only that one renders it.
              slipBet={slipBet && String(slipBet.market_id) === String(market.mid) ? slipBet : null}
              onSlipClose={() => setSlipBet(null)}
            />
          ))}
        </div>

        <div className="eventdetails-rightside">
          <div className="eventtitle-box">
            <div className="matched-bet-header">Matched Bet</div>
          </div>
          <div className="matched-bet-slips">
            <div className="text-center text-muted py-3">No open bets</div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default EventPage;
