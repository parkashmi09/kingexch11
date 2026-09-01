import { useParams } from 'react-router-dom';
import EventPage from '../event/EventPage';

/**
 * A single match, opened from any board.
 *
 * The reference serves matches and tournament outrights through one view — the
 * only difference is the header strip — so this is the CPL page's component
 * with the match header, reading the event off the route.
 */
function EventDetails() {
  const { sid, gmid } = useParams();
  return <EventPage gmid={gmid} sid={Number(sid)} variant="match" />;
}

export default EventDetails;
