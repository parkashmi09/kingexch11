import { useMemo } from 'react';
import useSportData from '../../hooks/useSportData';
import EventPage from '../event/EventPage';

// Cricket. The tournament outrights arrive in the same all-data call as the
// matches, on its `t2` list.
const CRICKET_SID = 4;

// Which t2 entry is the CPL. Matched on the competition name rather than a
// fixed gmid — the id changes every season, the name does not.
const CPL_PATTERN = /caribbean premier league/i;

/**
 * CPL 2026 — the Caribbean Premier League outright board.
 *
 * The reference gives each tournament a route of its own (/cpl, /ipl, /bbl…)
 * pointing at one configured event, and renders the ordinary event view for it.
 * We resolve the event from tenexch's own cricket feed instead of a menu
 * config, then hand it to the same view.
 */
function Cpl() {
  const { tournaments, loading } = useSportData(CRICKET_SID);

  const event = useMemo(
    () =>
      (tournaments || []).find(
        (t) => CPL_PATTERN.test(t.cname || '') || CPL_PATTERN.test(t.ename || '')
      ),
    [tournaments]
  );

  // Between seasons the feed simply stops listing it.
  if (!event) {
    return (
      <div className="eventdetails-box">
        <div className="eventdetail-main">
          <div className="eventdetails-leftside">
            <div className="border-radius-0 m-0 sportscardRow">
              <div className="noevent">
                {loading ? 'Loading events...' : 'No Active Events Found '}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EventPage
      gmid={event.gmid}
      sid={CRICKET_SID}
      title={(event.ename || event.cname || '').trim()}
    />
  );
}

export default Cpl;
