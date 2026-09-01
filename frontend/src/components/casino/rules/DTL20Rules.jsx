export default function DTL20Rules() {
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
        .rules-section .list-style, .rules-section .list-style li {
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
      `}</style>
      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>20-20 DTL(Dragon Tiger Lion) is a 52 playing cards game, In DTL game 3 hands are dealt: for each 3 player. The player will bets which will win.</li>
          <li>The ranking of cards is, from lowest to highest: Ace, 2, 3, 4, 5, 6, 7,8, 9, 10, Jack, Queen and King when Ace is "1" and King is "13".</li>
          <li>On same card with different suit, Winner will be declare based on below winning suit sequence.
            <p>
              <div className="cards-box">
                <span className="card-character black-card ml-1">{'1}'}</span>
                <span>1st</span>
              </div>
            </p>
            <p>
              <div className="cards-box">
                <span className="card-character red-card ml-1">{'1{'}</span>
                <span>2nd</span>
              </div>
            </p>
            <p>
              <div className="cards-box">
                <span className="card-character black-card ml-1">{'1]'}</span>
                <span>3rd</span>
              </div>
            </p>
            <p>
              <div className="cards-box">
                <span className="card-character red-card ml-1">{'1['}</span>
                <span>4th</span>
              </div>
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}
