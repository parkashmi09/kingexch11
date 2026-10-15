import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { bToastError } from '../components/BToast';
import { useDispatch, useSelector } from 'react-redux';
import useMatchData from '../hooks/useMatchData';
import useSportsGameDetail from '../hooks/useSportsGameDetail';
import MarketBlock from '../components/gamedetails/MarketBlock';
import MatchedBetsTable from '../components/betting/MatchedBetsTable';
import OneClickBetting from '../components/gamedetails/OneClickBetting';
import Scorecard from '../components/gamedetails/Scorecard';
import SportsStream from '../components/gamedetails/SportsStream';
import { calculateRunnerPL, classifyMarket } from '../utils/oddsHelpers';
import { fetchMatchedBetsThunk, addMatchedBet, clearMatchedBets } from '../redux/matchedBetsSlice';
import { getMatchExposures } from '../apiservices/sportsService';
import { bToastSuccess } from '../components/BToast';
import { BET_TOAST } from '../utils/betToastMessages';
import { fetchBalanceThunk } from '../redux/userSlice';
import { getOneClickButtons, updateOneClickButtons } from '../apiservices/oneClickButtonService';
import { isDemoUser, getDemoOpenBets } from '../utils/demoStore';
import { calculateMatchOddsResults, calculateSingleBetPLValue } from '../utils/betHelpers';
import { isCricketLimitedOvers } from '../components/betting/placeBet/placeBetRules';

import { formatFeedIstTime } from '../utils/racingUtils';

// Route sid → the `sports` value the bet payload must carry. This page serves
// every sport, so the old hardcoded 'Cricket' mis-tagged football/tennis bets.
const SPORT_NAME_BY_SID = {
  1: 'Soccer', 2: 'Tennis', 4: 'Cricket', 10: 'HorseRace', 65: 'Greyhound',
};

// Matched Bets list (By Date / By Bet / Average) — shared component, also used
// by the racing page. Mobile tab uses the default idSuffix; the desktop
// sidebar passes idSuffix="d" so the radio input ids never collide.

function GameDetails() {
  const { sid, gmid } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated: isAuth } = useSelector(s => s.user);
  const [activeTab, setActiveTab] = useState('game-data');
  const [hiddenMarkets, setHiddenMarkets] = useState({});
  const [showTv, setShowTv] = useState(false);
  // Eye icon toggle — scorecard visible by default (reference: fa-eye active-tab).
  // Eye and TV are mutually exclusive: the same section shows EITHER the
  // scorecard OR the video, never both.
  const [showScore, setShowScore] = useState(true);
  const toggleScore = () => {
    setShowScore(prev => {
      const next = !prev;
      if (next) setShowTv(false);
      return next;
    });
  };
  const toggleTv = () => {
    setShowTv(prev => {
      const next = !prev;
      if (next) setShowScore(false);
      return next;
    });
  };
  // Keep the loader on screen for 2s AFTER data finishes loading, then reveal the
  // content — a small settle delay so it doesn't snap in the instant the fetch lands.
  const [showContent, setShowContent] = useState(false);
  const [activeBet, setActiveBet] = useState(null);
  const [currentBetValues, setCurrentBetValues] = useState(null);
  const marketScrollRef = useRef(null);
  const stickyOffsetRef = useRef(null);

  // 1 Click Betting — shared between mobile and desktop blocks. The toggle
  // RESETS on refresh (reference behavior). Stake values are PER USER via the
  // API (GET /user/buttonlist on mount, POST /user/updatebuttonlist on Save);
  // localStorage is only an instant-paint cache until the fetch lands.
  const [oneClickEnabled, setOneClickEnabled] = useState(false);
  const [oneClickStakes, setOneClickStakes] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('oneClickStakes'));
      if (Array.isArray(s) && s.length === 3 && s.every(n => Number.isFinite(n) && n > 0)) return s;
    } catch { /* fall through to defaults */ }
    return [100, 200, 300];
  });
  useEffect(() => {
    if (!isAuth) return;
    let alive = true;
    getOneClickButtons().then((buttons) => {
      if (!alive) return;
      setOneClickStakes(buttons);
      localStorage.setItem('oneClickStakes', JSON.stringify(buttons));
    });
    return () => { alive = false; };
  }, [isAuth]);
  // Active stake button: a fresh page render starts with the FIRST selected;
  // right after Save (-1) none is active until the user picks one. Session
  // state only — not persisted, so the next render is back to the first.
  const [oneClickActiveIdx, setOneClickActiveIdx] = useState(0);

  const handleOneClickToggle = (on) => {
    setOneClickEnabled(on);
    // Reference: every time the switch flips ON the FIRST stake button comes
    // back selected — even right after a Save (where none was active)
    if (on) setOneClickActiveIdx(0);
  };
  const handleOneClickStakes = (stakes) => {
    setOneClickStakes(stakes);
    localStorage.setItem('oneClickStakes', JSON.stringify(stakes));
    // Persist per user — Save in the edit panel calls this
    updateOneClickButtons(stakes).catch(() => {});
    // After Save, deselect: no button stays active
    setOneClickActiveIdx(-1);
  };
  const handleOneClickActive = (idx) => {
    setOneClickActiveIdx(idx);
  };

  const oneClickProps = {
    enabled: oneClickEnabled,
    onToggle: handleOneClickToggle,
    stakes: oneClickStakes,
    onStakesChange: handleOneClickStakes,
    activeIdx: oneClickActiveIdx,
    onActiveChange: handleOneClickActive,
  };

  useEffect(() => {
    const onScroll = () => {
      const el = marketScrollRef.current;
      if (!el) return;

      // Capture the original document-relative top only once (before fixed positioning)
      if (stickyOffsetRef.current === null) {
        const rect = el.getBoundingClientRect();
        stickyOffsetRef.current = rect.top + window.scrollY;
      }

      const shouldStick = window.scrollY >= stickyOffsetRef.current - 90;

      if (shouldStick && !el.classList.contains('sticky')) {
        // Insert a spacer to preserve document flow height when element goes fixed
        const spacer = document.createElement('div');
        spacer.className = 'sticky-spacer';
        spacer.style.height = el.offsetHeight + 'px';
        el.parentNode.insertBefore(spacer, el.nextSibling);
        el.classList.add('sticky');
      } else if (!shouldStick && el.classList.contains('sticky')) {
        el.classList.remove('sticky');
        // Remove the spacer
        const spacer = el.parentNode.querySelector('.sticky-spacer');
        if (spacer) spacer.remove();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      // Cleanup spacer on unmount
      const spacer = document.querySelector('.sticky-spacer');
      if (spacer) spacer.remove();
    };
  }, []);

  const gameFromState = location.state?.game;
  const navigate = useNavigate();
  const { matchData: rawMatchData, markets, loading, error, noMarkets } = useMatchData(gmid, sid, gameFromState);
  // Header/meta (name, league, start time, in-play, tv) from the diamond v1
  // endpoint, polled every 5s — more reliable than useMatchData's dead
  // get-sport-data-by-id source. Its fields override the ones from useMatchData.
  const sportsMeta = useSportsGameDetail(gmid, sid);
  const matchData = sportsMeta ? { ...rawMatchData, ...sportsMeta } : rawMatchData;

  // Scorecard gate: the match has actually STARTED. Two feed signals, EITHER of
  // which means live — neither is reliable alone:
  //   • iplay:true  — the feed marks it in-play. (Can read true for far fixtures,
  //     but the scorecard host's own coverage probe + the iframe onLoad gate in
  //     Scorecard.jsx suppress any empty/"STARTING SOON" box, so a stray true is
  //     harmless — it never renders a scorecard the host isn't actually serving.)
  //   • stime <= now — the scheduled start has passed. (But the feed sometimes
  //     lists a nominal start LATER than the real kickoff — e.g. a genuinely live
  //     match with iplay:true whose stime is still hours ahead — so stime alone
  //     wrongly HIDES a live match's scorecard.)
  // OR-ing them fixes the football/tennis case where a live match carried a
  // future stime. stime arrives US-style ("7/16/2026 11:59:00 PM", IST) and
  // parses with new Date(). The TV icon stays gated on matchData.tv separately.
  // useMatchData refreshes matchData every ~30s, so this flips without a reload.
  const matchStarted = (() => {
    if (matchData?.iplay === true) return true;
    const raw = matchData?.stime;
    if (!raw) return false;
    const d = new Date(raw);
    return !isNaN(d.getTime()) && d.getTime() <= Date.now();
  })();

  // No stream (tv !== true) → no eye/TV icons, so nothing can toggle the
  // scorecard back on. Force the default state: video off, scorecard visible.
  // Also covers tv flipping false mid-session while the user was watching TV.
  useEffect(() => {
    if (matchData?.tv !== true) {
      setShowTv(false);
      setShowScore(true);
    }
  }, [matchData?.tv]);

  // The private-data API answered 404/500 (or {success:false}) for this gmid —
  // no markets exist for the game. Reference behavior: toast + back to home.
  useEffect(() => {
    if (!noMarkets) return;
    bToastError('There are no markets available in this game!');
    navigate('/', { replace: true });
  }, [noMarkets, navigate]);

  // Reveal content 2s after loading ends; while loading (or during that 2s settle
  // window) the loader stays on screen.
  useEffect(() => {
    if (loading) { setShowContent(false); return; }
    const t = setTimeout(() => setShowContent(true), 2000);
    return () => clearTimeout(t);
  }, [loading]);

  // Live ref for buffer monitoring in PlaceBetPanel
  const marketsRef = useRef([]);
  useEffect(() => {
    marketsRef.current = markets;
  }, [markets]);

  // Fetch matched bets — poll every 5s
  const matchedBets = useSelector(s => s.matchedBets?.matchedBets || []);

  useEffect(() => {
    if (!gmid || !user) return;
    const userId = user?.user_id || user?.id;
    if (!userId || user?.email === 'demo@mail.com') return;
    dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId }));
    const iv = setInterval(() => dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId })), 5000);
    // Instant refresh right after a bet completes (poll alone is too slow)
    const onPlaced = () => dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId }));
    window.addEventListener('bet:placed', onPlaced);
    return () => { clearInterval(iv); window.removeEventListener('bet:placed', onPlaced); };
  }, [gmid, user?.user_id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch per-runner match exposures from API (raw rows — mapping happens below
  // against the live markets list so each row lands on the RIGHT market only)
  const [matchExposureRows, setMatchExposureRows] = useState([]);
  useEffect(() => {
    if (!gmid || !user) return;
    const userId = user?.user_id || user?.id;
    if (!userId || user?.email === 'demo@mail.com') return;
    let alive = true;
    const fetchExp = () => {
      getMatchExposures(String(gmid), userId)
        .then(res => {
          if (alive && res?.success && Array.isArray(res.data)) setMatchExposureRows(res.data);
        })
        .catch(() => {});
    };
    fetchExp();
    const id = setInterval(fetchExp, 5000);
    // Instant refresh right after a bet completes (poll alone is too slow)
    window.addEventListener('bet:placed', fetchExp);
    return () => { alive = false; clearInterval(id); window.removeEventListener('bet:placed', fetchExp); };
  }, [gmid, user?.user_id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Exposure → market mapping ─────────────────────────────────────────────
  // Keys are STRICTLY `${market.mid}:${runnerName}` — a name-only fallback
  // leaked the value into every market sharing the runner name (tennis: the
  // same two players appear in MATCH_ODDS, Bookmaker, set winners…).
  // A row finds its market by, in order:
  //   1. exact mid match (row.match_id === market.mid)
  //   2. row.game_type === market name (stored ids can differ from the live
  //      feed's mid — e.g. row match_id 7547772858252 vs feed's MATCH_ODDS mid)
  //   3. same market family (MATCH_ODDS / BOOKMAKER) that lists this runner
  const matchExposures = useMemo(() => {
    const map = {};
    if (!matchExposureRows.length || !markets.length) return map;
    const normName = (s) => String(s || '').trim().toLowerCase();
    const normType = (s) => String(s || '').toUpperCase().replace(/[\s_]+/g, '');
    const familyOf = (gt) => {
      const g = normType(gt);
      if (g === 'MATCHODDS' || g === 'TIEDMATCH') return 'MATCH_ODDS';
      if (g === 'BOOKMAKER' || g === 'BOOKMAKER2') return 'BOOKMAKER';
      return null;
    };
    for (const item of matchExposureRows) {
      const name = normName(item.team_name || item.teamName);
      const amt = Number(item.exposure_amount);
      if (!name || !Number.isFinite(amt)) continue;
      const rowMid = item.match_id != null ? String(item.match_id).trim() : '';
      // 1) exact market-id match
      let mkt = rowMid ? markets.find((m) => String(m.mid).trim() === rowMid) : null;
      // 2) game_type matches the market's name (MATCH_ODDS, Bookmaker…)
      if (!mkt) {
        const gt = normType(item.game_type);
        if (gt) {
          mkt = markets.find((m) => normType(m.mname) === gt
            && (m.section || []).some((s) => normName(s.nat) === name));
        }
      }
      // 3) same market family that actually lists this runner
      if (!mkt) {
        const fam = familyOf(item.game_type);
        if (fam) {
          mkt = markets.find((m) => classifyMarket(m) === fam
            && (m.section || []).some((s) => normName(s.nat) === name));
        }
      }
      if (!mkt) continue;
      const key = `${String(mkt.mid).trim()}:${name}`;
      // Same market+runner can have rows per game_type — sum them
      map[key] = Number(((map[key] || 0) + amt).toFixed(2));
    }
    return map;
  }, [matchExposureRows, markets]);

  // ── Demo mode: exposures are computed client-side, in real time ──────────
  const isDemo = isDemoUser(user);

  // Hydrate redux matched bets from the demo store so books survive a refresh
  useEffect(() => {
    if (!isDemo || !isAuth) return;
    const { matchedBets: stored } = getDemoOpenBets();
    dispatch(clearMatchedBets());
    stored.forEach(b => dispatch(addMatchedBet(b)));
  }, [isDemo, isAuth, dispatch]);

  // Per-runner exposure map from demo bets — same key shape as the API map
  // (`${mid}:${name}` + name-only fallback), recomputed on every placed bet.
  const demoExposures = useMemo(() => {
    if (!isDemo || !isAuth) return null;
    const map = {};
    for (const m of markets) {
      const mid = m.mid != null ? String(m.mid).trim() : '';
      const mBets = matchedBets.filter(b => String(b.market_id ?? '').trim() === mid);
      if (mBets.length === 0) continue;
      const mt = classifyMarket(m);
      // Keys are STRICTLY `${mid}:${name}` — a name-only fallback would leak
      // the book into every other market sharing the same runner name.
      if (mt === 'MATCH_ODDS' || mt === 'BOOKMAKER') {
        const runners = (m.section || []).map(s => s.nat || '');
        const book = calculateMatchOddsResults(mBets, null, runners);
        for (const name of runners) {
          if (!name) continue;
          // 0 books stay in the map — once the market has bets, every runner
          // shows its book value, and a plain "0" is a real value (reference)
          const val = Number((book[name] ?? 0).toFixed(2));
          map[`${mid}:${name.trim().toLowerCase()}`] = val;
        }
      } else {
        // Fancy-type markets: show the runner's total liability (negative)
        for (const b of mBets) {
          const name = (b.teamName || '').trim().toLowerCase();
          if (!name) continue;
          const { loss } = calculateSingleBetPLValue({ stake: b.stake, odds: b.odds, betType: b.betType, marketType: b.marketType });
          const key = `${mid}:${name}`;
          map[key] = Number(((map[key] || 0) - loss).toFixed(2));
        }
      }
    }
    return map;
  }, [isDemo, isAuth, markets, matchedBets]);

  const effectiveExposures = isDemo ? demoExposures : matchExposures;

  const toggleMarket = useCallback((mid) => {
    setHiddenMarkets(prev => ({ ...prev, [mid]: !prev[mid] }));
  }, []);

  const toggleAll = useCallback((allMids, checked) => {
    const next = {};
    for (const mid of allMids) next[mid] = !checked;
    setHiddenMarkets(next);
  }, []);

  const handleBetClick = useCallback((betInfo) => {
    if (!betInfo) { setActiveBet(null); setCurrentBetValues(null); return; }
    // Logged out (no demo/real login): odds click only shows the login toast
    if (!isAuth) {
      bToastError('Please login to access!');
      return;
    }
    // Enrich with event-level data so the payload has all required fields
    const mtype = (betInfo.market?.gtype || betInfo.gtype || '').toLowerCase();
    const mnameLower = (betInfo.mname || betInfo.market_name || betInfo.market?.mname || '').toLowerCase();
    const fancyTypes = ['fancy', 'fancy1', 'fancy2', 'khado', 'oddeven', 'meter', 'normal', 'cricketcasino'];
    const isFancy = fancyTypes.includes(mtype);
    // "Tied Match" (gtype match1 but mname "Tied Match") — quotes SUB-1 odds
    // (0.75) that the backend's bookmaker validation (oddN > 1) rejects. Send it
    // as FANCY, exactly like the reference: the backend then accepts the odds
    // AND routes to its unfloored `Tied Match` exposure branch (book = stake*odds/100).
    const isTied = mtype === 'match1' && mnameLower.includes('tied');
    const isBookmaker = !isTied && (mtype === 'match1' || mnameLower === 'bookmaker');
    const gameType = (isFancy || isTied) ? 'FANCY' : isBookmaker ? 'BOOKMAKER' : 'MATCH';
    setActiveBet({
      ...betInfo,
      event_id: gmid,
      event_name: matchData?.ename || '',
      match_title: matchData?.ename || '',
      match_start_time: matchData?.stime || '',
      sid: sid,
      // Sport name derived from the route's sid — this page serves every sport
      // (1 Soccer / 2 Tennis / 4 Cricket / 10 HorseRace / 65 Greyhound). It used
      // to be hardcoded 'Cricket', so football and tennis bets were stored as
      // Cricket and every sport-wise report/commission split was wrong.
      sports: SPORT_NAME_BY_SID[String(sid)] || 'Cricket',
      game_type: gameType,
      // Cricket ODI/T20 MATCH_ODDS rate cap (>4.00 rejected); Test exempt.
      // Computed here where the match's cname/ename are known.
      limited_overs: isCricketLimitedOvers({ sid, cname: matchData?.cname, ename: matchData?.ename }),
      team_one: betInfo.runners?.[0] || '',
      team_two: betInfo.runners?.[1] || '',
      // One-click mode: PlaceBetPanel auto-submits with this stake, no panel UI.
      // No stake selected (idx -1) → 0, so clicks do nothing until one is picked
      oneClick: oneClickEnabled,
      oneClickStake: oneClickEnabled && oneClickActiveIdx >= 0 ? oneClickStakes[oneClickActiveIdx] : 0,
    });
  }, [gmid, sid, isAuth, matchData?.ename, matchData?.stime, matchData?.cname, oneClickEnabled, oneClickStakes, oneClickActiveIdx]);

  const handleBetChange = useCallback((betValues) => {
    setCurrentBetValues(betValues);
  }, []);

  // Real-time per-runner book for the active market while the bet panel has a
  // valid stake: EXISTING exposure (API map) + what THIS pending bet would do.
  // e.g. Djurgardens book 260, pending bet adds 18.78 → shows 278.78 live.
  const runnerPL = useMemo(() => {
    if (!currentBetValues || !activeBet) return {};
    const market = activeBet.market;
    if (!market) return {};
    const mt = classifyMarket(market);
    // Only compute for MATCH_ODDS and BOOKMAKER (not FANCY)
    if (mt !== 'MATCH_ODDS' && mt !== 'BOOKMAKER') return {};
    const runnerNames = (market.section || []).map(s => s.nat || '');
    const pending = calculateRunnerPL(currentBetValues, runnerNames);
    const mid = market.mid != null ? String(market.mid).trim() : '';
    const combined = {};
    for (const name of runnerNames) {
      const existing = Number(effectiveExposures?.[`${mid}:${name.trim().toLowerCase()}`]) || 0;
      combined[name] = Number((existing + (Number(pending[name]) || 0)).toFixed(2));
    }
    return combined;
  }, [currentBetValues, activeBet, effectiveExposures]);

  if (loading || !showContent) {
    // Loader structures match the reference exactly — they differ by auth:
    //   logged OUT: center-container > div > detail-page-container.cricket-detail
    //               .loader-section-parent > loader-section > div > img
    //   logged IN:  fullwidthdetail-container > div > casino-container >
    //               detail-page-container.loader-section-parent (NO cricket-detail)
    //               + the casino right-sidebar (Matka blink + 1 Click Betting)
    // Both stay up while loading AND for 2s after (the settle delay).
    if (!isAuth) {
      return (
        <div className="center-container">
          <div>
            <div className="detail-page-container cricket-detail loader-section-parent">
              <div className="loader-section">
                <div>
                  <img src="/assets/animate/loader-ten.gif" alt="loader" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="fullwidthdetail-container">
        <div className="">
          <div className="casino-container">
            <div className="detail-page-container loader-section-parent">
              <div className="loader-section">
                <div>
                  <img src="/assets/animate/loader-ten.gif" alt="loader" />
                </div>
              </div>
            </div>
            <div id="right-sidebar-id" className="right-sidebar casino-right-sidebar">
              <Link to="/casino/worli3" className="">
                <div className="blink-message"><i className="fas fa-info-circle"></i> <div>Matka</div></div>
              </Link>
              <div className="user-settings">
                <div className="custom-control custom-switch">
                  <input id="autocon-1" type="checkbox" name="autocon-1" className="custom-control-input" value="true" readOnly />
                  <label htmlFor="autocon-1" className="custom-control-label">1 Click Betting</label>
                </div>
                <div className="one-click-bet float-left w-100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && markets.length === 0) {
    return (
      <div className="fullwidthdetail-container"><div><div className="casino-container"><div className="detail-page-container cricket-detail">
        <div style={{ padding: '20px', textAlign: 'center' }}>Failed to load match data</div>
      </div></div></div></div>
    );
  }

  // Line Markets (fancy2) are logged-in only — hide the whole block (and its
  // filter checkbox) for logged-out visitors
  const visibleMarkets = markets
    .filter(m => m.section?.length > 0)
    .filter(m => isAuth || (m.gtype || '').toLowerCase() !== 'fancy2');
  const isTournament = visibleMarkets.some(m => (m.mname || '').toUpperCase().includes('TOURNAMENT_WINNER'));
  // Eye icon (scorecard toggle) — FOOTBALL/TENNIS ONLY, and only when the
  // match also has a live stream (tv: true): the eye/TV pair toggles between
  // scorecard and video. Cricket NEVER gets the eye — its header shows just
  // the TV icon and the scorecard stays permanently visible (reference).
  // No stream → no icons at all; the scorecard shows on its own.
  const isCricket = String(sid) === '4';
  // Racing detail pages carry NO market-filter checkbox strip — the reference
  // greyhound page renders the markets straight under the header, and horse
  // racing (its own RacingDetails page) has none either.
  const isRacing = ['10', '65'].includes(String(sid));
  // Football/tennis scorecard coverage: the avrkhub score page only has a real
  // scorecard when the feed assigns a graphic id (`gtv` != 0). gtv === 0 means
  // the page shows "Starting soon" / nothing — so hide the box entirely.
  // (Verified: v1 `gtv` matches the animation id in the avrkhub HTML 1:1.)
  const scoreCovered = isCricket || Number(matchData?.gtv) > 0;
  const showScoreEye = matchData?.tv === true && scoreCovered
    && ['1', '2'].includes(String(sid)) && matchStarted && !isTournament;
  const league = matchData?.cname || '';
  const name = matchData?.ename || '';
  // Plain single spaces around ">" \u2014 reference: "LEAGUE > MATCH" (nbsp padding
  // doubled the gap and truncated long names)
  const headerName = league && name
    ? `${league} > ${name.trim()}`
    : (name || league).trim();
  // Racing stime is an IST wall-clock string with no zone marker
  // ("7/31/2026 3:02:00 PM"). formatFeedIstTime reformats the IST parts WITHOUT
  // converting, so every viewer sees the racecard time \u2014 the plain `new Date()`
  // path below reads it in the viewer's own zone and would shift it.
  const raceDate = matchData?.stime ? `${formatFeedIstTime(matchData.stime)} (UTC+05:30)` : '';
  // Header date \u2014 reference format: DD/MM/YYYY HH:mm:ss (UTC+05:30), 24-hour.
  // stime arrives as US-style "7/12/2026 12:00:00 PM".
  const matchDate = isRacing ? raceDate : (() => {
    const raw = matchData?.stime || '';
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} (UTC+05:30)`;
  })();

  // Racing (greyhound, sid 65) opens the page with the scorecard banner instead
  // of a desktop game-header \u2014 the same block RacingDetails renders for horse
  // racing, and the reference greyhound page is identical to it. POST-LOGIN
  // only; the logged-out page keeps its plain game-header.
  // Everything comes from the live feed: the first market's `status` ("OPEN"),
  // the "GB > Harlow" line from cname/ename, and the IST start time. The feed
  // ships `rem` empty on every race seen so far, so there is no "| desc" span,
  // and the reference shows no pre-race countdown here either.
  const raceStatus = matchData?.iplay ? 'IN-PLAY' : (visibleMarkets[0]?.status || '');
  const racingBanner = (
    <div
      className="banner scorecard-banner"
      style={{ backgroundImage: `url("/assets/events-banner/${sid}.png")` }}
    >
      <div className="scorecard">
        <div className="text-success">{raceStatus}</div>
        <div className="time-detail">
          <p>{headerName}</p>
          <h5><span>{raceDate}</span></h5>
        </div>
        {/* Live TV — same toggle as the header TV icon, so tapping it opens the
            stream in the Game Data pane below (and taps again to close). Only
            rendered when the feed actually carries a stream for this race. */}
        {matchData?.tv && (
          <span
            className={`d-none-desktop${showTv ? ' active-tab' : ''}`}
            onClick={() => { setActiveTab('game-data'); toggleTv(); }}
            style={{ cursor: 'pointer' }}
          >
            <i className="fas fa-tv"></i> <small>Live TV</small>
          </span>
        )}
      </div>
    </div>
  );

  const allMids = visibleMarkets.map(m => m.mid);
  const allChecked = allMids.every(mid => !hiddenMarkets[mid]);

  const filteredMarkets = visibleMarkets.filter(m => !hiddenMarkets[m.mid]);

  // Build deduplicated filter list — group all fancy2 as one "Line Market" entry
  const filterItems = (() => {
    const items = [];
    let lineAdded = false;
    const lineMids = visibleMarkets.filter(m => (m.gtype || '').toLowerCase() === 'fancy2').map(m => m.mid);
    for (const m of visibleMarkets) {
      if ((m.gtype || '').toLowerCase() === 'fancy2') {
        if (!lineAdded) {
          items.push({ mid: 'line-market', mids: lineMids, label: 'Line Market' });
          lineAdded = true;
        }
      } else {
        items.push({ mid: m.mid, mids: [m.mid], label: m.mname });
      }
    }
    return items;
  })();

  const toggleLineGroup = (mids) => {
    setHiddenMarkets(prev => {
      const allHidden = mids.every(mid => prev[mid]);
      const next = { ...prev };
      for (const mid of mids) next[mid] = !allHidden;
      return next;
    });
  };

  const renderFilterCheckboxes = (prefix) => (
    <div ref={marketScrollRef} className={`market-scroll${prefix === 'desktop' ? ' d-none-mobile sticky' : ''}`}>
      <div className="custom-control custom-checkbox">
        <input
          type="checkbox"
          id={`${prefix}CheckAll`}
          className="custom-control-input"
          checked={allChecked}
          onChange={() => toggleAll(allMids, allChecked)}
        />
        <label htmlFor={`${prefix}CheckAll`} className="custom-control-label">ALL</label>
      </div>
      {filterItems.map((item, idx) => {
        const checked = item.mids.every(mid => !hiddenMarkets[mid]);
        // Logged-out reference uses index-based ids (customCheck0, customCheck1…)
        const inputId = prefix === 'custom' ? `customCheck${idx}` : `${prefix}Check-${item.mid}`;
        return (
          <div key={item.mid} className="custom-control custom-checkbox">
            <input
              type="checkbox"
              id={inputId}
              className="custom-control-input"
              value={item.mids[0]}
              checked={checked}
              onChange={() => item.mids.length > 1 ? toggleLineGroup(item.mids) : toggleMarket(item.mids[0])}
            />
            <label htmlFor={inputId} className="custom-control-label">
              {item.label}
            </label>
          </div>
        );
      })}
    </div>
  );

  const renderMarketList = () => {
    if (filteredMarkets.length === 0) {
      return <div style={{ padding: '20px', textAlign: 'center' }}>No markets available</div>;
    }

    // Group fancy2 (Line Market) into a single block, inserted at original API position
    const lineMarkets = filteredMarkets.filter(m => (m.gtype || '').toLowerCase() === 'fancy2');
    const otherMarkets = filteredMarkets.filter(m => (m.gtype || '').toLowerCase() !== 'fancy2');

    // Find where first fancy2 sat in the original list to preserve API ordering
    const firstLineIdx = filteredMarkets.findIndex(m => (m.gtype || '').toLowerCase() === 'fancy2');
    let lineInsertIdx = otherMarkets.length; // fallback: end
    if (firstLineIdx >= 0) {
      // Count how many non-fancy2 markets appear before the first fancy2
      lineInsertIdx = filteredMarkets.slice(0, firstLineIdx).filter(m => (m.gtype || '').toLowerCase() !== 'fancy2').length;
    }

    // `marketIndex` is the block's position in RENDER order — the reference
    // wires the header's collapse to the body via `#market{n}` using exactly
    // that sequence (market0, market1, …), not the feed's mid.
    let seq = 0;
    const makeBlock = (m) => (
      <MarketBlock
        key={m.mid}
        marketIndex={seq++}
        market={m}
        onBetClick={handleBetClick}
        onBetChange={handleBetChange}
        activeBet={activeBet}
        runnerPL={activeBet?.market?.mid === m.mid ? runnerPL : null}
        matchExposures={effectiveExposures}
        marketsRef={marketsRef}
        matchId={gmid}
        eventName={matchData?.ename}
      />
    );

    const result = otherMarkets.slice(0, lineInsertIdx).map(makeBlock);

    if (lineMarkets.length > 0) {
      result.push(
        <MarketBlock
          key="line-market-group"
          marketIndex={seq++}
          market={lineMarkets[0]}
          markets={lineMarkets}
          onBetClick={handleBetClick}
          onBetChange={handleBetChange}
          activeBet={activeBet}
          matchExposures={effectiveExposures}
          marketsRef={marketsRef}
          matchId={gmid}
          eventName={matchData?.ename}
        />
      );
    }

    result.push(...otherMarkets.slice(lineInsertIdx).map(makeBlock));

    return result;
  };

  // ── Logged-out layout (reference): center-container > detail-page-container
  // (cricket-detail only for cricket), single flat header + filter + markets —
  // no casino-container, no tabs, no right sidebar.
  if (!isAuth) {
    return (
      <div className="center-container">
        <div className="">
          <div className={`detail-page-container${String(sid) === '4' ? ' cricket-detail' : ''}`}>
            {/* Logged out keeps the plain game-header — the racing scorecard
                banner is a post-login element only */}
            <div className="game-header d-none-mobile">
              <span className="game-header-name">{headerName}</span>
              {matchDate && <span className="game-header-date">{matchDate}</span>}
            </div>
            <div className="game-header d-none-desktop">
              <span className="game-header-name">
                {headerName}
                {matchDate && <div><small>{matchDate}</small></div>}
              </span>
            </div>
            {visibleMarkets.length > 0 && !isRacing && renderFilterCheckboxes('custom')}
            {renderMarketList()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fullwidthdetail-container">
      {/* `.horse-detail` scopes the racing banner's own sizing rules (70px strip
          + flex scorecard) — without the wrapper the banner renders at the
          generic 115px height and the row never lays out. */}
      <div className={isRacing ? 'horse-detail' : ''}>
        <div className="casino-container">
          <div className={`detail-page-container${isRacing ? '' : ' cricket-detail'}`}>

            {/* Racing (greyhound) opens with the scorecard banner — status,
                "GB > Harlow" and the start time, same as the horse-racing page */}
            {isRacing && racingBanner}

            {/* All sports: cricket uses the fixed scorecard iframe; football/
                tennis fetch their score_url from the score-card API.
                Football/tennis toggle via the eye icon; CRICKET has no eye —
                its scorecard is ALWAYS visible (TV only adds the stream). */}
            {isAuth && gmid && !isTournament && scoreCovered && (showScore || isCricket) && <Scorecard gmid={gmid} sid={sid} started={matchStarted} />}

            {/* Desktop game header — name and date in SEPARATE spans (matches the
                reference: game-header-name + game-header-date). Racing has none:
                the banner above already carries both. */}
            {!isRacing && (
            <div className="game-header d-none-mobile">
              <span className="game-header-name">{headerName}</span>
              {matchDate && <span className="game-header-date">{matchDate}</span>}
              {isAuth && (
                <span>
                  {showScoreEye && (
                    <>
                      <i
                        className={`fas fa-eye${showScore ? ' active-tab' : ''}`}
                        style={{ fontSize: '21px', cursor: 'pointer' }}
                        onClick={toggleScore}
                      ></i>{' '}
                    </>
                  )}
                  {matchData?.tv && (
                    <i
                      className={`fas fa-tv${showScoreEye ? ' ml-1' : ''}${showTv ? ' active-tab' : ''}`}
                      style={isCricket ? undefined : { fontSize: '18px', cursor: 'pointer' }}
                      onClick={toggleTv}
                    ></i>
                  )}
                </span>
              )}
            </div>
            )}

            {/* Desktop market filter */}
            {visibleMarkets.length > 0 && !isRacing && renderFilterCheckboxes("desktop")}

            {/* Mobile section */}
            <div className="d-none-desktop w-100">
              <div className="text-right w-100 pr-2"></div>
              {/* Game Data / Matched Bets tabs — logged-in only (Matched Bets is a
                  logged-in feature); logged-out just shows the game-data content. */}
              {isAuth && (
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <a
                      data-toggle="tab"
                      href="#game-data"
                      className={`nav-link${activeTab === 'game-data' ? ' active' : ''}`}
                      onClick={e => { e.preventDefault(); setActiveTab('game-data'); }}
                    >Game Data</a>
                  </li>
                  <li className="nav-item">
                    <a
                      data-toggle="tab"
                      href="#matched-bet"
                      className={`nav-link${activeTab === 'matched-bet' ? ' active' : ''}`}
                      onClick={e => { e.preventDefault(); setActiveTab('matched-bet'); }}
                    >Matched Bets{matchedBets.length > 0 && <> <span>({matchedBets.length})</span></>}</a>
                  </li>
                </ul>
              )}
              <div className="tab-content">
                <div id="game-data" className={`tab-pane${activeTab === 'game-data' ? ' active' : ''}`}>
                  {/* Mobile scorecard (non-cricket) — top of the Game Data pane,
                      reference: banner scorestats mobtog */}
                  {isAuth && gmid && !isTournament && scoreCovered && showScore && String(sid) !== '4' && (
                    <Scorecard gmid={gmid} sid={sid} mobile started={matchStarted} />
                  )}
                  {showTv && matchData?.tv && <SportsStream gmid={gmid} className="d-none-desktop" />}
                  {/* Mobile game header */}
                  <div className="game-header">
                    <span className="game-header-name">
                      {headerName}
                      {matchDate && <div><small>{matchDate}</small></div>}
                    </span>
                    {isAuth && (
                      <span>
                        {showScoreEye && (
                          <>
                            <i
                              className={`fas fa-eye${showScore ? ' active-tab' : ''}`}
                              style={{ fontSize: '21px', cursor: 'pointer' }}
                              onClick={toggleScore}
                            ></i>{' '}
                          </>
                        )}
                        {matchData?.tv && (
                          <i
                            className={`fas fa-tv${showScoreEye ? ' ml-1' : ''}${showTv ? ' active-tab' : ''}`}
                            style={isCricket ? undefined : { fontSize: '18px', cursor: 'pointer' }}
                            onClick={toggleTv}
                          ></i>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Mobile market filter */}
                  {visibleMarkets.length > 0 && !isRacing && renderFilterCheckboxes("mobile")}

                  {/* Mobile user settings — logged-in only */}
                  {isAuth && (
                    <OneClickBetting id="autocon-1" {...oneClickProps}>
                      {/* Link (not <a href>) — a raw anchor hard-reloads the app
                          and replays the boot splash; SPA nav loads instantly */}
                      <Link to="/casino/worli3" className="">
                        <div className="blink-message"><i className="fas fa-info-circle"></i> <div>Matka</div></div>
                      </Link>
                    </OneClickBetting>
                  )}

                  {/* Mobile markets */}
                  {renderMarketList()}
                </div>

                <div id="matched-bet" className={`tab-pane${activeTab === 'matched-bet' ? ' active' : ''}`}>
                  <MatchedBetsTable bets={matchedBets} />
                </div>
              </div>
            </div>

            {/* Desktop markets */}
            <div className="w-100 d-flex flex-wrap d-none-mobile">
              {renderMarketList()}
            </div>

          </div>

          {/* Desktop right sidebar — logged-in only */}
          {isAuth && (
            <div id="right-sidebar-id" className="right-sidebar casino-right-sidebar d-none-mobile sticky">
              <Link to="/casino/worli3" className="">
                <div className="blink-message"><i className="fas fa-info-circle"></i> <div>Matka</div></div>
              </Link>
              <OneClickBetting id="autocon-desktop" {...oneClickProps} />

              {/* Live Match — click the title to open the stream (toggles showTv,
                  same flag the header TV icon uses). */}
              {matchData?.tv && (
                <div className="tv-container">
                  <div
                    className="tv-title"
                    onClick={() => setShowTv((v) => !v)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="mb-0 bet-slip-title"><i className="fas fa-tv"></i> Live Match</span>
                  </div>
                  {showTv && <SportsStream gmid={gmid} className="mt-1" />}
                </div>
              )}

              {/* My Bet — Matched Bets list. Only renders once there are matched bets. */}
              {matchedBets.length > 0 && (
              <div className="my-market-container">
                <div data-toggle="collapse" className="my-market-title"><span>My Bet</span></div>
                <div id="market-data-1" className="bet-slip-box collapse show">
                  <MatchedBetsTable bets={matchedBets} title="Matched Bets" idSuffix="d" />
                </div>
              </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameDetails;
