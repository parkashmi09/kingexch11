import { memo } from 'react';

const CARD_FACES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUIT_IMGS = ['spade', 'heart', 'club', 'diamond'];

function findBySid(sub, sid) {
  return sub.find((s) => s.sid === sid || s.sid === String(sid));
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function suspCls(item) {
  return isSusp(item) ? ' suspended' : '';
}

function ExposureSpan({ value }) {
  if (!value || value === 0) return null;
  const color = value < 0 ? 'var(--text-danger, #ff0000)' : 'var(--text-success, #00ff00)';
  return (
    <span className="casino-box-expo" style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
      {value < 0 ? value.toFixed(2) : `+${value.toFixed(2)}`}
    </span>
  );
}

const BetTableTeen6 = memo(function BetTableTeen6({ gameData, onBet, exposures }) {
  const sub = gameData?.sub || [];
  const handleBet = onBet || (() => {});

  // Main: sid 1=Player A, sid 2=Player B
  const playerA = findBySid(sub, 1);
  const playerB = findBySid(sub, 2);

  // Under/Over: sid 9-12
  const aUnder = findBySid(sub, 9);
  const aOver = findBySid(sub, 10);
  const bUnder = findBySid(sub, 11);
  const bOver = findBySid(sub, 12);

  // Suit: parent sub item with subtype=suit, odds[] has 4 entries (spade/heart/club/diamond)
  const suitParent = sub.find((s) => s.subtype === 'suit' && s.odds?.length > 0)
    || sub.find((s) => s.subtype === 'suit');
  const suitOdds = suitParent?.odds || [];
  const suitsOpen = suitParent && !isSusp(suitParent);

  // Odd/Even: parent sub item with subtype=oddeven, odds[] has 2 entries (Odd/Even)
  const oeParent = sub.find((s) => s.subtype === 'oddeven' && s.odds?.length > 0)
    || sub.find((s) => s.subtype === 'oddeven');
  const oeOdds = oeParent?.odds || [];
  const oddEntry = oeOdds.find((o) => o.nat === 'Odd') || oeOdds[0];
  const evenEntry = oeOdds.find((o) => o.nat === 'Even') || oeOdds[1];
  const oeOpen = oeParent && !isSusp(oeParent);

  // Cards: the sub items with subtype=cards contain a nested odds[] array
  // with 13 entries (Card A through Card K) holding the real per-card odds
  const cardsParent = sub.find((s) => s.subtype === 'cards' && s.odds?.length > 0)
    || sub.find((s) => s.subtype === 'cards');
  const cardOddsArr = cardsParent?.odds || [];
  const cardsOpen = cardsParent && !isSusp(cardsParent);

  function PlayerBox({ label, item, className, side }) {
    return (
      <div className={side}>
        <div className="casino-box-row d-none-small">
          <div className="casino-nation-name no-border casino-bl-box-title">
            <div className={className}>{label}</div>
          </div>
          <div className="casino-bl-box casino-bl-box-title">
            <div className="casino-bl-box-item"><b>Back</b></div>
            <div className="casino-bl-box-item"><b>Lay</b></div>
          </div>
        </div>
        <div className="casino-box-row">
          <div className="casino-nation-name">
            <b className="d-none-small">Main</b>
            <b className="d-none-big">{label}</b>
            <div className="float-right"><ExposureSpan value={exposures?.[item?.nat]} /></div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'back', item.b, item)}
            >
              <span className="casino-box-odd">{item?.b ?? 0}</span>
            </div>
            <div
              className={`lay casino-bl-box-item${suspCls(item)}`}
              onClick={isSusp(item) ? undefined : () => handleBet(item.sid, 'lay', item.l, item)}
            >
              <span className="casino-box-odd">{item?.l ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function UOBox({ label, underItem, overItem, className, side }) {
    return (
      <div className={side}>
        <div className="casino-box-row d-none-big">
          <div className="casino-nation-name no-border casino-bl-box-title">
            <div className={className}>{label}</div>
          </div>
          <div className="casino-bl-box casino-bl-box-title"></div>
        </div>
        <div className="casino-box-row">
          <div className="casino-nation-name">
            <b>Under 21</b>
            <div className="float-right"><ExposureSpan value={exposures?.[underItem?.nat]} /></div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(underItem)}`}
              onClick={isSusp(underItem) ? undefined : () => handleBet(underItem.sid, 'back', underItem.b, underItem)}
            >
              <span className="casino-box-odd">{underItem?.b ?? 0}</span>
            </div>
          </div>
          <div className="casino-nation-name">
            <b>Over 22</b>
            <div className="float-right"><ExposureSpan value={exposures?.[overItem?.nat]} /></div>
          </div>
          <div className="casino-bl-box">
            <div
              className={`back casino-bl-box-item${suspCls(overItem)}`}
              onClick={isSusp(overItem) ? undefined : () => handleBet(overItem.sid, 'back', overItem.b, overItem)}
            >
              <span className="casino-box-odd">{overItem?.b ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="casino-detail">
      {/* Main Player A vs B */}
      <div className="teen1daycasino-container">
        <PlayerBox label="Player A" item={playerA} className="playera" side="teen1dayleft" />
        <div className="teen1daycenter"></div>
        <PlayerBox label="Player B" item={playerB} className="playerb" side="teen1dayright" />

        {/* Under/Over */}
        <div className="teen2uo">
          <UOBox label="Player A" underItem={aUnder} overItem={aOver} className="playera" side="teen1dayleft" />
          <div className="teen1daycenter"></div>
          <UOBox label="Player B" underItem={bUnder} overItem={bOver} className="playerb" side="teen1dayright" />
        </div>
      </div>

      {/* Suit section */}
      <div className="tee2suit mt-1">
        <div className="casino-bl-box tee2suitheader">
          {SUIT_IMGS.map((suit, i) => {
            const entry = suitOdds[i];
            return (
              <div key={i} className="casino-bl-box-item casino-card-img">
                <span className="casino-box-odd">{entry?.b ?? 0}</span>
              </div>
            );
          })}
        </div>
        <div className="casino-bl-box">
          {SUIT_IMGS.map((suit, i) => {
            const entry = suitOdds[i];
            const odds = entry?.b ?? 0;
            return (
              <div
                key={suit}
                className={`casino-bl-box-item back casino-card-img${suitsOpen ? '' : ' suspended'}`}
                onClick={!suitsOpen ? undefined : () => handleBet(
                  suitParent.sid, 'back', odds,
                  { ...suitParent, nat: `${suitParent.nat} ${entry?.nat || suit}`, b: odds, selectedOddsSid: entry?.sid }
                )}
              >
                <img src={`/assets/front/img/cards/${suit}.png`} alt={suit} />
                <span className="d-none"><ExposureSpan value={exposures?.[entry?.nat]} /></span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Odd/Even + Cards row */}
      <div className="row row5 mt-3">
        <div className="col-12 col-lg-4">
          <div className="teen2eo">
            <div className="casino-bl-box tee2eoheader">
              <div className="casino-bl-box-item casino-card-img">
                <span className="casino-box-odd">{oddEntry?.b ?? 0}</span>
              </div>
              <div className="casino-bl-box-item casino-card-img">
                <span className="casino-box-odd">{evenEntry?.b ?? 0}</span>
              </div>
            </div>
            <div className="casino-bl-box">
              <div
                className={`casino-bl-box-item back${oeOpen ? '' : ' suspended'}`}
                onClick={!oeOpen ? undefined : () => handleBet(
                  oeParent.sid, 'back', oddEntry?.b ?? 0,
                  { ...oeParent, nat: `${oeParent.nat} Odd`, b: oddEntry?.b ?? 0, selectedOddsSid: oddEntry?.sid }
                )}
              >
                <span className="casino-box-odd">Odd</span>
                <span className="d-none"><ExposureSpan value={exposures?.['Odd']} /></span>
              </div>
              <div
                className={`casino-bl-box-item back${oeOpen ? '' : ' suspended'}`}
                onClick={!oeOpen ? undefined : () => handleBet(
                  oeParent.sid, 'back', evenEntry?.b ?? 0,
                  { ...oeParent, nat: `${oeParent.nat} Even`, b: evenEntry?.b ?? 0, selectedOddsSid: evenEntry?.sid }
                )}
              >
                <span className="casino-box-odd">Even</span>
                <span className="d-none"><ExposureSpan value={exposures?.['Even']} /></span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-8">
          <div className="teen2cards">
            <div className="casino-cards text-center mt-1">
              {CARD_FACES.map((face) => {
                const oddsEntry = cardOddsArr.find((o) => o.nat === `Card ${face}`);
                const odds = oddsEntry?.b ?? 0;
                return (
                  <div key={face} className="casino-card-item">
                    <div className="casino-book">{odds}</div>
                    <div
                      className={`card-image${cardsOpen ? '' : ' suspended'}`}
                      onClick={!cardsOpen ? undefined : () => handleBet(
                        cardsParent.sid, 'back', odds,
                        { ...cardsParent, nat: `${cardsParent.nat} ${face}`, b: odds, selectedOddsSid: oddsEntry?.sid }
                      )}
                    >
                      <img src={`/assets/front/img/cards/${face}.png`} alt={face} />
                    </div>
                    <div className="casino-book d-none">
                      <ExposureSpan value={exposures?.[`Card ${face}`]} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BetTableTeen6;
