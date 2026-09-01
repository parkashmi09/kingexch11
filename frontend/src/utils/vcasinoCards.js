// Card helpers for the Virtual Casino family (/vcasino/*).
//
// The feed ships one card string per round. "1" is the face-down back; a real
// card is a rank followed by a DOUBLED suit letter — "10SS", "ADD", "JCC",
// "6SS" (verified live across four rounds). Art lives in public/assets/cards
// under exactly those names, so the string doubles as the filename.

export const CARD_BASE = '/assets/cards';
export const FACE_DOWN = '1';

/** Background art for a card string. Falls back to the face-down back. */
export const cardSrc = (card) => `${CARD_BASE}/${card || FACE_DOWN}.png`;

/** True while the round is still running — the feed sends "1" until reveal. */
export const isFaceDown = (card) => !card || card === FACE_DOWN;

const SUITS = { SS: 'spade', HH: 'heart', CC: 'club', DD: 'diamond' };

/** "10SS" -> { rank: '10', suit: 'spade' }. Face-down/blank -> nulls. */
export function parseCard(card) {
  if (isFaceDown(card)) return { rank: null, suit: null };
  const key = String(card).slice(-2).toUpperCase();
  return { rank: String(card).slice(0, -2), suit: SUITS[key] || null };
}

// A=1 … K=13. Lucky 7 splits on this: A-6 low, 7 tie, 8-K high — the board's
// own "A TO 6 / TIE / 8 TO K" heading.
const RANK_VALUE = {
  A: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7,
  8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13,
};

export const rankValue = (rank) => RANK_VALUE[String(rank).toUpperCase()] ?? 0;

/**
 * 'low' | 'tie' | 'high' | null — the class the reference puts on .flip-card
 * (`flip-card show low`) and the side the winner trophy leans to.
 */
export function lucky7Side(card) {
  const { rank } = parseCard(card);
  if (!rank) return null;
  const v = rankValue(rank);
  if (!v) return null;
  if (v === 7) return 'tie';
  return v < 7 ? 'low' : 'high';
}
