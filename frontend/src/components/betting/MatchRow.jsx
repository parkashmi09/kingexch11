import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import OddsCell from './OddsCell';
import { formatGameDate } from '../../utils/betTableData';

// Reference markup always renders all 4 icon wrappers (empty when the flag is
// off). Icon order differs: mobile header shows F before F1, desktop row F1
// before F. Virtual games get a leading icon-998 slot.
function GameIcons({ icons, desktop = false }) {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const f = icons?.f ? <span translate="no" className="f-bm-icon">F</span> : null;
  const f1 = icons?.f1 ? <span translate="no" className="f-bm-icon">F1</span> : null;
  const bm = icons?.bm ? <span translate="no" className="f-bm-icon">BM</span> : null;
  const tv = icons?.tv ? <i className="icon-tv d-icon"></i> : null;

  return (
    <div className="game-icons">
      {/* Leading slot: virtuals get the icon-998 badge. When the user is LOGGED
          IN the reference also renders an empty leading `.game-icon` (`<!---->`)
          even for non-virtuals — matched here. Logged out + non-virtual renders
          nothing (an always-present empty slot adds ~30px which can wrap BM/TV to
          a second line at mobile widths). */}
      {icons?.virtual ? (
        <div className="game-icon"><i className="icon-998 d-icon"></i></div>
      ) : isAuth ? (
        <div className="game-icon"></div>
      ) : null}
      {/* Second leading slot: the "e" badge for e-cricket (Dim Cricket League).
          Only set by formatCricketData -> shows on the Cricket tab / detail view,
          never on the flat In-Play home board. Reference renders <!----> here
          otherwise. */}
      {icons?.egames ? (
        <div className="game-icon e-games"><span>e</span></div>
      ) : null}
      {desktop ? (
        <>
          <div className="game-icon fancy1-icon">{f1}</div>
          <div className="game-icon fancy-icon">{f}</div>
        </>
      ) : (
        <>
          <div className="game-icon fancy-icon">{f}</div>
          <div className="game-icon fancy1-icon">{f1}</div>
        </>
      )}
      <div className="game-icon bm-icon">{bm}</div>
      <div className="game-icon tv-icon">{tv}</div>
    </div>
  );
}

function MatchRow({ match, isFootball, onOddsClick }) {
  // Home bet slip: an odds-cell tap opens the Bet Slip modal for that runner.
  // col 1/X/2 maps to the all-data section sno 1/2/3 in the parent handler.
  const cellClick = onOddsClick
    ? (col) => (side, cell) => onOddsClick(match, { side, col, ...cell })
    : () => undefined;
  // Live matches show the "Live" pill; upcoming matches show a relative day label
  // + 24h time in two stacked <p>s, exactly as the reference "Comming Up" rows.
  let dateLabel;
  if (match.inplay) {
    dateLabel = <div className="game-date inplay"><span>Live</span></div>;
  } else {
    const { day, time } = formatGameDate(match.date);
    dateLabel = (
      <div className="game-date">
        <p className="day text-left">{day}</p>
        <p className="mb-0 day text-left">{time}</p>
      </div>
    );
  }

  const linkState = match._raw ? { game: match._raw } : undefined;

  // The draw (X) column is shown whenever the sno=2 market exists (football,
  // cricket Test matches). Older callers that don't set `oX.exists` fall back
  // to isFootball.
  const showX = match.oX?.exists ?? isFootball;

  return (
    <div className="bet-table-box">
      {/* Mobile header row */}
      <div className="bet-table-row-header-mobile d-none-desktop">
        <div className="game-title">
          {dateLabel}
          <div className="game-name d-inline-block">
            <Link to={match.href} state={linkState}>
              <p className="team-name text-left">{match.teams}</p>
              <p className="team-name text-left team-event">({match.league})</p>
            </Link>
            <GameIcons icons={match.icons} />
          </div>
        </div>
      </div>

      {/* Desktop row */}
      <div className="bet-table-row">
        <div className="game-title d-none-mobile">
          {dateLabel}
          <div className="game-name d-inline-block">
            <Link to={match.href} state={linkState}>
              <p className="team-name text-left">{match.teams}</p>
              <p className="team-name text-left team-event">({match.league})</p>
            </Link>
          </div>
          <GameIcons icons={match.icons} desktop />
        </div>

        <OddsCell back={match.o1.back} lay={match.o1.lay} header="1" suspended={match.suspended} onOddsClick={cellClick('1')} />

        {/* Draw (X) is DATA-DRIVEN: shown whenever the sno=2 market exists. */}
        {showX ? (
          <OddsCell back={match.oX.back} lay={match.oX.lay} header="X" suspended={match.suspended} onOddsClick={cellClick('X')} />
        ) : (
          <div className="point-title">
            <div className="text-center d-none-desktop point-title-header">X</div>
            <div className="no-val bl-box suspended"><span className="d-block odds">—</span></div>
            <div className="no-val bl-box suspended"><span className="d-block odds">—</span></div>
          </div>
        )}

        {/* Reference quirk: the "2" column uses the side-first class order
            (`back bl-box`) ONLY on 2-outcome markets (no draw). When the draw
            column is present (Test/football) it uses the normal `bl-box back`. */}
        <OddsCell back={match.o2.back} lay={match.o2.lay} header="2" sideFirst={!showX} suspended={match.suspended} onOddsClick={cellClick('2')} />
      </div>
    </div>
  );
}

export default MatchRow;
