// Playing cards, the casino site's way: assets/cards/<suit><rank>_.png
// (S/H/C/D, A 2…10 J Q K), 0.png for a card still face down.
const BASE = '/kingexch/casino-site/assets/';

export const cardImg = (code) => `${BASE}cards/${code || '0'}.png`;

// A tenexch card ("10DD", "ASS", "KHH"; "1" = not dealt yet) → the casino
// site's code ("D10_", "SA_", "HK_"), or "0" for a face-down card.
export function cardCode(t) {
  const m = /^(10|[2-9AJQK])(SS|HH|CC|DD)$/.exec(String(t || '').trim());
  return m ? `${m[2][0]}${m[1]}_` : '0';
}

// tenexch's comma-separated `card` field → the casino site's codes, in order.
export const cardCodes = (card) => String(card || '').split(',').filter((c) => c !== '').map(cardCode);

// The rank / suit art some tables use.
export const lucky7Img = (rank) => `${BASE}lucky7_cards/${rank}.png`;
export const t10Img = (rank) => `${BASE}t10cards/${rank}.jpeg`;
export const asset = (path) => `${BASE}${path}`;
