import { Fragment, useState } from 'react';
import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';
import useCasinoTable from '../useCasinoTable';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import BetSlips from '../parts/BetSlips';
import { asset, lucky7Img } from '../cards';
import { num, shortNumber, useMarketScroll, useScrollToBetslip } from './tableKit';

const C = ng('cdt');

const CARD_MARKETS = ['DRAGON CARD', 'TIGER CARD', 'LION CARD'];
const LABEL = { color: '#aaafb5', marginRight: 2, fontWeight: 'bold' };

// A rank card's art: the runner name's last character ("DRAGON 7" → 7), or the
// last two when it ends in 0 ("DRAGON 10").
const rankOf = (name) => (String(name ?? '').slice(-1) !== '0' ? String(name ?? '').slice(-1) : String(name ?? '').slice(-2));

/** The P&L under a row's name: the market's book (casinoPl) or the open slip's P / L. */
function RowPl({ m, r, table }) {
  const { casinoPl, slip } = table;
  const v = Number(table.value) || 0;
  const book = casinoPl[m.marketId];
  const pl = book?.[r.selectionId];
  const opened = slip?.selectionId ?? '';
  const inMarket = slip?.marketId === m.marketId;
  const price = r.price.back[0]?.price;
  return (
    <>
      {book && (
        <span {...C} className="p-0" style={{ display: 'flex', fontSize: 15, fontWeight: 400 }}>
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
              <span {...C} style={LABEL}>P :</span>
              <span {...C} className="plus-book">{` ${num((price - 1) * v, '1.0-2')}`}</span>
            </span>
          )}
          {opened !== r.selectionId && inMarket && (
            <span {...C} className="minus-book d-flex">
              <span {...C} style={LABEL}>L :</span>
              <span {...C} className="minus-book">{`${num(v, '1.0-2')} `}</span>
            </span>
          )}
        </span>
      )}
    </>
  );
}

/** The short P&L under a rank card. */
function CardPl({ m, r, table }) {
  const { casinoPl, slip } = table;
  const v = Number(table.value) || 0;
  const book = casinoPl[m.marketId];
  const pl = book?.[r.selectionId];
  const opened = slip?.selectionId ?? '';
  const inMarket = slip?.marketId === m.marketId;
  return (
    <>
      {book && (
        <span {...C} className="p-0" style={{ display: 'flex', fontSize: 12, fontWeight: 400 }}>
          <span {...C} className={`d-flex ${pl > 0 ? 'plus-book' : 'minus-book'}`}>{` ${pl ? shortNumber(pl) : '0.00'} `}</span>
        </span>
      )}
      {v !== 0 && !book && inMarket && (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {opened === r.selectionId && (
            <span {...C} className="plus-book d-flex" style={{ marginRight: 5 }}>
              <span {...C} className="plus-book">{` ${shortNumber((r.price.back[0]?.price - 1) * v)}`}</span>
            </span>
          )}
          {opened !== r.selectionId && (
            <span {...C} className="minus-book d-flex">
              <span {...C} className="minus-book">{`${shortNumber(-v)} `}</span>
            </span>
          )}
        </span>
      )}
    </>
  );
}

/**
 * app-dtl (casino.kingexch111.com/dtl/<id>, DTL — Dragon Tiger Lion): the
 * Dragon / Tiger / Lion tabs; for the tab's player its rows (Winner, Red, Black,
 * Odd, Even) out of the WINNER / colour / odd-even markets, each with its back
 * price, then its rank-card market (A…K) under the card's single price. The
 * struck cell keeps a blue glow; the slip opens under the struck row / under
 * the cards.
 *
 * Reads game.status and game.marketArr[].{marketId, marketName, min, max,
 * runnersName, runners[].{selectionId, status, price.back[0].price}}: a row
 * belongs to the tab whose name ("DRAGON", "TIGER", "LION") its runner name
 * contains; the rank cards are the DRAGON / TIGER / LION CARD markets.
 */
export default function Dtl({ eventId }) {
  const table = useCasinoTable(eventId);
  const { game, results, slip } = table;
  const [tab, setTab] = useState('DRAGON');
  const [selectedCell, setSelectedCell] = useState('');
  const height = useMarketScroll(0.55, 0.63);
  useScrollToBetslip(slip ? `${slip.marketId}:${slip.selectionId}` : '');

  const markets = game.marketArr;
  const gameSuspended = game.status === 'SUSPEND';
  const opened = slip?.selectionId ?? '';
  const slipMarket = slip?.marketId;
  const cellClass = (r) => (r.status === 'SUSPEND' || gameSuspended ? 'suspended' : selectedCell === r.selectionId ? 'blue-shedow' : '');
  const strike = (m, r) => {
    if (r.status === 'SUSPEND') return;
    setSelectedCell(r.selectionId);
    table.openBetslip(m.marketId, r.selectionId, 'back', r.price.back[0]?.price);
  };
  const cardMarketIds = [markets[7]?.marketId, markets[8]?.marketId, markets[9]?.marketId];

  return (
    <app-dtl {...host('cdt')}>
      <div {...C} style={{ overflowY: 'hidden' }}>
        <div {...C}>
          <VideoSimple attrs={C} game={game} resultDeclared={null} />
        </div>
        <div {...C} id="marketScroll" style={{ overflowY: 'auto', height }} className={isDesktop ? 'overflow-hidden' : 'overflow-auto'}>
          <div {...C} className="main-container">
            <div {...C} className="tab-con">
              <ul {...C} className="nav nav-tabs">
                {[['DRAGON', 'Dragon'], ['TIGER', 'Tiger'], ['LION', 'Lion']].map(([key, label]) => (
                  <li {...C} key={key} className="nav-item" onClick={() => setTab(key)}>
                    <a {...C} className={`nav-link${tab === key ? ' active' : ''}`}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <table {...C}>
              {markets.map((m) => m.runners.map((r) => {
                const name = m.runnersName[r.selectionId] ?? '';
                if (!name.includes(tab)) return null;
                return (
                  <Fragment key={`${m.marketId}:${r.selectionId}`}>
                    {!CARD_MARKETS.includes(m.marketName) && (
                      <tr {...C} className="table-row">
                        <td {...C} className="col">
                          <div {...C} className="value-col">
                            {m.marketName === 'WINNER' && <div {...C}><b {...C}>Winner</b></div>}
                            {m.marketName !== 'WINNER' && !name.includes('BLACK') && !name.includes('RED') && (
                              <div {...C}><b {...C}>{name.includes('EVEN') ? 'Even' : 'Odd'}</b></div>
                            )}
                            {name.includes('BLACK') && (
                              <div {...C} className="img-con">
                                <img {...C} src={asset('andarBahar/CLUBS.png')} alt="cards-red" />
                                <img {...C} src={asset('andarBahar/SPADES.png')} alt="cards-balck" />
                              </div>
                            )}
                            {name.includes('RED') && (
                              <div {...C} className="img-con">
                                <img {...C} src={asset('andarBahar/HEARTS.png')} alt="cards-red" />
                                <img {...C} src={asset('andarBahar/DIAMONDS.png')} alt="cards-balck" />
                              </div>
                            )}
                            <div {...C}>
                              <span {...C}><RowPl m={m} r={r} table={table} /></span>
                            </div>
                          </div>
                        </td>
                        <td {...C} onClick={() => strike(m, r)}>
                          <div {...C} className={`value${cellClass(r) ? ` ${cellClass(r)}` : ''}`}>
                            <b {...C}>{num(r.price.back[0]?.price, '1.0-2')}</b>
                          </div>
                        </td>
                        <td {...C} className="desk-value d-none-mbl">
                          <div {...C} className="emptyvalue" />
                        </td>
                      </tr>
                    )}
                    {!cardMarketIds.includes(slipMarket) && opened === r.selectionId && slipMarket === m.marketId && !gameSuspended && (
                      <tr {...C}>
                        <td {...C} className="p-0" colSpan={4} id="betslip">
                          <BetSlips attrs={{ ...C, style: { padding: 0 } }} table={table} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              }))}
            </table>
            {markets.map((m) => (CARD_MARKETS.includes(m.marketName) && m.marketName.includes(tab) ? (
              <Fragment key={m.marketId}>
                <div {...C} className="second-sec-container">
                  <div {...C} className="txt-con">
                    <div {...C} className="txt"><b {...C}>{m.runners[0]?.price.back[0]?.price}</b></div>
                  </div>
                  <div {...C} className="card-container">
                    {m.runners.map((r) => (
                      <div {...C} key={r.selectionId} className="card-image" onClick={() => strike(m, r)}>
                        <div {...C} className={cellClass(r) || undefined}>
                          <img {...C} src={lucky7Img(rankOf(m.runnersName[r.selectionId]))} />
                        </div>
                        <div {...C} className="ubook text-center m-t-5 text-success h-18" style={{ width: 35 }}>
                          <CardPl m={m} r={r} table={table} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {slipMarket === m.marketId && !gameSuspended && (
                  <div {...C} className="mt-3" id="betslip" style={{ padding: 0 }}>
                    <BetSlips attrs={C} table={table} />
                  </div>
                )}
              </Fragment>
            ) : null))}
            <Results attrs={C} eventId={eventId} results={results} />
          </div>
        </div>
      </div>
    </app-dtl>
  );
}
