import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

const MogamboCards = memo(function MogamboCards({ cardString = '' }) {
  const codes = parseCards(cardString);

  const dagaTeja = [codes[0] || '1', codes[1] || '1'];
  const mogamboCard = codes[2] || '1';

  return (
    <div className="casino-video-cards-container">
      <h5 className="dealer-name">Daga / Teja</h5>
      <div>
        <span><img src={cardSrc(dagaTeja[0])} alt={dagaTeja[0]} /></span>
        <span className="card-devider"></span>
        <span><img src={cardSrc(dagaTeja[1])} alt={dagaTeja[1]} /></span>
      </div>
      <h5 className="dealer-name">Mogambo</h5>
      <div>
        <span><img src={cardSrc(mogamboCard)} alt={mogamboCard} /></span>
      </div>
    </div>
  );
});

export default MogamboCards;
