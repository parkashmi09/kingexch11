import { useState } from 'react';
import { ODDS_COLUMNS, priceOf, formatSize } from './odds';

const OPEN_STATES = ['', 'OPEN', 'ACTIVE'];
const isBallRunning = (s) => ['BALL RUNNING', 'BALL_RUNNING'].includes(s);

/**
 * The banner a closed book shows across its price columns, or null when it is
 * open. Same rule the app's existing Market2Block uses: "Ball Running" only
 * when the feed actually says so — a plain SUSPENDED market reads "Suspended",
 * because the two mean different things to a punter (a pause between balls vs.
 * a market pulled).
 *
 * Read at both levels: a market can be suspended as a whole, or an individual
 * runner can be while the rest of the book trades.
 */
function suspendedLabel(marketStatus, sections) {
  const m = String(marketStatus || '').toUpperCase();
  const secStates = (sections || []).map((x) => String(x.gstatus || '').toUpperCase());
  const allSectionsClosed =
    secStates.length > 0 && secStates.every((x) => !OPEN_STATES.includes(x));

  if (OPEN_STATES.includes(m) && !allSectionsClosed) return null;
  if (isBallRunning(m) || (secStates.length > 0 && secStates.every(isBallRunning))) {
    return 'Ball Running';
  }
  return 'Suspended';
}

/** The same test for one runner, when the market itself is open. */
function runnerSuspendedLabel(section) {
  const s = String(section?.gstatus || '').toUpperCase();
  if (OPEN_STATES.includes(s)) return null;
  return isBallRunning(s) ? 'Ball Running' : 'Suspended';
}

// The reference titles the outright market "Winner"; the feed calls it
// TOURNAMENT_WINNER. Everything else is shown under the name the feed gives it.
const TITLES = { TOURNAMENT_WINNER: 'Winner' };
const marketTitle = (m) => TITLES[m.mname] || m.mname || 'Market';

function EventMarket({ market, sid, onOddsClick }) {
  const [open, setOpen] = useState(true);
  const runners = market.section || [];
  const suspended = suspendedLabel(market.status, runners);

  // The feed sends limits per market; a 0 max means "no cap set upstream" and
  // the reference still prints it.
  const min = Number(market.min || 0).toFixed(2);
  const max = Number(market.maxb > 0 ? market.maxb : market.max || 0).toFixed(2);

  return (
    <>
      <div className="eventtitle-box margintop-2">
        <div>{marketTitle(market)}</div>
        <div className="d-flex align-items-center">
          <span
            className="ml-5 cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={open ? 'Collapse' : 'Expand'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <i className={`fa fa-angle-${open ? 'down' : 'right'}`} aria-hidden="true"></i>
          </span>
        </div>
      </div>

      {open && (
        <div className="sportscardRow m-0 border-radius-0 p-1 pb-0">
          {/* Limits on the left, Back/Lay column headings on the right. */}
          <div className="oddsList mainsports bottomborder-1 height20">
            <div className="runnerName eventdetails-54132 title-minmax title-pt5">
              Min <span>{min}</span>{' '}
              <span className="mx-1">|</span>{' '}
              {/* "Max:" carries a colon and "Min" does not — the reference's
                  own asymmetry. */}
              <span>
                Max: <span>{max}</span>
              </span>
            </div>
            <ul className="oddsRow runnerOdds eventdetails-45 backlay-header height27 marginbt6">
              {ODDS_COLUMNS.map((c) => {
                const isCentre = c.cls === 'back' || c.cls === 'lay';
                return (
                  <li
                    key={c.headerCls}
                    className={`${c.headerCls} height27${c.mobileHidden ? ' mhide' : ''} cursor-pointer clickable-odd${isCentre ? ' border-radius-top' : ''}`}
                  >
                    {c.cls === 'back' ? 'Back' : c.cls === 'lay' ? 'Lay' : '-'}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="marketOdd">
            {runners.map((runner, i) => {
              // A market-wide banner wins; otherwise the runner may be closed
              // on its own.
              const rowSuspended = suspended || runnerSuspendedLabel(runner);
              return (
              <div key={runner.sid ?? runner.sno ?? i}>
                <div className="oddsList mainsports">
                  <div className="runnerName eventdetails-54132 ">
                    <div className="w-100">
                      <span className={`vsName ${sid}`}>{runner.nat}</span>
                      {/* Exposure is rendered but kept invisible until the user
                          has a position on the runner — the reference reserves
                          the line either way so rows never shift height. */}
                      <div className="runner-exposure visibility-hidden">
                        <span className="small"></span>
                      </div>
                    </div>
                  </div>
                  <ul className="oddsRow runnerOdds eventdetails-45">
                    {ODDS_COLUMNS.map((c) => {
                      const price = priceOf(runner, c.oname);
                      return (
                        <li
                          key={c.cls}
                          className={`${c.cls} height36${c.mobileHidden ? ' mhide' : ''}${price && !rowSuspended ? ' cursor-pointer clickable-odd' : ''}`}
                          role={price && !rowSuspended ? 'button' : undefined}
                          tabIndex={price && !rowSuspended ? 0 : undefined}
                          onClick={() =>
                            price && !rowSuspended && onOddsClick(market, runner, c.side, price)
                          }
                        >
                          {price ? (
                            <>
                              {price.odds}
                              <small>{formatSize(price.size)}</small>
                            </>
                          ) : (
                            '–'
                          )}
                        </li>
                      );
                    })}
                    {rowSuspended && <span className="suspended">{rowSuspended}</span>}
                  </ul>
                </div>
                {i < runners.length - 1 && <div className="border-bottom-1"></div>}
              </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default EventMarket;
