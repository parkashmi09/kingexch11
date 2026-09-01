import { useEffect, useState } from 'react';
import { isSectionSuspended, isMarketSuspended, formatSize } from '../../utils/oddsHelpers';
import BetSlip from './BetSlip';

// Fancy prices come as a No/Yes pair, not a six-deep ladder: `lay1` is the No
// side and `back1` the Yes side. Each carries the run line in `odds` and the
// rate in `size`, which is why the cell shows the figure large and the rate
// small underneath.
const priceFor = (section, side) => {
  const want = side === 'lay' ? 'lay1' : 'back1';
  const hit = (section?.odds || []).find(
    (o) => String(o.oname || '').toLowerCase() === want
  );
  if (!hit || !(Number(hit.odds) > 0)) return null;
  return { odds: hit.odds, size: hit.size };
};

// A row is closed either because its market is, or on its own.
function suspendLabel(market, section) {
  if (isMarketSuspended(market)) {
    const s = String(market.gstatus || market.status || '').toUpperCase();
    return s === 'BALL RUNNING' ? 'Ball Running' : 'Suspended';
  }
  if (!isSectionSuspended(section)) return null;
  const s = String(section.gstatus || section.status || '').toUpperCase();
  return s === 'BALL RUNNING' ? 'Ball Running' : 'Suspended';
}

const minMaxOf = (section) => {
  const min = Number(section?.min || 0);
  const max = Number(section?.max || 0);
  if (!min && !max) return null;
  return `${formatSize(min) || min} / ${formatSize(max) || max}`;
};

// Underscored market types read as words in the header ("1ST_INNINGS_RUNS").
const groupLabel = (name) => String(name || '').replace(/_/g, ' ');

function FancyRow({ market, section, selected, onPick, slipBet, onSlipClose }) {
  const [tipOpen, setTipOpen] = useState(false);
  const label = suspendLabel(market, section);
  const minMax = minMaxOf(section);

  const cell = (side) => {
    const price = priceFor(section, side);
    const live = !label && price;
    return (
      <li
        className={`${side} 2.24 height36${live ? ' clickable' : ''}`}
        role={live ? 'button' : undefined}
        onClick={() => live && onPick(market, section, side, price)}
      >
        {price ? price.odds : '–'}
        <small>{price ? formatSize(price.size) : ''}</small>
      </li>
    );
  };

  return (
    <div className="fancyOdds-row-wrapper">
      <div className="oddsList fancyOdds fancyOdds-row">
        <div className="runnerName eventdetails-54 fancy61-width">
          <div className="w-100 margin-left-2px">
            <h3 className="vsName ">{section.nat}</h3>
            {/* The limits live in a tap-target on a phone, where the wide
                Min/Max column at the end of the row is hidden. */}
            <div className="align-items-center d-flex">
              <div className="mfancy-icon mfancy-10" style={{ marginLeft: 'auto' }}>
                {minMax != null && (
                  <a
                    className="dhide float-right"
                    onClick={(e) => { e.stopPropagation(); setTipOpen((v) => !v); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fa fa-info-circle" aria-hidden="true"></i>
                  </a>
                )}
                {tipOpen && minMax != null && (
                  <div className="mfancy-minmax-popup">
                    <span
                      className="mfancy-minmax-close"
                      onClick={(e) => { e.stopPropagation(); setTipOpen(false); }}
                    >
                      ×
                    </span>
                    <span>Min / Max</span>
                    <span>{minMax}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <ul
          className="oddsRow runnerOdds eventdetails-45 fancy24-width w-100"
          style={{ width: '100%!important' }}
        >
          {/* No before Yes — the reverse of the match-odds ladder. */}
          <div className="fancysuspendbox">
            {cell('lay')}
            {cell('back')}
            {label && <span className="suspended">{label}</span>}
          </div>
        </ul>

        {minMax != null && (
          <div className="oddMin">
            <span>Min / Max</span>
            <span id="minMax">{minMax}</span>
          </div>
        )}
      </div>

      {/* The slip nests INSIDE the row here, not at the foot of the market —
          a fancy list can run to dozens of lines and the reference keeps the
          stake next to the line it belongs to. */}
      {selected && !label && slipBet && (
        <div className="fancyOdds-slip">
          <BetSlip bet={slipBet} onClose={onSlipClose} />
        </div>
      )}
    </div>
  );
}

/**
 * Every fancy-family market for an event, as one grouped list.
 *
 * The reference does not give these a card each: they share a tab strip and a
 * single list, with a header row per market carrying the No/Yes column
 * headings. Session, odd/even and the cricket-casino lines all land here —
 * anything that is not a back/lay ladder.
 */
function FancyMarkets({ markets, slipBet, onPick, onSlipClose }) {
  const [tab, setTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All', count: markets.reduce((n, m) => n + (m.section?.length || 0), 0) },
    ...markets.map((m) => ({
      id: String(m.mid ?? m.mname),
      label: groupLabel(m.mname),
      count: m.section?.length || 0,
    })),
  ];

  // A market that disappears from the feed must not leave the list empty.
  useEffect(() => {
    if (tab !== 'all' && !markets.some((m) => String(m.mid ?? m.mname) === tab)) setTab('all');
  }, [markets, tab]);

  const shown = tab === 'all' ? markets : markets.filter((m) => String(m.mid ?? m.mname) === tab);

  return (
    <>
      <div className="sportscardRow m-0 border-radius-0 p-1 fancybox-main">
        <ul className="fancybox">
          {tabs.map((t) => (
            <li className={tab === t.id ? 'active' : ''} key={t.id}>
              <a
                className={tab === t.id ? 'active' : ''}
                href="#"
                onClick={(e) => { e.preventDefault(); setTab(t.id); }}
              >
                {t.label}
                {t.count > 0 && <span>({t.count})</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="sportscardRow m-0 border-radius-0 p-1 mb-0">
        <div className="marketOdd fancymarket-event">
          <div className="fancyList margin-left--2px">
            {shown.map((market, mi) => (
              <div key={market.mid ?? market.mname ?? mi}>
                {mi !== 0 && <div className="emptydiv margin-left--2px"></div>}
                <div className="fancyOdds-row-wrapper fancyOdds-group-header fancypartbg">
                  <div className="oddsList fancyOdds fancyOdds-row height20 height20-fancy">
                    <div className="runnerName eventdetails-54 fancy61-width">
                      <h3 className="vsName fancytextsize margin-left-2px">
                        {groupLabel(market.mname)}
                      </h3>
                    </div>
                    <ul className="oddsRow runnerOdds eventdetails-45 fancy24-width marginbt6">
                      <li className="lay 2.24 height27 border-radius-top">No</li>
                      <li className="back 2.24 height27 border-radius-top">Yes</li>
                    </ul>
                    <div className="oddMin"> </div>
                  </div>
                </div>

                {(market.section || []).map((section, si) => {
                  const isSelected =
                    slipBet != null &&
                    String(slipBet.market_id) === String(market.mid) &&
                    String(slipBet.selectionId) === String(section.sid);
                  return (
                    <FancyRow
                      key={section.sid ?? section.sno ?? si}
                      market={market}
                      section={section}
                      selected={isSelected}
                      slipBet={isSelected ? slipBet : null}
                      onPick={onPick}
                      onSlipClose={onSlipClose}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default FancyMarkets;
