import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableDT6 from '../../components/casino/BetTableDT6';
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

const GAME_TYPE = 'dt6';
const GAME_CONFIG = getGameConfig(GAME_TYPE);

export default function DragonTigerOneDay() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt = gameData?.lt ?? 0;
  const ft = gameData?.ft ?? 20;
  const card = gameData?.card ?? '';

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
    if (r.win === '1') {
      return (
        <span key={i} className="resulta" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
          D
        </span>
      );
    }
    if (r.win === '2') {
      return (
        <span key={i} className="resultb" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
          T
        </span>
      );
    }
    return (
      <span key={i} className="resulttie" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
        T
      </span>
    );
  }, [handleResultClick]);

  return (
    <>
      <div className="casino-center">
        <div id="element" className="casino-container">

          <div className="casino-table dt1day">

            <div className="progress mobile-timer d-none-big">
              <div
                className="progress-bar bg-danger"
                style={{ width: ft > 0 ? `${((ft - lt) / ft) * 100}%` : '0%' }}
              ></div>
            </div>

            <CasinoVideo
              streamUrl={streamUrl}
              gameName={GAME_CONFIG.name}
              roundId={mid}
              gameType={GAME_TYPE}
              showCards={true}
              cardString={card}
              showTimers
              timeLeft={lt}
              fullTime={ft}
              tableClass="dt1day"
            />

            <div className="casino-detail">
              <BetTableDT6
                gameData={gameData}
                onBet={handleBet} exposures={exposures}
                exposures={exposures}
              />

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
                <a href="/report/casinoresult/dt6" className="result-more">...</a>
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
        reportLink="/report/casinoresult/dt6"
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
