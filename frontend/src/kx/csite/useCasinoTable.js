import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { SAMPLES } from './samples';
import { setRoomTimer } from './shell/CasinoRoom';

/**
 * A Universe table's state, in the casino site's own model — what its pages
 * render:
 *
 *   game: { eventId, roundId, status: 'ONLINE' | 'SUSPEND', timeLeft, fullTime,
 *           cards,                    // the dealt cards, per the table's layout
 *           marketArr: [{ marketId, marketName, min, max, status,
 *             runners: [{ selectionId, status, price: { back: [{ price, size }],
 *                                                       lay: [{ price, size }] } }],
 *             runnersName: { [selectionId]: name } }] }
 *   results:  the "Recent Result" rounds, newest first
 *   casinoPl: { [marketId]: { [selectionId]: profit/loss } }
 *
 * UI ONLY: the casino site gets all of this from Universe's feed; this app has
 * no feed wired to these pages yet, so each table shows the sample captured
 * from the reference (samples/), with its markets suspended. The backend
 * replaces this hook's data; the pages need no change.
 *
 * The slip is the reference's own page state (openBetslip / betplaceObj /
 * isValueBetsSlip); placing a bet is the backend's job, so `placeBet` is the
 * hook to wire it to.
 */
export default function useCasinoTable(eventId) {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const sample = SAMPLES[eventId];
  const [slip, setSlip] = useState(null);
  const [value, setValue] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');

  const game = useMemo(() => ({
    eventId,
    roundId: '',
    status: 'SUSPEND',
    timeLeft: 0,
    fullTime: 0,
    cards: [],
    marketArr: [],
    ...sample?.game,
  }), [eventId, sample]);

  // The gear steps aside while the round's timer ring shows (VideoSimple shows
  // it for an ONLINE round with a time limit).
  const timer = game.status === 'ONLINE' && game.fullTime > 0 ? game.timeLeft : 0;
  useEffect(() => { setRoomTimer(timer); return () => setRoomTimer(0); }, [timer]);

  const openBetslip = useCallback((marketId, selectionId, betType, price) => {
    const market = game.marketArr.find((m) => m.marketId === String(marketId));
    if (!market || !(Number(price) > 0)) { setSlip(null); setValue(0); return; }
    setValue(0);
    setStakeAmount('');
    setSlip({
      marketId: String(marketId),
      selectionId: String(selectionId),
      betType,
      price,
      eventId,
      minValue: market.min,
      maxValue: market.max,
    });
  }, [game.marketArr, eventId]);

  const closeBetslip = useCallback(() => { setSlip(null); setValue(0); setStakeAmount(''); }, []);

  // Placement is not wired: the slip closes as the reference's does after a
  // bet is sent.
  const placeBet = useCallback(() => closeBetslip(), [closeBetslip]);

  return {
    game,
    results: sample?.results || [],
    streamUrl: '',
    casinoPl: {},
    slip,
    value,
    setValue,
    openBetslip,
    closeBetslip,
    bet: { stakeAmount, setStakeAmount, placing: false, handlePlaceBet: placeBet, closeBetPanel: closeBetslip },
    isAuth,
  };
}
