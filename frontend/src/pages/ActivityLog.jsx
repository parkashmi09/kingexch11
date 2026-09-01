import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserActivityLogs } from '../apiservices/reportService';
import MxDatePicker from '../components/MxDatePicker';
import FullScreenLoader from '../components/FullScreenLoader';
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

function ActivityLog() {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  })();

  const [fromDate, setFromDate] = useState(weekAgo);
  const [toDate, setToDate] = useState(today);
  const [logType, setLogType] = useState('');
  const [ipModal, setIpModal] = useState(null); // { ip, city, country } or null
  const [entries, setEntries] = useState(25);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchData = useCallback(async (currentPage = page) => {
    setLoading(true);
    try {
      const params = {
        startDate: fromDate,
        endDate: toDate,
        logType,
        page: currentPage,
        limit: entries,
      };
      const result = await getUserActivityLogs(params);
      if (result.success) {
        const rows = result.data?.logs ?? result.data ?? [];
        setData(rows);
        setTotalRecords(result.data?.total ?? result.total ?? 0);
        if (rows.length === 0) bToastError('No Record Found.');
      } else {
        setData([]);
        setTotalRecords(0);
        bToastError('No Record Found.');
      }
    } catch {
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [fromDate, toDate, logType, page, entries]);

  // Re-fetch when page or entries changes after initial submit
  useEffect(() => {
    if (hasFetched) {
      fetchData(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, entries]);

  const handleSubmit = () => {
    setPage(1);
    setHasFetched(true);
    fetchData(1);
  };

  // No auto-fetch on mount — data loads only when the user presses Submit
  // (page/entries changes re-fetch only after the first submit).

  const filteredData = searchTerm.trim()
    ? data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const totalPages = Math.max(1, Math.ceil(totalRecords / entries));

  // Reference marks export icons disabled while there is nothing to export,
  // and gives the excel wrapper a per-mount export_<timestamp> id.
  const exportId = useRef(`export_${Date.now()}`).current;
  const exportDisabled = filteredData.length === 0;

  const getExportColumns = () => [
    { label: 'Username', getValue: (r) => r.username ?? '-' },
    { label: 'Date', getValue: (r) => formatDate(r.createdAt) },
    { label: 'Ip Address', getValue: (r) => r.ip_address ?? '-' },
  ];

  const handleExport = (type) => {
    const cols = getExportColumns();
    if (type === 'pdf') exportToPDF(filteredData, cols, 'Activity Log');
    else exportToExcel(filteredData, cols, 'Activity_Log');
  };

  return (
    <div className="report-box">
      {loading && <FullScreenLoader />}

      <div className="report-title">
        <div className="report-name">Activity Log</div>
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

      <div className="report-form">
        <div className="form-group from-date">
          <label>From</label>
          <MxDatePicker value={fromDate} onChange={setFromDate} maxDate={toDate} />
        </div>
        <div className="form-group to-date">
          <label>To</label>
          <MxDatePicker value={toDate} onChange={setToDate} minDate={fromDate} />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select
            className="form-control"
            value={logType}
            onChange={(e) => setLogType(e.target.value)}
          >
            <option value="endlogin">Login</option>
            <option value="password">Change Password</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
      </div>

      <div className="report-page-count">
        {/* The gaps around the select are whitespace text nodes in the
            reference markup — JSX strips them, so they must be explicit */}
        <div className="form-group mb-0">
          <label>Show</label>
          {' '}
          <select
            className="form-control"
            value={entries}
            onChange={(e) => {
              setEntries(Number(e.target.value));
              setPage(1);
            }}
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
              <th className="bet-event-name"><div>Username</div></th>
              <th className="bet-date"><div>Date</div></th>
              <th className="bet-ip"><div>Ip Address</div></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr className="no-record"><td colSpan="3">no records found</td></tr>
            ) : (
              filteredData.map((log, index) => (
                <tr key={log.id ?? index}>
                  <td className="bet-event-name"><div>{log.username ?? '-'}</div></td>
                  <td className="bet-date"><div>{formatDate(log.createdAt)}</div></td>
                  <td className="bet-ip"><div>{log.ip_address ?? '-'} <i className="fas fa-eye ml-2" style={{ cursor: 'pointer' }} onClick={() => setIpModal({ ip: log.ip_address, city: log.city || '', country: log.country || '' })}></i></div></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="report-table d-none-desktop">
        {filteredData.length === 0 ? (
          <div className="report-row no-record">no records found</div>
        ) : (
          filteredData.map((log, index) => (
            <div className="report-row" key={log.id ?? index}>
              <div><span className="bet-heading">Username</span> <span>{log.username ?? '-'}</span></div>
              <div><span className="bet-heading">Date</span> <span>{formatDate(log.createdAt)}</span></div>
              <div><span className="bet-heading">Ip Address</span> <span className="bet-ip">{log.ip_address ?? '-'} <i className="fas fa-eye ml-2" style={{ cursor: 'pointer' }} onClick={() => setIpModal({ ip: log.ip_address, city: log.city || '', country: log.country || '' })}></i></span></div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {hasFetched && totalPages > 0 && (
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

      {/* IP Detail Modal */}
      {ipModal && (
        <div style={{ position: 'absolute', zIndex: 1040 }}>
          <div role="dialog" aria-modal="true" className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-md">
              <div tabIndex={-1} className="modal-content">
                <header className="modal-header">
                  <h5 className="modal-title">IP Detail</h5>
                  <button type="button" aria-label="Close" className="close" onClick={() => setIpModal(null)}>&times;</button>
                </header>
                <div className="modal-body">
                  <div className="ip-detail">
                    <div className="ip-detail-row"><div>IP:</div> <div>{ipModal.ip || '-'}</div></div>
                    <div className="ip-detail-row"><div>City:</div> <div>{ipModal.city || '-'}</div></div>
                    <div className="ip-detail-row"><div>Country:</div> <div>{ipModal.country || '-'}</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" style={{ opacity: 0.5 }} onClick={() => setIpModal(null)}></div>
        </div>
      )}
    </div>
  );
}

export default ActivityLog;
