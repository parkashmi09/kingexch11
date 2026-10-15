import { useEffect, useRef, useState } from 'react';

// The reference's report filters use mydatepicker (<my-date-picker>), with the
// options every one of those pages passes: dd-mm-yyyy, the current day marked,
// no month selector, no today/clear buttons, opened by the input too, and the
// pages' disableUntil/disableSince window. This is that component's markup and
// calendar logic, so its stylesheet (css/my-date-picker.css) applies unchanged.

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MIN_YEAR = 1000;
const MAX_YEAR = 9999;
const PREV = 1;
const CURR = 2;
const NEXT = 3;

const getDate = (y, m, d) => new Date(y, m - 1, d, 0, 0, 0, 0);
const time = (d) => getDate(d.year, d.month, d.day).getTime();
const isInit = (d) => !!d && d.year !== 0 && d.month !== 0 && d.day !== 0;
const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
const today = () => {
  const n = new Date();
  return { year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() };
};
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const formatDate = (d) => `${pad(d.day)}-${pad(d.month)}-${d.year}`;

const disabledByUntil = (d, until) => isInit(until) && time(d) <= time(until);
const disabledBySince = (d, since) => isInit(since) && time(d) >= time(since);
const isDisabledDay = (d, { disableUntil, disableSince }) => {
  if ((d.year < MIN_YEAR && d.month === 12) || (d.year > MAX_YEAR && d.month === 1)) return true;
  return disabledByUntil(d, disableUntil) || disabledBySince(d, disableSince);
};

// generateCalendar(): six weeks from the Monday on or before the 1st.
function calendar(m, y, opts) {
  const t = today();
  const first = new Date(y, m - 1, 1).getDay(); // 0 = Sunday
  const startIdx = (first + 6) % 7; // Monday first
  const inMonth = daysInMonth(m, y);
  const prevDays = daysInMonth(m === 1 ? 12 : m - 1, m === 1 ? y - 1 : y);
  const cell = (dateObj, cmo) => ({
    dateObj,
    cmo,
    currDay: cmo === CURR && dateObj.day === t.day && dateObj.month === t.month && dateObj.year === t.year,
    disabled: isDisabledDay(dateObj, opts),
    highlight: getDate(dateObj.year, dateObj.month, dateObj.day).getDay() === 0, // sunHighlight
  });
  const weeks = [];
  let day = 1;
  let cmo = CURR;
  for (let w = 0; w < 6; w++) {
    const week = [];
    if (w === 0) {
      for (let d = prevDays - startIdx + 1; d <= prevDays; d++) {
        week.push(cell({ year: m === 1 ? y - 1 : y, month: m === 1 ? 12 : m - 1, day: d }, PREV));
      }
      while (week.length < 7) week.push(cell({ year: y, month: m, day: day++ }, CURR));
    } else {
      for (let i = 0; i < 7; i++) {
        if (day > inMonth) { day = 1; cmo = NEXT; }
        week.push(cell({
          year: cmo === NEXT && m === 12 ? y + 1 : y,
          month: cmo === CURR ? m : (cmo === NEXT && m < 12 ? m + 1 : 1),
          day,
        }, cmo));
        day++;
      }
    }
    weeks.push(week);
  }
  return weeks;
}

function headerState(m, y, { disableUntil, disableSince }) {
  const prevM = m === 1 ? 12 : m - 1;
  const prevY = m === 1 ? y - 1 : y;
  return {
    prevMonth: (m === 1 && y === MIN_YEAR) || disabledByUntil({ year: prevY, month: prevM, day: daysInMonth(prevM, prevY) }, disableUntil),
    prevYear: y - 1 < MIN_YEAR || disabledByUntil({ year: y - 1, month: m, day: daysInMonth(m, y - 1) }, disableUntil),
    nextMonth: (m === 12 && y === MAX_YEAR) || disabledBySince({ year: m === 12 ? y + 1 : y, month: m === 12 ? 1 : m + 1, day: 1 }, disableSince),
    nextYear: y + 1 > MAX_YEAR || disabledBySince({ year: y + 1, month: m, day: 1 }, disableSince),
  };
}

// generateYears(): a 5 × 5 grid from `from`.
function yearGrid(from, visible, opts) {
  const t = today();
  const rows = [];
  for (let r = from; r <= from + 20; r += 5) {
    const row = [];
    for (let y = r; y < r + 5; y++) {
      row.push({
        year: y,
        currYear: y === t.year,
        selected: y === visible.year,
        disabled: disabledByUntil({ year: y, month: visible.month, day: daysInMonth(visible.month, y) }, opts.disableUntil)
          || disabledBySince({ year: y, month: visible.month, day: 1 }, opts.disableSince)
          || y < MIN_YEAR || y > MAX_YEAR,
      });
    }
    rows.push(row);
  }
  return {
    rows,
    prevDisabled: from <= MIN_YEAR || disabledByUntil({ year: from - 1, month: visible.month, day: daysInMonth(visible.month, from - 1) }, opts.disableUntil),
    nextDisabled: from + 24 >= MAX_YEAR || disabledBySince({ year: from + 25, month: visible.month, day: 1 }, opts.disableSince),
  };
}

const cls = (map) => Object.keys(map).filter((k) => map[k]).join(' ');

/**
 * value:    the selected { year, month, day } (the page's model), or null
 * onChange: gets mydatepicker's model { date, jsdate, formatted, epoc }
 * A / className: the page's scope attribute and the host's classes
 */
export default function DatePicker({ A, className, value, onChange, opts }) {
  const hostRef = useRef(null);
  const selectorRef = useRef(null);
  const inputRef = useRef(null);
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState({ month: 0, year: 0 });
  const [years, setYears] = useState(null); // the year view, while open

  const selected = value || { year: 0, month: 0, day: 0 };
  const text = value ? formatDate(value) : '';

  const close = () => { setShow(false); setYears(null); };

  // Clicks anywhere else close it (onClickDocument).
  useEffect(() => {
    if (!show) return undefined;
    selectorRef.current?.focus();
    const onDoc = (e) => {
      if (hostRef.current && !hostRef.current.contains(e.target)) close();
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [show]);

  const toggle = () => {
    if (show) { close(); return; }
    const t = today();
    setVisible(isInit(selected) ? { month: selected.month, year: selected.year } : { month: t.month, year: t.year });
    setYears(null);
    setShow(true);
  };

  const shiftMonth = (by) => {
    const d = getDate(visible.year, visible.month, 1);
    d.setMonth(d.getMonth() + by);
    setVisible({ month: d.getMonth() + 1, year: d.getFullYear() });
  };

  const select = (d) => {
    onChange({ date: d, jsdate: getDate(d.year, d.month, d.day), formatted: formatDate(d), epoc: Math.round(time(d) / 1000) });
    close();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const onCell = (c) => {
    if (c.cmo === PREV) shiftMonth(-1);
    if (c.cmo === NEXT) shiftMonth(1);
    select(c.dateObj);
  };

  const head = show ? headerState(visible.month, visible.year, opts) : null;
  const grid = years && yearGrid(years, visible, opts);

  return (
    <my-date-picker {...A} ref={hostRef} placeholder="Select Date" name="mydate" readonly="" autocomplete="off" angular-mydatepicker="" class={className}>
      <div className="mydp" style={{ width: '100%' }}>
        <div className="selectiongroup">
          <input
            ref={inputRef}
            ngtype="text"
            autoComplete="off"
            spellCheck="false"
            autoCorrect="off"
            className="selection inputnoteditable"
            placeholder="Select Date"
            readOnly
            aria-label="Date input field"
            style={{ height: '34px', fontSize: '14px' }}
            value={text}
            onClick={toggle}
          />
          <div className="selbtngroup" style={{ height: '34px' }}>
            <button type="button" className="btnpicker btnpickerenabled" aria-label="Open Calendar" onClick={toggle}>
              <span className="mydpicon icon-mydpcalendar" />
            </button>
          </div>
        </div>
        {show && (
          <div ref={selectorRef} tabIndex={0} className="selector selectorarrow selectorarrowleft" style={{ width: '252px', height: '232px' }}>
            <table className="header">
              <tbody>
                <tr>
                  <td>
                    <div style={{ float: 'left' }}>
                      <div className="headerbtncell">
                        <button type="button" className={`headerbtn mydpicon icon-mydpleft ${head.prevMonth ? 'headerbtndisabled' : 'headerbtnenabled'}`} disabled={head.prevMonth} aria-label="Previous Month" onClick={() => shiftMonth(-1)} />
                      </div>
                      <div className="headermonthtxt">
                        <button type="button" className="headerlabelbtn" tabIndex={-1}>{MONTH_LABELS[visible.month]}</button>
                      </div>
                      <div className="headerbtncell">
                        <button type="button" className={`headerbtn mydpicon icon-mydpright ${head.nextMonth ? 'headerbtndisabled' : 'headerbtnenabled'}`} disabled={head.nextMonth} aria-label="Next Month" onClick={() => shiftMonth(1)} />
                      </div>
                    </div>
                  </td>
                  <td />
                  <td>
                    <div style={{ float: 'right' }}>
                      <div className="headerbtncell">
                        <button type="button" className={`headerbtn mydpicon icon-mydpleft ${head.prevYear ? 'headerbtndisabled' : 'headerbtnenabled'}`} disabled={head.prevYear} aria-label="Previous Year" onClick={() => setVisible({ ...visible, year: visible.year - 1 })} />
                      </div>
                      <div className="headeryeartxt">
                        <button type="button" className="headerlabelbtn yearlabel" tabIndex={0} onClick={(e) => { e.stopPropagation(); setYears(years ? null : visible.year); }}>{visible.year}</button>
                      </div>
                      <div className="headerbtncell">
                        <button type="button" className={`headerbtn mydpicon icon-mydpright ${head.nextYear ? 'headerbtndisabled' : 'headerbtnenabled'}`} disabled={head.nextYear} aria-label="Next Year" onClick={() => setVisible({ ...visible, year: visible.year + 1 })} />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            {!grid && (
              <table className="caltable">
                <thead>
                  <tr>
                    {DAY_LABELS.map((d) => <th key={d} scope="col" className="weekdaytitle">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {calendar(visible.month, visible.year, opts).map((week, w) => (
                    <tr key={w}>
                      {week.map((c) => {
                        const curr = c.cmo === CURR;
                        const isSel = curr && selected.day === c.dateObj.day && selected.month === c.dateObj.month && selected.year === c.dateObj.year;
                        return (
                          <td
                            key={`${c.dateObj.month}-${c.dateObj.day}`}
                            tabIndex={0}
                            className={`daycell ${cls({ currmonth: curr && !c.disabled, selectedday: isSel, disabled: c.disabled, tablesingleday: curr && !c.disabled })}`.trim()}
                            aria-label={`Select day${c.dateObj.day}`}
                            onClick={(e) => { if (!c.disabled) onCell(c); e.stopPropagation(); }}
                          >
                            <div className={`datevalue ${cls({ prevmonth: c.cmo === PREV, currmonth: curr, nextmonth: c.cmo === NEXT, highlight: c.highlight })}`}>
                              <span className={cls({ markcurrday: c.currDay, dimday: c.highlight && (c.cmo !== CURR || c.disabled) }) || undefined}>{c.dateObj.day}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {grid && (
              <table className="yeartable">
                <tbody>
                  <tr>
                    <td colSpan={5} className="yearchangebtncell" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className={`yearchangebtn mydpicon icon-mydpup ${grid.prevDisabled ? 'yearchangebtndisabled' : 'yearchangebtnenabled'}`} disabled={grid.prevDisabled} onClick={(e) => { e.stopPropagation(); setYears(years - 25); }} />
                    </td>
                  </tr>
                  {grid.rows.map((row) => (
                    <tr key={row[0].year}>
                      {row.map((y) => (
                        <td
                          key={y.year}
                          tabIndex={0}
                          className={`yearcell tablesingleyear ${cls({ selectedyear: y.selected, disabled: y.disabled })}`.trim()}
                          onClick={(e) => { if (!y.disabled) { setVisible({ ...visible, year: y.year }); setYears(null); selectorRef.current?.focus(); } e.stopPropagation(); }}
                        >
                          <div className={`yearvalue${y.currYear ? ' markcurryear' : ''}`}>{y.year}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={5} className="yearchangebtncell" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className={`yearchangebtn mydpicon icon-mydpdown ${grid.nextDisabled ? 'yearchangebtndisabled' : 'yearchangebtnenabled'}`} disabled={grid.nextDisabled} onClick={(e) => { e.stopPropagation(); setYears(years + 25); }} />
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </my-date-picker>
  );
}
