import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ng, host, KX } from '../ng';
import { refPost, ngDate, SITE_KEY } from '../refApi';

const C = ng('klo');

const FILTERS = [
  { id: 'all', label: 'All markets', icon: 'fa-th-large' },
  { id: 'day', label: 'Day markets', icon: 'fa-sun' },
  { id: 'night', label: 'Night markets', icon: 'fa-moon' },
  { id: 'main', label: 'Main markets', icon: 'fa-star' },
];

const matches = (filter, m) =>
  filter === 'main' ? m.eventName.toUpperCase().includes('MAIN')
    : filter !== 'day' && filter !== 'night' ? true
      : m.eventName.toLowerCase().includes(filter);

// "2026-10-15 09:10:00" / ISO → epoch ms, or null.
function parseEventTime(t) {
  if (t == null || t === '') return null;
  const ms = new Date(typeof t === 'string' ? t.trim().replace(' ', 'T') : t).getTime();
  return Number.isFinite(ms) ? ms : null;
}

// HH:MM:SS in the last hour, "Closed" once passed, null further out (the card
// then shows the clock time instead).
function countdown(at, now) {
  if (at == null) return null;
  const left = at - now;
  if (left <= 0) return 'Closed';
  if (left >= 36e5) return null;
  const s = Math.ceil(left / 1000);
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':');
}

/**
 * app-lottery — the reference's lottery markets (its sport 66104): day /
 * night / main filters over a grid of market cards, each counting down to its
 * open and close time and opening /lottery/66104/:eventId. Shown under
 * /allsport-highlight/66104 and in the home board's phone strip.
 */
export default function Lottery({ C: parent }) {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(Date.now());
  const request = useRef(0);

  const load = () => {
    const id = ++request.current;
    setLoading(true);
    setError(false);
    refPost('/api/exchange/sports/lotterySportsList', { key: SITE_KEY })
      .then((res) => {
        if (id !== request.current) return;
        setList(Array.isArray(res?.data) ? res.data.map((m) => ({ ...m, opensAt: parseEventTime(m.eventOpenTime), closesAt: parseEventTime(m.eventClosedTime) })) : []);
        setLoading(false);
      })
      .catch(() => {
        if (id !== request.current) return;
        setLoading(false);
        setError(true);
      });
  };

  useEffect(() => {
    load();
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => { request.current++; clearInterval(t); };
  }, []);

  const markets = list.filter((m) => matches(filter, m));

  return (
    <app-lottery {...parent} {...host('klo')} {...KX}>
      <section {...C} aria-label="Lottery markets" className="lottery">
        <nav {...C} aria-label="Filter lottery markets" className="market-filters">
          {FILTERS.map((f) => (
            <button {...C} key={f.id} type="button" className={`market-filter${filter === f.id ? ' active' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              <i {...C} aria-hidden="true" className={`fas ${f.icon}`}></i>
              <span {...C}>{f.label}</span>
            </button>
          ))}
        </nav>
        {loading && <p {...C} role="status" className="market-message">Loading lottery markets…</p>}
        {error && (
          <div {...C} role="alert" className="market-message">
            {' Unable to load lottery markets. '}
            <button {...C} type="button" className="retry-button" onClick={load}>Try again</button>
          </div>
        )}
        {!loading && !error && !markets.length && (
          <p {...C} role="status" className="market-message"> No markets available in this category. </p>
        )}
        {!loading && !error && (
          <div {...C} className="lottery-grid">
            {markets.map((m, i) => {
              const open = countdown(m.opensAt, now);
              const close = countdown(m.closesAt, now);
              return (
                <Link
                  {...C}
                  key={m.eventId}
                  to={`/lottery/66104/${m.eventId}`}
                  aria-label={`${m.eventName} — View market`}
                  className={`market-card${i % 3 === 1 ? ' card-ruby' : ''}${i % 3 === 2 ? ' card-amber' : ''}`}
                >
                  <img {...C} alt="" loading="lazy" className="market-image" src={m.url} onError={(e) => { e.target.style.visibility = 'hidden'; }} />
                  <div {...C} className="market-shade"></div>
                  <div {...C} className="market-content">
                    <h2 {...C} className="market-name">{m.eventName}</h2>
                    <div {...C} className="market-details">
                      <div {...C} className="market-time">
                        <span {...C} className="detail-label">
                          <i {...C} aria-hidden="true" className="far fa-clock"></i>
                          {` ${open && open !== 'Closed' ? 'Open ends in' : 'Open Time'}`}
                        </span>
                        <span {...C} className="detail-value">{open ?? (m.opensAt != null ? ngDate(m.opensAt, 'h:mm a') : 'Not available')}</span>
                      </div>
                      <div {...C} className="market-time">
                        <span {...C} className="detail-label">
                          <i {...C} aria-hidden="true" className="fas fa-hourglass-half"></i>
                          {` ${close && close !== 'Closed' ? 'Close ends in' : 'Close Time'}`}
                        </span>
                        <span {...C} className="detail-value closing-time">{close ?? (m.closesAt != null ? ngDate(m.closesAt, 'h:mm a') : 'Not available')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <aside {...C} className="lottery-help">
          <span {...C} aria-hidden="true" className="help-icon">
            <i {...C} className="fas fa-info"></i>
          </span>
          <div {...C}>
            <h3 {...C}>How it works?</h3>
            <p {...C}>
              Choose a market, select your lucky numbers and place your bet before the closing time.
              <br {...C} />
              {' Results will be available at the draw time.'}
            </p>
          </div>
          <span {...C} aria-hidden="true" className="help-coins">
            <i {...C} className="fas fa-coins"></i>
          </span>
        </aside>
      </section>
    </app-lottery>
  );
}
