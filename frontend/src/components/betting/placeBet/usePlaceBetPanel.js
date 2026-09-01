// ─── usePlaceBetPanel — the ENTIRE logic layer of PlaceBetPanel ──────────────
// State, redux wiring, derived values, and the submit pipeline live here.
// PlaceBetPanel.jsx stays presentation-only and renders whatever this returns.
//
// Submit pipeline (each step can reject with a toast and stop):
//   0. anti-spam attempt limit         → registerBetAttempt (max 4 / market)
//   1. validate stake / market state   → getBetValidationError (rules)
//   2. manual-edit instant precheck    → bookieFavourCheck
//   3. buffer monitoring               → monitorOddsBuffer (live checks)
//   4. final live suspension check     → getFinalSuspensionStatus
//   5. fancy strict odds check         → checkFancyOddsDrift
//   6. bookie favour check             → bookieFavourCheck
//   7. demo user flow                  → demoPlaceBet (local)
//   8. real user flow                  → sportsPlaceBet (API)

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bToastSuccess, bToastError } from '../../BToast';
import { sportsPlaceBet, getMatchExposures } from '../../../apiservices/sportsService';
import { addMatchedBet } from '../../../redux/matchedBetsSlice';
import {
  updateMatchExposure,
  updateUserBalanceAndExposure,
  updateDemoBalanceAndExposure,
  fetchBalanceThunk,
} from '../../../redux/userSlice';
import {
  calculateMatchOddsResults,
  calculateTiedMatchResults,
  prepareBetPayload,
} from '../../../utils/betHelpers';
// Two separate pipelines by design: manual (user edited the price) and auto
// (untouched price, live-odds rules). The auto path was already correct, so it
// keeps its own function and manual-bet work can't regress it.
import {
  manualBetGate, manualBetLiveCheck, autoBetCheck, isBookieFavourMarket,
} from '../../../utils/bookieFavour';
import { isDemoUser, demoPlaceBet, demoExposureAfterBet } from '../../../utils/demoStore';
import { BET_TOAST } from '../../../utils/betToastMessages';
import { BET_BUFFER_SECONDS, FANCY_BUFFER_SECONDS } from '../../../config';
import {
  normalizeName,
  calcPL,
  isLaySide,
  stepOdds,
  isOddsLockedByType,
  isBookmakerStyle,
  MARKET_FAMILY,
  getMarketFamily,
  hasRunnerBook,
  exposureItemMatchesMarket,
  suspensionToastMessage,
  BET_ERROR,
  getBetValidationError,
  MIN_BET_AMOUNT,
  isOverRateBlocked,
} from './placeBetRules';
import {
  monitorOddsBuffer,
  getFinalSuspensionStatus,
  checkFancyOddsDrift,
} from './placeBetLiveChecks';
import { registerBetAttempt } from './betAttemptTracker';
import { getPlatformBufferSeconds } from './bufferTime';

// One-click dedupe across panel INSTANCES: GameDetails renders the market
// list twice (mobile + desktop DOM — CSS hides one, but React mounts BOTH),
// so the same activeBet object mounts two panels and each one's auto-submit
// effect fires → double bet. The per-instance oneClickFiredRef can't see the
// other instance; this shared set can — whichever instance claims the bet
// object first wins, the other skips. WeakSet so consumed bets get GC'd.
const oneClickSubmittedBets = new WeakSet();

export default function usePlaceBetPanel({
  betValue,
  betType: betTypeProp = 'back',
  teamName: teamNameProp = '',
  odds: oddsProp = '',
  marketType: marketTypeProp = 'MATCH_ODDS',
  market = {},
  section = {},
  suspended = false,
  marketsRef,
  matchId,
  onClose,
  onSubmit,
  onBetChange,
}) {
  // ── normalize the incoming bet value (shape varies per market block) ─────
  const bv = (typeof betValue === 'object' && betValue !== null) ? betValue : {};

  const effectiveBetType    = bv.betType   || bv.bet_type || bv.type || betTypeProp;
  const effectiveTeam       = bv.team      || bv.teamName || bv.name || teamNameProp;
  const effectiveMarketType = bv.marketType || bv.market_type || marketTypeProp;
  const effectiveMarketId   = bv.market_id;
  const effectiveSelectionId = bv.selectionId;
  const mname               = bv.mname || bv.market_name || '';

  const resolvedMarket  = bv.market  || market;
  const resolvedSection = bv.section ? (Array.isArray(bv.section) ? {} : bv.section) : section;

  // One-click betting: stake comes preset from the user-settings block and the
  // bet submits immediately through the normal pipeline — no panel UI shown.
  const isOneClick = !!bv.oneClick;
  const oneClickStake = Number(bv.oneClickStake) || 0;

  const initialOddsStr = String(bv.odds ?? oddsProp ?? '');

  // ── state ─────────────────────────────────────────────────────────────────
  const [oddsValue, setOddsValue]       = useState(initialOddsStr);
  const [stakeValue, setStakeValue]     = useState('');
  const [originalOdds, setOriginalOdds] = useState(initialOddsStr);
  const [isUserModifiedOdds, setIsUserModifiedOdds] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [matchExposureList, setMatchExposureList] = useState([]);

  // ── redux ─────────────────────────────────────────────────────────────────
  const dispatch    = useDispatch();
  const quickAmounts = useSelector(s => s.stakeButtons.gameButtons);
  const matchedBets  = useSelector(s => s.matchedBets?.matchedBets || []);
  const { user } = useSelector(s => s.user);

  // ── sync odds when betValue changes ───────────────────────────────────────
  useEffect(() => {
    const v = String(bv.odds ?? oddsProp ?? '');
    setOddsValue(v);
    setOriginalOdds(v);
    setIsUserModifiedOdds(false);
  }, [bv.odds, oddsProp]);

  // ── fresh odds-cell click → clear the stake ───────────────────────────────
  // betValue is a NEW object on every cell click (GameDetails.handleBetClick),
  // so this fires per click — the amount typed for the previous selection
  // (e.g. back) must never carry into the next one (e.g. lay of the same
  // runner, where the panel instance is reused). Typing/polling never changes
  // betValue's identity, so this can't wipe a stake mid-entry. Declared BEFORE
  // the one-click preset effect so one-click's stake wins in the same commit.
  useEffect(() => {
    setStakeValue('');
  }, [betValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── one-click: preset the stake for the freshly clicked bet ───────────────
  const oneClickFiredRef = useRef(false);
  useEffect(() => {
    if (isOneClick && oneClickStake > 0) {
      oneClickFiredRef.current = false;
      setStakeValue(String(oneClickStake));
    }
  }, [betValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── cashout: pre-fill the computed hedge stake (user still hits Submit) ───
  const isCashout = bv.is_cashout === true;
  useEffect(() => {
    if (isCashout && Number(bv.cashoutStake) > 0) {
      setStakeValue(String(bv.cashoutStake));
    }
  }, [betValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch match-level exposure from API ───────────────────────────────────
  useEffect(() => {
    let alive = true;
    const uid = user?.user_id || user?.id;
    if (!matchId || !uid || isDemoUser(user)) return;
    getMatchExposures(String(matchId), uid)
      .then(res => { if (alive && res?.success && Array.isArray(res.data)) setMatchExposureList(res.data); })
      .catch(() => {});
    return () => { alive = false; };
  }, [matchId, user?.user_id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── derived ───────────────────────────────────────────────────────────────
  const oddsNum  = parseFloat(oddsValue) || 0;
  const stakeNum = parseFloat(stakeValue) || 0;

  const gtype = (bv.gtype || bv.game_type || '').toLowerCase();
  const oddsEditable = gtype === 'match';
  const oddsLocked = !oddsEditable || isOddsLockedByType(effectiveMarketType, mname);
  const isBookmakerPanel = isBookmakerStyle(gtype, mname);
  // Bookmaker (match1) odds are NOT user-editable — `oddsLocked` stays true so
  // the panel renders a span and the manual-edit gate never fires — but they DO
  // move live, so they need the SAME directional bookie-favour check as Match
  // Odds (BACK: live<selected → reject, LAY: live>selected → reject), NOT the
  // fancy locked-odds drift check.
  //
  // This flag drives the live-odds buffer + auto favour path. It is tied to the
  // EXACT predicate autoBetCheck uses (isBookieFavourMarket) so live-tracking
  // fires precisely on the markets where directional favour will apply —
  // MATCH_ODDS / BOOKMAKER / BOOKMAKER2 / TIED. Fancy / normal / line / oddeven /
  // cricketcasino aren't bookie-favour markets, so they stay locked and go
  // through the suspension + fancy odds-drift checks instead.
  const oddsLiveTracked = oddsEditable || isBookieFavourMarket(effectiveMarketType);

  const marketFamily = getMarketFamily(effectiveMarketType);

  // Cashout hedge stakes are computed (99.02 on a min-100 market is valid) —
  // min-stake never applies to them; max still does. Every OTHER (manual) bet
  // is held to the global ₹100 floor, even when the market's own min is 0/lower
  // — a market min ABOVE 100 still wins (Math.max).
  // TEMPORARY — Line Market (dtype 14 / gtype fancy2) ships min 0 and max 0, and
  // the header prints them as "Min:0 Max:0", so there are no stake bounds to
  // enforce: any amount is accepted. Without this the global ₹100 floor and the
  // 100K ceiling below would apply to a market that never declared either.
  // Remove once the feed starts quoting real limits for it.
  const isLineMarket = Number(resolvedMarket.dtype) === 14 || gtype === 'fancy2';

  const minStake = (bv.is_cashout === true || isLineMarket)
    ? 0
    : Math.max(MIN_BET_AMOUNT, Number(bv.min_stake || resolvedSection.min || resolvedMarket.min || 0));
  // Stake limit follows the SAME chain the header displays (and the backend
  // now enforces): maxb (>0) wins, then market/section max. A maxb=100K market
  // with max=2000 must allow 100K — validating on max while showing maxb let
  // the two disagree.
  const rawMax   = Number(bv.maxb) > 0
    ? Number(bv.maxb)
    : Number(bv.max_stake || resolvedSection.max || resolvedMarket.max || 0);
  // 0 means "no ceiling" to every guard below (they all test `maxStake > 0`)
  const maxStake = isLineMarket ? 0 : (rawMax > 0 ? rawMax : 100000);

  const { profit: currentProfit } = calcPL(stakeNum, oddsNum, effectiveBetType, effectiveMarketType);

  const isNormalMarket = (mname || effectiveMarketType || '').toLowerCase().match(/normal|ball by ball|over by over/);
  const displayProfit  = isNormalMarket ? 0 : currentProfit;

  // Bookmaker/tied quote small odds (0.75, 1) — valid at any positive value.
  // Only decimal markets need the >= 1.01 floor.
  const minValidOdds = isBookmakerPanel ? 0 : 1.01;
  // Percent-quoted markets legitimately quote far above 1000 — this match's
  // Bookmaker is back 1000 / lay 1250, and the flat `<= 1000` ceiling made
  // every LAY cell fail with "Invalid bet". Decimal markets keep the old cap.
  const maxValidOdds = isBookmakerPanel ? 100000 : 1000;
  const isValid = !suspended && stakeNum > 0 && oddsNum > minValidOdds && oddsNum <= maxValidOdds
    && (minStake <= 0 || stakeNum >= minStake)
    && (maxStake <= 0 || stakeNum <= maxStake);

  const panelClass = `place-bet ${isLaySide(effectiveBetType) ? 'lay' : 'back'}`;

  // ── exposure by runner (from API) ─────────────────────────────────────────
  const exposureByRunner = useMemo(() => {
    const map = {};
    const mid = effectiveMarketId != null ? String(effectiveMarketId).trim() : '';
    (matchExposureList || []).forEach(item => {
      const itemMid = item.match_id != null ? String(item.match_id).trim() : '';
      if (mid && itemMid && itemMid !== mid) return;
      if (!exposureItemMatchesMarket(item.game_type, effectiveMarketType)) return;
      const name = item.team_name || item.teamName;
      if (name == null) return;
      const amt = Number(item.exposure_amount);
      if (!Number.isFinite(amt)) return;
      map[normalizeName(name)] = amt;
    });
    return map;
  }, [matchExposureList, effectiveMarketType, effectiveMarketId]);

  // ── per-runner win/loss ───────────────────────────────────────────────────
  const outcomeNames = useMemo(() => {
    if (bv.outcomes && Array.isArray(bv.outcomes) && bv.outcomes.length > 0) return bv.outcomes;
    if (bv.runners && Array.isArray(bv.runners) && bv.runners.length > 0) return bv.runners;
    return [effectiveTeam];
  }, [bv.outcomes, bv.runners, effectiveTeam]);

  const runnerWinLoss = useMemo(() => {
    if (!hasRunnerBook(effectiveMarketType)) return null;
    if (outcomeNames.length < 2) return null;
    const currentBet = (stakeNum > 0 && oddsNum > minValidOdds) ? {
      teamName: effectiveTeam, betType: effectiveBetType,
      odds: oddsNum, stake: stakeNum, marketType: effectiveMarketType,
    } : null;
    switch (getMarketFamily(effectiveMarketType)) {
      case MARKET_FAMILY.TIED_MATCH:
        return calculateTiedMatchResults([...matchedBets, ...(currentBet ? [currentBet] : [])]);
      default:
        return calculateMatchOddsResults(matchedBets, currentBet, outcomeNames);
    }
  }, [effectiveMarketType, outcomeNames, stakeNum, oddsNum, effectiveTeam, effectiveBetType, matchedBets]);

  const showPLSection = marketFamily !== MARKET_FAMILY.OTHER
    && runnerWinLoss && outcomeNames.length >= 2
    && (stakeNum > 0 || Object.keys(exposureByRunner).length > 0);

  // ── report bet state upward ───────────────────────────────────────────────
  useEffect(() => {
    if (onBetChange) {
      if (stakeNum > 0 && oddsNum > minValidOdds) {
        onBetChange({ stake: stakeNum, odds: oddsNum, betType: effectiveBetType, teamName: effectiveTeam, marketType: effectiveMarketType });
      } else {
        onBetChange(null);
      }
    }
  }, [stakeNum, oddsNum, effectiveBetType, effectiveTeam, effectiveMarketType, minValidOdds, onBetChange]);

  // ── input handlers ────────────────────────────────────────────────────────
  const handleOddsStep = useCallback((dir) => {
    if (oddsLocked) return;
    setOddsValue(prev => stepOdds(prev, dir));
    setIsUserModifiedOdds(true);
  }, [oddsLocked]);

  const handleOddsInputChange = (e) => {
    if (oddsEditable) {
      setOddsValue(e.target.value);
      setIsUserModifiedOdds(true);
    }
  };

  const handleQuickStake = useCallback((val) => {
    setStakeValue(prev => String((parseFloat(prev) || 0) + val));
  }, []);

  // ── stake input utilities — digits only for EVERY market (reference:
  // charCode 48–57 keypress guard): "1" then "." then "2" → 12, never 1.2
  const handleStakeKeyPress = (e) => {
    if (e.charCode < 48 || e.charCode > 57) e.preventDefault();
  };
  // No length cap — the reference's maxlength=9 is ignored by browsers on
  // type=number, and the absurd-amount guards in handleSubmit need to fire
  const handleStakeChange = (e) => {
    setStakeValue(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handleClear = useCallback(() => setStakeValue(''), []);

  const handleClose = useCallback(() => {
    setStakeValue('');
    setOddsValue(initialOddsStr);
    if (onClose) onClose();
  }, [onClose, initialOddsStr]);

  // ── submit pipeline ───────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Read the ref DIRECTLY at each call — GameDetails mutates marketsRef.current
    // on every 2s poll, so this always returns the freshest live market list. A
    // snapshot copy (kept in sync via a [marketsRef.current] effect) went STALE
    // during the buffer — the monitor then never saw the odds move, so a BACK
    // 4.5 that ran up to 4.9 mid-buffer was placed at 4.5 instead of 4.9.
    const getMarketList = () => marketsRef?.current || [];

    // ── Step 0: anti-spam — max 4 attempts on the same market at the same
    // time; the 5th one gets the reference "Multiple Bet Not Allowed" toast ──
    if (!registerBetAttempt(effectiveMarketId || `${effectiveMarketType}:${mname || effectiveTeam}`)) {
      bToastError(BET_TOAST.MULTIPLE_BET_NOT_ALLOWED);
      return;
    }

    // ── Step 0b: MATCH_ODDS unbettable kill-switch ──
    // The feed marks MATCH_ODDS unbettable two ways: the legacy maxb:1 flag,
    // or — with applyMatchOddsLimits folding the state-dependent cap into
    // `max` — an effective cap of 0/1 (pre-match umaxbof) on a market that
    // quotes umaxbof. Reference: submit runs the loader ~5s, then rejects
    // with "Game Not Active2." — no validation, no buffer, no API call. Must
    // run BEFORE stake validation (a cap of 1 makes maxStake 1, which would
    // fire the wrong "Check Maximum Bet Limit2." toast instantly). MATCH_ODDS
    // only.
    const moEffCap = resolvedMarket?.umaxbof !== undefined ? (Number(resolvedMarket.max) || 0) : null;
    if (gtype === 'match' && (mname || '').toUpperCase() === 'MATCH_ODDS'
        && (Number(bv.maxb) === 1 || (moEffCap !== null && moEffCap <= 1))) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // Panel closes first, then the toast (same order as the success flow)
        handleClose();
        bToastError(BET_TOAST.GAME_NOT_ACTIVE_2);
      }, 5000);
      return;
    }

    // ── Step 0c: cashout Min/Max range check ──
    // The hedge stake is computed, not chosen — the panel still OPENS with an
    // out-of-range value, but the reference refuses to confirm a cashout whose
    // stake sits outside the market's Min/Max header range, with its own toast.
    // Runs BEFORE Step 1: minStake is 0 for cashout (so BELOW_MIN never fires)
    // and ABOVE_MAX would show the wrong "Check Maximum Bet Limit2." text.
    if (isCashout) {
      const coMin = Number(bv.min_stake || resolvedSection.min || resolvedMarket.min || 0);
      if ((coMin > 0 && stakeNum < coMin) || (maxStake > 0 && stakeNum > maxStake)) {
        bToastError(BET_TOAST.BET_NOT_CONFIRM_RANGE);
        return;
      }
    }

    // ── Step 1: validate stake / market state ──
    const validationError = getBetValidationError({ stakeNum, minStake, maxStake, suspended, isValid });
    if (validationError) {
      switch (validationError) {
        case BET_ERROR.EMPTY_STAKE:
          bToastError(BET_TOAST.ENTER_VALID_STAKE);
          return;
        // Absurd amounts: 16+ zeros → run the loader briefly, then "Server Error"
        case BET_ERROR.ABSURD_SERVER:
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            bToastError(BET_TOAST.SERVER_ERROR);
          }, 1500);
          return;
        // 12–15 zeros → instant "Bet Not Valid.." (reference toast)
        case BET_ERROR.ABSURD_INVALID:
          bToastError(BET_TOAST.BET_NOT_VALID);
          return;
        case BET_ERROR.BELOW_MIN:
          bToastError(BET_TOAST.MIN_BET_LIMIT);
          return;
        case BET_ERROR.ABOVE_MAX:
          bToastError(BET_TOAST.MAX_BET_LIMIT);
          return;
        // Suspended market/row: reference toast, not a generic "Invalid bet"
        case BET_ERROR.SUSPENDED:
          bToastError(BET_TOAST.GAME_NOT_ACTIVE);
          return;
        case BET_ERROR.INVALID:
        default:
          bToastError(BET_TOAST.INVALID_BET);
          return;
      }
    }

    // ── Step 1b: cricket ODI/T20 MATCH_ODDS rate cap (>4.00 rejected) ──
    // Checked on the ENTERED odds so it blocks matched AND manual-edit/unmatched
    // bets before any placement. Test matches are exempt (limited_overs=false).
    if (isOverRateBlocked({ marketType: effectiveMarketType, odds: oddsNum, limitedOvers: bv.limited_overs })) {
      bToastError(BET_TOAST.RATE_OVER_LIMIT);
      return;
    }

    const clickTime = new Date();
    const selOdds = parseFloat(originalOdds) || oddsNum;
    console.log(
      `%c[PlaceBet] ⏱ Click → ${clickTime.toLocaleTimeString()}.${String(clickTime.getMilliseconds()).padStart(3,'0')}` +
      ` | ${effectiveBetType.toUpperCase()} ${effectiveTeam}` +
      ` | Selected: ${selOdds}${isUserModifiedOdds ? ` → Edited: ${oddsNum}` : ''}` +
      ` | Stake: ${stakeNum} | Size: ${bv.size || 0}`,
      'color: #2196F3; font-weight: bold'
    );

    // ── Step 2: manual odds edit — directional gate, decided INSTANTLY ──
    // The user touched the price (+/- or typing). The bookie never executes worse
    // than its own quote, so the decision compares EDITED (E) vs the CLICKED price
    // (X) only — live odds play no part here — and it happens before the buffer,
    // before any API call:
    //   BACK  E > X → reject (asking more than the market offers)
    //   BACK  E < X → accept, executed at E (user takes less)
    //   LAY   E < X → reject (wants less liability than quoted)
    //   LAY   E > X → accept, executed at E (user takes more risk)
    // Edit-then-revert (|E − X| ≤ 0.001) is NOT an edit — it flows as a normal
    // matched bet, live-odds check and all. Fancy/bookmaker odds aren't editable
    // (oddsEditable = gtype 'match'), and cashout never enters here.
    const isEdited = !isCashout && !oddsLocked && isUserModifiedOdds
      && Math.abs(oddsNum - selOdds) > 0.001;

    if (isEdited) {
      const gate = manualBetGate({
        betType: effectiveBetType,
        selectedOdds: selOdds,
        editedOdds: oddsNum,
      });
      console.log(
        `%c[PlaceBet] ${gate.accept ? '✅' : '🚫'} Manual edit → ${gate.accept ? 'ACCEPT' : 'REJECT'}` +
        ` | ${effectiveBetType.toUpperCase()} | Selected: ${selOdds} | Edited: ${oddsNum}`,
        gate.accept ? 'color: #4CAF50; font-weight: bold' : 'color: #f44336; font-weight: bold'
      );
      if (!gate.accept) {
        bToastError(BET_TOAST.UNMATCHED_NOT_ALLOWED);
        return;
      }
      // Accepted: the bet is placed at E as a normal matched bet (unmatched:false).
    }

    setLoading(true);

    // ── Step 3: buffer monitoring — continuously track latest odds/size ──
    // Buffer comes from the admin's platform config (buffer_time); env default
    // only when unset/0. Live-tracked markets (Match Odds + Bookmaker) use the
    // real platform buffer to follow the live price; fancy/locked markets keep
    // their own (shorter) env buffer.
    const platformBuffer = oddsLiveTracked ? await getPlatformBufferSeconds() : 0;
    const bufferSeconds = oddsLiveTracked
      ? (platformBuffer > 0 ? platformBuffer : BET_BUFFER_SECONDS)
      : FANCY_BUFFER_SECONDS;
    const buffer = await monitorOddsBuffer({
      bufferSeconds,
      clickTime,
      getMarketList,
      marketId: effectiveMarketId,
      selectionId: effectiveSelectionId,
      betType: effectiveBetType,
      // Live-tracked markets follow the live price so the auto bookie-favour
      // check below compares live vs clicked; locked (fancy) markets keep the
      // selected odds and go through the drift check instead.
      oddsLocked: !oddsLiveTracked,
      selectedOdds: oddsNum,
      initialSize: Number(bv.size || 0),
      feedSideInverted: isLineMarket,
    });
    let { finalOdds, finalSize } = buffer;
    const { blocked } = buffer;

    // ── Step 4: final live suspension check (for all market types) ──
    if (effectiveMarketId && marketsRef) {
      const gs = getFinalSuspensionStatus({
        marketList: getMarketList(),
        marketId: effectiveMarketId,
        selectionId: effectiveSelectionId,
        runnerName: effectiveTeam || bv.nat || bv.fancy_name,
      });
      if (gs) {
        setLoading(false);
        bToastError(suspensionToastMessage(gs));
        return;
      }
    }

    // ── Step 5: strict odds check for FANCY (locked-odds) markets ──
    // Only markets whose odds don't move live (fancy / normal / line). Bookmaker
    // is oddsLocked (not editable) but IS live-tracked, so it SKIPS this and uses
    // the directional auto bookie-favour check (Step 6) — the whole point of the fix.
    if (!oddsLiveTracked && effectiveMarketId && marketsRef) {
      const drift = checkFancyOddsDrift({
        marketList: getMarketList(),
        marketId: effectiveMarketId,
        runnerName: effectiveTeam || bv.nat || bv.fancy_name,
        betType: effectiveBetType,
        selectedOdds: oddsNum,
        feedSideInverted: isLineMarket,
      });
      if (drift.mismatch) {
        setLoading(false);
        bToastError(BET_TOAST.ODDS_CHANGED);
        return;
      }
      if (drift.liveSize) finalSize = drift.liveSize;
    }

    // ── Step 6: bookie favour check (after buffer completes) ──
    if (blocked) {
      setLoading(false);
      bToastError(BET_TOAST.GAME_NOT_ACTIVE);
      return;
    }

    if (isCashout) {
      // Cashout executes at the odds the stake was COMPUTED at — a tiny tick
      // during the buffer must not kill the hedge. Suspension checks above
      // still apply; only the odds-change rejection is skipped.
      console.log(
        `%c[PlaceBet] 💰 Cashout — skipping bookie favour | ${effectiveBetType.toUpperCase()} ${effectiveTeam} @ ${oddsNum}`,
        'color: #4CAF50; font-weight: bold'
      );
      finalOdds = oddsNum;
    } else if (isEdited) {
      // ── MANUAL path — gate passed at Step 2; E was only the user's LIMIT ──
      // Execution happens at the buffer-end LIVE price, and that price is judged
      // against E (X is out of the picture). Limit broken → same
      // 'Unmatched bet not allowed.' toast as the gate, not an odds-change one.
      const manual = manualBetLiveCheck({
        betType: effectiveBetType,
        editedOdds: oddsNum,
        liveOdds: finalOdds,
      });

      console.log(
        `%c[PlaceBet] ${manual.accept ? '✅' : '🚫'} Manual live-check → ${manual.accept ? `PLACE @ ${manual.finalOdds}` : 'REJECT'}` +
        ` | ${effectiveBetType.toUpperCase()} | Clicked: ${selOdds} | Limit: ${oddsNum} | Live: ${finalOdds}` +
        (manual.reason ? ` | Reason: ${manual.reason}` : ''),
        manual.accept ? 'color: #4CAF50; font-weight: bold' : 'color: #f44336; font-weight: bold'
      );

      if (!manual.accept) {
        setLoading(false);
        bToastError(BET_TOAST.UNMATCHED_NOT_ALLOWED);
        return;
      }
      finalOdds = manual.finalOdds; // the LIVE price
    } else {
      // ── AUTO path — untouched price, live-vs-clicked rules (unchanged) ──
      const favourResult = autoBetCheck({
        marketType: effectiveMarketType,
        betType: effectiveBetType,
        selectedOdds: parseFloat(originalOdds) || oddsNum,
        currentOdds: finalOdds,
      });

      console.log(
        `%c[PlaceBet] ${favourResult.accept ? '✅' : '🚫'} Auto Bookie Favour → ${favourResult.accept ? 'ACCEPT' : 'REJECT'}` +
        ` | Type: ${effectiveBetType.toUpperCase()} | Selected: ${parseFloat(originalOdds) || oddsNum}` +
        ` | Live: ${finalOdds}` +
        (favourResult.reason ? ` | Reason: ${favourResult.reason}` : ''),
        favourResult.accept ? 'color: #4CAF50; font-weight: bold' : 'color: #f44336; font-weight: bold'
      );

      if (!favourResult.accept) {
        setLoading(false);
        // Reference toast — the detailed reason ("Odds rose from X to Y") stays
        // in the console log above, never in the user-facing toast
        bToastError(BET_TOAST.BET_NOT_CONFIRM_ODDS_CHANGE);
        return;
      }

      // Use the validated final odds from bookie favour
      finalOdds = favourResult.finalOdds;
    }

    // Rate cap re-check on the FINAL odds — bookie-favour can upgrade a BACK bet
    // to higher live odds during the buffer, which may cross 4.00 on ODI/T20.
    if (isOverRateBlocked({ marketType: effectiveMarketType, odds: finalOdds, limitedOvers: bv.limited_overs })) {
      setLoading(false);
      bToastError(BET_TOAST.RATE_OVER_LIMIT);
      return;
    }
    setOddsValue(String(Number(finalOdds.toFixed(2))));

    // ── Step 7: demo user — separate flow, real placebet below stays untouched ──
    if (isDemoUser(user)) {
      const demoBetFields = {
        stake: stakeNum, odds: finalOdds,
        betType: effectiveBetType, teamName: effectiveTeam,
        marketType: effectiveMarketType, market_id: effectiveMarketId || '',
        runners: bv.runners || bv.outcomes || [],
        event_id: bv.event_id || '',
        event_name: bv.event_name || bv.match_title || '',
        sport_id: bv.sid || '',
        sports: bv.sports || '',
        match_time: bv.match_start_time || '',
      };
      // Exposure limit: total worst-case liability can never exceed the balance
      const { liability, balance: demoBalance } = demoExposureAfterBet(demoBetFields);
      if (liability > demoBalance) {
        setLoading(false);
        bToastError(BET_TOAST.CHECK_BALANCE);
        return;
      }
      const { bet, exposure } = demoPlaceBet(demoBetFields);
      setLoading(false);
      // Success flow: 1) panel closes first  2) then the toast  3) then the
      // book/exposure updates land in the UI
      handleClose();
      bToastSuccess(BET_TOAST.BET_PLACED);
      dispatch(updateDemoBalanceAndExposure({ exposure }));
      dispatch(addMatchedBet(bet));
      return;
    }

    // ── Step 8: real user ──
    // NO client-side balance/exposure gate. The server owns that decision:
    // placeBet compares the bet's *incremental* liability against the wallet
    // (sportbetscontroller.js STEP "WALLET BLOCK") and rejects with its own
    // message. The old check here used the bet's FULL liability, so a hedge
    // that actually RELEASES exposure was refused with "Check Balance." even
    // though the server would have accepted it.

    try {
      const updatedBv = finalSize > 0 ? { ...bv, size: finalSize, back_size: (effectiveBetType === 'back' || effectiveBetType === 'yes') ? finalSize : bv.back_size, lay_size: isLaySide(effectiveBetType) ? finalSize : bv.lay_size } : bv;
      const payload = prepareBetPayload(updatedBv, finalOdds, stakeNum, user, effectiveMarketType, effectiveBetType, effectiveTeam);
      const result = await sportsPlaceBet(payload);
      const placedTime = new Date();
      const delayMs = placedTime - clickTime;
      console.log(
        `%c[PlaceBet] ✅ Placed → ${placedTime.toLocaleTimeString()}.${String(placedTime.getMilliseconds()).padStart(3,'0')}` +
        ` | ${effectiveBetType.toUpperCase()} ${effectiveTeam}` +
        ` | Odds: ${oddsNum} → ${finalOdds} | Stake: ${stakeNum} | Size: ${finalSize}` +
        ` | Delay: ${(delayMs/1000).toFixed(2)}s`,
        'color: #4CAF50; font-weight: bold'
      );

      // ── Success rendering flow (reference order) ──
      // 1) bet panel closes FIRST
      handleClose();
      // 2) then the success toast
      bToastSuccess(BET_TOAST.BET_PLACED);
      // 3) then the book data lands in the UI: redux updates + the
      //    'bet:placed' event triggers the match-exposure API refetch whose
      //    mapped per-runner values render in the market cells
      dispatch(addMatchedBet({
        id: Date.now(), stake: stakeNum, odds: finalOdds,
        betType: effectiveBetType, teamName: effectiveTeam,
        marketType: effectiveMarketType, market_id: effectiveMarketId || '',
        timestamp: new Date().toISOString(),
      }));
      if (result.exposure) dispatch(updateMatchExposure(result.exposure));
      if (result.newBalance !== undefined || result.totalExposure !== undefined) {
        dispatch(updateUserBalanceAndExposure({ balance: result.newBalance, exposure: result.totalExposure }));
      }
      // Refresh header balance/exposure immediately — the page's 5s poll is
      // too slow to reflect a just-placed bet.
      const token = localStorage.getItem('token');
      if (token && token !== 'demo-token') dispatch(fetchBalanceThunk(token));
      // Exposure API refetch fires a beat AFTER the success toast — the
      // per-runner book values land in the table with a small settle delay
      // (window event — safe even if this panel has already unmounted)
      setTimeout(() => window.dispatchEvent(new Event('bet:placed')), 250);
    } catch (err) {
      const msg = err.message || BET_TOAST.GENERIC_ERROR;
      bToastError(msg.toLowerCase().includes('fetch') ? BET_TOAST.NETWORK_ERROR : msg);
    } finally {
      setLoading(false);
    }
  }, [isValid, stakeNum, oddsNum, minStake, maxStake, effectiveBetType, effectiveTeam,
      effectiveMarketType, effectiveMarketId, effectiveSelectionId, originalOdds,
      isUserModifiedOdds, oddsLocked, oddsLiveTracked, user, bv, marketsRef, matchedBets,
      dispatch, handleClose, onSubmit]);

  // ── one-click: auto-submit once the preset stake has been applied ─────────
  useEffect(() => {
    if (!isOneClick || oneClickFiredRef.current) return;
    if (oneClickStake > 0 && stakeNum === oneClickStake) {
      oneClickFiredRef.current = true;
      // Cross-instance guard: the twin panel (mobile/desktop duplicate of the
      // same activeBet object) may have already submitted this exact bet
      if (typeof betValue === 'object' && betValue !== null) {
        if (oneClickSubmittedBets.has(betValue)) return;
        oneClickSubmittedBets.add(betValue);
      }
      handleSubmit();
    }
  }, [isOneClick, oneClickStake, stakeNum, handleSubmit, betValue]);

  // ── everything the presentation layer needs ───────────────────────────────
  return {
    // mode / status
    isOneClick,
    loading,
    // display values
    panelClass,
    effectiveTeam,
    displayProfit,
    quickAmounts,
    oddsValue,
    stakeValue,
    stakeNum,
    oddsEditable,
    isBookmakerPanel,
    // per-runner P&L data (used by the currently-commented book section)
    showPLSection,
    outcomeNames,
    runnerWinLoss,
    exposureByRunner,
    // handlers
    handleOddsStep,
    handleOddsInputChange,
    handleQuickStake,
    handleStakeKeyPress,
    handleStakeChange,
    handleClear,
    handleClose,
    handleSubmit,
  };
}
