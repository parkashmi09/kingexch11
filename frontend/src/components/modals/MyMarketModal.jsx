import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../apiservices/axiosClient';
import { isDemoUser, getDemoOpenBets } from '../../utils/demoStore';

// BootstrapVue-style incrementing component ids (__BVID__4233 etc.)
let bvidCounter = 4232;

const SPORT_NAMES = { 1: 'Football', 2: 'Tennis', 4: 'Cricket' };

// Match start time → reference format "DD/MM/YYYY HH:mm:ss (UTC+05:30)". The API
// sends UTC ISO ("2026-07-25T17:00:00.000Z"); render it in IST (Asia/Kolkata)
// explicitly so it's correct regardless of the viewer's timezone.
function formatMatchTime(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(d);
  const g = (t) => parts.find((p) => p.type === t)?.value || '';
  // en-GB emits "24" for midnight — normalise to "00"
  const hour = g('hour') === '24' ? '00' : g('hour');
  return `${g('day')}/${g('month')}/${g('year')} ${hour}:${g('minute')}:${g('second')} (UTC+05:30)`;
}

/* Build my-market boxes from demo bets stored in localStorage:
   one box per event, one desc row per market type with its trade count. */
function buildDemoBoxes() {
  const { matchedBets } = getDemoOpenBets();
  const byEvent = {};
  for (const b of matchedBets || []) {
    const key = String(b.event_id || b.market_id || '');
    (byEvent[key] ||= []).push(b);
  }
  return Object.values(byEvent).map(bets => {
    const first = bets[0];
    const sportId = Number(first.sport_id) || 4;
    const sportName = SPORT_NAMES[sportId] || first.sports || 'Cricket';
    const byMarket = {};
    for (const b of bets) {
      const mk = b.marketType || '--';
      byMarket[mk] = (byMarket[mk] || 0) + 1;
    }
    return {
      sportId,
      // gmid of the match — the box click opens /gamedetails/{sportId}/{eventId}
      eventId: String(first.event_id ?? ''),
      title: `${sportName} -> ${first.event_name || '--'}`,
      time: formatMatchTime(first.match_time || ''),
      markets: Object.entries(byMarket).map(([name, count]) => ({ name, value: count })),
    };
  });
}

/* Build boxes from the real exposure API rows, grouped per match (gmid). */
function buildApiBoxes(rows) {
  const byMatch = {};
  for (const row of rows || []) {
    // Group by event_id (the gmid) — one box per MATCH. `match_id` is the
    // per-MARKET id (differs for Normal / Over By Over / oddeven of the same
    // game), so grouping on it wrongly split one match into several boxes.
    const key = String(row.event_id ?? row.event_name ?? '');
    (byMatch[key] ||= []).push(row);
  }
  return Object.values(byMatch).map(group => {
    const first = group[0];
    const sportId = Number(first.sport_id) || 4;
    const sportName = SPORT_NAMES[sportId] || first.event_type || first.game_type || '--';
    return {
      sportId,
      // `event_id` is the gmid (the API's `match_id` is the per-MARKET id), so it
      // is what /gamedetails/:sid/:gmid expects.
      eventId: String(first.event_id ?? ''),
      title: `${sportName} -> ${first.event_name || first.match_name || '--'}`,
      time: formatMatchTime(first.match_time || first.stime || first.match_date || ''),
      // Desc row = the MARKET name (Bookmaker, Tied Match, …), never the match
      // title — using match_name here duplicated the box heading.
      markets: group.map(row => ({
        name: row.market_name || row.market_type || row.game_type || row.match_name || '--',
        value: row.trade ?? row.bet_count ?? 1,
      })),
    };
  });
}

/* "My Market" modal — opens when the header exposure value is clicked.
   Lists the markets the user currently has exposure on, one my-market-box
   per event (reference layout). Works for both real and demo users. */
function MyMarketModal({ show, onClose, userId }) {
  const bvid = useRef(`__BVID__${++bvidCounter}`).current;
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(s => s.user);
  const navigate = useNavigate();

  // BootstrapVue marks the body while a modal is open
  useEffect(() => {
    if (!show) return;
    document.body.classList.add('modal-open');
    document.body.setAttribute('data-modal-open-count', '1');
    return () => {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-modal-open-count');
    };
  }, [show]);

  useEffect(() => {
    if (!show) {
      setBoxes([]);
      return;
    }
    // Demo: build straight from the local demo bets — no API
    if (isDemoUser(user)) {
      setBoxes(buildDemoBoxes());
      return;
    }
    if (!userId) {
      setBoxes([]);
      return;
    }
    let mounted = true;
    setLoading(true);
    api.get(`/d99/bets/exposure/${userId}`)
      .then((res) => {
        if (mounted) setBoxes(buildApiBoxes(Array.isArray(res.data?.data) ? res.data.data : []));
      })
      .catch(() => { if (mounted) setBoxes([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [show, userId, user]);

  if (!show) return null;

  // Box click → the match's detail page. `sportId`/`eventId` map 1:1 to the
  // /gamedetails/:sid/:gmid route; if either is missing we do nothing rather
  // than navigate to a half-built "/gamedetails//<id>" URL.
  const openEvent = (box) => {
    if (!box.sportId || !box.eventId) return;
    onClose();
    navigate(`/gamedetails/${box.sportId}/${box.eventId}`);
  };

  return createPortal(
    <div id={`${bvid}___BV_modal_outer_`} style={{ position: 'absolute', zIndex: 1040 }}>
      <div
        id={bvid}
        role="dialog"
        aria-labelledby={`${bvid}___BV_modal_title_`}
        aria-describedby={`${bvid}___BV_modal_body_`}
        className="modal fade show"
        aria-modal="true"
        style={{ display: 'block' }}
      >
        <div className="modal-dialog modal-lg">
          <span tabIndex={0}></span>
          <div id={`${bvid}___BV_modal_content_`} tabIndex={-1} className="modal-content">
            <header id={`${bvid}___BV_modal_header_`} className="modal-header">
              <h5 id={`${bvid}___BV_modal_title_`} className="modal-title">My Market</h5>
              <button type="button" aria-label="Close" className="close" onClick={onClose}>×</button>
            </header>
            <div id={`${bvid}___BV_modal_body_`} className="modal-body">
              <div>
                {loading ? (
                  <p>Loading...</p>
                ) : boxes.length === 0 ? (
                  <p>There are no markets data!</p>
                ) : (
                  boxes.map((box, i) => {
                    const canOpen = Boolean(box.sportId && box.eventId);
                    return (
                    <div
                      key={i}
                      className="my-market-box"
                      onClick={canOpen ? () => openEvent(box) : undefined}
                      style={canOpen ? { cursor: 'pointer' } : undefined}
                    >
                      <div className={`my-market-box-title sport${box.sportId}`}>
                        <span>{box.title}</span>
                        <span>{box.time}</span>
                      </div>
                      <div className="my-market-box-desc">
                        {box.markets.map((mk, j) => (
                          <div key={j} className="row row5 mt-1">
                            <div className="col-6">{mk.name}</div>
                            <div className="col-6 text-right">{mk.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <span tabIndex={0}></span>
        </div>
      </div>
      <div id={`${bvid}___BV_modal_backdrop_`} className="modal-backdrop" onClick={onClose}></div>
    </div>,
    document.body
  );
}

export default MyMarketModal;
