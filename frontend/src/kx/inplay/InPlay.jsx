import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ng, host, KX } from '../ng';
import { openAgeModal } from '../ageModal';
import useSportData from '../../hooks/useSportData';
import OldCasino from '../dashboard/OldCasino';
import { raceRoute } from '../racing';

const C = ng('kip');

// The reference's sports, in its order (its feed is keyed by sport id).
const SPORTS = [
  { sid: 1, name: 'Soccer' },
  { sid: 2, name: 'Tennis' },
  { sid: 4, name: 'Cricket' },
  { sid: 10, name: 'Horse Racing', racing: true },
  { sid: 65, name: 'Greyhound Racing', racing: true },
];

const TABS = [['inPlay', 'In-Play'], ['today', 'Today'], ['tomorrow', 'Tomorrow']];

// "10/14/2026 4:35:00 PM" — the exchange's clock, read as local time.
function startDate(stime) {
  const m = String(stime || '').match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
  if (!m) return null;
  const h = (+m[4] % 12) + (/pm/i.test(m[7] || '') ? 12 : 0);
  return new Date(+m[3], +m[1] - 1, +m[2], m[7] ? h : +m[4], +m[5], +(m[6] || 0));
}

const pad = (n) => String(n).padStart(2, '0');
// DatePipe "MM-dd-YYYY H:mm".
const eventTime = (d) => (d ? `${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${d.getFullYear()} ${d.getHours()}:${pad(d.getMinutes())}` : '');

// A runner's best price, or the reference's placeholder: "0" for a runner
// without one, "0.0" for a draw the match doesn't have.
function price(game, sno, side, missing) {
  const odds = game.section?.find((s) => s.sno === sno)?.odds;
  if (!odds) return missing;
  const cell = odds.find((o) => o.otype === side) ?? odds[side === 'back' ? 0 : 1];
  return cell ? String(cell.odds) : '0';
}

// Our feed → the reference's event rows. Racing arrives country → meeting →
// races; the reference lists every race under its meeting's name, with no
// prices (its racing runners carry none).
function toEvents(sport, data) {
  if (sport.racing) {
    return data.flatMap((country) => (country.children || []).flatMap((venue) => (venue.children || []).map((r) => ({
      id: r.gmid, name: venue.ename, inPlay: !!r.iplay, start: startDate(r.stime), route: raceRoute(sport.sid, r.gmid), odds: ['0', '0', '0', '0', '0', '0'],
    }))));
  }
  return data.map((g) => ({
    id: g.gmid,
    name: g.ename,
    inPlay: !!g.iplay,
    start: startDate(g.stime),
    route: `/gamedetails/${sport.sid}/${g.gmid}`,
    game: g,
    fancy: !!g.f,
    sportsbook: !!g.f1,
    bookmakers: !!g.bm,
    streaming: !!g.tv,
    // 1 is the home runner, X the draw, 2 the away (this feed's sno 1, 2, 3).
    odds: [price(g, 1, 'back', '0'), price(g, 1, 'lay', '0'), price(g, 2, 'back', '0.0'), price(g, 2, 'lay', '0.0'), price(g, 3, 'back', '0'), price(g, 3, 'lay', '0')],
  }));
}

function useSport(sport) {
  const { data } = useSportData(sport.sid);
  return toEvents(sport, data).sort((a, b) => (a.start?.getTime() ?? Infinity) - (b.start?.getTime() ?? Infinity));
}

/**
 * app-inplay — the reference's /inplay: In-Play / Today / Tomorrow, each a
 * table per sport (sports with nothing to show are left out), then the casino
 * block.
 */
export default function InPlay() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('inPlay');
  const all = [
    [SPORTS[0], useSport(SPORTS[0])],
    [SPORTS[1], useSport(SPORTS[1])],
    [SPORTS[2], useSport(SPORTS[2])],
    [SPORTS[3], useSport(SPORTS[3])],
    [SPORTS[4], useSport(SPORTS[4])],
  ];

  const now = new Date();
  const day = (offset) => [new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset), new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset + 1)];
  const keep = (e) => {
    if (tab === 'inPlay') return e.inPlay;
    const [from, to] = day(tab === 'today' ? 0 : 1);
    return e.start && e.start >= from && e.start < to;
  };
  const groups = all.map(([s, events]) => [s, events.filter(keep)]).filter(([, events]) => events.length);

  return (
    <app-inplay {...host('kip')} {...KX}>
      <div {...C} className="row tabmenu">
        <ul {...C} id="inPlayTab" className="tab col3">
          {TABS.map(([id, label]) => (
            <li {...C} key={id}>
              <a {...C} className={tab === id ? 'select' : undefined} onClick={() => setTab(id)}>{label}</a>
            </li>
          ))}
        </ul>
      </div>
      <div {...C} className="game-menu-tab inplay-match">
        {groups.map(([sport, events]) => (
          <div {...C} key={sport.sid} className="inplay-sportwise">
            <div {...C} className="sporthead sporthead2">
              <h3 {...C}>{sport.name} </h3>
            </div>
            <table {...C} className="table table-hover inplaytbl2">
              {/* The reference's header cells sit straight in <thead>, no row. */}
              <thead {...C} className="hideDesktop">
                <th {...C} colSpan={2} className="view-mobile" />
                <th {...C} className="text-center">1</th>
                <th {...C} className="text-center">X</th>
                <th {...C} className="text-center">2</th>
              </thead>
              <tbody {...C}>
                {events.map((e) => (
                  <tr {...C} key={e.id}>
                    <td {...C} style={{ cursor: 'pointer' }}>
                      <a {...C} className="match-name">
                        <span {...C} onClick={() => navigate(e.route, e.game ? { state: { game: e.game } } : undefined)}>{e.name}</span>
                      </a>
                      {e.inPlay && <span {...C} className="in_play">In-Play</span>}
                      {e.streaming && <span {...C} className="in_play"><i {...C} className="fa fa-television" /></span>}
                      {!e.inPlay && <p {...C} className="match-time">{eventTime(e.start)}</p>}
                    </td>
                    <td {...C} className="text-start">
                      {e.fancy && <span {...C} className="game-fancy me-1">F</span>}
                      {e.sportsbook && <span {...C} className="game-sportbook me-1">S</span>}
                      {e.bookmakers && <span {...C} className="game-bookmakers">BM</span>}
                    </td>
                    {[0, 2, 4].map((i) => (
                      <td {...C} key={i} className="count hideDesktop">
                        <span {...C} className="back">{e.odds[i]}</span>
                        <span {...C} className="lay">{e.odds[i + 1]}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {!groups.length && (
          <div {...C} className="row">
            <div {...C} className="col-md-12 mobile-width">
              <div {...C} className="inplay-sportwise no-data-sportwise">
                <table {...C} className="table table-hover">
                  <tbody {...C}>
                    <tr {...C}>
                      <td {...C} colSpan={5} className="text-center">There are no events to be displayed.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <div {...C} className="casino-inplay-data">
          <OldCasino C={C} onLocked={openAgeModal} />
        </div>
      </div>
    </app-inplay>
  );
}
