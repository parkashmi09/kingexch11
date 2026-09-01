import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { bToastError } from '../components/BToast';
import useMatchData from '../hooks/useMatchData';
import PlaceBetPanel from '../components/betting/PlaceBetPanel';
import FallbackStreamIframe from '../components/FallbackStreamIframe';
import { SCORECARD_BASE } from '../config';
import { formatOdd, formatMax, isMarketSuspended, isSectionSuspended } from '../utils/oddsHelpers';
import { fetchMatchedBetsThunk } from '../redux/matchedBetsSlice';
import { fetchSportData } from '../apiservices/sportsService';
import MarketBlock from '../components/gamedetails/MarketBlock';

// Virtual Cricket detail page (/tp-virtual-cricket/:sid/:gmid). TWO layouts,
// picked by league (reference behavior):
//
// • Dim "(e)" e-cricket (iscc 4 — markets carry dtype 17/18/1):
//   `detail-page-container five-cricket dimcl-cricket` — ball-by-ball
//   scorecard + virtual video on top, then casino-style BACK-ONLY markets
//   (Match Result / Inning EvenOdd → market-9 market-17 column, Total
//   Runs/Fours/Sixs fancy3 → market-18 Under|line|Over, "Nth Ball" dtype 1 →
//   market-1 grid).
//
// • T5 XI / T10 XI / Virtual Cricket League:
//   `detail-page-container cricket-detail` — the STANDARD GameDetails market
//   blocks (Bookmaker match1 → market-2 back+lay with Cashout, Normal fancy →
//   market-6 Yes/No grid) via the shared MarketBlock switch.
//
// Data comes from the SAME apis as GameDetails: get-match-private-data (2s
// poll) + all-data fallback for the header (get-sport-data-by-id 500s for
// virtual gmids) — all handled inside useMatchData.

// Back-only column market (reference: .market-9.market-17 > .bet-table).
// Match Result / Inning EvenOdd (gtype match, dtype 17) and Total Runs /
// Fours / Sixs (gtype fancy3, dtype 18) all render this shape.
function BackColumnMarket({ market, index, onBetClick, onBetChange, activeBet, marketsRef, matchId, eventName }) {
  const [expanded, setExpanded] = useState(true);
  const sections = market.section || [];
  const suspended = isMarketSuspended(market) || (market.status || '').toUpperCase() === 'SUSPENDED';
  const bodyTitle = (market.status || '').toUpperCase() || (suspended ? 'SUSPENDED' : 'OPEN');
  const displayMax = market.maxb > 0 ? market.maxb : market.max;
  const fmtMax = displayMax ? formatMax(displayMax) : '';

  const handleClick = (section, oddObj) => {
    if (suspended || !oddObj || !onBetClick) return;
    onBetClick({
      odds: oddObj.odds,
      betType: 'back',
      team: section.nat || '',
      teamName: section.nat || '',
      marketType: market.mname || '',
      market_type: market.mname || '',
      market_id: market.mid,
      selectionId: section.sid,
      event_id: matchId,
      event_name: eventName || '',
      market_name: market.mname || '',
      mname: market.mname || '',
      gtype: market.gtype || '',
      section: sections,
      runners: sections.map(s => s.nat || ''),
      outcomes: sections.map(s => s.nat || ''),
      team_one: sections[0]?.nat || '',
      team_two: sections[1]?.nat || '',
      min_stake: section.min || market.min || null,
      max_stake: section.max || market.max || null,
      maxb: market.maxb || null,
      back_size: oddObj.size,
      market,
    });
  };

  const showPanel = activeBet && (activeBet.market_id || activeBet.market?.mid) === market.mid;

  return (
    <div className="market-9 market-17">
      <div className="bet-table">
        <div className="bet-table-header">
          <div className="nation-name">
            <span
              title={market.mname}
              data-toggle="collapse"
              data-target={`#market${index}`}
              aria-expanded={expanded}
              onClick={() => setExpanded(v => !v)}
              style={{ cursor: 'pointer' }}
            >
              {market.mname}
            </span>{' '}
            {fmtMax && (
              <span className="max-bet d-none-desktop">
                Max:<span>{fmtMax}</span>
              </span>
            )}
          </div>
        </div>
        {expanded && (
          <div
            id={`market${index}`}
            data-title={bodyTitle}
            className={`bet-table-body collapse show${suspended ? ' suspendedfull' : ''}`}
          >
            <div className="bet-table-row d-none-mobile">
              <div className="nation-name">
                {fmtMax && (
                  <span className="max-bet">
                    Max:<span>{fmtMax}</span>
                  </span>
                )}
              </div>{' '}
              <div className="back bl-title back-title">Back</div>
            </div>
            {sections.map((s, i) => {
              const o = (s.odds || []).find(x => (x.otype || '').toLowerCase() === 'back' && Number(x.odds) > 0)
                || (s.odds || []).find(x => Number(x.odds) > 0);
              // Per-cell suspension only when the market itself is open — a
              // market-level SUSPENDED uses the body's suspendedfull overlay.
              const cellSusp = !suspended && isSectionSuspended(s);
              return (
                <div className="bet-table-row" key={s.sid || i}>
                  <div className="nation-name">
                    <p>
                      {s.nat || ''}
                      <span className="float-right"></span>
                    </p>{' '}
                    <p className="mb-0"></p>
                  </div>{' '}
                  {o ? (
                    <div
                      className={`bl-box back${cellSusp ? ' suspended' : ''}`}
                      onClick={cellSusp || suspended ? undefined : () => handleClick(s, o)}
                      style={{ cursor: !suspended && !cellSusp ? 'pointer' : 'default' }}
                    >
                      <span className="d-block odds">{formatOdd(o.odds)}</span>
                    </div>
                  ) : (
                    <div className="bl-box back suspended no-val">
                      <span className="d-block odds">—</span>
                    </div>
                  )}
                </div>
              );
            })}
            {showPanel && (
              <PlaceBetPanel
                betValue={activeBet}
                betType={activeBet.betType}
                teamName={activeBet.teamName}
                odds={activeBet.odds}
                marketType={activeBet.marketType}
                market={activeBet.market || market}
                section={sections.find(s => s.sid === activeBet.selectionId) || {}}
                suspended={suspended}
                marketsRef={marketsRef}
                matchId={matchId}
                onClose={() => onBetClick(null)}
                onBetChange={onBetChange}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Under/Over line market (gtype fancy3, dtype 18 — Total Runs / Fours / Sixs,
// per team and overall). Reference: .market-18 > .bet-table with ONE
// .market-18-item holding Under box | line value (section min, e.g. 25.5) |
// Over box. Back-only.
function Market18Block({ market, index, onBetClick, onBetChange, activeBet, marketsRef, matchId, eventName }) {
  const [expanded, setExpanded] = useState(true);
  const sections = market.section || [];
  const under = sections.find(s => (s.nat || '').toLowerCase() === 'under') || sections[0];
  const over = sections.find(s => (s.nat || '').toLowerCase() === 'over') || sections[1];
  const line = under?.min || over?.min || '';
  const suspended = (market.status || '').toUpperCase() === 'SUSPENDED';
  const bodyTitle = (market.status || '').toUpperCase() || 'OPEN';
  const displayMax = market.maxb > 0 ? market.maxb : market.max;
  const fmtMax = displayMax ? formatMax(displayMax) : '';

  const handleClick = (section) => {
    const o = (section?.odds || []).find(x => Number(x.odds) > 0);
    if (suspended || !o || !onBetClick) return;
    onBetClick({
      odds: o.odds,
      betType: 'back',
      team: section.nat || '',
      teamName: section.nat || '',
      marketType: market.mname || '',
      market_type: market.mname || '',
      market_id: market.mid,
      selectionId: section.sid,
      event_id: matchId,
      event_name: eventName || '',
      market_name: market.mname || '',
      mname: market.mname || '',
      gtype: market.gtype || '',
      section: sections,
      runners: sections.map(s => s.nat || ''),
      outcomes: sections.map(s => s.nat || ''),
      team_one: sections[0]?.nat || '',
      team_two: sections[1]?.nat || '',
      min_stake: market.min || null,
      max_stake: market.max || null,
      maxb: market.maxb || null,
      back_size: o.size,
      market,
    });
  };

  const cell = (section) => {
    const o = (section?.odds || []).find(x => Number(x.odds) > 0);
    const cellSusp = !suspended && isSectionSuspended(section || {});
    return (
      <div
        className={`bl-box back${cellSusp ? ' suspended' : ''}`}
        onClick={suspended || cellSusp || !o ? undefined : () => handleClick(section)}
        style={{ cursor: !suspended && !cellSusp && o ? 'pointer' : 'default' }}
      >
        <span className="d-block odds">{o ? formatOdd(o.odds) : '—'}</span>
      </div>
    );
  };

  const showPanel = activeBet && (activeBet.market_id || activeBet.market?.mid) === market.mid;

  return (
    <div className="market-18">
      <div className="bet-table">
        <div data-toggle="collapse" data-target="#market-18" className="bet-table-header">
          <span
            title={market.mname}
            data-toggle="collapse"
            data-target={`#market${index}`}
            aria-expanded={expanded}
            onClick={() => setExpanded(v => !v)}
            style={{ cursor: 'pointer' }}
          >
            {market.mname}
          </span>{' '}
          {fmtMax && <span className="float-right max-bet">Max :<span>{fmtMax}</span></span>}
        </div>{' '}
        {expanded && (
          <div
            id={`market${index}`}
            data-title={bodyTitle}
            className={`bet-table-body collapse show${suspended ? ' suspendedfull' : ''}`}
          >
            <div className="bet-table-row">
              <div className="market-18-item">
                <div className="d-flex align-items-center flex-column">
                  <div>Under</div> {cell(under)}
                </div>{' '}
                <div className="d-flex align-items-center flex-column">
                  <h4 className="mb-0 d-flex flex-column align-items-center">
                    <b className="pointer">{line}</b> <small className="float-right"></small>
                  </h4>
                </div>{' '}
                <div className="d-flex align-items-center flex-column">
                  <div>Over</div> {cell(over)}
                </div>
              </div>
            </div>
            {showPanel && (
              <PlaceBetPanel
                betValue={activeBet}
                betType={activeBet.betType}
                teamName={activeBet.teamName}
                odds={activeBet.odds}
                marketType={activeBet.marketType}
                market={activeBet.market || market}
                section={sections.find(s => s.sid === activeBet.selectionId) || {}}
                suspended={suspended}
                marketsRef={marketsRef}
                matchId={matchId}
                onClose={() => onBetClick(null)}
                onBetChange={onBetChange}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Run-grid market ("Nth Ball Of Match", dtype 1) — reference market-1 grid:
// one row of market-1-item cells, each a run value + single back box.
function BallGridMarket({ market, onBetClick, onBetChange, activeBet, marketsRef, matchId, eventName }) {
  const sections = market.section || [];
  const suspended = isMarketSuspended(market) || (market.status || '').toUpperCase() === 'SUSPENDED';
  const bodyTitle = (market.status || '').toUpperCase() || (suspended ? 'SUSPENDED' : 'OPEN');
  const displayMax = market.maxb > 0 ? market.maxb : market.max;
  const fmtMax = displayMax ? formatMax(displayMax) : '';

  const handleClick = (section, oddObj) => {
    if (suspended || !oddObj || !onBetClick) return;
    onBetClick({
      odds: oddObj.odds,
      betType: 'back',
      team: section.nat || '',
      teamName: section.nat || '',
      marketType: market.mname || '',
      market_type: market.mname || '',
      market_id: market.mid,
      selectionId: section.sid,
      event_id: matchId,
      event_name: eventName || '',
      market_name: market.mname || '',
      mname: market.mname || '',
      gtype: market.gtype || '',
      section: sections,
      runners: sections.map(s => s.nat || ''),
      outcomes: sections.map(s => s.nat || ''),
      team_one: sections[0]?.nat || '',
      team_two: sections[1]?.nat || '',
      min_stake: section.min || market.min || null,
      max_stake: section.max || market.max || null,
      maxb: market.maxb || null,
      back_size: oddObj.size,
      market,
    });
  };

  const showPanel = activeBet && (activeBet.market_id || activeBet.market?.mid) === market.mid;

  return (
    <div className="market-1">
      <div className="bet-table">
        <div className="bet-table-header">
          <span title={market.mname}>{market.mname}</span>
          {fmtMax && (
            <span className="max-bet">
              <span title={`Max : ${fmtMax}`}>Max: <span>{fmtMax}</span></span>
            </span>
          )}
        </div>
        <div data-title={bodyTitle} className={`bet-table-body collapse show${suspended ? ' suspendedfull' : ''}`}>
          <div className="bet-table-row">
            {sections.map((s, i) => {
              const o = (s.odds || []).find(x => Number(x.odds) > 0);
              const cellSusp = !suspended && isSectionSuspended(s);
              return (
                <div key={s.sid || i} className="market-1-item">
                  <div className="d-flex flex-column"><span>{s.nat || ''}</span> <span></span></div>
                  {o ? (
                    <div
                      className={`bl-box back back${cellSusp ? ' suspended' : ''}`}
                      onClick={cellSusp || suspended ? undefined : () => handleClick(s, o)}
                      style={{ cursor: !suspended && !cellSusp ? 'pointer' : 'default' }}
                    >
                      <span className="d-block odds">{formatOdd(o.odds)}</span>
                    </div>
                  ) : (
                    <div className="bl-box back back suspended no-val">
                      <span className="d-block odds">—</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {showPanel && (
            <PlaceBetPanel
              betValue={activeBet}
              betType={activeBet.betType}
              teamName={activeBet.teamName}
              odds={activeBet.odds}
              marketType={activeBet.marketType}
              market={activeBet.market || market}
              section={sections.find(s => s.sid === activeBet.selectionId) || {}}
              suspended={suspended}
              marketsRef={marketsRef}
              matchId={matchId}
              onClose={() => onBetClick(null)}
              onBetChange={onBetChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Ball-by-ball scoreboard (reference .scorecard-bb → .bb-match) ──────────
// The scorecard host page (SCORECARD_BASE?etid&gmid) connects to the dimcl
// score websocket and re-posts every summary to its parent via
// postMessage({type:'scorecard_update', data}). We embed that page in a
// HIDDEN iframe purely as the data feed and render the reference's inline
// bb-match markup ourselves. Until the first update lands the iframe is
// shown as-is (it renders its own board), so the box is never empty.
// data fields (from the host's renderScorecard): spnnation1/2, score1/2,
// activenation1/2 ("1" = batting), balls[] (current innings), and
// spnballrunningstatus/spnmessage (the commentary line).
function ballDotClass(b) {
  const s = String(b).toUpperCase();
  if (s === 'WW' || /LBW|CT|BO|RO|ST|HW/.test(s)) return 'dot wicket';
  if (s.includes('WD') || s.includes('WIDE')) return 'dot wide';
  if (s.includes('NB') || s.includes('NOBALL')) return 'dot noball';
  if (s === '4') return 'dot four';
  if (s === '6') return 'dot six';
  return 'dot';
}
function ballDotText(b) {
  const s = String(b).toUpperCase();
  if (s === 'WW' || /LBW|CT|BO|RO|ST|HW/.test(s)) return 'w';
  if (s.includes('WD') || s.includes('WIDE')) return 'wd';
  if (s.includes('NB') || s.includes('NOBALL')) return 'nb';
  return String(b);
}

function BbTeam({ name, score, active, balls }) {
  return (
    <div className="bb-team">
      <div className="bb-score">
        <span className={active ? 'bb-current' : ''}>{score || 'Yet to bat'}</span>
      </div>{' '}
      <div className="bb-team-name">{name}</div>{' '}
      <div className="bb-team-form">
        {(balls || []).map((b, i) => (
          <span key={i} className={ballDotClass(b)}>{ballDotText(b)}</span>
        ))}
      </div>
    </div>
  );
}

function BallByBallScoreboard({ gmid, sid }) {
  const [score, setScore] = useState(null);
  // The socket only carries the CURRENT innings' balls — remember each
  // team's last-seen form so the finished innings keeps its dots.
  const ballsRef = useRef({ 1: [], 2: [] });

  useEffect(() => {
    ballsRef.current = { 1: [], 2: [] };
    setScore(null);
    // Guarded: SCORECARD_BASE is env-supplied with no baked-in default, so a
    // missing key would make `new URL('')` throw and take the whole page with
    // it. No base, no iframe to listen to — skip the listener entirely.
    if (!SCORECARD_BASE) return;
    let scorecardOrigin;
    try {
      scorecardOrigin = new URL(SCORECARD_BASE).origin;
    } catch {
      console.error('[VirtualCricket] VITE_SCORECARD_BASE is not a valid URL:', SCORECARD_BASE);
      return;
    }
    const onMessage = (e) => {
      if (e.origin !== scorecardOrigin) return;
      if (e.data?.type !== 'scorecard_update' || !e.data.data) return;
      const d = e.data.data;
      const balls = Array.isArray(d.balls) ? d.balls : [];
      if (d.activenation1 === '1') ballsRef.current[1] = balls;
      else if (d.activenation2 === '1') ballsRef.current[2] = balls;
      setScore(d);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [gmid]);

  const feedSrc = `${SCORECARD_BASE}?etid=${sid}&gmid=${gmid}`;
  const mini = score ? (score.spnballrunningstatus || score.spnmessage || '') : '';

  return (
    <div className="scorecard-bb">
      {/* Hidden data feed — the host page's websocket does the live work */}
      <iframe
        src={feedSrc}
        title="Scorecard feed"
        frameBorder="0"
        scrolling="no"
        style={score
          ? { display: 'none' }
          : { width: '100%', border: 0, display: 'block' }}
      />
      {score && (
        <>
          <div className="bb-match">
            <BbTeam
              name={score.spnnation1 || 'Team 1'}
              score={score.score1}
              active={score.activenation1 === '1'}
              balls={ballsRef.current[1]}
            />{' '}
            <div className="bb-scorebox">
              <div className="bb-inning"><span>Started</span></div>{' '}
              {mini && <div className="bb-mini d-none-mobile">{mini}</div>}
            </div>{' '}
            <BbTeam
              name={score.spnnation2 || 'Team 2'}
              score={score.score2}
              active={score.activenation2 === '1'}
              balls={ballsRef.current[2]}
            />
          </div>{' '}
          {mini && <div className="bb-mini d-none-desktop">{mini}</div>}
        </>
      )}
    </div>
  );
}

// Matched-bets table shared by the mobile tab + right sidebar (reference:
// Match Name / Nation / Odds / Stake, "No Record Found" when empty).
function VirtualMatchedBets({ bets = [] }) {
  const rows = [...bets].sort((a, c) => {
    const ts = (b) => new Date(b.timestamp || b.created_at || b.createdAt || 0).getTime() || Number(b.id) || 0;
    return ts(c) - ts(a);
  });
  return (
    <div className="collapse show w-100">
      <table className="coupon-table table table-borderedless">
        <thead>
          <tr className="theme1font">
            <th style={{ width: '25%' }}>Match Name</th>
            <th style={{ width: '40%' }}>Nation</th>
            <th className="text-right">Odds</th>
            <th className="text-right p-r-15">Stake</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan="4" className="text-center">No Record Found</td></tr>
          ) : (
            rows.map((bet, i) => (
              <tr key={bet.id ?? i} className={bet.betType === 'lay' ? 'lay' : 'back'}>
                <td><span>{bet.market_type || bet.marketType || ''}</span></td>
                <td><span>{bet.teamName || bet.selection_name || ''}</span></td>
                <td className="text-right">{bet.odds ?? ''}</td>
                <td className="text-right p-r-15">{bet.stake ?? ''}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function VirtualCricketDetails() {
  const { sid, gmid } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated: isAuth } = useSelector(s => s.user);
  const [activeTab, setActiveTab] = useState('game-data');
  const [showContent, setShowContent] = useState(false);
  const [activeBet, setActiveBet] = useState(null);

  const gameFromState = location.state?.game;
  const navigate = useNavigate();
  const { matchData, markets, loading, noMarkets } = useMatchData(gmid, sid, gameFromState);

  // Hard failure — the private-data API answered {success:false, error:"...404"}
  // (or an HTTP 4xx/5xx) before any markets ever loaded: the game doesn't
  // exist at all. Same behavior as GameDetails — toast + back to home.
  // (Different from the between-rounds "No Record Found." status-300 body,
  // which keeps success:true and is handled by the auto-switch effect below.)
  useEffect(() => {
    if (!noMarkets) return;
    bToastError('There are no markets available in this game!');
    navigate('/', { replace: true });
  }, [noMarkets, navigate]);

  // Between rounds the private-data API answers "No Record Found." (inner
  // status 300) — that round's markets never come back. Virtual rounds rotate
  // every ~3 min, so instead of sitting on a dead page, look up the league's
  // CURRENT live round in all-data and jump to it (replace, so Back still
  // leaves the virtual section). Re-checks every poll cycle while empty.
  useEffect(() => {
    if (loading || markets.length > 0) return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetchSportData(sid);
        const raw = res?.data?.data || res?.data;
        const t1 = Array.isArray(raw?.data?.t1) ? raw.data.t1 : [];
        const t2 = Array.isArray(raw?.data?.t2) ? raw.data.t2 : [];
        const all = [...t2, ...t1];
        const cur = all.find(m => String(m.gmid) === String(gmid));
        const league = matchData?.cname || cur?.cname;
        if (!league) return;
        const next = all.find(m =>
          m.etid === Number(sid) && m.iplay
          && m.cname === league && String(m.gmid) !== String(gmid)
        );
        if (!cancelled && next) {
          navigate(`/tp-virtual-cricket/${sid}/${next.gmid}`, { replace: true });
        }
      } catch { /* keep showing "No markets available" and retry next tick */ }
    };
    const first = setTimeout(check, 4000);
    const iv = setInterval(check, 10000);
    return () => { cancelled = true; clearTimeout(first); clearInterval(iv); };
  }, [loading, markets.length, gmid, sid, matchData?.cname, navigate]);

  // Small settle delay after the first load so the loader doesn't snap away
  // the instant the fetch lands (same behavior as GameDetails).
  useEffect(() => {
    if (loading) { setShowContent(false); return; }
    const t = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(t);
  }, [loading]);

  // Live ref for buffer monitoring in PlaceBetPanel
  const marketsRef = useRef([]);
  useEffect(() => {
    marketsRef.current = markets;
  }, [markets]);

  // Matched bets — poll every 5s + instant refresh after a placed bet
  const matchedBets = useSelector(s => s.matchedBets?.matchedBets || []);
  useEffect(() => {
    if (!gmid || !user) return;
    const userId = user?.user_id || user?.id;
    if (!userId || user?.username === 'Demo') return;
    dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId }));
    const iv = setInterval(() => dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId })), 5000);
    const onPlaced = () => dispatch(fetchMatchedBetsThunk({ eventId: gmid, userId }));
    window.addEventListener('bet:placed', onPlaced);
    return () => { clearInterval(iv); window.removeEventListener('bet:placed', onPlaced); };
  }, [gmid, user?.user_id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBetClick = useCallback((betInfo) => {
    if (!betInfo) { setActiveBet(null); return; }
    if (!isAuth) {
      bToastError('Please login to access!');
      return;
    }
    // Same classification as GameDetails: fancy-family (incl. fancy3 Total
    // Runs/Fours/Sixs and T5/VCL "Normal") → FANCY, match1 → BOOKMAKER,
    // gtype match → MATCH.
    const mtype = (betInfo.market?.gtype || betInfo.gtype || '').toLowerCase();
    const fancyTypes = ['fancy', 'fancy1', 'fancy2', 'fancy3', 'khado', 'oddeven', 'meter', 'normal', 'cricketcasino'];
    const isFancy = fancyTypes.includes(mtype) || mtype.startsWith('fancy');
    const isBookmaker = mtype === 'match1' || (betInfo.mname || '').toLowerCase() === 'bookmaker';
    const gameType = isFancy ? 'FANCY' : isBookmaker ? 'BOOKMAKER' : 'MATCH';
    setActiveBet({
      ...betInfo,
      event_id: gmid,
      event_name: matchData?.ename || '',
      match_title: matchData?.ename || '',
      match_start_time: matchData?.stime || '',
      sid: sid,
      sports: 'Cricket',
      game_type: gameType,
    });
  }, [gmid, sid, isAuth, matchData?.ename, matchData?.stime]);

  const handleBetChange = useCallback(() => {}, []);

  const league = matchData?.cname || '';
  const name = matchData?.ename || '';
  const headerName = league && name ? `${league} > ${name.trim()}` : (name || league).trim();
  const matchDate = (() => {
    const raw = matchData?.stime || '';
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} (UTC+05:30)`;
  })();

  const visibleMarkets = markets.filter(m => m.section?.length > 0);

  // League split: Dim "(e)" rounds carry casino-style markets (dtype 17/18/1);
  // T5 XI / T10 XI / Virtual Cricket League carry standard Bookmaker (match1)
  // + Normal fancy markets. Prefer matchData.iscc (4 = Dim) when the header
  // has loaded; before that, sniff the markets themselves.
  const isDim = matchData
    ? Number(matchData.iscc) === 4 || (matchData.cname || '').toLowerCase().startsWith('dim')
    : visibleMarkets.some(m => [1, 17, 18].includes(Number(m.dtype)));

  const renderMarkets = () =>
    visibleMarkets.length === 0 ? (
      <div style={{ padding: '20px', textAlign: 'center', width: '100%' }}>No markets available</div>
    ) : isDim ? (
      visibleMarkets.map((m, i) => {
        const props = {
          market: m,
          index: i,
          onBetClick: handleBetClick,
          onBetChange: handleBetChange,
          activeBet,
          marketsRef,
          matchId: gmid,
          eventName: matchData?.ename,
        };
        // dtype 1 = per-ball run grid; fancy3/dtype 18 = Under|line|Over
        // (market-18); everything else = back-only column (market-9/17)
        if (Number(m.dtype) === 1) return <BallGridMarket key={m.mid || i} {...props} />;
        if ((m.gtype || '').toLowerCase() === 'fancy3' || Number(m.dtype) === 18) {
          return <Market18Block key={m.mid || i} {...props} />;
        }
        return <BackColumnMarket key={m.mid || i} {...props} />;
      })
    ) : (
      // T5 XI / T10 XI / VCL — same market blocks as GameDetails: Bookmaker
      // renders market-2 (back+lay + Cashout), Normal fancy renders market-6.
      visibleMarkets.map((m, i) => (
        <MarketBlock
          key={m.mid || i}
          market={m}
          onBetClick={handleBetClick}
          onBetChange={handleBetChange}
          activeBet={activeBet}
          marketsRef={marketsRef}
          matchId={gmid}
          eventName={matchData?.ename}
        />
      ))
    );

  const containerClass = isDim
    ? 'detail-page-container five-cricket dimcl-cricket'
    : 'detail-page-container cricket-detail';

  // Ball-by-ball scorecard board + virtual video (reference: .scorecard-bb
  // then .bb-video > .five-video-baner.video-box inside video-box-container).
  // BOTH are LOGGED-IN only, same gate as GameDetails — logged out gets no
  // score/video block at all, just the header + markets.
  const renderScoreAndVideo = () => {
    if (!isAuth) return null;
    return (
      <>
        <BallByBallScoreboard gmid={gmid} sid={sid} />{' '}
        <div className="bb-video">
          <div className="five-video-baner video-box">
            <FallbackStreamIframe gmid={gmid} title="Virtual Cricket" />
          </div>
        </div>
      </>
    );
  };

  if (loading || !showContent) {
    return (
      <div className="center-container">
        <div>
          <div className={`${containerClass} loader-section-parent`}>
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

  // ── T5 XI / T10 XI / Virtual Cricket League — GameDetails-style layout ──
  // (reference: center-container > detail-page-container cricket-detail with
  // flat headers then market-2 / market-6 blocks; video for logged-in only)
  if (!isDim) {
    return (
      <div className="center-container">
        <div className="">
          <div className={containerClass}>
            <div className="game-header d-none-mobile">
              <span className="game-header-name">{headerName}</span>{' '}
              {matchDate && <span className="game-header-date">{matchDate}</span>}
            </div>{' '}
            <div className="game-header d-none-desktop">
              <span className="game-header-name">
                {headerName}
                {matchDate && <div><small>{matchDate}</small></div>}
              </span>
            </div>{' '}
            {isAuth && (
              <div className="casino-video">
                <div className="video-box-container">
                  <div className="bb-video">
                    <div className="five-video-baner video-box">
                      <FallbackStreamIframe gmid={gmid} title="Virtual Cricket" />
                    </div>
                  </div>
                </div>
              </div>
            )}{' '}
            {renderMarkets()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="center-container">
      <div className="detail-page-container five-cricket dimcl-cricket">
        {/* ── Mobile: Game Data / Matched Bets / Unmatched Bet tabs ── */}
        <div className="d-none-desktop w-100">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a
                data-toggle="tab"
                href="#game-data"
                className={`nav-link${activeTab === 'game-data' ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); setActiveTab('game-data'); }}
              >Game Data</a>
            </li>{' '}
            <li className="nav-item">
              <a
                data-toggle="tab"
                href="#matched-bet"
                className={`nav-link${activeTab === 'matched-bet' ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); setActiveTab('matched-bet'); }}
              >Matched Bets{matchedBets.length > 0 && <> <span>({matchedBets.length})</span></>}</a>
            </li>{' '}
            <li className="nav-item">
              <a
                data-toggle="tab"
                href="#unmatched-bet"
                className={`nav-link${activeTab === 'unmatched-bet' ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); setActiveTab('unmatched-bet'); }}
              >Unmatched Bet</a>
            </li>
          </ul>{' '}
          <div className="tab-content">
            <div id="game-data" className={`tab-pane${activeTab === 'game-data' ? ' active' : ''}`}>
              <div className="game-header">
                <span className="game-header-name">{headerName}</span>{' '}
                {matchDate && <span className="game-header-date">{matchDate}</span>}
              </div>{' '}
              {isAuth && (
                <div className="casino-video">
                  <div className="video-box-container">
                    {renderScoreAndVideo()}
                  </div>
                </div>
              )}{' '}
              {renderMarkets()}
            </div>{' '}
            <div id="matched-bet" className={`tab-pane${activeTab === 'matched-bet' ? ' active' : ''}`}>
              <VirtualMatchedBets bets={matchedBets} />
            </div>{' '}
            <div id="unmatched-bet" className={`tab-pane${activeTab === 'unmatched-bet' ? ' active' : ''}`}>
              <div className="collapse show w-100">
                <table className="coupon-table table table-borderedless">
                  <thead>
                    <tr className="theme1font">
                      <th style={{ width: '30%' }}>Match Name</th>
                      <th style={{ width: '40%' }}>Nation</th>
                      <th className="text-right">Odds</th>
                      <th className="text-right p-r-15">Stake</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan="4" className="text-center">No Record Found</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── Desktop ── */}
        <div className="game-header d-none-mobile">
          <span className="game-header-name">{headerName}</span>{' '}
          <div className="d-flex flex-1 align-items-center justify-content-center">
            {matchDate && <span className="game-header-date">{matchDate}</span>}
          </div>
        </div>{' '}
        {isAuth && (
          <div className="casino-video">
            <div className="video-box-container d-none-mobile">
              {renderScoreAndVideo()}
            </div>
          </div>
        )}{' '}
        <div className="container-fluid container-fluid-5">
          <div className="row row5 mt-2"><div className="col"></div></div>
        </div>{' '}
        <div className="w-100 d-flex flex-wrap d-none-mobile">
          {renderMarkets()}
        </div>
      </div>

      {/* Desktop right sidebar — My Bet (reference keeps only this block) */}
      {isAuth && (
        <div id="right-sidebar-id" className="right-sidebar d-none-mobile">
          <span></span>
          <div className="my-market-container">
            <div data-toggle="collapse" data-target="#market-data-1" className="my-market-title">
              <span>My Bet</span>
            </div>
            {matchedBets.length > 0 && (
              <div id="market-data-1" className="collapse show">
                <VirtualMatchedBets bets={matchedBets} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VirtualCricketDetails;
