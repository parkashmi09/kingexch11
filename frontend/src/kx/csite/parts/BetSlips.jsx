import { useSelector } from 'react-redux';
import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';

const C = ng('cbs');

const Minus = () => (
  <svg {...C} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="19px" height="19px" viewBox="0 0 19 19" enableBackground="new 0 0 19 19" xmlSpace="preserve">
    <g {...C}><path {...C} fill="currentColor" d="M8.056,10.838H0.409V8.091h7.647 M2,8.091h16.591v2.747H8" /></g>
  </svg>
);
const Plus = () => (
  <svg {...C} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="19px" height="19px" viewBox="0 0 19 19" enableBackground="new 0 0 19 19" xmlSpace="preserve">
    <g {...C}><path {...C} fill="currentColor" d="M10.946,0.127v7.964h7.646v2.747h-7.646v8.035h-2.89v-8.035H0.409V8.091h7.647V0.127H10.946z" /></g>
  </svg>
);

/**
 * app-betslips (casino.kingexch111.com) — the inline slip a Universe table opens
 * under the struck runner. Phone: the price box and the stake stepper side by
 * side, the stake buttons, then Cancel / Place Bet. Desktop: Cancel, price,
 * stake, Place Bet in one row, the stake buttons under it. The price steppers
 * are disabled; − halves the stake (floored at the market min), + doubles it
 * (capped at the max), a stake button adds to it.
 *
 * Props: { attrs, table, ...host attributes (style / id / className — the
 *   pages pass the reference's `style="padding: 0"`, `id="betslip"`) }
 *   table — useCasinoTable()'s return: slip (the reference's betplaceObj:
 *   marketId, selectionId, betType 'back' | 'lay', price, eventId, minValue,
 *   maxValue; null = closed), bet.stakeAmount / setStakeAmount, setValue (the
 *   stake the runners' P&L preview uses), closeBetslip (Cancel),
 *   bet.handlePlaceBet (Place Bet), bet.placing.
 * The stake buttons are the account's (redux stakeButtons.gameButtons, as the
 * exchange's slip shows them).
 */
export default function BetSlips({ attrs, table, ...rest }) {
  const { slip: item, bet, setValue, closeBetslip } = table;
  const stakes = useSelector((s) => s.stakeButtons.gameButtons);

  if (!item) return <app-betslips {...attrs} {...host('cbs')} {...rest}></app-betslips>;

  const selectedAmount = bet.stakeAmount;
  const setAmount = (v) => {
    const s = v === undefined || v === null || Number.isNaN(v) ? '' : String(v);
    bet.setStakeAmount(s);
    setValue(Number(s) || 0);
  };
  // The reference's arithmetic, on an untouched (undefined) stake too.
  const cur = selectedAmount === '' ? undefined : Number(selectedAmount);
  const setStake = (amount) => setAmount(selectedAmount ? Number(selectedAmount) + Number(amount) : amount);
  const plusStake = () => setAmount(item.maxValue < 2 * cur ? Math.round(item.maxValue) : Math.round(2 * cur));
  const minusStake = () => setAmount(item.minValue > cur / 2 ? Math.round(item.minValue) : Math.round(cur / 2));
  const inputAmount = (e) => setAmount(e.target.value);
  const place = () => bet.handlePlaceBet();

  const back = item.betType === 'back';
  const slipClass = back ? 'slip-back' : 'slip-lay';
  const sendClass = `btn btn-send${selectedAmount ? ' btn-send-active' : ''}`;
  const sendDisabled = !selectedAmount || bet.placing;

  if (!isDesktop) {
    const chip = window.location.pathname.includes('99.0059') ? 'kbc-tab' : 'fancy-quick-btn';
    const stackClass = back ? 'stackbutton' : 'stackbutton stackbuttonLay';
    return (
      <app-betslips {...attrs} {...host('cbs')} {...rest}>
        <div {...C} className="fancy-quick-tr placebet">
          <div {...C} className={`pb-1 place-bet paddtp ${slipClass}`}>
            <div {...C} className="container">
              <div {...C} className="row pb-0 pt-0">
                <div {...C} className="col-6 text-bold inputset padd-0">
                  <div {...C} className="priceClass">
                    <button {...C} className="stakeactionminus1 btn betButtonMinus" disabled style={{ position: 'absolute', left: 0 }}>
                      <span {...C} className="betButtonMinus"><Minus /></span>
                      <span {...C} className="betButtonMinus"></span>
                    </button>
                    <input {...C} className="stakeinput quick-bet-confirm text-center" disabled type="text" value={item.price ?? ''} readOnly />
                    <button {...C} className="stakeactionplus1 btn betButtonPlus" disabled style={{ position: 'absolute', right: 0 }}>
                      <span {...C} className="betButtonPlus"><Plus /></span>
                    </button>
                  </div>
                </div>
                <div {...C} className="col-6 text-bold inputset padd-0">
                  <div {...C} className="priceClass">
                    <button {...C} className="stakeactionminus btn betButtonMinus" style={{ position: 'absolute', left: 0 }} onClick={minusStake}>
                      <span {...C} className="betButtonMinus"><Minus /></span>
                      <span {...C} className="betButtonMinus"></span>
                    </button>
                    <input {...C} className="stakeinput input-Betslip text-center" id="betAmount" type="number" placeholder="01" value={selectedAmount} onChange={inputAmount} />
                    <button {...C} className="stakeactionplus btn betButtonPlus" style={{ position: 'absolute', right: 0 }} onClick={plusStake}>
                      <span {...C} className="betButtonPlus"><Plus /></span>
                    </button>
                  </div>
                </div>
              </div>
              <div {...C} className={`row ${stackClass}`}>
                {stakes.map((s) => (
                  <div {...C} key={s.value} className="col-3 p-1 stack-inputs" onClick={() => setStake(s.value)}>
                    <a {...C} className={`btn btn-block ${chip}${String(selectedAmount) === String(s.value) ? ' active' : ''}`}>{s.value}</a>
                  </div>
                ))}
              </div>
              <div {...C} className={`row mt-0 pb-0 pt-0 ${stackClass}`}>
                <div {...C} className="col-6 p-1 pb-0" onClick={closeBetslip}>
                  <a {...C} className="btn btn-secondary btn-block btn-cancel"> Cancel </a>
                </div>
                <div {...C} className="col-6 p-1 pb-0">
                  <button {...C} className={sendClass} disabled={sendDisabled} onClick={place}> Place Bet </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </app-betslips>
    );
  }

  return (
    <app-betslips {...attrs} {...host('cbs')} {...rest}>
      <div {...C} className="fancy-quick-tr placebet">
        <div {...C} className={`place-bet ${slipClass}`}>
          <div {...C} className="container">
            <div {...C} className="row pb-0 pt-0 p-2">
              <div {...C} className="col p-1 pb-0 hideMobile" onClick={closeBetslip}>
                <a {...C} className="btn btn-secondary btn-block btn-cancel"> Cancel </a>
              </div>
              <div {...C} className="col text-right ipadPro p-1">
                <button {...C} className="stakeactionminus btn betButtonMinus" disabled>
                  <span {...C} className="betButtonMinus"><Minus /></span>
                </button>
                <input {...C} className="stakeinput input-Betslip text-center" id="betstack" type="text" readOnly placeholder="0" disabled value={item.price ?? ''} />
                <button {...C} className="stakeactionplus btn betButtonPlus float-end" disabled>
                  <span {...C} className="betButtonPlus"><Plus /></span>
                </button>
              </div>
              <div {...C} className="col text-right ipadPro p-1">
                <button {...C} className="stakeactionminus btn betButtonMinus" onClick={minusStake}>
                  <span {...C} className="betButtonMinus"><Minus /></span>
                </button>
                <input {...C} className="stakeinput input-Betslip text-center" id="betAmount" type="number" placeholder="0" value={selectedAmount} onChange={inputAmount} />
                <button {...C} className="stakeactionplus1 btn betButtonPlus float-end" onClick={plusStake}>
                  <span {...C} className="betButtonPlus"><Plus /></span>
                </button>
              </div>
              <div {...C} className="col p-1 pb-0 hideMobile">
                <button {...C} className={sendClass} disabled={sendDisabled} onClick={place}> Place Bet </button>
              </div>
            </div>
            <div {...C} className={`row stackbutton p-2 pt-0 pb-0${back ? '' : ' stackbuttonLay'}`}>
              {stakes.map((s) => (
                <div {...C} key={s.value} className="col-3 col-xs-3 col-sm-3 col-md-3 desktopwd p-1">
                  <a {...C} className="btn btn-block fancy-quick-btn" onClick={() => setStake(s.value)}>{s.value}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </app-betslips>
  );
}
