import { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableWorli, { WORLI_TABS } from '../../components/casino/BetTableWorli';
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

const GAME_TYPE = 'worli';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/worli';

export default function WorliPage() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [activeTab, setActiveTab] = useState('single');
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE, {
    transform: (r) => r.win || r.result || 'R',
  });
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt  = gameData?.lt  ?? 0;
  const ft  = gameData?.ft  ?? 20;
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

  // Build sid → sub lookup
  const subMap = useMemo(() => {
    const map = {};
    (gameData?.sub || []).forEach((s) => { map[s.sid] = s; });
    return map;
  }, [gameData]);

  const handleResultClick = useCallback((r) => {
    setResultMid(r.mid || null);
  }, []);

  const renderResult = useCallback((r, i) => (
    <span key={i} className="resultb" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>R</span>
  ), [handleResultClick]);

  return (
    <>
      <div className="casino-center">
        <div className="casino-container">
          <div className="casino-table worli">

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
              tableClass="worli"
            />

            <div className="casino-detail">

              {/* ── Game tabs ── */}
              <div className="casino-tabs">
                <ul className="nav nav-tabs">
                  {WORLI_TABS.map((tab) => (
                    <li key={tab.id} className="nav-item">
                      <a
                        href={`#${tab.id}`}
                        data-toggle="tab"
                        className={`nav-link${activeTab === tab.id ? ' active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
                      >
                        {tab.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Bet table ── */}
              <BetTableWorli
                subMap={subMap}
                activeTab={activeTab}
                onBet={handleBet} exposures={exposures}
              />

              {/* ── Place bet modal (mobile) ── */}
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

              {/* ── Last results (mobile only) ── */}
              <div className="casino-video-last-results d-none-desktop">
                {lastResults.map(renderResult)}
                <Link to={REPORT_LINK} className="result-more">...</Link>
              </div>

            </div>
          </div>
        </div>

        <div className="market-show-icon d-none-desktop" role="button">
          <span>{WORLI_TABS.length}</span>
        </div>

        <div className="casino-banners"></div>
        <Footer />
      </div>

      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={GAME_TYPE}
        gameName={GAME_CONFIG.name}
        mid={resultMid}
      />

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
    </>
  );
}
