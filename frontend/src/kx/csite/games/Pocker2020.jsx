import { Fragment } from 'react';
import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';
import useCasinoTable from '../useCasinoTable';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import BetSlips from '../parts/BetSlips';
import { num, useMarketScroll, useScrollToBetslip, useInfoDropdown, usePlaceDropdown } from './tableKit';

const C = ng('cpk');

/**
 * The P&L line under a runner's price (profitloss / profitloss2): with a book
 * for the market (casinoPl) its P / L and, while a stake is typed in the open
 * slip, what the stake would make of it; without a book, the open slip's P
 * (struck runner) or L (the market's other runner) alone.
 */
function ProfitLoss({ cls, m, r, table }) {
  const { casinoPl, slip } = table;
  const v = Number(table.value) || 0;
  const book = casinoPl[m.marketId];
  const pl = book?.[r.selectionId];
  const opened = slip?.selectionId ?? '';
  const inMarket = slip?.marketId === m.marketId;
  const price = r.price.back[0]?.price;
  return (
    <div {...C} className={cls}>
      {book && (
        <span {...C} className="p-0" style={{ display: 'flex', fontWeight: 400 }}>
          {pl < 0 && <span {...C} style={{ fontWeight: 'bold' }}> L : </span>}
          {pl > 0 && <span {...C} style={{ fontWeight: 'bold' }}> P :</span>}
          <span {...C} className={`d-flex ${pl > 0 ? 'plus-book' : 'minus-book'}`}>
            {` ${pl ? num(pl, '1.0-2') : '0.00'} `}
            {opened === r.selectionId && inMarket && v !== 0 && (
              <span {...C} className={(price - 1) * v + (pl || 0) > 0 ? 'plus-book' : 'minus-book'}>
                {` ( ${num((price - 1) * v + (pl || 0), '1.0-2')} ) `}
              </span>
            )}
            {r.price.back[0] && v !== 0 && opened !== r.selectionId && inMarket && (
              <span {...C} className={pl - v > 0 ? 'plus-book' : 'minus-book'}>
                {` ( ${num((pl || 0) - v, '1.0-2')}) `}
              </span>
            )}
          </span>
        </span>
      )}
      {v !== 0 && !book && (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {opened === r.selectionId && inMarket && (
            <span {...C} className="plus-book d-flex" style={{ marginRight: 5 }}>
              <span {...C} style={{ color: 'black', marginRight: 2, fontWeight: 'bold' }}>P :</span>
              <span {...C} className="plus-book">{` ${num((price - 1) * v, '1.0-2')}`}</span>
            </span>
          )}
          {opened !== r.selectionId && inMarket && (
            <span {...C} className="minus-book d-flex">
              <span {...C} style={{ color: 'black', marginRight: 2, fontWeight: 'bold' }}>L :</span>
              <span {...C} className="minus-book">{`${num(v, '1.0-2')} `}</span>
            </span>
          )}
        </span>
      )}
    </div>
  );
}

/**
 * app-pocker2020 (casino.kingexch111.com/pocker2020/<id>, 20-20 POKER): the
 * PLAYER A / PLAYER B header, then one panel per hand market (WINNER, ONE PAIR,
 * … STRAIGHT FLUSH) with Player A's and Player B's back price side by side, the
 * Min/Max info dropdown, the round's Suspended overlay, the P&L under each
 * price and the inline bet slip under the panel whose price was struck.
 *
 * Reads game.status and game.marketArr[].{marketId, marketName, min, max,
 * runners[].{selectionId, price.back[0].{price, size}}} (runner 0 = Player A).
 */
export default function Pocker2020({ eventId }) {
  const table = useCasinoTable(eventId);
  const { game, results, slip } = table;
  const height = useMarketScroll(0.62, 0.63);
  const [info, toggleInfo] = useInfoDropdown();
  usePlaceDropdown(info);
  useScrollToBetslip(slip ? `${slip.marketId}:${slip.selectionId}` : '');

  const suspended = game.status === 'SUSPEND';

  return (
    <app-pocker2020 {...host('cpk')}>
      <div {...C} style={{ overflowY: 'hidden' }}>
        <VideoSimple attrs={C} game={game} resultDeclared={null} />
        <div {...C} className="poker-con">
          <div {...C} className="row">
            <div {...C} className="col-6 playerA"><span {...C}>player A</span></div>
            <div {...C} className="col-6 playerB"><span {...C}>Player B</span></div>
          </div>
        </div>
        <div {...C} id="marketScroll" style={{ overflowY: 'auto', height }} className={isDesktop ? 'overflow-hidden' : 'overflow-auto'}>
          <div {...C}>
            {game.marketArr.map((m) => (
              <div {...C} key={m.marketId}>
                <div {...C} className="row">
                  <div {...C}>
                    <div {...C} className="win-mark-con col-12">
                      <span {...C} className="market-name-section" style={{ position: 'absolute', textAlign: 'center', paddingTop: '3.5px' }}>
                        <b {...C}>{m.marketName}</b>
                        <span {...C} className="minMaxMbl-desk">
                          <i
                            {...C}
                            data-bs-toggle="dropdown"
                            aria-expanded={info === m.marketId ? 'true' : 'false'}
                            className={`fa fa-info-circle ml-2${info === m.marketId ? ' show' : ''}`}
                            data-bs-target="#collapse121"
                            id={`#collapse12${m.marketId}`}
                            onClick={toggleInfo(m.marketId)}
                          />
                          <ul {...C} data-kc-pop="" className={`dropdown-menu icon-range min-max-info text-end tooltip-betlimit${info === m.marketId ? ' show' : ''}`} aria-labelledby={`collapse12${m.marketId}`}>
                            <span {...C}>{`Min/Max: ${m.min} - ${m.max} `}</span>
                          </ul>
                        </span>
                      </span>
                      {m.runners.map((r, i) => {
                        const price = r.price.back[0];
                        const active = slip?.selectionId === r.selectionId && slip?.marketId === m.marketId;
                        return (
                          <Fragment key={r.selectionId}>
                            {suspended && (
                              <div {...C} className="suspended-casino poker-suspnd">
                                <span {...C} className="stats-text">Suspended</span>
                              </div>
                            )}
                            <div {...C} className="d-flex justify-content-between dyna-pos">
                              <div
                                {...C}
                                appratehighlight=""
                                className={`back-1 count sportbook-minwidth p-rltv${active ? ' active' : ''}`}
                                onClick={() => table.openBetslip(m.marketId, r.selectionId, 'back', price?.price)}
                              >
                                <div {...C} className="inside-back">
                                  <a {...C} className="d-flex flex-column p-0" style={{ textDecoration: 'none' }}>
                                    <b {...C} className="inside-back-price" style={{ fontSize: 16, position: 'relative', top: 2 }}>{num(price?.price, '1.0-2')}</b>
                                    <span {...C} className="d-flex justify-content-center inside-back-size" style={{ position: 'relative', bottom: 2 }}>{price?.size}</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                            {i === 0 && <ProfitLoss cls="profitloss" m={m} r={r} table={table} />}
                            {i === 1 && <ProfitLoss cls="profitloss2" m={m} r={r} table={table} />}
                          </Fragment>
                        );
                      })}
                    </div>
                    {slip?.marketId === m.marketId && !suspended && (
                      <div {...C}>
                        <div {...C} className="p-0" id="betslip">
                          <BetSlips attrs={{ ...C, style: { padding: 0 } }} table={table} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Results attrs={C} eventId={eventId} results={results} />
        </div>
      </div>
    </app-pocker2020>
  );
}
