export default function Lucky6Rules() {
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
        .rules-section img { max-width: 100%; }
      `}</style>

      <div className="rules-section">
        <p>* Lucky 6 is a 8 deck playing cards game, total 8 * 44 = 352 cards.<br />
          (Deck count A,1,2,3,4,5,6,7,8,9,10,j cards only)</p>
        <p>* If the card is from ACE to 5, LOW Wins.</p>
        <p>* If the card is from 7 to Jack, HIGH Wins.</p>
        <p>* If the card is 6, bets on high and low will lose 50% of the bet amount.</p>
        <br />
        <p>LOW: 1,2,3,4,5  |  HIGH:7,8,9,10,J<br />Payout : 2.0</p>
        <br />
        <p>EVEN : 2,4,6,8,10<br />Payout : 2.1</p>
        <br />
        <p>ODD : 1,3,5,7,9,J<br />Payout : 1.79</p>
        <br />
        <p>RED :<span className="d-inline-block cards-box"> <span className="card-character red-card ml-1">{'{'}</span> Heart, <span className="card-character red-card ml-1">{'['}</span> Diamond</span><br />Payout :1.95</p>
        <br />
        <p>BLACK :  <span className="d-inline-block cards-box"><span className="card-character black-card ml-1">{'}'}</span>Spade, <span className="card-character black-card ml-1">{']'}</span> Club</span><br />Payout :1.95</p>
        <br />
        <p>CARDS :1,2,3,4,5,6,7,8,9,10,J<br />
          Payout&nbsp;:&nbsp;10.0</p>
      </div>
    </div>
  );
}
