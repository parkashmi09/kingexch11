import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import CasinoVideo from '../../components/casino/CasinoVideo';
import CasinoPlaceBetModal from '../../components/casino/CasinoPlaceBetModal';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import CasinoRightSidebar from '../../components/casino/CasinoRightSidebar';
import CasinoMyBetsModal from '../../components/casino/CasinoMyBetsModal';
import Footer from '../../components/layout/Footer';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoMyBets from '../../hooks/casino/useCasinoMyBets';
import useCasinoStream from '../../hooks/casino/useCasinoStream';
import useCasinoBet from '../../hooks/casino/useCasinoBet';
import { getGameConfig } from '../../config/casinoGames';

const GAME_TYPE = 'worli2';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/worli2';
const SID = 1;
const NUM_ROW_1 = [1, 2, 3, 4, 5];
const NUM_ROW_2 = [6, 7, 8, 9, 0];

export default function InstantWorli() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);
  const [showMyBets, setShowMyBets] = useState(false);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt = gameData?.lt ?? 0;
  const ft = gameData?.ft ?? 20;
  const card = gameData?.card ?? '';
  const sub = (gameData?.sub || [])[0] || {};
  const suspended = sub.gstatus === 'SUSPENDED' || sub.gstatus === '0';
  const odds = 9;

  const { myBets, refetch: refetchBets } = useCasinoMyBets(mid, isAuth);

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

  const bet = useCallback((nat) => {
    if (suspended) return;
    handleBet(SID, 'back', odds, { sid: SID, nat, b: odds, gstatus: sub.gstatus, min: sub.min, max: sub.max });
  }, [handleBet, odds, suspended, sub.gstatus, sub.min, sub.max]);

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
              <div className="casino-box tab-content">
                <div id="single" className="tab-pane active single">
                  <div className={`worlibox${suspended ? ' suspended' : ''}`}>
                    <div className="worli-left">
                      <div className="worli-box-title"><b>{odds}</b></div>
                      <div className="worli-box-row">
                        {NUM_ROW_1.map((d) => (
                          <div key={d} className={`worli-odd-box back${showPlaceBet && selectedItem?.nat === `single-${d}` ? ' selected' : ''}`} onClick={() => bet(`single-${d}`)}>
                            <span className="worli-odd">{d}</span>
                          </div>
                        ))}
                      </div>
                      <div className="worli-box-row">
                        {NUM_ROW_2.map((d) => (
                          <div key={d} className={`worli-odd-box back${showPlaceBet && selectedItem?.nat === `single-${d}` ? ' selected' : ''}`} onClick={() => bet(`single-${d}`)}>
                            <span className="worli-odd">{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="worli-right">
                      <div className="worli-box-title"><b>{odds}</b></div>
                      <div className="worli-box-row">
                        <div className={`worli-odd-box back${showPlaceBet && selectedItem?.nat === 'single-line1' ? ' selected' : ''}`} onClick={() => bet('single-line1')}>
                          <span className="worli-odd">LINE 1</span>
                          <span className="d-block">1|2|3|4|5</span>
                        </div>
                        <div className={`worli-odd-box back${showPlaceBet && selectedItem?.nat === 'single-odd' ? ' selected' : ''}`} onClick={() => bet('single-odd')}>
                          <span className="worli-odd">ODD</span>
                          <span className="d-block">1|3|5|7|9</span>
                        </div>
                      </div>
                      <div className="worli-box-row">
                        <div className={`worli-odd-box back${showPlaceBet && selectedItem?.nat === 'single-line2' ? ' selected' : ''}`} onClick={() => bet('single-line2')}>
                          <span className="worli-odd">LINE 2</span>
                          <span className="d-block">6|7|8|9|0</span>
                        </div>
                        <div className={`worli-odd-box back${showPlaceBet && selectedItem?.nat === 'single-even' ? ' selected' : ''}`} onClick={() => bet('single-even')}>
                          <span className="worli-odd">EVEN</span>
                          <span className="d-block">2|4|6|8|0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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

      <CasinoMyBetsModal
        show={showMyBets}
        onClose={() => setShowMyBets(false)}
        myBets={myBets}
      />

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
