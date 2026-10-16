import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ng, host } from '../../ng';
import useCasinoTable from '../useCasinoTable';
import { cardImg, asset } from '../cards';
import { toastrError } from '../../toastr';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import { cx, num, shortNumber } from './teenUtil';

const C = ng('ceu');

// The account's stake list (the reference's userGetStack), as app-betslips
// reads it.
function useStakes() {
  const { casinoButtons, gameButtons } = useSelector((s) => s.stakeButtons);
  if (casinoButtons.length) return casinoButtons.map((b) => ({ stakeName: String(b.label || b.value), stakeAmount: String(b.value) }));
  return gameButtons.map((b) => ({ stakeName: String(b.value), stakeAmount: String(b.value) }));
}

// The chip art by stake.
function chip(amount) {
  const a = Number(amount);
  if (a < 1e3) return 'chips1';
  if (a < 2e3) return 'chips1k';
  if (a < 5e3) return 'chips2';
  if (a < 1e4) return 'chips5';
  if (a < 2e4) return 'chips10';
  if (a < 5e4) return 'chips20';
  return 'chips1k';
}

// The share of a runner's opening size already matched, as the reference's
// "<n>%" overlay width: 0% until its size moves within the round.
function useMatchedWidths(game, market) {
  const base = useRef({ roundId: null, sizes: [] });
  const sizes = (market?.runners || []).map((r) => r.price.back[0]?.size);
  if (base.current.roundId !== game.roundId || !base.current.sizes.length) base.current = { roundId: game.roundId, sizes };
  return sizes.map((s, i) => {
    const s0 = base.current.sizes[i];
    if (!s0 || s === s0) return '0%';
    return `${-1 * ((s / s0) * 100 - 100)}%`;
  });
}

// The dealt hand of a side: card_1…card_3 of game.cards.PLAYER_A / PLAYER_B.
const hand = (cards, side) => [1, 2, 3].map((n) => cards?.[side]?.[`card_${n}`]);

/**
 * app-eu-teenpatti (casino.kingexch111.com/euTeenpatti/:id — Muflis Teen
 * Patti): the video, both hands, the PLAYER A / PLAYER B boxes (a struck box
 * places the selected chip straight away — no slip), the chip row and the
 * recent results.
 */
export default function EuTeenpatti({ eventId }) {
  const table = useCasinoTable(eventId);
  const { game, results, casinoPl, openBetslip, bet } = table;
  const stakes = useStakes();
  const [selectedBetAmount, setSelectedBetAmount] = useState(0);
  const winner = game.marketArr[0];
  const widths = useMatchedWidths(game, winner);
  const suspended = game.status === 'SUSPEND';

  const setStake = (amount) => setSelectedBetAmount((cur) => (amount !== cur ? amount : 0));

  // The reference places the bet on the spot with the selected chip.
  const strike = (i) => {
    if (suspended || bet.placing) return;
    if (!(Number(selectedBetAmount) > 0)) { toastrError('please select chips for Bet'); return; }
    const r = winner.runners[i];
    openBetslip(winner.marketId, r.selectionId, 'back', r.price.back[0]?.price);
    bet.handlePlaceBet();
  };

  const book = winner && casinoPl[winner.marketId];
  const runnerSusp = (i) => winner.runners[i]?.status === 'SUSPEND' || suspended;
  // The reference colours both boxes' text by PLAYER A's state.
  const txt = runnerSusp(0) ? 'suspendedTxt' : 'nonSuspendedTxt';
  // intoNumber + the number pipe, as the overlay prints it.
  const pct = (w) => (w === '0%' ? '' : num(parseFloat(w).toFixed(1)));

  const box = (i) => {
    const r = winner.runners[i];
    const pl = book?.[r?.selectionId];
    return (
      <>
        <div {...C} className={`playerName ${txt}`}>
          {` ${winner.runnersName[r?.selectionId]} `}
        </div>
        <div {...C} className={`priceSection ${txt}`}>
          {` ${num(r?.price.back[0]?.price, '1.2-2')} `}
          {book && (
            <span {...C} className="" style={{ display: 'flex', fontSize: 15, fontWeight: 400, justifyContent: 'center' }}>
              {pl < 0 && <span {...C} style={{ fontWeight: 'bold' }}>{i === 0 ? ' L :   ' : ' L :  '}</span>}
              {pl > 0 && <span {...C} style={{ fontWeight: 'bold' }}>{i === 0 ? ' P :   ' : ' P :  '}</span>}
              <span {...C} className="d-flex">{` ${pl ? num(pl) : '0.00'} `}</span>
            </span>
          )}
        </div>
      </>
    );
  };

  const [a, b] = [hand(game.cards, 'PLAYER_A'), hand(game.cards, 'PLAYER_B')];

  return (
    <app-eu-teenpatti {...host('ceu')}>
      <div {...C} className="">
        <VideoSimple attrs={C} game={game} resultDeclared={null} />
        <div {...C} className="row p-2">
          <div {...C} className="col-6 d-flex justify-content-center">
            {a.map((c, i) => <img {...C} key={i} className="imgPadding" src={cardImg(c)} alt="" />)}
          </div>
          <div {...C} className="col-6 d-flex justify-content-center ml-2">
            <span {...C} className="d-flex flex-direction-reverse flex-row-reverse justify-content-end">
              {b.map((c, i) => <img {...C} key={i} className="imgPadding" src={cardImg(c)} alt="" />)}
            </span>
          </div>
        </div>
        {winner?.runners && (
          <div {...C} className="d-flex justify-content-between align-items-center euTeenpattiboxes">
            <div {...C} className={cx('firstboxTp checkBetAPi text-center', runnerSusp(0) && 'suspended eususpended')} onClick={() => strike(0)}>
              {widths[0] !== '0%' && (
                <div {...C} className="market-size-container-firstbox" style={{ width: widths[0] }}>{` ${pct(widths[0])} % `}</div>
              )}
              {box(0)}
            </div>
            <div {...C} className={cx('Secondboxtp text-center', runnerSusp(1) && 'suspended eususpended')} onClick={() => strike(1)}>
              {widths[1] !== '0%' && (
                <div {...C} className="market-size-container-secondBox" style={{ width: widths[1] }}>{` ${pct(widths[1])}% `}</div>
              )}
              {box(1)}
            </div>
          </div>
        )}
        <section {...C} id="functionZone" className="function_zone">
          <ul {...C} id="chips" className="chips">
            {stakes.map((s) => (
              <li {...C} key={s.stakeName} className={cx('chips_1', String(selectedBetAmount) === s.stakeName && 'now')}
                onClick={() => setStake(s.stakeAmount)}>
                <img {...C} src={asset(`chips/${chip(s.stakeAmount)}.svg`)} alt="" />
                <p {...C}>{`${shortNumber(Number(s.stakeName))} `}</p>
                <span {...C} className="ring">ring</span>
              </li>
            ))}
          </ul>
        </section>
        <Results attrs={C} eventId={eventId} results={results} />
      </div>
    </app-eu-teenpatti>
  );
}
