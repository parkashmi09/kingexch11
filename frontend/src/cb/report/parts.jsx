import { useMemo, useState } from 'react';
import Datetime from 'react-datetime';
import { CSVLink } from 'react-csv';
import printJS from 'print-js';
import { common } from '../assets';
import { cbToastError } from '../toast';

/**
 * The pieces every reference report page is built from.
 *
 * Each one mirrors a component in the reference bundle, named here for what it
 * does: DateRange is its `Lp`, ExportCsv its `NS`, PrintButton its `TS`,
 * Pagination its `Sp`, Amount its `sn`, Loading its `Pp`.
 *
 * The reference's own stylesheet already carries the react-datetime rules
 * (.rdt, .rdtPicker, .rdtDay ...), so the picker needs no stylesheet import of
 * its own — importing react-datetime's would double them up.
 */

/** From/to pair. react-datetime, DD/MM/YYYY HH:mm, same two column widths. */
export function DateRange({ from, to, onChange }) {
  const guard = (which, value) => {
    try {
      if (new Date(value) != 'Invalid Date') onChange(which, value);
      else onChange(which, null);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <>
      <div className="col-12 col-sm-6 col-md-3 col-lg-3 col-xl-2">
        <div className="form-group font-12">
          <Datetime
            value={from}
            onChange={(v) => guard('from', v._d)}
            id="from_datetime"
            dateFormat="DD/MM/YYYY"
            timeFormat="HH:mm"
          />
        </div>
      </div>
      <div className="col-12 col-sm-6 col-md-3 col-lg-3 col-xl-2">
        <div className="form-group font-12">
          <Datetime
            value={to}
            onChange={(v) => guard('to', v._d)}
            id="to_datetime"
            dateFormat="DD/MM/YYYY"
            timeFormat="HH:mm"
          />
        </div>
      </div>
    </>
  );
}

/** CSV export. The row array is built on click, so it is never stale. */
export function ExportCsv({ exportCsv = () => ({}), fileName = 'export', disabled = false }) {
  const [rows, setRows] = useState([]);
  return (
    <CSVLink
      data={rows}
      filename={`${fileName}.csv`}
      onClick={() => setRows(exportCsv())}
      className={`btn btn-sm d-inline csv-icon p-0 ${disabled ? 'disabled' : ''}`}
      title="Export CSV"
    >
      <button className="btn btn-sm d-inline csv-icon p-0" title="Export CSV">
        <img src={common('csv-icon.svg')} alt="CSV" />
      </button>
    </CSVLink>
  );
}

/** Print. Prints whatever is inside #printJS-div, which every table sits in. */
export function PrintButton({ disabled = false }) {
  const print = () =>
    printJS({
      printable: 'printJS-div',
      type: 'html',
      css: [
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css',
        '/styles/table.css',
      ],
      style: `
              .table-responsive { overflow-x: visible !important; }
            `,
    });
  return (
    <button
      className={`btn btn-sm pdf-icon d-inline p-0 ${disabled ? 'disabled' : ''}`}
      title="Export PDF"
      onClick={print}
    >
      <img src={common('pdf-icon.svg')} alt="PDF" />
    </button>
  );
}

/** "Showing x to y of n Entries" plus the numbered pager, with its ellipses. */
export function Pagination({ currentPage, handleOnPageChange, totalEntries, pageSize }) {
  const last = Math.ceil(totalEntries / pageSize);
  const first = (currentPage - 1) * pageSize + 1;
  const upto = Math.min(currentPage * pageSize, totalEntries);
  const pages = (() => {
    const out = [];
    out.push(1);
    if (currentPage > 3) out.push('...');
    for (let p = currentPage - 1; p <= currentPage + 1; p++) if (p > 1 && p < last) out.push(p);
    if (currentPage < last - 2) out.push('...');
    if (last > 1 && !out.includes(last)) out.push(last);
    return out;
  })();
  const go = (p) => {
    if (p >= 1 && p <= last && p !== '...') handleOnPageChange(p);
  };
  return (
    <div className="d-flex justify-content-between mt-2 pagecolumn">
      <div className="paginationtext">
        Showing <span>{first}</span> to <span>{upto}</span> of <span>{totalEntries}</span> Entries
      </div>
      <div className="d-flex">
        <nav aria-label="Pagination">
          <ul className="mb-0 pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => go(currentPage - 1)} disabled={currentPage === 1}>
                <span aria-hidden="true" className="pageheight">
                  «
                </span>
              </button>
            </li>
            {pages.map((p, i) => (
              <li
                key={`pagination-${p}-${i}`}
                className={`page-item ${currentPage === p ? 'active' : p === '...' ? 'disabled' : ''}`}
              >
                <button className="page-link" onClick={() => go(p)} disabled={p === '...'}>
                  {p}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === last ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => go(currentPage + 1)} disabled={currentPage === last}>
                <span aria-hidden="true" className="pageheight">
                  »
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

/** Two-decimal money. `showColor` greens a profit and reds a loss inline. */
export function Amount({ amount = 0, sharing, showInverse = false, showColor = false, classPropName = '' }) {
  const value = useMemo(() => {
    let n = parseFloat(amount) || 0;
    if (sharing && parseFloat(sharing) > 0) n = (parseFloat(sharing) * n) / 100;
    if (showInverse) n = 0 - n;
    return n.toFixed(2);
  }, [amount, sharing, showInverse]);
  const style = useMemo(
    () => (showColor ? (value < 0 ? { color: 'red' } : value > 0 ? { color: 'green' } : {}) : {}),
    [value, showColor]
  );
  return (
    <span className={classPropName} style={style}>
      {value}
    </span>
  );
}

/** The one-line loader that sits between the filters and the table. */
export const Loading = () => <span className="loadingtext">Loading...</span>;

/** "YYYY-MM-DD HH:mm:ss" out of the feed, read as UTC, shown in en-IN. */
export const fmtDate = (value) => {
  if (!value) return '-';
  const parts = String(value).split(' ');
  if (parts.length < 2) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('en-IN');
  }
  return new Date(`${parts[0]}T${parts[1]}.000+00:00`).toLocaleString('en-IN');
};

/** Every report refuses a range wider than a month, with this exact message. */
export const withinOneMonth = (from, to) => {
  const ms = Math.abs(new Date(to) - new Date(from));
  if (Math.ceil(ms / (1000 * 60 * 60 * 24)) > 31) {
    cbToastError('Date range must be 1 month.');
    return false;
  }
  return true;
};

/** The two defaults every report opens on: yesterday 00:00 -> tomorrow 00:00. */
export const dayBefore = () => new Date(Date.now() - 1440 * 60 * 1000).setHours(0, 0, 0, 0);
export const dayAfter = () => new Date(Date.now() + 1440 * 60 * 1000).setHours(0, 0, 0, 0);

/** The inline button spinner every submit shows while it is in flight. */
export const Spinner = () => (
  <svg className="spinner mr-2" viewBox="0 0 50 50">
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
  </svg>
);
