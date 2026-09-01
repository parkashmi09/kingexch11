import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSportData from '../../hooks/useSportData';
import { formatFeedIstClock } from '../../utils/racingUtils';

// Horse (sid 10) / Greyhound (sid 65) board.
//
// Racing's all-data is nested COUNTRY > VENUE > RACE and carries no odds, so it
// can't go through SportList's back/lay grid. The reference gives it its own
// shape: a country heading, then one card per venue whose body is a row of
// start-time buttons, the in-progress race highlighted.
function RacingBoard({ sportId, reloadKey = 0 }) {
  const navigate = useNavigate();
  const { data, loading, error } = useSportData(sportId, reloadKey);

  // Feed order is already chronological — deliberately not re-sorted, because a
  // card that runs past midnight would have its small-hours races yanked to the
  // front. Countries and venues with no race at all are dropped.
  const countries = useMemo(
    () =>
      (Array.isArray(data) ? data : [])
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
        .filter((c) => c.venues.length > 0),
    [data]
  );

  if (loading) {
    return (
      <div className="m-0 sportscardRow">
        <div className="marketOdd">
          <span>Loading events...</span>
        </div>
      </div>
    );
  }

  if (error || countries.length === 0) {
    return (
      <div className="m-0 sportscardRow">
        <div className="marketOdd">
          <div className="border-radius-0 m-0 sportscardRow">
            <div className="noevent">No Active Events Found </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {countries.map((country) => (
        <div key={country.cid}>
          <div className="horserace-cityname">
            <h2>
              <i className="fa fa-long-arrow-right mr-8"></i>
              {country.cname}
            </h2>
          </div>
          <div className="tournaments-box inplay horseinplay">
            {country.venues.map((venue) => {
              const live = venue.races.some((r) => r.iplay);
              return (
                <div className="sportscardRow w-33" key={venue.ename}>
                  <div className="tournaments-box-head">
                    <div className="inplay-teamname">{venue.ename}</div>
                    {live && <div className="livebtn">Live</div>}
                  </div>
                  <div className="tournaments-box-footer">
                    <div className="horseinplaybtn w-100 ">
                      {venue.races.map((race) => (
                        <button
                          key={race.gmid}
                          className={race.iplay ? 'active' : null}
                          onClick={() => navigate(`/gamedetails/${sportId}/${race.gmid}`)}
                        >
                          {formatFeedIstClock(race.stime)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export default RacingBoard;
