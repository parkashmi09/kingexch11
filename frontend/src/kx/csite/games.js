// The Universe tables the kingexch lobby launches, by the reference's event id,
// with the casino-site page that shows each one (casino.kingexch111.com/<route>/<id>).
export const GAMES = {
  '99.0010': { route: 'casino3Patti', name: '20-20 TEENPATTI' },
  '99.0019': { route: 'casino3Patti', name: '20-20 DRAGON TIGER' },
  '99.0030': { route: 'lucky7', name: 'LUCKY 7' },
  '99.0013': { route: 'oneteenpatti', name: '1DAY TEEN PATTI' },
  '99.0016': { route: 'casino', name: 'JOKER TEEN PATTI' },
  '99.0046': { route: 'casino', name: 'CARD RACE' },
  '99.0018': { route: 'casino', name: 'DRAGON TIGER' },
  '99.0001': { route: 'baccarat', name: 'BACCARAT' },
  '99.0025': { route: 'andarBahar', name: 'ANDAR BAHAR' },
  '99.0022': { route: 'card32', name: '32 CARDS' },
  '99.0007': { route: 'pocker2020', name: 'POKER' },
  '99.0041': { route: 'dtl', name: 'DTL' },
  '99.0021': { route: '1daydragontiger', name: '1 DAY DRAGON TIGER' },
  '99.0014': { route: 'euTeenpatti', name: 'MUFLIS TEEN PATTI' },
  '99.0005': { route: 'ammarAkbar', name: 'AMAR AKBAR ANTHONY' },
};

// A lobby tile's game page, or null when this app has no table for it.
export const gamePath = (eventId) => (GAMES[eventId] ? `/${GAMES[eventId].route}/${eventId}` : null);
