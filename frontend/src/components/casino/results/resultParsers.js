import { cardSrc } from '../cards/cardUtils';

export { cardSrc };

export function parseRdesc(rdesc) {
  if (!rdesc) return {};
  const parts = rdesc.split('#');
  return {
    winner: parts[0] || '',
    suits: parts[1] || '',
    oddEven: parts[2] || '',
    consecutive: parts[3] || '',
  };
}

export function parseDoliDanaRdesc(rdesc) {
  if (!rdesc) return {};
  const parts = rdesc.split('#');
  return {
    turn: parts[0] || '',
    anyPair: parts[1] || 'No',
    particularPair: parts[2] || '-',
    sumTotal: parts[3] || '',
    oddEven: parts[4] || '',
    lucky7: parts[5] || '',
  };
}

export function parseDice(cardString) {
  if (!cardString) return [];
  return cardString.split(',').map((v) => parseInt(v.trim())).filter((n) => !isNaN(n) && n >= 1 && n <= 6);
}

export function parseTeenCards(cardString) {
  if (!cardString) return { playerA: [], playerB: [] };
  const cards = cardString.split(',').map((c) => c.trim());
  return {
    playerA: [cards[0], cards[2], cards[4]].filter(Boolean),
    playerB: [cards[1], cards[3], cards[5]].filter(Boolean),
  };
}

export function parseMogamboCards(cardString) {
  if (!cardString) return { dagaTeja: [], mogambo: [] };
  const cards = cardString.split(',').map((c) => c.trim());
  return {
    dagaTeja: [cards[0], cards[1]].filter(Boolean),
    mogambo: [cards[2]].filter(Boolean),
  };
}

export function parsePoisonCards(cardString) {
  if (!cardString) return { poison: [], playerA: [], playerB: [] };
  const c = cardString.split(',').map((s) => s.trim());
  return { poison: [c[0]].filter(Boolean), playerA: [c[1], c[2], c[3]].filter(Boolean), playerB: [c[4], c[5], c[6]].filter(Boolean) };
}

export function parsePoisonRdesc(rdesc) {
  if (!rdesc) return {};
  const p = rdesc.split('#');
  return { winner: p[0] || '', oddEven: p[1] || '', color: p[2] || '', suit: p[3] || '' };
}

export function parseJokerCards(cardString) {
  if (!cardString) return { joker: [], playerA: [], playerB: [] };
  const c = cardString.split(',').map((s) => s.trim());
  return { joker: [c[0]].filter(Boolean), playerA: [c[1], c[2], c[3]].filter(Boolean), playerB: [c[4], c[5], c[6]].filter(Boolean) };
}

export function parseJoker1Cards(cardString) {
  if (!cardString) return { playerA: [], playerB: [] };
  const c = cardString.split(',').map((s) => s.trim());
  return { playerA: [c[0], c[2], c[4]].filter(Boolean), playerB: [c[1], c[3], c[5]].filter(Boolean) };
}

export function parseJoker20Rdesc(rdesc) {
  if (!rdesc) return {};
  const p = rdesc.split('#');
  return { winner: p[0] || '', oddEven: p[1] || '', color: p[2] || '', suit: p[3] || '' };
}

export function parseBtable2Rdesc(rdesc) {
  if (!rdesc) return {};
  const p = rdesc.split('#');
  return { winner: p[0] || '', odd: p[1] || '', dulhaBarati: p[2] || '', color: p[3] || '', card: p[4] || '' };
}

export function parseTeen20cRdesc(rdesc) {
  if (!rdesc) return {};
  const p = rdesc.split('#');
  const baccParts = (p[1] || '').split('~');
  return {
    winner: p[0] || '',
    baccarat: baccParts[0] || '',
    baccaratScores: baccParts[1] || '',
    total: p[2] || '',
    pairPlus: p[3] || '',
    color: p[4] || '',
  };
}

export function parseTeen9Cards(cardString) {
  if (!cardString) return { tiger: [], lion: [], dragon: [] };
  const c = cardString.split(',').map((s) => s.trim());
  return {
    tiger:  [c[0], c[3], c[6]].filter(Boolean),
    lion:   [c[1], c[4], c[7]].filter(Boolean),
    dragon: [c[2], c[5], c[8]].filter(Boolean),
  };
}

export function parseTeen8Cards(cardString) {
  if (!cardString) return { players: Array(8).fill([]), dealer: [] };
  const c = cardString.split(',').map((s) => s.trim());
  const players = [];
  for (let p = 0; p < 8; p++) {
    players.push([c[p] || '1', c[9 + p] || '1', c[18 + p] || '1']);
  }
  return { players, dealer: [c[8] || '1', c[17] || '1', c[26] || '1'] };
}

export function parseTeen8Rdesc(rdesc) {
  if (!rdesc) return { winners: '', pairPlus: '', totals: [] };
  const parts = rdesc.split('#');
  return {
    winners: (parts[0] || '').trim(),
    pairPlus: (parts[1] || '').trim(),
    totals: (parts[2] || '').split('~').map((s) => s.trim()).filter(Boolean),
  };
}

export function parsePokerCards(cardString) {
  if (!cardString) return { playerA: [], playerB: [], board: [] };
  const c = cardString.split(',').map((s) => s.trim());
  return {
    playerA: [c[0], c[1]].filter(Boolean),
    playerB: [c[2], c[3]].filter(Boolean),
    board: [c[4], c[5], c[6], c[7], c[8]].filter(Boolean),
  };
}

export function parsePokerRdesc(rdesc) {
  if (!rdesc) return { winner: '', other: '' };
  const parts = rdesc.split('#');
  return { winner: parts[0] || '', other: parts[1] || '' };
}

export function parsePoker6Cards(cardString) {
  if (!cardString) return { players: Array(6).fill([]), board: [] };
  const c = cardString.split(',').map((s) => s.trim());
  const players = [];
  // Cards are dealt round-robin: player p holds indices p and p+6 (first pass
  // 0-5 = each player's first card, second pass 6-11 = each player's second),
  // NOT [p*2, p*2+1]. Board follows at 12-16.
  for (let p = 0; p < 6; p++) {
    players.push([c[p] || '1', c[p + 6] || '1']);
  }
  return { players, board: [c[12], c[13], c[14], c[15], c[16]].filter(Boolean) };
}

export function parsePoker6Rdesc(rdesc) {
  if (!rdesc) return { winner: '', pattern: '' };
  const parts = rdesc.split('#');
  return { winner: parts[0] || '', pattern: parts[1] || '' };
}

export function parseBaccaratCards(cardString) {
  if (!cardString) return { player: [], banker: [], p3: null, b3: null };
  const c = cardString.split(',').map((s) => s.trim());
  const player = [c[2], c[0]].filter(Boolean);
  const p3 = c[4] && c[4] !== '1' ? c[4] : null;
  const banker = [c[1], c[3]].filter(Boolean);
  const b3 = c[5] && c[5] !== '1' ? c[5] : null;
  return { player, banker, p3, b3 };
}

export function parseBaccaratRdesc(rdesc) {
  if (!rdesc) return {};
  const p = rdesc.split('#');
  return { winner: p[0] || '', winnerPair: p[1] || '-', perfect: p[2] || '-', either: p[3] || '-', bigSmall: p[4] || '-' };
}

export function parseBaccarat2Cards(cardString) {
  if (!cardString) return { player: [], banker: [], p3: null, b3: null };
  const c = cardString.split(',').map((s) => s.trim());
  return {
    player: [c[2], c[0]].filter(Boolean),
    banker: [c[1], c[3]].filter(Boolean),
    p3: c[4] && c[4] !== '1' ? c[4] : null,
    b3: c[5] && c[5] !== '1' ? c[5] : null,
  };
}

export function parseBaccarat2Rdesc(rdesc) {
  if (!rdesc) return {};
  const p = rdesc.split('#');
  return { winner: p[0] || '', pair: p[1] || '-', score: p[2] || '-' };
}

export function parseMeterCards(cardString) {
  if (!cardString) return { fighterA: '', fighterB: '' };
  const c = cardString.split(',').map((s) => s.trim());
  return { fighterA: c[0] || '', fighterB: c[1] || '' };
}

export function parseMeterRdesc(rdesc) {
  if (!rdesc) return { winner: '', points: '' };
  const p = rdesc.split('#');
  return { winner: p[0] || '', points: p[1] || '' };
}

export function parseDum10Rdesc(rdesc) {
  if (!rdesc) return {};
  const p = rdesc.split('#');
  return { card: p[0] || '', currTotal: p[1] || '', total: p[2] || '', oddEven: p[3] || '', redBlack: p[4] || '' };
}

export function parseDtCards(cardString) {
  if (!cardString) return { dragon: '', tiger: '' };
  const c = cardString.split(',').map((s) => s.trim());
  return { dragon: c[0] || '', tiger: c[1] || '' };
}

export function parseDtRdesc(rdesc) {
  if (!rdesc) return {};
  const p = rdesc.split('#');
  return { winner: p[0] || '', pair: p[1] || '', oddEven: p[2] || '', color: p[3] || '', card: p[4] || '' };
}
