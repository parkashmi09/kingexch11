import { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DesktopTimer, MobileDigitTimer, MobileTimer } from '../../components/casino/CasinoTimer';
import SuperOverBalls from '../../components/casino/SuperOverBalls';
import SuperOverScorecard from '../../components/casino/SuperOverScorecard';
import SuperOverMarkets from '../../components/casino/SuperOverMarkets';
import CricketCardRules from '../../components/casino/CricketCardRules';
import CasinoRulesModal from '../../components/casino/CasinoRulesModal';
import CasinoRulesSwitch from '../../components/casino/rules/CasinoRulesSwitch';
import SuperOverBetModal from '../../components/casino/SuperOverBetModal';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import Footer from '../../components/layout/Footer';
import useSuperOverGame from '../../hooks/casino/useSuperOverGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoMyBets from '../../hooks/casino/useCasinoMyBets';
import useCasinoStream from '../../hooks/casino/useCasinoStream';
import useCasinoBet from '../../hooks/casino/useCasinoBet';

const GAME_TYPE = 'superover';
const GAME_NAME = 'Super Over';
const TABLE_CLASS = 'super-over';
const REPORT_LINK = '/report/casinoresult/superover';

const INACTIVITY_LIMIT = 60 * 1000; // 1 minute (change to 3 * 60 * 1000 for production)

function useInactivity(timeout = INACTIVITY_LIMIT) {
  const [isDisconnected, setIsDisconnected] = useState(false);
  const timerRef = useRef(null);

  const reconnect = useCallback(() => {
    setIsDisconnected(false);
  }, []);

  useEffect(() => {
    if (isDisconnected) return;

    const clear = () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };

    const start = () => {
      clear();
      timerRef.current = setTimeout(() => {
        clear();
        setIsDisconnected(true);
      }, timeout);
    };

    let lastActivity = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity < 1000) return;
      lastActivity = now;
      start();
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        lastActivity = 0;
        handleActivity();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibility);
    start();

    return () => {
      clear();
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isDisconnected, timeout]);

  return [isDisconnected, reconnect];
}

export default function SuperOver() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);
  const [videoHidden, setVideoHidden] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isDisconnected, reconnect] = useInactivity();

  const { t1, t2 } = useSuperOverGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const gmid = t1?.gmid ?? '';
  const lt = t1?.lt ?? 0;
  const ft = t1?.ft ?? 35;
  const card = t1?.card ?? '';

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

  const toggleVideo = useCallback(() => setVideoHidden((v) => !v), []);

  return (
    <>
      <div className="casino-center">

          <MobileTimer timeLeft={lt} fullTime={ft} />

          <div className={`casino-table ${TABLE_CLASS} detail-page-container`}>

            <div className="game-header">
              <span className="game-header-name">{team1} Vs {team2} {GAME_NAME}</span>
              <span className="game-header-date">Round ID: {gmid}</span>
            </div>

            <div className="container-fluid container-fluid-5">
              <div className="row row5">

                <div className="col-12 col-lg-2 banner d-flex align-items-center p-0">
                  <SuperOverScorecard team1={team1} team2={team2} cardString={card} />
                </div>

                <div className="col-lg-10 col-12">
                  <div className="d-none-big">
                    <MobileDigitTimer timeLeft={lt} />
                  </div>

                  <div className="casino-video">
                    {isDisconnected && (
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
                        {!videoHidden && !isDisconnected && streamUrl && (
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
                      <SuperOverBalls cardString={card} />
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

            <CricketCardRules team1={team1} team2={team2} />

          </div>

        <div className="casino-banners"></div>
        <Footer />
      </div>

      <div id="right-sidebar-id" className="right-sidebar casino-right-sidebar teen2sidebar five-sidebar">

        <span>
          {showPlaceBet && selectedItem && (
            <div className="bet-slip-container">
              <div><h4 className="mb-0 bet-slip-title">Bet Slip</h4></div>
              <div className={`bet-slip-box ${betType === 'lay' ? 'lay' : 'back'}`}>
                <div className="bet-slip">
                  <div className="bet-nation">
                    <span>{GAME_NAME}</span>
                    <a href="javascript:void(0)" className="close-bet float-right" onClick={closeBetPanel}>
                      <img src="/assets/front/img/close.svg" alt="close" />
                    </a>
                  </div>
                  <div className="match-result">Bookmaker</div>
                  <div className="bet-team">
                    <span title={selectedItem?.nat || ''} className="bet-team-name">{selectedItem?.nat || ''}</span>
                    <span className="float-right">{betValue}</span>
                  </div>
                </div>
                <div className={`bet-input ${betType === 'lay' ? 'lay-border' : 'back-border'}`}>
                  <input
                    type="text"
                    id="placebetAmountWeb1"
                    maxLength="9"
                    placeholder="Amount"
                    className="form-control"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value.replace(/\D/g, ''))}
                    disabled={placing}
                  />
                </div>
                <div className="possible-win">
                  <span>Profit: </span>
                  <h1 className="mb-0">
                    {(() => {
                      const s = parseFloat(stakeAmount) || 0;
                      const o = parseFloat(betValue) || 0;
                      if (!s || !o) return '0';
                      return (o >= 10 ? (o / 100) * s : (o - 1) * s).toFixed(2);
                    })()}
                  </h1>
                </div>
                <div className="bet-buttons">
                  {[10, 20, 50, 100, 200, 500].map((val) => (
                    <button
                      key={val}
                      className="btn btn-primary"
                      onClick={() => setStakeAmount((prev) => String((parseInt(prev, 10) || 0) + val))}
                      disabled={placing}
                    >
                      <span>+{val}</span>
                    </button>
                  ))}
                  <button
                    className="btn btn-sm btn-link text-dark flex-fill text-right w-auto mw-auto"
                    onClick={() => setStakeAmount('')}
                    disabled={placing}
                  >
                    Clear
                  </button>
                </div>
                <div className="place-bet-btn">
                  <button
                    className="btn btn-primary btn-block"
                    disabled={placing || !stakeAmount || Number(stakeAmount) <= 0}
                    onClick={handlePlaceBet}
                  >
                    <span>{placing ? 'Placing...' : 'Place Bet'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </span>

        <div className="casino-place-bet">
          <div className="casino-place-bet-title"><span>Last Results</span></div>
          <div className="casino-video-last-results">
            {lastResults.map(renderResult)}
            <Link to={REPORT_LINK} className="result-more">...</Link>
          </div>
        </div>

        <span></span>

        <div className="my-market-container">
          <div data-toggle="collapse" data-target="#market-data-1" className="my-market-title">
            <span>My Bet</span>
          </div>
          {myBets.length > 0 && (
            <div id="market-data-1" className="bet-slip-box collapse show">
              <table className="coupon-table table table-borderedless">
                <thead>
                  <tr className="theme1font">
                    <th style={{ width: '40%' }}>Nation</th>
                    <th className="text-right">Odds</th>
                    <th className="text-right p-r-15">Stake</th>
                  </tr>
                </thead>
                <tbody>
                  {myBets.map((bet, i) => (
                    <tr key={bet._id || i} className={bet.type || 'back'}>
                      <td><span>{bet.player_name || bet.selection || ''}</span></td>
                      <td className="text-right">{bet.odds ?? ''}</td>
                      <td className="text-right p-r-15">{bet.amount ?? bet.stake ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <CricketCardRules team1={team1} team2={team2} />
      </div>

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
