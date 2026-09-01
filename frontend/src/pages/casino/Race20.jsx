import { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MobileTimer } from '../../components/casino/CasinoTimer';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTableRace20 from '../../components/casino/BetTableRace20';
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
import { parseCards } from '../../components/casino/cards/cardUtils';

const GAME_TYPE = 'race20';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/race20';

const SUIT_ICONS = {
  '1': '/assets/front/img/cards/spade.png',
  '2': '/assets/front/img/cards/heart.png',
  '3': '/assets/front/img/cards/club.png',
  '4': '/assets/front/img/cards/diamond.png',
};

const SUIT_CLASSES = {
  '1': 'resulta',
  '2': 'resultb',
  '3': '',
  '4': '',
};

/**
 * Race20 card point value:
 * A=1, 2-9=face, 10/J/Q/K=10
 */
function cardPoint(code) {
  if (!code || code === '1' || code === '0') return 0;
  const rank = code.replace(/(CC|DD|HH|SS)$/i, '');
  if (rank === 'A') return 1;
  const n = Number(rank);
  if (!isNaN(n) && n >= 2 && n <= 9) return n;
  return 10;
}

function computeTotals(cardString) {
  const codes = parseCards(cardString);
  const dealtCodes = codes.filter((c) => c && c !== '1' && c !== '0');
  const totalCards = dealtCodes.length;
  const totalPoints = dealtCodes.reduce((sum, c) => sum + cardPoint(c), 0);
  return { totalCards, totalPoints };
}

export default function Race20() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid    = gameData?.mid ?? '';
  const lt     = gameData?.lt  ?? 0;
  const ft     = gameData?.ft  ?? 40;
  const card   = gameData?.card ?? '';

  const { totalCards, totalPoints } = useMemo(() => computeTotals(card), [card]);

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
    const win = String(r.win);
    const icon = SUIT_ICONS[win];
    const cls = SUIT_CLASSES[win] ?? '';
    return (
      <span
        key={i}
        className={cls}
        onClick={() => handleResultClick(r)}
        style={{ cursor: 'pointer' }}
      >
        {icon && <img src={icon} alt={win} />}
      </span>
    );
  }, [handleResultClick]);

  const customVideoTitle = (
    <div className="casino-video-title">
      <span className="casino-name">{GAME_CONFIG.name}</span>
      {mid && <div className="casino-video-rid">Round ID: {mid}</div>}
      <div className="total-points d-none-small">
        <div>
          <div>Total Cards:</div>
          <div>{totalCards}</div>
        </div>
        <div>
          <div>Total Points:</div>
          <div>{totalPoints}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="casino-center">
        <div className="casino-container">

          <MobileTimer timeLeft={lt} fullTime={ft} />

          <div className={`casino-table ${GAME_CONFIG.tableClass}`}>

            <CasinoVideo
              streamUrl={streamUrl}
              gameType={GAME_TYPE}
              showCards={true}
              cardString={card}
              showTimers
              timeLeft={lt}
              fullTime={ft}
              tableClass={GAME_CONFIG.tableClass}
              customTitle={customVideoTitle}
            />

            <div className="casino-detail">
              <BetTableRace20
                gameData={gameData}
                onBet={handleBet} exposures={exposures}
                totalCards={totalCards}
                totalPoints={totalPoints}
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
