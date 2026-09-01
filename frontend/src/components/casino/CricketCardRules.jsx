import { memo } from 'react';

const CARD_RULES = [
  { card: 'cardA', count: 5, ballImg: 'ball1', label: null },
  { card: 'card2', count: 5, ballImg: 'ball2', label: null },
  { card: 'card3', count: 5, ballImg: 'ball3', label: null },
  { card: 'card4', count: 5, ballImg: 'ball4', label: null },
  { card: 'card6', count: 5, ballImg: 'ball6', label: null },
  { card: 'card10', count: 5, ballImg: 'ball0', label: null },
  { card: 'cardK', count: 5, ballImg: 'wicket', label: 'WICKET' },
];

const CricketCardRules = memo(function CricketCardRules({ team1, team2 }) {
  return (
    <div className="mt-2 cricket-rule casino-place-bet">
      <div className="casino-place-bet-title text-center">
        {team1} vs {team2}<br />Inning&apos;s Card Rules
      </div>
      <div className="card">
        <div className="card-header">
          <div className="row row5 mt-1">
            <div className="col-4">Cards</div>
            <div className="col-3 text-center">Count</div>
            <div className="col-5 text-right">Value</div>
          </div>
        </div>
        <div className="card-body">
          {CARD_RULES.map((rule) => (
            <div key={rule.card} className="row row5 mt-1">
              <div className="col-4">
                <img src={`/assets/front/img/superOver/cards/${rule.card}.png`} alt={rule.card} />
                <span className="ml-2">X</span>
              </div>
              <div className="col-3 text-center">{rule.count}</div>
              <div className="col-5 text-right value">
                {rule.label && <>{rule.label} </>}
                <img src={`/assets/front/img/superOver/balls/${rule.ballImg}.png`} alt={rule.ballImg} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default CricketCardRules;
