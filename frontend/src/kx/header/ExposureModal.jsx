import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../apiservices/axiosClient';
import { isDemoUser, getDemoOpenBets } from '../../utils/demoStore';
import KxModal from '../KxModal';

const SPORT_NAMES = { 1: 'Soccer', 2: 'Tennis', 4: 'Cricket' };

// One row per market with open exposure: sport, event, market, trade count —
// the reference's "Exposure Detail" table.
function toRows(list) {
  const byMarket = new Map();
  for (const r of list) {
    const key = `${r.event_id ?? r.event_name}|${r.market_name ?? r.market_type ?? r.marketType ?? ''}`;
    const prev = byMarket.get(key);
    if (prev) { prev.betCounts += Number(r.trade ?? r.bet_count ?? 1); continue; }
    byMarket.set(key, {
      key,
      sportId: Number(r.sport_id) || 4,
      eventId: r.event_id,
      sportName: SPORT_NAMES[Number(r.sport_id)] || r.event_type || r.sports || 'Cricket',
      eventName: r.event_name || r.match_name || '--',
      marketName: r.market_name || r.market_type || r.marketType || '--',
      betCounts: Number(r.trade ?? r.bet_count ?? 1),
    });
  }
  return [...byMarket.values()];
}

/**
 * #exposureModals — opened from the exposure figure in the header. Both
 * headers carry their own copy (desktop id `exposureModalss`), differing only
 * in the table's classes, so the owning header passes those and its scope.
 */
export default function ExposureModal({ open, onClose, id, tableClass, C }) {
  const navigate = useNavigate();
  const user = useSelector((s) => s.user.user);
  const userId = user?.user_id || user?.id;
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!open) return undefined;
    if (isDemoUser(user)) { setRows(toRows(getDemoOpenBets().matchedBets || [])); return undefined; }
    if (!userId) { setRows([]); return undefined; }
    let live = true;
    api.get(`/d99/bets/exposure/${userId}`)
      .then((res) => live && setRows(toRows(Array.isArray(res.data?.data) ? res.data.data : [])))
      .catch(() => live && setRows([]));
    return () => { live = false; };
  }, [open, userId, user]);

  return (
    <KxModal open={open} onClose={onClose} id={id} className="exposureModals" labelledBy="exposureModalLabel" attrs={C}>
      <div {...C} className="modal-dialog modal-md">
        <div {...C} className="modal-content">
          <div {...C} className="modal-header exposure-details">
            <h1 {...C} id="exposureModalLabel" className="modal-title">Exposure Detail</h1>
            <button {...C} type="button" aria-label="Close" className="close" onClick={onClose}>
              <span {...C} aria-hidden="true">×</span>
            </button>
          </div>
          <div {...C} className="modal-body">
            <table {...C} className={tableClass}>
              <thead {...C}>
                <tr {...C} className="theme1font">
                  <th {...C} className="text-center">Sport Name</th>
                  <th {...C} className="text-center" style={{ width: '50%' }}>Event Name</th>
                  <th {...C} className="text-center">Market Name</th>
                  <th {...C} className="text-center">Trade</th>
                </tr>
              </thead>
              {rows.length > 0 ? (
                <tbody {...C}>
                  {rows.map((r) => (
                    <tr key={r.key} {...C} className="exposur_record_row">
                      <td {...C} style={{ padding: '2px 0px' }}>{r.sportName}</td>
                      <td {...C}>
                        <a
                          {...C}
                          className="text-link router-link-exact-active router-link-active"
                          style={{ textDecoration: 'none' }}
                          onClick={() => {
                            onClose();
                            if (r.eventId) navigate(`/gamedetails/${r.sportId}/${r.eventId}`);
                          }}
                        >
                          {r.eventName}
                        </a>
                      </td>
                      <td {...C} className="text-center marketclumn">{r.marketName}</td>
                      <td {...C} className="text-center">{r.betCounts}</td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tfoot {...C}>
                  <tr {...C} className="exposurebody">
                    <td {...C} colSpan={4} className="text-center">No real-time records found</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </KxModal>
  );
}
