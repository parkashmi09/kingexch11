import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { kx } from '../assets';
import { openAgeModal } from '../ageModal';
import { useExchange, setExchange, useHomeResets, isDesktop } from '../exchange';
import useSportData from '../../hooks/useSportData';
import { mapGame } from '../../utils/betTableData';
import OwlCarousel from './OwlCarousel';
import OldCasino from './OldCasino';
import { gotoAviator } from '../casino/launch';
import HorseRacing from '../racing/HorseRacing';
import Lottery from '../lottery/Lottery';
import TipsAndPreviews from '../tips/TipsAndPreviews';
import useListedSports from '../listedSports';
import FooterDesktop from './FooterDesktop';
import SearchModal from './SearchModal';
import { SPORT_ICONS, PinIcon, SearchIcon } from './icons';
import { useMultiMarketPin } from '../multiMarket';

const C = ng('kd');

// The phone strip under the slider, in the reference's order. A sport with a
// `sid` switches the highlights below; racing and Lottery (`racing`, the
// reference's sport id) put their own board there; an `exch` switches the
// whole board.
const STRIP = [
  { name: 'Cricket', sid: 4, etid: 4 },
  { name: 'Tennis', sid: 2, etid: 2 },
  { name: 'Soccer', sid: 1, etid: 1 },
  { name: 'Horse Racing', racing: '7', etid: 10 },
  { name: 'Greyhound Racing', racing: '4339', etid: 65 },
  { name: 'Lottery', racing: '66104' },
  { name: 'Live Casino', exch: '16' },
  { name: 'Tips & Previews', exch: '98' },
];

const TABS = [{ name: 'Cricket', sid: 4 }, { name: 'Soccer', sid: 1 }, { name: 'Tennis', sid: 2 }];

// "10/13/2026 04:41:00 PM" → "13-10-2026 16:41", the reference's dd-MM-YYYY H:mm.
export function matchTime(stime) {
  const m = String(stime || '').match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)(?::\d+)?\s*(AM|PM)?/i);
  if (!m) return stime || '';
  const h = (+m[4] % 12) + (/pm/i.test(m[6] || '') ? 12 : 0);
  return `${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}-${m[3]} ${m[6] ? h : +m[4]}:${m[5]}`;
}

function EventRow({ ev, onOpen, pinned, onPin }) {
  const long = ev.teams.length > 30;
  const price = (cell, empty) => cell.odds || empty;
  return (
    <tr {...C}>
      <td {...C} className="td-event-name" onClick={onOpen}>
        <a {...C} className={`match-name${long ? ' mobile-cutome-padding-manager' : ''}`}>
          <span {...C}>{ev.teams}</span>
        </a>
        {ev.inplay && <span {...C} className="in_play">In-Play</span>}
        {!ev.inplay && (
          <p {...C} className={`match-time${long ? ' mobile-cutome-padding-date' : ''}`}> {matchTime(ev.date)} </p>
        )}
      </td>
      <td {...C} className="fancy-and-sport-book-chips">
        {!ev.icons.f && <span {...C} className="fancy-not-exist">&nbsp;</span>}
        {ev.icons.bm && <span {...C} className="game-bookmakers me-lg-1">BM</span>}
        {ev.icons.f && <span {...C} className="game-fancy me-1">F</span>}
        {ev.icons.f1 && <span {...C} className="game-sportbook">S</span>}
      </td>
      <td {...C} className="count hideDesktop">
        <span {...C} className="back">{price(ev.o1.back, '0')}</span>
        <span {...C} className="lay"> {price(ev.o1.lay, '0')}</span>
      </td>
      <td {...C} className="count hideDesktop custom-width-center">
        <span {...C} className="back"> {price(ev.oX.back, '0.0')}</span>
        <span {...C} className="lay">{price(ev.oX.lay, '0.0')}</span>
      </td>
      <td {...C} className="count hideDesktop custom-width-end">
        <span {...C} className="back"> {price(ev.o2.back, '0')}</span>
        <span {...C} className="lay">{price(ev.o2.lay, '0')} </span>
      </td>
      <td {...C} style={{ width: 25 }}>
        <a {...C} id="multiMarketPin" title="Add to Multi Markets" style={{ cursor: 'pointer' }} className={`add-pin ${ev.id}${pinned ? ' pin-on' : ''}`} onClick={onPin}>
          <PinIcon C={C} />
        </a>
      </td>
    </tr>
  );
}

/**
 * app-dashboard — the home page body: banner slider, the phone sports strip,
 * the Cricket / Soccer / Tennis highlights with match odds, the casino block
 * and the footer. Match data is this app's sport feed; a row opens the match.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [sid, setSid] = useState(4);
  const [racing, setRacing] = useState(null);
  const pickSport = (id) => { setSid(id); setRacing(null); };
  const [searchOpen, setSearchOpen] = useState(false);
  const { data, loading } = useSportData(sid);
  const events = data.map((g) => mapGame(g, sid));

  const exchange = useExchange();
  const strip = useListedSports(STRIP);
  const sportCount = strip.filter((item) => !item.exch).length;
  const homeResets = useHomeResets();
  const [seenResets, setSeenResets] = useState(homeResets);
  if (homeResets !== seenResets) { setSeenResets(homeResets); pickSport(4); }
  const board = exchange === '11';
  const pick = (item) => {
    if (item.sid) { pickSport(item.sid); setExchange('11'); }
    else if (item.racing) { setRacing(item.racing); setExchange('11'); }
    else if (item.exch) setExchange(item.exch);
  };
  const pins = useMultiMarketPin();

  return (
    <app-dashboard {...host('kd')} {...KX}>
      <div {...C}>
        {board && (
          <div {...C}>
            <OwlCarousel C={C} slides={[kx('banners/slider-default.jpg')]} />
          </div>
        )}
        <div {...C} className={`mobile-men${isDesktop ? '' : ' onlyForMobile'}`}>
          <div {...C} className={board ? 'show-this' : undefined}>
            <a {...C} type="button" className="a-search" onClick={() => setSearchOpen(true)}>
              <SearchIcon C={C} />
            </a>
            <ul {...C} id="menuListId" className="menu-list">
              <li {...C} id="exchBar10122022" className="menu-item aviator" onClick={() => gotoAviator(isAuth, navigate)}>
                <div {...C} className="exch heartBeat">
                  <img {...C} src={kx('assets/casinoslpot/aviator.png')} className="aviatorImg" alt="" />
                  <span {...C} className="menutext orange-nav-ic-txt"> Vimaan </span>
                </div>
              </li>
              {strip.map((item, i) => (
                <li
                  {...C}
                  key={item.name}
                  id={item.exch ? `exchBar${i - sportCount + 2}` : `sportsBar${i}`}
                  className={`menu-item${((racing ? item.racing === racing : item.sid === sid) && (isDesktop || board)) || (!isDesktop && item.exch === exchange) ? ' active' : ''}`}
                  onClick={() => pick(item)}
                >
                  <div {...C} className={item.exch ? 'exch' : item.name === 'Tennis' ? 'TennisClass' : undefined}>
                    {SPORT_ICONS[item.name](C)}
                    <span {...C} className="menutext orange-nav-ic-txt"> {item.name} </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {board ? (
          <div {...C} className="col-md-12 mobile-display-view">
            <div {...C} className="game-highlight-wrap">
              <h3 {...C} className="hideDesktop">Highlights</h3>
              <div {...C} className="game-menu-tab homeevent tab-container">
                <ul {...C} className="nav nav-tabs hideDesktop">
                  {TABS.map((t) => (
                    <li {...C} key={t.sid} className="nav-item">
                      <a {...C} id="" className={`nav-link${!racing && t.sid === sid ? ' active' : ''}`} onClick={() => pickSport(t.sid)}>
                        <span {...C}>{t.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                {racing ? (
                  <div {...C}>
                    {racing === '66104' ? <Lottery C={C} /> : <HorseRacing C={C} sportId={racing} />}
                  </div>
                ) : (
                  <div {...C} className="tab-content">
                    <div {...C} heading={TABS.find((t) => t.sid === sid).name} className="active tab-pane">
                      <div {...C} className="row">
                        <div {...C} className="col-md-12 mobile-width scrollHeight">
                          <table {...C} className="table table-hover dashboard-custom-table" style={{ borderBottom: '1px solid #c8ced3' }}>
                            <thead {...C} className="hideDesktop">
                              <tr>
                                <th {...C} colSpan={2} className="view-mobile" />
                                {['1', 'X', '2'].map((h) => (
                                  <th {...C} key={h} className="text-center"><span {...C}>{h}</span></th>
                                ))}
                                <th {...C} className="text-center" />
                              </tr>
                            </thead>
                            {events.length ? (
                              <tbody {...C} className="tbody-custom">
                                {events.map((ev) => (
                                  <EventRow key={ev.id} ev={ev} onOpen={() => navigate(ev.href, { state: { game: ev._raw } })} pinned={pins.on(ev.id)} onPin={() => pins.toggle(ev.id, sid)} />
                                ))}
                              </tbody>
                            ) : !loading && (
                              <tbody {...C}>
                                <tr {...C} className="btm-light-table-row">
                                  <td {...C} colSpan={10} className="text-center"> There are no events to be displayed.</td>
                                </tr>
                              </tbody>
                            )}
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div {...C} className="inplay-match">
              <div {...C} className="row">
                <div {...C} className="col-md-12 mobile-width">
                  <div {...C} className="inplay-sportwise">
                    <OldCasino C={C} onLocked={openAgeModal} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : exchange === '98' ? (
          <div {...C}>
            <TipsAndPreviews C={C} />
          </div>
        ) : (
          <div {...C}>
            <OldCasino C={C} onLocked={openAgeModal} />
          </div>
        )}
      </div>
      <div {...C} className="d-none" />
      <FooterDesktop C={C} />
      <SearchModal C={C} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </app-dashboard>
  );
}
