import { useState, useEffect } from 'react';
import { fetchScoreCardUrl } from '../../apiservices/sportsService';
import CricketScorecard from './CricketScorecard';

/* Cricket (sid 4): fixed scorecard iframe (SCORECARD_BASE?etid&gmid).
   Football (sid 1) / Tennis (sid 2) ONLY: the score-card API returns a
   per-match score_url, rendered inside the reference's `.banner.scorestats`
   box with the sport's events-banner as background — and only once the match
   has actually STARTED (`started` prop, from the all-data iplay flag). Other
   sports render nothing. `mobile` renders the reference's mobile variant
   (`mobtog`, placed at the top of the Game Data tab pane); the default
   renders the desktop variant. Renders nothing until a URL exists. */
const SCORECARD_SPORTS = ['1', '2']; // football, tennis

export default function Scorecard({ gmid, sid, mobile = false, started = true }) {
  const isCricket = String(sid) === '4';
  const hasScorecard = SCORECARD_SPORTS.includes(String(sid));
  const [scoreUrl, setScoreUrl] = useState(null);
  // The banner background paints first; the scorecard iframe drops in 1s later
  // so the box lands with its events-banner art, then fills with live score.
  // (Coverage is already gated upstream via the feed's gtv, so if this renders
  // the match genuinely has a scorecard — no empty-box suppression needed.)
  const [showFrame, setShowFrame] = useState(false);

  useEffect(() => {
    if (isCricket || !hasScorecard || !started || !gmid) { setScoreUrl(null); return; }
    let alive = true;
    fetchScoreCardUrl(gmid, sid).then((url) => { if (alive) setScoreUrl(url); });
    return () => { alive = false; };
  }, [gmid, sid, isCricket, hasScorecard, started]);

  // Hold the iframe back for 1s after the URL arrives — banner bg shows alone
  // first, then the live scorecard.
  useEffect(() => {
    if (!scoreUrl) { setShowFrame(false); return; }
    const t = setTimeout(() => setShowFrame(true), 1000);
    return () => clearTimeout(t);
  }, [scoreUrl]);

  // Cricket: native socket-driven scorecard (replaces the old iframe). Renders
  // the reference banner from the live summary feed; nothing until it arrives.
  if (isCricket) {
    return <CricketScorecard gmid={gmid} started={started} />;
  }

  // Football/tennis only, and only after the match has started. The banner
  // (with its background art) shows as soon as we get here.
  if (!hasScorecard || !started) return null;

  return (
    <div
      className={`banner scorestats${mobile ? ' mobtog' : ' d-none-mobile'}`}
      style={{ backgroundImage: `url("/assets/events-banner/${sid}.png")` }}
    >
      {showFrame && scoreUrl && (
        <iframe src={scoreUrl} title="Live Score Card" frameBorder="0" />
      )}
    </div>
  );
}
