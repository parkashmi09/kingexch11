import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const CalendarSVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em">
    <path d="M940.218182 107.054545h-209.454546V46.545455h-65.163636v60.50909H363.054545V46.545455H297.890909v60.50909H83.781818c-18.618182 0-32.581818 13.963636-32.581818 32.581819v805.236363c0 18.618182 13.963636 32.581818 32.581818 32.581818h861.090909c18.618182 0 32.581818-13.963636 32.581818-32.581818V139.636364c-4.654545-18.618182-18.618182-32.581818-37.236363-32.581819zM297.890909 172.218182V232.727273h65.163636V172.218182h307.2V232.727273h65.163637V172.218182h176.872727v204.8H116.363636V172.218182h181.527273zM116.363636 912.290909V442.181818h795.927273v470.109091H116.363636z" />
  </svg>
);

const ClearSVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em">
    <path d="M810.005333 274.005333l-237.994667 237.994667 237.994667 237.994667-60.010667 60.010667-237.994667-237.994667-237.994667 237.994667-60.010667-60.010667 237.994667-237.994667-237.994667-237.994667 60.010667-60.010667 237.994667 237.994667 237.994667-237.994667z" />
  </svg>
);

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// The input displays DD/MM/YYYY (reference format) while the value passed
// around stays YYYY-MM-DD for the API.
function toDisplayStr(str) {
  const d = parseDate(str);
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function buildCalendarRows(year, month) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  // leading days from prev month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    cells.push({ date: new Date(prevYear, prevMonth, d), current: false });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true });
  }
  // trailing days from next month
  const remaining = 42 - cells.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(nextYear, nextMonth, d), current: false });
  }

  // split into 6 rows of 7
  const rows = [];
  for (let r = 0; r < 6; r++) {
    rows.push(cells.slice(r * 7, r * 7 + 7));
  }
  return rows;
}

function MxDatePicker({ value = '', onChange, maxDate, minDate, clearable = false, placeholder = '' }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const d = parseDate(value) || new Date();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseDate(value) || new Date();
    return d.getMonth();
  });
  const [popupStyle, setPopupStyle] = useState({ top: 0, left: 0 });

  const wrapperRef = useRef(null);
  const popupRef = useRef(null);

  // Sync view when value changes externally
  useEffect(() => {
    const d = parseDate(value);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  const openPopup = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const popupWidth = 280;
    const viewportWidth = window.innerWidth;
    let left = rect.left + window.scrollX;
    // Prevent overflow on the right
    if (left + popupWidth > viewportWidth) {
      left = Math.max(0, viewportWidth - popupWidth - 4);
    }
    setPopupStyle({
      position: 'absolute',
      top: rect.bottom + window.scrollY,
      left,
    });
    setOpen(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const today = toDateStr(new Date());
  const todayDate = parseDate(today);
  const selectedDate = parseDate(value);
  const maxDateObj = parseDate(maxDate);
  const minDateObj = parseDate(minDate);

  function isDisabled(date) {
    if (maxDateObj && date > maxDateObj) return true;
    if (minDateObj && date < minDateObj) return true;
    return false;
  }

  function handleDayClick(date) {
    if (isDisabled(date)) return;
    onChange(toDateStr(date));
    setOpen(false);
  }

  function handleClear(e) {
    e.stopPropagation();
    onChange('');
  }

  function prevYear() { setViewYear(y => y - 1); }
  function nextYear() { setViewYear(y => y + 1); }
  function prevMonth() {
    setViewMonth(m => {
      if (m === 0) { setViewYear(y => y - 1); return 11; }
      return m - 1;
    });
  }
  function nextMonth() {
    setViewMonth(m => {
      if (m === 11) { setViewYear(y => y + 1); return 0; }
      return m + 1;
    });
  }

  const rows = buildCalendarRows(viewYear, viewMonth);

  const popup = open ? (
    <div
      ref={popupRef}
      className="mx-datepicker-main mx-datepicker-popup"
      style={popupStyle}
    >
      <div className="mx-datepicker-content">
        <div className="mx-datepicker-body">
          <div className="mx-calendar mx-calendar-panel-date">
            <div className="mx-calendar-header">
              <button type="button" className="mx-btn mx-btn-text mx-btn-icon-double-left" onClick={prevYear}>
                <i className="mx-icon-double-left"></i>
              </button>
              <button type="button" className="mx-btn mx-btn-text mx-btn-icon-left" onClick={prevMonth}>
                <i className="mx-icon-left"></i>
              </button>
              <button type="button" className="mx-btn mx-btn-text mx-btn-icon-double-right" onClick={nextYear}>
                <i className="mx-icon-double-right"></i>
              </button>
              <button type="button" className="mx-btn mx-btn-text mx-btn-icon-right" onClick={nextMonth}>
                <i className="mx-icon-right"></i>
              </button>
              <span className="mx-calendar-header-label">
                <button type="button" className="mx-btn mx-btn-text mx-btn-current-month">
                  {MONTH_NAMES[viewMonth]}
                </button>
                <button type="button" className="mx-btn mx-btn-text mx-btn-current-year">
                  {viewYear}
                </button>
              </span>
            </div>
            <div className="mx-calendar-content">
              <table className="mx-table mx-table-date">
                <thead>
                  <tr>
                    {DAY_HEADERS.map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className="mx-date-row">
                      {row.map((cell, ci) => {
                        const dateStr = toDateStr(cell.date);
                        const disabled = isDisabled(cell.date);
                        const isToday = cell.date.getTime() === todayDate.getTime();
                        const isActive = selectedDate && cell.date.getTime() === selectedDate.getTime();
                        const isNotCurrent = !cell.current;

                        let cls = 'cell';
                        if (isNotCurrent) cls += ' not-current-month';
                        if (isToday) cls += ' today';
                        if (isActive) cls += ' active';
                        if (disabled) cls += ' disabled';

                        return (
                          <td
                            key={ci}
                            data-row-col={`${ri},${ci}`}
                            title={dateStr}
                            className={cls}
                            onClick={() => !disabled && handleDayClick(cell.date)}
                          >
                            <div>{cell.date.getDate()}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="mx-datepicker" ref={wrapperRef}>
      <div className="mx-input-wrapper" onClick={openPopup}>
        <input
          name="date"
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          className="mx-input"
          value={toDisplayStr(value)}
          readOnly
        />
        {open && value ? (
          <i className="mx-icon-clear" onClick={handleClear}>{ClearSVG}</i>
        ) : (
          <i className="mx-icon-calendar">{CalendarSVG}</i>
        )}
      </div>
      {popup && createPortal(popup, document.body)}
    </div>
  );
}

export default MxDatePicker;
