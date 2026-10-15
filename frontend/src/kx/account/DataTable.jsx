import { useMemo, useState } from 'react';

// DataTables 1.13 (angular-datatables, "angular way") as the reference's report
// pages render it: the wrapper with its length menu, info line and
// full_numbers pager around the page's own <table>. The reference runs it
// server-side and hands DataTables no rows (`data: []`), so DataTables always
// keeps its hidden "No data available in table" row in the body while the
// page's own rows render beside it; this reproduces that markup. Here the
// sorting and paging run over the rows the page already holds.

let tableCount = 0; // DataTables numbers its tables per page load: DataTables_Table_<n>

const BUTTONS = 7;
const range = (from, to) => Array.from({ length: to - from }, (_, i) => from + i);

// DataTables' _numbers(): which page buttons the pager shows.
function pageNumbers(page, pages) {
  const half = Math.floor(BUTTONS / 2);
  if (pages <= BUTTONS) return range(0, pages);
  if (page <= half) return [...range(0, BUTTONS - 2), 'ellipsis', pages - 1];
  if (page >= pages - 1 - half) return [0, 'ellipsis', ...range(pages - (BUTTONS - 2), pages)];
  return [0, 'ellipsis', ...range(page - half + 2, page + half - 1), 'ellipsis', pages - 1];
}

const compare = (a, b) => {
  if (a == null) a = '';
  if (b == null) b = '';
  const na = Number(a);
  const nb = Number(b);
  if (a !== '' && b !== '' && !Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b));
};

/**
 * columns: [{ title, key (row field or fn to sort by), orderable = true, style }]
 * order:   the initial [column, 'asc' | 'desc'] (DataTables' default [0, 'asc'])
 * rows:    every row; renderRows(pageRows) returns the page's <tr>s
 * ownBody: the page's template always has its <tbody> (statement, password
 *          history); otherwise its <tbody> only exists while there are rows
 *          and DataTables adds a bare one of its own ahead of it.
 * drawKey: changing it redraws from the first page (the reference's rerender()).
 */
export default function DataTable({ A, className, columns, order: initialOrder = [0, 'asc'], rows, renderRows, ownBody = false, footer, drawKey }) {
  const [id] = useState(() => `DataTables_Table_${tableCount++}`);
  const [length, setLength] = useState(10);
  const [order, setOrder] = useState(initialOrder);
  const [pageState, setPageState] = useState({ page: 0, drawKey });
  // A new drawKey (Get Statement and the like) starts again at the first page.
  const page = pageState.drawKey === drawKey ? pageState.page : 0;
  const setPage = (p) => setPageState({ page: p, drawKey });

  const sorted = useMemo(() => {
    const [col, dir] = order;
    const key = columns[col]?.key;
    if (!key) return rows;
    const get = typeof key === 'function' ? key : (r) => r[key];
    const out = [...rows].sort((a, b) => compare(get(a), get(b)));
    return dir === 'desc' ? out.reverse() : out;
  }, [rows, order, columns]);

  const total = sorted.length;
  const pages = Math.ceil(total / length);
  const start = page * length;
  const pageRows = sorted.slice(start, start + length);

  const sortBy = (i) => {
    const [col, dir] = order;
    setOrder([i, col === i && dir === 'asc' ? 'desc' : 'asc']);
    setPage(0);
  };

  const button = (name, label, target, disabled) => (
    <a
      key={name}
      className={`paginate_button ${name}${disabled ? ' disabled' : ''}`}
      aria-controls={id}
      aria-disabled={disabled ? 'true' : undefined}
      role="link"
      data-dt-idx={name}
      tabIndex={disabled ? -1 : 0}
      id={`${id}_${name}`}
      onClick={() => !disabled && setPage(target)}
    >
      {label}
    </a>
  );

  const emptyRow = (
    <tr className="odd">
      <td valign="top" colSpan={columns.length} className="dataTables_empty">No data available in table</td>
    </tr>
  );

  return (
    <div id={`${id}_wrapper`} className="dataTables_wrapper">
      <div className="dataTables_length" id={`${id}_length`}>
        <label>
          {'Show '}
          <select
            name={`${id}_length`}
            aria-controls={id}
            className=""
            value={length}
            onChange={(e) => { setLength(Number(e.target.value)); setPage(0); }}
          >
            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          {' entries'}
        </label>
      </div>
      <table {...A} datatable="" className={`${className} dataTable`} id={id} aria-describedby={`${id}_info`}>
        <thead {...A}>
          <tr {...A}>
            {columns.map((c, i) => {
              const label = c.title.replace(/&/g, '&amp;');
              if (c.orderable === false) {
                return (
                  <th {...A} key={c.title} className="text-center sorting_disabled" style={c.style} rowSpan={1} colSpan={1} aria-label={label}>{c.title}</th>
                );
              }
              const dir = order[0] === i ? order[1] : null;
              return (
                <th
                  {...A}
                  key={c.title}
                  className={`text-center sorting${dir ? ` sorting_${dir}` : ''}`}
                  style={c.style}
                  tabIndex={0}
                  aria-controls={id}
                  rowSpan={1}
                  colSpan={1}
                  aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  aria-label={`${label}: activate to sort column ${dir === 'asc' ? 'descending' : 'ascending'}`}
                  onClick={() => sortBy(i)}
                >
                  {c.title}
                </th>
              );
            })}
          </tr>
        </thead>
        {ownBody ? (
          <tbody {...A}>
            {renderRows(pageRows)}
            {emptyRow}
          </tbody>
        ) : (
          <>
            <tbody>{emptyRow}</tbody>
            {pageRows.length > 0 && <tbody {...A}>{renderRows(pageRows)}</tbody>}
          </>
        )}
        {footer}
      </table>
      <div className="dataTables_info" id={`${id}_info`} role="status" aria-live="polite">
        {`Showing ${total ? start + 1 : 0} to ${Math.min(start + length, total)} of ${total} entries`}
      </div>
      <div className="dataTables_paginate paging_full_numbers" id={`${id}_paginate`}>
        {button('first', 'First', 0, page === 0)}
        {button('previous', 'Previous', page - 1, page === 0)}
        <span>
          {pageNumbers(page, pages).map((n, i) => (n === 'ellipsis' ? (
            <span key={`e${i}`} className="ellipsis">…</span>
          ) : (
            <a
              key={n}
              className={`paginate_button${n === page ? ' current' : ''}`}
              aria-controls={id}
              aria-current={n === page ? 'page' : undefined}
              role="link"
              data-dt-idx={n}
              tabIndex={0}
              onClick={() => setPage(n)}
            >
              {n + 1}
            </a>
          )))}
        </span>
        {button('next', 'Next', page + 1, page >= pages - 1)}
        {button('last', 'Last', pages - 1, page >= pages - 1)}
      </div>
    </div>
  );
}
