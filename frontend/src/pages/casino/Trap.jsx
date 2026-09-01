import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { MobileTimer } from '../../components/casino/CasinoTimer';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableTrap from '../../components/casino/BetTableTrap';
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

const GAME_TYPE = 'trap';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/trap';

const TrapNumbersDesktop = (
  <div className="teen1daycasino-container trap-number d-none-mobile">
    <img src="/assets/front/img/trap13.png" className="img-fluid" alt="13" />
    {' '}
    <img src="/assets/front/img/trap14.png" className="img-fluid" alt="14" />
    {' '}
    <img src="/assets/front/img/trap15.png" className="img-fluid" alt="15" />
  </div>
);

export default function Trap() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid  = gameData?.mid ?? '';
  const lt   = gameData?.lt  ?? 0;
  const ft   = gameData?.ft  ?? 30;
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
      return <span key={i} className="resulta" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>A</span>;
    }
    return <span key={i} className="resultb" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>B</span>;
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
              showCards={true}
              cardString={card}
              showTimers
              timeLeft={lt}
              fullTime={ft}
              tableClass={GAME_CONFIG.tableClass}
            />

            <div className="casino-detail">
              <BetTableTrap
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

              <div className="casino-remark mt-1">
                <div className="remark-icon">
                  <img src="/assets/front/img/icons/remark.png" alt="" />
                </div>
                <div className="marquee-wrapper">
                  <div className="marquee-content" style={{ animationDuration: '34.8s' }}>
                    IT&apos;S EITHER PLAYER A OR B, WHO SCORES A TOTAL OF 13,14,15 WILL FALL INTO THE TRAP &amp; LOSE THE GAME. AVOID FALLING INTO THE TRAP &amp; WIN REAL MONEY.
                  </div>
                </div>
              </div>

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
        beforeLastResults={TrapNumbersDesktop}
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
