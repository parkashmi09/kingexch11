import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host } from '../../ng';
import KxModal from '../../KxModal';
import { money, useAccountActions } from '../../header/accountMenu';
import RulesList from './RulesList';

const C = ng('cxh');
const S = ng('csn');
const T = ng('crt');

// The casino site's default quick stakes (its stackButtonArry).
const STAKES = ['1000', '5000', '10000', '25000', '50000', '100000', '200000', '500000'];

// The header's own `number:'1.0-2'` balance ("0", "1,234.5"). The reference's
// table pages later rewrite it with toFixed(2) when they refresh the balance
// (on load, a bet, a new round), which is why some captures show "0.00".
const ptiText = (v) => (v == null || v === '' ? '' : Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 }));

// Angular's date pipe 'dd-MM-YYYY H:mm:ss'.
const pad = (n) => String(n).padStart(2, '0');
const betDate = (v) => {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${d.getHours()}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/**
 * #exposureModals — the casino site's exposure list. It lives in its app-root
 * (scope `crt`); the headers' exposure figure opens it. UI only: `list` is the
 * reference's userEventsExposure rows ({ sportName, eventName, marketName,
 * betCounts }); empty, it shows "No real-time records found".
 */
export function CasinoExposureModal({ open, onClose, list = [] }) {
  return (
    <KxModal open={open} onClose={onClose} id="exposureModals" labelledBy="exposureModalLabel" className="exposureModals" attrs={T}>
      <div {...T} className="modal-dialog modal-md">
        <div {...T} className="modal-content">
          <div {...T} className="modal-header exposure-details">
            <h1 {...T} id="exposureModalLabel" className="modal-title">Exposure Detail</h1>
            <button {...T} type="button" data-bs-dismiss="modal" aria-label="Close" className="close" onClick={onClose}>
              <span {...T} aria-hidden="true">×</span>
            </button>
          </div>
          <div {...T} className="modal-body">
            <table {...T} className="table table-hover table-bordered">
              <thead {...T}>
                <tr {...T} className="theme1font">
                  <th {...T} className="text-center">Sport Name</th>
                  <th {...T} className="text-center" style={{ width: '50%' }}>Event Name</th>
                  <th {...T} className="text-center">Market Name</th>
                  <th {...T} className="text-center">Trade</th>
                </tr>
              </thead>
              {list.length > 0 && (
                <tbody {...T}>
                  {list.map((e, i) => (
                    <tr key={i} {...T} className="exposur_record_row">
                      <td {...T} style={{ padding: '2px 0px' }}>{e.sportName}</td>
                      <td {...T}>
                        <a {...T} data-bs-dismiss="modal" className="text-link router-link-exact-active router-link-active" style={{ textDecoration: 'none' }} onClick={onClose}>
                          {e.eventName}
                        </a>
                      </td>
                      <td {...T} className="text-center marketclumn">{e.marketName}</td>
                      <td {...T} className="text-center">{e.betCounts}</td>
                    </tr>
                  ))}
                </tbody>
              )}
              {list.length === 0 && (
                <tfoot {...T}>
                  <tr {...T} className="exposurebody">
                    <td {...T} colSpan={4} className="text-center">No real-time records found</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </KxModal>
  );
}

/**
 * app-side-nav-bets — the full-screen "Open Bets" panel the phone header's
 * history button opens: a tab per event with exposure, and that event's
 * matched Back / Lay bets with a "Bet Info" switch for their reference + time.
 *
 * UI only: `events` is the reference's userEventsExposure list ({ eventName,
 * sportId, eventId }) and `loadBets(sportId, eventId)` should resolve to that
 * event's casinoMatchedBetList rows ({ _id, type 'B'|'L', selectionName,
 * marketType, oddsPrice, oddsRate, stake, betPl, updatedAt }).
 */
export function SideNavBets({ attrs, onClose, events = [], loadBets }) {
  const [activeSport, setActiveSport] = useState(null);
  const [eventId, setEventId] = useState('');
  const [bets, setBets] = useState([]);
  const [showRef, setShowRef] = useState(false);

  const onMarketChange = (sportId, evId, index) => {
    setActiveSport(index);
    setEventId(evId);
    if (sportId && evId && loadBets) Promise.resolve(loadBets(sportId, evId)).then((rows) => setBets(rows || []));
  };

  const lottery = eventId === '99.0058' ? ' lotterySelectionOverflow' : '';
  const refRow = (b) => (
    <dd {...S} id="bet-yq1" className="ref-epq">
      <span {...S} id="bet-bjr">{`Ref: ${b._id}`}</span>
      <span {...S} id="pla-fpm">{betDate(b.updatedAt)}</span>
    </dd>
  );
  const head = (id, first, last) => (
    <ul {...S} id={id} className="matched-826 unity-ul-d78">
      <li {...S} className="col-fpg">{first}</li>
      <li {...S} className="col-1ie">Odds</li>
      <li {...S} className="col-mlt">Stake</li>
      <li {...S} className="col-wcg">{last}</li>
    </ul>
  );

  return (
    <app-side-nav-bets {...attrs} {...host('csn')}>
      <div {...S} className="left-bar-container">
        <div {...S} className="left-bar">
          <div {...S} data-simplebar="" className="h-100">
            <div {...S} className="tab-content pt-0">
              <div {...S} id="up-tab" role="tabpanel" className="tab-pane active">
                <div {...S} className="user-menus" style={{ background: '#fff' }}>
                  <div {...S} className="openBetHeader">
                    <strong {...S}>Open Bets</strong>
                    <button {...S} type="button" className="close show-xs cls-openbet">
                      <span {...S} aria-hidden="true" onClick={onClose}>×</span>
                    </button>
                  </div>
                  <div {...S} className="outer-mobile-menu-con">
                    <div {...S} className="mobile-menu-con">
                      {events.map((e, i) => (
                        <div key={i} {...S} className="mobile-menu-single-betslip">
                          <a
                            {...S}
                            _ngcontent-und-c0=""
                            className={`nav-link nav-dropdown-toggl unitycss-46Nkf${activeSport === i ? ' activesport' : ''}`}
                            onClick={() => onMarketChange(e.sportId, e.eventId, i)}
                          >
                            <span {...S} _ngcontent-und-c0="" className="bet-marketname">{` ${e.eventName} `}</span>
                          </a>
                        </div>
                      ))}
                    </div>
                    {bets.length > 0 && (
                      <nav {...S} className="all-sports-list">
                        <div {...S} className="content-534">
                          <div {...S} className="act-16a tab-ltq">
                            <div {...S} id="dplql" name="txn" className="list-5fh">
                              <ul {...S} className="matched-nav">
                                <li {...S} className="nav-item-match text-center">
                                  <a {...S} className="match-nav-link active fw-bold">
                                    <span {...S}>Matched</span>
                                  </a>
                                </li>
                              </ul>
                              {head('bac-xxb', 'Back (Bet For)', 'Profit')}
                              {bets.map((b, i) => b.type === 'B' && (
                                <dl key={i} {...S} id="txn-ley" className={`slip-3ga${showRef ? ' showRef' : ''}`}>
                                  {showRef && refRow(b)}
                                  <dt {...S}>
                                    <span {...S} className="slip-ys5">Back</span>
                                    <span {...S} className={`short-nbw${lottery}`}>{b.selectionName}</span>
                                    <span {...S} id="mar-l2h">{b.marketType}</span>
                                  </dt>
                                  <dd {...S} id="pri-a35" className="col-1ie">
                                    {` ${b.oddsPrice} `}
                                    {b.oddsRate != 0 && <span {...S}>{`/${b.oddsRate}`}</span>}
                                  </dd>
                                  <dd {...S} id="siz-lp2" title="$10" className="col-mlt">{` ${b.stake}`}</dd>
                                  <dd {...S} id="pro-l8k" className="col-wcg">
                                    <span {...S}>{` ${money(b.betPl)} `}</span>
                                  </dd>
                                </dl>
                              ))}
                              {head('lay-zc9', 'Lay (Bet Against)', 'Liability')}
                              {bets.map((b, i) => b.type !== 'B' && (
                                <dl key={i} {...S} id="txn-ley" className={`slip-y8o${showRef ? ' showRef' : ''}`}>
                                  {showRef && refRow(b)}
                                  <dt {...S}>
                                    <span {...S} className="slip-ys5">Lay</span>
                                    <span {...S} className={`short-nbw${lottery}`}>{b.selectionName}</span>
                                    <span {...S} id="mar-l2h">{b.marketType}</span>
                                  </dt>
                                  <dd {...S} id="pri-a35" className="col-1ie">
                                    {` ${b.oddsPrice} `}
                                    {b.oddsRate != 0 && <span {...S}>{`/${b.oddsRate}`}</span>}
                                  </dd>
                                  <dd {...S} id="siz-lp2" title="$10" className="col-mlt">{` ${b.stake}`}</dd>
                                  <dd {...S} id="pro-l8k" className="col-wcg">
                                    <span {...S}>{` ${b.betPl} `}</span>
                                  </dd>
                                </dl>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div {...S} className="btn-gad">
                          <ul {...S} className="option-g3c unity-ul-d78">
                            <li {...S}>
                              <input {...S} id="ope-23t" name="openOption" type="checkbox" onClick={(e) => setShowRef(e.target.checked)} />
                              <label {...S} htmlFor="showBetInfo">Bet Info</label>
                            </li>
                          </ul>
                        </div>
                      </nav>
                    )}
                  </div>
                  {/* The reference's own matched lists here are never filled (typeBet / typeLay stay ''). */}
                  <div {...S} className="scrollSlip">
                    <div {...S} id="txnList" name="txn" className="slip-list"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-side-nav-bets>
  );
}

const RefreshSvg = (
  <svg {...C} width="20" height="20" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <defs {...C}>
      <path {...C} fill="currentColor" d="M0 4.004A3.997 3.997 0 0 1 3.998 0h27.004A3.999 3.999 0 0 1 35 4.004v23.992A3.997 3.997 0 0 1 31.002 32H3.998A3.999 3.999 0 0 1 0 27.996V4.004z" id="b" />
      <filter {...C} x="-2.9%" y="-3.1%" width="105.7%" height="106.3%" filterUnits="objectBoundingBox" id="a">
        <feOffset {...C} dy="2" in="SourceAlpha" result="shadowOffsetInner1" />
        <feComposite {...C} in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1" />
        <feColorMatrix {...C} values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0" in="shadowInnerInner1" />
      </filter>
    </defs>
    <g {...C} fill="none" fillRule="evenodd">
      <g {...C} transform="translate(-7 -6)">
        <use {...C} fill="#000" filter="url(#a)" xlinkHref="#b" />
        <path {...C} stroke="#BC8C17" d="M.5 4.004v23.992A3.499 3.499 0 0 0 3.998 31.5h27.004a3.497 3.497 0 0 0 3.498-3.504V4.004A3.499 3.499 0 0 0 31.002.5H3.998A3.497 3.497 0 0 0 .5 4.004z" strokeLinejoin="square" />
      </g>
      <path {...C} d="M10 4.029c1.635 0 3.144.36 4.527 1.079 1.365.703 2.443 1.655 3.233 2.854.827 1.247 1.24 2.59 1.24 4.028 0 1.44-.413 2.782-1.24 4.03-.79 1.214-1.868 2.173-3.233 2.877A9.596 9.596 0 0 1 10 20a9.596 9.596 0 0 1-4.527-1.103c-1.365-.704-2.443-1.663-3.233-2.878C1.413 14.772 1 13.43 1 11.99h2.263c0 1.088.301 2.09.903 3.01.602.92 1.42 1.647 2.452 2.182 1.033.536 2.16.804 3.382.804s2.349-.268 3.382-.804c1.033-.535 1.85-1.263 2.452-2.182.602-.92.903-1.922.903-3.01 0-1.087-.301-2.09-.903-3.01-.602-.918-1.42-1.646-2.452-2.181-1.033-.536-2.16-.804-3.382-.804v4.029L4.368 5.012 10 0v4.029z" fill="currentColor" />
    </g>
  </svg>
);

// The desktop-only My Account dropdown (hidden-xs; its stylesheet hides it on
// phones), in the casino site's order.
const MY_ACCOUNT = [
  ['#/myprofile', 'My Profile'],
  ['#/refer-and-earn', 'Refer & Earn'],
  ['#/rolling-commission', 'Rolling Commission'],
  ['#/banking', 'Banking'],
  ['#/account-statement', 'Account Statement'],
  ['#/bet-history', 'Bets History'],
  ['#/profit-loss', 'Profit & Loss'],
  ['#/password-history', 'Password History'],
  ['#/activity-log', 'Activity Log'],
];

/**
 * app-t20-exchange-header — the casino site's header on phones: Rules (the
 * full-screen rules list), GAMING LOBBY (back to the exchange's live casino),
 * the balance / exposure (which opens the exposure list), refresh, and the
 * history button (the Open Bets panel). The reference's route-param eventId is
 * never set on its game pages, so Rules shows instead of its Bets button.
 * Its desktop-only parts (logo, search, My Account) and its never-opened
 * Exposure / Stake modals are kept as the reference renders them.
 */
export default function T20Header({ attrs }) {
  const navigate = useNavigate();
  const { balance, exposure, balanceLoading } = useSelector((s) => s.user);
  const { reloadBalance, logoutUser } = useAccountActions();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [betsOpen, setBetsOpen] = useState(false);
  const [exposureOpen, setExposureOpen] = useState(false);

  return (
    <app-t20-exchange-header {...attrs} {...host('cxh')} className="hideMobileHeader">
      {rulesOpen && <RulesList attrs={C} onClose={() => setRulesOpen(false)} />}
      {betsOpen && <SideNavBets attrs={C} onClose={() => setBetsOpen(false)} />}
      <div {...C} className="navbar navbar-expand navbar-light navBar">
        <div {...C} className="container-fluid justify-content-between">
          <div {...C} className="d-flex align-items-center">
            <a {...C} href="/" className="navbar-brand hidden-xs">
              <img {...C} alt="" src="/kingexch/casino-site/assets/t20/mainlogo.png" className="main-logo img-fluid" />
            </a>
            <form {...C} noValidate className="d-flex align-items-center hidden-xs" onSubmit={(e) => e.preventDefault()}>
              <input {...C} id="search" type="search" placeholder="Search" aria-label="Search" className="form-control me-2" />
            </form>
            <a {...C} className="navbar-brand hidden-lg" onClick={() => setRulesOpen(true)}>
              <span {...C} className="open_bets"> Rules </span>
            </a>
            <a
              {...C}
              routerlink="/home"
              className="gameLobby"
              href="/livecasino"
              onClick={(e) => { e.preventDefault(); navigate('/livecasino'); }}
            >
              {' Gaming Lobby '}
            </a>
          </div>
          <div {...C} id="navbarSupportedContent">
            <ul {...C} className="navbar-nav d-flex flex-row align-items-center">
              <li {...C} className="nav-item">
                {balanceLoading ? (
                  <div {...C} className="loadingBalance">
                    {Array.from({ length: 7 }, (_, i) => <span key={i} {...C}></span>)}
                  </div>
                ) : (
                  <div {...C} className="user-blnc">
                    <span {...C}>
                      {' Main '}
                      <strong {...C}>
                        {'PTI '}
                        <span {...C} className="userTotalBalance">{ptiText(balance)}</span>
                      </strong>
                    </span>
                    <span {...C} className="exp-topcount">
                      {' Exp '}
                      <a {...C} className="text-white">
                        <strong {...C}>
                          {' ('}
                          <span {...C} className="exp-red">
                            <a {...C} data-bs-toggle="modal" data-bs-target="#exposureModals" className="userTotalExposure" onClick={() => setExposureOpen(true)}>
                              {money(exposure)}
                            </a>
                          </span>
                          {') '}
                        </strong>
                      </a>
                    </span>
                  </div>
                )}
              </li>
              <li {...C} className="nav-item">
                <span {...C} className="head-refresh">
                  <a {...C} id="menuRefresh" className="a-setting a-referesh" style={{ cursor: 'pointer' }} onClick={reloadBalance}>
                    {RefreshSvg}
                  </a>
                </span>
              </li>
              <li {...C} className="nav-item hidden-lg">
                <div {...C} className="bet-setting ml-2">
                  <a {...C} className="a-setting a-referesh" onClick={() => setBetsOpen((v) => !v)}>
                    <i {...C} className="fas fa-history historyIcon"></i>
                  </a>
                </div>
              </li>
              <li {...C} className="nav-item account-wrap-new hidden-xs">
                <div {...C} className="dropdown">
                  <a {...C} href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false" className="btn dropdown-toggle myaccnt" style={{ cursor: 'pointer' }} onClick={(e) => e.preventDefault()}>
                    {' My Account '}
                  </a>
                  <div {...C} aria-labelledby="dropdownMenuLink" className="dropdown-menu dropdown-menu-right" style={{ inset: '30px 10px auto auto', transform: 'translateY(0px)' }}>
                    <div {...C} className="dropdown-header text-left">
                      <strong {...C}>exchange</strong>
                    </div>
                    {MY_ACCOUNT.map(([href, label]) => (
                      <a key={href} {...C} href={href} className="dropdown-item">{` ${label} `}</a>
                    ))}
                    <a {...C} className="dropdown-item drp-logout">
                      <button {...C} className="btn btn-primary logout-btn" onClick={logoutUser}>
                        {' LOGOUT'}
                        <i {...C} aria-hidden="true" className="fa fa-sign-out ml-2"></i>
                      </button>
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div {...C} id="ExpoModal1" tabIndex={-1} aria-labelledby="ExpoModal" aria-hidden="true" className="modal fade">
        <div {...C} className="modal-dialog">
          <div {...C} className="modal-content">
            <div {...C} className="modal-header">
              <h5 {...C} id="exampleModalLabel" className="modal-title">Exposure Detail</h5>
              <button {...C} type="button" data-bs-dismiss="modal" aria-label="Close" className="close">
                <span {...C} aria-hidden="true">×</span>
              </button>
            </div>
            <div {...C} className="modal-body">
              <div {...C} className="col-md-12 book-popup">
                <table {...C} className="book-tbl">
                  <thead {...C} className="bg-default">
                    <tr {...C}>
                      <th {...C}>Sport Name</th>
                      <th {...C}>Event Name</th>
                      <th {...C}>Market Name</th>
                      <th {...C}>Trade</th>
                    </tr>
                  </thead>
                  <tbody {...C}></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div {...C} id="stackbetsModal" aria-labelledby="stackbetsModal" aria-hidden="true" className="modal fade">
        <div {...C} className="modal-dialog">
          <div {...C} className="modal-content">
            <div {...C} className="modal-header">
              <h3 {...C} className="mb-0 bold" style={{ fontWeight: 'bold', fontSize: '18px' }}>Stake</h3>
              <button {...C} type="button" data-bs-dismiss="modal" aria-label="Close" className="close">
                <span {...C} aria-hidden="true">×</span>
              </button>
            </div>
            <div {...C} className="stack-modal-body">
              <div {...C} className="card-body container-fluid container-fluid-5 button-value quick-stake-container">
                <div {...C} className="row row5 mb-1 desktop-pl">
                  <div {...C} className="col-3">
                    <div {...C} className="button-title" style={{ fontSize: '14px', marginLeft: '-2px', width: '125px' }}>
                      <span {...C}>
                        <b {...C} className="stake-amount">Quick Stakes</b>
                      </span>
                    </div>
                  </div>
                </div>
                <div {...C} className="row row5 mb-1 col-md-12 desktop-pl quick-stake-boxes">
                  {STAKES.map((v, i) => (
                    <div key={i} {...C} className="col-4 col-sm-3 col-md-3 mt-2 quick-box-con">
                      <div {...C} className="form-group mb-0 quick-stake-box">
                        <input {...C} type="text" min="1" max="99999999" maxLength={9} className="form-control" id={`stackforbet${i}`} defaultValue={v} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div {...C} className="modal-footer">
                <button
                  {...C}
                  data-bs-dismiss="modal"
                  className="updatebtn"
                  style={{ background: 'linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)', color: '#fff', padding: '0 8px', fontSize: '13px', fontWeight: 600 }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CasinoExposureModal open={exposureOpen} onClose={() => setExposureOpen(false)} />
    </app-t20-exchange-header>
  );
}
