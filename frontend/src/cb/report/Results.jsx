import { useEffect, useMemo, useState } from 'react';
import { getEventMarketResults, getSportsResults } from '../../apiservices/reportService';
import useDarkTheme from '../useTheme';
import { fmtDate } from './parts';

// The reference's sport list, with tenexch's ids for the two racing codes
// (10 / 65 instead of 7 / 4339).
const SPORTS = [
  { value: 4, label: 'Cricket' },
  { value: 1, label: 'Football' },
  { value: 2, label: 'Tennis' },
  { value: 10, label: 'Horse' },
  { value: 65, label: 'Greyhound' },
  { value: 400, label: 'Kabaddi' },
  { value: 500, label: 'Election' },
];

/** The popup behind a result row: every market that event settled. */
function MarketResultModal({ event, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!event?.event_id) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const result = await getEventMarketResults(event.event_id);
        if (alive) setItems(result?.isSuccess ? result.items || [] : []);
      } catch (err) {
        console.error('Result API error', err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [event?.event_id]);

  return (
    <div
      id="marketresultspopup"
      className="modal fade show reportallpopup"
      style={{ display: 'block' }}
      tabIndex="-1"
      role="dialog"
      aria-labelledby="myModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-md modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title mt-0" id="myModalLabel">
              Market Result
            </h5>
            <button
              onClick={onClose}
              type="button"
              className="closebtn"
              data-dismiss="modal"
              aria-hidden="true"
            >
              ×
            </button>
          </div>
          <div className="modal-body pb-0">
            <div className="table-responsive">
              <table className="table table-sm mb-1 table-bordered reporttable">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Winner</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={3} className="text-center">
                        Loading......
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    items.map((item, i) => (
                      <tr key={`${item.marketId}-${i}`}>
                        <td>{item.marketName || ''}</td>
                        <td>{item.winnerName || ''}</td>
                        <td>{fmtDate(item.createdAt)}</td>
                      </tr>
                    ))}
                  {!loading && items.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center">
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm waves-effect mx-auto"
              data-dismiss="modal"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </div>
  );
}

/**
 * Results.
 *
 * Declared events for one sport, today's or yesterday's, each row opening that
 * event's market results. No date range and no paging — the reference serves
 * both days in a single call per sport.
 *
 * tenexch has no declared-results route yet, so this reads "No Data Found"
 * until one exists. docs/BACKEND-GAPS.md says what it has to return.
 */
function Results() {
  const dark = useDarkTheme();
  const [sportId, setSportId] = useState(4);
  const [day, setDay] = useState('TODAY');
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const result = await getSportsResults(sportId);
        if (alive) setPayload(result?.isSuccess ? result : result || null);
      } catch (err) {
        console.error('Results api error', err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [sportId]);

  const rows = useMemo(() => {
    if (!payload) return [];
    return (day === 'TODAY' ? payload.today_result : payload.yesterday_result) || [];
  }, [payload, day]);

  return (
    <div>
      <div className="sectionbox r-title mt-0">Results</div>
      <div className="mt-0 p-2 rmain-title sportscardRow min-height500">
        <div className="resport-search">
          <div className="align-items-center d-flex justify-content-between mb-2">
            <div className="groupbtn" role="group" aria-label="Basic example" id="">
              <button className="btn reportbtn" onClick={() => setDay('TODAY')}>
                Today
              </button>
              <button className="btn reportbtn ml-1" onClick={() => setDay('YESTERDAY')}>
                Yesterday
              </button>
            </div>
            <div className="form-group font-12 w-160">
              <select
                title="Event type"
                className={`form-select ${dark ? 'darkarrow' : ''}`}
                value={sportId}
                onChange={(e) => setSportId(Number(e.target.value))}
              >
                {SPORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-sm mb-1 table-bordered reporttable">
              <thead>
                <tr>
                  <th className="td140">Date</th>
                  <th>Event Name</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={2} className="text-center">
                      Loading......
                    </td>
                  </tr>
                )}
                {!loading &&
                  rows.map((row, i) => {
                    const label = `${row.competition_name}-${row.event_name} [${fmtDate(row.open_date)}]`;
                    return (
                      <tr key={`${row.event_id}_${i}`}>
                        <td className="text-left"> {fmtDate(row.declared_date)}</td>
                        <td title={label} onClick={() => setEvent(row)}>
                          <a className="undline">{label}</a>
                        </td>
                      </tr>
                    );
                  })}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center">
                      {payload?.message || 'No Data Found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {event && <MarketResultModal event={event} onClose={() => setEvent(null)} />}
    </div>
  );
}

export default Results;
