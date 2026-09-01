// The Indian Poker page's two filter rows, and the Casino Manage catalog shape
// helpers they run against.
//
// The pill LABELS are the reference's, fixed — not derived from our data. The
// reference's Indian Poker page offers exactly these two rows:
//
//   partners   ALL · RVGAMES · INDIAN POKER II · INDIAN POKER · MAC88
//   gameTypes  ALL · Live Casino · Table Games · Slot · Crash Games
//
// ...and it builds them from its own game list, whose partners this backend
// does not carry. So each pill is pinned to the reference's label and given a
// predicate over OUR catalog instead: the row reads the same, the games behind
// it are ours.

/**
 * The partner row.
 *
 * The reference's four partners have no counterpart here, so each is paired
 * with one of this platform's house sets, in the order both lists happen to
 * come in. The pairing is a label mapping and nothing more — there is no sense
 * in which our VIP tables *are* MAC88's — so it lives here, in one table, where
 * it can be re-pointed without touching the page.
 */
export const PARTNERS = [
  { id: 'RVGAMES', label: 'RVGAMES', match: (g) => g.category === 'our' },
  { id: 'INDIAN POKER II', label: 'INDIAN POKER II', match: (g) => g.category === 'vip' },
  { id: 'INDIAN POKER', label: 'INDIAN POKER', match: (g) => g.category === 'premium' },
  { id: 'MAC88', label: 'MAC88', match: (g) => g.category === 'virtual' },
];

// Which tile categories count as dealt-card tables. Everything else in the
// catalog is a wheel, dice or number game.
const CARD_TABLES = new Set([
  'teenpatti', 'poker', 'baccarat', 'dragontiger', 'andarbahar',
  '32cards', 'casinowar', '3cardj', 'lucky7', 'queen', 'bollywood',
]);

/**
 * The game-type row.
 *
 * Two of the reference's four labels map onto a real split of this catalog:
 * every row in it is a live table, so it divides into the dealt-card tables and
 * the wheel/dice/number ones. The other two have no counterpart at all — this
 * platform's slots and crash games live behind a different API (`jsGames`) and
 * launch through an iframe rather than one of our table routes, so they are not
 * in this catalog to be filtered. Those two pills therefore render, as the
 * reference has them, over an empty grid.
 */
export const GAME_TYPES = [
  { id: 'Live Casino', label: 'Live Casino', match: (g) => CARD_TABLES.has(tileCategoryOf(g)) },
  { id: 'Table Games', label: 'Table Games', match: (g) => !CARD_TABLES.has(tileCategoryOf(g)) },
  { id: 'Slot', label: 'Slot', match: () => false },
  { id: 'Crash Games', label: 'Crash Games', match: () => false },
];

/**
 * A row's tile category, with inference when the catalog hasn't stored one.
 * An owner-set `tile_category` always wins; the keywords only fill the gap for
 * rows seeded before the column existed, so a teenpatti table never lands under
 * the wheel-and-dice half of the split above.
 *
 * Deliberately a copy of what `pages/CasinoHome.jsx` derives the same way,
 * rather than an import: `src/cb/` is a parallel tree that must not depend on
 * the page it is eventually going to replace (Phase 6). Collapse the two when
 * CasinoHome goes.
 */
export function tileCategoryOf(g) {
  if (g.tile_category) return g.tile_category;
  const n = `${g.game_type || ''} ${g.name || ''}`.toLowerCase();
  if (/teen/.test(n)) return 'teenpatti';
  if (/dragon|dtl?\d/.test(n)) return 'dragontiger';
  if (/lucky/.test(n)) return 'lucky7';
  if (/baccarat/.test(n)) return 'baccarat';
  if (/32/.test(n)) return '32cards';
  if (/bollywood|btable/.test(n)) return 'bollywood';
  if (/race/.test(n)) return 'race';
  if (/poker/.test(n)) return 'poker';
  if (/roulette/.test(n)) return 'roulette';
  return 'others';
}

// The reference's own default tile, served from public/ — never hotlinked.
const FALLBACK_TILE_IMG = '/assets/casino/games/default-2.jpeg';

/**
 * A row's tile art. The catalog serves owner-uploaded art as a URL (or a data:
 * URI); rows without any fall back to the art this build ships, named after the
 * row's game_type, and then to the shared default.
 */
export const tileArt = (g) => {
  if (g.img) return /^(data:|https?:)/i.test(g.img) ? g.img : `/assets/casino/games/${g.img}`;
  if (g.game_type) return `/assets/casino/games/${String(g.game_type).replace(/^our-/, '')}.jpg`;
  return FALLBACK_TILE_IMG;
};

export { FALLBACK_TILE_IMG };
