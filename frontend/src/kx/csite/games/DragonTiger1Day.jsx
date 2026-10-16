import { useState } from 'react';
import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';
import useCasinoTable from '../useCasinoTable';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import BetSlips from '../parts/BetSlips';
import { lucky7Img } from '../cards';
import { num, shortNumber, intoNumber, useScrollToBetslip, useInfoDropdown, usePlaceDropdown } from './tableKit';

const C = ng('cd1');

const LABEL = { color: 'black', marginRight: 2, fontWeight: 'bold' };
const BOLD = { fontWeight: 'bold' };
const plus = (x) => (x > 0 ? 'plus-book' : 'minus-book');

// The slip state the template reads: isBetsSlipOpened / marketId / isValueBetsSlip.
const slipOf = (table) => ({
  opened: table.slip?.selectionId ?? '',
  mid: table.slip?.marketId,
  v: Number(table.value) || 0,
});

/**
 * The P&L over a WINNER player's back / lay boxes (runner k of marketArray[0]):
 * the book with the typed stake's effect for the slip's side, or the open
 * slip's P / L alone (back) or L / P (lay).
 */
function WinnerPl({ m, k, table, betType }) {
  const r = m.runners[k];
  const { opened, mid, v } = slipOf(table);
  const book = table.casinoPl[m.marketId];
  const pl = book?.[r.selectionId];
  const back = r.price.back?.[0];
  const lay = r.price.lay?.[0];
  const wrap = k === 0
    ? { display: 'flex', marginLeft: 38, fontSize: 12, fontWeight: 400 }
    : { display: 'flex', fontSize: 12, fontWeight: 400, justifyContent: 'center' };
  const mine = opened === r.selectionId && mid === m.marketId;
  return (
    <>
      {book && (
        <span {...C} className="p-0" style={wrap}>
          {pl < 0 && <span {...C} style={BOLD}> L :</span>}
          {pl > 0 && <span {...C} style={BOLD}> P :</span>}
          <span {...C} className={`d-flex ${plus(pl)}`}>
            {` ${pl ? num(pl, '1.2-2') : '0.00'} `}
            {mine && v !== 0 && betType === 'back' && (
              <span {...C} className={plus((back?.price - 1) * v + pl)}>{` ( ${num((back?.price - 1) * v + intoNumber(pl), '1.2-2')} ) `}</span>
            )}
            {back && v !== 0 && opened !== r.selectionId && betType === 'back' && (
              <span {...C} className={plus(pl - v)}>{` ( ${num(intoNumber(pl) - intoNumber(v), '1.2-2')}) `}</span>
            )}
            {mine && v !== 0 && betType === 'lay' && (
              <span {...C} className={(lay?.price - 1) * v - (pl || 0) > 0 ? 'minus-book' : 'plus-book'}>
                {` ( ${num((lay?.price - 1) * v - (pl ? intoNumber(pl) : 0), '1.2-2')} ) `}
              </span>
            )}
            {lay && v !== 0 && opened !== r.selectionId && mid === m.marketId && betType === 'lay' && (
              <span {...C} className={plus((pl ? intoNumber(pl) : 0) + intoNumber(v))}>{` (${(pl ? intoNumber(pl) : 0) + intoNumber(v)}) `}</span>
            )}
          </span>
        </span>
      )}
      {v !== 0 && !book && betType === 'back' && (
        <span {...C} style={{ display: 'flex', padding: 0, marginLeft: 38 }}>
          {mine && (
            <span {...C} className="plus-book d-flex ms-0" style={{ marginRight: 5 }}>
              <span {...C} style={LABEL}>P :</span>
              <span {...C} className="plus-book">{` ${num((back?.price - 1) * v, '1.2-2')}`}</span>
            </span>
          )}
          {opened !== r.selectionId && mid === m.marketId && (
            <span {...C} className="minus-book d-flex ms-0">
              <span {...C} style={LABEL}>L :</span>
              <span {...C} className="minus-book">{`${num(v, '1.2-2')} `}</span>
            </span>
          )}
        </span>
      )}
      {v !== 0 && !book && betType === 'lay' && (
        <span {...C} style={{ display: 'flex', padding: 0, marginLeft: 38 }}>
          {mine && (
            <span {...C} className="minus-book ms-0 d-flex" style={{ marginRight: 5 }}>
              <span {...C} style={LABEL}>L :</span>
              <span {...C} className="minus-book">{` ${num((lay?.price - 1) * v, '1.2-2')}`}</span>
            </span>
          )}
          {opened !== r.selectionId && mid === m.marketId && (
            <span {...C} className="plus-book ms-0 d-flex">
              <span {...C} style={LABEL}>P :</span>
              <span {...C} className="plus-book">{`${num(v, '1.2-2')} `}</span>
            </span>
          )}
        </span>
      )}
    </>
  );
}

/**
 * The P&L line under a PAIR / odd-even / colour button (inside its
 * span.profitLoss-font): the book (with the typed stake's effect), or the open
 * slip's P (struck runner) / L (the market's other runner). `pair` is the PAIR
 * block's variant (pb-0, a bottomless 6px pad); `big` the 15px book of the
 * black colour button; `piped` whether the slip's P goes through the number pipe.
 */
function ButtonPl({ m, r, table, pair = false, big = false, piped = false }) {
  const { opened, mid, v } = slipOf(table);
  const book = table.casinoPl[m.marketId];
  const pl = book?.[r.selectionId];
  const price = r.price.back[0]?.price;
  const mine = opened === r.selectionId && mid === m.marketId;
  const pWin = (price - 1) * v;
  return (
    <>
      {book && (
        <span {...C} className={pair ? 'pb-0' : 'p-0'} style={{ display: 'flex', justifyContent: 'center', fontSize: big ? 15 : 12, fontWeight: 400 }}>
          {pl < 0 && <span {...C} style={LABEL}> L : </span>}
          {pl > 0 && <span {...C} style={LABEL}> P :</span>}
          <span {...C} className={`d-flex flex-column align-items-center ${plus(pl)}`}>
            {` ${pl ? num(pl, '1.0-2') : '0.00'} `}
            {mine && v !== 0 && (
              <span {...C} className={plus(pWin + pl)}>{` ( ${num(pWin + pl, '1.0-2')} ) `}</span>
            )}
            {r.price.back[0] && v !== 0 && mid === m.marketId && opened !== r.selectionId && (
              <span {...C} className={plus(pl - v)}>{` ( ${num(pl - v, '1.0-2')}) `}</span>
            )}
          </span>
        </span>
      )}
      {v !== 0 && !book && mid === m.marketId && (
        <span {...C} style={pair ? { display: 'flex', justifyContent: 'center', padding: '6px', paddingBottom: 0 } : { display: 'flex', justifyContent: 'center', padding: '6px' }}>
          {mine && (
            <span {...C} className="plus-book d-flex" style={{ marginRight: 5 }}>
              <span {...C} style={LABEL}>P :</span>
              <span {...C} className="plus-book">{` ${piped ? num(pWin, '1.0-2') : pWin}`}</span>
            </span>
          )}
          {opened !== r.selectionId && (
            <span {...C} className="minus-book d-flex">
              <span {...C} style={LABEL}>L :</span>
              <span {...C} className="minus-book">{`${-v} `}</span>
            </span>
          )}
        </span>
      )}
    </>
  );
}

/** The short P&L under a rank card (`tiger`: the Tiger tab's variant). */
function CardPl({ m, r, table, tiger }) {
  const { opened, mid, v } = slipOf(table);
  const book = table.casinoPl[m.marketId];
  const pl = book?.[r.selectionId];
  const label = tiger ? BOLD : { fontWeight: 'bold', color: 'black' };
  return (
    <>
      {book && (
        <span {...C} className="p-0" style={{ display: 'flex', fontSize: 10, fontWeight: 400, textAlign: 'center', justifyContent: 'center' }}>
          {pl < 0 && <span {...C} style={label}> L : </span>}
          {pl > 0 && <span {...C} style={label}> P :</span>}
          <span {...C} className={`d-flex ${pl > 0 ? 'plus-book m-0' : 'minus-book m-0'}`}>{` ${pl ? shortNumber(pl) : '0.00'} `}</span>
        </span>
      )}
      {v !== 0 && !book && mid === m.marketId && (
        // The Dragon tab's style reads "padding: 0;;font-size: 10px": the stray ";" drops the font size.
        <span {...C} style={tiger ? { display: 'flex', padding: 0, fontSize: 10 } : { display: 'flex', padding: 0 }}>
          {opened === r.selectionId && (
            <span {...C} className="plus-book m-0 d-flex" style={{ marginRight: tiger ? 5 : 0 }}>
              <span {...C} style={{ color: 'black', fontWeight: 'bold' }}>P :</span>
              <span {...C} className="plus-book m-0">{` ${shortNumber((r.price.back[0]?.price - 1) * v)}`}</span>
            </span>
          )}
          {opened !== r.selectionId && (
            <span {...C} className="minus-book m-0 d-flex">
              <span {...C} style={{ color: 'black', fontWeight: 'bold' }}>L :</span>
              <span {...C} className="minus-book m-0">{`${shortNumber(-v)} `}</span>
            </span>
          )}
        </span>
      )}
    </>
  );
}

/**
 * app-dragon-tiger-1-day (casino.kingexch111.com/1daydragontiger/<id>, 1 DAY
 * DRAGON TIGER): the DRAGON / TIGER WINNER back & lay boxes, the PAIR (TIE)
 * button, then the Dragon / Tiger tabs, each with its player's even / odd and
 * red / black buttons and its A…K rank cards. The struck box keeps a blue glow;
 * the slip opens under the struck block.
 *
 * Reads game.status and game.marketArr by position, as the reference does:
 * [0] WINNER (runners with back AND lay), [1] PAIR, [2] / [3] DRAGON / TIGER
 * ODD/EVEN (runner 0 odd, 1 even), [4] / [5] DRAGON / TIGER CARD COLOR (0 red,
 * 1 black), [6] / [7] DRAGON / TIGER CARD (A…K).
 */
export default function DragonTiger1Day({ eventId }) {
  const table = useCasinoTable(eventId);
  const { game, results, slip } = table;
  const [tab, setTab] = useState('D');
  const [cell, setCell] = useState({ id: '', betType: '' });
  const [info, toggleInfo] = useInfoDropdown();
  usePlaceDropdown(info);
  useScrollToBetslip(slip ? `${slip.marketId}:${slip.selectionId}:${slip.betType}` : '', true);

  const mk = game.marketArr;
  const gameSuspended = game.status === 'SUSPEND';
  const { opened, mid } = slipOf(table);
  const v = Number(table.value) || 0;
  // The slip's side: the reference keeps betType after the slip closes, as it keeps the struck cell.
  const betType = slip?.betType ?? cell.betType;

  const strike = (m, r, side) => {
    if (r.status === 'SUSPEND') return;
    setCell({ id: r.selectionId, betType: side });
    table.openBetslip(m.marketId, r.selectionId, side, r.price[side]?.[0]?.price);
  };
  const boxClass = (r, side) => (r.status === 'SUSPEND' || gameSuspended ? ' suspended'
    : cell.id === r.selectionId && betType === side ? ' blue-shedow' : '');
  const btnClass = (r) => (r.status === 'SUSPEND' || gameSuspended ? ' suspended' : cell.id === r.selectionId ? ' blue-shedow' : '');
  const slipHere = (...markets) => markets.some((m) => m && mid === m.marketId) && !gameSuspended;
  const slipBox = (cls) => (
    <div {...C} className={cls} id="betslip" style={{ padding: 0 }}>
      <BetSlips attrs={{ ...C, style: { padding: 0 } }} table={table} />
    </div>
  );

  // The Dragon / Tiger tab: its odd/even, colour and card markets.
  const sideTab = (oe, col, cards, tiger) => (
    <>
      <div {...C} className="container-fluid container-fluid-5 mt-2">
        <div {...C} className="row row5">
          <div {...C} className="col-6">
            <div {...C}>
              <div {...C} className="row row5 light-bg">
                {[[oe.runners[1], true], [oe.runners[0], false]].map(([r, piped]) => (
                  <div {...C} className="col-6" key={r.selectionId}>
                    <p {...C} className="d-block mb-0 text-center h-18 f-16"><b {...C}>{r.price.back[0]?.price}</b></p>
                    <button {...C} className={`btn-theme mt-1 text-uppercase${btnClass(r)}`} onClick={() => strike(oe, r, 'back')}>
                      {` ${String(oe.runnersName[r.selectionId] ?? '').slice(-4)}`}
                    </button>
                    <p {...C} className="mb-0"><span {...C} className="profitLoss-font"><ButtonPl m={oe} r={r} table={table} piped={piped} /></span></p>
                  </div>
                ))}
              </div>
              <div {...C} className="row row5 light-bg">
                <div {...C} className="col-12 text-right"><p {...C} className="mb-0 min-max h-18">{` Min:${oe.min} Max:${oe.max} `}</p></div>
              </div>
            </div>
          </div>
          <div {...C} className="col-6">
            <div {...C}>
              <div {...C} className="row light-bg">
                {[[col.runners[0], 'card-red', '[', '{'], [col.runners[1], 'card-white', ']', '}']].map(([r, suit, a, b], i) => (
                  <div {...C} className="col-6" key={r.selectionId}>
                    <p {...C} className="d-block mb-0 text-center h-18 f-16"><b {...C}>{r.price.back[0]?.price}</b></p>
                    <button {...C} className={`btn-theme mt-1 text-uppercase${btnClass(r)}`} onClick={() => strike(col, r, 'back')}>
                      <div {...C} className="color-card" />
                      <span {...C} className="card-icon"><span {...C} className={suit}>{a}</span></span>
                      <span {...C} className="card-icon"><span {...C} className={suit}>{b}</span></span>
                    </button>
                    <p {...C} className="mb-0"><span {...C} className="profitLoss-font"><ButtonPl m={col} r={r} table={table} big={i === 1} /></span></p>
                  </div>
                ))}
              </div>
              <div {...C} className="row light-bg">
                <div {...C} className="col-12 text-right"><p {...C} className="mb-0 min-max h-18">{` Min:${col.min} Max:${col.max} `}</p></div>
              </div>
            </div>
          </div>
          {slipHere(col, oe) && slipBox('mt-2')}
        </div>
      </div>
      <div {...C} className="light-bg container-fluid mt-2">
        <div {...C} className="row row5">
          <div {...C} className="col-5 me-4 text-center h-18 f-16"><b {...C} className="float-start">{cards.marketName}</b></div>
          <div {...C} className="col-6 d-flex text-center justify-content-between h-18 f-16">
            <b {...C}>{cards.runners[0]?.price.back[0]?.price}</b>
            <div {...C} className="info-block float-right">
              <i
                {...C}
                data-bs-toggle="dropdown"
                aria-expanded={info === cards.marketId ? 'true' : 'false'}
                className={`fas fa-info-circle float-right${info === cards.marketId ? ' show' : ''}`}
                data-bs-target={`#collapse12${cards.marketId}`}
                id={`#collapse12${cards.marketId}`}
                onClick={toggleInfo(cards.marketId)}
              />
              <ul {...C} data-kc-pop="" className={`dropdown-menu${info === cards.marketId ? ' show' : ''}`} aria-labelledby={`collapse12${cards.marketId}`}>
                <span {...C}>{`Min: ${cards.min} `}</span>
                <span {...C}>{`Max: ${cards.max} `}</span>
              </ul>
            </div>
          </div>
        </div>
        <div {...C} className="row row5 mt-2">
          <div {...C} className="col-12 text-center">
            {cards.runners.map((r) => {
              const name = String(cards.runnersName[r.selectionId] ?? '');
              return (
                <div {...C} className="mr-2 dt-card d-inline-block" key={r.selectionId}>
                  <div {...C} className={btnClass(r).trim() || undefined} onClick={() => strike(cards, r, 'back')}>
                    <img {...C} src={lucky7Img(name.slice(-1) !== '0' ? name.slice(-1) : name.slice(-2))} />
                  </div>
                  <div {...C} className="ubook text-center m-t-5 text-success h-18" style={{ width: 40 }}>
                    <CardPl m={cards} r={r} table={table} tiger={tiger} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {slipHere(cards) && slipBox('mt-3')}
    </>
  );

  const w = mk[0];
  const pair = mk[1];
  const winnerSide = (k) => {
    const r = w.runners[k];
    return (
      <div {...C} className={(v && !table.casinoPl[w.marketId]) || table.casinoPl[w.marketId] ? 'justify-content-between' : undefined}>
        <WinnerPl m={w} k={k} table={table} betType={betType} />
        <div {...C} className="d-flex">
          <div {...C} className={`back backbox p-3 ps-4 pe-4 d-flex align-items-center flex-column${boxClass(r, 'back')}`} onClick={() => strike(w, r, 'back')}>
            <span {...C} className="f-16">{r.price.back?.[0]?.price}</span>
            <span {...C}>{r.price.back?.[0]?.size}</span>
          </div>
          <div {...C} className={`lay laybox p-3 ps-4 pe-4 d-flex align-items-center flex-column${boxClass(r, 'lay')}`} onClick={() => strike(w, r, 'lay')}>
            <span {...C} className="f-16">{r.price.lay?.[0]?.price}</span>
            <span {...C}>{r.price.lay?.[0]?.size}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <app-dragon-tiger-1-day {...host('cd1')}>
      <div {...C} style={{ overflowY: 'hidden' }}>
        <div {...C}>
          <VideoSimple attrs={C} game={game} resultDeclared={null} />
        </div>
        <div {...C} id="marketScroll" style={{ overflowY: 'auto' }} className={isDesktop ? 'overflow-hidden' : 'overflow-auto'}>
          {mk.length > 0 && (
            <div {...C}>
              <ol {...C} className="circle">
                <div {...C} className="d-flex justify-content-between dra-tig-title">
                  <span {...C}>{` ${w.runnersName[w.runners[0]?.selectionId]} `}</span>
                  <span {...C}>{` ${w.runnersName[w.runners[1]?.selectionId]} `}</span>
                </div>
                <li {...C} className="d-flex justify-content-between">
                  {winnerSide(0)}
                  {winnerSide(1)}
                </li>
                {mid === w.marketId && opened === w.runners[0]?.selectionId && !gameSuspended && slipBox('ps-0 pe-0 m-0')}
                {mid === w.marketId && opened === w.runners[1]?.selectionId && !gameSuspended && slipBox('ps-0 pe-0 m-0')}
              </ol>
              <div {...C} className="container-fluid container-fluid-5 mt-1">
                <div {...C}>
                  <div {...C} className="row row5 light-bg">
                    <div {...C} className="col-sm-12 col-xs-12">
                      <button
                        {...C}
                        className={`btn-theme mt-1 text-uppercase d-flex justify-content-between align-items-center ps-5 pe-5 f-16${btnClass(pair.runners[0])}`}
                        onClick={() => strike(pair, pair.runners[0], 'back')}
                      >
                        {` ${pair.runnersName[pair.runners[0].selectionId]} `}
                        <b {...C}>{pair.runners[0].price.back[0]?.price}</b>
                      </button>
                      <p {...C} className="mb-0"><span {...C} className="profitLoss-font"><ButtonPl m={pair} r={pair.runners[0]} table={table} pair /></span></p>
                    </div>
                  </div>
                  <div {...C} className="row row5 light-bg pt-0">
                    <div {...C} className="col-12 text-right"><p {...C} className="mb-0 min-max h-18">{` Min:${pair.min} Max:${pair.max} `}</p></div>
                  </div>
                  {slipHere(pair) && slipBox('mt-2')}
                </div>
              </div>
              <ul {...C} className="nav nav-tabs">
                <li {...C} className={`nav-item col${tab === 'D' ? ' activeTab' : ''}`}>
                  <a {...C} data-toggle="tab" className="nav-link game" onClick={() => setTab('D')}>Dragon</a>
                </li>
                <li {...C} className={`nav-item col${tab === 'T' ? ' activeTab' : ''}`}>
                  <a {...C} data-toggle="tab" className="nav-link match" onClick={() => setTab('T')}>Tiger</a>
                </li>
              </ul>
              {tab === 'D' && sideTab(mk[2], mk[4], mk[6], false)}
              {tab === 'T' && sideTab(mk[3], mk[5], mk[7], true)}
            </div>
          )}
          <Results attrs={C} eventId={eventId} results={results} />
        </div>
      </div>
    </app-dragon-tiger-1-day>
  );
}
