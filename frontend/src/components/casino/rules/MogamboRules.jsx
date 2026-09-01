export default function MogamboRules() {
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
          <li>1. Mogambo game is played with regular 52 cards deck between Daga/Teja&nbsp;and&nbsp;Mogambo.</li>
          <li>2. The objective of the game is to make Highest ranking card to win.</li>
          <li>3. Cards are ranked from lowest to highest:
            <p>2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A (Ace is the highest card)</p>
          </li>
          <li>4. On same card with different suit, Winner will be declare based
            <p>on below winning suit sequence.</p>
            <p>(Spade,Heart,Club,Diamond)</p>
            <div><img src="https://sitethemedata.com/casino-rules/mogambo/img1.jpg" alt="" /></div>
          </li>
          <li>5. Card Deal:
            <p>Daga/Teja is dealt 2 cards,</p>
            <p>Mogambo is dealt 1 card.</p>
          </li>
          <li>6. To decide the winner of the round, each cards are compared separately with the higher-value card between Daga/Teja&nbsp;and&nbsp;Mogambo.</li>
          <li>7. Example Round
            <p>Daga/Teja reveals K<span className="card-character ml-1">{'}'}</span> and 10<span className="card-character red-black ml-1">{']'}</span>.</p>
            <p>Mogambo reveals Q<span className="card-character ml-1">{'['}</span>.</p>
            <p>The highest card for Daga/Teja is K<span className="card-character ml-1">{'}'}</span>. Therefore, the winner is Daga/Teja.</p>
          </li>
        </ul>
        <br />
        <p>*****************</p>
        <br />
        <p>3 Card Total : Total sum&nbsp;of&nbsp;your&nbsp;3&nbsp;cards</p>
        <p>Card Value : A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K,</p>
        <p>(Ace Value is 1 - K value is 13)</p>
        <p>Note : If the game is completed before the 3 cards are revealed, the 3 card Total bets&nbsp;is&nbsp;returned.</p>
      </div>
    </div>
  );
}
