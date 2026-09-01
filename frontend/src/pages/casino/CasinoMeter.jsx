import { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MobileTimer } from '../../components/casino/CasinoTimer';
import CasinoVideo from '../../components/casino/CasinoVideo';
import CasinoPlaceBetModal from '../../components/casino/CasinoPlaceBetModal';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import CasinoRightSidebar from '../../components/casino/CasinoRightSidebar';
import Footer from '../../components/layout/Footer';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoMyBets from '../../hooks/casino/useCasinoMyBets';
import useCasinoStream from '../../hooks/casino/useCasinoStream';
import useCasinoBet from '../../hooks/casino/useCasinoBet';
import { getGameConfig } from '../../config/casinoGames';

const GAME_TYPE = 'cmeter';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/cmeter';

const LOW_CARDS = ['A', '2', '3', '4', '5', '6', '7', '8', '9'];
const HIGH_CARDS = ['10', 'J', 'Q', 'K'];

const CARD_VALUES = { A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13 };

function extractRank(code) {
  if (!code || code === '1') return null;
  const m = code.match(/^(\d+|[AJQK])/);
  return m ? m[1] : null;
}

function isLowCard(rank) {
  return rank && LOW_CARDS.includes(rank);
}

function parseDealtCards(cardStr) {
  if (!cardStr) return { allCards: [], lowTotal: 0, highTotal: 0, hasCards: false };
  const codes = cardStr.split(',').map(c => c.trim());
  const allCards = [];
  let lowTotal = 0;
  let highTotal = 0;

  for (const code of codes) {
    const rank = extractRank(code);
    if (!rank) continue;
    const val = CARD_VALUES[rank] || 0;
    const low = isLowCard(rank);
    allCards.push({ code, low });
    if (low) lowTotal += val;
    else highTotal += val;
  }
  return { allCards, lowTotal, highTotal, hasCards: allCards.length > 0 };
}

function findBySid(sub, sid) {
  return sub.find(s => s.sid === sid || s.sid === String(sid));
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

export default function CasinoMeter() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt = gameData?.lt ?? 0;
  const ft = gameData?.ft ?? 3;
  const card = gameData?.card ?? '';
  const sub = gameData?.sub || [];

  const lowItem = findBySid(sub, 1);
  const highItem = findBySid(sub, 2);
  const suspended = isSusp(lowItem) && isSusp(highItem);

  const { allCards, lowTotal, highTotal, hasCards } = useMemo(() => parseDealtCards(card), [card]);

  const { myBets, exposures, refetch: refetchBets } = useCasinoMyBets(mid, isAuth);

  const {
    showPlaceBet, betValue, betType, selectedItem,
    stakeAmount, setStakeAmount, placing,
    handleBet, handlePlaceBet, closeBetPanel,
  } = useCasinoBet({
    gameType: GAME_TYPE,
    matchId: mid,
    isAuth,
    onSuccess: refetchBets,
    gameData,
  });

  const handleResultClick = useCallback((r) => {
    setResultMid(r.mid || null);
  }, []);

  const renderResult = useCallback((r, i) => {
    const label = r.win === '1' ? 'L' : 'H';
    return (
      <span key={i} className="resultb" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
        {label}
      </span>
    );
  }, [handleResultClick]);

  return (
    <>
      <div className="casino-center">
        <div id="element" className="casino-container">

          <MobileTimer timeLeft={lt} fullTime={ft} />

          <div className={`casino-table ${GAME_CONFIG.tableClass}`}>

            <CasinoVideo
              streamUrl={streamUrl}
              gameName={GAME_CONFIG.name}
              roundId={mid}
              gameType={GAME_TYPE}
              showCards={false}
              showTimers
              timeLeft={lt}
              fullTime={ft}
              tableClass={GAME_CONFIG.tableClass}
            />

            <div className="casino-detail">

              {/* Dealt cards display */}
              {hasCards && <div className="cmeter-card-box">
                <div className="cmeter-card-low">
                  <div className="text-playerb">
                    <span>Low</span>
                    <span className="text-success ml-2 numeric">{lowTotal}</span>
                  </div>
                  <div className="ml-2">
                    {allCards.map((c, i) => c.low
                      ? <span key={i}><img src={`/assets/front/img/cards/${c.code}.png`} alt={c.code} /></span>
                      : null
                    )}
                  </div>
                </div>
                <div className="cmeter-card-high">
                  <div className="text-playerb">
                    <span>High</span>
                    <span className="text-success ml-2 numeric">{highTotal}</span>
                  </div>
                  <div className="ml-2">
                    {allCards.map((c, i) => !c.low
                      ? <span key={i}><img src={`/assets/front/img/cards/${c.code}.png`} alt={c.code} /></span>
                      : null
                    )}
                  </div>
                </div>
              </div>}

              {/* Card selection grid */}
              <div className="teen1daycasino-container">
                <div className="teen1dayleft">
                  <div className="text-center">
                    <b className="text-playerb">Low</b>
                  </div>
                  <div className="w-100">
                    <div className={`casino-cards text-center p-2${suspended ? ' suspended' : ''}`}>
                      {LOW_CARDS.map((c) => (
                        <div
                          key={c}
                          className="casino-card-item"
                          onClick={!suspended && lowItem ? () => handleBet(lowItem.sid, 'back', lowItem.b, lowItem) : undefined}
                        >
                          <div className="card-image">
                            <img src={`/assets/front/img/cards/${c}.png`} alt={c} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>{(() => { const exp = exposures?.[lowItem?.nat]; return exp && exp !== 0 ? <span className={`w-100 text-left ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</span> : <span className="w-100 text-left d-none">0</span>; })()}</div>
                  </div>
                </div>

                <div className="teen1daycenter"></div>

                <div className="teen1dayright">
                  <div className="text-center">
                    <b className="text-playerb">High</b>
                  </div>
                  <div className="w-100">
                    <div className={`casino-cards text-center p-2${suspended ? ' suspended' : ''}`}>
                      {HIGH_CARDS.map((c) => (
                        <div
                          key={c}
                          className="casino-card-item"
                          onClick={!suspended && highItem ? () => handleBet(highItem.sid, 'back', highItem.b, highItem) : undefined}
                        >
                          <div className="card-image">
                            <img src={`/assets/front/img/cards/${c}.png`} alt={c} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>{(() => { const exp = exposures?.[highItem?.nat]; return exp && exp !== 0 ? <span className={`w-100 text-left ${exp < 0 ? 'book-red' : 'book-green'}`}>{Math.round(exp)}</span> : <span className="w-100 text-left d-none">0</span>; })()}</div>
                  </div>
                </div>
              </div>

              <CasinoPlaceBetModal
                show={showPlaceBet && !!selectedItem}
                betType={betType}
                betName={selectedItem?.nat || ''}
                betValue={betValue}
                stakeAmount={stakeAmount}
                setStakeAmount={setStakeAmount}
                placing={placing}
                onSubmit={handlePlaceBet}
                onClose={closeBetPanel}
                minBet={selectedItem?.min}
                maxBet={selectedItem?.max}
              />

              <div className="casino-video-last-results d-none-desktop">
                {lastResults.map(renderResult)}
                <a href={REPORT_LINK} className="result-more">...</a>
              </div>
            </div>

          </div>
        </div>

        <div className="casino-banners"></div>
        <Footer />
      </div>

      <CasinoRightSidebar
        lastResults={lastResults}
        renderResult={renderResult}
        myBets={myBets}
        reportLink={REPORT_LINK}
        showPlaceBet={showPlaceBet && !!selectedItem}
        betName={selectedItem?.nat || ''}
        betValue={betValue}
        betType={betType}
        stakeAmount={stakeAmount}
        setStakeAmount={setStakeAmount}
        placing={placing}
        onSubmit={handlePlaceBet}
        onClose={closeBetPanel}
        minBet={selectedItem?.min}
        maxBet={selectedItem?.max}
      />

      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={GAME_TYPE}
        gameName={GAME_CONFIG.name}
        mid={resultMid}
      />
    </>
  );
}
