import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { bToastSuccess, bToastError } from '../../components/BToast';
import { placeCasinoBet } from '../../apiservices/casinoService';
import { fetchBalanceThunk } from '../../redux/userSlice';
import { isDemoUser } from '../../utils/demoStore';
import { fakeLoaderDelay } from '../../utils/fakeLoader';
import { CASINO_BUFFER_SECONDS } from '../../config';

const BUFFER_MS = CASINO_BUFFER_SECONDS * 1000;
const CHECK_INTERVAL_MS = 500;

export default function useCasinoBet({ gameType, matchId, isAuth, onSuccess, gameData }) {
  const dispatch = useDispatch();
  const [showPlaceBet, setShowPlaceBet] = useState(false);
  // betValue = the DECIMAL price the bet is placed at (drives profit + the odds
  // baseline). betDisplayOdds = what the slip's Odds box shows; identical to
  // betValue EXCEPT for session-rate line markets (trio Session, mogambo "3 Card
  // Total", superover Fancy), where the slip shows the run LINE (e.g. 21) while
  // the bet is still priced off the rate-derived decimal (e.g. 1.80).
  const [betValue, setBetValue] = useState('');
  const [betDisplayOdds, setBetDisplayOdds] = useState('');
  const [betType, setBetType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [placing, setPlacing] = useState(false);

  // Keep latest gameData in a ref so buffer interval always reads fresh data
  const gameDataRef = useRef(gameData);
  useEffect(() => { gameDataRef.current = gameData; }, [gameData]);

  const betTypeRef = useRef(betType);
  useEffect(() => { betTypeRef.current = betType; }, [betType]);

  const handleBet = useCallback((sid, type, odd, item) => {
    if (!isAuth) { bToastError('Please login to place bets'); return; }
    setBetValue(odd);
    // Odds box: session-rate markets show their run line; everything else shows
    // the priced odds.
    setBetDisplayOdds(item?._sessionRate ? (item._line ?? odd) : odd);
    setBetType(type);
    setSelectedItem(item);
    setShowPlaceBet(true);
    setStakeAmount('');
  }, [isAuth]);

  const handlePlaceBet = useCallback(async () => {
    if (!isAuth) { bToastError('Please login'); return; }
    const amount = parseFloat(stakeAmount) || 0;
    if (amount <= 0) { bToastError('Enter a valid stake'); return; }
    if (!selectedItem) return;

    // Enforce the runner's bet-amount range. min/max come straight from the live
    // feed item the user clicked; each side is only enforced when the feed quotes
    // it (> 0), so a market that omits a bound doesn't get a bogus default.
    const minBet = Number(selectedItem.min) || 0;
    const maxBet = Number(selectedItem.max) || 0;
    if ((minBet > 0 && amount < minBet) || (maxBet > 0 && amount > maxBet)) {
      bToastError('Bet Not Confirm Reason Min and Max Bet Range Not Valid.');
      return;
    }

    // Immediate gstatus check before starting buffer
    const currentGstatus = (selectedItem.gstatus || '').toUpperCase();
    if (currentGstatus === 'SUSPENDED' || selectedItem.gstatus === '0') {
      bToastError('Bet Not Confirm Reason Game Suspended.');
      return;
    }

    // Timer blocking - reject if round is about to end (skip if gstatus explicitly OPEN)
    if (currentGstatus !== 'OPEN') {
      const currentLt = gameDataRef.current?.lt ?? 0;
      if (currentLt <= 1) {
        bToastError('Bet Not Confirm Reason Game Suspended.');
        return;
      }
    }

    // ── Demo user — casino bets are not supported in demo mode; mimic a real
    //    API call (1s placing loader), then the reference "Data Error1" toast ──
    const demoUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (localStorage.getItem('token') === 'demo-token' && isDemoUser(demoUser)) {
      setPlacing(true);
      await fakeLoaderDelay();
      setPlacing(false);
      bToastError('Data Error1');
      // Close the bet slip/modal after the error, like a finished attempt
      setShowPlaceBet(false);
      setSelectedItem(null);
      setStakeAmount('');
      return;
    }

    setPlacing(true);
    try {
      // ── Buffer period: monitor odds & suspension ──
      const selSid = selectedItem.sid;
      const selName = selectedItem.nat || '';
      const selSubtype = selectedItem.subtype || '';
      // Session-rate markets (superover-family Fancy, mogambo "3 Card Total")
      // quote a LINE in b/l and the RATE in bbhav/lbhav — the decimal price is
      // rate/100 + 1. The re-reads below must re-derive from the rate, or they
      // would overwrite the converted decimal with the raw line again.
      const isSessionRate = !!selectedItem._sessionRate;
      // Baccarat/Baccarat2 quote NET ("to 1") odds in `b` (Player 1:1, Tie 8:1,
      // Big 0.54:1, …). The bet is placed at the DECIMAL price b+1, so the buffer
      // must re-derive b+1 from the live feed too, or it would read the raw net
      // odds, see them fall below the placed decimal and reject every bet.
      const isNetOdds = !!selectedItem._netOdds;
      const originalOdds = parseFloat(betValue) || 0;
      let latestOdds = originalOdds;
      // The line quoted at click time — session-rate bets tag their selection
      // with it (settlement compares the result against the line, not the price).
      let latestLine = isSessionRate
        ? (selectedItem._line ?? (betType === 'lay' ? selectedItem.l : selectedItem.b))
        : null;
      let suspended = false;
      let suspendReason = '';

      // sid first (handles duplicate nat values like teen62 con); the nat
      // fallback must stay inside the same market — with a duplicated nat it
      // could land on the OTHER market's row, whose state is often opposite,
      // and report a false "Game Suspended" for an open market.
      const findLiveItem = (list) =>
        list.find((s) => s.sid === selSid) ||
        list.find((s) => s.nat === selName && (!selSubtype || s.subtype === selSubtype));

      const liveOddsOf = (item) => {
        if (isSessionRate) {
          const rate = betTypeRef.current === 'lay'
            ? parseFloat(item.lbhav)
            : parseFloat(item.bbhav);
          return rate > 0 ? rate / 100 + 1 : 0;
        }
        if (isNetOdds) {
          // Baccarat payouts are FIXED for the round — they never move — and the
          // decimal was already computed at click time (Tie is "8 for 1" = b;
          // every other selection is "to 1" = b+1). Trust it rather than
          // re-deriving from the raw net `b`, which would misprice Tie and reject
          // every bet (raw b < the placed decimal reads as an unfavorable move).
          return originalOdds;
        }
        return betTypeRef.current === 'lay'
          ? (parseFloat(item.l) || 0)
          : (parseFloat(item.b) || 0);
      };

      await new Promise((resolve) => {
        const interval = setInterval(() => {
          const gd = gameDataRef.current;
          if (!gd) return;
          const sub = gd.sub || [];
          const lt = gd.lt ?? 0;

          const currentItem = findLiveItem(sub);
          if (!currentItem) return;

          // Track the live line for the selection tag of session-rate bets
          if (isSessionRate) {
            const liveLine = betTypeRef.current === 'lay' ? currentItem.l : currentItem.b;
            if (liveLine) latestLine = liveLine;
          }

          // Suspension check — gstatus SUSPENDED or '0' both mean suspended
          const currentGstatus = (currentItem.gstatus || '').toUpperCase();
          if (currentGstatus === 'SUSPENDED' || currentItem.gstatus === '0') {
            suspended = true;
            suspendReason = 'Bet Not Confirm Reason Game Suspended.';
            clearInterval(interval);
            resolve();
            return;
          }

          // Timer check during buffer (skip if gstatus explicitly OPEN)
          if (currentGstatus !== 'OPEN' && lt <= 1) {
            suspended = true;
            suspendReason = 'Bet Not Confirm Reason Game Suspended.';
            clearInterval(interval);
            resolve();
            return;
          }

          // Odds monitoring — reject if odds change unfavorably
          const currentOdds = liveOddsOf(currentItem);

          if (currentOdds > 0 && Math.abs(currentOdds - originalOdds) > 0.001) {
            const isFavorable = betTypeRef.current === 'back'
              ? currentOdds >= originalOdds
              : currentOdds <= originalOdds;
            if (isFavorable) {
              latestOdds = currentOdds;
              setBetValue(currentOdds);
              // Session-rate slips keep showing the line, not the decimal.
              if (!isSessionRate) setBetDisplayOdds(currentOdds);
            } else {
              // Odds moved against user — reject
              suspended = true;
              suspendReason = 'Odds changed. Please try again.';
              clearInterval(interval);
              resolve();
              return;
            }
          }
        }, CHECK_INTERVAL_MS);

        setTimeout(() => {
          clearInterval(interval);
          resolve();
        }, BUFFER_MS);
      });

      if (suspended) {
        bToastError(suspendReason);
        setPlacing(false);
        return;
      }

      // Final suspension check after buffer
      const finalGd = gameDataRef.current;
      if (finalGd) {
        const finalSub = finalGd.sub || [];
        const finalItem = findLiveItem(finalSub);
        if (finalItem) {
          if (isSessionRate) {
            const liveLine = betTypeRef.current === 'lay' ? finalItem.l : finalItem.b;
            if (liveLine) latestLine = liveLine;
          }
          const finalGstatus = (finalItem.gstatus || '').toUpperCase();
          if (finalGstatus === 'SUSPENDED' || finalItem.gstatus === '0') {
            bToastError('Bet Not Confirm Reason Game Suspended.');
            setPlacing(false);
            return;
          }

          // Timer check (skip if gstatus explicitly OPEN)
          const finalLt = finalGd.lt ?? 0;
          if (finalGstatus !== 'OPEN' && finalLt <= 1) {
            bToastError('Bet Not Confirm Reason Game Suspended.');
            setPlacing(false);
            return;
          }

          // Final odds check — reject if odds changed unfavorably
          const finalOdds = liveOddsOf(finalItem);
          if (finalOdds > 0 && Math.abs(finalOdds - originalOdds) > 0.001) {
            const isFavorable = betTypeRef.current === 'back'
              ? finalOdds >= originalOdds
              : finalOdds <= originalOdds;
            if (!isFavorable) {
              bToastError('Odds changed. Please try again.');
              setPlacing(false);
              return;
            }
            latestOdds = finalOdds;
          }
        }
      }

      // ── Build payload ──
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id || '';
      const etype = (selectedItem.etype || 'match').toLowerCase();
      const selNat = selectedItem.nat || '';
      // Session-line "total" markets tag the selection with the LINE (settlement
      // does an over/under against it) — never the price. latestLine tracks the
      // live b/l during the buffer; the odds sent are the decimal derived from
      // bbhav/lbhav. Applies to mogambo "3 Card Total" and patti2 "Total A"/"Total B"
      // (Fancy2 over/under; without the line, settlement can't judge over/under).
      const isTotalLine =
        (selNat === '3 Card Total' && gameType === 'mogambo') ||
        ((selNat === 'Total A' || selNat === 'Total B') && gameType === 'patti2');
      const selection = isTotalLine ? `${selNat} ${latestLine ?? latestOdds}` : selNat;

      const payload = {
        userId: userId.toString(),
        player_name: selectedItem.nat || 'Player A',
        gameId: matchId?.toString() || '',
        gameName: gameType || '',
        gtype: gameType || '',
        amount: amount,
        odds: latestOdds,
        selection: selection,
        roundId: matchId || 0,
      };

      // mtype from etype
      payload.mtype = (etype === 'fancy1' || etype === 'fancy') ? 'fancy' : etype;

      // type (back/lay)
      if (betType === 'back' || betType === 'lay') {
        payload.type = betType;
      }

      const res = await placeCasinoBet(payload);
      if (res?.success || res?.status === 200) {
        bToastSuccess('Bet placed Successfully');
        setShowPlaceBet(false);
        setSelectedItem(null);
        setStakeAmount('');
        onSuccess?.();

        // Refresh balance
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
  }, [isAuth, stakeAmount, selectedItem, matchId, betType, betValue, gameType, onSuccess, dispatch]);

  const closeBetPanel = useCallback(() => setShowPlaceBet(false), []);

  return {
    showPlaceBet,
    betValue,
    betDisplayOdds,
    betType,
    selectedItem,
    stakeAmount,
    setStakeAmount,
    placing,
    handleBet,
    handlePlaceBet,
    closeBetPanel,
  };
}
