import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import useSportData from '../../hooks/useSportData';
import MarketRow from './MarketRow';
import BetSlip from '../event/BetSlip';
import { cbToastError } from '../toast';
import { isCricketLimitedOvers } from '../../components/betting/placeBet/placeBetRules';
import { mapGame, buildCricketRows, buildFootballRows, buildTennisRows } from '../../utils/betTableData';

// Bet payload's `sports` tag, derived from the board's sport id.
const SPORT_NAME_BY_SID = { 1: 'Soccer', 2: 'Tennis', 4: 'Cricket' };
// Board column → all-data MATCH_ODDS section sno (1 / X / 2 ↔ 1 / 2 / 3).
const SNO_BY_COL = { 1: 1, X: 2, 2: 3 };

/**
 * One sport's board in the clickbet layout.
 *
 * The markup is the reference's (`sportscardRow` > `backlayHead` + `marketOdd`),
 * the data and the bet pipeline are tenexch's — same all-data fetch, same row
 * mapping and the same Home Bet Slip that the old BetTable opened, so a price
 * tap still places a real bet.
 */
function SportList({ sportId, title, showTitle = false, reloadKey = 0, pollOnce = false }) {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [slipBet, setSlipBet] = useState(null);
  const { data, tournaments, loading, error } = useSportData(sportId, reloadKey, { poll: !pollOnce });

  const onCellClick = useCallback(
    (match, { side, col, odds, size }) => {
      if (!isAuth) {
        cbToastError('Please login to access!');
        return;
      }
      const game = match._raw;
      if (!game || !game.mid) return;
      const section = (game.section || []).find((s) => s.sno === SNO_BY_COL[col]);
      if (!section) return;
      // Runner order: the two teams first (sno 1, 3), The Draw (sno 2) last.
      const bySno = (n) => (game.section || []).find((s) => s.sno === n);
      const runners = [bySno(1), bySno(3), bySno(2)].map((s) => s?.nat).filter(Boolean);
      setSlipBet({
        team: section.nat,
        betType: side,
        odds,
        size,
        market_id: game.mid,
        selectionId: section.sid,
        marketType: 'MATCH_ODDS',
        mname: game.mname || 'MATCH_ODDS',
        gtype: 'match',
        market: { mid: game.mid, mname: game.mname || 'MATCH_ODDS', gtype: 'match', status: game.status },
        section,
        runners,
        event_id: game.gmid,
        event_name: game.ename || '',
        match_title: game.ename || '',
        match_start_time: game.stime || '',
        sid: sportId,
        sports: SPORT_NAME_BY_SID[sportId] || 'Cricket',
        game_type: 'MATCH',
        limited_overs: isCricketLimitedOvers({ sid: sportId, cname: game.cname, ename: game.ename }),
        team_one: runners[0] || '',
        team_two: runners[1] || '',
      });
    },
    [isAuth, sportId]
  );

  // Cricket / football / tennis merge their outright (t2) markets in via their
  // own builder, exactly as the old board did; every other sport lists its live
  // t1 matches only.
  let matches;
  if (sportId === 4) matches = buildCricketRows(data, sportId, tournaments, { skipLeagues: isAuth });
  else if (sportId === 1) matches = buildFootballRows(data, sportId, tournaments, { skipLeagues: isAuth });
  else if (sportId === 2) matches = buildTennisRows(data, sportId, tournaments, { skipLeagues: isAuth });
  else matches = data.filter((g) => g.iplay).map((g) => mapGame(g, sportId));

  const body = () => {
    if (loading) return <span>Loading events...</span>;
    if (error) return <span>Error loading events. Please try again.</span>;
    if (!matches.length) {
      return (
        <div className="border-radius-0 m-0 sportscardRow">
          <div className="noevent">No Active Events Found </div>
        </div>
      );
    }
    return matches.map((match, i) => (
      <MarketRow key={match.id} match={match} isLast={i === matches.length - 1} onCellClick={onCellClick} />
    ));
  };

  return (
    <>
      {showTitle && <div className="eventtitle-box mt-0 margintop-2">{title}</div>}
      <div className={`${showTitle ? 'border-radius-0' : ''} m-0 sportscardRow`}>
        <div className="backlayHead bottomborder-1">
          <div className="minMax"></div>
          <div className="backlayText">
            <span className=" bbg">1</span>
            <span className=" bbg">X</span>
            <span className=" bbg">2</span>
          </div>
        </div>
        <div className="marketOdd">{body()}</div>
        {slipBet && <BetSlip bet={slipBet} onClose={() => setSlipBet(null)} />}
      </div>
    </>
  );
}

export default SportList;
