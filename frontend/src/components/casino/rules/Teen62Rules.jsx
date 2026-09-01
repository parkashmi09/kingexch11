export default function Teen62Rules() {
  return (
    <>
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
          .rules-section .row.row5>[class*="col-"],
          .rules-section .row.row5>[class*="col"] {
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
          .rules-section .table td,
          .rules-section .table th {
            border-bottom: 1px solid #444;
          }
          .rules-section ul li,
          .rules-section p {
            margin-bottom: 5px;
          }
          .rules-section::-webkit-scrollbar {
            width: 8px;
          }
          .rules-section::-webkit-scrollbar-track {
            background: #666666;
          }
          .rules-section::-webkit-scrollbar-thumb {
            background-color: #333333;
          }
          .rules-section .rules-highlight {
            color: #FDCF13;
            font-size: 16px;
          }
          .rules-section .rules-sub-highlight {
            color: #FDCF13;
            font-size: 14px;
          }
          .rules-section .list-style,
          .rules-section .list-style li {
            list-style: disc;
          }
          .rules-section .rule-card {
            height: 20px;
            margin-left: 5px;
          }
          .rules-section .card-character {
            font-family: Card Characters;
          }
          .rules-section .red-card {
            color: red;
          }
          .rules-section .black-card {
            color: black;
          }
          .rules-section .cards-box {
            background: #fff;
            padding: 6px;
            display: inline-block;
            color: #000;
            min-width: 150px;
          }
          .rules-section img {
            max-width: 100%;
          }
        `}</style>
        <div className="rules-section">
          <ul className="pl-4 pr-4 list-style">
            <li>Teenpatti is an indian origin three cards game.</li>
            <li>This game is played with a regular 52 cards deck between Player A and Player B.</li>
            <li>The objective of the game is to make the best three cards hand as per the hand rankings and win.</li>
            <li>You have a betting option of Back and Lay for the main bet.</li>
            <li>Rankings of the card hands from highest to lowest :</li>
            <li>1. Straight Flush (pure Sequence)</li>
            <li>2. Trail (Three of a Kind)</li>
            <li>3. Straight (Sequence)</li>
            <li>4. Flush (Color)</li>
            <li>5. Pair (Two of a kind)</li>
            <li>6. High Card</li>
          </ul>
          <div>
            <img
              src="https://sitethemedata.com/v3/static/front/img/casino-rules/teen6.jpg"
              className="img-fluid"
              alt="Teenpatti Hand Rankings"
            />
          </div>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <div>
            <h6 className="rules-highlight">Side bets :</h6>
          </div>
          <ul className="pl-4 pr-4 list-style">
            <li><b>CONSECUTIVE CARDS:</b> It is a bet of having two or more consecutive cards in the game.</li>
            <li>eg: 2,3,5      10,3,9      Q,5,K     6,7,8    A,K,7</li>
            <li>For both the players Back and Lay odds are available, you can bet on either or both the players.</li>
            <li><b>Odd - Even :</b> Here you can bet on every card whether it will be an odd card or an even card.</li>
            <li><b>ODD CARDS :</b> A,3,5,7,9,J,K</li>
            <li><b>EVEN CARDS:</b> 2,4,6,8,10,Q</li>
            <li><b>NOTE:</b> In case of a Tie between the player A and player B bets placed on player A and player B (Main bets) will be returned. (Pushed)</li>
          </ul>
        </div>
      </div>
    </>
  );
}
