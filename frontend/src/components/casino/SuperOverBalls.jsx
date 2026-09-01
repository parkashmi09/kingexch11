import { memo } from 'react';

/**
 * Parses a pipe-separated card string into an array of exactly 4 entries.
 * Each entry is either a card code string or null (for unplayed balls).
 * Code "1" means face-down / not yet played.
 */
function parseBalls(cardString) {
  const raw = cardString ? cardString.split('|') : [];
  const balls = [];
  for (let i = 0; i < 4; i++) {
    const code = raw[i] || null;
    balls.push(code === '1' || !code ? null : code);
  }
  return balls;
}

/**
 * Extracts the rank from a card code like "AHH" → "A", "10HH" → "10", "KSS" → "K".
 * Returns null when code is empty or face-down.
 */
function rankFromCode(code) {
  if (!code) return null;
  // Card code format: rank + suit chars, e.g. "AHH", "10HH", "KSS", "3DD"
  // Rank is everything before the first suit character (HH, DD, CC, SS)
  const match = code.match(/^(\d+|[AJQK])/);
  return match ? match[1] : null;
}

/**
 * Maps a card rank to the ball image filename.
 * "10" → "0.png" (dot ball), "K" → "wicket.png", others → "{rank}.png"
 */
function ballImage(rank) {
  if (!rank) return null;
  return `/assets/front/img/superOver/balls/${rank}.png`;
}

const SuperOverBalls = memo(function SuperOverBalls({ cardString }) {
  const balls = parseBalls(cardString);

  return (
    <div className="casino-video-cards-container">
      {balls.map((code, i) => {
        const rank = rankFromCode(code);
        const src = ballImage(rank);
        return (
          <div key={i}>
            <span>
              {src && <img src={src} alt={rank || ''} />}
            </span>
          </div>
        );
      })}
    </div>
  );
});

export default SuperOverBalls;
export { parseBalls, rankFromCode, ballImage };
