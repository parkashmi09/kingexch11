import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getUserAccountStatement, getStatementMarketBets, getStatementCasinoBets } from '../apiservices/reportService';
import { getDetailResults } from '../apiservices/casinoService';
import { loadDemoState } from '../utils/demoStore';
import { fakeLoaderDelay } from '../utils/fakeLoader';
import MxDatePicker from '../components/MxDatePicker';
import FullScreenLoader from '../components/FullScreenLoader';
import { exportToExcel, exportToPDF } from '../utils/exportTable';
import { bToastError } from '../components/BToast';
import { resolveCasinoGameType } from '../config/casinoGameNames';
import StatementResultModal from '../components/modals/StatementResultModal';
import CasinoStatementResultModal from '../components/modals/CasinoStatementResultModal';

// A CASINO row opens its round's result table. Keyed on roundId, with betId as
// the fallback for legacy rows that predate it — the statement endpoint carries
// both. No game-name lookup: the API resolves the round itself.
function casinoRoundOf(row) {
  if (!row || String(row.category || '').toUpperCase() !== 'CASINO') return null;
  if (!row.roundId && !row.betId) return null;
  return {
    roundId: row.roundId || null,
    betId: row.betId || null,
    gameName: row.gamename || '',
    // Only for the result CARDS — the bets come back keyed by round id, so a
    // game name we can't resolve costs the cards, not the table.
    gameType: row.gamename ? resolveCasinoGameType(row.gamename) : null,
    mid: row.roundId || null,
  };
}

// A SPORTS row's bets are fetched by market: matchId (mid) + eventId (gmid).
// Rows settled before the API started carrying them have neither.
function sportsMarketOf(row) {
  if (!row || String(row.category || '').toUpperCase() !== 'SPORTS') return null;
  return row.matchId && row.eventId ? { matchId: row.matchId, eventId: row.eventId } : null;
}

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

function AccountStatement() {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  })();

  const [fromDate, setFromDate] = useState(weekAgo);
  const [toDate, setToDate] = useState(today);
  const [reportType, setReportType] = useState('1');
  const [entries, setEntries] = useState(25);
  const [page, setPage] = useState(1);
  // Row whose Result modal is open (null = closed). The reference opens it from
  // the Remark cell of a settled-bet entry.
  const [resultRow, setResultRow] = useState(null);
  // What the clicked row's Result modal will show. The fetch lives here, not in
  // the modals: the reference runs its loader over the statement table and only
  // pops the modal once it is filled, so a modal never opens on a spinner.
  const [rowResult, setRowResult] = useState({ loading: false, error: null, sports: null, casino: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchData = useCallback(async (currentPage = page) => {
    setLoading(true);
    try {
      // UI type -> v2 API reportType: 1 = All, 2 = Deposit/Withdraw, 3 = Game Report
      const typeMap = { 1: 'ALL', 2: 'TRANSACTION', 3: 'SPORTS' };
      const filters = {
        fromDate,
        toDate,
        page: currentPage,
        limit: entries,
        reportType: typeMap[reportType] || 'ALL',
        search: searchTerm.trim() || undefined,
      };
      const result = await getUserAccountStatement(filters);
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
        setTotalRecords(result.total || result.data.length);
        if (result.data.length === 0) bToastError('No Record Found.');
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
  }, [fromDate, toDate, page, entries, reportType, searchTerm]);

  const isDemo = localStorage.getItem('token') === 'demo-token';

  useEffect(() => {
    if (hasFetched && !isDemo) fetchData(page);
  }, [page, entries]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search is a SERVER filter (it re-runs the query and re-counts the matches),
  // so typing has to refetch rather than sift the page already in hand — sifting
  // left the pager counting a different set than the table showed. Debounced so
  // a typed word costs one request, and back to page 1 because the old offset
  // means nothing against a new result set.
  const searchTimer = useRef(null);
  useEffect(() => {
    if (!hasFetched || isDemo) return undefined;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchData(1);
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Opening a row pulls what its modal needs — a SPORTS market's bets, or a
  // CASINO round's result plus the user's bets on it. Closing clears them, so
  // the next row never flashes the previous one's table.
  const casinoRound = casinoRoundOf(resultRow);
  const market = sportsMarketOf(resultRow);
  const { roundId: casinoRoundId, betId: casinoBetId, gameType: casinoType, mid: casinoMid } = casinoRound || {};
  const { matchId, eventId } = market || {};

  useEffect(() => {
    const wantsCasino = !!(casinoRoundId || casinoBetId);
    const wantsSports = matchId && eventId;
    if (!wantsCasino && !wantsSports) {
      setRowResult({ loading: false, error: null, sports: null, casino: null });
      return undefined;
    }
    let cancelled = false;
    setRowResult({ loading: true, error: null, sports: null, casino: null });

    const request = wantsCasino
      // One call now: the statement's own casino endpoint returns the round
      // header, its winner and the user's bets already tagged with side / win /
      // deleted — the pair of game-API calls this replaced could supply none of
      // those, and needed the game name resolved to a type first.
      // Two sources, neither allowed to sink the other: detail-results draws the
      // round's own cards/winner, while the statement endpoint supplies the bets
      // already tagged with side / win / deleted — which the tabs and totals need
      // and the plain my-bets call never carried.
      ? Promise.all([
          casinoType && casinoMid ? getDetailResults(casinoType, String(casinoMid)).catch(() => null) : Promise.resolve(null),
          getStatementCasinoBets({ roundId: casinoRoundId, betId: casinoBetId }).catch(() => null),
        ]).then(([resultRes, betsRes]) => ({
          casino: {
            detail: resultRes?.data?.data?.t1 || resultRes?.data?.t1 || resultRes?.data || null,
            bets: Array.isArray(betsRes?.bets) ? betsRes.bets : [],
            winner: betsRes?.winner ?? null,
            totalWin: betsRes?.totalWin ?? null,
            header: betsRes?.header ?? null,
          },
        }))
      : getStatementMarketBets({ matchId, eventId }).then((res) => {
          if (!res?.success) throw new Error(res?.message || 'Could not load bets.');
          return { sports: res };
        });

    request
      .then((value) => {
        if (!cancelled) setRowResult({ loading: false, error: null, sports: value.sports || null, casino: value.casino || null });
      })
      .catch((err) => {
        if (cancelled) return;
        setRowResult({
          loading: false,
          error: err?.response?.data?.message || err?.message || 'Could not load bets.',
          sports: null,
          casino: null,
        });
      });
    return () => { cancelled = true; };
  }, [casinoRoundId, casinoBetId, casinoType, casinoMid, matchId, eventId]);

  // Demo mode (reference): submit shows the loader for ~1s, then always the
  // same two rows — "Opening pts" (0) and "User creation" (credit 1,500).
  const handleDemoSubmit = async () => {
    setLoading(true);
    await fakeLoaderDelay();
    const demo = loadDemoState();
    const openingDate = new Date();
    openingDate.setDate(openingDate.getDate() - 7);
    openingDate.setHours(0, 0, 0, 0);
    setData([
      { date: openingDate.toISOString(), credit: '-', debit: '-', closing: 0, description: 'Opening pts' },
      { date: new Date(demo?.createdAt || Date.now()).toISOString(), credit: '1,500', debit: '-', closing: '1,500', description: 'User creation' },
    ]);
    setTotalRecords(2);
    setLoading(false);
  };

  const handleSubmit = () => {
    setPage(1);
    setHasFetched(true);
    if (isDemo) { handleDemoSubmit(); return; }
    fetchData(1);
  };

  // No auto-fetch on mount — data loads only when the user presses Submit
  // (page/entries changes re-fetch only after the first submit).

  // Search runs on the SERVER (`search` in the fetch filters, matched against
  // remark), and `totalRecords` counts the matches across every page. Filtering
  // the fetched page again here judged 25 rows by a different rule than the
  // count they were paged with: a page whose rows all failed the second pass
  // rendered empty AND took the pager down with it — the other pages of matches
  // became unreachable.
  const filteredData = data;

  const totalPages = Math.max(1, Math.ceil(totalRecords / entries));

  // Reference marks export icons disabled while there is nothing to export,
  // and gives the excel wrapper a per-mount export_<timestamp> id.
  const exportId = useRef(`export_${Date.now()}`).current;
  const exportDisabled = filteredData.length === 0;

  const getExportColumns = () => [
    { label: 'Date', getValue: (r) => formatDate(r.date) },
    { label: 'Credit', getValue: (r) => (r.credit && r.credit !== '-' ? r.credit : '') },
    { label: 'Debit', getValue: (r) => (r.debit && r.debit !== '-' ? r.debit : '') },
    { label: 'pts', getValue: (r) => r.closing ?? 0 },
    { label: 'Remark', getValue: (r) => r.description || r.fromto || '' },
  ];

  const handleExport = (type) => {
    const cols = getExportColumns();
    if (type === 'pdf') exportToPDF(filteredData, cols, 'Account Statement');
    else exportToExcel(filteredData, cols, 'Account_Statement');
  };

  return (
    <div className="report-box">
      {loading && <FullScreenLoader />}

      <div className="report-title">
        <div className="report-name">Account Statement</div>
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
          <select className="form-control" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="1">All</option>
            <option value="2">Deposit/Withdraw Report</option>
            <option value="3">Game Report</option>
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

      {/* `loader-section-parent` ONLY while the overlay is up. It carries
          `height: 100%` (control.css), which stretches this container to fill
          the report box — the table then ended level with the footer and pushed
          the pager down there with it. `.loader-section` is absolute, so it
          still needs the relative parent, just not the rest of the time. */}
      <div className={`report-table ac-statement table-responsive${rowResult.loading ? ' loader-section-parent' : ''}`}>
        {/* Reference loads a row's result BEHIND this overlay, not inside the
            modal — the modal only appears once its content is ready. */}
        {rowResult.loading && (
          <div className="loader-section">
            <div>
              <img src="/assets/animate/loader-ten.gif" alt="loader" />
            </div>
          </div>
        )}
        <table className="table table-hover">
          <thead>
            <tr>
              <th className="bet-date"><div>Date</div></th>
              <th className="text-right bet-user-rate"><div>Sr no</div></th>
              <th className="text-right bet-amount"><div>Credit</div></th>
              <th className="text-right bet-amount"><div>Debit</div></th>
              <th className="text-right bet-amount"><div>pts</div></th>
              <th className="bet-remark"><div>Remark</div></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr className="no-record"><td colSpan={6}>no records found</td></tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="bet-date"><div>{formatDate(item.date)}</div></td>
                  <td className="text-right bet-user-rate"><div>{(page - 1) * entries + index + 1}</div></td>
                  <td className="text-right bet-amount"><div>{item.credit && item.credit !== '-' ? item.credit : '\u00A0'}</div></td>
                  <td className="text-right bet-amount"><div>{item.debit && item.debit !== '-' ? item.debit : '\u00A0'}</div></td>
                  <td className="text-right bet-amount"><div>{item.closing ?? 0}</div></td>
                  <td className="bet-remark">
                    <div
                      className="ifTooltip"
                      onClick={() => setResultRow(item)}
                      style={{ cursor: 'pointer' }}
                    >{item.description || item.fromto || ''}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pager follows the SERVER's total, not this page's row count — with the
          last page empty (a row settled between fetches) it must still offer a
          way back to the others. */}
      {hasFetched && totalRecords > 0 && (
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

      {/* CASINO rows carry the round id and the game name, so their result is
          the round's own — the dealt cards plus the user's bets on it. */}
      <CasinoStatementResultModal
        show={!!rowResult.casino}
        onClose={() => setResultRow(null)}
        gameType={casinoRound?.gameType}
        gameName={casinoRound?.gameName}
        mid={casinoRound?.mid}
        detail={rowResult.casino?.detail || null}
        bets={rowResult.casino?.bets || []}
      />

      {/* Every other row falls back to the plain Result modal. SPORTS rows fill
          it from the market-bets endpoint above; a transaction row has no
          market to fetch, so it opens straight away with just the remark. */}
      <StatementResultModal
        show={!!resultRow && !casinoRound && !rowResult.loading}
        onClose={() => setResultRow(null)}
        breadcrumb={rowResult.sports?.description || resultRow?.description || resultRow?.fromto || ''}
        winner={rowResult.sports?.winner || ''}
        gameTime={formatDate(rowResult.sports?.header?.gameTime || resultRow?.date)}
        bets={rowResult.sports?.bets || []}
        error={rowResult.error}
      />
    </div>
  );
}

export default AccountStatement;
