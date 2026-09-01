/** Turn a card code into an image path */
export const cardSrc = (code) => {
  if (!code || code === '1' || code === '0') return '/assets/cards/1.png';
  return `/assets/cards/${code}.png`;
};

/** Split a comma-separated card string into an array of codes */
export const parseCards = (cardString) =>
  cardString ? cardString.split(',').map((c) => c.trim()).filter(Boolean) : [];
