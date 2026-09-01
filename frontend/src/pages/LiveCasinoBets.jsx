import { useState, useEffect, useCallback, useRef } from 'react';
import { getLiveCasinoBets } from '../apiservices/reportService';
import { bToastError } from '../components/BToast';
import MxDatePicker from '../components/MxDatePicker';
import FullScreenLoader from '../components/FullScreenLoader';
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

function LiveCasinoBets() {
  const today = new Date().toISOString().split('T')[0];

  const [reportType, setReportType] = useState('');
  const [date, setDate] = useState(today);
  const [casinoType, setCasinoType] = useState('');
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
        reportType,
        date,
        casinoType,
        page: currentPage,
        limit: entries,
      };
      const result = await getLiveCasinoBets(params);
      if (result && result.success) {
        const rows = result.data?.records ?? result.data ?? [];
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
      bToastError('No Record Found.');
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [reportType, date, casinoType, page, entries]);

  // Re-fetch when page or entries changes after initial fetch
  useEffect(() => {
    if (hasFetched) {
      fetchData(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, entries]);

  const handleSubmit = () => {
    if (!casinoType) {
      bToastError('Select Casino Type!');
      return;
    }
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
    { label: 'Game Name', getValue: (r) => r.game_name || '-' },
    { label: 'Type', getValue: (r) => r.type || '-' },
    { label: 'Amount', getValue: (r) => r.amount || 0 },
    { label: 'Total', getValue: (r) => r.total || 0 },
    { label: 'Date', getValue: (r) => formatDate(r.date || r.created_at) },
    { label: 'Round ID', getValue: (r) => r.round_id || '-' },
    { label: 'Transaction Id', getValue: (r) => r.transaction_id || '-' },
  ];

  const handleExport = (type) => {
    const cols = getExportColumns();
    if (type === 'pdf') exportToPDF(filteredData, cols, 'Live Casino Bets');
    else exportToExcel(filteredData, cols, 'Live_Casino_Bets');
  };

  return (
    <div className="report-box live-bets-report w-100">
      {loading && <FullScreenLoader />}

      <div className="report-title">
        <div className="report-name">Live Casino Bets</div>
        {/* Hidden only while Un-Settled is selected (reference behavior) */}
        {reportType !== 'currentbets' && (
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
        )}
      </div>

      <div className="report-form">
        <div className="form-group">
          <label>Select Report Type</label>
          <select
            className="form-control"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="results">Settled</option>
            <option value="currentbets">Un-Settled</option>
          </select>
        </div>
        {/* Date applies only to settled results — hidden for Un-Settled */}
        {reportType !== 'currentbets' && (
          <div className="form-group from-date">
            <label>Date</label>
            <MxDatePicker value={date} onChange={setDate} maxDate={today} />
          </div>
        )}
        <div className="form-group to-date">
          <label>Type</label>
          <select
            className="form-control"
            value={casinoType}
            onChange={(e) => setCasinoType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="ezugi">Ezugi</option>
            <option value="ss">Super Spade</option>
            <option value="qt">Slot 3 | Holi</option>
            <option value="evo">Evolution</option>
            <option value="cockfight">CockFight</option>
            <option value="ludo">Ludo Classic</option>
            <option value="pop-the-ball">PopTheBall</option>
            <option value="binary">Binary</option>
            <option value="tgs">Slot 2</option>
            <option value="slot">Slot</option>
            <option value="tgslive">vivogamepoints-LuckyStreak</option>
            <option value="rummy">Rummy</option>
            <option value="ludo-lands">Ludo Lands</option>
            <option value="vivo">vivo gaming</option>
            <option value="snakes-and-ladders">snakes and ladders</option>
            <option value="smart">Smart Soft</option>
            <option value="astar">Astar Game</option>
            <option value="ds">Dragoon soft</option>
            <option value="bc">Creedroomz</option>
            <option value="tembo">Tembo</option>
            <option value="bcslot">Pascal Game | Popok</option>
            <option value="av">Aviator</option>
            <option value="lottery">Lottery</option>
            <option value="scratch">Scratch</option>
            <option value="bet">Bet Core</option>
            <option value="darwin">Darwin</option>
            <option value="jilli">Jilli</option>
            <option value="amigo">Amigo</option>
            <option value="win">Win</option>
            <option value="gemini1">Gemini</option>
            <option value="studio21">Studio 21</option>
            <option value="egt">EGT</option>
            <option value="beon">Beon Game</option>
            <option value="king">King Midas</option>
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
      <div className="table-responsive report-table d-none-mobile">
        <table className="table table-hover">
          <thead>
            <tr>
              <th className="bet-event-name"><div>Game Name</div></th>
              <th className="bet-sport"><div>Type</div></th>
              <th className="bet-amount text-right"><div>Amount</div></th>
              <th className="bet-amount text-right"><div>Total</div></th>
              <th className="bet-date"><div>Date</div></th>
              <th className="bet-remark"><div>Round ID</div></th>
              <th className="bet-remark"><div>Transaction Id</div></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr className="no-record"><td colSpan="8">no records found</td></tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="bet-event-name"><div>{item.game_name || '-'}</div></td>
                  <td className="bet-sport"><div>{item.type || '-'}</div></td>
                  <td className="bet-amount text-right"><div>{item.amount || 0}</div></td>
                  <td className="bet-amount text-right"><div>{item.total || 0}</div></td>
                  <td className="bet-date"><div>{formatDate(item.date || item.created_at)}</div></td>
                  <td className="bet-remark"><div>{item.round_id || '-'}</div></td>
                  <td className="bet-remark"><div>{item.transaction_id || '-'}</div></td>
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
          filteredData.map((item, index) => (
            <div className="report-row" key={index}>
              <div><span className="bet-heading">Game Name</span> <span>{item.game_name || '-'}</span></div>
              <div><span className="bet-heading">Type</span> <span>{item.type || '-'}</span></div>
              <div><span className="bet-heading">Amount</span> <span>{item.amount || 0}</span></div>
              <div><span className="bet-heading">Total</span> <span>{item.total || 0}</span></div>
              <div><span className="bet-heading">Date</span> <span>{formatDate(item.date || item.created_at)}</span></div>
              <div><span className="bet-heading">Round ID</span> <span>{item.round_id || '-'}</span></div>
              <div><span className="bet-heading">Transaction Id</span> <span>{item.transaction_id || '-'}</span></div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {hasFetched && filteredData.length > 0 && totalPages > 0 && (
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

export default LiveCasinoBets;
