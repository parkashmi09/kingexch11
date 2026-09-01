export default function PoisonRules() {
  return (
    <div>
      <style>{`
        .rules-section .row.row5 { margin-left: -5px; margin-right: -5px; }
        .rules-section .pl-2 { padding-left: .5rem !important; }
        .rules-section .pr-2 { padding-right: .5rem !important; }
        .rules-section .row.row5 > [class*="col-"], .rules-section .row.row5 > [class*="col"] { padding-left: 5px; padding-right: 5px; }
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
      `}</style>

      <div className="rules-section">
        <p>Welcome to <b>Teenpatti Poison ONE DAY</b>, a new variation of Teenpatti.</p>
        <p>As Teenpatti games are becoming more and more famous and popular on our platforms, we are excited to introduce you to <b>Teenpatti Poison ONE DAY</b>. The game follows the same standard rules of Teenpatti but at the beginning of the round the dealer draws a <b>Poison</b> card before dealing to the players. <b>The Poison</b> card is toxic and makes the player lose as soon as any player gets it. If no <b>Poison</b> card is dealt then the game continues as per Teenpatti standard rules.</p>
        <p>For Example:</p>
        <img src="https://sitethemedata.com/casino-new-rules-images/joker3.jpg" className="img-fluid" alt="" />
        <p>Player A wins because Player B is dealt with <b>THE POISON</b> card.</p>
        <h4>Standard Rules.</h4>
        <div>
          <img src="https://sitethemedata.com/v3/static/front/img/casino-rules/teen6.jpg" className="img-fluid" alt="" />
        </div>
      </div>
    </div>
  );
}
