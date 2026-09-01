import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../apiservices/axiosClient';
import FullScreenLoader from '../components/FullScreenLoader';
import { FAKE_LOADER_MS } from '../utils/fakeLoader';
import { bToastError } from '../components/BToast';
import { exportToExcel, exportToPDF } from '../utils/exportTable';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const oh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const om = String(Math.abs(offset) % 60).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss} (UTC${sign}${oh}:${om})`;
}

function FraudReport() {
  const [entries, setEntries] = useState(25);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const user = useSelector((s) => s.user.user);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = user?.user_id || user?.id;
      const res = await api.get('/user/fraud-report', { params: { user_id: userId, page, limit: entries } });
      const result = res.data;
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
        if (result.data.length === 0) bToastError('No Record Found.');
      } else {
        setData([]);
        bToastError('No Record Found.');
      }
    } catch {
      setData([]);
      bToastError('No Record Found.');
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [user, page, entries]);

  // Cosmetic boot gate: on a hard refresh the boot splash hides the page for
  // ~2.3s (`app-loading` on <body>) — firing the fetch at mount would toast
  // "No Record Found." while the splash is still up. Wait for the splash to
  // lift, hold the page loader briefly, THEN fetch.
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let started = false;
    let timer;
    const start = () => {
      if (started) return;
      started = true;
      setInitialLoading(false);
      fetchData();
    };

    if (!document.body.classList.contains('app-loading')) {
      timer = setTimeout(start, FAKE_LOADER_MS); // SPA navigation — no splash
      return () => clearTimeout(timer);
    }

    const obs = new MutationObserver(() => {
      if (!document.body.classList.contains('app-loading')) {
        obs.disconnect();
        timer = setTimeout(start, FAKE_LOADER_MS);
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    // Safety net: never leave the page stuck if the class removal is missed
    const fallback = setTimeout(start, 6000);
    return () => { obs.disconnect(); clearTimeout(timer); clearTimeout(fallback); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasFetched) fetchData();
  }, [page, entries]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredData = searchTerm.trim()
    ? data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const totalPages = Math.max(1, Math.ceil(filteredData.length / entries));
  const pagedData = filteredData.slice((page - 1) * entries, page * entries);

  // Reference marks export icons disabled while there is nothing to export,
  // and gives the excel wrapper a per-mount export_<timestamp> id.
  const exportId = useRef(`export_${Date.now()}`).current;
  const exportDisabled = filteredData.length === 0;

  const getExportColumns = () => [
    { label: 'File', getValue: (r) => r.file || '-' },
    { label: 'Event Name', getValue: (r) => r.event_name || '-' },
    { label: 'Market Date', getValue: (r) => formatDate(r.market_date) },
    { label: 'Market Name', getValue: (r) => r.market_name || '-' },
    { label: 'Amount', getValue: (r) => r.amount || 0 },
    { label: 'Fraud Date', getValue: (r) => formatDate(r.fraud_date) },
    { label: 'Remark', getValue: (r) => r.remark || '-' },
  ];

  const handleExport = (type) => {
    const cols = getExportColumns();
    if (type === 'pdf') exportToPDF(filteredData, cols, 'Fraud Report');
    else exportToExcel(filteredData, cols, 'Fraud_Report');
  };

  return (
    <div className="report-box">
      {(loading || initialLoading) && <FullScreenLoader />}

      <div className="report-title">
        <div className="report-name">Fraud Report</div>
        <div className="report-search search-box">
          <div className="form-group mb-0">
            <input
              type="text"
              placeholder="Search"
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img src="/assets/icons/search.svg" className="search-icon" alt="search" />
          </div>
        </div>
      </div>

      <div className="report-page-count">
        {/* The gaps around the select are whitespace text nodes in the
            reference markup — JSX strips them, so they must be explicit */}
        <div className="form-group mb-0">
          <label>Show</label>
          {' '}
          <select className="form-control" value={entries} onChange={(e) => { setEntries(Number(e.target.value)); setPage(1); }}>
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
        <div className="file-icons">
          <div onClick={() => !exportDisabled && handleExport('pdf')}>
            <i className={`fas fa-file-pdf${exportDisabled ? ' disabled' : ''}`}></i>
          </div>
          <div id={exportId} onClick={() => !exportDisabled && handleExport('excel')}>
            <i className={`fas fa-file-excel${exportDisabled ? ' disabled' : ''}`}></i>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="report-table d-none-mobile">
        <table className="table table-hover">
          <thead>
            <tr>
              <th className="bet-file"><div>File</div></th>
              <th className="bet-event-name"><div>Event Name</div></th>
              <th className="bet-date"><div>Market Date</div></th>
              <th className="bet-event-name"><div>Market Name</div></th>
              <th className="text-right bet-amount"><div>Amount</div></th>
              <th className="bet-date"><div>Fraud Date</div></th>
              <th className="bet-remark"><div>Remark</div></th>
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr className="no-record"><td colSpan="7">no records found</td></tr>
            ) : (
              pagedData.map((item, index) => (
                <tr key={index}>
                  <td className="bet-file"><div>{item.file || '-'}</div></td>
                  <td className="bet-event-name"><div>{item.event_name || '-'}</div></td>
                  <td className="bet-date"><div>{formatDate(item.market_date)}</div></td>
                  <td className="bet-event-name"><div>{item.market_name || '-'}</div></td>
                  <td className="text-right bet-amount"><div>{item.amount || 0}</div></td>
                  <td className="bet-date"><div>{formatDate(item.fraud_date)}</div></td>
                  <td className="bet-remark"><div>{item.remark || '-'}</div></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="report-table d-none-desktop">
        {pagedData.length === 0 ? (
          <div className="report-row no-record">no records found</div>
        ) : (
          pagedData.map((item, index) => (
            <div className="report-row" key={index}>
              <div><span className="bet-heading">File</span> <span>{item.file || '-'}</span></div>
              <div><span className="bet-heading">Event Name</span> <span>{item.event_name || '-'}</span></div>
              <div><span className="bet-heading">Market Date</span> <span>{formatDate(item.market_date)}</span></div>
              <div><span className="bet-heading">Market Name</span> <span>{item.market_name || '-'}</span></div>
              <div><span className="bet-heading">Amount</span> <span>{item.amount || 0}</span></div>
              <div><span className="bet-heading">Fraud Date</span> <span>{formatDate(item.fraud_date)}</span></div>
              <div><span className="bet-heading">Remark</span> <span>{item.remark || '-'}</span></div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {hasFetched && pagedData.length > 0 && totalPages > 0 && (
        <ul className="pagination justify-content-center mt-2">
          <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
            <a tabIndex={page === 1 ? -1 : 0} className="page-link" onClick={() => page > 1 && setPage(1)}>&lt;&lt;</a>
          </li>
          <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
            <a tabIndex={page === 1 ? -1 : 0} className="page-link" onClick={() => page > 1 && setPage(p => p - 1)}>&lt;</a>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
              <a tabIndex={0} className="page-link" onClick={() => setPage(p)}>{p}</a>
            </li>
          ))}
          <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
            <a tabIndex={page === totalPages ? -1 : 0} className="page-link" onClick={() => page < totalPages && setPage(p => p + 1)}>&gt;</a>
          </li>
          <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
            <a tabIndex={page === totalPages ? -1 : 0} className="page-link" onClick={() => page < totalPages && setPage(totalPages)}>&gt;&gt;</a>
          </li>
        </ul>
      )}
    </div>
  );
}

export default FraudReport;
