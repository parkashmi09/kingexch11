export default function DoliDanaRules() {
  return (
    <div>
      <style>{`
        .rules-section .row.row5 {
          margin-left: -5px;
          margin-right: -5px;
        }
        .rules-section .pl-2 {
          padding-left: .5rem !important;
        }
        .rules-section .pr-2 {
          padding-right: .5rem !important;
        }
        .rules-section .row.row5 > [class*="col-"], .rules-section .row.row5 > [class*="col"] {
          padding-left: 5px;
          padding-right: 5px;
        }
        .rules-section {
          text-align: left;
          margin-bottom: 10px;
        }
        .rules-section .table {
          color: #fff;
          border: 1px solid #444;
          background-color: #222;
          font-size: 12px;
        }
        .rules-section .table td, .rules-section .table th {
          border-bottom: 1px solid #444;
        }
        .rules-section ul li, .rules-section p {
          margin-bottom: 5px;
        }
        .rules-section::-webkit-scrollbar { width: 8px; }
        .rules-section::-webkit-scrollbar-track { background: #666666; }
        .rules-section::-webkit-scrollbar-thumb { background-color: #333333; }
        .rules-section .rules-highlight { color: #FDCF13; font-size: 16px; }
        .rules-section .rules-sub-highlight { color: #FDCF13; font-size: 14px; }
        .rules-section .list-style, .rules-section .list-style li { list-style: disc; }
        .rules-section .rule-card { height: 20px; margin-left: 5px; }
        .rules-section .card-character { font-family: Card Characters; }
        .rules-section .red-card { color: red; }
        .rules-section .black-card { color: black; }
        .rules-section .cards-box {
          background: #fff;
          padding: 6px;
          display: inline-block;
          color: #000;
          min-width: 150px;
        }
      `}</style>

      <div className="rules-section">
        <h6 className="rules-highlight">Winning Dice</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>3:3</li>
          <li>5:5</li>
          <li>6:6</li>
          <li>5:6 or 6:5</li>
        </ul>

        <h6 className="rules-highlight">Losing Dice</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>1:1</li>
          <li>2:2</li>
          <li>4:4</li>
          <li>1:2 or 2:1</li>
        </ul>

        <p>Any other combo (like 2:5, 3:4, etc.):</p>
        <p>* No win / no loss — Dice passes to the next player</p>
        <p><b>•Any Pair</b> : |1:1||2:2||3:3||4:4||5:5||6:6|</p>
        <p><b>•ODD:</b> 3,5,7,9,11 | <b>EVEN:</b> 2,4,6,8,10,12</p>
        <p>•If the Dice total = 7 (e.g., 1:6, 2:5, 3:4, etc.) Bets on Greater than 7 and Less than 7 both lose 50% of the bet Amount.</p>
        <p>Examples: 2:5 = 7 → 50% loss on both &lt;7 and &gt;7</p>
        <p>1:6 = 7 → 50% loss on both &lt;7 and &gt;7</p>
        <p><b>Note</b>: All other bets settle immediately, but the main bet waits until Player A or&nbsp;Player&nbsp;B&nbsp;win/Loss (player&nbsp;Back/Lay).</p>

        <h6 className="rules-highlight">Result Integrity &amp; Error-Correction Policy</h6>
        <ul className="pl-4 pr-4 list-style">
          <li>
            <b>1) Authoritative Result</b><br />
            The Original Dice Number Result generated and recorded by our server is the sole, final, and binding outcome for every round.
          </li>
          <li>
            <b>2) Display Errors &amp; Corrections</b><br />
            If any technical issue causes an incorrect, missing, duplicated, delayed, or otherwise erroneous display of the result, Dolidana Casino may update the displayed result to match the Original Dice Number Result. All settlements (wins/losses/payouts) are made only against the Original Dice Number Result.
          </li>
          <li>
            <b>3) Player Acceptance</b><br />
            By participating, you agree that if a display error occurs, you must accept the corrected/updated result reflecting the Original Dice Number Result, and any settlement made on that basis.
          </li>
        </ul>
      </div>
    </div>
  );
}
