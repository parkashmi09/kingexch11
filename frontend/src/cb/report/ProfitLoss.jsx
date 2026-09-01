import { useState } from 'react';
import { getUserProfitLoss } from '../../apiservices/reportService';
import {
  Amount,
  DateRange,
  Loading,
  dayAfter,
  dayBefore,
  withinOneMonth,
} from './parts';

/**
 * Every sport-and-market combination the report can show, keyed `MARKET_SPORT`.
 *
 * The reference seeds this grid up front and adds each response row into its
 * bucket, then prints only the buckets that ended up non-zero — so the order of
 * the table is this list's order, not the response's.
 *
 * The sport ids are tenexch's (horse 10, greyhound 65), not the reference's
 * (7 and 4339). The labels are the same either way; the ids only have to agree
 * with whatever /user/pnl returns. See docs/BACKEND-GAPS.md.
 */
const GRID = [
  ['MATCH_ODDS', 4, 'Cricket'],
  ['TIED_MATCH', 4, 'Cricket'],
  ['COMPLETED_MATCH', 4, 'Cricket'],
  ['BOOKMAKER', 4, 'Cricket'],
  ['SPECIAL_MAKER', 4, 'Cricket'],
  ['MINI_BOOKMAKER', 4, 'Cricket'],
  ['FANCY', 4, 'Cricket'],
  ['LINE', 4, 'Cricket'],
  ['WINNING_ODDS', 4, 'Cricket'],
  ['SUPER_OVER', 4, 'Cricket'],
  ['MATCH_ODDS', 1, 'Soccer'],
  ['BOOKMAKER', 1, 'Soccer'],
  ['SPECIAL_MAKER', 1, 'Soccer'],
  ['OVER_UNDER_85', 1, 'Soccer'],
  ['OVER_UNDER_75', 1, 'Soccer'],
  ['OVER_UNDER_65', 1, 'Soccer'],
  ['OVER_UNDER_55', 1, 'Soccer'],
  ['OVER_UNDER_45', 1, 'Soccer'],
  ['OVER_UNDER_35', 1, 'Soccer'],
  ['OVER_UNDER_25', 1, 'Soccer'],
  ['OVER_UNDER_15', 1, 'Soccer'],
  ['OVER_UNDER_05', 1, 'Soccer'],
  ['MINI_BOOKMAKER', 1, 'Soccer'],
  ['WINNING_ODDS', 1, 'Soccer'],
  ['MATCH_ODDS', 2, 'Tennis'],
  ['SET_WINNER', 2, 'Tennis'],
  ['BOOKMAKER', 2, 'Tennis'],
  ['SPECIAL_MAKER', 2, 'Tennis'],
  ['MINI_BOOKMAKER', 2, 'Tennis'],
  ['WINNING_ODDS', 2, 'Tennis'],
  ['WIN', 10, 'Horse Racing'],
  ['WIN', 65, 'Greyhound Racing'],
  ['CASINO', 99, 'Casino'],
  ['SPORTBOOK', 999, 'SportBook'],
];

const key = (mt, et) => `${mt}_${et}`;

const seedGrid = () => {
  const out = {};
  GRID.forEach(([mt, et, sport]) => {
    out[key(mt, et)] = { et: String(et), sport, mt, pnl_commission: 0 };
  });
  return out;
};

// WINNING_ODDS is shown as LOTTERY; everything else loses its underscores.
const marketLabel = (mt) => (mt === 'WINNING_ODDS' ? 'LOTTERY' : mt.split('_').join(' '));

const signClass = (value) =>
  value > 0
    ? 'text-right text-success fbold'
    : value < 0
      ? 'text-right text-danger fbold'
      : 'text-right text-dark fbold';

/**
 * Profit Loss.
 *
 * A date range over one table: sport, market name, amount, then a total. The
 * server returns one row per {sport, market type} bucket and the page sums
 * profit and commission into the grid above.
 *
 * tenexch has no /user/pnl route yet, so today this always lands on
 * "No Profit & Loss Found". The page is complete and will fill in the moment
 * the endpoint exists — docs/BACKEND-GAPS.md says what it has to return.
 */
function ProfitLoss() {
  const [from, setFrom] = useState(dayBefore);
  const [to, setTo] = useState(dayAfter);
  const [grid, setGrid] = useState({});
  const [total, setTotal] = useState(0);
  const [hasRows, setHasRows] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDate = (which, value) => (which === 'from' ? setFrom(value) : setTo(value));

  const go = async () => {
    if (!withinOneMonth(from, to)) return;
    setLoading(true);
    try {
      const result = await getUserProfitLoss({
        from: new Date(from)?.toISOString(),
        to: new Date(to)?.toISOString(),
      });
      setFetched(true);
      const next = seedGrid();
      let sum = 0;
      if (result?.isSuccess && Array.isArray(result.items)) {
        result.items.forEach((item) => {
          const bucket = next[key(item?._id?.mt, item?._id?.et)];
          if (!bucket) return;
          const amount = (item.pnl || 0) + (item.commission || 0);
          bucket.pnl_commission += amount;
          sum += amount;
        });
      }
      setGrid(next);
      setTotal(sum);
      setHasRows(Boolean(result?.items?.length));
    } catch (err) {
      console.error('Profit loss api error', err);
      setFetched(true);
      setGrid({});
      setTotal(0);
      setHasRows(false);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFrom(dayBefore());
    setTo(dayAfter());
    setGrid({});
    setTotal(0);
    setHasRows(false);
    setFetched(false);
  };

  return (
    <div>
      <div className="eventtitle-box mt5 r-title">Profit Loss </div>
      <div className="sportscardRow mt-0 rmain-title p-2 min-height500">
        <div className="resport-search">
          <div className="row">
            <DateRange from={from} to={to} onChange={onDate} />
            <div className="col-12 col-sm-6 col-md-3 col-lg-3 col-xl-2">
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

        {!fetched && loading && <Loading />}

        {fetched && (
          <div id="printJS-div" className="table-responsive">
            <table id="exportall" className="table table-sm mb-1 table-bordered reporttable">
              <thead>
                <tr>
                  <th className="td140">Sport</th>
                  <th>Market Name</th>
                  <th className=" text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr key="loading">
                    <td colSpan={3} className="text-center py-5">
                      <div className="font-weight-bold m-0">Loading...</div>
                    </td>
                  </tr>
                )}
                {!loading && hasRows && (
                  <>
                    {Object.keys(grid).map((k, i) => {
                      const row = grid[k];
                      if (!row.pnl_commission) return null;
                      return (
                        <tr key={i}>
                          <td>{row.sport}</td>
                          <td>{marketLabel(row.mt)}</td>
                          <td>
                            <Amount
                              classPropName={signClass(row.pnl_commission)}
                              amount={row.pnl_commission}
                            />
                          </td>
                        </tr>
                      );
                    })}
                    {!!total && (
                      <tr>
                        <td colSpan={2} className="fbold">
                          Total
                        </td>
                        <td>
                          <Amount classPropName={signClass(total)} amount={total} />
                        </td>
                      </tr>
                    )}
                  </>
                )}
                {!loading && !hasRows && (
                  <tr>
                    <td colSpan={3} className="text-center">
                      No Profit &amp; Loss Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfitLoss;
