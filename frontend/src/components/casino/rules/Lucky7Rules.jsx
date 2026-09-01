// `.rules-section` styling is NOT in the ported stylesheets — the reference
// ships it inline with each rules block, which is why 23 of the sibling rules
// components carry this same <style>. Lucky7Rules was one of the ones missing
// it, so its modal rendered unstyled on /casino/lucky7 too.
export default function Lucky7Rules() {
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
      <ul className="pl-4 pr-4 list-style">
        <li>Lucky 7 is a 8 deck playing cards game, total 8 * 52 = 416 cards.</li>
        <li>If the card is from ACE to 6, LOW Wins.</li>
        <li>If the card is from 8 to KING, HIGH Wins.</li>
        <li>If the card is 7, bets on high and low will lose 50% of the bet amount.</li>
      </ul>
      <div>
        <b className="rules-sub-highlight">LOW:</b>1,2,3,4,5,6 | <b className="rules-sub-highlight">HIGH:</b>8,9,10,J,Q,K
      </div>
      <div>Payout:2.0</div>
      <br />
      <div>
        <b className="rules-sub-highlight">EVEN:</b>2,4,6,8,10,Q
      </div>
      <div>Payout:2.10</div>
      <br />
      <div>
        <b className="rules-sub-highlight">ODD:</b>1,3,5,7,9,J,K
      </div>
      <div>Payout:1.79</div>
      <br />
      <div>
        <b className="rules-sub-highlight">RED:</b>
      </div>
      <div>Payout:1.95</div>
      <br />
      <div>
        <b className="rules-sub-highlight">BLACK:</b>
      </div>
      <div>Payout:1.95</div>
      <br />
        <b className="rules-sub-highlight">CARDS:</b>1,2,3,4,5,6,7,8,9,10,J,Q,K
        <div>PAYOUT: 12.0</div>
      </div>
    </div>
  );
}
