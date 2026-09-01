import { matchesCategory, matchesGameType } from './taxonomy';

/**
 * The casino lobbies, keyed the way the reference keys them.
 *
 * The reference serves all six of its casino menus from ONE page driven by a
 * config keyed on the route, and so do we: adding a lobby is an entry here plus
 * a route, not another page.
 *
 * Every entry carries:
 *
 *   source     which backend the grid reads —
 *              'vendor'    jsGames, one query per vendor (the big lobbies)
 *              'category'  jsGames, one query for a whole category
 *              'managed'   this platform's own Casino Manage tables
 *   banner     the innerpagebanner file, as the reference names it
 *   partners   the top strip, in the reference's order
 *   gameTypes  the strip under the search box, verbatim from the reference
 *   categories the Category dialog's list, likewise verbatim
 *
 * BOTH PILL ROWS CARRY THE REFERENCE'S OWN LABELS, FIXED. The reference derives
 * its rows from its own game list; ours cannot, because its partners are not
 * our partners. So each pill keeps the reference's label and gets a predicate
 * over our normalised tiles instead. Where a label has a real counterpart in
 * our data the predicate is honest; where it does not, it is called out.
 *
 * A partner with no vendors is one the reference lists and this catalog has
 * nothing for; it stays in the strip so the page matches, and selecting it
 * shows nothing. docs/BACKEND-GAPS.md names them.
 */

/** A pill whose membership taxonomy.js already knows how to decide. */
const tab = (label) => ({ id: label, label, match: (g) => matchesGameType(g, label) });

/** A Category-dialog entry, likewise. */
const bucket = (id) => ({ id, label: id, match: (g) => matchesCategory(g, id) });

/** A partner backed by real vendors: a tile belongs to it if it came from one. */
const vendorPartner = (label, vendors) => ({
  id: label,
  label,
  vendors,
  match: (g) => g.partner === label,
});

// LIVECASINO — the reference serves this from one partner (EZUGI); the three
// live-dealer vendors below are the catalog's equivalent.
const LIVECASINO = {
  menu: 'LIVECASINO',
  displayName: 'Live Casino',
  banner: 'livecasino',
  source: 'vendor',
  partners: [
    vendorPartner('EVOLUTION', ['evolution', 'evolution live', 'evolution live(asia)']),
    vendorPartner('EZUGI', ['ezugi']),
    vendorPartner('CREEDROOMZ', ['creedroomz']),
  ],
  gameTypes: [
    tab('Live Blackjack'),
    tab('Live Roulette'),
    tab('Live Poker'),
    tab('Live Games'),
    tab('Live Baccarat'),
    tab('Baccarat'),
    tab('Blackjack'),
    tab('Sicbo'),
    tab('Live Casino'),
    tab('Roulette'),
    tab('Slot'),
    tab('Arcade Games'),
    tab('Casual Games'),
  ],
  categories: [bucket('LIVECASINO')],
};

// INTERNATIONALCASINO — the reference's widest lobby: seventeen partners over
// live tables, slots, crash and instant games.
const INTERNATIONALCASINO = {
  menu: 'INTERNATIONALCASINO',
  displayName: 'Int.Casino',
  banner: 'internationalcasino',
  source: 'vendor',
  partners: [
    vendorPartner('AE SEXY', ['sexy']),
    vendorPartner('EVOLUTION', ['evolution', 'evolution live', 'evolution live(asia)']),
    vendorPartner('VIVO', []),
    vendorPartner('BETGAMES', []),
    vendorPartner('PLAYTECH LIVE', ['playtech', 'playtech(row)']),
    vendorPartner('JILI GAMING', ['jili', 'jiligaming', 'jilisweep']),
    vendorPartner('EVOPLAY', ['evoplay-aisa', 'evoplay-eu']),
    vendorPartner('GAMZIX', []),
    vendorPartner('KINGMIDAS', ['km', 'km-onegaming']),
    vendorPartner('SMARTSOFT GAMING', ['smartsoft']),
    vendorPartner('CREED', ['creedroomz']),
    vendorPartner('ASIA GAMING', ['ag']),
    vendorPartner('PLAY N GO', ['playngo']),
    vendorPartner('PRAGMATIC', ['pragmatic']),
    vendorPartner('PRAGMATIC PLAY', ['pragmaticplay-eu']),
    vendorPartner('PRAGMATIC PLAY 2', ['pragmaticplay-asia']),
    vendorPartner('PRAGMATIC PLAY LIVE', ['pragmaticplaylive-eu', 'pragmaticplaylive-asia', 'pragmaticlive']),
  ],
  gameTypes: [
    tab('Live Casino'),
    tab('Live Games'),
    tab('Live Baccarat'),
    tab('Live Blackjack'),
    tab('Live Roulette'),
    tab('Live Poker'),
    tab('Others'),
    tab('Live Lobby'),
    tab('Game Shows'),
    tab('Live Crash'),
    tab('Live Dice'),
    tab('Live Dealer'),
    tab('Live Lottery'),
    tab('Slot'),
    tab('Casual Games'),
    tab('Crash Games'),
    tab('Live Dragon Tiger'),
    tab('Live Sic Bo'),
    tab('Top Card'),
    tab('Dragon Tiger'),
    tab('Blackjack'),
    tab('Roulette'),
    tab('Baccarat'),
    tab('Other Live Games'),
    tab('SicBo'),
    tab('Live'),
    tab('Instant Win'),
    tab('Scratch Cards'),
    tab('Video Poker'),
    tab('Arcade Games'),
    tab('Table Games'),
    tab('Live Teenpatti'),
    tab('Keno'),
    tab('Bingo'),
    tab('Other Table Games'),
    tab('Game Show'),
  ],
  categories: [bucket('LIVECASINO'), bucket('LOTTERY'), bucket('SLOT'), bucket('CRASHGAMES'), bucket('TABLE'), bucket('OTHER'), bucket('INSTANTWIN')],
};

// SLOT — the reference's reel lobby.
const SLOT = {
  menu: 'SLOT',
  displayName: 'Slot',
  banner: 'slot',
  source: 'vendor',
  partners: [
    vendorPartner('EVOPLAY', ['evoplay-aisa', 'evoplay-eu']),
    vendorPartner('BETGAMES', []),
    vendorPartner('CREED', ['creedroomz']),
    // Evolution ships its slots through the studios it owns, not through the
    // live-dealer vendor the other two lobbies use.
    vendorPartner('EVOLUTION', [
      'evolution-redtiger',
      'evolution-nlc',
      'evolutioin-bigtimegaming',
      'evolutioin-netent',
    ]),
    vendorPartner('PLAY N GO', ['playngo']),
    vendorPartner('PRAGMATIC', ['pragmatic']),
    vendorPartner('PRAGMATIC PLAY', ['pragmaticplay-eu']),
    vendorPartner('PRAGMATIC PLAY 2', ['pragmaticplay-asia']),
    vendorPartner('PRAGMATIC PLAY LIVE', ['pragmaticplaylive-eu', 'pragmaticplaylive-asia', 'pragmaticlive']),
    vendorPartner('JILI GAMING', ['jili', 'jiligaming', 'jilisweep']),
    vendorPartner('SMARTSOFT GAMING', ['smartsoft']),
    vendorPartner('GAMZIX', []),
  ],
  gameTypes: [
    tab('Slot'),
    tab('Scratch Cards'),
    tab('Roulette'),
    tab('Video Poker'),
    tab('Others'),
    tab('Casual Games'),
    tab('Arcade Games'),
    tab('Blackjack'),
    tab('Table Games'),
    tab('Bingo'),
    tab('Other Table Games'),
    tab('Crash Games'),
    tab('Game Show'),
  ],
  categories: [bucket('SLOT')],
};

// Which Casino Manage tile categories are dealt-card tables. Everything else in
// that catalog is a wheel, dice or number game.
const CARD_TABLES = new Set([
  'teenpatti', 'poker', 'baccarat', 'dragontiger', 'andarbahar',
  '32cards', 'casinowar', '3cardj', 'lucky7', 'queen', 'bollywood',
]);

// A crash tile, however its vendor spelt the type — "Crash", "crash game",
// "Crash Game", "CRASH" and a few strays all live in the same category.
const isCrash = (g) => /crash/i.test(g.gameType);

// INDIANPOKER — this platform's own tables. The reference's Indian Poker set
// comes from partners this backend does not carry (RVGAMES, GAP, AURA), so the
// grid shows our equivalent game family instead.
const INDIANPOKER = {
  menu: 'INDIANPOKER',
  displayName: 'Indian Poker',
  banner: 'indianpoker',
  source: 'managed',
  // A LABEL MAPPING AND NOTHING MORE. There is no sense in which our VIP tables
  // *are* MAC88's — the four reference partners have no counterpart here, so
  // each is paired with one of our house sets in list order. Re-point freely.
  partners: [
    { id: 'RVGAMES', label: 'RVGAMES', match: (g) => g.partner === 'our' },
    { id: 'INDIAN POKER II', label: 'INDIAN POKER II', match: (g) => g.partner === 'vip' },
    { id: 'INDIAN POKER', label: 'INDIAN POKER', match: (g) => g.partner === 'premium' },
    { id: 'MAC88', label: 'MAC88', match: (g) => g.partner === 'virtual' },
  ],
  // Every row in the Casino Manage catalog is a live table, so it divides
  // honestly into the dealt-card tables and the wheel/dice/number ones. Slot
  // and Crash Games have no counterpart in THIS catalog — the platform has
  // both, but they live behind jsGames — so those two pills route to the
  // lobbies that do hold them rather than selecting an empty grid.
  gameTypes: [
    { id: 'Live Casino', label: 'Live Casino', match: (g) => CARD_TABLES.has(g.gameType) },
    { id: 'Table Games', label: 'Table Games', match: (g) => !CARD_TABLES.has(g.gameType) },
    { id: 'Slot', label: 'Slot', goTo: '/casino/SLOT' },
    { id: 'Crash Games', label: 'Crash Games', goTo: '/casino/AVIATOR' },
  ],
  categories: [
    { id: 'LIVECASINO', label: 'LIVECASINO', match: (g) => CARD_TABLES.has(g.gameType) },
    { id: 'TABLE', label: 'TABLE', match: (g) => !CARD_TABLES.has(g.gameType) },
    { id: 'CRASHGAMES', label: 'CRASHGAMES', goTo: '/casino/AVIATOR' },
  ],
};

// AVIATOR — jsGames' `crash` category, the genuine home of Aviator here, which
// carries Aviator itself along with ~200 other crash titles.
const AVIATOR = {
  menu: 'AVIATOR',
  displayName: 'Aviator',
  banner: 'aviator',
  source: 'category',
  category: 'crash',
  // Real, unlike Indian Poker's: `spribe` is an actual vendor in our crash
  // catalog, and SPRIBE is the reference's only Aviator partner.
  partners: [{ id: 'SPRIBE', label: 'SPRIBE', match: (g) => g.partner.toLowerCase() === 'spribe' }],
  gameTypes: [
    { id: 'Others', label: 'Others', match: (g) => !isCrash(g) },
    { id: 'Casual Games', label: 'Casual Games', match: isCrash },
  ],
  categories: [{ id: 'CRASHGAMES', label: 'CRASHGAMES', match: () => true }],
};

// CHICKENROAD — the same crash catalog as Aviator, and the home of every
// chicken-road title this platform carries.
const CHICKENROAD = {
  menu: 'CHICKENROAD',
  displayName: 'Chicken Road',
  banner: 'chickenroad',
  source: 'category',
  category: 'crash',
  // Real, like Aviator's: INOUT is the reference's only Chicken Road partner
  // and is an actual vendor in our crash catalog.
  partners: [{ id: 'INOUT', label: 'INOUT', match: (g) => g.partner.toLowerCase() === 'inout' }],
  // The reference derives this row from its own INOUT games and every one of
  // its 33 is a crash game, so its row is ALL / Crash Games — one pill, and
  // ours reads the same.
  gameTypes: [{ id: 'Crash Games', label: 'Crash Games', match: isCrash }],
  categories: [{ id: 'CRASHGAMES', label: 'CRASHGAMES', match: () => true }],
};

export const LOBBIES = {
  LIVECASINO,
  INTERNATIONALCASINO,
  SLOT,
  INDIANPOKER,
  AVIATOR,
  CHICKENROAD,
};

/** Every vendor a lobby draws on, or just one partner's when given. */
export const vendorsFor = (lobby, partnerId) => {
  const chosen = partnerId
    ? lobby.partners.filter((p) => p.id === partnerId)
    : lobby.partners;
  return chosen.flatMap((p) => p.vendors || []);
};

/** vendor -> the partner label it renders under, so a tile knows its strip. */
export const partnerIndex = (lobby) => {
  const index = {};
  lobby.partners.forEach((p) => (p.vendors || []).forEach((v) => { index[v] = p.label; }));
  return index;
};

/** The banner strip at the top of a lobby. */
export const lobbyBanner = (lobby) =>
  `/newtheme/common/innerpagebanner/${lobby.banner}.webp`;

// Creedroomz sends an empty game_icon for almost every table, and some of the
// hosts the catalog points at are dead; both land on this placeholder.
//
// It is drawn 480x640 — the card's own 3:4 — rather than reusing the old
// lobby's default-2.jpeg, which is 300x160 landscape and gets sliced in half
// when a portrait card crops it to fill. Being SVG it is also sharp at any
// card size, which none of the catalog's raster art is.
export const FALLBACK_TILE = '/newtheme/common/casino-tile-placeholder.svg';

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
