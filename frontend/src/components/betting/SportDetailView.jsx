import { useSelector } from 'react-redux';
import useSportData from '../../hooks/useSportData';
import MatchRow from './MatchRow';
import { formatCricketData, formatFootballData, formatTennisData, formatVirtualCricketData } from '../../utils/betTableData';

// One league's table. `inPlay` / `comingUp` are already mapped UI rows, ordered
// by formatCricketData — this component is presentation only.
function LeagueTable({ leagueName, inPlay, comingUp, isFootball }) {
  return (
    <div className="new-table">
      <div className="bet-table-header new-header">
        <div className="game-title">{leagueName}</div>
        <div className="point-title d-none-mobile">1</div>
        <div className="point-title d-none-mobile">X</div>
        <div className="point-title d-none-mobile">2</div>
      </div>

      {inPlay.length > 0 && (
        <div>
          <div className="new-sub-header">
            <div className="game-title">In Play</div>
          </div>
          <div className="bet-table-body">
            {inPlay.map(match => (
              <MatchRow key={match.id} match={match} isFootball={isFootball} />
            ))}
          </div>
        </div>
      )}

      {comingUp.length > 0 && (
        <div>
          <div className="new-sub-header">
            <div className="game-title">Comming Up</div>
          </div>
          <div className="bet-table-body">
            {comingUp.map(match => (
              <MatchRow key={match.id} match={match} isFootball={isFootball} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SportDetailView({ sportId, isFootball = false, reloadKey = 0, virtual = false }) {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const { data, tournaments, loading, error } = useSportData(sportId, reloadKey);

  if (loading) {
    // `.loader-section-parent` is position:relative (control.css) so the absolute
    // `.loader-section` overlays just the board area — matches the reference.
    return (
      <div className="bet-table loader-section-parent">
        <div className="loader-section">
          <div>
            <img src="/assets/animate/loader-ten.gif" alt="loader" />
          </div>
        </div>
        <div className="bet-table"></div>
      </div>
    );
  }

  // All grouping / ordering / t2-merge / login-based league filtering lives in
  // the per-sport formatter — this view only renders the resulting league tables.
  // Each sport has its own builder so it can diverge freely. Logged in -> hide
  // each sport's skip leagues, same as the In-Play home board.
  let leagues;
  if (virtual) {
    // Virtual Cricket tab: ONLY the virtual leagues the cricket board hides.
    leagues = formatVirtualCricketData(data, tournaments, sportId);
  } else if (sportId === 1) {
    leagues = formatFootballData(data, tournaments, sportId, { skipLeagues: isAuth });
  } else if (sportId === 2) {
    leagues = formatTennisData(data, tournaments, sportId, { skipLeagues: isAuth });
  } else {
    leagues = formatCricketData(data, tournaments, sportId, { skipLeagues: isAuth });
  }

  if (error || leagues.length === 0) {
    return (
      <div className="bet-table">
        <div className="bet-table">
          <div className="bet-table-header nodata">
            no records found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bet-table">
      {leagues.map(league => (
        <LeagueTable
          key={league.id}
          leagueName={league.leagueName}
          inPlay={league.inPlay}
          comingUp={league.comingUp}
          isFootball={isFootball}
        />
      ))}
    </div>
  );
}

export default SportDetailView;
