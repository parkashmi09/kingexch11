import { memo } from 'react';

const BetChip = memo(function BetChip({ amount, color = '#1f6179', selected, onClick }) {
  return (
    <div className={`casino-coin${selected ? ' selected' : ''}`} onClick={onClick}>
      <div className="bet-chip-holder" style={{ '--g-chip-inner-color': color }}>
        <div className="bet-chip">
          <div className="bet-chip-front"></div>
          <div className="bet-chip-top"></div>
          <div className="bet-chip-amount">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 108 108" className="bet-chip-amount-in">
              <text x="50%" y="53.5%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="700" className="bet-chip-amount-label">
                {amount}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BetChip;
