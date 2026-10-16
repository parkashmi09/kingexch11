import { useState } from 'react';
import { ng, host } from '../../ng';

const R = ng('crn');

const pad = (n) => String(n).padStart(2, '0');
// DatePipe "dd-MM-YYYY H:mm:ss".
const refDate = (v) => {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${d.getHours()}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
// DecimalPipe "1.2-2".
const decimal2 = (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// With no exposure list from the backend the reference's picker holds just
// this entry (its option value prints as "undefined,undefined").
const NO_EXPOSURE = [{ eventName: 'Select Market' }];

/**
 * app-right-nav of the casino site: the "Open Bets" card. Its market picker
 * lists the events the user has exposure on; picking one lists that event's
 * matched bets — backs, then lays — with the Bet Info toggle adding each
 * bet's ref and time.
 *
 * UI only: the backend supplies `exposureList` ([{ sportId, eventId,
 * eventName }], the reference's getUserExposureEventName) and answers
 * `onMarketChange(sportId, eventId)` with `bets` (its casinoMatchedBetList:
 * [{ _id, type 'B'|'L', selectionName, marketType, oddsPrice, oddsRate,
 * stake, betPl, updatedAt }]).
 */
export default function RightNav({ attrs, exposureList, bets = [], onMarketChange }) {
  const [showRef, setShowRef] = useState(false);
  const list = exposureList?.length ? exposureList : NO_EXPOSURE;

  const change = (e) => {
    const [sportId, eventId] = e.target.value.split(',');
    if (sportId && eventId && sportId !== 'undefined') onMarketChange?.(sportId, eventId);
  };

  const refRow = (b) => showRef && (
    <dd {...R} id="bet-yq1" className="ref-epq">
      <span {...R} id="bet-bjr">{`Ref: ${b._id}`}</span>
      <span {...R} id="pla-fpm">{refDate(b.updatedAt)}</span>
    </dd>
  );

  return (
    <app-right-nav {...attrs} {...host('crn')}>
      <div {...R} style={{ width: '26.15vw', position: 'fixed' }}>
        <div {...R} className="card">
          <div {...R} className="card-header">
            <strong {...R} style={{ position: 'relative', top: '0.5px' }}>Open Bets</strong>
          </div>
          <div {...R}>
            <div {...R} className="card-body open-bet-btns">
              <div {...R} className="col-sm-12 p-0 mlist-openbets">
                <select {...R} id="selectss" className="desktop-bets" onChange={change}>
                  {list.map((x, i) => (
                    <option key={`${x.eventId}-${i}`} {...R} value={`${x.sportId},${x.eventId}`}>{` ${x.eventName}`}</option>
                  ))}
                </select>
                {bets.length > 0 && (
                  <nav {...R} className="all-sports-list">
                    <div {...R} className="content-534">
                      <div {...R} className="act-16a tab-ltq">
                        <div {...R} id="dplql" name="txn" className="list-5fh">
                          <ul {...R} className="nav nav-tabs">
                            <li {...R} className="nav-item text-center">
                              <a {...R} className="nav-link active fw-bold"><span {...R}>Matched</span></a>
                            </li>
                          </ul>
                          <ul {...R} id="bac-xxb" className="matched-826 unity-ul-d78">
                            <li {...R} className="col-fpg">Back (Bet For)</li>
                            <li {...R} className="col-1ie">Odds</li>
                            <li {...R} className="col-mlt">Stake</li>
                            <li {...R} className="col-wcg">Profit</li>
                          </ul>
                          <div {...R} className="right-betslip-data">
                            {bets.filter((b) => b.type === 'B').map((b) => (
                              <dl
                                key={b._id}
                                {...R}
                                id="txn-ley"
                                className={`slip-3ga${showRef ? ' showRef' : ''}${b.marketType === 'SPORTSBOOK' ? ' SPORTSBOOK_BG' : ''}`}
                              >
                                {refRow(b)}
                                <dt {...R}>
                                  <span {...R} className="slip-ys5">Back</span>
                                  <span {...R} className="short-nbw">{b.selectionName}</span>
                                  <span {...R} id="mar-l2h">{b.marketType}</span>
                                </dt>
                                <dd {...R} id="pri-a35" className="col-1ie">
                                  {` ${b.oddsPrice} `}
                                  {Number(b.oddsRate) !== 0 && <span {...R}>{`/${b.oddsRate}`}</span>}
                                </dd>
                                <dd {...R} id="siz-lp2" title="$10" className="col-mlt">{` ${b.stake}`}</dd>
                                <dd {...R} id="pro-l8k" className="col-wcg"><span {...R}>{` ${b.betPl} `}</span></dd>
                              </dl>
                            ))}
                            <ul {...R} id="lay-zc9" className="matched-826 unity-ul-d78">
                              <li {...R} className="col-fpg">Lay (Bet Against)</li>
                              <li {...R} className="col-1ie">Odds</li>
                              <li {...R} className="col-mlt">Stake</li>
                              <li {...R} className="col-wcg">Liability</li>
                            </ul>
                            {bets.filter((b) => b.type !== 'B').map((b) => (
                              <dl key={b._id} {...R} id="txn-ley" className={`slip-y8o${showRef ? ' showRef' : ''}`}>
                                {refRow(b)}
                                <dt {...R}>
                                  <span {...R} className="slip-ys5">Lay</span>
                                  <span {...R} className="short-nbw">{b.selectionName}</span>
                                  <span {...R} id="mar-l2h">{b.marketType}</span>
                                </dt>
                                <dd {...R} id="pri-a35" className="col-1ie">
                                  {` ${b.oddsPrice} `}
                                  {Number(b.oddsRate) !== 0 && <span {...R}>{`/${b.oddsRate}`}</span>}
                                </dd>
                                <dd {...R} id="siz-lp2" title="$10" className="col-mlt">{` ${b.stake}`}</dd>
                                <dd {...R} id="pro-l8k" className="col-wcg"><span {...R}>{` ${decimal2(b.betPl)} `}</span></dd>
                              </dl>
                            ))}
                            <div {...R} className="btn-gad">
                              <ul {...R} className="option-g3c unity-ul-d78">
                                <li {...R}>
                                  <input {...R} id="ope-23t" name="openOption" type="checkbox" checked={showRef} onChange={(e) => setShowRef(e.target.checked)} />
                                  <label {...R} htmlFor="showBetInfo">Bet Info</label>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-right-nav>
  );
}
