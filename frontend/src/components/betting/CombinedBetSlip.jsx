import { useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import FullScreenLoader from '../FullScreenLoader';
import { bToastSuccess, bToastError } from '../BToast';
import { sportsPlaceCombinedBet } from '../../apiservices/sportsService';
import { addMatchedBet } from '../../redux/matchedBetsSlice';
import { updateMatchExposure, updateUserBalanceAndExposure, fetchBalanceThunk } from '../../redux/userSlice';
import { prepareBetPayload } from '../../utils/betHelpers';
import { isDemoUser } from '../../utils/demoStore';
import { BET_TOAST } from '../../utils/betToastMessages';
import { MIN_BET_AMOUNT } from './placeBet/placeBetRules';
import { calcCombinedOdds, splitCombinedStake, isRaceBettingOpen, RACE_WINDOW_TOAST } from '../../utils/racingUtils';

// Best available price of one side for a racing runner (tno 0 = top of book).
function bestSideOdd(runner, side) {
  return (runner?.odds || []).find(
    (o) => (o.otype || '').toLowerCase() === side && o.tno === 0 && o.odds > 0
  ) || null;
}

/**
 * CombinedBetSlip — the dutched multi-runner slip for the racing COMBINED row.
 *
 * One typed stake, split across the ticked runners in proportion to 1/odds so
 * the return is identical whichever of them wins. Submits every leg through
 * POST /user/place-combined (all-or-nothing on the server).
 *
 * Before sending, every leg is re-read from the freshest polled market:
 * a suspended/removed leg rejects the slip; if the live combined price moved
 * AGAINST the user the slip is refused with "Odds changed" and refreshed to
 * the new price so they can re-submit. A move in their favour is accepted.
 */
export default function CombinedBetSlip({
  market,
  checkedRunners,
  side,               // 'back' | 'lay'
  lockedOdds,         // combined price captured at click time
  onLockedOddsChange,
  gmid,
  sid,
  race,
  label,              // "4 + 5" board-position label
  onClose,
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.user);
  const quickAmounts = useSelector((s) => s.stakeButtons.gameButtons);
  const [stakeValue, setStakeValue] = useState('');
  const [loading, setLoading] = useState(false);

  const stakeNum = parseFloat(stakeValue) || 0;
  const isBack = side === 'back';
  const sportName = String(sid) === '10' ? 'Horse Racing' : 'Greyhound Racing';

  // Live per-leg odds straight from the (2s-polled) market prop
  const legOdds = checkedRunners.map((r) => bestSideOdd(r, side)?.odds || 0);
  const liveCombined = calcCombinedOdds(legOdds);
  const displayOdds = lockedOdds || liveCombined || 0;

  // A dutched slip behaves exactly like a single bet at the combined price:
  //   back: profit = total × (odds − 1), loss = total
  //   lay : profit = total,              liability = total × (odds − 1)
  const profit = stakeNum > 0 && displayOdds > 1
    ? (isBack ? stakeNum * (displayOdds - 1) : stakeNum)
    : 0;

  const handleStakeKeyPress = (e) => {
    if (e.charCode < 48 || e.charCode > 57) e.preventDefault();
  };
  const handleStakeChange = (e) => setStakeValue(e.target.value.replace(/[^0-9]/g, ''));
  const handleQuickStake = (val) => setStakeValue((prev) => String((parseFloat(prev) || 0) + val));

  const handleSubmit = async () => {
    if (loading) return;
    if (isDemoUser(user)) {
      bToastError('Combined betting is not available in demo mode.');
      return;
    }
    if (!(stakeNum > 0)) { bToastError(BET_TOAST.ENTER_VALID_STAKE); return; }

    // Market limits on the SLIP TOTAL (per-leg min is waived server-side)
    const minStake = Math.max(MIN_BET_AMOUNT, Number(market.min) || 0);
    const maxStake = Number(market.max) > 0 ? Number(market.max) : 100000;
    if (stakeNum < minStake) { bToastError(BET_TOAST.MIN_BET_LIMIT); return; }
    if (stakeNum > maxStake) { bToastError(BET_TOAST.MAX_BET_LIMIT); return; }

    // Horse racing: bets open only in the final minutes before the off
    if (String(sid) === '10' && race?.stime && !isRaceBettingOpen(race.stime)) {
      bToastError(RACE_WINDOW_TOAST);
      return;
    }

    // Submit-time re-check against the freshest polled market
    const freshLegs = [];
    for (const r of checkedRunners) {
      const gs = (r.gstatus || '').toUpperCase();
      if (gs && gs !== 'ACTIVE') { bToastError(BET_TOAST.GAME_NOT_ACTIVE); return; }
      const odd = bestSideOdd(r, side);
      if (!odd) { bToastError(BET_TOAST.GAME_NOT_ACTIVE); return; }
      freshLegs.push({ runner: r, odd });
    }
    const freshOdds = freshLegs.map((l) => l.odd.odds);
    const freshCombined = calcCombinedOdds(freshOdds);
    if (!freshCombined) { bToastError(BET_TOAST.GAME_NOT_ACTIVE); return; }
    // Moved against the user (back lower / lay higher) → refuse and refresh
    // the slip to the new price so they can re-submit. Favourable moves pass.
    const movedAgainst = isBack
      ? freshCombined < (lockedOdds || 0) - 0.001
      : freshCombined > (lockedOdds || Infinity) + 0.001;
    if (lockedOdds && movedAgainst) {
      onLockedOddsChange?.(freshCombined);
      bToastError(BET_TOAST.ODDS_CHANGED);
      return;
    }

    const parts = splitCombinedStake(stakeNum, freshOdds);
    if (!parts) { bToastError(BET_TOAST.INVALID_BET || 'Invalid bet'); return; }

    // No client-side balance gate — the server checks the wallet per leg and
    // the combined slip is all-or-nothing, so a partial debit is impossible.

    const allSections = market.section || [];
    const runnerNames = allSections.map((s) => s.nat || '');
    const title = runnerNames.join(' vs ');

    const payloads = freshLegs.map((l, i) => {
      const nat = l.runner.nat || '';
      const legBv = {
        odds: l.odd.odds,
        betType: side,
        team: nat,
        teamName: nat,
        marketType: 'MATCH_ODDS',
        market_type: market.mname || 'MATCH_ODDS',
        market_id: market.mid,
        selectionId: l.runner.sid,
        event_id: gmid,
        event_name: title,
        match_title: title,
        match_start_time: race?.stime || '',
        sid,
        sports: sportName,
        game_type: 'MATCH',
        mname: market.mname || '',
        market_name: market.mname || '',
        gtype: market.gtype || 'match',
        section: allSections,
        runners: runnerNames,
        outcomes: runnerNames,
        team_one: runnerNames[0] || '',
        team_two: runnerNames[1] || '',
        min_stake: market.min || null,
        // maxb is a feed FLAG (1) on racing markets, never a stake cap
        max_stake: market.max || null,
        maxb: null,
        back_size: (side === 'back' ? l.odd : bestSideOdd(l.runner, 'back'))?.size,
        lay_size: (side === 'lay' ? l.odd : bestSideOdd(l.runner, 'lay'))?.size,
        market,
      };
      return prepareBetPayload(legBv, l.odd.odds, parts[i], user, 'MATCH_ODDS', side, nat);
    });

    setLoading(true);
    try {
      const result = await sportsPlaceCombinedBet(payloads);
      onClose?.();
      bToastSuccess(BET_TOAST.BET_PLACED);
      freshLegs.forEach((l, i) => dispatch(addMatchedBet({
        id: Date.now() + i,
        stake: parts[i],
        odds: l.odd.odds,
        betType: side,
        teamName: l.runner.nat || '',
        marketType: 'MATCH_ODDS',
        market_id: market.mid || '',
        timestamp: new Date().toISOString(),
      })));
      if (result.exposure) dispatch(updateMatchExposure(result.exposure));
      if (result.newBalance !== undefined || result.totalExposure !== undefined) {
        dispatch(updateUserBalanceAndExposure({ balance: result.newBalance, exposure: result.totalExposure }));
      }
      const token = localStorage.getItem('token');
      if (token && token !== 'demo-token') dispatch(fetchBalanceThunk(token));
      setTimeout(() => window.dispatchEvent(new Event('bet:placed')), 250);
    } catch (err) {
      const msg = err.message || BET_TOAST.GENERIC_ERROR;
      bToastError(msg.toLowerCase().includes('fetch') ? BET_TOAST.NETWORK_ERROR : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`place-bet ${isBack ? 'back' : 'lay'}`}>
      {loading && ReactDOM.createPortal(<FullScreenLoader />, document.body)}
      <div className="container-fluid">
        <div className="row">
          <div className="col-9">
            <p><b>COMBINED {label}</b></p>
          </div>
          <div className="col-3 text-right">
            <div className="possible-win">
              <span>Profit:</span> <b className="mb-0">{profit > 0 ? String(Number(profit.toFixed(2))) : '0'}</b>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 col-7 d-flex flex-wrap align-items-center">
            {quickAmounts.map((q) => (
              <button key={q.value} className="btn btn-bet" onClick={() => handleQuickStake(q.value)}>
                <span>{q.label}</span>
              </button>
            ))}
          </div>
          <div className="col-5 col-md-6 d-flex justify-content-center flex-wrap flex-column align-items-end">
            <div>
              {/* Combined price is locked at click time — not editable */}
              <input type="text" className="stakeinput" value={displayOdds || '-'} readOnly />
            </div>
            <div className="bet-input mt-1">
              <div className="bet-input">
                <input
                  type="number"
                  placeholder="Amount"
                  className="stakeinput ml-2"
                  value={stakeValue}
                  onKeyPress={handleStakeKeyPress}
                  onChange={handleStakeChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-1">
          <div className="col-6">
            <button className="btn btn-danger" onClick={onClose}>Close</button>
            <button className="btn btn-warning" onClick={() => setStakeValue('')}>Clear</button>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <button className="btn btn-success" disabled={stakeNum <= 0} onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
