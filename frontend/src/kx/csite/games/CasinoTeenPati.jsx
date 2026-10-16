import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';
import useCasinoTable from '../useCasinoTable';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import BetSlips from '../parts/BetSlips';
import { cx, num, useCollapse, useTablePage } from './teenUtil';
import { MarketHeader, PlLine } from './teenShared';

const C = ng('ctp');

// The runner names the reference shows without a title over the price box.
const NO_TITLE = new Set(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'K', 'Q', 'J', 'RED', 'BLACK', 'HEARTS',
  'DIAMONDS', 'CLUBS', 'SPADES', 'HEART KING', 'DIAMOND KING', 'CLUB KING', 'SPADE KING', 'ANY SUIT']);

function Runner({ m, r, table, tp }) {
  const { game, slip } = table;
  const name = m.runnersName[r.selectionId];
  const active = slip?.selectionId === r.selectionId && slip?.marketId === m.marketId;
  const back = r.price.back[0];
  return (
    <div {...C} className="col ps-0 pe-0 boxPlayer">
      <div {...C} className="pb-1">
        {!NO_TITLE.has(name) && <span {...C} className="title">{` ${name} `}</span>}
      </div>
      <div {...C} appratehighlight="" className={cx('back-1 oddsBox sportbook-minwidth p-rltv', active && 'active')}
        onClick={() => tp.strike(m.marketId, r.selectionId, back.price)}>
        {r.status === 'SUSPEND' && game.status !== 'SUSPEND' && (
          <div {...C} className="spnd-casinouniqueLay"><span {...C} className="stats-text">Suspended</span></div>
        )}
        <a {...C} className="d-flex flex-column p-0 align-items-center" style={{ textDecoration: 'none', fontWeight: 600 }}>
          {` ${num(back.price, '1.0-2')} `}
          <span {...C} className="d-flex justify-content-center" style={{ fontSize: 11, fontWeight: 400 }}>{back.size}</span>
        </a>
      </div>
      <div {...C} className="d-flex align-items-center p-0">
        <PlLine C={C} m={m} r={r} table={table} fontSize={12} />
      </div>
    </div>
  );
}

function SlipRow({ table }) {
  return (
    <div {...C} className="odd-row">
      <div {...C} className="col-12 p-0" id="betslip">
        <BetSlips attrs={C} table={table} style={{ padding: 0 }} />
      </div>
    </div>
  );
}

function Market({ m, table, tp }) {
  const collapse = useCollapse('multi-collapse');
  const { game, slip } = table;
  const live = game.status !== 'SUSPEND';
  // The reference keeps the struck runner's name and puts the slip under the
  // TIE row when that is the one struck.
  const slipName = slip ? m.runnersName[slip.selectionId] : null;
  const slipHere = slip && slip.marketId === m.marketId && live;
  return (
    <div {...C} className="card">
      <MarketHeader C={C} m={m} open={tp.info === m.marketId} onInfo={tp.onInfo} collapse={collapse} />
      <div {...C} className="col">
        <div {...C} ref={collapse.ref} className={collapse.className} style={collapse.style}
          id={`multiCollapseExample${m.marketId}`}>
          <div {...C} className="tbl-bets p-rltv sportbook-market-tbl">
            {!live && <div {...C} className="suspended-casino"><span {...C} className="stats-text">Suspended</span></div>}
            <div {...C} className="d-flex odd-row playerABgTie">
              {m.runners.filter((r) => m.runnersName[r.selectionId] !== 'TIE').map((r) => (
                <Runner key={r.selectionId} m={m} r={r} table={table} tp={tp} />
              ))}
            </div>
            {slipHere && slipName !== 'TIE' && <SlipRow table={table} />}
            {m.runners.length > 2 && (
              <div {...C} className="d-flex odd-row playerABgTie">
                {m.runners.filter((r) => m.runnersName[r.selectionId] === 'TIE').map((r) => (
                  <Runner key={r.selectionId} m={m} r={r} table={table} tp={tp} />
                ))}
              </div>
            )}
            {slipHere && slipName === 'TIE' && <SlipRow table={table} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * app-casino-teen-pati (casino.kingexch111.com/casino3Patti/:id — 20-20
 * Teenpatti, 20-20 Dragon Tiger): the video, then one card per market — a
 * gradient row of runner columns (name, price box, P/L) with TIE on a second
 * row, the inline slip under the row of the struck runner — and the recent
 * results.
 */
export default function CasinoTeenPati({ eventId }) {
  const table = useCasinoTable(eventId);
  const tp = useTablePage(table);
  const { game, results } = table;

  return (
    <app-casino-teen-pati {...host('ctp')}>
      <div {...C} style={{ overflowY: 'hidden' }}>
        <VideoSimple attrs={C} game={game} resultDeclared={null} />
        <div {...C} id="marketScroll" style={{ overflowY: 'auto' }} className={isDesktop ? 'overflow-hidden' : 'overflow-auto'}>
          {game.marketArr.map((m) => <Market key={m.marketId} m={m} table={table} tp={tp} />)}
          <Results attrs={C} eventId={eventId} results={results} />
        </div>
      </div>
    </app-casino-teen-pati>
  );
}
