import { memo, useState } from 'react';

const CARD_IMG_BASE = '/assets/front/img/cards';
const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function findByNat(sub, nat) {
  return sub.find((s) => s.nat === nat);
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function CardImg({ rank }) {
  return <img src={`${CARD_IMG_BASE}/${rank}.png`} alt={rank} />;
}

// ── Mobile single-tab panel ─────────────────────────────────────────────────
// Renders the full list of rows for one player (Dragon / Tiger / Lion) in the
// mobile-tab layout.
const MobilePlayerTab = memo(function MobilePlayerTab({
  winner,
  black,
  red,
  odd,
  even,
  cardItems,
  onBet,
  exposures,
}) {
  // Left column: rows + cards A-4
  // Right column: cards 5-K
  const leftCards = cardItems.slice(0, 4);   // A,2,3,4
  const rightCards = cardItems.slice(4);      // 5-K (9 cards)

  return (
    <div className="teen1daycasino-container">
      <div className="teen1dayleft">
        <div className="casino-box-row">
          <div className="casino-nation-name"><b>Winner</b></div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(winner)}`}
              onClick={isSusp(winner) ? undefined : () => onBet(winner.sid, 'back', winner.b, winner)}
            >
              <span className="casino-box-odd">{winner?.b ?? 0}</span>
              <ExposureSpan value={exposures?.[winner?.nat]} />
            </div>
          </div>
        </div>

        <div className="casino-box-row">
          <div className="casino-nation-name casino-card-img">
            <span>
              <img src={`${CARD_IMG_BASE}/spade.png`} alt="spade" />
              <img src={`${CARD_IMG_BASE}/club.png`} alt="club" />
            </span>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(black)}`}
              onClick={isSusp(black) ? undefined : () => onBet(black.sid, 'back', black.b, black)}
            >
              <span className="casino-box-odd">{black?.b ?? 0}</span>
              <ExposureSpan value={exposures?.[black?.nat]} />
            </div>
          </div>
        </div>

        <div className="casino-box-row">
          <div className="casino-nation-name casino-card-img">
            <span>
              <img src={`${CARD_IMG_BASE}/heart.png`} alt="heart" />
              <img src={`${CARD_IMG_BASE}/diamond.png`} alt="diamond" />
            </span>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(red)}`}
              onClick={isSusp(red) ? undefined : () => onBet(red.sid, 'back', red.b, red)}
            >
              <span className="casino-box-odd">{red?.b ?? 0}</span>
              <ExposureSpan value={exposures?.[red?.nat]} />
            </div>
          </div>
        </div>

        <div className="casino-box-row">
          <div className="casino-nation-name"><b>Odd</b></div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(odd)}`}
              onClick={isSusp(odd) ? undefined : () => onBet(odd.sid, 'back', odd.b, odd)}
            >
              <span className="casino-box-odd">{odd?.b ?? 0}</span>
              <ExposureSpan value={exposures?.[odd?.nat]} />
            </div>
          </div>
        </div>

        <div className="casino-box-row">
          <div className="casino-nation-name"><b>Even</b></div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(even)}`}
              onClick={isSusp(even) ? undefined : () => onBet(even.sid, 'back', even.b, even)}
            >
              <span className="casino-box-odd">{even?.b ?? 0}</span>
              <ExposureSpan value={exposures?.[even?.nat]} />
            </div>
          </div>
        </div>

        {leftCards.map((item, i) => {
          const rank = CARD_RANKS[i];
          return (
            <div className="casino-box-row" key={rank}>
              <div className="casino-nation-name casino-card-img">
                <span><img src={`${CARD_IMG_BASE}/${rank}.png`} alt={rank} /></span>
              </div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(item)}`}
                  onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', item.b, item)}
                >
                  <span className="casino-box-odd">{item?.b ?? 0}</span>
                  <ExposureSpan value={exposures?.[item?.nat]} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="teen1daycenter"></div>

      <div className="teen1dayright">
        {rightCards.map((item, i) => {
          const rank = CARD_RANKS[i + 4];
          return (
            <div className="casino-box-row" key={rank}>
              <div className="casino-nation-name casino-card-img">
                <span><img src={`${CARD_IMG_BASE}/${rank}.png`} alt={rank} /></span>
              </div>
              <div className="casino-bl-box">
                <div
                  className={`back casino-bl-box-item${suspCls(item)}`}
                  onClick={isSusp(item) ? undefined : () => onBet(item.sid, 'back', item.b, item)}
                >
                  <span className="casino-box-odd">{item?.b ?? 0}</span>
                  <ExposureSpan value={exposures?.[item?.nat]} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ── Desktop 3-column grid — one row with D / T / L boxes ───────────────────
function DesktopRow({ label, isCardImg = false, imgContent = null, dItem, tItem, lItem, onBet, exposures }) {
  return (
    <div className="casino-box-row">
      <div className={`casino-nation-name${isCardImg ? ' casino-card-img' : ''}`}>
        {imgContent ? <span>{imgContent}</span> : <b>{label}</b>}
      </div>
      <div className="casino-bl-box">
        <div
          className={`back casino-bl-box-item${suspCls(dItem)}`}
          onClick={isSusp(dItem) ? undefined : () => onBet(dItem.sid, 'back', dItem.b, dItem)}
        >
          <span className="casino-box-odd">{dItem?.b ?? 0}</span>
          <ExposureSpan value={exposures?.[dItem?.nat]} />
        </div>
      </div>
      <div className="casino-bl-box">
        <div
          className={`back casino-bl-box-item${suspCls(tItem)}`}
          onClick={isSusp(tItem) ? undefined : () => onBet(tItem.sid, 'back', tItem.b, tItem)}
        >
          <span className="casino-box-odd">{tItem?.b ?? 0}</span>
          <ExposureSpan value={exposures?.[tItem?.nat]} />
        </div>
      </div>
      <div className="casino-bl-box">
        <div
          className={`back casino-bl-box-item${suspCls(lItem)}`}
          onClick={isSusp(lItem) ? undefined : () => onBet(lItem.sid, 'back', lItem.b, lItem)}
        >
          <span className="casino-box-odd">{lItem?.b ?? 0}</span>
          <ExposureSpan value={exposures?.[lItem?.nat]} />
        </div>
      </div>
    </div>
  );
}

// ── Main BetTable ───────────────────────────────────────────────────────────
function ExposureSpan({ value }) {
  if (!value || value === 0) return null;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className="casino-box-expo" style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
      {value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
    </span>
  );
}

const BetTableDTL20 = memo(function BetTableDTL20({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  const [activeTab, setActiveTab] = useState('dragon');

  // Winner items — API uses "Winner D" / "Winner T" / "Winner L"
  const dWinner = findByNat(sub, 'Winner D') || findByNat(sub, 'Dragon');
  const tWinner = findByNat(sub, 'Winner T') || findByNat(sub, 'Tiger');
  const lWinner = findByNat(sub, 'Winner L') || findByNat(sub, 'Lion');

  // Black (spade + club) — API uses "Black D" / "Black T" / "Black L"
  const dBlack = findByNat(sub, 'Black D') || findByNat(sub, 'Dragon Black');
  const tBlack = findByNat(sub, 'Black T') || findByNat(sub, 'Tiger Black');
  const lBlack = findByNat(sub, 'Black L') || findByNat(sub, 'Lion Black');

  // Red (heart + diamond) — API uses "Red D" / "Red T" / "Red L"
  const dRed = findByNat(sub, 'Red D') || findByNat(sub, 'Dragon Red');
  const tRed = findByNat(sub, 'Red T') || findByNat(sub, 'Tiger Red');
  const lRed = findByNat(sub, 'Red L') || findByNat(sub, 'Lion Red');

  // Odd — API uses "Odd D" / "Odd T" / "Odd L"
  const dOdd = findByNat(sub, 'Odd D') || findByNat(sub, 'Dragon Odd');
  const tOdd = findByNat(sub, 'Odd T') || findByNat(sub, 'Tiger Odd');
  const lOdd = findByNat(sub, 'Odd L') || findByNat(sub, 'Lion Odd');

  // Even — API uses "Even D" / "Even T" / "Even L"
  const dEven = findByNat(sub, 'Even D') || findByNat(sub, 'Dragon Even');
  const tEven = findByNat(sub, 'Even T') || findByNat(sub, 'Tiger Even');
  const lEven = findByNat(sub, 'Even L') || findByNat(sub, 'Lion Even');

  // Card rank items for each player
  const dCards = CARD_RANKS.map((r) => findByNat(sub, `Dragon ${r}`));
  const tCards = CARD_RANKS.map((r) => findByNat(sub, `Tiger ${r}`));
  const lCards = CARD_RANKS.map((r) => findByNat(sub, `Lion ${r}`));

  // Left-column cards: A-4 (indices 0-3)
  // Right-column cards: 5-K (indices 4-12)
  const dLeftCards = dCards.slice(0, 4);
  const dRightCards = dCards.slice(4);
  const tLeftCards = tCards.slice(0, 4);
  const tRightCards = tCards.slice(4);
  const lLeftCards = lCards.slice(0, 4);
  const lRightCards = lCards.slice(4);

  const blackImg = (
    <>
      <img src={`${CARD_IMG_BASE}/spade.png`} alt="spade" />
      <img src={`${CARD_IMG_BASE}/club.png`} alt="club" />
    </>
  );
  const redImg = (
    <>
      <img src={`${CARD_IMG_BASE}/heart.png`} alt="heart" />
      <img src={`${CARD_IMG_BASE}/diamond.png`} alt="diamond" />
    </>
  );

  return (
    <>
      {/* ── MOBILE: tabbed layout ── */}
      <div className="d-none-big">
        <div className="casino-tabs">
          <ul role="tablist" className="nav nav-tabs">
            <li className="nav-item">
              <a
                href="#dragon"
                data-toggle="tab"
                className={`nav-link${activeTab === 'dragon' ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('dragon'); }}
              >
                Dragon
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#tiger"
                data-toggle="tab"
                className={`nav-link${activeTab === 'tiger' ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('tiger'); }}
              >
                Tiger
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#lion"
                data-toggle="tab"
                className={`nav-link${activeTab === 'lion' ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('lion'); }}
              >
                Lion
              </a>
            </li>
          </ul>
        </div>

        <div className="tab-content">
          <div id="dragon" className={`tab-pane${activeTab === 'dragon' ? ' active' : ''}`}>
            <MobilePlayerTab
              winner={dWinner}
              black={dBlack}
              red={dRed}
              odd={dOdd}
              even={dEven}
              cardItems={dCards}
              onBet={handleBet}
              exposures={exposures}
            />
          </div>
          <div id="tiger" className={`tab-pane${activeTab === 'tiger' ? ' active' : ''}`}>
            <MobilePlayerTab
              winner={tWinner}
              black={tBlack}
              red={tRed}
              odd={tOdd}
              even={tEven}
              cardItems={tCards}
              onBet={handleBet}
              exposures={exposures}
            />
          </div>
          <div id="lion" className={`tab-pane${activeTab === 'lion' ? ' active' : ''}`}>
            <MobilePlayerTab
              winner={lWinner}
              black={lBlack}
              red={lRed}
              odd={lOdd}
              even={lEven}
              cardItems={lCards}
              onBet={handleBet}
              exposures={exposures}
            />
          </div>
        </div>
      </div>

      {/* ── DESKTOP: 3-column grid layout ── */}
      <div className="teen1daycasino-container d-none-small">
        <div className="teen1dayleft">
          {/* Header row */}
          <div className="casino-box-row">
            <div className="casino-nation-name no-border"><div></div></div>
            <div className="casino-bl-box"><b>D</b></div>
            <div className="casino-bl-box"><b>T</b></div>
            <div className="casino-bl-box"><b>L</b></div>
          </div>

          <DesktopRow label="Winner" dItem={dWinner} tItem={tWinner} lItem={lWinner} onBet={handleBet} exposures={exposures} />
          <DesktopRow isCardImg imgContent={blackImg} dItem={dBlack} tItem={tBlack} lItem={lBlack} onBet={handleBet} exposures={exposures} />
          <DesktopRow isCardImg imgContent={redImg} dItem={dRed} tItem={tRed} lItem={lRed} onBet={handleBet} exposures={exposures} />
          <DesktopRow label="Odd" dItem={dOdd} tItem={tOdd} lItem={lOdd} onBet={handleBet} exposures={exposures} />
          <DesktopRow label="Even" dItem={dEven} tItem={tEven} lItem={lEven} onBet={handleBet} exposures={exposures} />

          {dLeftCards.map((dItem, i) => {
            const rank = CARD_RANKS[i];
            return (
              <DesktopRow
                key={rank}
                isCardImg
                imgContent={<CardImg rank={rank} />}
                dItem={dItem}
                tItem={tLeftCards[i]}
                lItem={lLeftCards[i]}
                onBet={handleBet}
                exposures={exposures}
              />
            );
          })}
        </div>

        <div className="teen1daycenter"></div>

        <div className="teen1dayright">
          {/* Header row — kept in DOM for desktop alignment */}
          <div className="casino-box-row d-none-small">
            <div className="casino-nation-name no-border"><div></div></div>
            <div className="casino-bl-box"><b>D</b></div>
            <div className="casino-bl-box"><b>T</b></div>
            <div className="casino-bl-box"><b>L</b></div>
          </div>

          {dRightCards.map((dItem, i) => {
            const rank = CARD_RANKS[i + 4];
            return (
              <DesktopRow
                key={rank}
                isCardImg
                imgContent={<CardImg rank={rank} />}
                dItem={dItem}
                tItem={tRightCards[i]}
                lItem={lRightCards[i]}
                onBet={handleBet}
                exposures={exposures}
              />
            );
          })}
        </div>
      </div>
    </>
  );
});

export default BetTableDTL20;
