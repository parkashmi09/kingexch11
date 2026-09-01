/**
 * The casino lobbies, keyed the way the reference keys them.
 *
 * Each lobby is three lists, all lifted from the reference's own pages:
 *
 *   partners   the top strip, in the reference's order. Each carries the
 *              tenexch vendors that make it up — the reference asks one
 *              aggregator for a partner's games, we ask the catalog for each
 *              vendor that partner ships under.
 *   gameTypes  the strip under the search box, verbatim from the reference.
 *              cb/casino/taxonomy.js decides which of our games land on each.
 *   categories the Category dialog's list, likewise verbatim.
 *
 * A partner with no vendors is one the reference lists and this catalog has
 * nothing for; it stays in the strip so the page matches, and selecting it
 * shows nothing. docs/BACKEND-GAPS.md names them.
 */

// LIVECASINO — the reference serves this from one partner (EZUGI); the three
// live-dealer vendors below are the catalog's equivalent.
const LIVECASINO = {
  menu: 'LIVECASINO',
  displayName: 'Live Casino',
  banner: 'livecasino',
  partners: [
    { label: 'EVOLUTION', vendors: ['evolution', 'evolution live', 'evolution live(asia)'] },
    { label: 'EZUGI', vendors: ['ezugi'] },
    { label: 'CREEDROOMZ', vendors: ['creedroomz'] },
  ],
  gameTypes: [
    'Live Blackjack',
    'Live Roulette',
    'Live Poker',
    'Live Games',
    'Live Baccarat',
    'Baccarat',
    'Blackjack',
    'Sicbo',
    'Live Casino',
    'Roulette',
    'Slot',
    'Arcade Games',
    'Casual Games',
  ],
  categories: ['LIVECASINO'],
};

// INTERNATIONALCASINO — the reference's widest lobby: seventeen partners over
// live tables, slots, crash and instant games.
const INTERNATIONALCASINO = {
  menu: 'INTERNATIONALCASINO',
  displayName: 'Int.Casino',
  banner: 'internationalcasino',
  partners: [
    { label: 'AE SEXY', vendors: ['sexy'] },
    { label: 'EVOLUTION', vendors: ['evolution', 'evolution live', 'evolution live(asia)'] },
    { label: 'VIVO', vendors: [] },
    { label: 'BETGAMES', vendors: [] },
    { label: 'PLAYTECH LIVE', vendors: ['playtech', 'playtech(row)'] },
    { label: 'JILI GAMING', vendors: ['jili', 'jiligaming', 'jilisweep'] },
    { label: 'EVOPLAY', vendors: ['evoplay-aisa', 'evoplay-eu'] },
    { label: 'GAMZIX', vendors: [] },
    { label: 'KINGMIDAS', vendors: ['km', 'km-onegaming'] },
    { label: 'SMARTSOFT GAMING', vendors: ['smartsoft'] },
    { label: 'CREED', vendors: ['creedroomz'] },
    { label: 'ASIA GAMING', vendors: ['ag'] },
    { label: 'PLAY N GO', vendors: ['playngo'] },
    { label: 'PRAGMATIC', vendors: ['pragmatic'] },
    { label: 'PRAGMATIC PLAY', vendors: ['pragmaticplay-eu'] },
    { label: 'PRAGMATIC PLAY 2', vendors: ['pragmaticplay-asia'] },
    { label: 'PRAGMATIC PLAY LIVE', vendors: ['pragmaticplaylive-eu', 'pragmaticplaylive-asia', 'pragmaticlive'] },
  ],
  gameTypes: [
    'Live Casino',
    'Live Games',
    'Live Baccarat',
    'Live Blackjack',
    'Live Roulette',
    'Live Poker',
    'Others',
    'Live Lobby',
    'Game Shows',
    'Live Crash',
    'Live Dice',
    'Live Dealer',
    'Live Lottery',
    'Slot',
    'Casual Games',
    'Crash Games',
    'Live Dragon Tiger',
    'Live Sic Bo',
    'Top Card',
    'Dragon Tiger',
    'Blackjack',
    'Roulette',
    'Baccarat',
    'Other Live Games',
    'SicBo',
    'Live',
    'Instant Win',
    'Scratch Cards',
    'Video Poker',
    'Arcade Games',
    'Table Games',
    'Live Teenpatti',
    'Keno',
    'Bingo',
    'Other Table Games',
    'Game Show',
  ],
  categories: ['LIVECASINO', 'LOTTERY', 'SLOT', 'CRASHGAMES', 'TABLE', 'OTHER', 'INSTANTWIN'],
};

// SLOT — the reference's reel lobby. Its EVOLUTION tab is not the live-dealer
// vendor of the other two lobbies: Evolution ships its slots through the
// studios it owns (Red Tiger, NoLimit City, Big Time Gaming, NetEnt), and those
// are what belong under this partner.
const SLOT = {
  menu: 'SLOT',
  displayName: 'Slot',
  banner: 'slot',
  partners: [
    { label: 'EVOPLAY', vendors: ['evoplay-aisa', 'evoplay-eu'] },
    { label: 'BETGAMES', vendors: [] },
    { label: 'CREED', vendors: ['creedroomz'] },
    {
      label: 'EVOLUTION',
      vendors: [
        'evolution-redtiger',
        'evolution-nlc',
        'evolutioin-bigtimegaming',
        'evolutioin-netent',
      ],
    },
    { label: 'PLAY N GO', vendors: ['playngo'] },
    { label: 'PRAGMATIC', vendors: ['pragmatic'] },
    { label: 'PRAGMATIC PLAY', vendors: ['pragmaticplay-eu'] },
    { label: 'PRAGMATIC PLAY 2', vendors: ['pragmaticplay-asia'] },
    { label: 'PRAGMATIC PLAY LIVE', vendors: ['pragmaticplaylive-eu', 'pragmaticplaylive-asia', 'pragmaticlive'] },
    { label: 'JILI GAMING', vendors: ['jili', 'jiligaming', 'jilisweep'] },
    { label: 'SMARTSOFT GAMING', vendors: ['smartsoft'] },
    { label: 'GAMZIX', vendors: [] },
  ],
  gameTypes: [
    'Slot',
    'Scratch Cards',
    'Roulette',
    'Video Poker',
    'Others',
    'Casual Games',
    'Arcade Games',
    'Blackjack',
    'Table Games',
    'Bingo',
    'Other Table Games',
    'Crash Games',
    'Game Show',
  ],
  categories: ['SLOT'],
};

export const LOBBIES = { LIVECASINO, INTERNATIONALCASINO, SLOT };

/** Every vendor a lobby draws on, or just one partner's when given. */
export const vendorsFor = (lobby, partnerLabel) => {
  const chosen = partnerLabel
    ? lobby.partners.filter((p) => p.label === partnerLabel)
    : lobby.partners;
  return chosen.flatMap((p) => p.vendors);
};

/** vendor -> the partner label it renders under, so a tile knows its strip. */
export const partnerIndex = (lobby) => {
  const index = {};
  lobby.partners.forEach((p) => p.vendors.forEach((v) => { index[v] = p.label; }));
  return index;
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
