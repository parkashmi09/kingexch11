import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ng, host } from '../ng';
import { kx } from '../assets';
import { isDesktop } from '../exchange';
import { RACING, racingModel } from '../racing';
import useSportData from '../../hooks/useSportData';
import Loader from '../Loader';
import OwlCarousel from '../dashboard/OwlCarousel';
import { PinIcon } from '../dashboard/icons';
import { useMultiMarketPin } from '../multiMarket';

const H = ng('khr');

const pad = (n) => String(n).padStart(2, '0');
// DatePipe "dd-MM-yyyy HH:mm" and "H:mm".
const fullTime = (d) => (d ? `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}` : '');
const shortTime = (d) => (d ? `${d.getHours()}:${pad(d.getMinutes())}` : '');

// The reference's inline `background: transparent !important`, which a React
// style object can't express.
const transparent = (el) => el?.style.setProperty('background', 'transparent', 'important');

/**
 * app-horse-racing — the racing schedule (horse or greyhound, by the
 * reference's sport id). ALL lists every race by start time; a country tab
 * lists its meetings, each with its races' start times. On desktop it brings
 * its own slider and "Highlights" heading.
 */
export default function HorseRacing({ C, sportId }) {
  const navigate = useNavigate();
  const { sid, title } = RACING[sportId];
  const { data, loading } = useSportData(sid);
  const { tournaments, events } = racingModel(data, sid);
  const [country, setCountry] = useState('ALL');

  const all = events.flatMap((e) => e.races).sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
  const meetings = events.filter((e) => e.tournamentId === country);
  const pins = useMultiMarketPin();
  const go = (e, route) => { e.preventDefault(); navigate(route); };

  return (
    <app-horse-racing {...C} {...host('khr')}>
      <div {...H}>
        {loading && <Loader attrs={H} />}
        {isDesktop && (
          <div {...H}>
            <OwlCarousel C={H} slides={[kx('banners/slider-default.jpg')]} />
          </div>
        )}
        {isDesktop && (
          <div {...H} className="col-md-12 mobile-display-view">
            <div {...H} className="game-highlight-wrap">
              <h3 {...H}>Highlights</h3>
            </div>
          </div>
        )}
        <div {...H} className="racing-tab hidden-xs homeevent" style={{ background: '#fff' }}>
          <div {...H} className="row">
            <div {...H} className="col-md-12">
              <div {...H} className="horse-schedule">
                <h5 {...H}>{title}</h5>
              </div>
            </div>
            <div {...H} className="col-md-12 mobile-width" />
          </div>
          {tournaments.length > 0 ? (
            <div {...H}>
              <ul {...H} className="nav nav-tabs scrollflags">
                <li {...H} className={`nav-item${country === 'ALL' ? ' active' : ''}`}>
                  <a {...H} className={`nav-link d-flex justify-content-center align-items-center${country === 'ALL' ? ' active' : ''}`} onClick={() => setCountry('ALL')}>
                    <span {...H} />
                    <span {...H}>ALL</span>
                  </a>
                </li>
                {tournaments.map((t) => (
                  <li {...H} key={t.id} className={`nav-item${country === t.id ? ' active' : ''}`}>
                    <a {...H} className={`nav-link d-flex justify-content-center flex-column align-items-center${country === t.id ? ' active' : ''}`} onClick={() => setCountry(t.id)}>
                      <span {...H} />
                      <img {...H} className="country-flag" src={kx(`assets/flags/${t.name}.svg`)} alt="" />
                      <span {...H}>{t.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
              {country !== 'ALL' ? (
                <div {...H} className="matchList">
                  {meetings.length === 0 ? (
                    <div {...H} className="text-center norecordsFound"> No Real time record is available </div>
                  ) : (
                    <div {...H} className="tab-pane tab-pane-con">
                      <div {...H} className="tab-pane active">
                        <ul {...H} className="schedule-list">
                          {meetings.map((m, i) => (
                            <li {...H} key={i} className="event-list">
                              <div {...H} className="list">
                                <span {...H} className="name">{m.name}</span>
                                <ul {...H} className="eventtime">
                                  {m.races.map((r) => (
                                    <li {...H} key={r.id}>
                                      <a {...H} href={r.route} onClick={(e) => go(e, r.route)}>
                                        <span {...H} className={r.inPlay ? 'in_play' : undefined}>{shortTime(r.start)}</span>
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div {...H} className="matchList allmarkets">
                  {all.length === 0 ? (
                    <div {...H} className="text-center norecordsFoundAllMarekts norecordsFound"> No Real time record is available </div>
                  ) : (
                    <div {...H} className="tab-pane tab-pane-con">
                      <table {...H} className="table table-hover" id="gameContainer">
                        <tbody {...H}>
                          {all.map((r) => (
                            <tr {...H} key={r.id} className="firstElement">
                              <td {...H} className="eventNametd">
                                <a {...H} className="match-name" href={r.route} onClick={(e) => go(e, r.route)}>
                                  <span {...H}>{r.name}</span>
                                </a>
                                {r.inPlay && <span {...H} className="in_play" ref={transparent}>In-Play</span>}
                                {!r.inPlay && <p {...H} className="match-time hidedate"> {fullTime(r.start)} </p>}
                              </td>
                              <td {...H} className="ps-0" style={{ width: 25 }}>
                                <a {...H} id="multiMarketPin" title="Add to Multi Markets" style={{ cursor: 'pointer' }} className={`add-pin ${r.id}${pins.on(r.id) ? ' pin-on' : ''}`} onClick={() => pins.toggle(r.id, sportId)}>
                                  <PinIcon C={H} />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div {...H} className="matchList allmarkets">
              <div {...H} className="text-center norecordsFoundAllMarekts norecordsFound"> No Real time record is available </div>
            </div>
          )}
        </div>
      </div>
    </app-horse-racing>
  );
}
