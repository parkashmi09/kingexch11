import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableCard32EU from '../../components/casino/BetTableCard32EU';
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

const GAME_TYPE = 'card32eu';
const GAME_CONFIG = getGameConfig(GAME_TYPE);

/** win value 1-4 maps to player number 8-11 */
const WIN_TO_PLAYER = { '1': '8', '2': '9', '3': '10', '4': '11' };

export default function Card32B() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt = gameData?.lt ?? 0;
  const ft = gameData?.ft ?? 30;
  const card = gameData?.card ?? '';
  const rem = gameData?.remark || gameData?.rem || '';

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
    const label = WIN_TO_PLAYER[r.win] || r.win;
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

          <div className={`casino-table ${GAME_CONFIG.tableClass}`}>

            <CasinoVideo
              streamUrl={streamUrl}
              gameName={GAME_CONFIG.name}
              roundId={mid}
              gameType={GAME_TYPE}
              showCards
              cardString={card}
              showTimers
              timeLeft={lt}
              fullTime={ft}
              tableClass={GAME_CONFIG.tableClass}
            />

            <div className="casino-detail">
              <BetTableCard32EU gameData={gameData} onBet={handleBet} exposures={exposures} />

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

              {rem && (
                <div className="casino-remark mt-1">
                  <div className="remark-icon">
                    <img src="/assets/front/img/icons/remark.png" alt="" />
                  </div>
                  <div className="marquee-wrapper">
                    <div className="marquee-content" style={{ animationDuration: '25s' }}>{rem}</div>
                  </div>
                </div>
              )}

              <div className="casino-video-last-results d-none-desktop">
                {lastResults.map(renderResult)}
                <a href="/report/casinoresult/card32eu" className="result-more">...</a>
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
        reportLink="/report/casinoresult/card32eu"
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
