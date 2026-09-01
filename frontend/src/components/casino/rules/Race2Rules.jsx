export default function Race2Rules() {
  return (
    <>
      <div>
        <div className="rules-section">
          <ul className="pl-4 pr-4 list-style">
            <li>Race to 2nd is a new kind of game and the brilliance of this game will test your nerve.</li>
            <li>In this unique game the player who has the 2nd highest ranking card will be the winner (and not the highest ranking card)</li>
            <li>Race to 2nd is played with a regular single deck of 52 cards.</li>
            <li>This game is played among 4 players :
              <div>Player A, Player B, Player C and Player D</div>
            </li>
            <li><div>All the 4 players will be dealt one card each.</div></li>
            <li><div>The objective of the game is to guess which player will have the 2nd highest ranking card and therefor win.</div></li>
          </ul>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">RANKINGS OF CARDS FROM HIGHEST TO LOWEST :</h6>
          <ul className="pl-4 pr-4 list-style">
            <li>A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2</li>
            <li>Here Ace of spades is the highest ranking card</li>
            <li>And 2 of Diamonds is the lowest ranking card.</li>
            <li>If any two or more players have same hands with the same ranking cards but of different suits the ranking of the players will be decided based on below suits sequence.</li>
          </ul>
        </div>
      </div>
      <div>
        <div className="rules-section">
          <h6 className="rules-highlight">Suit Sequence :</h6>
          <ul className="pl-4 pr-4 list-style">
            <li>
              <div className="cards-box">
                <span className="card-character black-card ml-1">{'}'}</span>
                <span className="ml-3">SPADES</span>
                <span className="ml-3">1st</span>
                <span className="ml-3">( First )</span>
              </div>
            </li>
            <li>
              <div className="cards-box">
                <span className="card-character red-card ml-1">{'{'}</span>
                <span className="ml-3">HEARTS</span>
                <span className="ml-3">2nd</span>
                <span className="ml-3">( Second )</span>
              </div>
            </li>
            <li>
              <div className="cards-box">
                <span className="card-character black-card ml-1">{']'}</span>
                <span className="ml-3">CLUBS</span>
                <span className="ml-3">3rd</span>
                <span className="ml-3">( Third )</span>
              </div>
            </li>
            <li>
              <div className="cards-box">
                <span className="card-character red-card ml-1">{'['}</span>
                <span className="ml-3">DIAMONDS</span>
                <span className="ml-3">4th</span>
                <span className="ml-3">( Fourth )</span>
              </div>
            </li>
            <li>Example 1 :
              <div>If all the players have following hands</div>
              <div>Player A - 5 of Hearts</div>
              <div>Player B - Ace of Hearts</div>
              <div>Player C - 2 of Clubs</div>
              <div>Player D - King of Clubs</div>
              <div>Here all four Players have different hands the ranking of the cards will be as follows :</div>
              <div>Highest Ranking card (1st) will be Ace of Hearts.</div>
              <div>Second Highest Ranking card (2nd) will be King of Clubs.</div>
              <div>Third Highest Ranking card (3rd) will be 5 of Hearts.</div>
              <div>Fourth Highest Ranking card (4th) will be 2 of Clubs.</div>
              <div>Here the second Highest Ranking card is King of Clubs So Player D will be the winner.</div>
            </li>
            <li>Example 2 :
              <div>If all the players have following hands</div>
              <div>Player A - 3 of Spades</div>
              <div>Player B - 3 of Hearts</div>
              <div>Player C - 3 of Clubs</div>
              <div>Player D - 3 of Diamonds</div>
              <div>As here all four players have same hands but of different suits the ranking of the cards will be as follows :</div>
              <div>Highest Ranking card ( 1st ) will be 3 of Spades.</div>
              <div>Second Highest Ranking card (2nd ) will be 3 of Hearts.</div>
              <div>Third Highest Ranking card (3rd) will be 3 of Clubs.</div>
              <div>Fourth Highest Ranking card (4th) will be 3 of Diamonds.</div>
              <div>Here, the second highest ranking card is 3 of Hearts so player B will be the winner.</div>
            </li>
            <li><div>You will have betting options of Back and Lay on every card.</div></li>
            <li><div>In this game there will be no Tie.</div></li>
          </ul>
        </div>
      </div>
    </>
  );
}
