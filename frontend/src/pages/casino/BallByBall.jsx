import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableBallByBall from '../../components/casino/BetTableBallByBall';
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

const GAME_TYPE = 'ballbyball';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/ballbyball';

export default function BallByBall() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt = gameData?.lt ?? 0;
  const ft = gameData?.ft ?? 20;
  const rem = gameData?.remark || gameData?.rem || '';
  const rdesc = gameData?.rdesc || '';

  const ballPopup = rdesc ? { img: '/assets/front/img/balls/ball-blank.png', text: rdesc } : null;

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
    <span key={i} className="resulttie" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
      R
    </span>
  ), [handleResultClick]);

  return (
    <>
      <div className="casino-center">
        <div id="element" className="casino-container">

          <div className={`progress mobile-timer ball-by-ball-timer d-none-big`}>
            <div
              className={`progress-bar ${lt <= 5 ? 'bg-danger' : lt <= 10 ? 'bg-warning' : 'bg-success'}`}
              style={{ width: `${ft > 0 ? ((lt / ft) * 100).toFixed(2) : 0}%` }}
            ></div>
          </div>

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
              ballPopup={ballPopup}
            />

            <div className="detail-page-container">

              <BetTableBallByBall
                gameData={gameData}
                onBet={handleBet} exposures={exposures}
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

            </div>

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
              <Link to={REPORT_LINK} className="result-more">...</Link>
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
