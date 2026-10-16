import { Fragment } from 'react';
import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';
import useCasinoTable from '../useCasinoTable';
import { asset, t10Img } from '../cards';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import BetSlips from '../parts/BetSlips';
import { cx, num, useCollapse, useTablePage } from './teenUtil';
import { MarketHeader, PlLine } from './teenShared';

const C = ng('ctr');

// The runner names the reference gives no plain title (a suit, a card or
// nothing instead).
const NO_TITLE = new Set(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'K', 'Q', 'J', 'RED', 'BLACK', 'HEARTS',
  'DIAMONDS', 'CLUBS', 'SPADES', 'HEART KING', 'DIAMOND KING', 'CLUB KING', 'SPADE KING', 'ANY SUIT']);

// The reference picks the card art by Universe's selection ids: the 13 rank
// cards (Dragon Tiger's DRAGON / TIGER CARD), Card Race's four kings and its
// ANY SUIT runner.
const RANK_IDS = new Set(['5825901', '5825902', '5825903', '5825904', '5825905', '5825906', '5825907', '5825908',
  '5825909', '58259010', '58259011', '58259012', '58259013']);
const KING_IDS = new Set(['722345', '722375', '722335', '722325']);
const ANY_SUIT_ID = '7223026907848';

function Title({ name }) {
  if (!NO_TITLE.has(name)) return <span {...C} className="title">{` ${name} `}</span>;
  if (name === 'RED') return <span {...C} className="title">{` ${name} `}<span {...C} className="red"> ♥ ♦ </span></span>;
  if (name === 'BLACK') return <span {...C} className="title">{` ${name} ♠ ♣ `}</span>;
  if (name === 'HEARTS') return <span {...C} className="title">{` ${name} `}<span {...C} className="red"> ♥ </span></span>;
  if (name === 'DIAMONDS') return <span {...C} className="title">{` ${name} `}<span {...C} className="red"> ♦ </span></span>;
  if (name === 'CLUBS') return <span {...C} className="title">{` ${name} ♣ `}</span>;
  if (name === 'SPADES') return <span {...C} className="title">{` ${name} ♠ `}</span>;
  return null;
}

function Art({ sid, name }) {
  const id = String(sid);
  if (RANK_IDS.has(id) || KING_IDS.has(id)) {
    const src = RANK_IDS.has(id) ? t10Img(name) : asset(`cardRace/${name}.png`);
    return <span {...C} className="title"><img {...C} style={{ width: 30 }} src={src} alt="" /></span>;
  }
  if (id === ANY_SUIT_ID) {
    return (
      <span {...C} className="title">
        {` ${name} `}<span {...C} className="red"> ♥ </span>{' ♠ '}<span {...C} className="red"> ♦ </span>{'♣ '}
      </span>
    );
  }
  return null;
}

function Market({ m, table, tp, dt }) {
  const collapse = useCollapse('multi-collapse');
  const { game, slip } = table;
  const live = game.status !== 'SUSPEND';
  const tdCls = cx('team-name sportbook-name', dt && 'dTigerCustom-padding-top',
    (m.marketName === 'DRAGON CARD' || m.marketName === 'TIGER CARD') && 'dTigerCustom-remove-padding-top');
  return (
    <div {...C} className="card">
      <MarketHeader C={C} m={m} open={tp.info === m.marketId} onInfo={tp.onInfo} collapse={collapse} />
      <div {...C} className="col">
        <div {...C} ref={collapse.ref} className={collapse.className} style={collapse.style}
          id={`multiCollapseExample${m.marketId}`}>
          <table {...C} className="table table-hover tbl-bets p-rltv sportbook-market-tbl">
            {!live && <div {...C} className="suspended-casino"><span {...C} className="stats-text">Suspended</span></div>}
            {m.runners.map((r) => {
              const name = m.runnersName[r.selectionId];
              const open = slip?.selectionId === r.selectionId && slip?.marketId === m.marketId;
              const back = r.price.back[0];
              return (
                <Fragment key={r.selectionId}>
                  <tr {...C} className="odd-row">
                    <td {...C} className={tdCls} style={{ width: '70%' }}>
                      <Title name={name} />
                      <div {...C} className="d-flex align-items-center p-0">
                        <Art sid={r.selectionId} name={name} />
                        <PlLine C={C} m={m} r={r} table={table} fontSize={15} />
                      </div>
                    </td>
                    <td {...C} appratehighlight="" className={cx('back-1 count sportbook-minwidth p-rltv', open && 'active')}
                      onClick={() => tp.strike(m.marketId, r.selectionId, back.price)}>
                      {r.status === 'SUSPEND' && live && (
                        <div {...C} className="spnd-casinouniqueLay"><span {...C} className="stats-text">Suspended</span></div>
                      )}
                      <a {...C} className="d-flex flex-column p-0" style={{ textDecoration: 'none' }}>
                        {` ${num(back.price, '1.0-2')} `}
                        <span {...C} className="d-flex justify-content-center">{back.size}</span>
                      </a>
                    </td>
                    <td {...C} className="hidden-xs" style={{ width: '15%' }} />
                  </tr>
                  {open && live && (
                    <tr {...C}>
                      <td {...C} className="p-0" colSpan={4} id="betslip">
                        <BetSlips attrs={C} table={table} style={{ padding: 0 }} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * app-teenpatti (casino.kingexch111.com/casino/:id — Joker Teen Patti, Card
 * Race, Dragon Tiger): the video, then one table per market — a row per runner
 * (its name, suit or card art with its P/L, the back price box), the inline
 * slip right under the struck runner — and the recent results.
 */
export default function TeenPatti({ eventId }) {
  const table = useCasinoTable(eventId);
  const tp = useTablePage(table);
  const { game, results } = table;
  const dt = String(eventId).includes('0018');

  return (
    <app-teenpatti {...host('ctr')}>
      <div {...C} style={{ overflowY: 'hidden' }}>
        <VideoSimple attrs={C} game={game} resultDeclared={null} />
        <div {...C} id="marketScroll" style={{ overflowY: 'auto' }} className={isDesktop ? 'overflow-hidden' : 'overflow-auto'}>
          {game.marketArr.map((m) => <Market key={m.marketId} m={m} table={table} tp={tp} dt={dt} />)}
          <Results attrs={C} eventId={eventId} results={results} />
        </div>
      </div>
    </app-teenpatti>
  );
}
