import { memo, useMemo } from 'react';
import { parseBalls, rankFromCode } from './SuperOverBalls';

function rankToRuns(rank) {
  if (!rank) return null;
  if (rank === 'K') return 'W';
  if (rank === '10') return 0;
  if (rank === 'A') return 1;
  const n = parseInt(rank, 10);
  return isNaN(n) ? null : n;
}

function computeScore(ballCodes) {
  let runs = 0;
  let wickets = 0;
  let deliveries = 0;
  const ballValues = [];

  for (const code of ballCodes) {
    if (code === null) continue;
    deliveries++;
    const rank = rankFromCode(code);
    const val = rankToRuns(rank);
    if (val === 'W') {
      wickets++;
      ballValues.push('W');
    } else if (val !== null) {
      runs += val;
      ballValues.push(String(val));
    }
  }

  return { runs, wickets, deliveries, ballValues };
}

function oversStr(deliveries) {
  const full = Math.floor(deliveries / 4);
  const rem = deliveries % 4;
  return `${full}.${rem}`;
}

const SuperOverScorecard = memo(function SuperOverScorecard({ team1, team2, cardString }) {
  const { runs, wickets, deliveries, ballValues } = useMemo(
    () => computeScore(parseBalls(cardString)),
    [cardString]
  );

  const scoreText = `${runs}-${wickets}`;
  const overs = `(${oversStr(deliveries)})`;
  const crr = deliveries > 0 ? ((runs / deliveries) * 4).toFixed(2) : '0.00';

  const showNeeded = deliveries > 0;
  const needsRuns = runs + 1;
  const remainBalls = 4 - deliveries;

  return (
    <>
      {/* Mobile scorecard */}
      <div className="scorecard scorecard-new d-none-desktop mt-1 mb-1">
        <div className="scorecard-row">
          <div className="scorecard-box-left">
            <div className="team team1">
              <div className="team-img">
                <img src="/assets/front/img/bat-icon.png" alt="" />
              </div>
              <div className="team-score">
                <span className="score">
                  <span className="score-total">{scoreText}</span>{' '}
                  <span className="score-overs">{overs}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="scorecard-box-right">
            <div className="team team2">
              <div className="team-score">
                <span className="score">
                  <span className="score-total">0-0</span>{' '}
                  <span className="score-overs">(0.0)</span>
                </span>
              </div>
              <div className="team-img">
                <img src="/assets/front/img/ball-icon.png" alt="" />
              </div>
            </div>
          </div>
        </div>
        <div className="scorecard-row team-name-row">
          <div className="team-name">{team1}</div>
          <div className="team-rr">
            <span>CRR {crr}</span>
          </div>
          <div className="team-name">{team2}</div>
        </div>
        <div className="scorecard-row mt-1">
          <div className="scorecard-box-left">
            <div>{showNeeded ? `${team2} Needed ${needsRuns} runs from ${remainBalls} balls` : ''}</div>
          </div>
          <div className="scorecard-box-right">
            <div className="score-runs">
              {ballValues.map((v, i) => (
                <div key={i} className={`ball${v === '4' ? ' four' : v === '6' ? ' six' : ''}`}>{v}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop scorecard */}
      <div className="scorecard scorecard-new d-none d-md-block">
        <div className="scorecard-row">
          <div className="scorecard-box-left">
            <div className="team team1">
              <div className="team-img">
                <img src="/assets/front/img/bat-icon.png" alt="" />
              </div>
              <div className="team-score">
                <span className="score">
                  <span className="score-total">{scoreText}</span>{' '}
                  <span className="score-overs">{overs}</span>
                </span>
                <div className="team-name">{team1}</div>
              </div>
            </div>
            <div className="team-rr">
              <span>CRR {crr}</span>
            </div>
          </div>
          <div className="scorecard-box-left">
            <div className="team team1">
              <div className="team-img">
                <img src="/assets/front/img/ball-icon.png" alt="" />
              </div>
              <div className="team-score">
                <span className="score">
                  <span className="score-total">0-0</span>{' '}
                  <span className="score-overs">(0.0)</span>
                </span>
                <div className="team-name">{team2}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="scorecard-row mt-1">
          <div className="scorecard-box-left">
            <div>{showNeeded ? `${team2} Needed ${needsRuns} runs from ${remainBalls} balls` : ''}</div>
          </div>
          <div className="scorecard-box-right">
            <div className="score-runs">
              {ballValues.map((v, i) => (
                <div key={i} className={`ball${v === '4' ? ' four' : v === '6' ? ' six' : ''}`}>{v}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default SuperOverScorecard;
