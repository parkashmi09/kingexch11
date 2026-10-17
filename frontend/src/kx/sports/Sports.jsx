import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { openAgeModal } from '../ageModal';
import useSportsTree from '../../hooks/useSportsTree';
import useListedSports from '../listedSports';
import { countryName } from '../racing';
import { InPlayIcon, MultiMarketsIcon, CricketIcon, SoccerIcon, TennisIcon } from './icons';

const S = ng('ksp');

// The reference's sports list, in its order. `etid` is the sport in our tree
// feed; Casino and Lottery open their own pages.
const SPORTS = [
  { name: 'Cricket', etid: 4 },
  { name: 'Casino', route: '/livecasino' },
  { name: 'Tennis', etid: 2 },
  { name: 'Soccer', etid: 1 },
  { name: 'Horse Racing', etid: 10, racing: true },
  { name: 'Politics', etid: 40 },
  { name: 'Greyhound Racing', etid: 65, racing: true },
  { name: 'Basketball', etid: 15 },
  { name: 'Lottery', route: '/allsport-highlight/66104' },
];

// The sport and competition last opened, as the reference's tabsService keeps
// them: coming back (Back from a match) reopens them; the bottom bar clears them.
const saved = { etid: null, tab: null };
export const resetSportsPage = () => { saved.etid = null; saved.tab = null; };

// Sport → [{ id, name, events: [{ id, name, route }] }]. Racing is regrouped
// the reference's way: country → every race, by start, under its venue.
function competitions(sport, sports, racing) {
  if (sport.racing) {
    const byCountry = {};
    const races = [...(racing.find((s) => +s.etid === sport.etid)?.children || [])]
      .sort((a, b) => String(a.sdatetime || '').localeCompare(String(b.sdatetime || '')));
    for (const r of races) {
      const [, venue = r.name, code = ''] = r.name.match(/^(.*?)\s*\(([^)]+)\)\s*$/) || [];
      const country = code ? countryName(code) : venue;
      (byCountry[country] ||= { id: country, name: country, events: [] })
        .events.push({ id: r.gmid, name: venue, route: `/gamedetails/${sport.etid}/${r.gmid}` });
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
 * app-sports — the phone's Sports page (the bottom bar's Sports): Quick Links,
 * then All Sports. A sport turns the list into its competitions, each opening
 * to its matches; "All Sports" goes back.
 */
export default function Sports() {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const { sports, racing } = useSportsTree();
  const listed = useListedSports(SPORTS);
  const [etid, setEtid] = useState(saved.etid);
  const [open, setOpen] = useState(saved.tab != null ? { [saved.tab]: true } : {});

  const sport = SPORTS.find((s) => s.etid === etid);
  const list = sport && competitions(sport, sports, racing);

  const pickSport = (s) => {
    if (s.route) { navigate(s.route); return; }
    saved.etid = s.etid;
    setEtid(s.etid);
    setOpen({});
  };
  const quick = (id) => pickSport(SPORTS.find((s) => s.etid === id));
  const allSports = () => { setEtid(null); setOpen({}); };
  const toggle = (id) => {
    saved.tab = id;
    setOpen((o) => ({ ...o, [id]: !o[id] }));
  };

  return (
    <app-sports {...host('ksp')} {...KX}>
      <div {...S} className="row all-sports">
        <h3 {...S} className="quickHeader quicklink" style={{ display: 'block' }}>Quick Links</h3>
        <ul {...S} className="quick_link" id="quickBoard" style={{ display: 'flex' }}>
          <li {...S}>
            <a {...S} href="/inplay" onClick={(e) => { e.preventDefault(); navigate('/inplay'); }}>
              {InPlayIcon(S)}
              <span {...S} className="bold">In-Play</span>
            </a>
          </li>
          <li {...S}>
            <a {...S} href={isAuth ? '/multimarket' : undefined} onClick={(e) => { e.preventDefault(); if (isAuth) navigate('/multimarket'); else openAgeModal(); }}>
              {MultiMarketsIcon(S)}
              <span {...S} className="bold">Multi Markets</span>
            </a>
          </li>
          <li {...S} onClick={() => quick(4)}>
            <a {...S}>
              {CricketIcon(S)}
              <span {...S} className="bold">Cricket</span>
            </a>
          </li>
          <li {...S} onClick={() => quick(1)}>
            <a {...S}>
              {SoccerIcon(S)}
              <span {...S} className="bold">Soccer</span>
            </a>
          </li>
          <li {...S} style={{ borderRight: 'none' }} onClick={() => quick(2)}>
            <a {...S}>
              {TennisIcon(S)}
              <span {...S} className="bold">Tennis</span>
            </a>
          </li>
        </ul>
        <h3 {...S} className="quickHeader" style={{ display: 'block', cursor: 'pointer' }}>
          <span {...S} className="bold">
            <a {...S} onClick={allSports}>All Sports</a>
          </span>
        </h3>
      </div>
      <div {...S}>
        <div {...S} className="sidebar">
          <nav {...S} className="sidebar-nav ps ps--active-y">
            <ul {...S} className="account-nav">
              {list ? (
                <div {...S} className="sideW">
                  {list.map((t) => (
                    <li {...S} key={t.id} className={`nav-item nav-dropdown${open[t.id] ? ' collapse-content open' : ''}`} onClick={() => toggle(t.id)}>
                      <a {...S} className="nav-link nav-dropdown-toggle"> {t.name} </a>
                      <ul {...S} className="nav-dropdown-items">
                        {open[t.id] && t.events.map((e) => (
                          <li {...S} key={e.id} className="nav-item toggleSidbar">
                            <a {...S} className="nav-link nav-link1 ml-2" onClick={() => navigate(e.route)}>
                              <i {...S} className="fa fa-arrow-right" aria-hidden="true" /> {e.name}{' '}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                  {list.length === 0 && (
                    <li {...S}>
                      <a {...S} className="nav-link"> No items found</a>
                    </li>
                  )}
                </div>
              ) : (
                <div {...S} className="sideW">
                  {listed.map((s) => (
                    <li {...S} key={s.name} className="nav-item nav-dropdown">
                      <a {...S} href="#" className="nav-link nav-dropdown-toggle" onClick={(e) => { e.preventDefault(); pickSport(s); }}> {s.name} </a>
                    </li>
                  ))}
                </div>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </app-sports>
  );
}
