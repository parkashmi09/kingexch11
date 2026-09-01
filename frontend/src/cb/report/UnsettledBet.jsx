import { useCallback, useEffect, useState } from 'react';
import { getCurrentSportsBets } from '../../apiservices/reportService';
import {
  Amount,
  DateRange,
  ExportCsv,
  Loading,
  Pagination,
  PrintButton,
  dayAfter,
  dayBefore,
  withinOneMonth,
} from './parts';
import {
  competitionOf,
  csvRow,
  dateOf,
  eventOf,
  lineOf,
  marketOf,
  potentialOf,
  rateOf,
  rowClass,
  runnerOf,
  sideOf,
  stakeOf,
} from './betRows';

/**
 * Unsettled Bet.
 *
 * Every bet still open: a date range, then Date / Competition / Event / Market
 * / Runner / Side / Line / Rate / Amount / PP / PL, back rows blue and lay rows
 * pink. PP and PL are derived here — tenexch does not store them (see
 * docs/BACKEND-GAPS.md); so is the date range, which the open-bets route
 * currently ignores.
 */
function UnsettledBet() {
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
        const result = await getCurrentSportsBets({
          fromDate: new Date(from)?.toISOString(),
          toDate: new Date(to)?.toISOString(),
          page: pageNo,
          limit: recordsPerPage,
          betType: 'all',
        });
        const list = result?.success && Array.isArray(result.data) ? result.data : [];
        setRows(list);
        setPage((prev) => ({
          ...prev,
          countRecords: result?.pagination?.total ?? list.length,
        }));
      } catch (err) {
        console.error('Unsettled bets api error', err);
        setRows([]);
      } finally {
        setLoading(false);
        setFetched(true);
      }
    },
    [from, to]
  );

  useEffect(() => {
    if (fetched) load(page.pageNo, page.recordsPerPage);
    // Paging re-queries; the first load waits for Go, as it does in the reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.pageNo, page.recordsPerPage]);

  const go = () => {
    if (!withinOneMonth(from, to)) return;
    if (page.pageNo === 1) load(1, page.recordsPerPage);
    else setPage((prev) => ({ ...prev, pageNo: 1 }));
  };

  const reset = () => {
    setFrom(dayBefore());
    setTo(dayAfter());
    setSearch('');
    setRows([]);
    setFetched(false);
    setPage({ pageNo: 1, recordsPerPage: 25, countRecords: 0 });
  };

  const onEntries = (e) =>
    setPage((prev) => ({ ...prev, recordsPerPage: Number(e.target.value) || 25, pageNo: 1 }));

  const shown = search.trim()
    ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))
    : rows;

  const csv = () =>
    rows.map((item) => {
      const { profit, loss } = potentialOf(item);
      return { ...csvRow(item), 'Potential Profit': profit, 'Potential Loss': loss };
    });

  return (
    <div>
      <div className="eventtitle-box mt5 r-title">Unsettled Bet </div>
      <div className="sportscardRow mt-0 rmain-title p-2 min-height500">
        <div className="resport-search">
          <div className="row">
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
            <div className="searchandentries">
              <div className="searchandentries-first">
                <div className="form-group font-12 w-160">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    alt="Search"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <ExportCsv exportCsv={csv} fileName="Unsettled Bet" disabled={!rows.length} />
                <PrintButton disabled={!rows.length} />
              </div>
              {shown.length > 0 && (
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
              )}
            </div>

            <div id="printJS-div" className="table-responsive">
              <table
                id="exportall"
                className="table table-sm mb-1 table-bordered reporttable nowrap"
              >
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="dtwidth ">Competition</th>
                    <th className="td280">Event</th>
                    <th className="dtwidth ">Market</th>
                    <th className="td140">Runner</th>
                    <th className="td100">Side</th>
                    <th className="td100 text-right">Line</th>
                    <th className="td100 text-right">Rate</th>
                    <th className="td100 text-right">Amount</th>
                    <th className="td100 text-right">PP</th>
                    <th className="td100 text-right">PL</th>
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
                      const date = dateOf(item);
                      const competition = competitionOf(item);
                      const { profit, loss } = potentialOf(item);
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
                            {profit ? (
                              <Amount classPropName="fbold" amount={profit} showColor />
                            ) : (
                              '0'
                            )}
                          </td>
                          <td className="text-right fbold">
                            {loss ? <Amount classPropName="fbold" amount={loss} showColor /> : '0'}
                          </td>
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

export default UnsettledBet;
