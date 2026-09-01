import { useState } from 'react';
import { isLaySide } from './placeBet/placeBetRules';

/**
 * Matched Bets list — shared by the cricket (GameDetails) mobile tab and the
 * racing page (mobile tab + desktop "My Bet" sidebar panel).
 *
 * By Date / By Bet / Average radios above the table (shown only when there
 * ARE bets — the empty state is just the bare table).
 *   By Date / By Bet — per user spec: ALL LAY bets first, then all BACK,
 *              keeping the feed order within each side (no date/market sort)
 *   Average  — only odds-type bets (match odds / bookmaker) merge, per
 *              selection+side: stake-weighted avg odds (back .toFixed(3),
 *              lay .toFixed(2)), summed stake; back groups listed before lay
 *              groups; fancy/session bets pass through unmerged (semantics
 *              from the reference bundle's dataFilterBy in frontend/excpeted.txt)
 *
 * `title`    — optional label rendered inside the same bet-title row as the
 *              radios (the desktop sidebar panel shows "Matched Bets" there).
 * `idSuffix` — keeps radio input ids unique when the component mounts more
 *              than once on a page (mobile tab + desktop sidebar).
 */
export default function MatchedBetsTable({ bets = [], title = null, idSuffix = '1' }) {
  const [mode, setMode] = useState('date');
  const ts = (b) => new Date(b.timestamp || b.created_at || b.createdAt || 0).getTime() || Number(b.id) || 0;
  const marketOf = (b) => b.market_type || b.marketType || '';
  const runnerOf = (b) => b.teamName || b.selection_name || '';

  // Fancy/session bets never merge in Average — the reference only groups
  // gtype match/match1/match2 (match odds / bookmaker style markets).
  const isFancy = (b) => {
    const gt = String(b.game_type || b.gtype || '').toLowerCase();
    return gt === 'fan' || gt === 'fancy';
  };

  let rows;
  if (mode === 'average') {
    const backGroups = new Map();
    const layGroups = new Map();
    const passThrough = [];
    for (const b of [...bets].sort((a, c) => ts(a) - ts(c))) {
      if (isFancy(b)) { passThrough.push(b); continue; }
      const groups = isLaySide(b.betType) ? layGroups : backGroups;
      const key = `${marketOf(b)}|${runnerOf(b)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(b);
    }
    // Stake-weighted average odds; the reference formats the two sides
    // differently: BACK rows pad to 3 decimals (4.81 → "4.810"), LAY rows to
    // 2 ((2.76 & 2.88)@100 each → "2.82"); stakes always get 2 decimals.
    const merge = (list, lay) => {
      const totalStake = list.reduce((s, b) => s + (Number(b.stake) || 0), 0);
      const avgOdds = totalStake > 0
        ? list.reduce((s, b) => s + (Number(b.odds) || 0) * (Number(b.stake) || 0), 0) / totalStake
        : Number(list[0].odds) || 0;
      return { ...list[0], odds: lay ? avgOdds.toFixed(2) : avgOdds.toFixed(3), stake: totalStake.toFixed(2) };
    };
    rows = [
      ...[...backGroups.values()].map((l) => merge(l, false)),
      ...[...layGroups.values()].map((l) => merge(l, true)),
      ...passThrough,
    ];
  } else {
    // By Date and By Bet (user-specified): ALL LAY bets first, then all BACK,
    // keeping the feed order within each side — no date/market re-sorting.
    rows = [...bets.filter((b) => isLaySide(b.betType)), ...bets.filter((b) => !isLaySide(b.betType))];
  }

  return (
    <>
      {bets.length > 0 && (
        <div className="bet-title">
          {title ? <span>{title}</span> : null}
          <div>
            {[['date', 'By Date'], ['bet', 'By Bet'], ['average', 'Average']].map(([val, label]) => (
              <div key={val} className="custom-control custom-radio custom-control-inline">
                <input
                  value={val}
                  id={`${val}${idSuffix}`}
                  type="radio"
                  name={`optradio${idSuffix}`}
                  checked={mode === val}
                  onChange={() => setMode(val)}
                  className="custom-control-input"
                />
                <label htmlFor={`${val}${idSuffix}`} className="custom-control-label">{label}</label>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="collapse show w-100">
        <table className="coupon-table table table-borderedless">
          <thead>
            <tr className="theme1font">
              <th style={{ width: '25%' }}>Match Name</th>
              <th style={{ width: '40%' }}>Nation</th>
              <th className="text-right">Odds</th>
              <th className="text-right p-r-15">Stake</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan="4" className="text-center">No Record Found</td></tr>
            ) : (
              rows.map((bet, i) => (
                <tr key={bet.id ?? i} className={isLaySide(bet.betType) ? 'lay' : 'back'}>
                  <td><span>{marketOf(bet)}</span></td>
                  <td><span>{runnerOf(bet)}</span></td>
                  <td className="text-right">{bet.odds ?? ''}</td>
                  <td className="text-right p-r-15">{bet.stake ?? ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
