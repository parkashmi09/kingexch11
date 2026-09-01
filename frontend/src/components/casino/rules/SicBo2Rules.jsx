export default function SicBo2Rules() {
  return (
    <>
      <style>{`
        .rules-section .row.row5 { margin-left: -5px; margin-right: -5px; }
        .rules-section .pl-2 { padding-left: .5rem !important; }
        .rules-section .pr-2 { padding-right: .5rem !important; }
        .rules-section .row.row5>[class*="col-"],
        .rules-section .row.row5>[class*="col"] { padding-left: 5px; padding-right: 5px; }
        .rules-section { text-align: left; margin-bottom: 10px; }
        .rules-section .table { color: #fff; border: 1px solid #444; background-color: #222; font-size: 12px; }
        .rules-section .table td, .rules-section .table th { border-bottom: 1px solid #444; }
        .rules-section ul li, .rules-section p { margin-bottom: 5px; }
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
        .rules-section .cards-box { background: #fff; padding: 6px; display: inline-block; color: #000; min-width: 150px; }
        .rules-section img { max-width: 100%; }
      `}</style>

      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Game Rules : </h6>
          <ul className="pl-4 pr-4 list-style">
            <li>This casino operates similarly to Sicbo, with the key difference being that each round alternates between two Sicbo machines. For example, the first round will start on the first machine, the second round on the second machine, and this alternating pattern will continue throughout the game.</li>
            <li>Sic Bo is an exciting game of chance played with three regular dice with face value 1 to 6. The objective of Sic Bo is to predict the outcome of the shake of the three dice.</li>
            <li>After betting time has expired, the dice are shaken in a dice shaker. A number of bet spots — from zero to several — then have multipliers randomly applied to them before the dice come to rest and the result is known. If the player's bet is placed on the bet spot with the applied multiplier, your bet is multiplied accordingly.</li>
          </ul>
        </div>
      </div>

      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Bet Type : </h6>
          <ul className="pl-4 pr-4 list-style">
            <li>You can place many kinds of bets on the Sic Bo table, and each type of bet has its own payout. Your bet is returned on top of your winnings.
              <ul className="pl-4 pr-4 list-style">
                <li><span><strong>Small/Big</strong> — place your bet on the total of the three dice being Small (4–10) or Big (11–17). Wins pay 1:1, but these bets lose to any Triple.</span></li>
                <li><span><strong>Even/Odd</strong> — place your bet on the total of the three dice being Odd or Even. Wins pay 1:1, but these bets lose to any Triple.</span></li>
                <li><span><strong>Total</strong> — place your bet on any of the 14 betting areas labelled 4–17. Total is the total of the three dice and excludes 3 and 18. You win if the total of the three dice adds up to the Total number on which you placed your bet. Payouts vary depending on the winning total.</span></li>
                <li>
                  <span><strong>Single</strong> — place your bet on any of the six betting areas labelled ONE, TWO, THREE, FOUR, FIVE and SIX, which represent the six face values of a dice.</span>
                  <ul className="singleBets--2f9e7">
                    <li><span>If 1 of 3 dice shows the number you bet on, you get paid 1:1.</span></li>
                    <li><span>If 2 of 3 dice show the number you bet on, you get paid 2:1.</span></li>
                    <li><span>If all 3 dice show the number you bet on, you get paid 3:1.</span></li>
                  </ul>
                </li>
                <li><span><strong>Double</strong> — place your bet on any of the six Double-labelled betting areas. To win, 2 of 3 dice must show the same number. Wins pay 8:1. Please note that regardless of whether 2 or 3 dice show the same number, the payout remains the same.</span></li>
                <li><span><strong>Triple</strong> — place your bet on any of the six Triple-labelled betting areas. To win, all 3 dice must match the number chosen, and you get paid 150:1.</span></li>
                <li><span><strong>Any Triple</strong> — place your bet on this box to cover all six different Triple bets at once. To win, all three dice must show the same number, and you get paid 30:1.</span></li>
                <li><span><strong>Combination</strong> — place your bet on any or all 15 possible 2 dice combinations. Wins pay 5:1.</span></li>
              </ul>
            </li>
            <li>After the betting is closed, random bet spots will be highlighted showing the multiplied payouts.</li>
          </ul>
        </div>
      </div>

      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Winning Numbers : </h6>
          <ul className="pl-4 pr-4 list-style">
            <li>The WINNING NUMBERS display shows the most recent winning numbers.</li>
            <li>The result of the most recently completed round is listed on the left: the total of the three dice on the upper line, following with the result of three individual dice below.</li>
          </ul>
        </div>
      </div>

      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Statistics : </h6>
          <ul className="pl-4 pr-4 list-style">
            <li>In the roadmap below, the Winning numbers are displayed in the patterns of Small (S), Big (B), and Triple (T) results. Each cell represents the result of a past round. The result of the earliest round is recorded in the upper left corner. Read the column downwards all the way to the bottom; then start at the top of the adjacent column to the right, and so forth.</li>
            <li>This representation may be of help to you in predicting the results of future rounds.</li>
            <li>Below the roadmap, you can see the statistics of Small, Big, and Triple bets for the last 50 rounds.</li>
          </ul>
        </div>
      </div>

      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Payouts : </h6>
          <ul>
            <li>Your payout depends on the type of bet placed. The payout range depends on whether the bet you have placed on the bet spot of your choice has a multiplier applied to it. If there is no multiplier, then the regular payout is applied. Your bet is returned on top of your winnings.</li>
          </ul>
          <table className="table">
            <thead>
              <tr>
                <th>Bet</th>
                <th>Payout</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Small/Big</td><td>1:1</td></tr>
              <tr><td>Even/Odd</td><td>1:1</td></tr>
              <tr><td>Double</td><td>8:1</td></tr>
              <tr><td>Triple</td><td>150:1</td></tr>
              <tr><td>Any Triple</td><td>30:1</td></tr>
              <tr><td>Total 4 or 17</td><td>50:1</td></tr>
              <tr><td>Total 5 or 16</td><td>20:1</td></tr>
              <tr><td>Total 6 or 15</td><td>15:1</td></tr>
              <tr><td>Total 7 or 14</td><td>12:1</td></tr>
              <tr><td>Total 8 or 13</td><td>8:1</td></tr>
              <tr><td>Total 9 or 12</td><td>6:1</td></tr>
              <tr><td>Total 10 or 11</td><td>6:1</td></tr>
              <tr><td>Combination</td><td>5:1</td></tr>
              <tr>
                <td colSpan="2">
                  <div className="d-flex justify-content-between">
                    <div>
                      <ul className="list-style">
                        <li>Single</li>
                        <li>Double</li>
                        <li>Triple</li>
                      </ul>
                    </div>
                    <div>
                      <div>1:1</div>
                      <div>2:1</div>
                      <div>3:1</div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <p>Malfunction voids all pays and play.</p>
        </div>
      </div>
    </>
  );
}
