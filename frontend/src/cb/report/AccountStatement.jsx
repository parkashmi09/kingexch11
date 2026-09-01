import { useCallback, useEffect, useState } from 'react';
import { getUserAccountStatement } from '../../apiservices/reportService';
import ReportShell, {
  ReportButtons,
  ReportDateRange,
  ReportPager,
  ReportSearch,
  ReportSelect,
} from './ReportShell';

// The UI's report types against the v2 API's own names.
const TYPES = [
  { value: '1', label: 'All', api: 'ALL' },
  { value: '2', label: 'Deposit/Withdraw', api: 'TRANSACTION' },
  { value: '3', label: 'Game Report', api: 'SPORTS' },
];

const PAGE_SIZE = 25;

// The filter inputs are datetime-local, which wants "YYYY-MM-DDTHH:mm".
const asInput = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const weekAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return asInput(d);
};

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/**
 * Account Statement.
 *
 * Same request the old page made — /admin/reports/accountstatement, server-side
 * paging and search — in the reference's report frame.
 */
function AccountStatement() {
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(() => asInput(new Date()));
  const [type, setType] = useState('1');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const load = useCallback(
    async (currentPage) => {
      setLoading(true);
      try {
        const result = await getUserAccountStatement({
          fromDate: from,
          toDate: to,
          page: currentPage,
          limit: PAGE_SIZE,
          reportType: TYPES.find((t) => t.value === type)?.api || 'ALL',
          search: search.trim() || undefined,
        });
        const list = result?.success && Array.isArray(result.data) ? result.data : [];
        setRows(list);
        setTotal(result?.total || list.length);
      } catch {
        // An empty statement and a failed request look the same to the user;
        // the table says so either way rather than throwing a toast at them.
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
        setFetched(true);
      }
    },
    [from, to, type, search]
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  const go = () => (page === 1 ? load(1) : setPage(1));
  const reset = () => {
    setFrom(weekAgo());
    setTo(asInput(new Date()));
    setType('1');
    setSearch('');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <ReportShell
        title="Account Statement"
        filters={
          <>
            <ReportSelect
              title="Report Type"
              name="report_type"
              value={type}
              onChange={setType}
              options={TYPES}
            />
            <ReportDateRange from={from} to={to} onFrom={setFrom} onTo={setTo} />
            <ReportButtons onGo={go} onReset={reset} />
          </>
        }
        search={<ReportSearch value={search} onChange={setSearch} />}
      >
        <table className="table table-sm mb-1 table-bordered reporttable">
          <thead>
            <tr>
              <th>Date</th>
              <th className="td100 text-right">Sr no</th>
              <th className="td100 text-right">Credit</th>
              <th className="td100 text-right">Debit</th>
              <th className="td100 text-right">pts</th>
              <th className="dtwidth">Remark</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center">Loading......</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">No Data Found</td>
              </tr>
            )}
            {!loading &&
              rows.map((item, i) => (
                <tr key={i}>
                  <td>{formatDate(item.date)}</td>
                  <td className="text-right">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="text-right">{item.credit && item.credit !== '-' ? item.credit : ' '}</td>
                  <td className="text-right">{item.debit && item.debit !== '-' ? item.debit : ' '}</td>
                  <td className="text-right">{item.closing ?? 0}</td>
                  <td>{item.description || item.fromto || ''}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </ReportShell>

      {fetched && total > 0 && (
        <ReportPager page={page} totalPages={totalPages} onPage={setPage} />
      )}
    </>
  );
}

export default AccountStatement;
