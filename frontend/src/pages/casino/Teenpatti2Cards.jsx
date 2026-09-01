import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { MobileTimer } from '../../components/casino/CasinoTimer';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableTeenpatti2Cards from '../../components/casino/BetTableTeenpatti2Cards';
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

const GAME_TYPE = 'patti2';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/patti2';

const ColorPlusRulesTable = (
  <div className="mt-2 casino-rules-table">
    <div className="casino-place-bet-title">Rules</div>
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th colSpan="2" className="text-center">Color Plus Rules</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Three card Sequence</td><td>1 TO 3</td></tr>
          <tr><td>Four card color</td><td>1 TO 9</td></tr>
          <tr><td>Four card Sequence</td><td>1 TO 9</td></tr>
          <tr><td>Three of a kind</td><td>1 TO 12</td></tr>
          <tr><td>Three card pure Sequence</td><td>1 TO 15</td></tr>
          <tr><td>Four card pure Sequence</td><td>1 TO 150</td></tr>
          <tr><td>Four of a kind</td><td>1 TO 200</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default function Teenpatti2Cards() {
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
    showPlaceBet, betValue, betDisplayOdds, betType, selectedItem,
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
              <BetTableTeenpatti2Cards
                gameData={gameData}
                onBet={handleBet}
                exposures={exposures}
                myBets={myBets}
              />

              <CasinoPlaceBetModal
                show={showPlaceBet && !!selectedItem}
                betType={betType}
                betName={selectedItem?.nat || ''}
                betValue={betValue}
                betDisplayOdds={betDisplayOdds}
                stakeAmount={stakeAmount}
                setStakeAmount={setStakeAmount}
                placing={placing}
                onSubmit={handlePlaceBet}
                onClose={closeBetPanel}
                minBet={selectedItem?.min}
                maxBet={selectedItem?.max}
              />

              {gameData?.remark && (
                <div className="casino-remark mt-1">
                  <div className="remark-icon">
                    <img src="/assets/front/img/icons/remark.png" alt="" />
                  </div>
                  <div className="marquee-wrapper">
                    <div className="marquee-content" style={{ animationDuration: `${gameData.remark.length * 0.2}s` }}>{gameData.remark}</div>
                  </div>
                </div>
              )}

              <div className="casino-video-last-results d-none-desktop">
                {lastResults.map(renderResult)}
                <a href={REPORT_LINK} className="result-more">...</a>
              </div>

              <div className="d-none-big">
                {ColorPlusRulesTable}
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
        betDisplayOdds={betDisplayOdds}
        betType={betType}
        stakeAmount={stakeAmount}
        setStakeAmount={setStakeAmount}
        placing={placing}
        onSubmit={handlePlaceBet}
        onClose={closeBetPanel}
        minBet={selectedItem?.min}
        maxBet={selectedItem?.max}
        rulesTableContent={ColorPlusRulesTable}
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
