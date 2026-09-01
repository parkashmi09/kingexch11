import { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MobileTimer } from '../../components/casino/CasinoTimer';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableQueen from '../../components/casino/BetTableQueen';
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

const GAME_TYPE = 'queen';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/queen';
const TOTAL_LABELS = ['Total 0', 'Total 1', 'Total 2', 'Total 3'];

function parseQueenCards(cardStr) {
  if (!cardStr) return [[], [], [], []];
  const codes = cardStr.split(',').map((c) => c.trim());
  const totals = [[], [], [], []];
  for (let i = 0; i < codes.length; i++) {
    const groupIdx = i % 4;
    if (codes[i] && codes[i] !== '1') {
      totals[groupIdx].push(codes[i]);
    }
  }
  return totals;
}

function countCards(cards) {
  return cards.reduce((sum, c) => {
    const m = c.match(/^(\d+)/);
    return sum + (m ? parseInt(m[1], 10) : 0);
  }, 0);
}

// Each lane STARTS at its own number — "Total 0" begins at 0, "Total 2" at 2 —
// and the revealed card values accumulate on top. So a 5 dealt into "Total 2"
// makes 7, not 5.
function laneTotal(cards, laneIndex) {
  return laneIndex + countCards(cards);
}

export default function Queen() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt = gameData?.lt ?? 0;
  const ft = gameData?.ft ?? 30;
  const card = gameData?.card ?? '';
  const sub = gameData?.sub || [];

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

  const renderResult = useCallback((r, i) => (
    <span key={i} className="resultb" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
      {r.win ?? r.result ?? i}
    </span>
  ), [handleResultClick]);

  const totals = useMemo(() => parseQueenCards(card), [card]);
  const winnerIndices = useMemo(() => {
    // Rules: a lane wins with a total of 10+ OR by holding the single Queen.
    // The Queen wins outright for whichever lane it lands in.
    const queenLane = totals.findIndex((cards) => cards.some((c) => /^Q/i.test(c)));
    if (queenLane !== -1) return [queenLane];
    // Otherwise highlight the leader only once some lane has reached 10 — nothing
    // before that, since no lane has actually won yet.
    const counts = totals.map((cards, i) => laneTotal(cards, i));
    const max = Math.max(...counts);
    if (max < 10) return [];
    return counts.reduce((acc, c, i) => { if (c === max) acc.push(i); return acc; }, []);
  }, [totals]);

  const queenCards = useMemo(() => (
    <div className="casino-video-cards">
      <div className="casino-video-cards-container">
        {TOTAL_LABELS.map((label, i) => {
          const cards = totals[i] || [];
          const count = laneTotal(cards, i);
          return (
            <div key={i}>
              <div className="dealer-name w-100 mb-1">
                <span className={winnerIndices.includes(i) ? 'text-success' : ''}>{label}:{'\n                '}</span>
                <span className="text-warning ml-1">{count}</span>
              </div>
              <div>
                {cards.map((c, j) => (
                  <span key={j}><img src={`/assets/front/img/cards/${c}.png`} alt={c} /></span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ), [totals, winnerIndices]);

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
              cardString={card}
              showTimers
              timeLeft={lt}
              fullTime={ft}
              tableClass={GAME_CONFIG.tableClass}
              customCards={queenCards}
            />

            <div className="casino-detail">
              <BetTableQueen gameData={gameData} onBet={handleBet} exposures={exposures} />

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

              <div className="casino-video-last-results">
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
