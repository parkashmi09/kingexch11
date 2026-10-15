import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { openAgeModal } from '../ageModal';
import Loader from '../Loader';
import usePlaceBetPanel from '../../components/betting/placeBet/usePlaceBetPanel';
import { fetchMatchPrivateData } from '../../apiservices/sportsService';
import { fetchMatchedBetsThunk, clearMatchedBets, addMatchedBet } from '../../redux/matchedBetsSlice';
import { isDemoUser, getDemoOpenBets } from '../../utils/demoStore';

const C = ng('kbs');

// While the slip is open the market is re-read every second: the freshest
// odds feed the engine's buffer / suspension / favour checks, and the line's
// own limits land on the bet.
const POLL_INTERVAL = 1000;

const Minus = () => (
  <svg {...C} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="19px" height="19px" viewBox="0 0 19 19" enableBackground="new 0 0 19 19" xmlSpace="preserve">
    <g {...C}><path {...C} fill="currentColor" d="M8.056,10.838H0.409V8.091h7.647 M2,8.091h16.591v2.747H8" /></g>
  </svg>
);
const Plus = () => (
  <svg {...C} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="19px" height="19px" viewBox="0 0 19 19" enableBackground="new 0 0 19 19" xmlSpace="preserve">
    <g {...C}><path {...C} fill="currentColor" d="M10.946,0.127v7.964h7.646v2.747h-7.646v8.035h-2.89v-8.035H0.409V8.091h7.647V0.127H10.946z" /></g>
  </svg>
);

/**
 * app-betslip — the reference's inline slip under the price that was struck:
 * Cancel, the odds stepper (live only on Match Odds; a fancy line shows its
 * "run/rate"), the stake stepper (− halves, + doubles), Place Bet, then the
 * stake buttons. Placement is tenexch's usePlaceBetPanel, unchanged.
 *
 * Signed out it still opens; Place Bet then goes to the login page on a
 * desktop and to the 18+ confirmation on a phone, as the reference's does.
 */
export default function BetSlip({ bet, onClose, onValue, attrs }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((s) => s.user);
  const marketsRef = useRef([]);

  useEffect(() => {
    if (!bet?.event_id || !isAuthenticated) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const res = await fetchMatchPrivateData(bet.event_id, bet.sid);
        if (!active) return;
        const data = res?.data?.data?.data || res?.data?.data;
        if (!Array.isArray(data)) return;
        marketsRef.current = data;
        const mo = data.find((m) => String(m.mid) === String(bet.market_id));
        if (mo) {
          // In place: the engine wipes the typed stake when the bet object
          // changes identity.
          bet.market = mo;
          const sec = (mo.section || []).find((x) => String(x.sid) === String(bet.selectionId));
          if (sec) bet.section = sec;
          bet.maxb = mo.maxb;
          bet.min_stake = Number(sec?.min) || mo.min;
          bet.max_stake = Number(sec?.max) || mo.max;
        }
      } catch { /* keep the last snapshot */ }
    };
    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => { active = false; clearInterval(id); };
  }, [bet, isAuthenticated]);

  // This event's matched bets, for the engine's book preview.
  useEffect(() => {
    if (!bet?.event_id || !isAuthenticated) return;
    if (isDemoUser(user)) {
      dispatch(clearMatchedBets());
      getDemoOpenBets().matchedBets
        .filter((b) => String(b.event_id || '') === String(bet.event_id))
        .forEach((b) => dispatch(addMatchedBet(b)));
      return;
    }
    const userId = user?.user_id || user?.id;
    if (userId) dispatch(fetchMatchedBetsThunk({ eventId: bet.event_id, userId }));
  }, [bet, user, isAuthenticated, dispatch]);

  const {
    loading, quickAmounts, oddsValue, stakeValue, oddsEditable,
    handleOddsStep, handleOddsInputChange, handleStakeChange, handleQuickStake, handleClose, handleSubmit,
  } = usePlaceBetPanel({ betValue: bet, marketsRef, matchId: bet?.event_id, onClose });

  // The page previews the stake's profit / loss on every runner while it is typed.
  useEffect(() => {
    onValue?.({ stake: Number(stakeValue) || 0, price: Number(oddsValue) || 0 });
  }, [stakeValue, oddsValue, onValue]);

  if (!bet) return null;

  const isLay = String(bet.betType).toLowerCase() === 'lay';
  const isFancy = bet.marketType === 'FANCY';
  const stake = Number(stakeValue) || 0;
  const min = Number(bet.min_stake ?? bet.market?.min) || 0;
  const max = Number(bet.maxb) > 0 ? Number(bet.maxb) : Number(bet.max_stake ?? bet.market?.max) || 0;
  const setStake = (v) => handleStakeChange({ target: { value: String(v) } });
  const minusStake = () => setStake(min > stake / 2 ? Math.round(min) : Math.round(stake / 2));
  const plusStake = () => setStake(max && max < 2 * stake ? Math.round(max) : Math.round(2 * stake));
  const desktop = window.matchMedia('(min-width: 993px)').matches;

  const place = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    handleSubmit();
  };

  return (
    <app-betslip {...attrs} {...host('kbs')} {...KX}>
      {/* The reference's app-bet-loader: the page is held while the bet goes in. */}
      {loading && <Loader tag="app-bet-loader" attrs={attrs} style={{ display: 'flex', justifyContent: 'center' }} />}
      <div {...C} className="fancy-quick-tr placebet">
        <div {...C} className={`place-bet ${isLay ? 'slip-lay' : 'slip-back'}`}>
          <div {...C} className="container">
            <div {...C} className="row ps-2 pe-2 pb-0 padddingZero">
              <div {...C} className="col p-1 pb-0 hideMobile" onClick={handleClose}>
                <a {...C} className="btn btn-secondary btn-block btn-cancel"> Cancel </a>
              </div>
              <div {...C} className="col text-right p-1 stacksCol">
                <button {...C} className="stakeactionminus btn betButtonMinus" disabled={!oddsEditable} onClick={() => handleOddsStep(-1)}>
                  <span {...C} className="betButtonMinus"><Minus /></span>
                </button>
                {isFancy ? (
                  <input {...C} className="stakeinput input-Betslip text-center" type="text" readOnly placeholder="0" value={`${bet.odds}/${bet.size}`} disabled />
                ) : (
                  <input {...C} className="stakeinput input-Betslip text-center" type="number" placeholder="0" value={oddsValue} disabled={!oddsEditable} onChange={handleOddsInputChange} />
                )}
                <button {...C} className="stakeactionplus btn betButtonPlus float-end" disabled={!oddsEditable} onClick={() => handleOddsStep(1)}>
                  <span {...C} className="betButtonPlus"><Plus /></span>
                </button>
              </div>
              <div {...C} className="col text-bold inputset p-1 stacksCol">
                <button {...C} className="stakeactionminus btn betButtonMinus" onClick={minusStake}>
                  <span {...C} className="betButtonMinus"><Minus /></span>
                </button>
                <input
                  {...C}
                  className="stakeinput input-Betslip text-center"
                  type="number"
                  placeholder="0"
                  value={stakeValue}
                  onChange={handleStakeChange}
                />
                <button {...C} className="stakeactionplus btn betButtonPlus float-end" onClick={plusStake}>
                  <span {...C} className="betButtonPlus"><Plus /></span>
                </button>
              </div>
              <div {...C} className="col p-1 pb-0 hideMobile">
                <button {...C} className={`btn btn-send${stake ? ' btn-send-active' : ''}`} disabled={!stake || loading} onClick={place}>
                  {' '}Place Bet{' '}
                </button>
              </div>
            </div>
            <div {...C} className={`row p-2 stackbutton pt-0 pb-0 ${isLay ? 'slip-lay-br' : 'slip-back-br'}`}>
              {quickAmounts.map((q) => (
                <div
                  {...C}
                  key={q.value}
                  className={desktop ? 'col p-1' : 'col-3 col-xs-3 col-sm-3 col-md-3 col-lg-auto col-xl-auto p-1'}
                  onClick={() => handleQuickStake(Number(q.value))}
                >
                  <a {...C} className="btn btn-block fancy-quick-btn">{q.value}</a>
                </div>
              ))}
            </div>
            <div {...C} className="row mt-0 p-2 pb-0 pt-0 stackbutton padddingZero hideDesktop">
              <div {...C} className="col-6 p-1 pb-0" onClick={handleClose}>
                <a {...C} className="btn btn-secondary btn-block btn-cancel"> Cancel </a>
              </div>
              <div {...C} className="col-6 p-1 pb-0">
                <button
                  {...C}
                  className={`btn btn-send${stake ? ' btn-send-active' : ''}`}
                  disabled={!stake || loading}
                  onClick={isAuthenticated ? handleSubmit : openAgeModal}
                >
                  {' '}Place Bet{' '}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-betslip>
  );
}
