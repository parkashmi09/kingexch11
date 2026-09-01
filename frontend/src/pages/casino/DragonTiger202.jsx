import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableDT20 from '../../components/casino/BetTableDT20';
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

const GAME_TYPE = 'dt202';
const GAME_CONFIG = getGameConfig(GAME_TYPE);

export default function DragonTiger202() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt = gameData?.lt ?? 0;
  const ft = gameData?.ft ?? 20;
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

  const timerPercent = ft > 0 ? Math.max(0, Math.min(100, (lt / ft) * 100)) : 0;

  return (
    <>
      <div className="casino-center">
        <div id="element" className="casino-container">

          <div className="progress mobile-timer d-none-big">
            <div
              className={`progress-bar ${timerPercent > 50 ? 'bg-success' : timerPercent > 20 ? 'bg-warning' : 'bg-danger'}`}
              style={{ width: `${timerPercent}%` }}
            ></div>
          </div>

          <div className="casino-table dt20">

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
              tableClass="dt20"
            />

            <div className="casino-detail">
              <BetTableDT20
                gameData={gameData}
                onBet={handleBet}
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

              <div className="casino-remark mt-1 w-100">
                <div className="remark-icon">
                  <img src="/assets/front/img/icons/remark.png" alt="" />
                </div>
                <div className="marquee-wrapper">
                  <div className={`marquee-content${rem ? '' : ' no-marquee'}`} style={{ animationDuration: rem ? '25s' : '0s' }}>{rem || ' '}</div>
                </div>
              </div>

              <div className="casino-video-last-results d-none-desktop">
                {lastResults.map(renderResult)}
                <a href="/report/casinoresult/dt202" className="result-more">...</a>
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
        reportLink="/report/casinoresult/dt202"
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
