import { Fragment, useEffect, useLayoutEffect, useRef } from 'react';
import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';
import useCasinoTable from '../useCasinoTable';
import { t10Img } from '../cards';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import BetSlips from '../parts/BetSlips';
import { cx, num, useCollapse } from './teenUtil';

const C = ng('c1t');

const NO_TITLE = new Set(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'K', 'Q', 'J', 'RED', 'BLACK', 'HEARTS',
  'DIAMONDS', 'CLUBS', 'SPADES']);
// The rank cards' art goes by Universe's selection ids.
const RANK_IDS = new Set(['5825901', '5825902', '5825903', '5825904', '5825905', '5825906', '5825907', '5825908',
  '5825909', '58259010', '58259011', '58259012', '58259013']);
const int = (v) => parseInt(v, 10);

function Title({ name }) {
  if (!NO_TITLE.has(name)) return <span {...C} className="title">{` ${name} `}</span>;
  if (name === 'RED') return <span {...C} className="title d-flex">{` ${name} `}<span {...C} className="red"> ♥ ♦ </span></span>;
  if (name === 'BLACK') return <span {...C} className="title">{` ${name} ♠ ♣ `}</span>;
  if (name === 'HEARTS') return <span {...C} className="title d-flex">{` ${name} `}<span {...C} className="red"> ♥ </span></span>;
  if (name === 'DIAMONDS') return <span {...C} className="title d-flex">{` ${name} `}<span {...C} className="red"> ♦ </span></span>;
  if (name === 'CLUBS') return <span {...C} className="title d-flex">{` ${name} ♣ `}</span>;
  if (name === 'SPADES') return <span {...C} className="title">{` ${name} ♠ `}</span>;
  return null;
}

// The P/L lines under a runner: the market's book (casinoPl) with what the
// open slip's stake would make of it — back or lay — or, no book yet, the open
// slip's P / L alone.
function PlLines({ m, r, table }) {
  const { casinoPl, value: v, slip } = table;
  const book = casinoPl[m.marketId];
  const bp = r.price.back[0]?.price;
  const lp = r.price.lay[0]?.price;
  const isOpen = slip?.selectionId === r.selectionId;
  const inMarket = slip?.marketId === m.marketId;
  const open = isOpen && inMarket;
  const type = slip?.betType;
  const cls = (x) => (x > 0 ? 'plus-book' : 'minus-book');
  const pl = book?.[r.selectionId];
  return (
    <>
      {book && (
        <span {...C} className="p-0" style={{ display: 'flex', fontSize: 15, fontWeight: 400 }}>
          {pl < 0 && <span {...C} style={{ fontWeight: 'bold' }}> L : </span>}
          {pl > 0 && <span {...C} style={{ fontWeight: 'bold' }}> P :</span>}
          <span {...C} className={cx('d-flex', cls(pl))}>
            {` ${pl ? num(pl, '1.2-2') : '0.00'} `}
            {open && Number(v) !== 0 && type === 'back' && (
              <span {...C} className={cls((bp - 1) * v + pl)}>{` ( ${num((bp - 1) * v + int(pl), '1.2-2')} ) `}</span>
            )}
            {r.price.back[0] && !!v && !isOpen && type === 'back' && (
              <span {...C} className={cls(pl - v)}>{` ( ${num(int(pl) - int(v), '1.2-2')}) `}</span>
            )}
            {open && Number(v) !== 0 && type === 'lay' && (
              <span {...C} className={(lp - 1) * v - (pl || 0) > 0 ? 'minus-book' : 'plus-book'}>
                {` ( ${num((lp - 1) * v - (pl ? int(pl) : 0), '1.2-2')} ) `}
              </span>
            )}
            {r.price.lay[0] && !!v && !isOpen && inMarket && type === 'lay' && (
              <span {...C} className={cls((pl ? int(pl) : 0) + int(v))}>{` (${(pl ? int(pl) : 0) + int(v)}) `}</span>
            )}
          </span>
        </span>
      )}
      {!!v && !book && type === 'back' && (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {open && (
            <span {...C} className="plus-book d-flex" style={{ marginRight: 5 }}>
              <span {...C} style={{ color: 'black', marginRight: 2, fontWeight: 'bold' }}>P :</span>
              <span {...C} className="plus-book">{` ${num((bp - 1) * v, '1.2-2')}`}</span>
            </span>
          )}
          {!isOpen && inMarket && (
            <span {...C} className="minus-book d-flex">
              <span {...C} style={{ color: 'black', marginRight: 2, fontWeight: 'bold' }}>L :</span>
              <span {...C} className="minus-book">{`${num(v, '1.2-2')} `}</span>
            </span>
          )}
        </span>
      )}
      {!!v && !book && type === 'lay' && (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {open && (
            <span {...C} className="minus-book d-flex" style={{ marginRight: 5 }}>
              <span {...C} style={{ color: 'black', marginRight: 2, fontWeight: 'bold' }}>L :</span>
              <span {...C} className="minus-book">{` ${num((lp - 1) * v, '1.2-2')}`}</span>
            </span>
          )}
          {!isOpen && inMarket && (
            <span {...C} className="plus-book d-flex">
              <span {...C} style={{ color: 'black', marginRight: 2, fontWeight: 'bold' }}>P :</span>
              <span {...C} className="plus-book">{`${num(v, '1.2-2')} `}</span>
            </span>
          )}
        </span>
      )}
    </>
  );
}

function Market({ m, table }) {
  const collapse = useCollapse('multi-collapse');
  const { game, slip, openBetslip } = table;
  const live = game.status !== 'SUSPEND';
  return (
    <div {...C} className="card">
      <span {...C} className={cx('btn btn-primary card-header inner-sportbook', !collapse.expanded && 'collapsed')}
        data-bs-toggle="collapse" data-bs-target={`#multiCollapseExample1${m.marketId}`} role="button"
        aria-expanded={collapse.expanded ? 'true' : 'false'} aria-controls="multiCollapseExample1" onClick={collapse.toggle}>
        <span {...C}><strong {...C}>{m.marketName}</strong></span>
        <span {...C} />
      </span>
      <div {...C} className="col">
        <div {...C} ref={collapse.ref} className={collapse.className} style={collapse.style}
          id={`multiCollapseExample1${m.marketId}`}>
          <table {...C} className="table table-hover tbl-bets p-rltv sportbook-market-tbl">
            <colgroup {...C}>
              <col {...C} span={1} width="60%" />
              <col {...C} className="back-1 count" span={1} width="20%" />
              <col {...C} className="back-1 count" span={1} width="20%" />
            </colgroup>
            <tr {...C}>
              <th {...C} className="min-max-mobile d-flex justify-content-center">
                <dl {...C} className="fancy-info" id="minMaxBox">
                  <dt {...C}>Min/Max {' '}</dt>
                  <dd {...C} id="minMaxInfo">{` ${m.min} - ${m.max} `}</dd>
                </dl>
              </th>
              <th {...C} className="back-1 count">Back</th>
              <th {...C} className="lay">Lay</th>
            </tr>
            {m.runners.map((r) => {
              const name = m.runnersName[r.selectionId];
              const struck = slip?.selectionId === r.selectionId && slip?.marketId === m.marketId;
              const back = r.price.back[0];
              const lay = r.price.lay[0];
              return (
                <Fragment key={r.selectionId}>
                  {!live && <div {...C} className="suspended-casino"><span {...C} className="stats-text">Suspended</span></div>}
                  <tr {...C} className="odd-row">
                    <td {...C} className="team-name sportbook-name">
                      <Title name={name} />
                      {RANK_IDS.has(String(r.selectionId)) && (
                        <span {...C} className="title"><img {...C} style={{ width: 30 }} src={t10Img(name)} alt="" /></span>
                      )}
                      <PlLines m={m} r={r} table={table} />
                    </td>
                    <td {...C} appratehighlight="" className={cx('back-1 count sportbook-minwidth p-rltv', struck && slip.betType === 'back' && 'active')}
                      onClick={() => openBetslip(m.marketId, r.selectionId, 'back', back?.price)}>
                      {r.status === 'SUSPEND' && live && (
                        <div {...C} className="spnd-casinouniqueLay"><span {...C} className="stats-text">Suspended</span></div>
                      )}
                      <a {...C} className="d-flex flex-column p-0" style={{ textDecoration: 'none', color: 'black' }}>
                        {` ${num(back?.price, '1.2-2')} `}
                        <span {...C} className="d-flex justify-content-center">{back?.size}</span>
                      </a>
                    </td>
                    <td {...C} appratehighlight="" className={cx('lay count sportbook-minwidth p-rltv', struck && slip.betType === 'lay' && 'active')}
                      onClick={() => openBetslip(m.marketId, r.selectionId, 'lay', lay?.price)}>
                      <a {...C} className="d-flex flex-column p-0" style={{ textDecoration: 'none', color: 'black' }}>
                        {` ${num(lay?.price, '1.2-2')} `}
                        <span {...C} className="d-flex justify-content-center">{lay?.size}</span>
                      </a>
                    </td>
                  </tr>
                  {slip?.selectionId === r.selectionId && live && Number(slip.price) !== 0 && (
                    <tr {...C}>
                      <td {...C} className="p-0" colSpan={3}>
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
 * app-one-day-dragon-tiger (casino.kingexch111.com/oneteenpatti/:id — 1Day
 * Teen Patti): the video, then one table per market with Min/Max over Back and
 * Lay columns — a row per runner (name and P/L, its back and lay boxes), the
 * inline slip under the struck runner — and the recent results.
 */
export default function OneTeenPatti({ eventId }) {
  const table = useCasinoTable(eventId);
  const { game, results, slip, closeBetslip } = table;
  const target = useRef(null);

  // The reference publishes the video block's height as --heightTop.
  useLayoutEffect(() => {
    if (target.current) document.documentElement.style.setProperty('--heightTop', `${target.current.offsetHeight}px`);
  }, []);

  useEffect(() => {
    if (game.status === 'SUSPEND' && slip) closeBetslip();
  }, [game.status, slip, closeBetslip]);

  return (
    <app-one-day-dragon-tiger {...host('c1t')}>
      <div {...C} className="">
        <div {...C} ref={target}>
          <VideoSimple attrs={C} game={game} resultDeclared={null} />
        </div>
        <div {...C} className={isDesktop ? '' : 'scrollMarket'}>
          {game.marketArr.map((m) => <Market key={m.marketId} m={m} table={table} />)}
          <Results attrs={C} eventId={eventId} results={results} />
        </div>
      </div>
    </app-one-day-dragon-tiger>
  );
}
