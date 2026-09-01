import { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MobileTimer } from '../../components/casino/CasinoTimer';
import CasinoVideo from '../../components/casino/CasinoVideo';
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

const GAME_TYPE = 'cmatch20';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/cmatch20';

function parseScore(scoreStr) {
  if (!scoreStr) return { innings: 0, teamA: '0/0', teamAOvers: '0', teamB: '0/0', teamBOvers: '0' };
  const parts = scoreStr.split(',');
  return {
    innings: Number(parts[0]) || 0,
    teamA: `${parts[1] || 0}/${parts[2] || 0}`,
    teamAOvers: `${parts[3] || 0} Overs`,
    teamB: `${parts[4] || 0}/${parts[5] || 0}`,
    teamBOvers: `${parts[6] || 0} Overs`,
  };
}

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.gstatus === '0';
}

function ScoreBox({ score, item, ballNum, onBet }) {
  const suspended = isSusp(item);
  return (
    <div className="score-box">
      <div className="team-score">
        <div>
          <div className="text-center"><b>Team A</b></div>
          <div className="text-center">
            <span className="ml-1">{score.teamA}</span>
            <span className="ml-1">{score.teamAOvers}</span>
          </div>
        </div>
        <div>
          <div className="text-center"><b>Team B</b></div>
          <div className="text-center">
            <span className="ml-1">{score.teamB}</span>
            <span className="ml-1">{score.teamBOvers}</span>
          </div>
        </div>
      </div>
      <div className="ball-icon">
        <img src={`/assets/front/img/balls/ball${ballNum}.png`} alt={`ball${ballNum}`} />
      </div>
      <div className={`blbox${suspended ? ' suspended' : ''}`}>
        <div
          className="back"
          onClick={!suspended && item ? () => onBet(item.sid, 'back', item.b, item) : undefined}
        >
          <span className="odds d-block">{item?.b ?? 0}</span>
        </div>
        <div
          className="lay"
          onClick={!suspended && item ? () => onBet(item.sid, 'lay', item.l, item) : undefined}
        >
          <span className="odds d-block">{item?.l ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

export default function CricketMatch20() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt = gameData?.lt ?? 0;
  const ft = gameData?.ft ?? 20;
  const card = gameData?.card ?? '1';
  const remark = gameData?.remark ?? '';
  const sub = gameData?.sub || [];
  const scoreStr = gameData?.score || '';

  const score = useMemo(() => parseScore(scoreStr), [scoreStr]);

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

  // Last results: win value = ball number (2-10)
  const renderResult = useCallback((r, i) => {
    const ballNum = String(r.win);
    return (
      <span
        key={i}
        className="cricket20lastresult"
        onClick={() => handleResultClick(r)}
        style={{ cursor: 'pointer' }}
      >
        <img src={`/assets/front/img/balls/ball${ballNum}.png`} alt={ballNum} />
      </span>
    );
  }, [handleResultClick]);

  // sub items: sid 1-9 = Run 2 through Run 10 (ball number = sid + 1)
  const findBySid = (sid) => sub.find((s) => s.sid === sid || s.sid === String(sid));

  // Left panel: balls 2-6 (sid 1-5), Right panel: balls 7-10 (sid 6-9)
  const leftItems = [1, 2, 3, 4, 5];
  const rightItems = [6, 7, 8, 9];

  const hideCards = card === '1' || !card;

  return (
    <>
      <div className="casino-center">
        <div id="element" className="casino-container">

          <MobileTimer timeLeft={lt} fullTime={ft} />

          <div className={`casino-table cricket20`}>

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
              customCards={
                <div className={`casino-video-cards${hideCards ? ' hide-cards' : ''}`}>
                  <div className="casino-cards-shuffle">
                    <i className="fas fa-grip-lines-vertical" />
                  </div>
                  <div className="casino-video-cards-container">
                    <div className="dealer-name">Dealer</div>
                    <div>
                      <span>
                        <img src={`/assets/front/img/cards/${card}.png`} alt="" />
                      </span>
                    </div>
                  </div>
                </div>
              }
            />

            <div className="casino-detail">
              <div className="teen20casino-container">
                <div className="teen20left">
                  {leftItems.map((sid) => (
                    <ScoreBox
                      key={sid}
                      score={score}
                      item={findBySid(sid)}
                      ballNum={sid + 1}
                      onBet={handleBet} exposures={exposures}
                    />
                  ))}
                </div>
                <div className="teen20right">
                  {rightItems.map((sid) => (
                    <ScoreBox
                      key={sid}
                      score={score}
                      item={findBySid(sid)}
                      ballNum={sid + 1}
                      onBet={handleBet} exposures={exposures}
                    />
                  ))}
                  <div className="casino-remark">
                    <div className="remark-icon">
                      <img src="/assets/front/img/icons/remark.png" alt="" />
                    </div>
                    <div className="marquee-wrapper">
                      <div className="marquee-content" style={{ animationDuration: '16s' }}>
                        {remark || ''}
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
