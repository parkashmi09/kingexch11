// The casino menu configs — this app's answer to the reference's `$i` map.
//
// The reference serves all six of its casino menus (INDIANPOKER, AVIATOR,
// CHICKENROAD, LIVECASINO, INTERNATIONALCASINO, SLOT) from ONE page component
// driven by a config keyed on the route param. `CasinoMenuPage` is that
// component and this is that config, so adding the remaining four is an entry
// here plus a route — not another page.
//
// Each entry pins:
//   banner    the innerpagebanner file, as the reference names it
//   source    which backend the grid reads (see useMenuGames)
//   partners  the top pill row
//   gameTypes the second pill row
//
// **Both pill rows carry the reference's own labels, fixed.** The reference
// derives its rows from its own game list; ours cannot, because its partners
// are not our partners. So each pill keeps the reference's label and gets a
// predicate over our normalised tiles instead (`partner` / `gameType`, filled
// in by catalog.js). Where a label has a real counterpart in our data the
// predicate is honest; where it does not, that is called out below.

// Which Casino Manage tile categories count as dealt-card tables. Everything
// else in that catalog is a wheel, dice or number game.
const CARD_TABLES = new Set([
  'teenpatti', 'poker', 'baccarat', 'dragontiger', 'andarbahar',
  '32cards', 'casinowar', '3cardj', 'lucky7', 'queen', 'bollywood',
]);

export const MENUS = {
  INDIANPOKER: {
    displayName: 'Indian Poker',
    banner: 'indianpoker.webp',
    // This platform's own tables. The reference's Indian Poker set comes from
    // partners this backend does not carry (RVGAMES, GAP, AURA), so the grid
    // shows our equivalent game family instead.
    source: 'casino-manage',

    // A LABEL MAPPING AND NOTHING MORE. There is no sense in which our VIP
    // tables *are* MAC88's — the four reference partners simply have no
    // counterpart here, so each is paired with one of our house sets in list
    // order. Re-point freely.
    partners: [
      { id: 'RVGAMES', label: 'RVGAMES', match: (g) => g.partner === 'our' },
      { id: 'INDIAN POKER II', label: 'INDIAN POKER II', match: (g) => g.partner === 'vip' },
      { id: 'INDIAN POKER', label: 'INDIAN POKER', match: (g) => g.partner === 'premium' },
      { id: 'MAC88', label: 'MAC88', match: (g) => g.partner === 'virtual' },
    ],

    // Every row in the Casino Manage catalog is a live table, so it divides
    // honestly into the dealt-card tables and the wheel/dice/number ones. Slot
    // and Crash Games have no counterpart at all — this platform has both, but
    // they live behind jsGames, not in this catalog — so those two pills select
    // an empty grid, as the row still has to read like the reference's.
    gameTypes: [
      { id: 'Live Casino', label: 'Live Casino', match: (g) => CARD_TABLES.has(g.gameType) },
      { id: 'Table Games', label: 'Table Games', match: (g) => !CARD_TABLES.has(g.gameType) },
      { id: 'Slot', label: 'Slot', match: () => false },
      { id: 'Crash Games', label: 'Crash Games', match: () => false },
    ],
  },

  AVIATOR: {
    displayName: 'Aviator',
    banner: 'aviator.webp',
    // jsGames' `crash` category — the genuine home of Aviator here, and it
    // carries Aviator itself along with ~200 other crash titles.
    source: 'jsgames-crash',

    // Unlike Indian Poker's, this one is real: `spribe` is an actual vendor in
    // our crash catalog, and SPRIBE is the reference's only Aviator partner.
    partners: [{ id: 'SPRIBE', label: 'SPRIBE', match: (g) => g.partner.toLowerCase() === 'spribe' }],

    // Our crash rows carry the vendors' own `game_type` strings, which are the
    // same word in six casings ("Crash", "crash game", "Crash Game", "CRASH",
    // …) plus a handful of strays. That splits cleanly in two, under the
    // reference's own two labels.
    gameTypes: [
      { id: 'Others', label: 'Others', match: (g) => !/crash/i.test(g.gameType) },
      { id: 'Casual Games', label: 'Casual Games', match: (g) => /crash/i.test(g.gameType) },
    ],
  },
};
