import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useSportData from '../../hooks/useSportData';
import MatchRow from './MatchRow';
import HomeBetSlipModal from './HomeBetSlipModal';
import { bToastError } from '../BToast';
import { isCricketLimitedOvers } from './placeBet/placeBetRules';
import { mapGame, buildCricketRows, buildFootballRows, buildTennisRows } from '../../utils/betTableData';

// The bet payload's `sports` tag, derived from the board's sport id — same map
// GameDetails uses for its own payloads.
const SPORT_NAME_BY_SID = { 1: 'Soccer', 2: 'Tennis', 4: 'Cricket' };

// Home board column → all-data MATCH_ODDS section sno (1 / X / 2 ↔ 1 / 2 / 3).
const SNO_BY_COL = { 1: 1, X: 2, 2: 3 };

function BetTable({ sportId, title, isFootball, onLoad, reloadKey = 0, pollOnce = false }) {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  // Home Bet Slip — an odds-cell tap opens the reference bet-slip modal and the
  // bet places right here (full GameDetails pipeline; live odds come from the
  // modal's own get-match-private-data poll).
  const [slipBet, setSlipBet] = useState(null);

  const handleOddsClick = useCallback((match, { side, col, odds, size }) => {
    if (!isAuth) {
      bToastError('Please login to access!');
      return;
    }
    const game = match._raw;
    if (!game || !game.mid) return;
    const section = (game.section || []).find((s) => s.sno === SNO_BY_COL[col]);
    if (!section) return;
    // Runner order: the two teams first (sno 1, 3), The Draw (sno 2) last —
    // team_one/team_two must be the actual teams, and the book rows read
    // naturally as home / away / draw.
    const bySno = (n) => (game.section || []).find((s) => s.sno === n);
    const runners = [bySno(1), bySno(3), bySno(2)]
      .map((s) => s?.nat)
      .filter(Boolean);
    // Same shape GameDetails.handleBetClick builds — usePlaceBetPanel and
    // prepareBetPayload read these exact fields. min/max/maxb are absent in
    // all-data; the modal's private-data poll fills them in as it loads.
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
  }, [isAuth, sportId]);
  // pollOnce: fetch this sport's all-data ONCE (no 5s repeat poll) — the home
  // cricket board uses this; a reloadKey bump (tab click) still refetches.
  const { data, tournaments, loading, error } = useSportData(sportId, reloadKey, { poll: !pollOnce });

  // Signal first-load complete as soon as the fetch resolves — regardless of how
  // many rows came back (t1 can be empty while t2 has live games, or the board is
  // genuinely empty). Waiting for data.length > 0 would leave the loader stuck.
  useEffect(() => {
    if (!loading && onLoad) onLoad();
  }, [loading, onLoad]);

  // Cricket (sid=4), Football (sid=1) and Tennis (sid=2) each merge t2 (outright/
  // special markets like FIFA/Wimbledon winner) with t1, exactly as the reference
  // board does, but via their own builder so the boards can diverge freely.
  // Skipped leagues are hidden only when logged in. Other sports show only their
  // live t1 matches.
  let matches;
  if (sportId === 4) {
    matches = buildCricketRows(data, sportId, tournaments, { skipLeagues: isAuth });
  } else if (sportId === 1) {
    matches = buildFootballRows(data, sportId, tournaments, { skipLeagues: isAuth });
  } else if (sportId === 2) {
    matches = buildTennisRows(data, sportId, tournaments, { skipLeagues: isAuth });
  } else {
    const liveOnly = data.filter(g => g.iplay);
    matches = liveOnly.map(g => mapGame(g, sportId));
  }

  return (
    <div className="bet-table">
      <div className="new-table">
        <div className="bet-table-header new-header">
          <div className="game-title">{title}</div>
          <div className="point-title d-none-mobile">1</div>
          <div className="point-title d-none-mobile">X</div>
          <div className="point-title d-none-mobile">2</div>
        </div>
        {/* Empty board reads the same as a failed fetch. The reference puts the
            words straight inside .new-table, right after the header — no body
            wrapper and no element of their own. The home board lists only
            in-play games, so a sport with none renders exactly this. */}
        {!loading && (error || matches.length === 0) ? 'no records found' : (
          <div>
            <div className="bet-table-body">
              {loading && <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}
              {!loading && !error && matches.map((match) => (
                <MatchRow key={match.id} match={match} isFootball={isFootball} onOddsClick={handleOddsClick} />
              ))}
            </div>
          </div>
        )}
      </div>
      {slipBet && <HomeBetSlipModal bet={slipBet} onClose={() => setSlipBet(null)} />}
    </div>
  );
}

export default BetTable;
