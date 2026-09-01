import { memo } from 'react';

const CasinoCards = memo(function CasinoCards({ cardString = '' }) {
  const codes = cardString ? cardString.split(',') : [];

  // Player A: indices 0, 2, 4 — Player B: indices 1, 3, 5
  const playerA = [codes[0], codes[2], codes[4]].filter(Boolean);
  const playerB = [codes[1], codes[3], codes[5]].filter(Boolean);

  const cardSrc = (code) => `/assets/cards/${code === '1' ? '1' : code}.png`;

  return (
    <div className="casino-video-cards">
      <div className="casino-cards-shuffle">
        <i className="fas fa-grip-lines-vertical" />
      </div>
      <div className="casino-video-cards-container">
        <div>
          {playerA.map((code, i) => (
            <span key={i}>
              <img src={cardSrc(code)} alt={code} />
            </span>
          ))}
        </div>
        <div>
          {playerB.map((code, i) => (
            <span key={i}>
              <img src={cardSrc(code)} alt={code} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default CasinoCards;
