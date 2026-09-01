function buildInnings(score, inning) {
  const balls = (score || []).filter(b => b.ing === inning).sort((a, b) => {
    if (a.oc !== b.oc) return a.oc - b.oc;
    return a.cid - b.cid;
  });
  if (!balls.length) return null;

  const teamName = balls[0]?.nat || (inning === 1 ? 'Team 1' : 'Team 2');
  const overs = {};
  balls.forEach(b => {
    if (!overs[b.oc]) overs[b.oc] = [];
    overs[b.oc].push(b);
  });

  let totalRuns = 0;
  let totalWkts = 0;
  const overRows = Object.keys(overs).sort((a, b) => a - b).map(oc => {
    const overBalls = overs[oc];
    const overRuns = overBalls.reduce((s, b) => s + (b.wkt ? 0 : b.run), 0);
    const overWkts = overBalls.filter(b => b.wkt).length;
    totalRuns += overRuns;
    totalWkts += overWkts;
    // Pad to 6 balls
    const padded = [...overBalls];
    while (padded.length < 6) padded.push(null);
    return { oc, balls: padded.slice(0, 6), overRuns, totalRuns, totalWkts };
  });

  return { teamName, overRows };
}

function BallCell({ ball }) {
  if (!ball) return <td className="text-center"><span>-</span></td>;
  if (ball.wkt) return <td className="text-center"><span className="text-playerb">ww</span></td>;
  return <td className="text-center"><span>{ball.run}</span></td>;
}

function InningsTable({ data, label }) {
  if (!data) return null;
  return (
    <div className="mt-2">
      <h4>{label}</h4>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>{data.teamName}</th>
              <th className="text-center">1</th>
              <th className="text-center">2</th>
              <th className="text-center">3</th>
              <th className="text-center">4</th>
              <th className="text-center">5</th>
              <th className="text-center">6</th>
              <th className="text-center">Run/Over</th>
              <th className="text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.overRows.map(row => (
              <tr key={row.oc}>
                <td>Over {row.oc}</td>
                {row.balls.map((b, j) => <BallCell key={j} ball={b} />)}
                <td className="text-center">{row.overRuns}</td>
                <td className="text-center">{row.totalRuns}/{row.totalWkts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FiveCricketResult({ detail }) {
  const rdesc = detail?.rdesc || '';
  const winnat = detail?.winnat || '';
  const score = detail?.score || [];

  const inn1 = buildInnings(score, 1);
  const inn2 = buildInnings(score, 2);

  return (
    <div className="row row5 mt-2 five-cricket-result">
      <div className="col-12">
        <div className="text-right mt-3 score-head">
          Winner: <span className="text-success">{winnat}</span>
          {rdesc && <> | {rdesc}</>}
        </div>
        <InningsTable data={inn1} label="First Inning" />
        <InningsTable data={inn2} label="Second Inning" />
      </div>
    </div>
  );
}
