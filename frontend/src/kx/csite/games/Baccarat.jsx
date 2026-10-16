import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';
import useCasinoTable from '../useCasinoTable';
import { asset } from '../cards';
import { toastrError } from '../../toastr';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import { cx, num, shortNumber } from './teenUtil';

const C = ng('cbc');

// The account's stake list (the reference's userGetStack) — the chips.
function useStakes() {
  const { casinoButtons, gameButtons } = useSelector((s) => s.stakeButtons);
  if (casinoButtons.length) return casinoButtons.map((b) => ({ stakeName: String(b.value), stakeAmount: String(b.value) }));
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

/**
 * The share of each box's opening size already matched, the reference's
 * "<n>%" bar width: "0%" until a runner's size moves within the round, then
 * -(size / opening × 100 − 100) %. Order: PLAYER, BANKER, TIE, PLAYER PAIR,
 * BANKER PAIR. The TIE bar also gets its `left` (45% until it passes 10%).
 */
function useMatched(game, runners) {
  const base = useRef({ roundId: null, sizes: [] });
  const sizes = runners.map((r) => r?.price?.back[0]?.size);
  if (base.current.roundId !== game.roundId || !base.current.sizes.length) base.current = { roundId: game.roundId, sizes };
  const widths = sizes.map((s, i) => {
    const s0 = base.current.sizes[i];
    if (!s0 || s === s0) return '0%';
    return `${-1 * ((s / s0) * 100 - 100)}%`;
  });
  const f = parseFloat(widths[2]);
  const tieLeft = !(f > 10) ? '45%' : `${45 - (f - 10) / 2}%`;
  return { widths, tieLeft };
}

// The bar's label: intoNumber() then the number pipe.
const pct = (w) => ` ${num(parseInt(w, 10))}% `;

const Chip = () => <li {...C} className="chips_1_selected" style={{ display: 'none' }}><p {...C}></p></li>;

const Bold = ({ children }) => <span {...C} style={{ fontWeight: 'bold' }}>{children}</span>;

/** A box's P / L: L / P label, then the book (in white). */
function Book({ pl, style, tie }) {
  const value = ` ${pl ? num(pl) : '0.00'} `;
  const cls = cx('d-flex', pl > 0 ? 'plus-book' : 'minus-book');
  if (tie) {
    return (
      <span {...C} className="" style={style}>
        <span {...C} className={cls} style={{ color: 'white' }}>
          {pl < 0 && <Bold> L : </Bold>}
          {pl > 0 && <Bold> P :</Bold>}
          {value}
        </span>
      </span>
    );
  }
  return (
    <span {...C} className="" style={style}>
      {pl < 0 && <Bold> L : </Bold>}
      {pl > 0 && <Bold> P :</Bold>}
      <span {...C} className={cls} style={{ color: 'white' }}>{value}</span>
    </span>
  );
}

/** The pair boxes' P / L (no plus / minus colouring). */
function PairBook({ pl }) {
  return (
    <span {...C} className="" style={{ display: 'flex', fontSize: '13px', fontWeight: 400 }}>
      {pl < 0 && <Bold> L : </Bold>}
      {pl > 0 && <Bold> P :</Bold>}
      <span {...C} className="d-flex" style={{ color: 'white' }}>{` ${pl ? num(pl) : '0.00'} `}</span>
    </span>
  );
}

/** The chip row (desktop: under CHIPS beside the statistics; phone: alone). */
function Chips({ stakes, selected, setStake }) {
  return (
    <section {...C} className="function_zone" id="functionZone">
      <ul {...C} className="chips" id="chips">
        {stakes.map((s) => (
          <li key={s.stakeAmount} {...C} className={cx('chips_1', selected == s.stakeName && 'now')} onClick={() => setStake(s.stakeAmount)}>
            <img {...C} src={asset(`chips/${chip(s.stakeAmount)}.svg`)} alt="" />
            <p {...C}>{`${shortNumber(Number(s.stakeName))} `}</p>
            <span {...C} className="ring">ring</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// The reference's static STATISTICS pie (a Google chart it saved as markup).
function Statistics() {
  const t = { textAnchor: 'start', fontFamily: 'Arial', fontSize: '10', stroke: 'none', strokeWidth: '0' };
  const r = { stroke: 'none', strokeWidth: '0' };
  return (
    <svg {...C} width="365" height="200" aria-label="A chart." style={{ overflow: 'hidden' }}>
      <defs {...C} id="_ABSTRACT_RENDERER_ID_1"></defs>
      <rect {...C} x="0" y="0" width="365" height="200" {...r} fill="#eeeeee" />
      <g {...C}>
        <rect {...C} x="242" y="0" width="123" height="42" {...r} fillOpacity="0" fill="#ffffff" />
        <g {...C} column-id="Player">
          <rect {...C} x="242" y="0" width="123" height="10" {...r} fillOpacity="0" fill="#ffffff" />
          <g {...C}><text {...C} {...t} x="256" y="8.5" fill="#222222">Player </text></g>
          <circle {...C} cx="247" cy="5" r="5" {...r} fill="#086cb8" />
        </g>
        <g {...C} column-id="Banker">
          <rect {...C} x="242" y="16" width="123" height="10" {...r} fillOpacity="0" fill="#ffffff" />
          <g {...C}><text {...C} {...t} x="256" y="24.5" fill="#222222">Banker </text></g>
          <circle {...C} cx="247" cy="21" r="5" {...r} fill="#ae2130" />
        </g>
        <g {...C} column-id="Tie">
          <rect {...C} x="242" y="32" width="123" height="10" {...r} fillOpacity="0" fill="#ffffff" />
          <g {...C}><text {...C} {...t} x="256" y="40.5" fill="#222222">Tie </text></g>
          <circle {...C} cx="247" cy="37" r="5" {...r} fill="#279532" />
        </g>
      </g>
      <g {...C}>
        <path {...C} d="M213,90L213,110A100,80,0,0,1,181.45471059286888,168.31749019371293L181.45471059286888,148.31749019371293A100,80,0,0,0,213,90" stroke="#06518a" strokeWidth="1" fill="#06518a" />
        <path {...C} d="M113,90L113,110L181.45471059286888,168.31749019371293L181.45471059286888,148.31749019371293" stroke="#06518a" strokeWidth="1" fill="#06518a" />
        <path {...C} d="M113,90L113,10A100,80,0,0,1,181.45471059286888,148.31749019371293L113,90A0,0,0,0,0,113,90" stroke="#086cb8" strokeWidth="1" fill="#086cb8" />
        <text {...C} {...t} x="175.80747867400245" y="71.07937328901528" fill="#ffffff">38% </text>
      </g>
      <g {...C}>
        <path {...C} d="M113,90L113,110L54.22147477075268,45.27864045000422L54.22147477075268,25.278640450004218" stroke="#1d7026" strokeWidth="1" fill="#1d7026" />
        <path {...C} d="M113,90L54.22147477075268,25.278640450004218A100,80,0,0,1,113,10L113,90A0,0,0,0,0,113,90" stroke="#279532" strokeWidth="1" fill="#279532" />
        <text {...C} {...t} x="78.13005322102802" y="33.967468843948105" fill="#ffffff">10% </text>
      </g>
      <g {...C}>
        <path {...C} d="M181.45471059286888,148.31749019371293L181.45471059286888,168.31749019371293A100,80,0,0,1,13,110.00000000000001L13,90A100,80,0,0,0,181.45471059286888,148.31749019371293" stroke="#831924" strokeWidth="1" fill="#831924" />
        <path {...C} d="M113,90L181.45471059286888,148.31749019371293A100,80,0,1,1,54.22147477075268,25.278640450004218L113,90A0,0,0,1,0,113,90" stroke="#ae2130" strokeWidth="1" fill="#ae2130" />
        <text {...C} {...t} x="42.756710036872164" y="132.26256511522956" fill="#ffffff">52% </text>
      </g>
      <g {...C}></g>
    </svg>
  );
}

/**
 * app-baccarat (casino.kingexch111.com/baccarat/:id — BACCARAT): the video,
 * the PLAYER / TIE / BANKER table and the PLAYER PAIR / BANKER PAIR boxes —
 * a struck box places the selected chip straight away (no slip; no chip → the
 * "please select chips for Bet" toast) — then, on desktop, the reference's
 * static STATISTICS pie beside the CHIPS, on a phone the chip row alone, and
 * the recent results. The "<n>%" bars show how much of a box's size has gone
 * within the round.
 *
 * Markets by place, as the reference reads them: marketArr[0] WINNER
 * (PLAYER, BANKER), [1] TIE, [2] PAIR (PLAYER PAIR, BANKER PAIR).
 */
export default function Baccarat({ eventId }) {
  const table = useCasinoTable(eventId);
  const { game, results, casinoPl, openBetslip, bet } = table;
  const stakes = useStakes();
  const [selectedBetAmount, setSelectedBetAmount] = useState(0);
  const [w, tie, pair] = game.marketArr;
  const { widths: [playerMarket, bankerMarket, tieMarket, pairPlayer, pairBanker], tieLeft } = useMatched(game, [w?.runners[0], w?.runners[1], tie?.runners[0], pair?.runners[0], pair?.runners[1]]);
  const suspended = game.status === 'SUSPEND';
  const card20 = eventId === '99.0057';

  const setStake = (amount) => setSelectedBetAmount((cur) => (amount != cur ? amount : 0));

  // openBetslip(): with a chip selected the bet goes straight in.
  const strike = (m, i) => {
    if (suspended || bet.placing || !m) return;
    if (!(Number(selectedBetAmount) > 0)) { toastrError('please select chips for Bet'); return; }
    const r = m.runners[i];
    openBetslip(m.marketId, r?.selectionId, 'back', r?.price?.back[0]?.price);
    bet.handlePlaceBet();
  };

  const susp = (r) => (r?.status === 'SUSPEND' || suspended ? 'suspended' : '');
  const name = (m, i) => m?.runnersName[m?.runners[i]?.selectionId];
  const price = (m, i) => m?.runners[i]?.price?.back[0]?.price;
  const book = (m) => m && casinoPl[m.marketId];
  const pl = (m, i) => book(m)?.[m.runners[i]?.selectionId];

  // The PLAYER / TIE / BANKER table; desktop formats the prices, a phone shows them raw.
  const bets = (
    <div {...C} className="baccarat">
      <div {...C} className="baccarat-bets">
        <div {...C} className={cx('player', susp(w?.runners[0]))} onClick={() => strike(w, 0)}>
          <div {...C} className="baccarat-bets-name">
            {playerMarket !== '0%' && <div {...C} className="market-size-container-firstbox" style={{ width: playerMarket }}>{pct(playerMarket)}</div>}
            <div {...C}>{name(w, 0)}</div>
            <div {...C}>{`${isDesktop ? num(price(w, 0), '1.2-2') : price(w, 0) ?? ''} `}</div>
            <div {...C} className="profitLoss">
              {book(w) && <Book pl={pl(w, 0)} style={{ display: 'flex', fontSize: '13px', fontWeight: 400, marginRight: '25px' }} />}
            </div>
            <Chip />
          </div>
        </div>
        <div {...C} className={cx('tie', susp(tie?.runners[0]))} onClick={() => strike(tie, 0)}>
          <div {...C} className="baccarat-bets-name">
            {tieMarket !== '0%' && (
              <div {...C} className="market-size-container-tieMarket" style={{ width: tieMarket, left: tieLeft }}><span {...C}>{pct(tieMarket)}</span></div>
            )}
            <div {...C}>{name(tie, 0)}</div>
            <div {...C} className="mb-0">{isDesktop ? num(price(tie, 0), '1.2-2') : price(tie, 0)}</div>
            <div {...C} className="profitLoss">
              {book(tie) && <Book tie pl={pl(tie, 0)} style={{ display: 'flex', fontSize: '11px', fontWeight: 400, flexDirection: 'column' }} />}
            </div>
            <Chip />
          </div>
        </div>
        {/* The reference greys the BANKER box by the TIE runner's state. */}
        <div {...C} className={cx('banker', susp(tie?.runners[0]))} onClick={() => strike(w, 1)}>
          {bankerMarket !== '0%' && <div {...C} className="market-size-container-secondBox" style={{ width: bankerMarket }}>{pct(bankerMarket)}</div>}
          <div {...C} className="baccarat-bets-name">
            <div {...C}>{name(w, 1)}</div>
            <div {...C}>{isDesktop ? num(price(w, 1), '1.2-2') : price(w, 1)}</div>
            <div {...C} className="profitLoss">
              {book(w) && <Book pl={pl(w, 1)} style={{ display: 'flex', fontSize: '13px', fontWeight: 400, marginLeft: '40px' }} />}
            </div>
            <Chip />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <app-baccarat {...host('cbc')}>
      <div {...C}>
        <VideoSimple attrs={C} game={game} resultDeclared={null} />
        <div {...C} className={isDesktop ? undefined : 'scrollMarket'}>
          {bets}
          <div {...C} className="pairmobile show-xs mt-3">
            <div {...C} className="baccarat" style={{ marginTop: '1px' }}>
              <div {...C} className="baccarat-bets" style={{ margin: '0 0 15px 0' }}>
                <div {...C} className={cx('player-pair', susp(pair?.runners[0]), card20 && 'playerWidthCard20')}>
                  {pairPlayer !== '0%' && <div {...C} className="market-size-container-firstbox-pair" style={{ width: pairPlayer }}>{pct(pairPlayer)}</div>}
                  <div {...C} className="baccarat-bets-name" onClick={() => strike(pair, 0)}>
                    <div {...C}>{name(pair, 0)}</div>
                    <div {...C} className="mb-0">{price(pair, 0)}</div>
                    <div {...C} className="profitLoss">{book(pair) && <PairBook pl={pl(pair, 0)} />}</div>
                    <Chip />
                  </div>
                </div>
                {!card20 && (
                  <div {...C} className={cx('banker-pair', susp(pair?.runners[1]))}>
                    {pairBanker !== '0%' && <div {...C} className="market-size-container-secondBox-pair" style={{ width: pairBanker }}>{pct(pairBanker)}</div>}
                    <div {...C} className="baccarat-bets-name" onClick={() => strike(pair, 1)}>
                      <div {...C}>{name(pair, 1)}</div>
                      <div {...C} className="mb-0">{price(pair, 1)}</div>
                      <div {...C} className="profitLoss">{book(pair) && <PairBook pl={pl(pair, 1)} />}</div>
                      <Chip />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {isDesktop && !card20 && (
            <div {...C} className="row">
              <div {...C} className="col-md-5">
                <div {...C} className="title"> STATISTICS </div>
                <div {...C}><Statistics /></div>
              </div>
              <div {...C} className="col-md-7">
                <div {...C} className="title">CHIPS</div>
                <Chips stakes={stakes} selected={selectedBetAmount} setStake={setStake} />
              </div>
            </div>
          )}
          {!isDesktop && <Chips stakes={stakes} selected={selectedBetAmount} setStake={setStake} />}
          <Results attrs={C} eventId={eventId} results={results} />
        </div>
      </div>
    </app-baccarat>
  );
}
