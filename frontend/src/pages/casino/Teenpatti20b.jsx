import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableTeen20b from '../../components/casino/BetTableTeen20b';
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

const GAME_TYPE = 'teen20b';
const GAME_CONFIG = getGameConfig(GAME_TYPE);

const PairPlusRulesTable = (
  <div className="mt-2 casino-rules-table">
    <div className="casino-place-bet-title">Rules</div>
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th colSpan="2" className="text-center">Pair Plus</th>
          </tr>
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
);

export default function Teenpatti20b() {
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
      return <span key={i} className="resulta" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>A</span>;
    }
    if (r.win === '2') {
      return <span key={i} className="resultb" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>B</span>;
    }
    return <span key={i} className="resulttie" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>T</span>;
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
              showCards={true}
              cardString={card}
              showTimers
              timeLeft={lt}
              fullTime={ft}
              tableClass={GAME_CONFIG.tableClass}
            />

            <div className="casino-detail">
              <BetTableTeen20b
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
                <a href="/report/casinoresult/teen20b" className="result-more">...</a>
              </div>

              <div className="d-none-big">
                {PairPlusRulesTable}
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
        reportLink="/report/casinoresult/teen20b"
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
        rulesTableContent={PairPlusRulesTable}
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
