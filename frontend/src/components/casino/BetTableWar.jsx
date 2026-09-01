import { memo, useState } from 'react';
import { cardSrc, parseCards } from './cards/cardUtils';

const CARD_IMG_BASE = '/assets/front/img/cards';

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

/**
 * SID layout per player N (1-based):
 *   Winner N  = (N-1)*10 + 1
 *   Black N   = (N-1)*10 + 2
 *   Red N     = (N-1)*10 + 3
 *   Odd N     = (N-1)*10 + 4
 *   Even N    = (N-1)*10 + 5
 *   Spade N   = (N-1)*10 + 6
 *   Club N    = (N-1)*10 + 7
 *   Heart N   = (N-1)*10 + 8
 *   Diamond N = (N-1)*10 + 9
 */

const PLAYERS = [1, 2, 3, 4, 5, 6];

function getPlayerItems(sub, playerNum) {
  const n = playerNum;
  return {
    winner:  findByNat(sub, `Winner ${n}`),
    black:   findByNat(sub, `Black ${n}`),
    red:     findByNat(sub, `Red ${n}`),
    odd:     findByNat(sub, `Odd ${n}`),
    even:    findByNat(sub, `Even ${n}`),
    spade:   findByNat(sub, `Spade ${n}`),
    club:    findByNat(sub, `Club ${n}`),
    heart:   findByNat(sub, `Heart ${n}`),
    diamond: findByNat(sub, `Diamond ${n}`),
  };
}

const BackCell = memo(function BackCell({ item, onBet, exposures }) {
  const susp = isSusp(item);
  return (
    <div className="casino-bl-box">
      <div
        className={`back casino-bl-box-item${suspCls(item)}`}
        onClick={susp ? undefined : () => onBet(item.sid, 'back', item.b, item)}
      >
        <span className="casino-box-odd">{item?.b ?? 0}</span>
        <ExposureSpan value={exposures?.[item?.nat]} />
      </div>
    </div>
  );
});

function ExposureSpan({ value }) {
  if (!value || value === 0) return null;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className="casino-box-expo" style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
      {value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
    </span>
  );
}

/** Mobile tab panel for one player */
function MobilePlayerTab({ p, n, onBet, exposures }) {
  return (
    <div className="teen1daycasino-container">
      <div className="teen1dayleft">
        <div className="casino-war-container">
          {/* Winner */}
          <div className="casino-box-row">
            <div className="casino-nation-name"><b>Winner {n}</b></div>
            <BackCell item={p.winner} onBet={onBet} exposures={exposures} />
          </div>
          {/* Black (Spade+Club) */}
          <div className="casino-box-row">
            <div className="casino-nation-name casino-card-img">
              <span>
                <img src={`${CARD_IMG_BASE}/spade.png`} alt="spade" />
                {' '}<img src={`${CARD_IMG_BASE}/club.png`} alt="club" />
              </span>
            </div>
            <BackCell item={p.black} onBet={onBet} exposures={exposures} />
          </div>
          {/* Red (Heart+Diamond) */}
          <div className="casino-box-row">
            <div className="casino-nation-name casino-card-img">
              <span>
                <img src={`${CARD_IMG_BASE}/heart.png`} alt="heart" />
                {' '}<img src={`${CARD_IMG_BASE}/diamond.png`} alt="diamond" />
              </span>
            </div>
            <BackCell item={p.red} onBet={onBet} exposures={exposures} />
          </div>
          {/* Odd */}
          <div className="casino-box-row">
            <div className="casino-nation-name casino-card-img"><b>Odd {n}</b></div>
            <BackCell item={p.odd} onBet={onBet} exposures={exposures} />
          </div>
          {/* Even */}
          <div className="casino-box-row">
            <div className="casino-nation-name casino-card-img"><b>Even {n}</b></div>
            <BackCell item={p.even} onBet={onBet} exposures={exposures} />
          </div>
        </div>
      </div>
      <div className="teen1daycenter"></div>
      <div className="teen1dayright">
        <div className="casino-war-container">
          {/* Spade */}
          <div className="casino-box-row">
            <div className="casino-nation-name casino-card-img">
              <span><img src={`${CARD_IMG_BASE}/spade.png`} alt="spade" /></span>
            </div>
            <BackCell item={p.spade} onBet={onBet} exposures={exposures} />
          </div>
          {/* Heart */}
          <div className="casino-box-row">
            <div className="casino-nation-name casino-card-img">
              <span><img src={`${CARD_IMG_BASE}/heart.png`} alt="heart" /></span>
            </div>
            <BackCell item={p.heart} onBet={onBet} exposures={exposures} />
          </div>
          {/* Club */}
          <div className="casino-box-row">
            <div className="casino-nation-name casino-card-img">
              <span><img src={`${CARD_IMG_BASE}/club.png`} alt="club" /></span>
            </div>
            <BackCell item={p.club} onBet={onBet} exposures={exposures} />
          </div>
          {/* Diamond */}
          <div className="casino-box-row">
            <div className="casino-nation-name casino-card-img">
              <span><img src={`${CARD_IMG_BASE}/diamond.png`} alt="diamond" /></span>
            </div>
            <BackCell item={p.diamond} onBet={onBet} exposures={exposures} />
          </div>
        </div>
      </div>
    </div>
  );
}

const BetTableWar = memo(function BetTableWar({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const cardString = gameData?.card ?? '';
  const handleBet = onBet || (() => {});
  const [activeTab, setActiveTab] = useState(0);

  const codes = parseCards(cardString);
  // 6 player cards at indices 0–5 (7th value is extra/tie)
  const playerCards = PLAYERS.map((_, i) => codes[i] || '1');

  const players = PLAYERS.map((n) => getPlayerItems(sub, n));

  return (
    <>
    {/* ── Mobile layout ── */}
    <div className="teen1daycasino-container d-none-big">
      {/* Card row */}
      <div className="casino-war-container casino-war-cards">
        <div className="casino-box-row">
          {PLAYERS.map((n, i) => (
            <div key={n} className="casino-bl-box">
              <div className="casino-bl-box-item casino-card-img">
                <span><img src={cardSrc(playerCards[i])} alt={`card-${n}`} /></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="casino-tabs">
        <ul className="nav nav-tabs">
          {PLAYERS.map((n, i) => (
            <li key={n} className="nav-item">
              <a
                href={`#tab${n}`}
                data-toggle="tab"
                className={`nav-link${activeTab === i ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab(i); }}
              >
                {n}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab content */}
      <div className="tab-content w-100">
        {PLAYERS.map((n, i) => (
          <div key={n} id={`tab${n}`} className={`tab-pane${activeTab === i ? ' active' : ''}`}>
            <MobilePlayerTab p={players[i]} n={n} onBet={handleBet} exposures={exposures} />
          </div>
        ))}
      </div>
    </div>

    {/* ── Desktop layout ── */}
    <div className="teen1daycasino-container d-none-small">
      <div className="casino-war-container">

        {/* Row 1 — Card images */}
        <div className="casino-box-row">
          <div className="casino-nation-name no-border"></div>
          {PLAYERS.map((n, i) => (
            <div key={n} className="casino-bl-box">
              <div className="casino-bl-box-item casino-card-img">
                <span><img src={cardSrc(playerCards[i])} alt={`card-${n}`} /></span>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 — Title (1–6) */}
        <div className="casino-box-row casino-war-title">
          <div className="casino-nation-name no-border"></div>
          {PLAYERS.map((n) => (
            <div key={n} className="casino-bl-box">
              <div className="casino-bl-box-item"><b>{n}</b></div>
            </div>
          ))}
        </div>

        {/* Row 3 — Winner */}
        <div className="casino-box-row">
          <div className="casino-nation-name"><b>Winner</b></div>
          {players.map((p, i) => (
            <BackCell key={PLAYERS[i]} item={p.winner} onBet={handleBet} exposures={exposures} />
          ))}
        </div>

        {/* Row 4 — Spade + Club (Black) */}
        <div className="casino-box-row">
          <div className="casino-nation-name casino-card-img">
            <span><img src={`${CARD_IMG_BASE}/spade.png`} alt="spade" /> <img src={`${CARD_IMG_BASE}/club.png`} alt="club" /></span>
          </div>
          {players.map((p, i) => (
            <BackCell key={PLAYERS[i]} item={p.black} onBet={handleBet} exposures={exposures} />
          ))}
        </div>

        {/* Row 5 — Heart + Diamond (Red) */}
        <div className="casino-box-row">
          <div className="casino-nation-name casino-card-img">
            <span><img src={`${CARD_IMG_BASE}/heart.png`} alt="heart" /> <img src={`${CARD_IMG_BASE}/diamond.png`} alt="diamond" /></span>
          </div>
          {players.map((p, i) => (
            <BackCell key={PLAYERS[i]} item={p.red} onBet={handleBet} exposures={exposures} />
          ))}
        </div>

        {/* Row 6 — Odd */}
        <div className="casino-box-row">
          <div className="casino-nation-name"><b>Odd</b></div>
          {players.map((p, i) => (
            <BackCell key={PLAYERS[i]} item={p.odd} onBet={handleBet} exposures={exposures} />
          ))}
        </div>

        {/* Row 7 — Even */}
        <div className="casino-box-row">
          <div className="casino-nation-name"><b>Even</b></div>
          {players.map((p, i) => (
            <BackCell key={PLAYERS[i]} item={p.even} onBet={handleBet} exposures={exposures} />
          ))}
        </div>

        {/* Row 8 — Spade only */}
        <div className="casino-box-row">
          <div className="casino-nation-name casino-card-img">
            <span><img src={`${CARD_IMG_BASE}/spade.png`} alt="spade" /></span>
          </div>
          {players.map((p, i) => (
            <BackCell key={PLAYERS[i]} item={p.spade} onBet={handleBet} exposures={exposures} />
          ))}
        </div>

        {/* Row 9 — Heart only */}
        <div className="casino-box-row">
          <div className="casino-nation-name casino-card-img">
            <span><img src={`${CARD_IMG_BASE}/heart.png`} alt="heart" /></span>
          </div>
          {players.map((p, i) => (
            <BackCell key={PLAYERS[i]} item={p.heart} onBet={handleBet} exposures={exposures} />
          ))}
        </div>

        {/* Row 10 — Club only */}
        <div className="casino-box-row">
          <div className="casino-nation-name casino-card-img">
            <span><img src={`${CARD_IMG_BASE}/club.png`} alt="club" /></span>
          </div>
          {players.map((p, i) => (
            <BackCell key={PLAYERS[i]} item={p.club} onBet={handleBet} exposures={exposures} />
          ))}
        </div>

        {/* Row 11 — Diamond only */}
        <div className="casino-box-row">
          <div className="casino-nation-name casino-card-img">
            <span><img src={`${CARD_IMG_BASE}/diamond.png`} alt="diamond" /></span>
          </div>
          {players.map((p, i) => (
            <BackCell key={PLAYERS[i]} item={p.diamond} onBet={handleBet} exposures={exposures} />
          ))}
        </div>

      </div>
    </div>
    </>
  );
});

export default BetTableWar;
