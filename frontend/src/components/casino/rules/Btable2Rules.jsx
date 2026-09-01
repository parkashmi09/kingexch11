export default function Btable2Rules() {
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
      `}</style>

      <div className="rules-section">
        <ul className="pl-4 pr-4 list-style">
          <li>The bollywood table game will be played with a total of 16 cards including (J,Q, K, A) these cards and 2 deck that means game is playing with total 16*2 = 32 cards</li>
          <li>
            <div className="cards-box">
              <span>If the card is</span>
              <span className="card-character black-card ml-1">{'A}'}</span>
              <span>Don Wins</span>
            </div>
          </li>
          <li>
            <div className="cards-box">
              <span>If the card is</span>
              <span className="card-character red-card ml-1">{'A{'}</span>
              <span className="card-character red-card ml-1">{'A['}</span>
              <span className="card-character black-card ml-1">{'A]'}</span>
              <span>Amar Akbar Anthony Wins</span>
            </div>
          </li>
          <li>
            <div className="cards-box">
              <span>If the card is</span>
              <span className="card-character black-card ml-1">{'K}'}</span>
              <span className="card-character black-card ml-1">{'Q}'}</span>
              <span className="card-character black-card ml-1">{'J}'}</span>
              <span>Sahib Bibi aur Ghulam Wins.</span>
            </div>
          </li>
          <li>
            <div className="cards-box">
              <span>If the card is</span>
              <span className="card-character red-card ml-1">{'K['}</span>
              <span className="card-character black-card ml-1">{'K]'}</span>
              <span>Dharam Veer Wins.</span>
            </div>
          </li>
          <li>
            <div className="cards-box">
              <span>If the card is</span>
              <span className="card-character red-card ml-1">{'K{'}</span>
              <span className="card-character black-card ml-1">{'Q]'}</span>
              <span className="card-character red-card ml-1">{'Q['}</span>
              <span className="card-character red-card ml-1">{'Q{'}</span>
              <span>Kis Kisko Pyaar Karoon Wins.</span>
            </div>
          </li>
          <li>
            <div className="cards-box">
              <span>If the card is</span>
              <span className="card-character red-card ml-1">{'J{'}</span>
              <span className="card-character black-card ml-1">{'J]'}</span>
              <span className="card-character red-card ml-1">{'J['}</span>
              <span>Ghulam Wins.</span>
            </div>
          </li>
        </ul>
        <ul className="pl-4 pr-4 list-style">
          <li>
            <b>ODD:</b>
            <span>J K A</span>
          </li>
          <li>
            <b>DULHA DULHAN:</b>
            <span>Q K</span>
            {' '}<span>Payout: 1.97</span>
          </li>
          <li>
            <b>BARATI:</b>
            <span>A J</span>
            {' '}<span>Payout: 1.97</span>
          </li>
          <li>
            <b>RED:</b>
            <span>Payout: 1.97</span>
          </li>
          <li>
            <b>BLACK:</b>
            <span>Payout: 1.97</span>
          </li>
          <li>
            <span>J,Q,K,A</span>
            <div>PAYOUT: 3.75</div>
          </li>
          <li>A = DON</li>
          <li>B = AMAR AKBAR ANTHONY</li>
          <li>C = SAHIB BIBI AUR GHULAM</li>
          <li>D = DHARAM VEER</li>
          <li>E = KIS KISKO PYAAR KAROON</li>
          <li>F = GHULAM</li>
        </ul>
      </div>
    </div>
  );
}
