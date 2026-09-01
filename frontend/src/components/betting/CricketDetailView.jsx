import useSportData from '../../hooks/useSportData';
import MatchRow from './MatchRow';

function mapGame(game) {
  const s1 = game?.section?.find(s => s.sno === 1) || {};
  const s2 = game?.section?.find(s => s.sno === 3) || {};
  const getCell = (sec, idx) => {
    const o = sec?.odds?.[idx];
    if (!o || o.odds == null) return { odds: null, size: null };
    return { odds: String(o.odds), size: o.size || null };
  };

  return {
    id: game.gmid,
    teams: game.ename,
    league: game.cname || game.ename,
    inplay: !!game.iplay,
    date: game.stime || '',
    href: `/gamedetails/4/${game.gmid}`,
    icons: { f: !!game.f, f1: !!game.f1, bm: !!game.bm, tv: !!game.tv },
    o1: { back: getCell(s1, 0), lay: getCell(s1, 1) },
    oX: { back: { odds: null, size: null }, lay: { odds: null, size: null } },
    o2: { back: getCell(s2, 0), lay: getCell(s2, 1) },
    _raw: game,
  };
}

function LeagueTable({ leagueName, games }) {
  const inPlay = games.filter(g => g.iplay);
  const comingUp = games.filter(g => !g.iplay);

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
            {inPlay.map(game => (
              <MatchRow key={game.gmid} match={mapGame(game)} isFootball={false} />
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
            {comingUp.map(game => (
              <MatchRow key={game.gmid} match={mapGame(game)} isFootball={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CricketDetailView() {
  const { data, loading, error } = useSportData(4);

  if (loading) {
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

  if (error) {
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

  // Group games by cname (league)
  const groups = {};
  for (const game of data) {
    const league = game.cname || game.ename;
    if (!groups[league]) groups[league] = { games: [], cid: game.cid || 0 };
    groups[league].games.push(game);
    if (game.cid > groups[league].cid) groups[league].cid = game.cid;
  }

  // Sort leagues by cid descending
  const sortedLeagues = Object.keys(groups).sort((a, b) => groups[b].cid - groups[a].cid);

  return (
    <div className="bet-table">
      {sortedLeagues.map(league => (
        <LeagueTable
          key={league}
          leagueName={league}
          games={groups[league].games}
        />
      ))}
    </div>
  );
}

export default CricketDetailView;
