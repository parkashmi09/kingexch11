export default function SuperOver3Rules() {
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
        <ul className="pl-2 pr-2">
          <li>Mini Super Over is a shorter version of super over cricket.</li>
          <li>This game is played between two teams. Team batting first is India and team batting second is Australia.</li>
          <li>Mini Super over is a four Ball each side match.</li>
          <li>This game is played with 21 card deck.
            <ul className="pl-2 pr-2">
              <li>A = (One run) X 3 cards</li>
              <li>2 = (Two runs) X 3 cards</li>
              <li>3 = (Three runs) X 3 cards</li>
              <li>4 = (Four runs) X 3 cards</li>
              <li>6 = (Six runs) X 3 cards</li>
              <li>10 = (0 run) X 3 cards</li>
              <li>K = (wicket) X 3 cards</li>
              <li>21 cards total</li>
            </ul>
          </li>
          <li>If wicket falls at any stage of the innings the team batting will be considered as all out.</li>
          <li>If scores of both the teams are equal then the match will be considered as Tie.</li>
          <li>Difference of wicket between teams does not count.</li>
          <li>Session and Fancy markets will be considered valid though the match ends in Tie.</li>
          <li>Team Scoring maximum runs will be the winner.</li>
          <li>At the end of each inning deck will be shuffled.</li>
          <li>Odds will be available for every ball.</li>
          <li>Term boundary in fancy market defines four &amp; six both or scoring four runs or six runs both will be considered as boundary.</li>
        </ul>
      </div>
    </div>
  );
}
