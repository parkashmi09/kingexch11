import { memo, useState } from 'react';
import { cardSrc, parseCards } from './cards/cardUtils';

function findBySid(sub, sid) {
  return sub.find((s) => s.sid === sid);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

// Cards are dealt ROUND-ROBIN, one to each player per pass (not two-at-a-time):
// deal order 0..5 = each player's FIRST card (P1..P6), 6..11 = each player's
// SECOND card (P1..P6). So Player N holds card indices [N-1, N-1+6]. Board cards
// follow at 12..16. Verified against a settled round (winnat "Player 2#Pair":
// round-robin gives P2 = A♦,6♣ → pair of aces = winner; the old [2i,2i+1] block
// mapping wrongly gave the win to Player 1).
const PLAYERS = [
  { label: 'Player 1', sid: 11, cardIdx: [0, 6] },
  { label: 'Player 2', sid: 12, cardIdx: [1, 7] },
  { label: 'Player 3', sid: 13, cardIdx: [2, 8] },
  { label: 'Player 4', sid: 14, cardIdx: [3, 9] },
  { label: 'Player 5', sid: 15, cardIdx: [4, 10] },
  { label: 'Player 6', sid: 16, cardIdx: [5, 11] },
];

const PATTERNS = [
  { label: 'High Card',       sid: 21 },
  { label: 'Pair',            sid: 22 },
  { label: 'Two Pair',        sid: 23 },
  { label: 'Three of a Kind', sid: 24 },
  { label: 'Straight',        sid: 25 },
  { label: 'Flush',           sid: 26 },
  { label: 'Full House',      sid: 27 },
  { label: 'Four of a Kind',  sid: 28 },
  { label: 'Straight Flush',  sid: 29 },
];

const FULL_BOX_SIDS = new Set([27, 28, 29]);

function expoSpan(exposures, name) {
  const exp = exposures?.[name] || 0;
  if (exp === 0) return <span className="w-100 d-none">0</span>;
  return <span className={`w-100 ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</span>;
}

const BetTablePoker6 = memo(function BetTablePoker6({ gameData, onBet, exposures }) {
  const [activeTab, setActiveTab] = useState('hands');
  const sub = gameData?.sub || [];
  const cardString = gameData?.card ?? '';
  const codes = parseCards(cardString);
  const remark = gameData?.remark ?? '';

  const handleBet = onBet || (() => {});

  return (
    <>
      {/* ── Desktop layout ── */}
      <div className="d-none-small">
        <div className="casino-box">
          <div className="teen1daycasino-container">
            <div className="teen1dayleft">
              <h4 className="playera">Hands</h4>
              <div className="casino-row-container">
                {PLAYERS.map((p) => {
                  const item = findBySid(sub, p.sid);
                  const c1 = codes[p.cardIdx[0]] || '1';
                  const c2 = codes[p.cardIdx[1]] || '1';
                  return (
                    <div className="casino-col-container" key={p.sid}>
                      <div className="casino-box-row">
                        <div className="w-100 mb-1 pr"><b>{p.label}</b></div>
                        <div
                          className={`poker6box${suspCls(item)}`}
                          onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                        >
                          <div className="casino-nation-name">
                            <div>
                              <span className="player-card"><span><img src={cardSrc(c1)} alt={c1} /></span></span>
                              <span className="player-card"><span><img src={cardSrc(c2)} alt={c2} /></span></span>
                            </div>
                            <span className="float-right mr-1 flex-odds">
                              <b className="d-block text-right">{item?.b ?? 0}</b>
                              {expoSpan(exposures, item?.nat)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="teen1daycenter"></div>
            <div className="teen1dayright pattern">
              <h4>Pattern</h4>
              <div className="casino-row-container">
                {PATTERNS.map((pt) => {
                  const item = findBySid(sub, pt.sid);
                  const extraCls = FULL_BOX_SIDS.has(pt.sid) ? ' fullbox' : '';
                  return (
                    <div className={`casino-col-container${extraCls}`} key={pt.sid}>
                      <div className="casino-box-row">
                        <div
                          className={`poker6box${suspCls(item)}`}
                          onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                        >
                          <div className="casino-nation-name">
                            <div><b>{pt.label}</b></div>
                            <div className="flex-odds">
                              <span className="d-block text-right"><b>{item?.b ?? 0}</b></span>
                              {expoSpan(exposures, item?.nat)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="d-none-big">
        <div className="casino-tabs">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a
                href="#hands"
                data-toggle="tab"
                className={`nav-link${activeTab === 'hands' ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('hands'); }}
              >
                Hands
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#pattern"
                data-toggle="tab"
                className={`nav-link${activeTab === 'pattern' ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('pattern'); }}
              >
                Pattern
              </a>
            </li>
          </ul>
        </div>
        <div className="casino-box mb-2 tab-content">
          <div id="hands" className={`tab-pane hands${activeTab === 'hands' ? ' active' : ''}`}>
            <div className="casino-row-container">
              {PLAYERS.map((p) => {
                const item = findBySid(sub, p.sid);
                const c1 = codes[p.cardIdx[0]] || '1';
                const c2 = codes[p.cardIdx[1]] || '1';
                return (
                  <div className="casino-col-container" key={p.sid}>
                    <div className="casino-box-row">
                      <div className="w-100 mb-1 pr"><b>{p.label}</b></div>
                      <div
                        className={`poker6box${suspCls(item)}`}
                        onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                      >
                        <div className="casino-nation-name">
                          <div>
                            <span className="player-card"><span><img src={cardSrc(c1)} alt={c1} /></span></span>
                            <span className="player-card"><span><img src={cardSrc(c2)} alt={c2} /></span></span>
                          </div>
                          <span className="text-right mr-1 flex-odds">
                            <b className="d-block w-100">{item?.b ?? 0}</b>
                            {expoSpan(exposures, item?.nat)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div id="pattern" className={`tab-pane fade pattern${activeTab === 'pattern' ? ' active' : ''}`}>
            <div className="casino-row-container">
              {PATTERNS.map((pt) => {
                const item = findBySid(sub, pt.sid);
                return (
                  <div className="casino-col-container" key={pt.sid}>
                    <div className="casino-box-row">
                      <div
                        className={`poker6box${suspCls(item)}`}
                        onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
                      >
                        <div className="casino-nation-name">
                          <div><b>{pt.label}</b></div>
                          <div className="flex-odds">
                            <span className="d-block text-right"><b>{item?.b ?? 0}</b></span>
                            {expoSpan(exposures, item?.nat)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Remark marquee */}
      <div className="casino-remark mt-1">
        <div className="remark-icon"><img src="/assets/icons/remark.png" alt="remark" /></div>
        <div className={`marquee-wrapper${!remark.trim() ? ' no-marquee' : ''}`}>
          <div
            className="marquee-content"
            style={{ animationDuration: remark.trim() ? '25s' : '0s' }}
          >
            {remark.trim() || ''}
          </div>
        </div>
      </div>
    </>
  );
});

export default BetTablePoker6;
