import { useCallback, useEffect, useState } from 'react';
import { getUserAccountStatement } from '../../apiservices/reportService';
import useDarkTheme from '../useTheme';
import MarketBetsModal from './MarketBetsModal';
import {
  Amount,
  DateRange,
  ExportCsv,
  Loading,
  Pagination,
  PrintButton,
  dayBefore,
  fmtDate,
  withinOneMonth,
} from './parts';

// The reference's four report types. tenexch's endpoint understands ALL,
// TRANSACTION and SPORTS, so BALANCE and GAME map onto those two; SETTLEMENT
// has no counterpart yet and comes back empty — see docs/BACKEND-GAPS.md.
const TYPES = [
  { value: 'ALL', label: 'ALL', api: 'ALL' },
  { value: 'BALANCE', label: 'BALANCE REPORT', api: 'TRANSACTION' },
  { value: 'GAME', label: 'GAME REPORT', api: 'SPORTS' },
  { value: 'SETTLEMENT', label: 'SETTLEMENT REPORT', api: 'SETTLEMENT' },
];

// Every other report opens on yesterday 00:00 -> tomorrow 00:00. Account
// Statement stretches the far end by an extra day, which is its own quirk.
const openTo = () => new Date(Date.now() + 2880 * 60 * 1000).setHours(0, 0, 0, 0);

/**
 * Account Statement.
 *
 * The reference's ledger view: report type and date range over a running
 * balance, an opening/closing summary beside the filters, then Date / Credit /
 * Debit / Balance / Description with a "Closing Balance" seed row on top.
 *
 * A SPORTS row's description opens that market's bets. The opening and closing
 * figures come from the response; tenexch does not send them yet, so they read
 * 0.00 until it does (docs/BACKEND-GAPS.md).
 */
function AccountStatement() {
  const dark = useDarkTheme();
  const [type, setType] = useState('ALL');
  const [range, setRange] = useState({ from: dayBefore(), to: openTo() });
  const [page, setPage] = useState({ pageNo: 1, recordsPerPage: 25, countRecords: 0 });
  const [balances, setBalances] = useState({ opening: 0, closing: 0 });
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [marketRow, setMarketRow] = useState(null);

  const onDate = (which, value) => setRange((prev) => ({ ...prev, [which]: value }));

  const load = useCallback(
    async (pageNo, recordsPerPage) => {
      setLoading(true);
      try {
        const result = await getUserAccountStatement({
          fromDate: new Date(range.from)?.toISOString(),
          toDate: new Date(range.to)?.toISOString(),
          page: pageNo,
          limit: recordsPerPage,
          reportType: TYPES.find((t) => t.value === type)?.api || 'ALL',
        });
        const list = result?.success && Array.isArray(result.data) ? result.data : [];
        setRows(list);
        setPage((prev) => ({ ...prev, countRecords: result?.total || list.length }));
        setBalances({
          opening: result?.openingBalance || 0,
          closing: result?.closingBalance || 0,
        });
      } catch (err) {
        console.error('Account statement api error', err);
        setRows([]);
      } finally {
        setLoading(false);
        setFetched(true);
      }
    },
    [range, type]
  );

  useEffect(() => {
    load(page.pageNo, page.recordsPerPage);
    // Paging and the entries selector re-query; the filters wait for Go.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.pageNo, page.recordsPerPage]);

  const go = () => {
    if (!withinOneMonth(range.from, range.to)) return;
    if (page.pageNo === 1) load(1, page.recordsPerPage);
    else setPage((prev) => ({ ...prev, pageNo: 1 }));
  };

  const reset = () => {
    setType('ALL');
    setRange({ from: dayBefore(), to: openTo() });
    setSearch('');
    setRows([]);
    setBalances({ opening: 0, closing: 0 });
    setFetched(false);
    setPage({ pageNo: 1, recordsPerPage: 25, countRecords: 0 });
  };

  const onEntries = (e) =>
    setPage((prev) => ({ ...prev, recordsPerPage: Number(e.target.value) || 25, pageNo: 1 }));

  // The reference filters the loaded page in the browser rather than re-querying.
  const shown = search.trim()
    ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))
    : rows;

  const describe = (row) => row.description || row.fromto || '-';
  const drillable = (row) => row.category === 'SPORTS' && row.matchId && row.eventId;

  const csv = () => {
    if (!shown.length) return [];
    const out = [['Date', 'Credit', 'Debit', 'Balance', 'Description']];
    out.push(['', '', '', balances.opening, 'Closing Balance']);
    shown.forEach((row) => {
      out.push([
        fmtDate(row.date),
        row.credit && row.credit !== '-' ? row.credit : '-',
        row.debit && row.debit !== '-' ? row.debit : '-',
        row.closing ?? 0,
        describe(row),
      ]);
    });
    return out;
  };

  return (
    <div>
      <div className="eventtitle-box mt5 r-title">Account Statement  </div>
      <div className="sportscardRow mt-0 rmain-title p-2 min-height500">
        <div className="resport-search">
          <div className="row ">
            <div className="col-12 col-sm-6 col-md-3 col-lg-3 col-xl-2">
              <div className="form-group font-12 ">
                <select
                  title="Event Type"
                  className={`form-select ${dark ? 'darkarrow' : ''}`}
                  name="event_type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DateRange from={range.from} to={range.to} onChange={onDate} />

            <div className="col-12 col-sm-6 col-md-3 col-lg-3 col-xl-2">
              <div className="groupbtn" role="group" aria-label="Basic example" id="">
                <button className=" reportbtn" onClick={go} disabled={loading}>
                  Go
                </button>
                <button className=" reportbtn ml-1" onClick={reset} disabled={loading}>
                  Reset
                </button>
              </div>
            </div>

            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-3 mobilem-3">
              <table className="closingrp-table nowrap table-bordered table-sm w-100">
                <tbody>
                  <tr>
                    <td>
                      <span>Closing Balance    </span>
                    </td>
                    <td className="text-right">
                      {balances.opening ? (
                        <Amount classPropName="d-inline font-14" amount={balances.opening} />
                      ) : (
                        '0.00'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span>Opening Balance </span>
                    </td>
                    <td className="text-right">
                      {balances.closing ? (
                        <Amount classPropName="d-inline font-14" amount={balances.closing} />
                      ) : (
                        '0.00'
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {loading && <Loading />}

        {fetched && (
          <>
            <div className="">
              <div className="searchandentries">
                <div className="searchandentries-first">
                  <div className="form-group font-12 w-160">
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={search}
                      alt="Search"
                      placeholder="Search"
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <ExportCsv exportCsv={csv} fileName="Account Statement" disabled={!shown.length} />
                  <PrintButton disabled={!shown.length} />
                </div>
                <div className="searchandentries-second">
                  <span>Entries</span>
                  <div>
                    <select onChange={onEntries} name="recordsPerPage" value={page.recordsPerPage}>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                  <span>Show</span>
                </div>
              </div>
            </div>

            <div id="printJS-div" className="table-responsive">
              <table className="mb-1 nowrap reporttable table table-bordered table-sm w-100">
                <thead>
                  <tr>
                    <th className="td140">Date</th>
                    <th className="td140">Credit</th>
                    <th className="td140">Debit</th>
                    <th className="td140">Balance</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="text-right">
                      {balances.opening ? (
                        <Amount
                          classPropName={
                            balances.opening > 0
                              ? 'text-green'
                              : balances.opening < 0
                                ? 'text-red'
                                : 'fbold'
                          }
                          amount={balances.opening}
                        />
                      ) : (
                        '0.00'
                      )}
                    </td>
                    <td> Closing Balance </td>
                  </tr>
                  {loading && (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    shown.map((row, i) => (
                      <tr key={i}>
                        <td>{fmtDate(row.date)}</td>
                        <td className="text-right">
                          {row.credit && row.credit !== '-' ? (
                            <Amount classPropName="text-green" amount={row.credit} />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-right">
                          {row.debit && row.debit !== '-' ? (
                            <Amount classPropName="text-red" amount={row.debit} />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-right">
                          {row.closing ? (
                            <Amount
                              classPropName={
                                row.closing > 0
                                  ? 'text-green'
                                  : row.closing < 0
                                    ? 'text-red'
                                    : 'text-right text-dark fbold'
                              }
                              amount={row.closing}
                            />
                          ) : (
                            '0.00'
                          )}
                        </td>
                        <td title={describe(row)}>
                          {drillable(row) ? (
                            <a className="undline" onClick={() => setMarketRow(row)} name="event_id">
                              {describe(row)}
                            </a>
                          ) : (
                            describe(row)
                          )}
                        </td>
                      </tr>
                    ))}
                  {!loading && shown.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center">
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="footer-pagination f-12">
              <Pagination
                currentPage={page.pageNo}
                pageSize={page.recordsPerPage}
                totalEntries={page.countRecords}
                handleOnPageChange={(p) => setPage((prev) => ({ ...prev, pageNo: p }))}
              />
            </div>
          </>
        )}

        {marketRow && <MarketBetsModal row={marketRow} onClose={() => setMarketRow(null)} />}
      </div>
    </div>
  );
}

export default AccountStatement;
