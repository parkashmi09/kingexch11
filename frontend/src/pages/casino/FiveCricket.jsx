import { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DesktopTimer, MobileDigitTimer, MobileTimer } from '../../components/casino/CasinoTimer';
import SuperOverScorecard from '../../components/casino/SuperOverScorecard';
import SuperOverMarkets from '../../components/casino/SuperOverMarkets';
import CasinoRulesModal from '../../components/casino/CasinoRulesModal';
import CasinoRulesSwitch from '../../components/casino/rules/CasinoRulesSwitch';
import SuperOverBetModal from '../../components/casino/SuperOverBetModal';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import CasinoRightSidebar from '../../components/casino/CasinoRightSidebar';
import Footer from '../../components/layout/Footer';
import useSuperOverGame from '../../hooks/casino/useSuperOverGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoMyBets from '../../hooks/casino/useCasinoMyBets';
import useCasinoStream from '../../hooks/casino/useCasinoStream';
import useCasinoBet from '../../hooks/casino/useCasinoBet';

const GAME_TYPE = 'cricketv3';
const GAME_NAME = '5Five Cricket';
const TABLE_CLASS = 'five-cricket-casino super-over';
const REPORT_LINK = '/report/casinoresult/cricketv3';

const INACTIVITY_TIMEOUT = 30 * 1000;

function useInactivity(timeout = INACTIVITY_TIMEOUT) {
  const [inactive, setInactive] = useState(false);
  const timerRef = useRef(null);
  const hiddenAtRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setInactive(false);
    hiddenAtRef.current = null;
    timerRef.current = setTimeout(() => setInactive(true), timeout);
  }, [timeout]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setInactive(true), timeout);
      } else {
        const hiddenFor = hiddenAtRef.current ? Date.now() - hiddenAtRef.current : 0;
        if (hiddenAtRef.current && hiddenFor >= timeout) setInactive(true);
        hiddenAtRef.current = null;
      }
    };
    const handleActivity = () => { if (!inactive) resetTimer(); };
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibility);
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [resetTimer, timeout, inactive]);

  const reconnect = useCallback(() => {
    setInactive(false);
    hiddenAtRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setInactive(true), timeout);
  }, [timeout]);

  return [inactive, reconnect];
}

export default function FiveCricket() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [videoHidden, setVideoHidden] = useState(false);
  const [inactive, reconnect] = useInactivity();

  const { t1, t2 } = useSuperOverGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const gmid = t1?.gmid ?? '';
  const lt = t1?.lt ?? 0;
  const ft = t1?.ft ?? 60;
  const card = t1?.card ?? '';
  const ename = t1?.ename ?? '';

  const bookmakerMarket = t2.find((m) => m.dtype === 2 || m.gtype === 'match1');
  const sections = bookmakerMarket?.section || [];
  const team1 = sections[0]?.nat || 'Team1';
  const team2 = sections[1]?.nat || 'Team2';

  const { myBets, exposures, refetch: refetchBets } = useCasinoMyBets(gmid, isAuth);

  const {
    showPlaceBet, betValue, betType, selectedItem,
    stakeAmount, setStakeAmount, placing,
    handleBet, handlePlaceBet, closeBetPanel,
  } = useCasinoBet({
    gameType: GAME_TYPE,
    matchId: gmid,
    isAuth,
    onSuccess: refetchBets,
    gameData: t1,
  });

  const handleResultClick = useCallback((r) => {
    setResultMid(r.mid || null);
  }, []);

  const renderResult = useCallback((r, i) => {
    if (r.win === '1') {
      return (
        <span key={i} className="resulta" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
          {team1.charAt(0)}
        </span>
      );
    }
    if (r.win === '2') {
      return (
        <span key={i} className="resultb" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
          {team2.charAt(0)}
        </span>
      );
    }
    return (
      <span key={i} className="resulttie" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
        T
      </span>
    );
  }, [handleResultClick, team1, team2]);

  return (
    <>
      <div className="casino-center">
        <div id="element" className="casino-container">

          <div className={`casino-table ${TABLE_CLASS} detail-page-container`}>

            <div className="game-header">
              <span className="game-header-name">{ename || `${team1} Vs ${team2} ${GAME_NAME}`}</span>
              <span className="game-header-date">Round ID: {gmid}</span>
            </div>

            <div className="container-fluid container-fluid-5">
              <div className="row row5">

                <div className="col-12 col-lg-2 banner d-flex align-items-center p-0">
                  <SuperOverScorecard team1={team1} team2={team2} cardString={card} />
                </div>

                <div className="col-lg-10 col-12">
                  <MobileTimer timeLeft={lt} fullTime={ft} />

                  <div className="casino-video">
                    {inactive && (
                      <div className="disconnected-box">
                        <div className="disconnected-message">
                          <div className="text-center">
                            <i className="fas fa-exclamation-triangle mr-1"></i>{' '}
                            <b>Disconnection due to inactivity</b>
                          </div>
                          <div className="mt-1">
                            Are you there? You have been disconnected. Please go back to home or start playing again
                          </div>
                          <div className="disconnected-buttons mt-2">
                            <button type="button" className="btn btn-outline-primary" onClick={reconnect}>
                              Reconnect
                            </button>
                            <a href="/o_casino" className="btn btn-outline-danger">Home</a>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="video-box-container">
                      <div className="five-video-baner video-box">
                        {!videoHidden && !inactive && streamUrl && (
                          <iframe
                            key={streamUrl}
                            src={streamUrl}
                            title="Casino Stream"
                            allowFullScreen
                            allow="autoplay"
                            scrolling="no"
                          />
                        )}
                      </div>
                    </div>

                    <div className={`casino-video-cards${!card || card.split('|').every((c) => c === '1') ? ' hide-cards' : ''}`}>
                      <div className="casino-cards-shuffle">
                        <i className="fas fa-grip-lines-vertical" />
                      </div>
                      <div className="casino-video-cards-container">
                        {(card || '').split('|').map((c, i) => (
                          <div key={i}>
                            <span>
                              <img src={`/assets/front/img/cards/${c || '1'}.png`} alt="" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <DesktopTimer timeLeft={lt} fullTime={ft} />
                    <MobileDigitTimer timeLeft={lt} />

                    <div className="casino-video-right-icons">
                      <div title="Home" className="casino-video-home-icon">
                        <a href="/o_casino" style={{ color: 'var(--text-highlight)' }}>
                          <i className="fas fa-home" />
                        </a>
                      </div>
                      <div title="Rules" className="casino-video-rules-icon" onClick={() => setShowRules((v) => !v)}>
                        <i className="fas fa-info-circle" />
                      </div>
                    </div>

                    {showRules && (
                      <div
                        id="casino-vieo-rules"
                        aria-modal="true"
                        className="casino-vieo-rules show d-none-small show-rules"
                        style={{ display: 'block' }}
                      >
                        <div className="rules-header">
                          <div>Rules</div>
                          <i className="fas fa-times" onClick={() => setShowRules(false)} style={{ cursor: 'pointer' }} />
                        </div>
                        <div className="rules-body">
                          <CasinoRulesSwitch gameType={GAME_TYPE} />
                        </div>
                      </div>
                    )}

                    <CasinoRulesModal
                      show={showRules}
                      onClose={() => setShowRules(false)}
                      tableClass={TABLE_CLASS}
                    >
                      <CasinoRulesSwitch gameType={GAME_TYPE} />
                    </CasinoRulesModal>
                  </div>
                </div>
              </div>
            </div>

            <SuperOverMarkets markets={t2} onBet={handleBet} exposures={exposures} myBets={myBets} currentBet={showPlaceBet && selectedItem ? { teamName: selectedItem?.nat, betType, odds: parseFloat(betValue) || 0, stake: parseFloat(stakeAmount) || 0 } : null} />

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

      <SuperOverBetModal
        show={showPlaceBet && !!selectedItem}
        onClose={closeBetPanel}
        minBet={selectedItem?.min}
        maxBet={selectedItem?.max}
        gameName={GAME_NAME}
        marketName={selectedItem?._marketName || ""}
        betName={selectedItem?.nat || ''}
        betValue={betValue}
        betType={betType}
        stakeAmount={stakeAmount}
        setStakeAmount={setStakeAmount}
        placing={placing}
        onSubmit={handlePlaceBet}
        teams={[team1, team2]}
      />

      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={GAME_TYPE}
        gameName={GAME_NAME}
        mid={resultMid}
      />
    </>
  );
}
