import useDarkTheme from '../useTheme';

/**
 * The frame every report page shares.
 *
 * The reference gives them all the same shape — a title bar, a card, a filter
 * row of a select and a date range with Go/Reset, then a search box beside the
 * export buttons, and the table itself. Only the filters and the columns differ
 * per report, so those come in as props and everything else lives here.
 */
function ReportShell({ title, filters, search, actions, children }) {
  return (
    <div>
      <div className="eventtitle-box mt5 r-title">{title}</div>
      <div className="sportscardRow mt-0 rmain-title p-2 min-height500">
        {filters && (
          <div className="resport-search">
            <div className="row">{filters}</div>
          </div>
        )}

        {(search || actions) && (
          <div className="">
            <div className="searchandentries">
              <div className="searchandentries-first">
                {search}
                {actions}
              </div>
            </div>
          </div>
        )}

        <div id="printJS-div" className="table-responsive">
          {children}
        </div>
      </div>
    </div>
  );
}

/** The Go / Reset pair that closes every filter row. */
export function ReportButtons({ onGo, onReset }) {
  return (
    <div className="col-12 col-sm-6 col-md-3 col-lg-2 ">
      <div className="groupbtn" role="group" aria-label="Basic example" id="">
        <button className="btn reportbtn" onClick={onGo}>
          Go
        </button>
        <button className="btn reportbtn ml-1" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

/** A labelled select in the filter row. `darkarrow` swaps the chevron in dark. */
export function ReportSelect({ title, name, value, onChange, options }) {
  const dark = useDarkTheme();
  return (
    <div className="col-12 col-sm-6 col-md-3 col-lg-2 col-xl-2 ">
      <div className="form-group font-12 ">
        <select
          title={title}
          className={`form-select ${dark ? 'darkarrow' : ''}`}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/** The from/to pair. Native date-times, which is what the reference renders. */
export function ReportDateRange({ from, to, onFrom, onTo }) {
  return (
    <>
      <div className="col-12 col-sm-6 col-md-3 col-lg-2 col-xl-2 ">
        <div className="form-group font-12 ">
          <input
            type="datetime-local"
            className="form-control"
            value={from}
            onChange={(e) => onFrom(e.target.value)}
          />
        </div>
      </div>
      <div className="col-12 col-sm-6 col-md-3 col-lg-2 col-xl-2 ">
        <div className="form-group font-12 ">
          <input
            type="datetime-local"
            className="form-control"
            value={to}
            onChange={(e) => onTo(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}

/** The search box that sits above the table. */
export function ReportSearch({ value, onChange }) {
  return (
    <div className="form-group font-12 w-160">
      <input
        type="text"
        name="name"
        className="form-control"
        value={value}
        alt="Search"
        placeholder="Search"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Pager. Follows the SERVER's total, so an empty last page still offers a way back. */
export function ReportPager({ page, totalPages, onPage }) {
  if (!totalPages || totalPages < 1) return null;
  const step = (p) => () => p >= 1 && p <= totalPages && p !== page && onPage(p);
  return (
    <ul className="pagination justify-content-center mt-2">
      <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
        <a tabIndex={page === 1 ? -1 : 0} className="page-link" onClick={step(1)}>&lt;&lt;</a>
      </li>
      <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
        <a tabIndex={page === 1 ? -1 : 0} className="page-link" onClick={step(page - 1)}>&lt;</a>
      </li>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
          <a tabIndex={0} className="page-link" onClick={step(p)}>{p}</a>
        </li>
      ))}
      <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
        <a tabIndex={page === totalPages ? -1 : 0} className="page-link" onClick={step(page + 1)}>&gt;</a>
      </li>
      <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
        <a tabIndex={page === totalPages ? -1 : 0} className="page-link" onClick={step(totalPages)}>&gt;&gt;</a>
      </li>
    </ul>
  );
}

export default ReportShell;
