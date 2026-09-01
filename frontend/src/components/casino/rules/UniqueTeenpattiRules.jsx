export default function UniqueTeenpattiRules() {
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
        <p>Welcome to Unique Teenpatti, a new variation of Teenpatti.</p>
        <p>We are excited to introduce you to a new variation of Teenpatti game <b>Unique Teenpatti.</b> The game follows the same standard rules of Teenpatti but at the beginning of the round the player has a chance to select their own three cards from six cards on the table. Once a player selects their three cards from six cards on the table, the other three cards belong to the opponent player. After card selection is done, the dealer will deal six cards on the table to decide the winner. Good Luck and wind BIG!!!.</p>
        <h4>Standard Rules:</h4>
        <div>
          <img src="https://sitethemedata.com/v3/static/front/img/casino-rules/teen6.jpg" className="img-fluid" alt="Teenpatti Hand Rankings" />
        </div>
      </div>
    </div>
  );
}
