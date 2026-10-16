import { Fragment } from 'react';
import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';
import useCasinoTable from '../useCasinoTable';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import BetSlips from '../parts/BetSlips';
import { cx, num, useTablePage } from './teenUtil';
import { SportbookHeader } from './sportbook';
import { useScrollToBetslip } from './tableKit';

const C = ng('c32');

const int = (v) => parseInt(v, 10); // the page's intoNumber()
const LABEL = { fontWeight: 'bold' };
const SLIP_LABEL = { color: 'black', marginRight: '2px', fontWeight: 'bold' };

/** WINNER / CARD COLOR runner's P / L: the book, then the open slip's preview (back or lay). */
function BackLayBook({ table, m, r }) {
  const { slip, value, casinoPl } = table;
  const book = casinoPl[m.marketId];
  const sel = r.selectionId;
  const pl = book?.[sel];
  const opened = slip?.selectionId === sel;
  const inMarket = slip?.marketId === m.marketId;
  const betType = slip?.betType;
  const back = r.price.back[0]?.price;
  const lay = r.price.lay?.[0]?.price;
  const v = Number(value);
  return (
    <span {...C} className="d-flex align-items-center">
      {book && (
        <span {...C} className="p-0" style={{ display: 'flex', fontSize: '15px', fontWeight: 400 }}>
          {pl < 0 && <span {...C} style={LABEL}> L : </span>}
          {pl > 0 && <span {...C} style={LABEL}> P :</span>}
          <span {...C} className={cx('d-flex', pl > 0 ? 'plus-book' : 'minus-book')}>
            {` ${pl ? num(pl, '1.2-2') : '0.00'} `}
            {opened && inMarket && v !== 0 && betType === 'back' && (
              <span {...C} className={(back - 1) * v + pl > 0 ? 'plus-book' : 'minus-book'}>{` ( ${num((back - 1) * v + int(pl), '1.0-2')} ) `}</span>
            )}
            {r.price.back[0] && !!v && inMarket && !opened && betType === 'back' && (
              <span {...C} className={pl - v > 0 ? 'plus-book' : 'minus-book'}>{` ( ${num(int(pl) - int(v), '1.0-2')}) `}</span>
            )}
            {opened && inMarket && v !== 0 && betType === 'lay' && (
              <span {...C} className={(lay - 1) * v - (pl || 0) > 0 ? 'minus-book' : 'plus-book'}>{` ( ${num((lay - 1) * v - (pl ? int(pl) : 0), '1.2-2')} ) `}</span>
            )}
            {r.price.lay?.[0] && !!v && inMarket && !opened && betType === 'lay' && (
              <span {...C} className={(pl ? int(pl) : 0) + int(v) > 0 ? 'plus-book' : 'minus-book'}>{` (${(pl ? int(pl) : 0) + int(v)}) `}</span>
            )}
          </span>
        </span>
      )}
      {!!v && !book && betType === 'back' && (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {opened && inMarket && (
            <span {...C} className="plus-book d-flex" style={{ marginRight: '5px' }}>
              <span {...C} style={SLIP_LABEL}>P :</span>
              <span {...C} className="plus-book">{` ${num((back - 1) * v, '1.0-2')}`}</span>
            </span>
          )}
          {!opened && inMarket && (
            <span {...C} className="minus-book d-flex">
              <span {...C} style={SLIP_LABEL}>L :</span>
              <span {...C} className="minus-book">{`${num(v, '1.0-2')} `}</span>
            </span>
          )}
        </span>
      )}
      {!!v && !book && betType === 'lay' && (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {opened && inMarket && (
            <span {...C} className="minus-book d-flex" style={{ marginRight: '5px' }}>
              <span {...C} style={SLIP_LABEL}>L :</span>
              <span {...C} className="minus-book">{` ${num((lay - 1) * v, '1.0-2')}`}</span>
            </span>
          )}
          {!opened && inMarket && (
            <span {...C} className="plus-book d-flex">
              <span {...C} style={SLIP_LABEL}>P :</span>
              <span {...C} className="plus-book">{`${num(v, '1.0-2')} `}</span>
            </span>
          )}
        </span>
      )}
    </span>
  );
}

/** CARD TOTAL / LUCKY NUMBER runner's P / L (back only, unformatted previews). */
function BackBook({ table, m, r }) {
  const { slip, value, casinoPl } = table;
  const book = casinoPl[m.marketId];
  const sel = r.selectionId;
  const pl = book?.[sel];
  const opened = slip?.selectionId === sel;
  const inMarket = slip?.marketId === m.marketId;
  const back = r.price.back[0]?.price;
  const v = Number(value);
  return (
    <span {...C} className="d-flex align-items-center">
      {book && (
        <span {...C} className="p-0" style={{ display: 'flex', fontSize: '15px', fontWeight: 400 }}>
          {pl < 0 && <span {...C} style={LABEL}> L : </span>}
          {pl > 0 && <span {...C} style={LABEL}> P :</span>}
          <span {...C} className={cx('d-flex', pl > 0 ? 'plus-book' : 'minus-book')}>
            {` ${pl ? num(pl) : '0.00'} `}
            {opened && inMarket && v !== 0 && (
              <span {...C} className={(back - 1) * v + (pl || 0) > 0 ? 'plus-book' : 'minus-book'}>{` ( ${(back - 1) * v + (pl || 0)} ) `}</span>
            )}
            {r.price.back[0] && !!v && !opened && inMarket && (
              <span {...C} className={pl - v > 0 ? 'plus-book' : 'minus-book'}>{` ( ${(pl || 0) - v}) `}</span>
            )}
          </span>
        </span>
      )}
      {!!v && !book && (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {opened && inMarket && (
            <span {...C} className="plus-book d-flex" style={{ marginRight: '5px' }}>
              <span {...C} style={SLIP_LABEL}>P :</span>
              <span {...C} className="plus-book">{` ${(back - 1) * v}`}</span>
            </span>
          )}
          {!opened && inMarket && (
            <span {...C} className="minus-book d-flex">
              <span {...C} style={SLIP_LABEL}>L :</span>
              <span {...C} className="minus-book">{`${v} `}</span>
            </span>
          )}
        </span>
      )}
    </span>
  );
}

/** A market card; `backLay` for the first two markets (back and lay columns). */
function Market({ table, m, backLay, info, onInfo, open }) {
  const { game, slip } = table;
  const suspended = game.status === 'SUSPEND';
  return (
    <div {...C} className="card">
      <SportbookHeader C={C} m={m} open={info === m.marketId} onInfo={onInfo} />
      <div {...C} className="col">
        <div {...C} id={backLay ? 'multiCollapseExample1' : 'multiCollapseExample2'} className="collapse multi-collapse show">
          <table {...C} className="table table-hover tbl-bets p-rltv sportbook-market-tbl">
            <tbody {...C}>
              {suspended && <div {...C} className="suspended-casino"><span {...C} className="stats-text">Suspended</span></div>}
              {m.runners.map((r) => {
                const back = r.price.back[0] || {};
                const lay = r.price.lay?.[0];
                const live = r.status === 'SUSPEND' && !suspended;
                return (
                  <Fragment key={r.selectionId}>
                    <tr {...C} className="odd-row">
                      <td {...C} className="team-name sportbook-name" style={backLay ? undefined : { width: '70%' }}>
                        <span {...C} className="title">{` ${m.runnersName[r.selectionId]} `}</span>
                        {backLay ? <BackLayBook table={table} m={m} r={r} /> : <BackBook table={table} m={m} r={r} />}
                      </td>
                      {backLay ? (
                        <>
                          <td {...C} colSpan="" appratehighlight="" className="back-1 count sportbook-minwidth p-rltv"
                            onClick={() => open(m.marketId, r.selectionId, 'back', back.price)}>
                            {live && <div {...C} className="spnd-casinouniqueLay"><span {...C} className="stats-text">Suspendeds</span></div>}
                            <a {...C} className="d-flex flex-column p-0" style={{ textDecoration: 'none', color: 'black' }}>
                              {` ${num(back.price, '1.0-2')} `}
                              <span {...C} className="d-flex justify-content-center">{back.size}</span>
                            </a>
                          </td>
                          <td {...C} colSpan="" appratehighlight="" className="lay count sportbook-minwidth p-rltv"
                            onClick={() => open(m.marketId, r.selectionId, 'lay', lay?.price)}>
                            <a {...C} className="d-flex flex-column p-0" style={{ textDecoration: 'none', color: 'black' }}>
                              {` ${num(lay?.price, '1.0-2')} `}
                              <span {...C} className="d-flex justify-content-center">{lay?.size}</span>
                            </a>
                          </td>
                        </>
                      ) : (
                        <td {...C} appratehighlight="" colSpan="2" className="back-1 count sportbook-minwidth p-rltv"
                          onClick={() => open(m.marketId, r.selectionId, 'back', back.price)}>
                          {live && <div {...C} className="onebox spnd-casinouniqueLay"><span {...C} className="stats-text">Suspended</span></div>}
                          <a {...C} className="d-flex flex-column p-0" style={{ textDecoration: 'none', color: 'black' }}>
                            {` ${num(back.price, '1.2-2')} `}
                            <span {...C} className="d-flex justify-content-center">{back.size}</span>
                          </a>
                        </td>
                      )}
                      <td {...C} className="hidden-xs" style={{ width: '15%' }}></td>
                    </tr>
                    {slip?.selectionId === r.selectionId && !suspended && (!backLay || Number(slip.price) !== 0) && (
                      <tr {...C}>
                        <td {...C} className="p-0" colSpan="4">
                          <BetSlips attrs={C} table={table} id="betslip" style={{ padding: 0 }} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * app-card32 (casino.kingexch111.com/card32/:id — 32 CARDS): the video, then
 * a table per market — WINNER and CARD COLOR with back and lay columns, CARD
 * TOTAL and LUCKY NUMBER back only — a struck price opening the slip under its
 * row, and the recent results.
 */
export default function Card32({ eventId }) {
  const table = useCasinoTable(eventId);
  const { game, results, openBetslip } = table;
  const { info, onInfo } = useTablePage(table);
  // The page's openBetslip(): the slip under the row, scrolled into view.
  const { slip } = table;
  useScrollToBetslip(slip ? `${slip.marketId}:${slip.selectionId}:${slip.betType}` : null);
  return (
    <app-card32 {...host('c32')}>
      <VideoSimple attrs={C} game={game} resultDeclared={null} />
      <div {...C} id="marketScroll" className={isDesktop ? 'overflow-hidden' : 'overflow-auto'}>
        {game.marketArr.map((m, index) => (
          <Market key={m.marketId} table={table} m={m} backLay={index < 2} info={info} onInfo={onInfo} open={openBetslip} />
        ))}
        <Results attrs={C} eventId={eventId} results={results} />
      </div>
    </app-card32>
  );
}
