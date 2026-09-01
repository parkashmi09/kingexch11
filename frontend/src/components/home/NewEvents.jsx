import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLatestEvents } from '../../apiservices/sportsService';

function NewEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetchLatestEvents()
        .then((res) => {
          if (cancelled) return;
          // { success, data: { data: [ { id, lid, name, sportId } ], ... } }
          const list = res?.data?.data;
          if (Array.isArray(list)) setEvents(list);
        })
        .catch(() => {
          /* keep last good list on a failed poll */
        });
    }

    load();
    const timer = setInterval(load, 30000); // refresh every 30s
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="new-event">
      {events.map((ev) => (
        <div key={ev.lid || ev.id} className={`new-event-item sport${ev.sportId}`}>
          <Link to={`/gamedetails/${ev.sportId}/${ev.id}`} className="">
            <i className={`d-icon icon-${ev.sportId}`}></i>
            <span className="ml-2" style={{ color: 'rgb(248, 249, 250)' }}>{ev.name}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default NewEvents;
