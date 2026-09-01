import { memo } from 'react';
import { cardSrc, parseCards } from './cardUtils';

/**
 * 32 Cards A card layout — 4 players, 1 card each with player name and score.
 * Player 8: index 0
 * Player 9: index 1
 * Player 10: index 2
 * Player 11: index 3
 *
 * The score is computed from the card value. The player(s) with the highest
 * score get the text-success class on their name span.
 *
 * Used by: card32, card32eu
 */

const NUM_PLAYERS = 4;
const PLAYERS = [
  { label: 'Player 8', defaultPoints: 8 },
  { label: 'Player 9', defaultPoints: 9 },
  { label: 'Player 10', defaultPoints: 10 },
  { label: 'Player 11', defaultPoints: 11 },
];

/**
 * Extract numeric score from a card code per 32 Cards rules:
 * 6-10 = face value, J=11, Q=12, K=13, A=1
 */
function cardScore(code) {
  if (!code || code === '1' || code === '0') return 0;
  const rank = code.slice(0, -2).toUpperCase();
  if (rank === 'A') return 1;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  const n = parseInt(rank, 10);
  return isNaN(n) ? 0 : n;
}

/** Get all dealt cards for a player (round-robin: player 0 gets indices 0,4,8,...) */
function getPlayerCards(codes, playerIdx) {
  const cards = [];
  for (let i = playerIdx; i < codes.length; i += NUM_PLAYERS) {
    const c = codes[i];
    if (!c || c === '1' || c === '0') break;
    cards.push(c);
  }
  return cards;
}

const Card32Cards = memo(function Card32Cards({ cardString = '' }) {
  const codes = parseCards(cardString);

  const playerData = PLAYERS.map((p, idx) => {
    const cards = getPlayerCards(codes, idx);
    const cardTotal = cards.reduce((sum, c) => sum + cardScore(c), 0);
    const score = p.defaultPoints + cardTotal;
    return { label: p.label, cards, score };
  });

  const maxScore = Math.max(...playerData.map((p) => p.score));
  const hasCards = playerData.some((p) => p.cards.length > 0);

  return (
    <div className="casino-video-cards-container">
      {playerData.map((p) => {
        const isWinner = hasCards && p.score === maxScore && p.score > 0;
        // Show the last dealt card image
        const lastCard = p.cards.length > 0 ? p.cards[p.cards.length - 1] : null;
        return (
          <div key={p.label}>
            <div className="dealer-name w-100 mb-1">
              <span className={isWinner ? 'text-success' : ''}>{p.label}:</span>
              {' '}<span className="text-warning"> {p.score}</span>
            </div>
            {lastCard && (
              <div>
                <span><img src={cardSrc(lastCard)} alt={lastCard} /></span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default Card32Cards;
