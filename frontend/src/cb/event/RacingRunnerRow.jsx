import { ODDS_COLUMNS, priceOf, formatSize } from './odds';
import { common } from '../assets';
import useDarkTheme from '../useTheme';

// Silks are served per market: race_icons/{marketId}/{runner sid}.png. The
// feed's `himg` is only "{sid}.png", so the market id has to be prefixed.
const SILK_BASE = 'https://sitethemedata.com/race_icons/';

// Indian races ship no silk at all; the fallback is a numbered horse
// silhouette by running position, which is what the old page did too.
const silkFor = (market, runner) =>
  runner.himg
    ? `${SILK_BASE}${market.mid}/${runner.sid}.png`
    : `/assets/horse/${runner.sno}.png`;

function suspendLabel(marketSuspended, runner) {
  if (marketSuspended) return 'Suspended';
  const s = String(runner?.gstatus || '').toUpperCase();
  if (!s || s === 'ACTIVE' || s === 'OPEN') return null;
  return s === 'BALL RUNNING' ? 'Ball Running' : 'Suspended';
}

/**
 * One runner in a race.
 *
 * Horse racing carries the full card — cloth number over stall draw, the
 * jockey's silk, the runner and jockey names, and a hover panel of form. The
 * reference gates all of that on the sport being horse racing; a greyhound row
 * is just the name and the prices, so `detailed` follows the same split.
 *
 * The form panel keeps every one of the reference's six rows even though this
 * feed only fills two of them. Trainer and age come through; weight, form, days
 * since last run, jockey claim and wearing are not in the payload, and the
 * reference prints "-" for a missing value, so the shape stays and the gaps
 * show honestly rather than the rows disappearing.
 */
function RacingRunnerRow({ market, runner, detailed, marketSuspended, exposure, onOddsClick }) {
  const dark = useDarkTheme();
  const label = suspendLabel(marketSuspended, runner);
  // Cloth number and stall draw genuinely differ (cloth 1 can be draw 5).
  // Indian races send no cloth, only a draw.
  const cloth = runner.cno || '';
  const draw = runner.sdraw || cloth;

  return (
    <div className="oddsList Horsemainbox">
      <div className="runnerName eventdetails-54132">
        <div className="horse-greyhoundbox">
          {detailed && (
            <ul className="horseracing ">
              <li className="stall-draw">{cloth}</li>
              <li className="stall-draw">({draw})</li>
            </ul>
          )}

          {detailed && (
            <div className="uniform ">
              <div className="imageloader imageloader-failed w-90">
                <span>
                  <img
                    alt="Horse"
                    src={silkFor(market, runner)}
                    className="horse-racing-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = common(`horse-racing${dark ? '-dark' : ''}.svg`);
                    }}
                  />
                </span>
              </div>
            </div>
          )}

          <div className="in-play-title d-inline-block horse-inplay-title">
            <ul className="horse-name">
              <li>{runner.nat}</li>
              <li>{runner.jname}</li>
            </ul>
          </div>

          {detailed && (
            <dl className="horse_info-hover">
              <dt>Trainer:</dt>
              <dd>{runner.tname || '-'}</dd>
              <dt>Age/Weight:</dt>
              <dd>{`${runner.hage ?? '-'}/${runner.weight || '-'}`}</dd>
              <dt>Form:</dt>
              <dd>{runner.form || '-'}</dd>
              <dt>Days since last run:</dt>
              <dd>{runner.daysLastRun || '-'}</dd>
              <dt>Jockey claim:</dt>
              <dd>{runner.jockeyClaim || '-'}</dd>
              <dt>Wearing:</dt>
              <dd>{runner.wearing || '-'}</dd>
            </dl>
          )}
        </div>

        {exposure != null && (
          <div className="runner-exposure justify-content-end">
            <span className="small">{exposure}</span>
          </div>
        )}
      </div>

      <ul className="oddsRow runnerOdds eventdetails-45">
        {ODDS_COLUMNS.map((c) => {
          const price = priceOf(runner, c.oname);
          const live = price && !label;
          return (
            <li
              key={c.cls}
              className={`${c.cls} height36${c.mobileHidden ? ' mhide' : ''}${live ? ' cursor-pointer clickable-odd' : ''}`}
              role={live ? 'button' : undefined}
              tabIndex={live ? 0 : undefined}
              onClick={() => live && onOddsClick(market, runner, c.side, price)}
            >
              {price ? price.odds : '–'}
              <small>{price ? formatSize(price.size) : ''}</small>
            </li>
          );
        })}
        {label && <span className="suspended">{label}</span>}
      </ul>
    </div>
  );
}

export default RacingRunnerRow;
