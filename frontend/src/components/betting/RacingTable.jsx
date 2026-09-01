import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useSportData from '../../hooks/useSportData';
import { formatFeedIstClock } from '../../utils/racingUtils';

// Racing home board (Horse Racing sid 10 / Greyhound sid 65).
//
// Racing's all-data is nested COUNTRY > VENUE > RACE — nothing like the flat
// t1 match list every other sport returns, and the race objects carry no odds
// and no name of their own:
//   t1: [{ cid, cname: "FR", etid: 10,
//          children: [{ ename: "Mont De Marsan",
//                       children: [{ gmid, stime, iplay }] }] }]
// So it can't go through SportDetailView/formatCricketData (which would render
// an empty board). The reference renders it as country PILLS + one row per
// venue whose cells are the venue's race start times.
function RacingTable({ sportId, reloadKey = 0 }) {
  const { data, loading, error } = useSportData(sportId, reloadKey);

  // Country tabs, each with its venues and their races — all in FEED order, the
  // way the reference renders them. Do NOT re-sort by start time: a greyhound
  // card runs past midnight (Kinsley: 22:38 … 23:46, 00:03 … 01:46) and if the
  // feed stamps those small-hours races with the SAME date, sorting by timestamp
  // would yank them to the front of the row. The feed is already chronological
  // (verified against the horse-racing payload), so ordering it again buys
  // nothing and can only break the midnight case.
  // Countries with no race at all are dropped so an empty pill can't be selected.
  const countries = useMemo(() => {
    return (Array.isArray(data) ? data : [])
      .map((country) => ({
        cid: country.cid,
        cname: country.cname || '',
        venues: (country.children || [])
          .map((venue) => ({
            ename: venue.ename || '',
            races: (venue.children || []).filter((r) => r && r.gmid),
          }))
          .filter((v) => v.races.length > 0),
      }))
      .filter((c) => c.venues.length > 0);
  }, [data]);

  // Selected country. Kept as the cid (not an index) so a poll that reorders or
  // drops countries can't silently switch the user's tab; when the selected
  // country disappears from the feed the first one takes over.
  const [selectedCid, setSelectedCid] = useState(null);
  const activeCid = countries.some((c) => String(c.cid) === String(selectedCid))
    ? selectedCid
    : countries[0]?.cid;

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

  if (error || countries.length === 0) {
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
      <div className="bet-table-header"><div className="game-title">&nbsp;</div></div>

      {/* `race{sid}` on the pill strip is how the reference scopes the tab
          styling per racing sport (race10 horse / race65 greyhound). */}
      <div className={`horse-tab race${sportId}`}>
        <ul className="nav nav-pills">
          {countries.map((country) => (
            <li key={country.cid} className="nav-item">
              <a
                data-toggle="tab"
                href={`#goku${country.cid}`}
                className={`nav-link${String(country.cid) === String(activeCid) ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); setSelectedCid(country.cid); }}
              >
                {country.cname}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Every country pane stays in the DOM (bootstrap tab-content); only the
          active one carries `active show`, same as the reference. */}
      <div className="tab-content">
        {countries.map((country) => (
          <div
            key={country.cid}
            id={`goku${country.cid}`}
            className={`bet-table tab-pane fade horse-table${String(country.cid) === String(activeCid) ? ' active show' : ''}`}
          >
            <div className="bet-table-body">
              {country.venues.map((venue) => (
                <div key={venue.ename} className="bet-table-box">
                  {/* Mobile puts the venue name in its own header row above the
                      time chips; desktop keeps it inline in the row. Both are
                      always rendered — CSS picks one (d-none-desktop /
                      d-none-mobile). */}
                  <div className="bet-table-row-header-mobile d-none-desktop">
                    <div className="game-title">
                      <div className="game-name d-inline-block">
                        <div className="game-icons">
                          <div className="game-icon tv-icon"><i className="icon-tv d-icon"></i></div>
                        </div>
                        <p className="team-name text-left">{venue.ename}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bet-table-row">
                    <div className="game-title d-none-mobile">
                      <div className="game-icons">
                        <div className="game-icon tv-icon"><i className="icon-tv d-icon"></i></div>
                      </div>
                      <div className="game-name d-inline-block">
                        <p className="team-name text-left">{venue.ename}</p>
                      </div>
                    </div>
                    <div className="horse-time-detail">
                      {/* The race that's off right now (iplay) is the only chip
                          the reference marks `active` — it highlights the time,
                          the <a> itself stays class-less. */}
                      {venue.races.map((race) => (
                        <Link key={race.gmid} to={`/gamedetails/${sportId}/${race.gmid}`} className="">
                          <span className={race.iplay ? 'active' : ''}>{formatFeedIstClock(race.stime)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RacingTable;
