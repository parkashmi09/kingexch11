// Casino book resolver — open bets se har selection ki book CALCULATE hoti
// hai (exposure API ki jagah). User perspective:
//   BACK S (odds o, stake st) → book[S] += (o-1)*st, usi market ke baaki -st
//   LAY  S (odds o, stake st) → book[S] -= (o-1)*st, baaki +st
// e.g. Ronaldo back 100 @ 6.53 → Ronaldo +553 (book-green), baaki -100
// (book-red); Header Goal back 100 @ 4.2 → Header +320, baaki -100.
// (Admin panel me yahi formula inverted sign se hai — admin ki book user
// ke opposite hoti hai.)

// markets = [{ sid, nat }] groups. Book `sid:<sid>` keys se (same naam do
// markets me ho — goal2 "No Goal" — to leak na ho); unique naam pe plain
// nat key bhi (legacy tables nat se lookup karte hain).
export function computeUserBook(bets = [], markets = []) {
  const bySid = {}
  markets.forEach((sels) => sels.forEach(({ sid }) => {
    bySid[`sid:${sid}`] = 0
  }))

  bets.forEach((bet) => {
    const sel = bet.selection || bet.player_name || bet.nation || bet.nat || ''
    const odds = parseFloat(bet.odds ?? bet.rate) || 0
    const stake = parseFloat(bet.stake ?? bet.amount) || 0
    const isLay = String(bet.type || bet.betType || '').toLowerCase() === 'lay'
    if (!sel || !odds || !stake) return

    // NOTE: bet me sirf naam hota hai — same naam do markets me ho to
    // pehla matching market use hota hai
    const market = markets.find((m) => m.some((x) => x.nat === sel))
    if (!market) return

    market.forEach(({ sid, nat }) => {
      const delta = nat === sel
        ? (isLay ? -1 : 1) * (odds - 1) * stake
        : (isLay ? 1 : -1) * stake
      bySid[`sid:${sid}`] += delta
    })
  })

  const natCount = {}
  markets.forEach((sels) => sels.forEach(({ nat }) => {
    natCount[nat] = (natCount[nat] || 0) + 1
  }))
  const book = { ...bySid }
  markets.forEach((sels) => sels.forEach(({ sid, nat }) => {
    if (natCount[nat] === 1) book[nat] = bySid[`sid:${sid}`]
  }))

  return book
}

// Market groups game data (sub[]) ke etype se bante hain (reference-verified):
//   - etype match  -> same subtype ke selections EK market (book spread hota
//     hai — e.g. goal2 players, dolidana main: B back 100@1.97 -> B -97, A +100)
//   - etype fancy* -> har selection APNA single market (spread nahi — e.g.
//     dolidana Even back 100@1.95 -> Even -95, Odd 0)
export function getMarketsForGame(gameType, gameObj) {
  const sub = gameObj?.sub || []
  if (!sub.length) return []

  const groups = {}
  const singles = []
  sub.forEach((s) => {
    if (!s.nat) return
    const entry = { sid: s.sid, nat: s.nat }
    if (String(s.etype || '').toLowerCase().startsWith('fancy')) {
      singles.push([entry])
    } else {
      const key = s.subtype || 'main'
      ;(groups[key] = groups[key] || []).push(entry)
    }
  })
  return [...Object.values(groups), ...singles]
}
