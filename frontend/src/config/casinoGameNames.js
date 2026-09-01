import CASINO_GAMES from './casinoGames';

/**
 * Casino display name → API game type.
 *
 * Reports (account statement, live casino bets) only carry the game's display
 * name — the row has no gtype — but every casino endpoint (detail-results,
 * last-results, all-data) is keyed by the type. This table closes that gap.
 *
 * The names are the catalogue labels from `data/ourCasinoGames.json`, which is
 * what the backend puts in the report rows ("Race to 17", "29Card Baccarat").
 * The types are what each game's page actually calls the API with — those two
 * are NOT the same as the route slug for several games (/casino/raceto17 asks
 * for `race17`, /casino/29cardbaccarat for `teensin`, /casino/1card2020 for
 * `teen120`), so this cannot be derived from the route.
 */
const NAME_TO_TYPE = {
  'Goal 2'               : 'goal2',
  'Worli 3'              : 'worli3',
  'Teen 62'              : 'teen62',
  'Doli Danna'           : 'dolidana',
  'Mogambo'              : 'mogambo',
  'Lucky 5'              : 'lucky5',
  'Roulette 12'          : 'roulette12',
  'Roulette 13'          : 'roulette13',
  'Roulette 11'          : 'roulette11',
  'Poison'               : 'poison',
  'Unique Teenpatti'     : 'teenunique',
  'Poison 20'            : 'poison20',
  'Joker 120'            : 'joker120',
  'Joker 20'             : 'joker20',
  'Joker'                : 'joker1',
  'Teen Patti 20c'       : 'teen20c',
  'Bet Table 2'          : 'btable2',
  'Our Roulette'         : 'ourroullete',
  'Super Over 3'         : 'superover3',
  'Goals'                : 'goal',
  'Andar Bahar 4'        : 'ab4',
  'Lucky 15'             : 'lucky15',
  'Super Over 2'         : 'superover2',
  'Teen Patti 41'        : 'teen41',
  'Teen Patti 42'        : 'teen42',
  'Sicbo 2'              : 'sicbo2',
  'Instant Teenpatti 3.0': 'teen33',
  'Sicbo'                : 'sicbo',
  'Ball by Ball'         : 'ballbyball',
  'Instant Teenpatti 2.0': 'teen32',
  'Teen Patti'           : 'teen',
  'Teen Patti 20'        : 'teen20',
  'Teen Patti 9'         : 'teen9',
  'Teen Patti 8'         : 'teen8',
  'Poker'                : 'poker',
  'Poker 20'             : 'poker20',
  'Poker 6'              : 'poker6',
  'Baccarat'             : 'baccarat',
  'Baccarat 2'           : 'baccarat2',
  'Dragon Tiger 20'      : 'dt20',
  'Dragon Tiger 6'       : 'dt6',
  'DTL 20'               : 'dtl20',
  'Dragon Tiger 202'     : 'dt202',
  'Card 32'              : 'card32',
  'Card 32 EU'           : 'card32eu',
  'Andar Bahar 20'       : 'ab20',
  'AB Joker'             : 'abj',
  'Lucky 7'              : 'lucky7',
  'Lucky 7 EU'           : 'lucky7eu',
  '3 Card Judgement'     : '3cardj',
  'Casino War'           : 'war',
  'Worli'                : 'worli',
  'Worli 2'              : 'worli2',
  'AAA'                  : 'aaa',
  'Bet Table'            : 'btable',
  'Lott Card'            : 'lottcard',
  'Cricket V3'           : 'cricketv3',
  'Cricket Match'        : 'cmatch20',
  'Casino Meter'         : 'cmeter',
  'Teen Patti 6'         : 'teen6',
  'Queen'                : 'queen',
  'Race 20'              : 'race20',
  'Lucky 7 EU 2'         : 'lucky7eu2',
  'Super Over'           : 'superover',
  'Trap'                 : 'trap',
  'Teen Patti 2'         : 'patti2',
  '29Card Baccarat'      : 'teensin',
  'Teen Patti Muflis'    : 'teenmuf',
  'Race to 17'           : 'race17',
  '20-20 Teenpatti B'    : 'teen20b',
  'Trio'                 : 'trio',
  'Note Number'          : 'notenum',
  '1 Card 20-20'         : 'teen120',
  '1 Card One-Day'       : 'teen1',
  'Andar Bahar'          : 'ab3',
  'AAA 2'                : 'aaa2',
  'Race 2'               : 'race2',
  'Instant Teenpatti'    : 'teen3',
  'Dum 10'               : 'dum10',
  'Casino Meter 1'       : 'cmeter1',
};

// "Race to 17", "Race To 17" and "race-to-17" all have to land on race17 —
// reports are not consistent about casing or spacing ("29Card Baccarat" vs
// the config's "29 Card Baccarat").
const normalise = (name) => String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const LOOKUP = {};
for (const [name, type] of Object.entries(NAME_TO_TYPE)) {
  LOOKUP[normalise(name)] = type;
}
// The in-game titles from casinoGames.js as a second chance, for names the
// catalogue spells differently. Catalogue entries win: some config names
// normalise onto a different game's label (config `teen6` is "Teenpatti 2.0",
// which collides with the catalogue's "Teen Patti 20").
for (const [type, cfg] of Object.entries(CASINO_GAMES)) {
  const key = normalise(cfg?.name);
  if (key && !LOOKUP[key]) LOOKUP[key] = type;
}

/**
 * @param {string} name Display name as it appears in a report row.
 * @returns {string|null} API game type, or null when the name is unknown.
 */
export function resolveCasinoGameType(name) {
  return LOOKUP[normalise(name)] || null;
}

export default resolveCasinoGameType;
