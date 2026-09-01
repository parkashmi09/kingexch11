import useCricketScore from '../../hooks/useCricketScore';

// Live cricket scorecard — driven by the score socket (useCricketScore), NOT an
// iframe. Renders the reference `.scorecard.scorecard-new` banner from the
// summary payload: two team scores (bat/ball icon on the batting side), team
// names, CRR/RR, the status message and the last-6-balls strip.
// The banner (events-banner background) shows IMMEDIATELY as a placeholder while
// the socket connects; the scorecard fills in once the first summary arrives.
//
// Styling comes from the global `.scorecard-new` rules in reference/style.css —
// this component only renders the structure/classes, it ships no CSS of its own.

const BAT_ICON = '/assets/scorecard/bat-icon.png';
const BALL_ICON = '/assets/scorecard/ball-icon.png';


// One ball chip → colour class by outcome (reference: four / six / wicket).
// Only `ww` is a wicket. A bare `w` is a WIDE and stays plain in the reference
// (verified against the live board: `ww` → `ball wicket`, `w` → `ball`), so it
// must not pick up the red wicket colour.
function ballClass(v) {
  const s = String(v || '').trim().toLowerCase();
  if (s === 'ww') return 'ball wicket';
  if (s === '4') return 'ball four';
  if (s === '6') return 'ball six';
  return 'ball';
}

export default function CricketScorecard({ gmid, started = true }) {
  const data = useCricketScore(gmid, { enabled: !!gmid && started });

  // Not live and nothing to show yet → render nothing (no empty banner). Once
  // the match is live (started) the banner shows immediately as a placeholder.
  if (!started && !data) return null;

  const {
    spnnation1, spnnation2, score1, score2,
    spnrunrate1, spnrunrate2, spnreqrate1, spnreqrate2,
    spnmessage, activenation1, balls, dayno,
  } = data || {};

  // Batting side carries the bat icon; the other side the ball icon.
  const team1Batting = String(activenation1) === '1';
  const crr = spnrunrate1 || spnrunrate2 || '';
  const rr = spnreqrate1 || spnreqrate2 || '';
  const ballList = Array.isArray(balls) ? balls : [];

  // Multi-day (Test) matches only: the feed sends `dayno` ("2") and the
  // reference prints "Day 2" in the middle of the last row. Limited-overs feeds
  // send dayno: "" (verified: T20 → "", WI v PAK Test → "2"), so the cell is
  // rendered ONLY when there's a real day number — an always-on cell would show
  // a bare "Day" on every T20 board.
  const day = String(dayno ?? '').trim();
  const showDay = day !== '' && day !== '0';

  return (
    <div
      className="banner scorecard-banner"
      style={{ backgroundImage: `url("/assets/events-banner/4.png")` }}
    >
      {/* Background shows first; the scorecard renders once socket data arrives. */}
      {data && (
        <div className="scorecard scorecard-new">
          <div className="scorecard-row">
            <div className="scorecard-box-left">
              <div className="team team1">
                <div className="team-img">
                  <img src={team1Batting ? BAT_ICON : BALL_ICON} alt="" />
                </div>
                <div className="team-score">
                  <span className="score"><span className="score-total">{score1 || ''}</span></span>
                </div>
              </div>
            </div>
            <div className="scorecard-box-right">
              <div className="team team2">
                <div className="team-score">
                  <span className="score"><span className="score-total">{score2 || '-'}</span></span>
                </div>
                <div className="team-img">
                  <img src={team1Batting ? BALL_ICON : BAT_ICON} alt="" />
                </div>
              </div>
            </div>
          </div>

          <div className="scorecard-row team-name-row">
            <div className="team-name">{spnnation1}</div>
            <div className="team-rr">
              {crr !== '' && <span>CRR {crr}</span>}
              {crr !== '' && rr !== '' && ' '}
              {rr !== '' && <span>RR {rr}</span>}
            </div>
            <div className="team-name">{spnnation2}</div>
          </div>

          <div className="scorecard-row mt-1">
            <div className="scorecard-box-left">
              <div>{spnmessage || ''}</div>
            </div>
            {showDay && <div>Day {day}</div>}
            <div className="scorecard-box-right">
              <div className="score-runs">
                {/* A chip per DELIVERED ball only. The feed pads the over out to
                    six entries and leaves the not-yet-bowled ones blank, which
                    rendered as an empty `.ball` — a stray blank box at the end of
                    the strip. The reference drops them (its `<!---->` placeholder
                    is a per-item v-if), so a blank value renders nothing here.
                    Skipped per item rather than filtered up front, so a gap in
                    the middle behaves the same way. */}
                {ballList.map((b, i) => (
                  String(b ?? '').trim() === ''
                    ? null
                    : <div key={i} className={ballClass(b)}>{b}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
