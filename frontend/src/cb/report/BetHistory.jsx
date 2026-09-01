import { useCallback, useEffect, useState } from 'react';
import { getLiveCasinoBets, getUserBetHistory } from '../../apiservices/reportService';
import useDarkTheme from '../useTheme';
import {
  Amount,
  DateRange,
  ExportCsv,
  Loading,
  Pagination,
  PrintButton,
  dayAfter,
  dayBefore,
  fmtDate,
  withinOneMonth,
} from './parts';
import {
  competitionOf,
  csvRow,
  dateOf,
  eventOf,
  lineOf,
  marketOf,
  rateOf,
  rowClass,
  runnerOf,
  settledPL,
  sideOf,
  stakeOf,
  statusOf,
} from './betRows';

/**
 * A casino round read into the same eleven columns as a sports bet.
 *
 * The reference's history endpoint returns casino and exchange bets in one
 * shape; tenexch keeps them apart, so a casino round is widened here — the
 * columns that have no casino counterpart print "-", which is what the
 * reference does for its own eventTypeId 99 rows.
 */
const asCasinoRow = (item) => ({
  sport_name: 'Casino',
  match_title: item.game_name || '-',
  market_type: '-',
  selection_name: '-',
  bet_type: item.type || '',
  odds: null,
  stake_amount: item.amount ?? 0,
  created_at: item.date || item.created_at,
  result_status: Number(item.total) > 0 ? 'WON' : Number(item.total) < 0 ? 'LOST' : 'DECLARED',
  __pl: Number(item.total) || 0,
  id: item.round_id || item.transaction_id,
});

/**
 * Bet History.
 *
 * Settled bets — won, lost, void — over a date range, for Sports or Casino.
 * Same eleven columns as Unsettled Bet with Profit/Loss and Status in place of
 * PP and PL.
 *
 * The Sports side has no server route yet, so it reads "No Data Found" until
 * one exists; Casino reads the settled side of the live-casino history that
 * tenexch already serves. docs/BACKEND-GAPS.md has the details.
 */
function BetHistory() {
  const dark = useDarkTheme();
  const [category, setCategory] = useState('SPORTS');
  const [from, setFrom] = useState(dayBefore);
  const [to, setTo] = useState(dayAfter);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState({ pageNo: 1, recordsPerPage: 25, countRecords: 0 });
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const onDate = (which, value) => (which === 'from' ? setFrom(value) : setTo(value));

  const load = useCallback(
    async (pageNo, recordsPerPage) => {
      try {
        setLoading(true);
        if (category === 'CASINO') {
          const result = await getLiveCasinoBets({
            reportType: 'results',
            page: pageNo,
            limit: recordsPerPage,
          });
          const list = result?.success
            ? result.data?.records ?? (Array.isArray(result.data) ? result.data : [])
            : [];
          setRows(list.map(asCasinoRow));
          setPage((prev) => ({
            ...prev,
            countRecords: result?.data?.total ?? result?.total ?? list.length,
          }));
        } else {
          const result = await getUserBetHistory({
            fromDate: new Date(from)?.toISOString(),
            toDate: new Date(to)?.toISOString(),
            page: pageNo,
            limit: recordsPerPage,
          });
          const list = result?.success && Array.isArray(result.data) ? result.data : [];
          setRows(list);
          setPage((prev) => ({
            ...prev,
            countRecords: result?.pagination?.total ?? list.length,
          }));
        }
      } catch (err) {
        console.error('Bet history api error', err);
        setRows([]);
      } finally {
        setLoading(false);
        setFetched(true);
      }
    },
    [category, from, to]
  );

  useEffect(() => {
    if (fetched) load(page.pageNo, page.recordsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.pageNo, page.recordsPerPage]);

  const go = () => {
    if (!withinOneMonth(from, to)) return;
    if (page.pageNo === 1) load(1, page.recordsPerPage);
    else setPage((prev) => ({ ...prev, pageNo: 1 }));
  };

  const reset = () => {
    setCategory('SPORTS');
    setFrom(dayBefore());
    setTo(dayAfter());
    setSearch('');
    setRows([]);
    setFetched(false);
    setPage({ pageNo: 1, recordsPerPage: 25, countRecords: 0 });
  };

  const shown = search.trim()
    ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))
    : rows;

  const plOf = (item) => (item.__pl !== undefined ? item.__pl : settledPL(item));

  const csv = () =>
    rows.map((item) => ({
      ...csvRow(item),
      'Profit/Loss': plOf(item),
      Status: statusOf(item),
    }));

  return (
    <div>
      <div className="eventtitle-box mt5 r-title">Bet History </div>
      <div className="sportscardRow mt-0 rmain-title p-2 min-height500">
        <div className="resport-search">
          <div className="row">
            <div className="col-12 col-sm-6 col-md-3 col-lg-2 col-xl-2 ">
              <div className="form-group font-12 ">
                <select
                  title="Event Type"
                  className={`form-select ${dark ? 'darkarrow' : ''}`}
                  name="event_type"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="SPORTS">Sports</option>
                  <option value="CASINO">Casino</option>
                </select>
              </div>
            </div>

            <DateRange from={from} to={to} onChange={onDate} />

            <div className="col-12 col-sm-6 col-md-3 col-lg-2 ">
              <div className="groupbtn" role="group" aria-label="Basic example" id="">
                <button className="btn reportbtn" onClick={go}>
                  Go
                </button>
                <button className="btn reportbtn ml-1" onClick={reset}>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading && !fetched && <Loading />}

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
                  <ExportCsv exportCsv={csv} fileName="Bet History" disabled={!rows.length} />
                  <PrintButton disabled={!rows.length} />
                </div>
              </div>
            </div>

            <div id="printJS-div" className="table-responsive">
              <table className="table table-sm mb-1 table-bordered reporttable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="dtwidth">Competition</th>
                    <th className="dtwidth wid280">Event</th>
                    <th className="dtwidth">Market</th>
                    <th className="td140">Runner</th>
                    <th className="td100">Side</th>
                    <th className="td100 text-right">Line</th>
                    <th className="td100 text-right">Rate</th>
                    <th className="td100 text-right">Amount</th>
                    <th className="td100 text-right">Profit/Loss</th>
                    <th className="td100">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={11} className="text-center">
                        Loading......
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    shown.map((item, i) => {
                      const date = dateOf(item) === '-' ? fmtDate(item.created_at) : dateOf(item);
                      const competition = competitionOf(item);
                      const pl = plOf(item);
                      const status = statusOf(item);
                      return (
                        <tr key={item.id ?? i} className={rowClass(item)}>
                          <td title={date}>{date}</td>
                          <td title={competition}>{competition}</td>
                          <td title={eventOf(item)}>{eventOf(item)}</td>
                          <td title={marketOf(item)}>{marketOf(item)}</td>
                          <td>{runnerOf(item)}</td>
                          <td>{sideOf(item)}</td>
                          <td className="text-right fbold">{lineOf(item)}</td>
                          <td className="text-right fbold">{rateOf(item)}</td>
                          <td className="text-right">
                            <Amount classPropName="fbold" amount={stakeOf(item)} />
                          </td>
                          <td className="text-right fbold">
                            <Amount
                              classPropName={
                                status === 'WON'
                                  ? 'text-success fbold'
                                  : status === 'LOST'
                                    ? 'text-danger fbold'
                                    : 'fbold'
                              }
                              amount={pl}
                            />
                          </td>
                          <td>{status}</td>
                        </tr>
                      );
                    })}
                  {!loading && shown.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center">
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {shown.length > 0 && (
              <Pagination
                currentPage={page.pageNo}
                handleOnPageChange={(p) => setPage((prev) => ({ ...prev, pageNo: p }))}
                totalEntries={page.countRecords}
                pageSize={page.recordsPerPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BetHistory;
