import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { MobileTimer } from '../../components/casino/CasinoTimer';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableTeenpattiOpen from '../../components/casino/BetTableTeenpattiOpen';
import CasinoPlaceBetModal from '../../components/casino/CasinoPlaceBetModal';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import CasinoRightSidebar from '../../components/casino/CasinoRightSidebar';
import Footer from '../../components/layout/Footer';
import CasinoMyBetsModal from '../../components/casino/CasinoMyBetsModal';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoMyBets from '../../hooks/casino/useCasinoMyBets';
import useCasinoStream from '../../hooks/casino/useCasinoStream';
import useCasinoBet from '../../hooks/casino/useCasinoBet';
import { getGameConfig } from '../../config/casinoGames';

const GAME_TYPE = 'teen8';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/teen8';

export default function TeenpattiOpen() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);
  const [showMyBets, setShowMyBets] = useState(false);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt  = gameData?.lt ?? 0;
  const ft  = gameData?.ft ?? 30;
  const card = gameData?.card ?? '';

  // Pass gameType + gameData so the per-runner figure is the COMPUTED book
  // (profit-if-it-wins), not the legacy worst-exposure endpoint. teen8 runners
  // are independent "fancy" bets (each its own single-item market), so the book
  // shows +stake*(odds-1) under the backed selection and nothing on the others.
  const { myBets, exposures, refetch: refetchBets } = useCasinoMyBets(mid, isAuth, GAME_TYPE, gameData);

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
    return (
      <span
        key={i}
        className="resulttie"
        onClick={() => handleResultClick(r)}
        style={{ cursor: 'pointer' }}
      >
        R
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
              showCards={true}
              cardString={card}
              showTimers
              timeLeft={lt}
              fullTime={ft}
              tableClass={GAME_CONFIG.tableClass}
            />

            <div className="casino-detail">
              <BetTableTeenpattiOpen
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

              <div className="casino-video-last-results d-none-desktop">
                {lastResults.map(renderResult)}
                <a href={REPORT_LINK} className="result-more">...</a>
              </div>

              <div className="mt-2 casino-rules-table d-none-big">
                <div className="casino-place-bet-title">Rules</div>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr><th colSpan="2" className="text-center">Pair Plus</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Pair</td><td>1 TO 1</td></tr>
                      <tr><td>Flush</td><td>1 TO 4</td></tr>
                      <tr><td>Straight</td><td>1 TO 6</td></tr>
                      <tr><td>Trio</td><td>1 TO 30</td></tr>
                      <tr><td>Straight Flush</td><td>1 TO 40</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>

        {myBets.length > 0 && (
          <div className="market-show-icon d-none-desktop" role="button" tabIndex={0} onClick={() => setShowMyBets(true)}>
            <span>{myBets.length}</span>
          </div>
        )}
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
        rulesTableContent={
          <div className="mt-2 casino-rules-table">
            <div className="casino-place-bet-title">Rules</div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr><th colSpan="2" className="text-center">Pair Plus</th></tr>
                </thead>
                <tbody>
                  <tr><td>Pair</td><td>1 TO 1</td></tr>
                  <tr><td>Flush</td><td>1 TO 4</td></tr>
                  <tr><td>Straight</td><td>1 TO 6</td></tr>
                  <tr><td>Trio</td><td>1 TO 30</td></tr>
                  <tr><td>Straight Flush</td><td>1 TO 40</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        }
      />

      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={GAME_TYPE}
        gameName={GAME_CONFIG.name}
        mid={resultMid}
      />

      <CasinoMyBetsModal
        show={showMyBets}
        onClose={() => setShowMyBets(false)}
        myBets={myBets}
      />
    </>
  );
}
