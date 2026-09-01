/**
 * The casino lobbies, keyed the way the reference keys them.
 *
 * The reference drives /casino/:id off one config object: which providers to
 * ask for, which partner names to show as the filter strip, and which banner
 * sits at the top. This is the same shape, with tenexch's own vendors in place
 * of the reference's providers.
 *
 * `vendors` are the jsGames `vendor` values to fetch; `partners` is the strip,
 * in the order it renders, and doubles as the sort order of the grid — the
 * reference sorts games by their partner's position in this list.
 */
export const LOBBIES = {
  LIVECASINO: {
    menu: 'LIVECASINO',
    displayName: 'Live Casino',
    banner: 'livecasino',
    vendors: ['evolution', 'ezugi', 'creedroomz'],
    partners: ['EVOLUTION', 'EZUGI', 'CREEDROOMZ'],
  },
};

/** The banner strip at the top of a lobby. */
export const lobbyBanner = (lobby) =>
  `/newtheme/common/innerpagebanner/${lobby.banner}.webp`;

// Creedroomz sends an empty game_icon for almost every table, and some of the
// hosts the catalog points at are dead; both land on the same placeholder the
// old lobby used.
export const FALLBACK_TILE = '/assets/casino/games/default-2.jpeg';

// Most of the Evolution catalog's art is stored as a boxbet.io Next.js image
// proxy URL, and that proxy refuses anything but its own site's referer — so
// the tile 404s. The real CDN address is sitting in the proxy's own `url`
// parameter and serves fine, so it is unwrapped rather than given up on.
const PROXY = /^https?:\/\/[^/]*boxbet\.io\/_next\/image\?(?:.*&)?url=([^&]+)/i;

/** The art for one tile, or the placeholder when there is none to be had. */
export const tileSrc = (game) => {
  const raw = game?.game_icon || '';
  if (!raw) return FALLBACK_TILE;
  const proxied = PROXY.exec(raw);
  return proxied ? decodeURIComponent(proxied[1]) : raw;
};
