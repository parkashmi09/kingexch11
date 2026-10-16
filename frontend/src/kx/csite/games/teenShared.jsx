// The parts app-casino-teen-pati and app-teenpatti share: the market header
// bar and the P/L line under a runner.
import { cx, num } from './teenUtil';

// Bootstrap's dropdown menu as Popper places it under the info icon.
const DROP_STYLE = { position: 'absolute', inset: '0px 0px auto auto', margin: 0, transform: 'translate(-10px, 20px)' };

/**
 * The market header bar of app-casino-teen-pati / app-teenpatti: the market
 * name (it collapses the market), Min/Max on desktop, and on a phone the info
 * icon opening the Min/Max dropdown.
 */
export function MarketHeader({ C, m, open, onInfo, collapse }) {
  const minMax = `Min/Max: ${m.min} - ${m.max} `;
  return (
    <span {...C} className="btn btn-primary card-header inner-sportbook">
      <span {...C} data-bs-toggle="collapse" role="button" aria-expanded={collapse.expanded ? 'true' : 'false'}
        aria-controls="multiCollapseExample1" className={cx('minmax', !collapse.expanded && 'collapsed')}
        data-bs-target={`#multiCollapseExample${m.marketId}`} onClick={collapse.toggle}>
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

/**
 * The P/L line under a runner (app-casino-teen-pati / app-teenpatti): with a
 * book for the market (casinoPl) its P / L and what the open slip's stake
 * would make of it; without one, the open slip's P (struck runner) or L (the
 * market's others) alone.
 */
export function PlLine({ C, m, r, table, fontSize }) {
  const { casinoPl, value: v, slip } = table;
  const book = casinoPl[m.marketId];
  const price = r.price.back[0]?.price;
  const inMarket = slip?.marketId === m.marketId;
  const isOpen = inMarket && slip?.selectionId === r.selectionId;
  const cls = (x) => (x > 0 ? 'plus-book' : 'minus-book');
  if (book) {
    const pl = book[r.selectionId];
    return (
      <span {...C} className="p-0" style={{ display: 'flex', fontSize, fontWeight: 400 }}>
        {pl < 0 && <span {...C} style={{ fontWeight: 'bold' }}> L : </span>}
        {pl > 0 && <span {...C} style={{ fontWeight: 'bold' }}> P :</span>}
        <span {...C} className={cx('d-flex', cls(pl))}>
          {` ${pl ? num(pl, '1.0-2') : '0.00'} `}
          {isOpen && Number(v) !== 0 && (
            <span {...C} className={cls((price - 1) * v + (pl || 0))}>{` ( ${num((price - 1) * v + (pl || 0), '1.0-2')} ) `}</span>
          )}
          {r.price.back[0] && !!v && !isOpen && inMarket && (
            <span {...C} className={cls(pl - v)}>{` ( ${num((pl || 0) - v, '1.0-2')}) `}</span>
          )}
        </span>
      </span>
    );
  }
  if (!v) return null;
  return (
    <span {...C} style={{ display: 'flex', padding: 0 }}>
      {isOpen && (
        <span {...C} className="plus-book d-flex" style={{ marginRight: 5 }}>
          <span {...C} style={{ color: 'black', marginRight: 2, fontWeight: 'bold' }}>P :</span>
          <span {...C} className="plus-book">{` ${num((price - 1) * v, '1.0-2')}`}</span>
        </span>
      )}
      {!isOpen && inMarket && (
        <span {...C} className="minus-book d-flex">
          <span {...C} style={{ color: 'black', marginRight: 2, fontWeight: 'bold' }}>L :</span>
          <span {...C} className="minus-book">{`${num(v, '1.0-2')} `}</span>
        </span>
      )}
    </span>
  );
}

