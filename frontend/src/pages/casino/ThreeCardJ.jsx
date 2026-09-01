import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MobileTimer } from '../../components/casino/CasinoTimer';
import CasinoVideo from '../../components/casino/CasinoVideo';
import BetTable3CardJ from '../../components/casino/BetTable3CardJ';
import CasinoPlaceBetModal from '../../components/casino/CasinoPlaceBetModal';
import CasinoResultModal from '../../components/casino/CasinoResultModal';
import CasinoRightSidebar from '../../components/casino/CasinoRightSidebar';
import Footer from '../../components/layout/Footer';
import useCasinoGame from '../../hooks/casino/useCasinoGame';
import useCasinoLastResults from '../../hooks/casino/useCasinoLastResults';
import useCasinoMyBets from '../../hooks/casino/useCasinoMyBets';
import useCasinoStream from '../../hooks/casino/useCasinoStream';
import { getGameConfig } from '../../config/casinoGames';
import { placeCasinoBet } from '../../apiservices/casinoService';
import { fetchBalanceThunk } from '../../redux/userSlice';
import { bToastSuccess, bToastError } from '../../components/BToast';

const GAME_TYPE = '3cardj';
const GAME_CONFIG = getGameConfig(GAME_TYPE);
const REPORT_LINK = '/report/casinoresult/3cardj';
const MAX_CARDS = 3;

function isSusp(item) {
  return !item || item.gstatus === 'SUSPENDED' || item.b === 0 || item.b === '0';
}

export default function ThreeCardJ() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const dispatch = useDispatch();
  const [resultMid, setResultMid] = useState(null);

  const { data: gameData } = useCasinoGame(GAME_TYPE);
  const { data: lastResults = [] } = useCasinoLastResults(GAME_TYPE);
  const { streamUrl } = useCasinoStream(GAME_TYPE);

  const mid = gameData?.mid ?? '';
  const lt  = gameData?.lt ?? 0;
  const ft  = gameData?.ft ?? 25;
  const sub = gameData?.sub ?? [];
  const yesItem = sub.find((s) => s.nat === 'Yes');
  const noItem  = sub.find((s) => s.nat === 'No');

  const { myBets, exposures, refetch: refetchBets } = useCasinoMyBets(mid, isAuth);

  // ── 3-card pick state ──
  // The player builds a bet by picking exactly 3 distinct cards on the Yes or No
  // side; the panel opens on the first pick and Submit stays disabled until 3.
  const [pick, setPick] = useState({ side: null, cards: [] });
  const [stakeAmount, setStakeAmount] = useState('');
  const [placing, setPlacing] = useState(false);

  const sideItem = pick.side === 'Yes' ? yesItem : pick.side === 'No' ? noItem : null;
  const showPlaceBet = pick.cards.length > 0 && !!pick.side;
  // e.g. "Yes 479" — shown in the slip and stored as the bet selection.
  const betName = pick.side ? `${pick.side} ${pick.cards.join('')}` : '';
  const betValue = sideItem?.b || 0;

  // Worst-case exposure per side = sum of that side's back stakes (each row is
  // keyed by its full selection like "No 479"), shown in front of Yes / No.
  const sideExposure = (side) => (
    exposures
      ? Object.keys(exposures).reduce((acc, k) => (k.startsWith(`${side} `) ? acc + (Number(exposures[k]) || 0) : acc), 0)
      : 0
  );
  const yesExposure = sideExposure('Yes');
  const noExposure = sideExposure('No');

  const onCardSelect = useCallback((face, side) => {
    const item = side === 'Yes' ? yesItem : noItem;
    if (isSusp(item)) return;
    if (!isAuth) { bToastError('Please login to place bets'); return; }
    setPick((prev) => {
      if (prev.side && prev.side !== side) return { side, cards: [face] }; // switch side → restart
      if (prev.cards.includes(face)) return prev;      // same card can't be picked twice
      if (prev.cards.length >= MAX_CARDS) return prev; // already have 3
      return { side, cards: [...prev.cards, face] };
    });
    setStakeAmount('');
  }, [yesItem, noItem, isAuth]);

  const closeBetPanel = useCallback(() => {
    setPick({ side: null, cards: [] });
    setStakeAmount('');
  }, []);

  const submitBet = useCallback(async () => {
    if (!isAuth) { bToastError('Please login'); return; }
    if (!pick.side || pick.cards.length !== MAX_CARDS) { bToastError('Select 3 cards'); return; }
    const amount = parseFloat(stakeAmount) || 0;
    if (amount <= 0) { bToastError('Enter a valid stake'); return; }
    const item = pick.side === 'Yes' ? yesItem : noItem;
    if (isSusp(item)) { bToastError('Bet Not Confirm Reason Game Suspended.'); return; }
    const minBet = Number(item.min) || 0;
    const maxBet = Number(item.max) || 0;
    if ((minBet > 0 && amount < minBet) || (maxBet > 0 && amount > maxBet)) {
      bToastError('Bet Not Confirm Reason Min and Max Bet Range Not Valid.');
      return;
    }
    setPlacing(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id || '';
      // e.g. "Yes 479" — used as both the settlement selection and the display
      // name so My Bets shows the picked cards, not just "Yes".
      const selection = `${pick.side} ${pick.cards.join('')}`;
      const res = await placeCasinoBet({
        userId: userId.toString(),
        player_name: selection,
        gameId: mid?.toString() || '',
        gameName: GAME_TYPE,
        gtype: GAME_TYPE,
        amount,
        odds: Number(item.b) || 0,
        selection,
        roundId: mid || 0,
        mtype: 'match',
        type: 'back',
      });
      if (res?.success || res?.status === 200) {
        bToastSuccess('Bet placed Successfully');
        closeBetPanel();
        refetchBets?.();
        const token = localStorage.getItem('token');
        if (token) dispatch(fetchBalanceThunk(token));
      } else {
        bToastError(res?.error || res?.msg || 'Failed to place bet');
      }
    } catch {
      bToastError('Error placing bet');
    } finally {
      setPlacing(false);
    }
  }, [isAuth, pick, stakeAmount, yesItem, noItem, mid, closeBetPanel, refetchBets, dispatch]);

  const handleResultClick = useCallback((r) => {
    setResultMid(r.mid || null);
  }, []);

  const renderResult = useCallback((r, i) => (
    <span key={i} className="resultb" onClick={() => handleResultClick(r)} style={{ cursor: 'pointer' }}>
      R
    </span>
  ), [handleResultClick]);

  const submitDisabled = pick.cards.length < MAX_CARDS;
  const panelBetType = pick.side === 'No' ? 'lay' : 'back';

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
              cardString={gameData?.card}
              showCards
              showTimers
              timeLeft={lt}
              fullTime={ft}
              tableClass={GAME_CONFIG.tableClass}
            />

            <div className="casino-detail">
              <BetTable3CardJ
                gameData={gameData}
                onCardSelect={onCardSelect}
                pick={pick}
                yesExposure={yesExposure}
                noExposure={noExposure}
              />

              <CasinoPlaceBetModal
                show={showPlaceBet}
                betType={panelBetType}
                betName={betName}
                betValue={betValue}
                submitDisabled={submitDisabled}
                stakeAmount={stakeAmount}
                setStakeAmount={setStakeAmount}
                placing={placing}
                onSubmit={submitBet}
                onClose={closeBetPanel}
                minBet={sideItem?.min}
                maxBet={sideItem?.max}
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
        showPlaceBet={showPlaceBet}
        betName={betName}
        betValue={betValue}
        submitDisabled={submitDisabled}
        betType={panelBetType}
        stakeAmount={stakeAmount}
        setStakeAmount={setStakeAmount}
        placing={placing}
        onSubmit={submitBet}
        onClose={closeBetPanel}
        minBet={sideItem?.min}
        maxBet={sideItem?.max}
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
