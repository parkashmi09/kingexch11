import { Fragment } from 'react';
import { ng, host } from '../../ng';
import { isDesktop } from '../../exchange';
import useCasinoTable from '../useCasinoTable';
import { t10Img } from '../cards';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import BetSlips from '../parts/BetSlips';
import { cx, num, useCollapse, useTablePage } from './teenUtil';
import { SportbookHeader } from './sportbook';

const C = ng('cl7');

// The LUCKY CARD runners the reference draws a card face beside (by id).
const CARD_IDS = ['5825901', '5825902', '5825903', '5825904', '5825905', '5825906', '5825907', '5825908', '5825909', '58259010', '58259011', '58259012', '58259013'];

// The suit marks beside a runner, by its name: app-lucky7's LUCKY COLOR market
// (both of a colour's suits), its LUCKY CARD SUIT market, and the later
// markets' (whose SPADES / CLUBS marks the reference swaps).
const COLOR_MARKS = { RED: [[' ♥', true], [' ♦ ', true]], BLACK: [[' ♠ ', false], [' ♣', false]] };
const SUIT_MARKS = { HEARTS: [' ♥', true], DIAMONDS: [' ♦ ', true], SPADES: [' ♠', false], CLUBS: [' ♣ ', false] };
const CARD_SUIT_MARKS = { HEARTS: [' ♥', true], DIAMONDS: [' ♦ ', true], SPADES: [' ♣', false], CLUBS: [' ♠ ', false] };

// openBetslip()'s betslip ids by the struck runner's index.
const lcsId = (i) => (i === 0 || i === 1 ? 'lcsbetslip1' : 'lcsbetslip2');
const lcardId = (i) => `lcard1betsleip${i < 12 ? Math.floor(i / 2) + 1 : Math.floor(i / 2) + 2}`;

/** The P / L line under a runner's price box (the book, then the slip's preview). */
function RunnerBook({ table, m, r }) {
  const { slip, value, casinoPl } = table;
  const book = casinoPl[m.marketId];
  const sel = r.selectionId;
  const opened = slip?.selectionId === sel;
  const inMarket = slip?.marketId === m.marketId;
  const pl = book?.[sel];
  const price = r.price.back[0]?.price;
  return (
    <div {...C} className="d-flex align-items-center p-0">
      {book && (
        <span {...C} className="p-0" style={{ display: 'flex', fontSize: '12px', fontWeight: 400 }}>
          {pl < 0 && <span {...C} style={{ fontWeight: 'bold' }}> L : </span>}
          {pl > 0 && <span {...C} style={{ fontWeight: 'bold' }}> P :</span>}
          <span {...C} className={cx('d-flex', pl > 0 ? 'plus-book' : 'minus-book')}>
            {` ${pl ? num(pl, '1.0-2') : '0.00'} `}
            {opened && inMarket && Number(value) !== 0 && (
              <span {...C} className={(price - 1) * value + (pl || 0) > 0 ? 'plus-book' : 'minus-book'}>
                {` ( ${num((price - 1) * value + (pl || 0), '1.0-2')} ) `}
              </span>
            )}
            {r.price.back[0] && !!value && !opened && inMarket && (
              <span {...C} className={pl - value > 0 ? 'plus-book' : 'minus-book'}>
                {` ( ${num((pl || 0) - value, '1.0-2')}) `}
              </span>
            )}
          </span>
        </span>
      )}
      {!!value && !book && (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {opened && inMarket && (
            <span {...C} className="plus-book d-flex" style={{ marginRight: '5px' }}>
              <span {...C} style={{ color: 'black', marginRight: '2px', fontWeight: 'bold' }}>P :</span>
              <span {...C} className="plus-book">{` ${num((price - 1) * value, '1.0-2')}`}</span>
            </span>
          )}
          {!opened && inMarket && (
            <span {...C} className="minus-book d-flex">
              <span {...C} style={{ color: 'black', marginRight: '2px', fontWeight: 'bold' }}>L :</span>
              <span {...C} className="minus-book">{`${num(value, '1.0-2')} `}</span>
            </span>
          )}
        </span>
      )}
    </div>
  );
}

/** A runner: its name, the price box (struck → the slip), its P / L line. */
function Runner({ table, m, r, i, layout, strike }) {
  const { game, slip } = table;
  const name = m.runnersName[r.selectionId];
  const back = r.price.back[0] || {};
  const active = slip?.selectionId === r.selectionId && slip?.marketId === m.marketId;
  let marks = [];
  if (layout === 'pair') marks = COLOR_MARKS[name] ? [COLOR_MARKS[name]] : [];
  else if (SUIT_MARKS[name]) marks = [[layout === 'suit' ? SUIT_MARKS[name] : CARD_SUIT_MARKS[name]]];
  const face = layout !== 'pair' && CARD_IDS.includes(String(r.selectionId));
  return (
    <div {...C} className={layout === 'pair' ? 'col ps-0 pe-0 boxPlayer' : 'col-6 ps-0 pe-0 boxPlayer'}
      id={layout === 'suit' ? `lcs${i}` : layout === 'card' ? `lcard${i}` : undefined}>
      <div {...C} className="pb-1"><span {...C} className="title">{` ${name} `}</span></div>
      <div {...C} appratehighlight="" className={cx('back-1 oddsBox sportbook-minwidth p-rltv', active && 'active')}
        onClick={() => strike(m.marketId, r.selectionId, back.price)}>
        {r.status === 'SUSPEND' && game.status !== 'SUSPEND' && (
          <div {...C} className="spnd-casinouniqueLay"><span {...C} className="stats-text">Suspended</span></div>
        )}
        <a {...C} className="d-flex p-0 align-items-center text-center justify-content-center" style={{ textDecoration: 'none', fontWeight: 600 }}>
          {marks.map((set) => (
            <span key={set.map((s) => s[0]).join('')} {...C} className="d-flex flex-column p-0 align-items-center position-absolute" style={{ left: '10px' }}>
              {set.map(([text, red]) => <span key={text} {...C} className={red ? 'red' : undefined}>{text}</span>)}
            </span>
          ))}
          {face && (
            <span {...C} className="d-flex flex-column p-0 align-items-center position-absolute" style={{ left: '10px' }}>
              <img {...C} style={{ width: '20px' }} src={t10Img(name)} alt="" />
            </span>
          )}
          <span {...C} className="d-flex flex-column p-0 align-items-center">
            <span {...C}>{`${num(back.price, '1.0-2')} `}</span>
            <span {...C} className="d-flex justify-content-center" style={{ fontSize: '11px', fontWeight: 400 }}>{back.size}</span>
          </span>
        </a>
      </div>
      <RunnerBook table={table} m={m} r={r} />
    </div>
  );
}

/** One market card: the header, then its runners in the layout its place gives it. */
function Market({ table, m, index, info, onInfo, strike }) {
  const { game, slip } = table;
  const collapse = useCollapse();
  const suspended = game.status === 'SUSPEND';
  const layout = index < 3 ? 'pair' : index === 3 ? 'suit' : 'card';
  // The struck runner's name (the reference's marketName): a TIE keeps the slip shut.
  const struckName = slip ? m.runnersName[slip.selectionId] : undefined;
  return (
    <>
      <SportbookHeader C={C} m={m} extra={index >= 3 ? '111' : undefined} collapse={collapse} open={info === m.marketId} onInfo={onInfo} />
      <div {...C} className="col">
        <div {...C} ref={collapse.ref} className={collapse.className === 'collapse show' ? 'collapse multi-collapse show' : `${collapse.className} multi-collapse`} style={collapse.style}
          id={`multiCollapseExample${m.marketId}`}>
          <div {...C} className="tbl-bets p-rltv sportbook-market-tbl">
            {suspended && <div {...C} className="suspended-casino"><span {...C} className="stats-text">Suspended</span></div>}
            <div {...C} className={layout === 'pair' ? 'd-flex odd-row playerABgTie' : 'd-flex flex-wrap odd-row playerABgTie'}>
              {m.runners.map((r, i) => (
                <Fragment key={r.selectionId}>
                  <Runner table={table} m={m} r={r} i={i} layout={layout} strike={strike} />
                  {layout !== 'pair' && slip?.marketId === m.marketId && slip?.selectionId === r.selectionId && (
                    <div {...C} className="col-12 pt-2" id={layout === 'suit' ? lcsId(i) : lcardId(i)}>
                      <BetSlips attrs={C} table={table} style={{ padding: 0 }} />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
            {layout === 'pair' && struckName !== 'TIE' && slip?.marketId === m.marketId && !suspended && (
              <div {...C} className="odd-row">
                <div {...C} className="col-12 p-0" id="betslip">
                  <BetSlips attrs={C} table={table} style={{ padding: 0 }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * app-lucky7 (casino.kingexch111.com/lucky7/:id — LUCKY 7): the video, then a
 * card per market — the first three (WINNER, LUCKY ODD/EVEN, LUCKY COLOR) as a
 * pair of price boxes, LUCKY CARD SUIT and LUCKY CARD two to a row, each with
 * its suit mark / card face — a struck price opening the slip under its
 * market (or under the runner, from the fourth market on), and the recent
 * results.
 */
export default function Lucky7({ eventId }) {
  const table = useCasinoTable(eventId);
  const { game, results } = table;
  const { info, onInfo, strike } = useTablePage(table);
  return (
    <app-lucky7 {...host('cl7')}>
      <div {...C} style={{ overflowY: 'hidden' }}>
        <VideoSimple attrs={C} game={game} resultDeclared={null} />
        <div {...C} id="marketScroll" style={{ overflowY: 'auto' }} className={isDesktop ? 'overflow-hidden' : 'overflow-auto'}>
          {game.marketArr.map((m, index) => (
            <div key={m.marketId} {...C} className="card">
              <Market table={table} m={m} index={index} info={info} onInfo={onInfo} strike={strike} />
            </div>
          ))}
          <Results attrs={C} eventId={eventId} results={results} />
        </div>
      </div>
    </app-lucky7>
  );
}
