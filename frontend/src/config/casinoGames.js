/**
 * Central config for all casino games.
 *
 * cardLayout — which card component to render inside CasinoVideo:
 *   'teenpatti'    → 2 players × 3 cards  (A:[0,2,4] B:[1,3,5])
 *   'dragonTiger'  → 1 card each side     (Dragon:[0] Tiger:[1])
 *   'lucky7'       → single card          ([0])
 *   'poker'        → 2 hands of 5 cards   ([0–4], [5–9])
 *   'andarBahar'   → 3 players × 1 card   ([0,1,2])
 *   'none'         → no cards displayed
 *
 * dataType — shape of the API response:
 *   'object' → single game object  { mid, lt, ft, card, sub: [...] }
 *   'array'  → array of rounds     [{ mid, mname, ptime, ... }, ...]
 */

/** Reference wording for the entry-threshold toast, amount to two decimals. */
export const minBalanceMessage = (amount) =>
  `Minimum balance required is ${Number(amount).toFixed(2)}`;

const CASINO_GAMES = {
  // ── Teenpatti variants ──
  teen:    { name: 'Teenpatti 1-day',            tableClass: 'teenpatti1day',  cardLayout: 'teenpatti',    dataType: 'object' },
  teen1:   { name: '1 CARD ONE-DAY',              tableClass: 'teen1oneday',    cardLayout: 'teen1',        dataType: 'object' },
  teen6:   { name: 'Teenpatti 2.0',              tableClass: 'teenpatti1day',  cardLayout: 'teenpatti',    dataType: 'object' },
  teen8:   { name: 'Teenpatti Open',             tableClass: 'teenpattiopen',  cardLayout: 'teenpattiOpen', dataType: 'object' },
  teen9:   { name: 'Teenpatti Test',             tableClass: 'teenpattitest',  cardLayout: 'teenpattiTest', dataType: 'object' },
  teen20:  { name: '20-20 Teenpatti',            tableClass: 'teenpatti20',    cardLayout: 'teenpatti',    dataType: 'object' },
  // VIP variant of teen20 — identical table, cards and rules; only the feed
  // type and the display name differ. Its entry threshold lives in the
  // Casino Manage catalog (owner-set), not here.
  teen20v1: { name: '20-20 Teenpatti VIP',      tableClass: 'teenpatti20',    cardLayout: 'teenpatti',    dataType: 'object' },
  teen20b: { name: '20-20 Teenpatti B',          tableClass: 'teenpatti20b',   cardLayout: 'teenpatti',    dataType: 'object' },
  teen20c: { name: '20-20 Teenpatti C',          tableClass: 'teenpatti20b',   cardLayout: 'teenpatti',    dataType: 'object' },
  teen3:   { name: 'Instant Teenpatti',          tableClass: 'teenpatti1day',  cardLayout: 'teenpatti',    dataType: 'object' },
  teen32:  { name: 'Instant Teenpatti 2.0',      tableClass: 'teenpatti1day',  cardLayout: 'teenpatti',    dataType: 'object' },
  teen33:  { name: 'Instant Teenpatti 3.0',      tableClass: 'teenpatti1day',  cardLayout: 'teenpatti',    dataType: 'object' },
  teen41:  { name: 'Queen Top Open Teenpatti',    tableClass: 'teenpatti2 teenpatti1day',  cardLayout: 'teenpatti',    dataType: 'object' },
  teen42:  { name: 'Jack Top Open Teenpatti',     tableClass: 'teenpatti2 teenpatti1day',  cardLayout: 'teenpatti',    dataType: 'object' },
  teen62:  { name: 'V VIP Teenpatti 1-day',      tableClass: 'teenpatti1day',  cardLayout: 'teenpatti',    dataType: 'object' },
  teen120: { name: '1 CARD 20-20',               tableClass: 'teen1t20',       cardLayout: 'teen1',        dataType: 'object' },
  teenmuf: { name: 'Muflis Teenpatti',           tableClass: 'muflis',         cardLayout: 'teenpatti',    dataType: 'object' },
  teensin: { name: '29 Card Baccarat',           tableClass: 'sin-khal',       cardLayout: 'teenpatti',    dataType: 'object' },
  patti2:  { name: '2 Cards Teenpatti',          tableClass: 'teenpatti2cards',  cardLayout: 'teenpatti',    dataType: 'object' },

  // ── Dragon Tiger variants ──
  dt6:    { name: '1 Day Dragon Tiger',    tableClass: 'dragontiger1day', cardLayout: 'dragonTiger', dataType: 'object' },
  dt20:   { name: '20-20 Dragon Tiger',    tableClass: 'dragontiger1day', cardLayout: 'dragonTiger', dataType: 'object' },
  dt202:  { name: '20-20 Dragon Tiger 2',  tableClass: 'dragontiger1day', cardLayout: 'dragonTiger', dataType: 'object' },
  dtl20:  { name: '20-20 D T L',           tableClass: 'dragontiger1day', cardLayout: 'dragonTigerLion', dataType: 'object' },

  // ── Lucky 7 variants ──
  lucky7:    { name: 'Lucky 7 - A', tableClass: 'lucky7', cardLayout: 'lucky7', dataType: 'object' },
  lucky7eu:  { name: 'Lucky 7 - B', tableClass: 'lucky7 lucky7eu', cardLayout: 'lucky7', dataType: 'object' },
  lucky7eu2: { name: 'Lucky 7 - C', tableClass: 'lucky7 lucky7eu lucky7eu2', cardLayout: 'lucky7', dataType: 'object' },
  lucky5:    { name: 'Lucky 6',     tableClass: 'lucky7', cardLayout: 'lucky7', dataType: 'object' },
  lucky15:   { name: 'Lucky 15',    tableClass: 'ball-by-ball', cardLayout: 'none', dataType: 'object' },

  // ── Poker variants ──
  poker:   { name: 'Poker 1-Day',      tableClass: 'poker1day', cardLayout: 'poker', dataType: 'object' },
  poker20: { name: '20-20 Poker',      tableClass: 'poker20',   cardLayout: 'poker20', dataType: 'object' },
  poker6:  { name: 'Poker 6 Players',  tableClass: 'poker6player', cardLayout: 'poker6', dataType: 'object' },

  // ── Andar Bahar / AAA ──
  ab20: { name: 'Andar Bahar',         tableClass: 'andar-bahar', cardLayout: 'none', dataType: 'object' },
  abj:  { name: 'Andar Bahar 2',       tableClass: 'andar-bahar2', cardLayout: 'none', dataType: 'object' },
  ab3:  { name: 'ANDAR BAHAR 50 CARDS',  tableClass: 'andar-bahar andar-bahar-3', cardLayout: 'none', dataType: 'object' },
  ab4:  { name: 'ANDAR BAHAR 150 CARDS', tableClass: 'andar-bahar andar-bahar-3 andar-bahar-4', cardLayout: 'none', dataType: 'object' },
  aaa:  { name: 'Amar Akbar Anthony',  tableClass: 'aaa', cardLayout: 'lucky7', dataType: 'object' },
  aaa2: { name: 'Amar Akbar Anthony 2', tableClass: 'aaa', cardLayout: 'lucky7', dataType: 'object' },

  // ── Baccarat ──
  baccarat:  { name: 'Baccarat',   tableClass: 'baccarat', cardLayout: 'none', dataType: 'object' },
  baccarat2: { name: 'Baccarat 2', tableClass: 'baccarat baccarat2', cardLayout: 'none', dataType: 'object' },

  // ── 32 Cards ──
  card32:   { name: '32 Cards A', tableClass: 'cards32a', cardLayout: 'card32', dataType: 'object' },
  card32eu: { name: '32 Cards B', tableClass: 'cards32b',  cardLayout: 'card32', dataType: 'object' },

  // ── Sic Bo ──
  sicbo:  { name: 'Sic Bo',   tableClass: 'sicbo', cardLayout: 'none', dataType: 'object' },
  sicbo2: { name: 'Sic Bo 2', tableClass: 'sicbo', cardLayout: 'none', dataType: 'object' },

  // ── Trap / War ──
  trap: { name: 'The Trap',    tableClass: 'trap', cardLayout: 'trap', dataType: 'object' },
  war:  { name: 'Casino War',  tableClass: 'war',  cardLayout: 'war', dataType: 'object' },

  // ── Worli / Matka ──
  worli:  { name: 'Worli Matka',   tableClass: 'worli', cardLayout: 'worli', dataType: 'object' },
  worli2: { name: 'Instant Worli', tableClass: 'worli', cardLayout: 'worli', dataType: 'object' },

  // ── Cricket / Sports-style ──
  superover:  { name: 'Super Over',         tableClass: 'superover',  cardLayout: 'none', dataType: 'object' },
  superover2: { name: 'Super Over 2',       tableClass: 'superover',  cardLayout: 'none', dataType: 'object' },
  superover3: { name: 'Mini SuperOver',     tableClass: 'super-over', cardLayout: 'none', dataType: 'object' },
  ballbyball: { name: 'Ball By Ball',       tableClass: 'ball-by-ball', cardLayout: 'none', dataType: 'object' },
  cmatch20:   { name: 'Cricket Match 20-20', tableClass: 'cmatch20',  cardLayout: 'none', dataType: 'object' },
  cricketv3:  { name: '5Five Cricket',      tableClass: 'cricketv3',  cardLayout: 'none', dataType: 'object' },

  // ── Racing ──
  race17: { name: 'Race To 17', tableClass: 'raceto17', cardLayout: 'race17', dataType: 'object' },
  race2:  { name: 'Race to 2nd', tableClass: 'casino-queen', cardLayout: 'race2', dataType: 'object' },
  race20: { name: 'Race 20',    tableClass: 'race20',   cardLayout: 'race20', dataType: 'object' },

  // ── Other / Special ──
  '3cardj':  { name: '3 Cards Judgement', tableClass: 'threecardj', cardLayout: 'threeCardJ', dataType: 'object' },
  queen:     { name: 'Queen',            tableClass: 'casino-queen', cardLayout: 'none', dataType: 'object' },
  btable:    { name: 'Bollywood Casino',   tableClass: 'aaa',       cardLayout: 'lucky7', dataType: 'object' },
  btable2:   { name: 'Bollywood Casino 2', tableClass: 'aaa',      cardLayout: 'lucky7', dataType: 'object' },
  lottcard:  { name: 'Lottery',          tableClass: 'lottcard',  cardLayout: 'none', dataType: 'object' },
  cmeter:    { name: 'Casino Meter',     tableClass: 'cmeter',    cardLayout: 'none', dataType: 'object' },
  cmeter1:   { name: '1 Card Meter',    tableClass: 'one-card-meter', cardLayout: 'meter', dataType: 'object' },
  roulette11: { name: 'Golden Roulette', tableClass: 'roulette roulette11', cardLayout: 'none', dataType: 'object' },
  roulette12: { name: 'Beach Roulette', tableClass: 'roulette roulette11', cardLayout: 'none', dataType: 'object' },
  roulette13: { name: 'Roulette', tableClass: 'roulette roulette11 roulette13', cardLayout: 'none', dataType: 'object' },
  ourroullete: { name: 'Unique Roulette', tableClass: 'roulette', cardLayout: 'none', dataType: 'object', isOurRoulette: true },

  // ── Doli Dana ──
  dolidana: { name: 'Doli Dana', tableClass: 'doli-dana', cardLayout: 'doliDana', dataType: 'object' },

  // ── Mogambo ──
  mogambo: { name: 'Mogambo', tableClass: 'teenpatti2cards mogambo', cardLayout: 'mogambo', dataType: 'object' },

  // ── Teenpatti Poison ──
  poison:   { name: 'Teenpatti Poison One Day', tableClass: 'teenpatti-joker poison', cardLayout: 'poison', dataType: 'object' },
  poison20: { name: 'Teenpatti Poison 20-20',   tableClass: 'teenpatti-joker',        cardLayout: 'poison', dataType: 'object' },

  // ── Unique Teenpatti ──
  teenunique: { name: 'Unique Teenpatti', tableClass: 'unique-teen20', cardLayout: 'none', dataType: 'object' },


  // ── Joker Teenpatti ──
  joker1:   { name: 'Unlimited Joker Oneday', tableClass: 'teenpatti-joker1', cardLayout: 'teenpatti', dataType: 'object' },
  joker20:  { name: 'Teenpatti Joker 20-20',  tableClass: 'teenpatti-joker',  cardLayout: 'joker20',  dataType: 'object' },
  joker120: { name: 'Unlimited Joker 20-20', tableClass: 'teenpatti-joker1', cardLayout: 'joker120', dataType: 'object' },

  // ── Goal ──
  goal: { name: 'Goal', tableClass: 'ball-by-ball goal', cardLayout: 'none', dataType: 'object' },
  goal2: { name: 'Goal 2', tableClass: 'ball-by-ball goal goal2', cardLayout: 'none', dataType: 'object' },

  // ── Dus ka Dum ──
  dum10: { name: 'Dus ka Dum', tableClass: 'duskadum', cardLayout: 'none', dataType: 'object' },

  // ── Note Number ──
  notenum: { name: 'Note Number', tableClass: 'note', cardLayout: 'notenum', dataType: 'object' },

  // ── Trio ──
  trio: { name: 'Trio', tableClass: 'pasa', cardLayout: 'trio', dataType: 'object' },
};

/** Helper — get config for a game type, with safe fallback */
export function getGameConfig(gameType) {
  return CASINO_GAMES[gameType] || { name: gameType, tableClass: '', cardLayout: 'none', dataType: 'object' };
}

/** All game type keys */
export const GAME_TYPES = Object.keys(CASINO_GAMES);

export default CASINO_GAMES;
