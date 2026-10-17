import { useCallback, useRef, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { ng, host, KX } from '../ng';
import { subscribeSport, getSportSnapshot } from '../../hooks/sportDataStore';
import { mapGame } from '../../utils/betTableData';
import { matchTime } from '../dashboard/Dashboard';
import { RACING, racingModel } from '../racing';
import { useMultiMarkets } from '../multiMarket';

const C = ng('kmm');

// Every pinned sport's feed (racing pins carry the reference's 7 / 4339),
// one shared poll each, as one live list of snapshots.
function useFeeds(sids) {
  const key = sids.join(',');
  const subscribe = useCallback((cb) => {
    const offs = key ? key.split(',').map((sid) => subscribeSport(Number(sid), cb)) : [];
    return () => offs.forEach((off) => off());
  }, [key]);
  const last = useRef([]);
  return useSyncExternalStore(subscribe, () => {
    const next = sids.map((sid) => getSportSnapshot(sid));
    if (next.length !== last.current.length || next.some((s, i) => s !== last.current[i])) last.current = next;
    return last.current;
  });
}

// A pin → the reference's row model: name, in-play, time, chips, and the
// home / draw / away prices it shows as 1 / X / 2.
function rowFor(pin, feeds, sids) {
  const racing = RACING[pin.sportId];
  const sid = racing ? racing.sid : Number(pin.sportId);
  const data = feeds[sids.indexOf(sid)]?.data || [];
  if (racing) {
    const race = racingModel(data, sid).events.flatMap((e) => e.races).find((r) => String(r.id) === pin.eventid);
    return race && {
      id: race.id, name: race.name, inPlay: race.inPlay, href: race.route, time: '', icons: {},
      o1: {}, oX: {}, o2: {},
    };
  }
  const game = data.find((g) => String(g.gmid) === pin.eventid);
  if (!game) return null;
  const ev = mapGame(game, sid);
  const cell = (c) => ({ back: c.back.odds, lay: c.lay.odds });
  return {
    // The reference's pattern is "dd-MM-YYYYH:mm", with no space.
    id: ev.id, name: ev.teams, inPlay: ev.inplay, href: ev.href, game, time: matchTime(ev.date).replace(' ', ''), icons: ev.icons,
    o1: cell(ev.o1), oX: cell(ev.oX), o2: cell(ev.o2),
  };
}

/**
 * app-multimarket — the reference's /multimarket: the events pinned from the
 * boards (in pin order) with their 1 / X / 2 prices, or the "no followed
 * multi markets" notice when there are none.
 */
export default function MultiMarket() {
  const navigate = useNavigate();
  const pins = useMultiMarkets();
  const sids = [...new Set(pins.map((p) => (RACING[p.sportId] ? RACING[p.sportId].sid : Number(p.sportId))))];
  const feeds = useFeeds(sids);
  const rows = pins.map((p) => rowFor(p, feeds, sids)).filter(Boolean);

  return (
    <app-multimarket {...host('kmm')} {...KX}>
      {rows.length === 0 && (
        <div {...C} className="col-md-12 multimarket p-0">
          <div {...C} className="mian-wrap">
            <div {...C} id="noMultiMarkets" className="no-data">
              <h3 {...C}>There are currently no followed multi markets.</h3>
              <p {...C}>Please add some markets from events.</p>
            </div>
          </div>
        </div>
      )}
      {rows.length > 0 && (
        <div {...C} className="animated fadeIn">
          <div {...C} className="row">
            <div {...C} className="col-md-12 mb-3">
              <div {...C} className="inplay-head show-xs">
                <div {...C} className="row">
                  <div {...C} className="game-highlight-wrap w-100">
                    <h3 {...C}>Multi Markets</h3>
                  </div>
                </div>
              </div>
              <div {...C} className="game-menu-tab inplay-match">
                <div {...C} className="row">
                  <div {...C} className="col-md-12 mobile-width">
                    <div {...C} className="inplay-sportwise">
                      <table {...C} className="table table-hover multitable">
                        <thead {...C} className="hideDesktop">
                          <th {...C} colSpan={2} className="view-mobile" />
                          <th {...C} className="text-center">1</th>
                          <th {...C} className="text-center">X</th>
                          <th {...C} className="text-center">2</th>
                        </thead>
                        <tbody {...C} className="tbody-custom">
                          {rows.map((r) => {
                            const long = r.name.length > 30;
                            return (
                              <tr {...C} key={r.id}>
                                <td {...C} className="td-event-name">
                                  <a {...C} className={`match-name${long ? ' mobile-cutome-padding-manager' : ''}`}>
                                    <span {...C} onClick={() => navigate(r.href, r.game ? { state: { game: r.game } } : undefined)}>{r.name}</span>
                                  </a>
                                  {r.inPlay && <span {...C} className="in_play">In-Play</span>}
                                  <span {...C} className="in_play">{r.icons.tv && <i {...C} className="fa fa-television" />}</span>
                                  {!r.inPlay && (
                                    <p {...C} className={`match-time${long ? ' mobile-cutome-padding-date' : ''}`}> {r.time} </p>
                                  )}
                                </td>
                                <td {...C} className="fancy-and-sport-book-chips">
                                  {!r.icons.f && <span {...C} className="fancy-not-exist">&nbsp;</span>}
                                  {r.icons.f && <span {...C} className="game-fancy me-1">F</span>}
                                  {r.icons.f1 && <span {...C} className="game-sportbook">S</span>}
                                  {r.icons.bm && <span {...C} className="game-bookmakers">BM</span>}
                                </td>
                                <td {...C} className="count hideDesktop">
                                  <span {...C} className="back">{r.o1.back || '0'}</span>
                                  <span {...C} className="lay"> {r.o1.lay || '0'}</span>
                                </td>
                                <td {...C} className="count hideDesktop custom-width-center">
                                  <span {...C} className="back"> {r.oX.back || '0.0'}</span>
                                  <span {...C} className="lay">{r.oX.lay || '0.0'}</span>
                                </td>
                                <td {...C} className="count hideDesktop custom-width-end">
                                  <span {...C} className="back"> {r.o2.back || '0'}</span>
                                  <span {...C} className="lay">{r.o2.lay || '0'} </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </app-multimarket>
  );
}
