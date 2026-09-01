/**
 * The reference's filter tabs, and how a tenexch game lands on one.
 *
 * The reference derives its two strips from the games it loads — one distinct
 * value per `gameType`, one per `category` — and because its aggregator stores
 * a tidy label on every game, those strips read as "Live Roulette",
 * "Game Shows", "Instant Win". Its labels are fixed per lobby, so they are
 * written out here verbatim, in the order the reference renders them.
 *
 * tenexch's catalog classifies the same games with 173 different `game_type`
 * strings across 134 vendors — "Slot", "Slot Game", "Slots", "slots",
 * "Video Slot", "棋牌游戏" — and a live table is very often just "CasinoLive"
 * with everything interesting in the name. So a tab is not a value match; it is
 * a predicate over the game's type AND its name.
 *
 * Each tab is `{ label, live, types, name }`:
 *   live  true  -> only live-dealer games, false -> only non-live, null -> either
 *   types normalised game_type values that qualify on their own
 *   name  a pattern over game_name that qualifies on its own
 * A game matches when the live test passes and either `types` or `name` hits.
 */

const norm = (s) => String(s || '').trim().toLowerCase();

// What a live-dealer game's game_type looks like, across every vendor that
// serves one. Everything else — slots, crash, instant — is not live.
const LIVE_TYPES = new Set([
  'casinolive',
  'casino live',
  'live',
  'lobby',
  'casino',
  'casinotable',
  'casino game',
  'casino games',
  'live casino',
  'live grand',
  'casinolive & slot',
  'casino live & slot',
  'roulette',
  'blackjack',
  'baccarat',
  'poker',
  'other',
  'marbles',
  'keno',
]);

export const isLiveGame = (game) => LIVE_TYPES.has(norm(game.game_type));

// The subjects a table game can be about. Names are far more reliable than
// types here: "XXXtreme Lightning Roulette" is filed as plain "CasinoLive".
const ROULETTE = /roulette|ruleta|rulet/i;
const BLACKJACK = /black\s?jack|\bbj\b/i;
const BACCARAT = /bacc?arat|bacarrat|dragon\s?tiger/i;
const POKER = /poker|hold\s?'?em|casino\s?war|3\s?card|three\s?card|top\s?card/i;
const TEENPATTI = /teen\s?patti|andar\s?bahar|32\s?cards?|worli|lucky\s?7/i;
const SICBO = /sic\s?bo|craps|\bdice\b|hi\s?lo|lightning\s?dice/i;
const DRAGONTIGER = /dragon\s?tiger|dragon\s?vs\s?tiger/i;
const KENO = /keno/i;
const BINGO = /bingo/i;
const VIDEOPOKER = /video\s?poker|jacks\s?or\s?better|deuces\s?wild/i;
const SCRATCH = /scratch/i;
// The branded wheel-and-money shows, which every aggregator files differently.
const GAMESHOW = /crazy\s?time|crazy\s?coin|monopoly|dream\s?catcher|deal\s?or\s?no\s?deal|mega\s?ball|funky\s?time|lightning\s?storm|cash\s?or\s?crash|gonzo|adventures\s?beyond|imperial\s?quest|balloon\s?race|crazy\s?pachinko|money\s?wheel|wheel|fan\s?tan/i;
const LOBBY = /lobby/i;

const set = (...v) => new Set(v);

// Every tab the reference can show, keyed by its exact label. The lobbies pick
// which of these they list, and in which order.
const TABS = {
  'Live Casino': { live: true, types: set('casinolive', 'casino live', 'live casino', 'casino', 'live') },
  Live: { live: true, types: set('live', 'casinolive') },
  'Live Games': { live: true, types: set('casinolive', 'casino live', 'live', 'other') },
  'Other Live Games': { live: true, types: set('other', 'others') },
  'Live Lobby': { live: true, types: set('lobby'), name: LOBBY },
  'Live Baccarat': { live: true, types: set('baccarat'), name: BACCARAT },
  Baccarat: { live: null, types: set('baccarat'), name: BACCARAT },
  'Live Blackjack': { live: true, types: set('blackjack'), name: BLACKJACK },
  Blackjack: { live: null, types: set('blackjack'), name: BLACKJACK },
  'Live Roulette': { live: true, types: set('roulette', 'roulette/other'), name: ROULETTE },
  Roulette: { live: null, types: set('roulette', 'roulette/other'), name: ROULETTE },
  'Live Poker': { live: true, types: set('poker', 'pokers', 'india poker game', 'p2p poker'), name: POKER },
  'Live Teenpatti': { live: true, name: TEENPATTI },
  'Live Dragon Tiger': { live: true, name: DRAGONTIGER },
  'Dragon Tiger': { live: null, name: DRAGONTIGER },
  'Live Sic Bo': { live: true, name: SICBO },
  SicBo: { live: null, name: SICBO },
  Sicbo: { live: null, name: SICBO },
  'Top Card': { live: null, name: /top\s?card/i },
  'Live Dice': { live: true, types: set('dice', 'dice game'), name: SICBO },
  'Live Dealer': { live: true, types: set('casinolive', 'casino live', 'live') },
  'Game Shows': { live: true, name: GAMESHOW },
  'Game Show': { live: true, name: GAMESHOW },
  'Live Crash': { live: true, types: set('crash', 'crash game', 'crash games', 'crash type', 'сrash') },
  'Crash Games': {
    live: false,
    types: set('crash', 'crash game', 'crash games', 'crash type', 'сrash', 'blockchain/crash'),
  },
  'Live Lottery': { live: true, types: set('lottery', 'lotto', 'lottery game', 'scratch lottery') },
  'Instant Win': {
    live: false,
    types: set('instant', 'instantwin', 'instant win', 'instant game', 'instant play'),
  },
  'Scratch Cards': { live: false, types: set('scratch cards', 'scratch games'), name: SCRATCH },
  'Video Poker': { live: false, types: set('video poker'), name: VIDEOPOKER },
  Keno: { live: null, types: set('keno', 'keno game'), name: KENO },
  Bingo: { live: false, types: set('bingo', 'video bingo', 'bingo game'), name: BINGO },
  Slot: {
    live: false,
    types: set(
      'slot', 'slots', 'slot game', 'slot games', 'video slot', 'video slots',
      'slot/buy bonus', 'pop slots', 'pop jackpot slots', 'progressive slot machines',
      'fat panda slots', 'html5 3d slot', 'slot machine', 'classic games'
    ),
  },
  'Arcade Games': {
    live: false,
    types: set('arcade', 'arcade game', 'arcade games', 'arcade/other', 'arcade/table game', '街机'),
  },
  'Casual Games': { live: false, types: set('casual', 'casual games', 'mini', 'mini games', 'minigames') },
  'Table Games': {
    live: false,
    types: set('table', 'table game', 'table games', 'tablegame', 'table/board game', '棋牌游戏', '棋牌类'),
  },
  'Other Table Games': { live: false, types: set('table/board game', 'arcade/table game') },
  Others: { live: null, types: set('other', 'others', 'arcade/other', 'roulette/other') },
};

/** True when `game` belongs under the tab called `label`. */
export function matchesGameType(game, label) {
  const tab = TABS[label];
  if (!tab) return false;

  const live = isLiveGame(game);
  if (tab.live === true && !live) return false;
  if (tab.live === false && live) return false;

  const byType = tab.types ? tab.types.has(norm(game.game_type)) : false;
  const byName = tab.name ? tab.name.test(game.game_name || '') : false;
  if (!tab.types && !tab.name) return true;
  return byType || byName;
}

// The reference's coarse buckets, the ones its Category dialog lists. These sit
// above the game-type tabs: LIVECASINO covers every live table, SLOT every
// reel game, and so on.
const CATEGORIES = {
  LIVECASINO: (g) => isLiveGame(g),
  SLOT: (g) => matchesGameType(g, 'Slot'),
  CRASHGAMES: (g) => matchesGameType(g, 'Crash Games') || matchesGameType(g, 'Live Crash'),
  TABLE: (g) => matchesGameType(g, 'Table Games'),
  LOTTERY: (g) =>
    matchesGameType(g, 'Live Lottery') || matchesGameType(g, 'Bingo') || matchesGameType(g, 'Keno'),
  INSTANTWIN: (g) =>
    matchesGameType(g, 'Instant Win') || matchesGameType(g, 'Scratch Cards'),
  OTHER: (g) => matchesGameType(g, 'Others') || matchesGameType(g, 'Arcade Games'),
};

/** True when `game` belongs under the Category dialog's `label`. */
export function matchesCategory(game, label) {
  const test = CATEGORIES[label];
  return test ? test(game) : false;
}
