export default function SuperOverResult({ detail }) {
  const scores = detail?.score || [];
  const inn1 = scores.filter((s) => s.ing === 1);
  const inn2 = scores.filter((s) => s.ing === 2);
  const team1Name = inn1[0]?.nat || 'IND';
  const team2Name = inn2[0]?.nat || 'AUS';
  const inn1Runs = inn1.reduce((s, b) => s + (b.run || 0), 0);
  const inn1Wkts = inn1.filter((b) => b.wkt).length;
  const inn2Runs = inn2.reduce((s, b) => s + (b.run || 0), 0);
  const inn2Wkts = inn2.filter((b) => b.wkt).length;
  const winnerText = detail?.winnat || '';

  const renderInning = (label, teamName, balls, totalRuns, totalWkts) => (
    <div className="mt-2">
      <h4>{label}</h4>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>{teamName}</th>
              <th className="text-center">1</th>
              <th className="text-center">2</th>
              <th className="text-center">3</th>
              <th className="text-center">4</th>
              <th className="text-center">Run/Over</th>
              <th className="text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Over 1</td>
              {[0, 1, 2, 3].map((i) => {
                const b = balls[i];
                if (!b) return <td key={i} className="text-center"></td>;
                const display = b.wkt ? 'ww' : String(b.run);
                return (
                  <td key={i} className="text-center">
                    <span className={b.wkt ? 'text-playerb' : ''}>{display}</span>
                  </td>
                );
              })}
              <td className="text-center">{totalRuns}</td>
              <td className="text-center">{totalRuns}/{totalWkts}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="row row5 mt-2 five-cricket-result">
      <div className="col-12">
        <div className="text-right mt-3 score-head">
          Winner: <span className="text-success">{winnerText}</span>
          {' '}| {team1Name} : {inn1Runs} | {team2Name} : {inn2Runs}
        </div>
        {renderInning('First Inning', team1Name, inn1, inn1Runs, inn1Wkts)}
        {renderInning('Second Inning', team2Name, inn2, inn2Runs, inn2Wkts)}
      </div>
    </div>
  );
}
