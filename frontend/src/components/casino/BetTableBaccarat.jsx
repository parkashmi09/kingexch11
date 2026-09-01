import { memo, useState } from 'react';
import { parseCards, cardSrc } from './cards/cardUtils';

/**
 * 3D Pie chart matching Google Charts output from reference.
 * CW from top: Player (blue) → Banker (red) → Tie (green)
 */
function PieChartSvg({ pPct, bPct, tPct, w, h, cx, cy, rx, ry, dep, fs }) {
  const rad = (pct) => (pct / 100) * 2 * Math.PI;
  const start = -Math.PI / 2;
  const a1 = start + rad(pPct);
  const a2 = a1 + rad(bPct);
  const px2 = (a) => cx + rx * Math.cos(a);
  const py2 = (a) => cy + ry * Math.sin(a);
  const pEnd = [px2(a1), py2(a1)];
  const bEnd = [px2(a2), py2(a2)];
  const tf = 0.65;
  const txtPos = (aS, aE) => {
    const mid = (aS + aE) / 2;
    return [cx + rx * tf * Math.cos(mid), cy + ry * tf * Math.sin(mid)];
  };
  const [pTx, pTy] = txtPos(start, a1);
  const [bTx, bTy] = txtPos(a1, a2);
  const [tTx, tTy] = txtPos(a2, start + 2 * Math.PI);
  const lx = w - (w === 406 ? 136 : 61); // legend x

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <div dir="ltr" style={{ position: 'relative', width: w, height: h }}>
          <div aria-label="A chart." style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
            <svg width={w} height={h} aria-label="A chart." style={{ overflow: 'hidden' }}>
              <defs />
              <g>
                <rect x={lx} y="3" width={w-lx} height="42" stroke="none" strokeWidth="0" fillOpacity="0" fill="#ffffff" />
                <g><rect x={lx} y="3" width={w-lx} height={fs+1} stroke="none" strokeWidth="0" fillOpacity="0" fill="#ffffff" /><g><text textAnchor="start" x={lx+14} y={3+fs*0.85} fontFamily="Arial" fontSize={fs} stroke="none" strokeWidth="0" fill="#222222">Player</text></g><circle cx={lx+5} cy={3+(fs+1)/2} r={fs/2} stroke="none" strokeWidth="0" fill="#086cb8" /></g>
                <g><rect x={lx} y={3+fs+3} width={w-lx} height={fs+1} stroke="none" strokeWidth="0" fillOpacity="0" fill="#ffffff" /><g><text textAnchor="start" x={lx+14} y={3+fs+3+fs*0.85} fontFamily="Arial" fontSize={fs} stroke="none" strokeWidth="0" fill="#222222">Banker</text></g><circle cx={lx+5} cy={3+fs+3+(fs+1)/2} r={fs/2} stroke="none" strokeWidth="0" fill="#ae2130" /></g>
                <g><rect x={lx} y={3+2*(fs+3)} width={w-lx} height={fs+1} stroke="none" strokeWidth="0" fillOpacity="0" fill="#ffffff" /><g><text textAnchor="start" x={lx+14} y={3+2*(fs+3)+fs*0.85} fontFamily="Arial" fontSize={fs} stroke="none" strokeWidth="0" fill="#222222">Tie</text></g><circle cx={lx+5} cy={3+2*(fs+3)+(fs+1)/2} r={fs/2} stroke="none" strokeWidth="0" fill="#279532" /></g>
              </g>
              <g>
                <path d={`M${cx+rx},${cy}L${cx+rx},${cy+dep}A${rx},${ry},0,0,1,${pEnd[0]},${pEnd[1]+dep}L${pEnd[0]},${pEnd[1]}A${rx},${ry},0,0,0,${cx+rx},${cy}`} stroke="#06518a" strokeWidth="1" fill="#06518a" />
                <path d={`M${cx},${cy}L${cx},${cy+dep}L${pEnd[0]},${pEnd[1]+dep}L${pEnd[0]},${pEnd[1]}`} stroke="#06518a" strokeWidth="1" fill="#06518a" />
                <path d={`M${cx},${cy}L${cx},${cy-ry}A${rx},${ry},0,${pPct>50?1:0},1,${pEnd[0]},${pEnd[1]}L${cx},${cy}A0,0,0,0,0,${cx},${cy}`} stroke="#086cb8" strokeWidth="1" fill="#086cb8" />
                <text textAnchor="start" x={pTx-8} y={pTy+3} fontFamily="Arial" fontSize={fs} stroke="none" strokeWidth="0" fill="#ffffff">{pPct}%</text>
              </g>
              <g>
                <path d={`M${cx},${cy}L${cx},${cy+dep}L${bEnd[0]},${bEnd[1]+dep}L${bEnd[0]},${bEnd[1]}`} stroke="#1d7026" strokeWidth="1" fill="#1d7026" />
                <path d={`M${cx},${cy}L${bEnd[0]},${bEnd[1]}A${rx},${ry},0,${tPct>50?1:0},1,${cx},${cy-ry}L${cx},${cy}A0,0,0,0,0,${cx},${cy}`} stroke="#279532" strokeWidth="1" fill="#279532" />
                {tPct > 5 && <text textAnchor="start" x={tTx-8} y={tTy+3} fontFamily="Arial" fontSize={fs} stroke="none" strokeWidth="0" fill="#ffffff">{tPct}%</text>}
              </g>
              <g>
                <path d={`M${pEnd[0]},${pEnd[1]}L${pEnd[0]},${pEnd[1]+dep}A${rx},${ry},0,0,1,${cx-rx},${cy+dep}L${cx-rx},${cy}A${rx},${ry},0,0,0,${pEnd[0]},${pEnd[1]}`} stroke="#831924" strokeWidth="1" fill="#831924" />
                <path d={`M${cx},${cy}L${pEnd[0]},${pEnd[1]}A${rx},${ry},0,${bPct>50?1:0},1,${bEnd[0]},${bEnd[1]}L${cx},${cy}A0,0,0,0,0,${cx},${cy}`} stroke="#ae2130" strokeWidth="1" fill="#ae2130" />
                <text textAnchor="start" x={bTx-8} y={bTy+3} fontFamily="Arial" fontSize={fs} stroke="none" strokeWidth="0" fill="#ffffff">{bPct}%</text>
              </g>
              <g />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function BaccaratPieChart({ p, b, t }) {
  const total = p + b + t || 1;
  const pPct = Math.round((p / total) * 100);
  const bPct = Math.round((b / total) * 100);
  const tPct = 100 - pPct - bPct;

  return (
    <>
      {/* Desktop chart (small, 202x160) */}
      <div className="d-none-mobile">
        <PieChartSvg pPct={pPct} bPct={bPct} tPct={tPct} w={202} h={160} cx={65} cy={73.9} rx={61} ry={48.8} dep={12.2} fs={9} />
      </div>
      {/* Mobile chart (wide, 406x160) */}
      <div className="d-none-desktop">
        <PieChartSvg pPct={pPct} bPct={bPct} tPct={tPct} w={406} h={160} cx={131} cy={72.3} rx={77} ry={61.6} dep={15.4} fs={10} />
      </div>
    </>
  );
}

function expoVal(exposures, name) {
  const exp = exposures?.[name] || 0;
  if (exp === 0) return <div className="baccarat-odd-val d-none">0</div>;
  return <div className={`baccarat-odd-val ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</div>;
}

function expoBetsVal(exposures, name) {
  const exp = exposures?.[name] || 0;
  if (exp === 0) return <div className="baccarat-bets-val d-none">0</div>;
  return <div className={`baccarat-bets-val ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</div>;
}

const BetTableBaccarat = memo(function BetTableBaccarat({ gameData, onBet, stats, exposures }) {
  const [statsOpen, setStatsOpen] = useState(true);
  const sub = gameData?.sub ?? [];

  const getBySid = (sid) => sub.find((s) => s.sid === sid) || {};

  const perfectPair = getBySid(6);
  const big = getBySid(7);
  const small = getBySid(8);
  const eitherPair = getBySid(9);
  const playerPair = getBySid(4);
  const player = getBySid(1);
  const tie = getBySid(3);
  const banker = getBySid(2);
  const bankerPair = getBySid(5);

  const isSuspended = (item) => item?.gstatus === 'SUSPENDED';

  // The feed quotes NET ("to 1") odds in `b` — Player/Banker 1:1, Tie 8:1,
  // Pairs 11:1, Perfect 25:1, Either 5:1, Big 0.54:1, Small 1.5:1 — and the UI
  // prints them as "b:1". settleBetCommon pays stake × DECIMAL odds, so the bet
  // must be placed at b+1 (an even-money win must return 2× the stake, not 1×;
  // Big at 0.54 must return 1.54×, never less than the stake). `_netOdds` tells
  // useCasinoBet's buffer to re-derive the same decimal from the live `b`.
  const betNet = (item) => {
    if (!onBet || !item) return;
    const b = parseFloat(item.b);
    // Tie pays "8 for 1" (rules) → decimal = b; every other selection is "to 1"
    // → decimal = b+1. (Player even money 1:1 → 2.0; Big 0.54:1 → 1.54; etc.)
    const dec = item.nat === 'Tie' ? b : (b > 0 ? b + 1 : b);
    onBet(item.sid, 'back', dec, { ...item, _netOdds: true });
  };

  // Cards dealt alternating: P1, B1, P2, B2, P3(optional), B3(optional)
  // Display order is reversed: show 2nd card first, then 1st card
  const cards = parseCards(gameData?.card ?? '');
  const playerCards = [cards[2], cards[0]].filter(Boolean);
  const playerCard3 = cards[4] || null;
  const bankerCards = [cards[1], cards[3]].filter(Boolean);
  const bankerCard3 = cards[5] || null;

  const allSuspended = isSuspended(player) && isSuspended(banker) && isSuspended(tie);

  return (
    <>
    <div className="baccarat-bets-odds">
      <div className="baccarat-odds">
        <div
          className="baccarat-odd-block"
          onClick={() => !isSuspended(perfectPair) && betNet(perfectPair)}
          role="button"
        >
          <div className={`baccarat-odd-name${isSuspended(perfectPair) ? ' suspended' : ''}`}>Perfect Pair {perfectPair.b ?? 25}:1</div>
          {expoVal(exposures, 'Perfect Pair')}
        </div>
        <div
          className="baccarat-odd-block"
          onClick={() => !isSuspended(big) && betNet(big)}
          role="button"
        >
          <div className={`baccarat-odd-name${isSuspended(big) ? ' suspended' : ''}`}>Big {big.b ?? 0.54}:1</div>
          {expoVal(exposures, 'Big')}
        </div>
        <div
          className="baccarat-odd-block"
          onClick={() => !isSuspended(small) && betNet(small)}
          role="button"
        >
          <div className={`baccarat-odd-name${isSuspended(small) ? ' suspended' : ''}`}>Small {small.b ?? 1.5}:1</div>
          {expoVal(exposures, 'Small')}
        </div>
        <div
          className="baccarat-odd-block"
          onClick={() => !isSuspended(eitherPair) && betNet(eitherPair)}
          role="button"
        >
          <div className={`baccarat-odd-name${isSuspended(eitherPair) ? ' suspended' : ''}`}>Either Pair {eitherPair.b ?? 5}:1</div>
          {expoVal(exposures, 'Either Pair')}
        </div>
      </div>

      <div className="baccarat-bets">
        <div
          className="player-pair"
          onClick={() => !isSuspended(playerPair) && betNet(playerPair)}
          role="button"
        >
          <div className={`baccarat-bets-name${isSuspended(playerPair) ? ' suspended' : ''}`}>
            <div>Player Pair</div>
            <div className="mb-0">{playerPair.b ?? 11}:1</div>
          </div>
          {expoBetsVal(exposures, 'Player Pair')}
        </div>

        <div
          className="player"
          onClick={() => !isSuspended(player) && betNet(player)}
          role="button"
        >
          <div className={`baccarat-bets-name${isSuspended(player) ? ' suspended' : ''}`}>
            <div>Player {player.b ?? 1}:1</div>
            <div className="mb-0">
              {playerCard3 && playerCard3 !== '1' && (
                <span className="l-rotate"><img src={cardSrc(playerCard3)} alt="" /></span>
              )}
              {playerCards.map((c, i) => (
                <span key={i}><img src={cardSrc(c)} alt="" /></span>
              ))}
            </div>
          </div>
          {expoBetsVal(exposures, 'Player')}
        </div>

        <div
          className="tie"
          onClick={() => !isSuspended(tie) && betNet(tie)}
          role="button"
        >
          <div className={`baccarat-bets-name${isSuspended(tie) ? ' suspended' : ''}`}>
            <div>Tie</div>
            <div className="mb-0">{tie.b ?? 8}:1</div>
          </div>
          {expoBetsVal(exposures, 'Tie')}
        </div>

        <div
          className="banker"
          onClick={() => !isSuspended(banker) && betNet(banker)}
          role="button"
        >
          <div className={`baccarat-bets-name${isSuspended(banker) ? ' suspended' : ''}`}>
            <div>Banker {banker.b ?? 1}:1</div>
            <div className="mb-0">
              {bankerCards.map((c, i) => (
                <span key={i}><img src={cardSrc(c)} alt="" /></span>
              ))}
              {bankerCard3 && bankerCard3 !== '1' && (
                <span><img src={cardSrc(bankerCard3)} alt="" /></span>
              )}
            </div>
          </div>
          {expoBetsVal(exposures, 'Banker')}
        </div>

        <div
          className="banker-pair"
          onClick={() => !isSuspended(bankerPair) && betNet(bankerPair)}
          role="button"
        >
          <div className={`baccarat-bets-name${isSuspended(bankerPair) ? ' suspended' : ''}`}>
            <div>Banker Pair</div>
            <div className="mb-0">{bankerPair.b ?? 11}:1</div>
          </div>
          {expoBetsVal(exposures, 'Banker Pair')}
        </div>
      </div>
    </div>

    <div className="statistics">
      <div className="statistics-title" onClick={() => setStatsOpen((v) => !v)} style={{ cursor: 'pointer' }}>
        Statistics
        <span><i className={`fas fa-angle-${statsOpen ? 'up' : 'down'}`}></i></span>
      </div>
      <div className="statistics-conten1t" style={statsOpen ? {} : { display: 'none' }}>
        {stats && <BaccaratPieChart p={parseFloat(stats.p) || 0} b={parseFloat(stats.b) || 0} t={parseFloat(stats.t) || 0} />}
      </div>
    </div>
    </>
  );
});

export default BetTableBaccarat;
