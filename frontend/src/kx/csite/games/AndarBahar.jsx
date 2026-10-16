import { useEffect } from 'react';
import { ng, host } from '../../ng';
import { isDesktop, isMobile } from '../../exchange';
import useCasinoTable from '../useCasinoTable';
import { asset, lucky7Img } from '../cards';
import VideoSimple from '../parts/VideoSimple';
import Results from '../parts/Results';
import BetSlips from '../parts/BetSlips';
import { cx, num, shortNumber, useTablePage } from './teenUtil';

const C = ng('cab');

const BOLD = { fontWeight: 'bold' };
const SLIP_LABEL = { marginRight: '2px', fontWeight: 'bold' };
const SUIT_LABEL = { color: '#000', marginRight: '2px', fontWeight: 'bold' };
const SUIT_SLIP_LABEL = { color: 'rgb(0, 0, 0)', marginRight: '2px', fontWeight: 'bold' };
const CENTER = { display: 'flex', justifyContent: 'center' };

const Zero = ({ style }) => <span {...C} className="zeroPL" style={style}> 0</span>;

/**
 * The P / L under a box, the reference's three-way: the market's book when it
 * has one; else, while a slip is open in this market with a stake, the
 * preview (P on the struck runner, L on the rest); else "0".
 * `book` / `preview` render those two lines for the box.
 */
function Pl({ table, m, r, book, preview, zeroStyle }) {
  const { slip, value, casinoPl } = table;
  const mBook = casinoPl[m?.marketId];
  const inMarket = !!slip && slip.marketId === m?.marketId;
  const opened = inMarket && slip.selectionId === r?.selectionId;
  const pl = mBook?.[r?.selectionId];
  return (
    <>
      {mBook && book(pl)}
      {value && !mBook && inMarket ? preview(opened, Number(value)) : !mBook && <Zero style={zeroStyle} />}
    </>
  );
}

/** The A / B boxes' and ODD / EVEN boxes' book line. */
const bookLine = (pl, extra) => (
  <span {...C} className="" style={CENTER}>
    {pl < 0 && <span {...C} style={BOLD}> L : </span>}
    {pl > 0 && <span {...C} style={BOLD}> P : </span>}
    <span {...C} className={cx('d-flex', pl > 0 ? 'plus-book' : 'minus-book')}>
      {` ${pl ? num(pl, '1.0-2') : '0.00'} `}
      {extra}
    </span>
  </span>
);

/** The A / B boxes' and ODD / EVEN boxes' slip preview. */
const previewLine = (price) => (opened, v) => (
  <span {...C} style={CENTER}>
    {opened && (
      <span {...C} className="plus-book d-flex" style={{ marginRight: '5px' }}>
        <span {...C} style={SLIP_LABEL}>P : </span>
        <span {...C} className="plus-book">{` ${num((price - 1) * v, '1.0-2')}`}</span>
      </span>
    )}
    {!opened && (
      <span {...C} className="minus-book d-flex">
        <span {...C} style={SLIP_LABEL}>L : </span>
        <span {...C} className="minus-book">{`${-v} `}</span>
      </span>
    )}
  </span>
);

/**
 * app-andar-bahar-casino (casino.kingexch111.com/andarBahar/:id — ANDAR
 * BAHAR): the video, the A and B rows (SIDE BET, 1st BET, 2nd BET), the ODD /
 * EVEN pair beside the four card suits, the LUCKY CARD faces A…K, a struck box
 * opening the slip under its block, and the recent results.
 *
 * Markets by place, as the reference reads them: marketArr[0] WINNER (1st A,
 * 1st B, 2nd A, 2nd B), [1] SIDE BET (A, B), [2] ODD/EVEN, [3] CARD SUIT,
 * [4] LUCKY CARD.
 */
export default function AndarBahar({ eventId }) {
  const table = useCasinoTable(eventId);
  const { game, results, slip, openBetslip, casinoPl, value } = table;
  useTablePage(table);
  const ma = game.marketArr;
  const [m0, m1, m2, m3, m4] = ma;
  const suspended = game.status === 'SUSPEND';
  const slipMarket = slip?.marketId;

  // openBetslip(): 100 ms later #marketScroll scrolls to the slip.
  const slipKey = slip ? `${slip.marketId}:${slip.selectionId}` : null;
  useEffect(() => {
    if (!slipKey) return undefined;
    const t = setTimeout(() => {
      const n = document.getElementById('marketScroll');
      const i = document.getElementById('betslip');
      if (n && i) n.scrollTo(slipMarket !== m4?.marketId ? { behavior: 'smooth', top: 0.75 * i.offsetHeight } : { behavior: 'smooth', top: i.offsetTop });
    }, 100);
    return () => clearTimeout(t);
  }, [slipKey, slipMarket, m4?.marketId]);

  const open = (m, r) => openBetslip(m?.marketId, r?.selectionId, 'back', r?.price?.back[0]?.price);
  const cell = (r, onCls = 'suspendedandar', selCls = 'isSelected') => (r?.status === 'SUSPEND' || suspended ? onCls : slip?.selectionId === r?.selectionId ? selCls : '');
  const priceOf = (r) => r?.price?.back[0]?.price;

  // An A / B box: SIDE BET, 1st BET or 2nd BET.
  const abBox = (cls, m, r) => (
    <div {...C} className={`${cls} ${r?.selectionId ?? ''}`}>
      <div {...C} className={cx('price', cell(r))} onClick={() => open(m, r)}>
        <div {...C}>{` ${m?.runnersName[r?.selectionId] ?? ''} `}</div>
        <div {...C} className="mt-1">{` ${priceOf(r) ?? ''} `}</div>
      </div>
      <div {...C} className="book">
        <span {...C} className="extra-pf">
          <div {...C} className="profitLoss">
            <Pl table={table} m={m} r={r} book={(pl) => bookLine(pl)} preview={previewLine(priceOf(r))} />
          </div>
        </span>
      </div>
    </div>
  );

  // An ODD / EVEN box (its book line also carries the slip preview).
  const oddEven = (cls, r) => {
    const pl = casinoPl[m2?.marketId]?.[r?.selectionId];
    const opened = slip?.selectionId === r?.selectionId && slipMarket === m2?.marketId;
    const v = Number(value);
    const extra = (
      <>
        {opened && v !== 0 && (
          <span {...C} className={(priceOf(r) - 1) * v + pl > 0 ? 'plus-book' : 'minus-book'}>{` ( ${(priceOf(r) - 1) * v + pl} ) `}</span>
        )}
        {r?.price?.back[0] && !!v && !opened && slipMarket === m2?.marketId && (
          <span {...C} className={pl - v > 0 ? 'plus-book' : 'minus-book'}>{` ( ${pl - v}) `}</span>
        )}
      </>
    );
    return (
      <div {...C} className={`col-6 text-center ${cls}`}>
        <div {...C} className="bltitle"><b {...C}>{` ${m2?.runnersName[r?.selectionId] ?? ''} `}</b></div>
        <div {...C} className={cx('back mt-1 blbox price', cell(r))} onClick={() => open(m2, r)}>
          <span {...C} className="odd">{` ${priceOf(r) ?? ''} `}</span>
        </div>
        <div {...C} className="mt-1">
          <span {...C} className="extra-pf">
            <div {...C} className="profitLoss">
              <Pl table={table} m={m2} r={r} book={(p) => bookLine(p, extra)} preview={previewLine(priceOf(r))} />
            </div>
          </span>
        </div>
      </div>
    );
  };

  const betslip = <BetSlips attrs={C} table={table} style={{ padding: 0 }} />;

  return (
    <app-andar-bahar-casino {...host('cab')}>
      <VideoSimple attrs={C} game={game} resultDeclared={null} />
      <div {...C} id="marketScroll" className={isDesktop ? 'overflow-hidden' : 'overflow-auto'}>
        {ma.length > 0 && (
          <>
            <div {...C} className="ab-2-container tether-target tether-element-attached-top tether-element-attached-center tether-target-attached-top tether-target-attached-center">
              <div {...C} className="bet-a">
                <div {...C} className="a-title"> A </div>
                {abBox('sa', m1, m1?.runners[0])}
                {abBox('first-bet', m0, m0?.runners[0])}
                {abBox('second-bet', m0, m0?.runners[2])}
                <div {...C} className="a-title"> A </div>
              </div>
              <div {...C} className="bet-a bet-b">
                <div {...C} className="a-title"> B </div>
                {abBox('sa', m1, m1?.runners[1])}
                {abBox('first-bet', m0, m0?.runners[1])}
                {abBox('second-bet', m0, m0?.runners[3])}
                <div {...C} className="a-title"> B </div>
              </div>
            </div>
            {(slipMarket === m0?.marketId || slipMarket === m1?.marketId) && !suspended && <div {...C} id="betslip">{betslip}</div>}
            <div {...C} className="mt-2 ab-2-containerodd">
              <div {...C} className="col-6 ab-2-box leftbox tether-target tether-element-attached-bottom tether-abutted tether-abutted-top tether-target-attached-top tether-element-attached-right tether-target-attached-right">
                <div {...C} className="row">
                  {oddEven('995566', m2?.runners[0])}
                  {oddEven('665566', m2?.runners[1])}
                </div>
              </div>
              {slipMarket === m2?.marketId && m2?.runners[0]?.status !== 'SUSPEND' && !suspended && isMobile && <div {...C} id="betslip">{betslip}</div>}
              <div {...C} className="mobile-screen col-6 ab-2-box rightbox tether-target tether-element-attached-top tether-element-attached-center tether-target-attached-top tether-target-attached-center">
                <div {...C} className="row">
                  {m3?.runners.map((r) => {
                    const name = m3.runnersName[r.selectionId];
                    return (
                      <div key={r.selectionId} {...C} className="col-3 text-center 58259772337">
                        <div {...C} className="bltitle"><img {...C} src={asset(`andarBahar/${name}.png`)} alt="" /></div>
                        <div {...C} className={cx('back mt-1 blbox price', cell(r))} onClick={() => open(m3, r)}>
                          <span {...C} className="odd">{` ${priceOf(r) ?? ''} `}</span>
                        </div>
                        <div {...C} className="mt-1">
                          <span {...C} className="extra-pf">
                            <span {...C} className="profitLoss">
                              <Pl table={table} m={m3} r={r}
                                book={(pl) => {
                                  const opened = slip?.selectionId === r.selectionId && slipMarket === m3.marketId;
                                  const v = Number(value);
                                  return (
                                    <span {...C} className="p-0" style={{ display: 'flex', fontSize: '15px', fontWeight: 400, justifyContent: 'center' }}>
                                      {pl < 0 && <span {...C} style={SUIT_LABEL}> L : </span>}
                                      {pl > 0 && <span {...C} style={SUIT_LABEL}> P :</span>}
                                      <span {...C} className={cx('d-flex', pl > 0 ? 'plus-book' : 'minus-book')}>
                                        {` ${pl ? num(pl, '1.0-2') : '0.00'} `}
                                        {opened && v !== 0 && (
                                          <span {...C} className={(priceOf(r) - 1) * v + pl > 0 ? 'plus-book' : 'minus-book'}>{` ( ${(priceOf(r) - 1) * v + pl} ) `}</span>
                                        )}
                                        {r.price.back[0] && !!v && !opened && (
                                          <span {...C} className={pl - v > 0 ? 'plus-book' : 'minus-book'}>{` ( ${pl - v}) `}</span>
                                        )}
                                      </span>
                                    </span>
                                  );
                                }}
                                preview={(opened, v) => (
                                  <span {...C} style={{ display: 'flex', padding: '6px' }}>
                                    {opened && (
                                      <span {...C} className="plus-book d-flex" style={{ marginRight: '5px' }}>
                                        <span {...C} style={SUIT_SLIP_LABEL}>P :</span>
                                        <span {...C} className="plus-book">{` ${num((priceOf(r) - 1) * v, '1.0-2')}`}</span>
                                      </span>
                                    )}
                                    {!opened && (
                                      <span {...C} className="minus-book d-flex">
                                        <span {...C} style={SUIT_SLIP_LABEL}>L :</span>
                                        <span {...C} className="minus-book">{`${-v} `}</span>
                                      </span>
                                    )}
                                  </span>
                                )} />
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div {...C} id="betslip">
                {slipMarket === m3?.marketId && !suspended && isMobile && betslip}
              </div>
            </div>
            {(slipMarket === m2?.marketId || slipMarket === m3?.marketId) && !suspended && isDesktop && <div {...C} id="betslip">{betslip}</div>}
            <div {...C} className="ab-2-box mt-2 tether-element-attached-top tether-element-attached-center tether-target-attached-top tether-target-attached-center">
              <div {...C} className="col-md-12 text-center">
                <span {...C} className="text12">{` ${priceOf(m4?.runners[0]) ?? ''} `}</span>
              </div>
              <div {...C} className="col-md-12 text-center">
                {m4?.runners.map((r) => (
                  <div key={r.selectionId} {...C} className="m-r-5 card-image price 5825901">
                    <div {...C} className={cell(r, 'suspended', 'blue-shedow')} onClick={() => open(m4, r)}>
                      <img {...C} src={lucky7Img(m4.runnersName[r.selectionId])} alt="" />
                    </div>
                    <div {...C} className="ubook text-center mb-2">
                      <span {...C} className="extra-pf">
                        <div {...C} className="ubook text-center text-success h-18" style={{ width: '34px' }}>
                          <Pl table={table} m={m4} r={r} zeroStyle={{ color: 'black' }}
                            book={(pl) => (
                              <span {...C} className="p-0" style={{ display: 'flex', fontSize: '12px', fontWeight: 400, textAlign: 'center', justifyContent: 'center', marginBottom: '3px' }}>
                                <span {...C} className={cx('d-flex', pl > 0 ? 'plus-book' : 'minus-book ms-0')}>{` ${pl ? shortNumber(pl) : '0.00'} `}</span>
                              </span>
                            )}
                            preview={(opened, v) => (
                              <span {...C} style={{ display: 'flex', padding: 0, fontSize: '12px', fontWeight: 400, textAlign: 'center', justifyContent: 'center', marginBottom: '3px' }}>
                                {opened && (
                                  <span {...C} className="plus-book d-flex" style={{ marginRight: '5px' }}>
                                    <span {...C} className="plus-book">{` ${shortNumber((priceOf(r) - 1) * v)}`}</span>
                                  </span>
                                )}
                                {!opened && (
                                  <span {...C} className="minus-book ms-0 d-flex">
                                    <span {...C} className="minus-book ms-0">{`${shortNumber(-v)} `}</span>
                                  </span>
                                )}
                              </span>
                            )} />
                        </div>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {slipMarket === m4?.marketId && !suspended && <div {...C} id="betslip">{betslip}</div>}
          </>
        )}
        <Results attrs={C} eventId={eventId} results={results} />
      </div>
    </app-andar-bahar-casino>
  );
}
