import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { bToastError } from '../../components/BToast';
import { MobileTimer } from '../../components/casino/CasinoTimer';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableTeen20 from '../../components/casino/BetTableTeen20';
import CasinoPlaceBetModal from '../../components/casino/CasinoPlaceBetModal';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import CasinoRightSidebar from '../../components/casino/CasinoRightSidebar';
import Footer from '../../components/layout/Footer';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoMyBets from '../../hooks/casino/useCasinoMyBets';
import useCasinoStream from '../../hooks/casino/useCasinoStream';
import useCasinoBet from '../../hooks/casino/useCasinoBet';
import { getGameConfig, minBalanceMessage } from '../../config/casinoGames';
import { getManagedCasinoGames } from '../../apiservices/casinoManageService';

// VIP variant of 20-20 Teenpatti. The table, cards, rules and sidebar are the
// same as teen20 — only the feed type and the display name differ — so this
// page reuses BetTableTeen20 rather than cloning its markup.
const GAME_TYPE = 'teen20v1';
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

export default function Teenpatti20V1() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const balance = useSelector((s) => s.user.balance);
  const navigate = useNavigate();

  // VIP entry threshold, enforced on the page too — the tile check only covers
  // arrivals via the casino list, not a typed URL or a bookmark. It also runs
  // again whenever the balance moves, so dropping below the floor mid-session
  // walks the user back out rather than leaving them at a table they can no
  // longer afford to enter.
  //
  // The threshold is the OWNER'S number: the Casino Manage row for this game
  // supplies min_balance (and enabled — a switched-off table bounces even a
  // typed URL). No static backstop — until the catalog answers there is
  // simply no gate, which errs on the side of not bouncing a paying player.
  const [managedRow, setManagedRow] = useState(null);
  useEffect(() => {
    let alive = true;
    getManagedCasinoGames()
      .then((res) => {
        if (!alive || !res?.success) return;
        setManagedRow((res.data || []).find((g) => g.game_type === GAME_TYPE) || null);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const minBalance = managedRow != null ? Number(managedRow.min_balance) || 0 : 0;
  useEffect(() => {
    if (!isAuth) return;
    if (managedRow && managedRow.enabled === false) {
      navigate('/o_casino', { replace: true });
      return;
    }
    if (!minBalance) return;
    if (balance == null) return; // not loaded yet — don't bounce on a blank
    if (Number(balance) < minBalance) {
      bToastError(minBalanceMessage(minBalance));
      navigate('/o_casino', { replace: true });
    }
  }, [balance, isAuth, minBalance, managedRow, navigate]);
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
              <BetTableTeen20
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
                <a href="/report/casinoresult/teen20v1" className="result-more">...</a>
              </div>

              <div className="mt-2 casino-rules-table d-none-big">
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
        reportLink="/report/casinoresult/teen20v1"
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
