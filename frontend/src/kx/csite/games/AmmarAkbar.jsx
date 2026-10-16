import { Fragment } from 'react';
import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';
import useCasinoTable from '../useCasinoTable';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import BetSlips from '../parts/BetSlips';
import { t10Img } from '../cards';
import { num, shortNumber, intoNumber, useMarketScroll, useScrollToBetslip } from './tableKit';

const C = ng('caa');

const BLACK = { color: 'black', marginRight: 2, fontWeight: 'bold' };
const BOLD = { fontWeight: 'bold' };
const plus = (x) => (x > 0 ? 'plus-book' : 'minus-book');

// The CARD market's runners: the reference shows a card picture for these ids only.
const CARD_IDS = ['5825901', '5825902', '5825903', '5825904', '5825905', '5825906', '5825907', '5825908', '5825909', '58259010', '58259011', '58259012', '58259013'];

const slipOf = (table) => ({ opened: table.slip?.selectionId ?? '', mid: table.slip?.marketId, v: Number(table.value) || 0 });

/** WINNER row's P&L under the name: book (+ the typed stake, by side) or the slip's P / L. */
function WinnerPl({ m, r, table, betType }) {
  const { opened, mid, v } = slipOf(table);
  const book = table.casinoPl[m.marketId];
  const pl = book?.[r.selectionId];
  const back = r.price.back?.[0];
  const lay = r.price.lay?.[0];
  const mine = opened === r.selectionId && mid === m.marketId;
  return (
    <>
      {book && (
        <span {...C} className="p-0" style={{ display: 'flex', fontSize: 15, fontWeight: 400 }}>
          {pl < 0 && <span {...C} style={BOLD}> L : </span>}
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
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {mine && (
            <span {...C} className="plus-book d-flex" style={{ marginRight: 5 }}>
              <span {...C} style={BLACK}>P :</span>
              <span {...C} className="plus-book">{` ${num((back?.price - 1) * v, '1.2-2')}`}</span>
            </span>
          )}
          {opened !== r.selectionId && mid === m.marketId && (
            <span {...C} className="minus-book d-flex">
              <span {...C} style={BLACK}>L :</span>
              <span {...C} className="minus-book">{`${num(v, '1.2-2')} `}</span>
            </span>
          )}
        </span>
      )}
      {v !== 0 && !book && betType === 'lay' && (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {mine && (
            <span {...C} className="minus-book d-flex" style={{ marginRight: 5 }}>
              <span {...C} style={BLACK}>L :</span>
              <span {...C} className="minus-book">{` ${num((lay?.price - 1) * v, '1.2-2')}`}</span>
            </span>
          )}
          {opened !== r.selectionId && mid === m.marketId && (
            <span {...C} className="plus-book d-flex">
              <span {...C} style={BLACK}>P :</span>
              <span {...C} className="plus-book">{`${num(v, '1.2-2')} `}</span>
            </span>
          )}
        </span>
      )}
    </>
  );
}

/** The P&L in an ODD/EVEN, COLOR or UNDER/OVER box (white text). */
function BoxPl({ m, r, table }) {
  const { opened, mid, v } = slipOf(table);
  const book = table.casinoPl[m.marketId];
  const pl = book?.[r.selectionId];
  const price = r.price?.back[0]?.price;
  const label = { color: 'white', marginRight: 2, fontWeight: 'bold' };
  return (
    <>
      {book && (
        <span {...C} className="p-0" style={{ display: 'flex', fontSize: 11.5, fontWeight: 400, justifyContent: 'center' }}>
          {pl < 0 && <span {...C} style={BOLD}> L : </span>}
          {pl > 0 && <span {...C} style={BOLD}> P :</span>}
          <span {...C} className={`d-flex ${plus(pl)}`} style={{ color: 'white' }}>
            {` ${pl ? num(pl, '1.2-2') : '0.00'} `}
            {opened === r.selectionId && mid === m.marketId && v !== 0 && (
              <span {...C} className={plus((price - 1) * v + (pl || 0))} style={{ color: 'white' }}>{` (${num((price - 1) * v + (pl || 0), '1.2-2')}) `}</span>
            )}
            {r.price.back[0] && v !== 0 && opened !== r.selectionId && mid === m.marketId && (
              <span {...C} className={plus(pl - v)} style={{ color: 'white' }}>{` (${num((pl || 0) - v, '1.2-2')}) `}</span>
            )}
          </span>
        </span>
      )}
      {v !== 0 && !book && (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {opened === r.selectionId && mid === m.marketId && (
            <span {...C} className="plus-book d-flex" style={{ marginRight: 5 }}>
              <span {...C} style={label}>P :</span>
              <span {...C} className="plus-book" style={{ color: 'white' }}>{` ${num((price - 1) * v, '1.2-2')}`}</span>
            </span>
          )}
          {opened !== r.selectionId && mid === m.marketId && (
            <span {...C} className="minus-book d-flex">
              <span {...C} style={label}>L :</span>
              <span {...C} className="minus-book" style={{ color: 'white' }}>{`${num(v, '1.2-2')} `}</span>
            </span>
          )}
        </span>
      )}
    </>
  );
}

/** The CARD row's P&L under the card picture. */
function CardPl({ m, r, table }) {
  const { opened, mid, v } = slipOf(table);
  const book = table.casinoPl[m.marketId];
  const pl = book?.[r.selectionId];
  const price = r.price.back[0]?.price;
  return (
    <>
      {book && (
        <span {...C} className="p-0" style={{ display: 'flex', fontSize: 15, fontWeight: 400 }}>
          {pl < 0 && <span {...C} style={BOLD}> L : </span>}
          {pl > 0 && <span {...C} style={BOLD}> P :</span>}
          <span {...C} className={`d-flex ${plus(pl)}`}>
            {` ${pl ? shortNumber(pl) : '0.00'} `}
            {opened === r.selectionId && mid === m.marketId && v !== 0 && (
              <span {...C} className={plus((price - 1) * v + (pl || 0))}>{` ( ${(price - 1) * v + (pl || 0)} ) `}</span>
            )}
            {r.price.back[0] && v !== 0 && opened !== r.selectionId && mid === m.marketId && (
              <span {...C} className={plus(pl - v)}>{` ( ${(pl || 0) - v}) `}</span>
            )}
          </span>
        </span>
      )}
      {v !== 0 && !book && (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {opened === r.selectionId && mid === m.marketId && (
            <span {...C} className="plus-book d-flex" style={{ marginRight: 5 }}>
              <span {...C} style={BLACK}>P :</span>
              <span {...C} className="plus-book">{` ${(price - 1) * v}`}</span>
            </span>
          )}
          {opened !== r.selectionId && mid === m.marketId && (
            <span {...C} className="minus-book d-flex">
              <span {...C} style={BLACK}>L :</span>
              <span {...C} className="minus-book">{`${v} `}</span>
            </span>
          )}
        </span>
      )}
    </>
  );
}

const Suspended = ({ style }) => (
  <div {...C} className="suspended-casino" style={style}><span {...C} className="stats-text">Suspended</span></div>
);
const RunnerSuspended = () => (
  <div {...C} className="spnd-casinouniqueLay"><span {...C} className="stats-text">Suspended</span></div>
);

/**
 * app-ammar-akbar (casino.kingexch111.com/ammarAkbar/<id>, AMAR AKBAR
 * ANTHONY): the WINNER market (AMAR / AKBAR / ANTHONY with back and lay), the
 * ODD/EVEN, COLOR and UNDER/OVER boxes side by side (one shared slip under
 * them), then the CARD market (A…K pictures with a back price each).
 *
 * Reads game.status and game.marketArr by position, as the reference does: [0]
 * WINNER (runners with back AND lay), [1]…[3] the boxed markets (runner 0 red
 * box, 1 blue; COLOR's RED / BLACK runners show suit glyphs), [4] CARD (runner
 * ids 5825901…58259013 for A…K).
 */
export default function AmmarAkbar({ eventId }) {
  const table = useCasinoTable(eventId);
  const { game, results, slip } = table;
  const height = useMarketScroll(0.62, 0.63);
  useScrollToBetslip(slip ? `${slip.marketId}:${slip.selectionId}:${slip.betType}` : '');

  const mk = game.marketArr;
  const w = mk[0];
  const cards = mk[4];
  const gameSuspended = game.status === 'SUSPEND';
  const { opened, mid } = slipOf(table);
  const betType = slip?.betType;
  const open = (m, r, side) => table.openBetslip(m.marketId, r.selectionId, side, r.price[side]?.[0]?.price);

  return (
    <app-ammar-akbar {...host('caa')}>
      <div {...C}>
        <div {...C}>
          <VideoSimple attrs={C} game={game} resultDeclared={null} />
        </div>
        <div {...C} id="marketScroll" style={{ overflowY: 'auto', height }} className={isDesktop ? 'overflow-hidden' : 'overflow-auto'}>
          {w && (
            <div {...C} className="card">
              <span {...C} data-bs-toggle="collapse" role="button" aria-expanded="true" aria-controls="multiCollapseExample1" className="btn btn-primary card-header inner-sportbook" data-bs-target="#multiCollapseExample1">
                <span {...C}><strong {...C}>{w.marketName}</strong></span>
                <span {...C} />
              </span>
              <div {...C} className="col">
                <div {...C} className="collapse multi-collapse show" id="multiCollapseExample1">
                  <table {...C} className="table table-hover tbl-bets p-rltv sportbook-market-tbl">
                    <colgroup {...C}>
                      <col {...C} span="1" width="60%" />
                      <col {...C} span="1" width="20%" className="back-1 count" />
                      <col {...C} span="1" width="20%" className="back-1 count" />
                    </colgroup>
                    <tr {...C}>
                      <th {...C} colSpan="" className="min-max-mobile">
                        <dl {...C} id="minMaxBox" className="fancy-info">
                          <dt {...C}>Min/Max {' '}</dt>
                          <dd {...C} id="minMaxInfo">{` ${w.min} - ${w.max} `}</dd>
                        </dl>
                      </th>
                      <th {...C} className="back-1" style={{ alignItems: 'center', justifyContent: 'center' }}>Back</th>
                      <th {...C} className="lay" style={{ alignItems: 'center', justifyContent: 'center' }}>Lay</th>
                    </tr>
                    {w.runners.map((r) => (
                      <Fragment key={r.selectionId}>
                        {gameSuspended && <Suspended />}
                        <tr {...C} className="odd-row">
                          <td {...C} colSpan="" className="team-name sportbook-name">
                            <span {...C} className="title">{` ${w.runnersName[r.selectionId]} `}</span>
                            <WinnerPl m={w} r={r} table={table} betType={betType} />
                          </td>
                          {['back', 'lay'].map((side) => (
                            <td
                              {...C}
                              key={side}
                              colSpan=""
                              appratehighlight=""
                              className={`${side === 'back' ? 'back-1' : 'lay'} count sportbook-minwidth p-rltv${opened === r.selectionId && mid === w.marketId && betType === side ? ' active' : ''}`}
                              onClick={() => open(w, r, side)}
                            >
                              {r.status === 'SUSPEND' && !gameSuspended && <RunnerSuspended />}
                              <a {...C} className="d-flex flex-column p-0" style={{ textDecoration: 'none', color: 'black' }}>
                                {` ${num(r.price[side]?.[0]?.price, '1.2-2')} `}
                                <span {...C} className="d-flex justify-content-center">{r.price[side]?.[0]?.size}</span>
                              </a>
                            </td>
                          ))}
                        </tr>
                        {opened === r.selectionId && !gameSuspended && (
                          <tr {...C}>
                            <td {...C} className="p-0" colSpan="3" id="betslip">
                              <BetSlips attrs={C} table={table} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </table>
                </div>
              </div>
            </div>
          )}
          {w && (
            <div {...C} className="container-fluid">
              <div {...C} className="row row5">
                {mk.map((m, idx) => (idx > 0 && idx < 4 ? (
                  <div {...C} key={m.marketId} className="col-4 p-0">
                    <div {...C} className="light-bg pl-1 pr-1">
                      <div {...C} className="card">
                        <span {...C} data-bs-toggle="collapse" data-bs-target="#multiCollapseExample2" role="button" aria-expanded="true" aria-controls="multiCollapseExample2" className="btn btn-primary card-header inner-sportbook">
                          <span {...C}><strong {...C}>{m.marketName}</strong></span>
                          <span {...C} />
                        </span>
                        <div {...C} className="col">
                          <div {...C} id="multiCollapseExample2" className="collapse multi-collapse show">
                            <table {...C} className="table table-hover tbl-bets p-rltv sportbook-market-tbl">
                              <tr {...C}>
                                <th {...C} colSpan="" className="min-max-mobile">
                                  <dl {...C} id="minMaxBox" className="fancy-info">
                                    <dt {...C}>Min/Max </dt>
                                    <dd {...C} id="minMaxInfo">{` ${m.min} - ${m.max} `}</dd>
                                  </dl>
                                </th>
                              </tr>
                              {m.runners.map((r, n) => {
                                const name = m.runnersName[r.selectionId];
                                const box = n % 2 === 0 ? 'smallBoxRed' : 'smallBoxBlue';
                                const sel = opened === r.selectionId ? (n % 2 === 0 ? ' smallboxRedSelected' : ' smallboxBlueSelected') : '';
                                return (
                                  <Fragment key={r.selectionId}>
                                    {gameSuspended && <Suspended />}
                                    <tr {...C} onClick={() => open(m, r, 'back')}>
                                      <td {...C} colSpan="" className={`d-flex flex-column ${box}${sel}`}>
                                        {name !== 'RED' && name !== 'BLACK' && ` ${name} `}
                                        {name === 'RED' && <span {...C} className="red p-0">{' ♥ ♦ '}</span>}
                                        {name === 'BLACK' && <span {...C} className="text-dark p-0">{'♠ ♣'}</span>}
                                        <span {...C} className="p-0">{num(r.price?.back[0]?.price, '1.2-2')}</span>
                                        <span {...C} className="p-0 span-size">{` ${r.price?.back[0]?.size} `}</span>
                                        <BoxPl m={m} r={r} table={table} />
                                      </td>
                                    </tr>
                                  </Fragment>
                                );
                              })}
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null))}
              </div>
              <div {...C} className="row row5 p-0">
                {(mid === mk[1]?.marketId || mid === mk[2]?.marketId || mid === mk[3]?.marketId) && slip && (
                  <div {...C} className="p-0">
                    <BetSlips attrs={{ ...C, className: 'amarAkbarAnthony', id: 'betslip' }} table={table} />
                  </div>
                )}
              </div>
            </div>
          )}
          {w && cards && (
            <div {...C} className="card">
              <span {...C} data-bs-toggle="collapse" data-bs-target="#multiCollapseExample5" role="button" aria-expanded="true" aria-controls="multiCollapseExample5" className="btn btn-primary card-header inner-sportbook">
                <span {...C}><strong {...C}>{cards.marketName}</strong></span>
                <span {...C} />
              </span>
              <div {...C} className="col">
                <div {...C} id="multiCollapseExample5" className="collapse multi-collapse show">
                  <table {...C} className="table table-hover tbl-bets p-rltv sportbook-market-tbl">
                    <colgroup {...C}>
                      <col {...C} span="1" width="60%" />
                      <col {...C} span="1" width="40%" />
                    </colgroup>
                    <tr {...C}>
                      <th {...C} colSpan="" className="min-max-mobile">
                        <dl {...C} id="minMaxBox" className="fancy-info">
                          <dt {...C}>Min/Max {' '}</dt>
                          <dd {...C} id="minMaxInfo">{` ${cards.min} - ${cards.max} `}</dd>
                        </dl>
                      </th>
                      <th {...C} className="back-1" style={{ alignItems: 'center', justifyContent: 'center' }}>Back</th>
                    </tr>
                    {cards.runners.map((r) => (
                      <Fragment key={r.selectionId}>
                        {game.status === 'SUSPEND' && <Suspended style={{ background: '#ffffff3d' }} />}
                        <tr {...C} className="odd-row">
                          <td {...C} colSpan="" className="team-name sportbook-name">
                            {CARD_IDS.includes(String(r.selectionId)) && (
                              <span {...C} className="title">
                                <img {...C} style={{ width: 30 }} src={t10Img(cards.runnersName[r.selectionId])} />
                              </span>
                            )}
                            <CardPl m={cards} r={r} table={table} />
                          </td>
                          <td
                            {...C}
                            colSpan=""
                            appratehighlight=""
                            className={`back-1 count sportbook-minwidth p-rltv${opened === r.selectionId && mid === cards.marketId && betType === 'back' ? ' active' : ''}`}
                            onClick={() => open(cards, r, 'back')}
                          >
                            {r.status === 'SUSPEND' && !gameSuspended && <RunnerSuspended />}
                            <a {...C} className="d-flex flex-column p-0" style={{ textDecoration: 'none', color: 'black' }}>
                              {` ${num(r.price.back[0]?.price, '1.2-2')} `}
                              <span {...C} className="d-flex justify-content-center">{r.price.back[0]?.size}</span>
                            </a>
                          </td>
                        </tr>
                        {opened === r.selectionId && (
                          <tr {...C}>
                            <td {...C} colSpan="3" id="betslip">
                              <BetSlips attrs={C} table={table} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </table>
                </div>
              </div>
            </div>
          )}
          <Results attrs={C} eventId={eventId} results={results} />
        </div>
      </div>
    </app-ammar-akbar>
  );
}
