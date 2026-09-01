export default function Joker120Rules() {
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
        .rules-section img {
          max-width: 100%;
        }
      `}</style>
      <div className="rules-section">
        <p>Welcome to Unlimited Joker Teenpatti 20-20, a new version of Joker Teenpatti 20-20.</p>
        <p>Teenpatti games are the most popular on our platforms and we are very excited to announce this new version of Teenpatti called Unlimited Joker Teenpatti. To keep the game as simple as it is and make it more exciting , we have introduced a Joker to the game. The game follows the same standard rules of Teenpatti but at the beginning of the round players can select their own Joker that can act as any missing or highest card to make a high hand to defeat the opponent player OR play regular Teenpatti without selecting any Joker.</p>
        <p>For Example:</p>
        <img src="https://sitethemedata.com/casino-new-rules-images/joker1.jpg" className="img-fluid" alt="Joker Example 1" />
        <p>Player A wins because THE JOKER can act as the highest card.</p>
        <img src="https://sitethemedata.com/casino-new-rules-images/joker2.jpg" className="img-fluid" alt="Joker Example 2" />
        <p>Player A wins because THE JOKER can act as the highest color card.</p>
        <h4>Standard Rules.</h4>
        <div>
          <img src="https://sitethemedata.com/v3/static/front/img/casino-rules/teen6.jpg" className="img-fluid" alt="Teenpatti Hand Rankings" />
        </div>
      </div>
    </div>
  );
}
