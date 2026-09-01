import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getCurrentSportsBets, getCurrentCasinoBets } from '../apiservices/reportService';
import html2pdf from 'html2pdf.js';
import { getGameConfig } from '../config/casinoGames';
import { exportToExcel, exportToPDF } from '../utils/exportTable';
import FullScreenLoader from '../components/FullScreenLoader';
import { FAKE_LOADER_MS } from '../utils/fakeLoader';
import { bToastError } from '../components/BToast';

// sport_id → display name (reference shows e.g. "Football", "Cricket")
const SPORT_NAMES = {
  1: 'Football',
  2: 'Tennis',
  4: 'Cricket',
  7: 'Basketball',
  8: 'Table Tennis',
  10: 'Horse Racing',
  18: 'Volleyball',
  24: 'Ice Hockey',
  61: 'Handball',
  62: 'Badminton',
  65: 'Greyhound Racing',
};

// "148.0000" → 148, "100.00" → 100, "1.3600" → 1.36 (reference trims zeros)
function trimNum(v) {
  if (v === null || v === undefined || v === '') return '-';
  const n = parseFloat(v);
  return isNaN(n) ? v : n;
}

function CurrentBets() {
  const [activeTab, setActiveTab] = useState('sports');
  const [betStatus, setBetStatus] = useState('matchbet');
  const [betTypeFilter, setBetTypeFilter] = useState('all');
  const [entries, setEntries] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  // Auto-fetch as soon as the page lands: the default view (Sports → Matched)
  // loads immediately, no tab/radio click required. Interactions still re-fetch.
  const [hasFetched, setHasFetched] = useState(true);
  // Cosmetic boot loader: show the full-screen gif for 1s when the page opens.
  // On a hard refresh the boot splash hides .wrapper for ~2.3s (app-loading on
  // <body>), so start the 1s countdown only AFTER the splash lifts — otherwise
  // the timer would expire while the page is still hidden and never be seen.
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let timer;
    const start = () => { timer = setTimeout(() => setInitialLoading(false), FAKE_LOADER_MS); };

    if (!document.body.classList.contains('app-loading')) {
      start(); // SPA navigation — no boot splash, count down immediately
      return () => clearTimeout(timer);
    }

    const obs = new MutationObserver(() => {
      if (!document.body.classList.contains('app-loading')) {
        obs.disconnect();
        start();
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    // Safety net: never leave the loader up forever if the class removal is missed
    const fallback = setTimeout(() => setInitialLoading(false), 5000);
    return () => { obs.disconnect(); clearTimeout(timer); clearTimeout(fallback); };
  }, []);

  const currentUser = useSelector((state) => state.user.user);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'sports') {
        const result = await getCurrentSportsBets({
          page,
          limit: entries,
          search: searchTerm,
          betType: betTypeFilter,
          status: betStatus,
        });
        if (result && result.success) {
          const rows = result.data || [];
          setData(rows);
          setTotalRecords(result.pagination?.total || rows.length);
          if (rows.length === 0) bToastError('No Record Found.');
        } else {
          setData([]);
          setTotalRecords(0);
          bToastError('No Record Found.');
        }
      } else {
        const userId = currentUser?.user_id || currentUser?.id || null;
        if (!userId) {
          setData([]);
          setLoading(false);
          return;
        }
        const result = await getCurrentCasinoBets(userId);
        if (result && result.success) {
          const rows = result.bets || [];
          setData(rows);
          setTotalRecords(rows.length);
          if (rows.length === 0) bToastError('No Record Found.');
        } else {
          setData([]);
          setTotalRecords(0);
          bToastError('No Record Found.');
        }
      }
    } catch {
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, betStatus, betTypeFilter, entries, page, searchTerm, currentUser]);

  useEffect(() => {
    if (!hasFetched) return;
    const timeout = setTimeout(() => {
      fetchData();
    }, searchTerm ? 500 : 0);
    return () => clearTimeout(timeout);
  }, [fetchData, hasFetched]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, betStatus, betTypeFilter, entries]);

  const filteredData = (() => {
    let rows = [...data];
    if (activeTab === 'casino') {
      if (betTypeFilter !== 'all') {
        rows = rows.filter((r) => (r.bet_type || r.type || '').toLowerCase() === betTypeFilter);
      }
      if (searchTerm.trim()) {
        rows = rows.filter((r) =>
          Object.values(r).some((v) =>
            String(v).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
      rows = rows.slice(0, entries);
    }
    return rows;
  })();

  const totalBets = activeTab === 'sports' ? totalRecords : filteredData.length;
  // Reference renders plain numbers (100, not 100.00)
  const totalAmount = parseFloat(filteredData
    .reduce((sum, r) => sum + parseFloat(r.stake_amount || r.stake || 0), 0)
    .toFixed(2));

  const totalPages = Math.max(1, Math.ceil(totalRecords / entries));

  // Reference: with no data the bet-type radios sit unchecked + disabled and
  // the export icons are marked disabled (excel wrapper gets export_<ts> id).
  const hasData = data.length > 0;
  const exportDisabled = filteredData.length === 0;
  const exportId = useRef(`export_${Date.now()}`).current;

  const formatDate = (val) => {
    if (!val) return '-';
    const d = new Date(val);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss} (UTC+05:30)`;
  };

  // Casino bet ka result: worker settle karta hai (won/lost) ya admin void karta
  // hai (void). Jab tak dono me se kuch na ho, bet abhi chal rahi hai.
  const casinoStatus = (r) => {
    const rs = String(r.result_status || '').toLowerCase();
    if (rs === 'void' || rs === 'refund' || rs === 'cancelled') return { label: 'VOID', cls: 'text-muted' };
    if (rs === 'won') return { label: 'WON', cls: 'text-success' };
    if (rs === 'lost' || rs === 'loss') return { label: 'LOST', cls: 'text-danger' };
    return { label: 'PENDING', cls: 'text-warning' };
  };

  const rowBetClass = (r) => {
    const t = (r.bet_type || r.type || '').toLowerCase();
    if (t === 'back' || t === 'yes') return 'back-border';
    if (t === 'lay' || t === 'no') return 'lay-border';
    return '';
  };

  const casinoGameName = (gtype) => {
    if (!gtype) return '-';
    const cfg = getGameConfig(gtype);
    return cfg.name || gtype;
  };

  const getExportColumns = () => {
    if (activeTab === 'casino') {
      return [
        { label: 'Event Name', getValue: (r) => casinoGameName(r.game_name) },
        { label: 'Nation', getValue: (r) => r.player_name || r.selection || '-' },
        { label: 'User Rate', getValue: (r) => r.odds || '-' },
        { label: 'Amount', getValue: (r) => r.stake || '-' },
        { label: 'Type', getValue: (r) => r.type || '-' },
        { label: 'Place Date', getValue: (r) => formatDate(r.created_at) },
        { label: 'Status', getValue: (r) => casinoStatus(r).label },
      ];
    }
    return [
      { label: 'Sports', getValue: (r) => r.sport_name || '-' },
      { label: 'Event Name', getValue: (r) => r.match_title || r.event_name || '-' },
      { label: 'Market Name', getValue: (r) => r.market_name || r.market || '-' },
      { label: 'Nation', getValue: (r) => r.selection_name || r.selection || '-' },
      { label: 'User Rate', getValue: (r) => r.odds || r.user_rate || '-' },
      { label: 'Amount', getValue: (r) => r.stake_amount || r.stake || '-' },
      { label: 'Place Date', getValue: (r) => formatDate(r.created_at || r.placed_at) },
    ];
  };

  const handleExport = (type) => {
    const cols = getExportColumns();
    const title = activeTab === 'casino' ? 'Casino Current Bets' : 'Sports Current Bets';

    if (type === 'pdf' && activeTab === 'casino') {
      const thStyle = 'padding:8px 10px;text-align:left;font-weight:bold;white-space:nowrap;color:#fff;background:#4A90E2;';
      const tdStyle = 'padding:8px 10px;color:#555555;white-space:nowrap;background:#f2f2f2;';
      const rowsHtml = filteredData.map((r) =>
        `<tr><td style="${tdStyle}">${casinoGameName(r.game_name)}</td><td style="${tdStyle}">${r.player_name || r.selection || '-'}</td><td style="${tdStyle}">${r.type || '-'}</td><td style="${tdStyle}">${r.odds || '-'}</td><td style="${tdStyle}">${r.stake || '-'}</td><td style="${tdStyle}">${formatDate(r.created_at)}</td><td style="${tdStyle}">${casinoStatus(r).label}</td></tr>`
      ).join('');

      const el = document.createElement('div');
      el.innerHTML = `<div style="padding:20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333;background:#fff;"><h1 style="font-weight:normal;font-size:22px;color:#555;margin:0 0 16px 0;">Casino Current Bets</h1><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr><th style="${thStyle}">Event Name</th><th style="${thStyle}">Nation</th><th style="${thStyle}">Type</th><th style="${thStyle}">User Rate</th><th style="${thStyle}">Amount</th><th style="${thStyle}">Place Date</th><th style="${thStyle}">Status</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
      document.body.appendChild(el);

      html2pdf().set({
        margin: 10,
        filename: 'Casino current Bets.pdf',
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      }).from(el.firstChild).save().then(() => {
        document.body.removeChild(el);
      });
      return;
    }

    if (type === 'pdf') exportToPDF(filteredData, cols, title);
    else exportToExcel(filteredData, cols, title.replace(/ /g, '_'));
  };

  return (
    <div className="report-box">
      {(loading || initialLoading) && <FullScreenLoader />}
      <div className="report-title">
        <div className="report-name">Current Bets</div>
        <div className="report-search search-box">
          <div className="form-group mb-0">
            <input
              type="text"
              placeholder="Search"
              className="form-control"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setHasFetched(true); }}
            />
            <img src="/assets/icons/search.svg" className="search-icon" alt="search" />
          </div>
        </div>
      </div>

      {/* Sports / Casino tabs */}
      <div className="casino-report-tabs">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              data-toggle="tab"
              href="javascript:void(0)"
              className={`nav-link${activeTab === 'sports' ? ' active' : ''}`}
              onClick={() => { setActiveTab('sports'); setHasFetched(true); }}
            >
              Sports
            </a>
          </li>
          <li className="nav-item">
            <a
              data-toggle="tab"
              href="javascript:void(0)"
              className={`nav-link${activeTab === 'casino' ? ' active' : ''}`}
              onClick={() => { setActiveTab('casino'); setHasFetched(true); }}
            >
              Casino
            </a>
          </li>
        </ul>
      </div>

      {/* Radio filters: Matched / Un-Matched / Deleted */}
      <div className="report-form">
        <div className="custom-control custom-radio custom-control-inline">
          <input
            type="radio"
            id="customRadio"
            name="example"
            value="matchbet"
            className="custom-control-input"
            checked={betStatus === 'matchbet'}
            onClick={() => setHasFetched(true)}
            onChange={(e) => setBetStatus(e.target.value)}
          />
          <label htmlFor="customRadio" className="custom-control-label">Matched</label>
        </div>
        <div className="custom-control custom-radio custom-control-inline">
          <input
            type="radio"
            id="unmatchbetRadio"
            name="example"
            value="unmatchbet"
            className="custom-control-input"
            checked={betStatus === 'unmatchbet'}
            onClick={() => setHasFetched(true)}
            onChange={(e) => setBetStatus(e.target.value)}
          />
          <label htmlFor="unmatchbetRadio" className="custom-control-label">Un-Matched</label>
        </div>
        <div className="custom-control custom-radio custom-control-inline">
          <input
            type="radio"
            id="customRadio2"
            name="example"
            value="deletebet"
            className="custom-control-input"
            checked={betStatus === 'deletebet'}
            onClick={() => setHasFetched(true)}
            onChange={(e) => setBetStatus(e.target.value)}
          />
          <label htmlFor="customRadio2" className="custom-control-label">Deleted</label>
        </div>
      </div>

      {/* Page count + bet type filters + totals + export icons */}
      <div className="report-page-count">
        {/* The gaps around the select are whitespace text nodes in the
            reference markup — JSX strips them, so they must be explicit */}
        <div className="form-group mb-0">
          <label>Show</label>
          {' '}
          <select
            className="form-control"
            value={entries}
            onChange={(e) => { setEntries(Number(e.target.value)); setHasFetched(true); }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
          </select>
          {' '}
          <label>Entries</label>
        </div>
        <div className="bet-types-container">
          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              id="soda-all"
              name="betType"
              value="all"
              className="custom-control-input"
              checked={hasData && betTypeFilter === 'all'}
              disabled={!hasData}
              onClick={() => setHasFetched(true)}
              onChange={(e) => setBetTypeFilter(e.target.value)}
            />
            <label htmlFor="soda-all" className="custom-control-label">All</label>
          </div>
          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              id="soda-back"
              name="betType"
              value="back"
              className="custom-control-input"
              checked={hasData && betTypeFilter === 'back'}
              disabled={!hasData}
              onClick={() => setHasFetched(true)}
              onChange={(e) => setBetTypeFilter(e.target.value)}
            />
            <label htmlFor="soda-back" className="custom-control-label">Back</label>
          </div>
          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              id="soda-lay"
              name="betType"
              value="lay"
              className="custom-control-input"
              checked={hasData && betTypeFilter === 'lay'}
              disabled={!hasData}
              onClick={() => setHasFetched(true)}
              onChange={(e) => setBetTypeFilter(e.target.value)}
            />
            <label htmlFor="soda-lay" className="custom-control-label">Lay</label>
          </div>
        </div>
        <div className="custom-control-inline">
          <div>
            Total Bets: <span className="mr-2">{totalBets}</span>
            Total Amount: <span>{totalAmount}</span>
          </div>
        </div>
        <div className="file-icons">
          <div onClick={() => !exportDisabled && handleExport('pdf')} style={exportDisabled ? undefined : { cursor: 'pointer' }}>
            <i className={`fas fa-file-pdf${exportDisabled ? ' disabled' : ''}`}></i>
          </div>
          <div id={exportId} onClick={() => !exportDisabled && handleExport('excel')} style={exportDisabled ? undefined : { cursor: 'pointer' }}>
            <i className={`fas fa-file-excel${exportDisabled ? ' disabled' : ''}`}></i>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="report-table current-bets table-responsive">
        {activeTab === 'casino' ? (
          <table className="table table-hover">
            <thead>
              <tr>
                <th className="bet-event-name">Event Name</th>
                <th className="bet-market-name">Nation</th>
                <th className="text-right bet-user-rate">User Rate</th>
                <th className="text-right bet-amount">Amount</th>
                <th className="bet-date">Place Date</th>
                <th className="text-center bet-status">Status</th>
                <th className="text-right bet-user-rate">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr className="no-record">
                  <td colSpan={6}>no records found</td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const bc = rowBetClass(item);
                  return (
                    <tr key={item.id || index} className={bc}>
                      <td className="bet-event-name"><div className="ifTooltip">{casinoGameName(item.game_name)}</div></td>
                      <td className="bet-market-name"><div className="ifTooltip">{item.player_name || item.selection || '-'}</div></td>
                      <td className="text-right bet-user-rate"><div>{item.odds || '-'}</div></td>
                      <td className="text-right bet-amount"><div>{item.stake || '-'}</div></td>
                      <td className="bet-date"><div>{formatDate(item.created_at)}</div></td>
                      <td className="text-right bet-user-rate">
                        <div className="custom-control custom-checkbox">
                          <input type="checkbox" className="custom-control-input" id={`cb_${item.id || index}`} />
                          <label className="custom-control-label" htmlFor={`cb_${item.id || index}`}></label>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th className="bet-sport">Sports</th>
                <th className="bet-event-name">Event Name</th>
                <th className="bet-nation">Market Name</th>
                <th className="bet-market-name">Nation</th>
                <th className="text-right bet-user-rate">User Rate</th>
                <th className="text-right bet-amount">Amount</th>
                <th className="bet-date">Place Date</th>
                <th className="text-right bet-user-rate">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr className="no-record">
                  <td colSpan={9}>no records found</td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const bc = rowBetClass(item);
                  const checkboxId = `current-bet-${item.id || index}`;
                  return (
                    <tr key={item.id || index} className={bc}>
                      <td className="bet-sport"><div>{SPORT_NAMES[item.sport_id] || item.sport_name || '-'}</div></td>
                      <td className="bet-event-name"><div className="ifTooltip">{item.match_title || item.event_name || '-'}</div></td>
                      <td className="bet-nation"><div className="ifTooltip">{item.market_type || item.market_name || item.market || '-'}</div></td>
                      <td className="bet-market-name"><div className="ifTooltip">{item.selection_name || item.selection || '-'}</div></td>
                      <td className="text-right bet-user-rate"><div>{trimNum(item.odds ?? item.user_rate)}</div></td>
                      <td className="text-right bet-amount"><div>{trimNum(item.stake_amount ?? item.stake)}</div></td>
                      <td className="bet-date"><div>{formatDate(item.created_at || item.placed_at)}</div></td>
                      <td className="text-center bet-status">
                        <div className={`font-weight-bold ${casinoStatus(item).cls}`}>{casinoStatus(item).label}</div>
                      </td>
                      <td className="text-right bet-user-rate">
                        <div className="custom-control custom-checkbox">
                          <input type="checkbox" className="custom-control-input" value="0" id={checkboxId} />
                          <label className="custom-control-label" htmlFor={checkboxId}></label>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination (sports only — server-side) */}
      {activeTab === 'sports' && totalRecords > 0 && (
        <div className="report-pagination">
          <button
            className="btn btn-default"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            First
          </button>
          <button
            className="btn btn-default"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button
            className="btn btn-default"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
          <button
            className="btn btn-default"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}

export default CurrentBets;
