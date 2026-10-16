// The market header bar app-lucky7 and app-card32 share (the casino site's
// "sportbook" market card): the market name, Min/Max on desktop and, on a
// phone, the info icon opening the Min/Max dropdown.
import { cx } from './teenUtil';

// Bootstrap's dropdown menu as Popper places it under the info icon.
const DROP_STYLE = { position: 'absolute', inset: '0px 0px auto auto', margin: 0, transform: 'translate(-10px, 20px)' };

/**
 * `extra` — more classes on the bar (app-lucky7's later markets carry "111").
 * `collapse` — useCollapse() when the name collapses the market (app-lucky7's
 * collapse body has the id its toggle targets); omitted when the toggle
 * targets nothing (app-card32's bodies keep a fixed id) and so does nothing.
 * `open` / `onInfo` — the info dropdown's state (useTablePage).
 */
export function SportbookHeader({ C, m, extra, collapse, open, onInfo }) {
  const minMax = `Min/Max: ${m.min} - ${m.max} `;
  const expanded = collapse ? collapse.expanded : true;
  return (
    <span {...C} className={cx('btn btn-primary card-header inner-sportbook', extra)}>
      <span {...C} data-bs-toggle="collapse" role="button" aria-expanded={expanded ? 'true' : 'false'}
        aria-controls="multiCollapseExample1" className={cx('minmax', !expanded && 'collapsed')}
        data-bs-target={`#multiCollapseExample${m.marketId}`} onClick={collapse?.toggle}>
        <strong {...C}>{m.marketName}</strong>
      </span>
      <div {...C} className="minMaxDesktop"><span {...C}>{minMax}</span></div>
      <span {...C} className="minMaxMobile">
        <i {...C} data-bs-toggle="dropdown" aria-expanded={open ? 'true' : 'false'}
          className={cx('fa fa-info-circle ml-2', open && 'show')} data-bs-target="#collapse121"
          id={`#collapse12${m.marketId}`} onClick={(e) => { e.stopPropagation(); onInfo(m.marketId); }} />
        <ul {...C} className={cx('dropdown-menu icon-range min-max-info text-end tooltip-betlimit', open && 'show')}
          aria-labelledby={`collapse12${m.marketId}`} style={open ? DROP_STYLE : undefined}
          data-popper-placement={open ? 'bottom-end' : undefined}>
          <span {...C}>{minMax}</span>
        </ul>
      </span>
    </span>
  );
}
