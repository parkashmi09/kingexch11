import { useNavigate, useParams } from 'react-router-dom';
import { ng, host, KX } from '../ng';
import { kx } from '../assets';
import useSportData from '../../hooks/useSportData';
import OwlCarousel from '../dashboard/OwlCarousel';
import FooterDesktop from '../dashboard/FooterDesktop';
import { matchTime } from '../dashboard/Dashboard';
import { PinIcon } from '../dashboard/icons';
import { useMultiMarketPin } from '../multiMarket';
import { RACING } from '../racing';
import HorseRacing from '../racing/HorseRacing';
import Lottery from '../lottery/Lottery';

const C = ng('kmk');

// "10/14/2026 01:10:00 PM" → epoch ms, for the reference's sort by start time.
function startsAt(stime) {
  const m = String(stime || '').match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
  if (!m) return Infinity;
  const h = (+m[4] % 12) + (/pm/i.test(m[7] || '') ? 12 : 0);
  return new Date(+m[3], +m[1] - 1, +m[2], m[7] ? h : +m[4], +m[5], +(m[6] || 0)).getTime();
}

// The reference's runners are home, away, draw; this feed numbers its
// sections 1 = home, 3 = away, 2 = draw. A runner the match doesn't have
// shows "0.0"; one without a price shows the feed's 0.
function price(game, sno, side) {
  const odds = game.section?.find((s) => s.sno === sno)?.odds;
  const cell = odds?.find((o) => o.otype === side) ?? odds?.[side === 'back' ? 0 : 1];
  return cell ? String(cell.odds) : '0.0';
}

/**
 * app-markets — the reference's /allsport-highlight/:sportId page, opened from
 * the sports in the left rail and the header bar: the banner slider, then
 * that sport's matches under "Highlights" (sorted by start time) with their
 * 1 / X / 2 prices, then the desktop footer.
 */
export default function Markets() {
  const navigate = useNavigate();
  const { sportId } = useParams();
  // Racing (the reference's 7 / 4339) shows its schedule instead of the table.
  const racing = RACING[sportId];
  // Lottery (66104) shows its markets in place of the highlights.
  const lottery = sportId === '66104';
  const sid = racing ? racing.sid : Number(sportId);
  // The hook can't be skipped; on Lottery it only reads cricket's shared cache.
  const { data, loading } = useSportData(lottery ? 4 : sid, 0, { poll: !lottery });
  const events = [...data].sort((a, b) => startsAt(a.stime) - startsAt(b.stime));

  const open = (g) => navigate(`/gamedetails/${sid}/${g.gmid}`, { state: { game: g } });
  const pins = useMultiMarketPin();

  return (
    <app-markets {...host('kmk')} {...KX}>
      {!racing && (
        <div {...C}>
          <OwlCarousel C={C} slides={[kx('banners/slider-default.jpg')]} />
        </div>
      )}
      {!lottery && <div {...C} className="col-md-12 mobile-display-view">
        <div {...C} className="game-highlight-wrap">
          {!racing && <h3 {...C}>Highlights</h3>}
          <div {...C} className="game-menu-tab homeevent tab-container">
            {racing ? (
              <div {...C}>
                <HorseRacing C={C} sportId={sportId} />
              </div>
            ) : (
              <div {...C} className="tab-content">
                <div {...C} heading="Cricket" className="active tab-pane">
                  <div {...C} className="row">
                    <div {...C} className="col-md-12 mobile-width scrollHeight">
                      <table {...C} className="table table-hover">
                        {/* The reference's header cells sit straight in <thead>, no row —
                            which is what sizes its columns the way they are. */}
                        <thead {...C} className="hideDesktop">
                          <th {...C} colSpan={2} className="view-mobile" />
                          <th {...C} className="text-center">1</th>
                          <th {...C} className="text-center">X</th>
                          <th {...C} className="text-center">2</th>
                          <th {...C} className="text-center" />
                        </thead>
                        <tbody {...C}>
                          {events.map((g) => (
                            <tr {...C} key={g.gmid}>
                              <td {...C} className="tdeventName" onClick={() => open(g)}>
                                <a {...C} className="match-name"><span {...C}>{g.ename}</span></a>
                                {g.iplay && <span {...C} className="in_play">In-Play</span>}
                                {!g.iplay && <p {...C} className="match-time">{matchTime(g.stime)}</p>}
                              </td>
                              <td {...C}>
                                {g.f && <span {...C} className="game-fancy me-1">F</span>}
                                {g.f1 && <span {...C} className="game-sportbook">S</span>}
                                {g.bm && <span {...C} className="game-bookmakers">BM</span>}
                              </td>
                              <td {...C} className="count hideDesktop">
                                <span {...C} className="back">{price(g, 1, 'back')}</span>
                                <span {...C} className="lay"> {price(g, 1, 'lay')}</span>
                              </td>
                              <td {...C} className="count hideDesktop">
                                <span {...C} className="back"> {price(g, 2, 'back')}</span>
                                <span {...C} className="lay">{price(g, 2, 'lay')}</span>
                              </td>
                              <td {...C} className="count hideDesktop">
                                <span {...C} className="back"> {price(g, 3, 'back')}</span>
                                <span {...C} className="lay">{price(g, 3, 'lay')} </span>
                              </td>
                              <td {...C} className="pe-1">
                                <a {...C} id="multiMarketPin" title="Add to Multi Markets" style={{ cursor: 'pointer' }} className={`add-pin ${g.gmid}${pins.on(g.gmid) ? ' pin-on' : ''}`} onClick={() => pins.toggle(g.gmid, sid)}>
                                  <PinIcon C={C} />
                                </a>
                              </td>
                            </tr>
                          ))}
                          {!loading && !events.length && (
                            <tr {...C}>
                              <td {...C} colSpan={7} className="norecords text-center" style={{ padding: '4px 15px 3px 15px' }}>
                                {' '}There are no events to be displayed{' '}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>}
      {lottery && (
        <div {...C}>
          <Lottery C={C} />
        </div>
      )}
      <FooterDesktop C={C} className="hideMobile" />
    </app-markets>
  );
}
