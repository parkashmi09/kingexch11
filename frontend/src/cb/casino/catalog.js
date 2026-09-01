import { FALLBACK_TILE, tileSrc } from './lobbies';

/**
 * Shape helpers for the backends the casino lobbies read from.
 *
 * A lobby renders one shape of tile; these turn each backend's rows into it:
 *
 *   { key, name, art, partner, gameType, launch, minBalance }
 *
 * `partner` and `gameType` are the two axes the pill rows filter on — the same
 * two the reference filters on, which is why every source is made to present
 * them. `launch` says how the tile opens: a third-party game gets a URL and a
 * frame, one of this platform's own tables gets a route.
 */

/**
 * A Casino Manage row's tile category, with inference when the catalog has not
 * stored one. An owner-set `tile_category` always wins; the keywords only fill
 * the gap for rows seeded before that column existed, so a teenpatti table
 * never lands under the wheel-and-dice half of the split.
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

/**
 * One Casino Manage row -> a tile.
 *
 * These are this platform's own tables, so they open on one of our routes
 * rather than in a frame, and they carry an owner-set entry threshold.
 */
export const fromManagedRow = (g) => ({
  key: `mng_${g.id}`,
  name: g.name || '',
  // Owner-uploaded art arrives as a URL (or a data: URI); rows without any fall
  // back to the art this build ships, named after the row's game_type.
  art: g.img
    ? /^(data:|https?:)/i.test(g.img)
      ? g.img
      : `/assets/casino/games/${g.img}`
    : g.game_type
      ? `/assets/casino/games/${String(g.game_type).replace(/^our-/, '')}.jpg`
      : FALLBACK_TILE,
  partner: g.category || '',
  gameType: tileCategoryOf(g),
  launch: { kind: 'route', route: g.route || '' },
  minBalance: Number(g.min_balance) || 0,
});

/**
 * One jsGames row -> a tile.
 *
 * Third-party games, so they open in a frame off a launch URL, and there is no
 * entry threshold to check. `tileSrc` unwraps the proxy URL most of the
 * Evolution catalog is stored behind.
 */
export const fromJsGamesRow = (g) => ({
  key: `js_${g.game_uid || g.id}`,
  name: g.game_name || '',
  art: tileSrc(g),
  partner: g.vendor || '',
  gameType: g.game_type || '',
  launch: { kind: 'iframe', gameUid: g.game_uid },
  minBalance: 0,
});

/** True when a tile has no artwork of its own behind it. */
export const isBlankTile = (tile) => !tile.art || tile.art === FALLBACK_TILE;
