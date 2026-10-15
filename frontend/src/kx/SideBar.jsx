import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ng, KX } from './ng';
import useSportsTree from '../hooks/useSportsTree';
import { countryName } from './racing';
import useListedSports from './listedSports';

const C = ng('ksb');

// The reference's sports list, in its order. `etid` is the sport's id in our
// tree feed; a sport with one turns the rail into its tournaments, Casino and
// Lottery only navigate, as the reference's do.
const SPORTS = [
  { name: 'Cricket', etid: 4, route: '/allsport-highlight/4' },
  { name: 'Casino', route: '/livecasino' },
  { name: 'Tennis', etid: 2, route: '/allsport-highlight/2' },
  { name: 'Soccer', etid: 1, route: '/allsport-highlight/1' },
  { name: 'Horse Racing', etid: 10, route: '/allsport-highlight/7', racing: true },
  { name: 'Greyhound Racing', etid: 65, route: '/allsport-highlight/4339', racing: true },
  { name: 'Lottery', route: '/allsport-highlight/66104' },
];

// The open sport and tournaments outlive the rail: pages that remount it (a
// match page) find it as it was, like the reference's single sidebar.
const saved = { sport: null, open: {} };

// Sport → [{ id, name, events: [{ id, name, route }] }]. Racing arrives one
// level flatter (sport → race), so it is regrouped the reference's way:
// country → meeting, each meeting opening its first race.
function tournaments(sport, sports, racing) {
  if (sport.racing) {
    const byCountry = {};
    for (const r of racing.find((s) => +s.etid === sport.etid)?.children || []) {
      const [, venue = r.name, code = ''] = r.name.match(/^(.*?)\s*\(([^)]+)\)\s*$/) || [];
      const country = code ? countryName(code) : venue;
      const group = (byCountry[country] ||= { id: country, name: country, events: [] });
      if (!group.events.some((e) => e.name === venue)) {
        group.events.push({ id: r.gmid, name: venue, route: `/gamedetails/${sport.etid}/${r.gmid}` });
      }
    }
    return Object.values(byCountry);
  }
  return (sports.find((s) => +s.etid === sport.etid)?.children || []).map((t) => ({
    id: t.cid,
    name: t.name,
    events: (t.children || []).map((e) => ({ id: e.gmid, name: e.name, route: `/gamedetails/${e.etid}/${e.gmid}` })),
  }));
}

/**
 * app-side-bar — the desktop left rail. The sports list; picking a sport opens
 * its highlights and turns the rail into that sport's tournaments, each
 * expanding to its events, and it stays that way while browsing its matches.
 * "Sports" (or the ⋮) goes back to the list; so does going home.
 */
export default function SideBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { sports, racing } = useSportsTree();
  const listed = useListedSports(SPORTS);
  const home = pathname === '/' || pathname === '/home';
  const [sport, setSport] = useState(home ? null : saved.sport);
  const [open, setOpen] = useState(home ? {} : saved.open);
  useEffect(() => { saved.sport = sport; saved.open = open; }, [sport, open]);
  const [wasHome, setWasHome] = useState(home);
  if (home !== wasHome) {
    setWasHome(home);
    if (home) { setSport(null); setOpen({}); }
  }
  const list = useMemo(() => sport && tournaments(sport, sports, racing), [sport, sports, racing]);

  const back = () => { setSport(null); setOpen({}); };
  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));
  const pick = (e, s) => {
    e.preventDefault();
    if (s.etid) { setSport(s); setOpen({}); }
    navigate(s.route);
  };

  return (
    <app-side-bar {...KX}>
      <div {...C} className="sidebar">
        <nav {...C} className="sidebar-nav ps ps--active-y apply-scroll" style={{ width: '99.8%' }}>
          <div {...C} className="top-head-sport">
            <ul {...C} className="text-right mr-2">
              <li {...C}>
                <a {...C} className="path-back" onClick={back}>
                  <i {...C} className="fa fa-ellipsis-v" aria-hidden="true" style={{ fontSize: 14 }} />
                </a>
              </li>
              <li {...C}>
                <a {...C} style={{ position: 'relative', top: 1.5 }} onClick={back}>Sports</a>
              </li>
            </ul>
          </div>
          <div {...C} className="scrollNav">
            <ul {...C} className="nav">
              <div {...C} className="sideW">
                {list
                  ? list.map((t) => (
                      <li {...C} key={t.id} className={`nav-item nav-dropdown${open[t.id] ? ' collapse-content open' : ''}`} onClick={() => toggle(t.id)}>
                        <a {...C} className="nav-link nav-dropdown-toggle w-100" style={{ display: 'inline-block' }}> {t.name} </a>
                        {open[t.id] && t.events.map((e) => (
                          <ul {...C} key={e.id} className="nav-dropdown-items">
                            <li {...C} className="nav-item toggleSidbar">
                              <a {...C} className="nav-link nav-link1 ml-2" onClick={() => navigate(e.route)}>
                                <div {...C} className="nav-link-inner innerdrop-down">
                                  <i {...C} className="fa fa-arrow-right fa-arrow-just-sidebar" aria-hidden="true" /> {e.name}{' '}
                                </div>
                              </a>
                            </li>
                          </ul>
                        ))}
                      </li>
                    ))
                  : listed.map((s) => (
                      <li {...C} key={s.name} className="nav-item nav-dropdown">
                        <a {...C} href="#" className="nav-link nav-dropdown-toggle" onClick={(e) => pick(e, s)}>
                          <span {...C}>{s.name}</span>
                        </a>
                      </li>
                    ))}
                {list?.length === 0 && (
                  <li {...C} className="nav-item nav-dropdown">
                    <a {...C} className="nav-link">items not found </a>
                  </li>
                )}
              </div>
            </ul>
          </div>
          <div {...C} className="ps__rail-y" style={{ top: 0, height: 403, right: 0 }}>
            <div {...C} className="ps__thumb-y" tabIndex={0} style={{ top: 0, height: 379 }} />
          </div>
        </nav>
      </div>
    </app-side-bar>
  );
}
