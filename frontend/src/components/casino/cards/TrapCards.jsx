import { useMemo } from 'react';
import { cardSrc } from '../results/resultParsers';

function cardValue(code) {
  if (!code) return 0;
  const val = code.replace(/[SSDDHHCC]/g, '');
  if (val === '1' || val === 'A') return 1;
  if (val === 'J') return 11;
  if (val === 'Q') return 12;
  if (val === 'K') return 13;
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

export default function TrapCards({ cardString }) {
  const { aCards, bCards, aTotal, bTotal } = useMemo(() => {
    if (!cardString) return { aCards: [], bCards: [], aTotal: 0, bTotal: 0 };
    // Undealt slots arrive as bare placeholders ("1"/"0" with no suit); a real
    // dealt card always carries a suit (S/D/H/C). Drop the placeholders — they
    // were being scored as Ace = 1 each and inflating the running total (e.g.
    // "9CC,AHH,2SS,8CC,10HH,1,1,…" showed A:25/B:14 instead of A:21/B:9). They
    // also should not render as extra cards while the round is still dealing.
    const all = cardString
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .filter((c) => /[SDHC]/i.test(c));
    const a = [];
    const b = [];
    for (let i = 0; i < all.length; i++) {
      if (i % 2 === 0) a.push(all[i]);
      else b.push(all[i]);
    }
    return {
      aCards: a,
      bCards: b,
      aTotal: a.reduce((s, c) => s + cardValue(c), 0),
      bTotal: b.reduce((s, c) => s + cardValue(c), 0),
    };
  }, [cardString]);

  return (
    <div className="casino-video-cards-container">
      <div className="row row5">
        <div className="col-6 text-center">
          <span><b>A</b> <div className="player-count">{aTotal}</div></span>
        </div>
        <div className="col-6 text-center">
          <span><b>B</b> <div className="player-count">{bTotal}</div></span>
        </div>
      </div>
      <div className="row row5">
        <div className="col-6 text-center">
          <div className="d-inline-block w-100 v-slider">
            <div style={{ display: 'none' }}><i className="fas fa-angle-up"></i></div>
            <div className="v-slider-outer" style={{ overflow: 'hidden', height: '255px' }}>
              {aCards.map((c, i) => (
                <div key={i} style={{ height: '51px' }}>
                  <img src={cardSrc(c)} className="w-100" alt={c} />
                </div>
              ))}
            </div>
            <div style={{ display: 'none' }}><i className="fas fa-angle-down"></i></div>
          </div>
        </div>
        <div className="col-6 text-center">
          <div className="d-inline-block w-100 v-slider">
            <div style={{ display: 'none' }}><i className="fas fa-angle-up"></i></div>
            <div className="v-slider-outer" style={{ overflow: 'hidden', height: '255px' }}>
              {bCards.map((c, i) => (
                <div key={i} style={{ height: '51px' }}>
                  <img src={cardSrc(c)} className="w-100" alt={c} />
                </div>
              ))}
            </div>
            <div style={{ display: 'none' }}><i className="fas fa-angle-down"></i></div>
          </div>
        </div>
      </div>
    </div>
  );
}
