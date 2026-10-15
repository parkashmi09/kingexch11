import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import useMatchData from '../../hooks/useMatchData';
import { isCricketLimitedOvers } from '../../components/betting/placeBet/placeBetRules';
import { ng, host, KX } from '../ng';
import { toModel, shortNumber, startDate, gameTime, countdown } from './model';
import InfoIcon from './InfoIcon';
import MarketTabs from './MarketTabs';
import BetSlip from './BetSlip';

const C = ng('kmd');

const SPORT_NAME_BY_SID = { 1: 'Soccer', 2: 'Tennis', 4: 'Cricket' };
const BANNER = { 4: 'time-cricket-banner', 1: 'time-soccer-banner', 2: 'time-tennis-banner', 7: 'time-horse-banner' };

// DecimalPipe "1.2-2": grouped, two decimals.
const money = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const isOpen = (m) => m.oddsData.status === 'OPEN' || m.oddsData.status === 'ONLINE';

// The ladder's three levels each side, outermost first, as the reference lays
// them out: back 3, back 2, back 1 | lay 1, lay 2, lay 3.
const LEVELS = [['back', 2], ['back', 1], ['back', 0], ['lay', 0], ['lay', 1], ['lay', 2]];

function Cashout() {
  return (
    <div {...C} className="cashout-container empty-container">
      <span {...C} className="cashout-label">
        <span {...C} className="cashout-icon"><i {...C} className="fa fa-circle" /></span>
        Cash Out
      </span>
    </div>
  );
}

function MinMax({ m, book }) {
  const min = book && Number(m.min) === 100 ? '10' : m.min;
  return (
    <dl {...C} className="fancy-info matchoddsminmax" id="minMaxBox">
      <dt {...C}>Min/Max</dt>
      <dd {...C} id="minMaxInfo">{min}-{m.max}</dd>
    </dl>
  );
}

/**
 * app-market-details — a match's page (the reference's /fullMarket): the
 * game-time banner with its pulsing "Bet Started", the market pills (phone),
 * each book as its card — Match Odds on the exchange ladder, the bookmaker
 * books on their gradient one — then the Fancy Bet / Sportsbook block.
 * Striking a price opens the slip right under that runner, and while a stake
 * is typed every runner previews what it would win or lose.
 *
 * While the first market read is in flight the reference's two-circle
 * "Loading..." stands in for the books.
 */
export default function MarketDetails() {
  const { sid: sidParam, gmid } = useParams();
  const sid = Number(sidParam);
  const { matchData, markets, loading } = useMatchData(gmid, sid);
  const { ladders, fancy } = useMemo(() => toModel(markets), [markets]);
  const [selected, setSelected] = useState('All');
  const [slip, setSlip] = useState(null);
  const [value, setValue] = useState({ stake: 0, price: 0 });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const closeSlip = useCallback(() => { setSlip(null); setValue({ stake: 0, price: 0 }); }, []);
  const onValue = useCallback((v) => setValue(v), []);

  const eventName = (matchData?.ename || '').trim();
  const baseBet = (market, section, side, p, extra) => ({
    team: section.nat,
    betType: side,
    odds: p.price,
    size: p.size,
    market_id: market.mid,
    selectionId: section.sid,
    mname: market.mname,
    gtype: market.gtype,
    market,
    section,
    event_id: gmid,
    event_name: eventName,
    match_title: eventName,
    match_start_time: matchData?.stime || '',
    sid,
    sports: SPORT_NAME_BY_SID[sid] || 'Cricket',
    ...extra,
  });

  // A ladder price: the slip opens under that runner. A level without a
  // price closes it, as the reference's does.
  const pickLadder = (m, runner, side, index) => {
    const p = runner.price[side][index];
    if (!p || !(p.price > 0)) { closeSlip(); return; }
    const market = m._market;
    const runners = (market.section || []).map((s) => s.nat).filter(Boolean);
    setValue({ stake: 0, price: p.price });
    setSlip({
      rowId: `${runner.selectionId}_${m.exMarketId}`,
      marketId: m.exMarketId,
      selectionId: runner.selectionId,
      side,
      index,
      bet: baseBet(market, runner._section, side, p, {
        marketType: market.mname,
        runners,
        game_type: 'MATCH',
        limited_overs: isCricketLimitedOvers({ sid, cname: matchData?.cname, ename: matchData?.ename }),
        team_one: runners[0] || '',
        team_two: runners[1] || '',
      }),
    });
  };

  // A fancy line carries its own limits.
  const pickFancy = (m, side, p) => {
    const section = m._section;
    setValue({ stake: 0, price: p.price });
    setSlip({
      rowId: m.exMarketId,
      marketId: m.exMarketId,
      side,
      bet: baseBet(m._market, section, side, p, {
        marketType: 'FANCY',
        market_type: 'FANCY',
        runners: [section.nat],
        game_type: 'FANCY',
        min_stake: section.min,
        max_stake: section.max,
        team_one: '',
        team_two: '',
      }),
    });
  };

  const shown = ladders.filter((m) => (
    selected === 'All' ? m.oddsData.status !== 'CLOSED' || m.marketType === 'MATCH_ODDS'
      : selected === 'Popular' ? m.popular && (m.oddsData.status !== 'CLOSED' || m.marketType === 'MATCH_ODDS')
        : m.exMarketId === selected && m.oddsData.status !== 'CLOSED'
  ));

  // The runner's stake preview while a stake is typed on this book.
  const preview = (m, runner, per100) => {
    if (!slip || slip.marketId !== m.exMarketId || !value.stake) return null;
    const win = per100 ? (value.price / 100) * value.stake : (value.price - 1) * value.stake;
    const mine = slip.selectionId === runner.selectionId;
    const plus = mine ? slip.side === 'back' : slip.side === 'lay';
    const cls = per100 !== undefined ? (plus ? 'plus-book' : 'minus-book') : (plus ? 'plus-book matchodds' : 'minus-book matchodds');
    return (
      <span {...C} style={{ display: 'flex', padding: 0 }}>
        <span {...C} className={`d-flex ${cls}`} style={mine ? { marginRight: 5 } : undefined}>
          <span {...C} className={cls}>{mine ? `  (${money(win)})` : ` (${money(value.stake)})`}</span>
        </span>
      </span>
    );
  };

  const slipRow = (m, runner, extraTd) => {
    const open = slip && slip.marketId === m.exMarketId && slip.selectionId === runner.selectionId && isOpen(m);
    return (
      <tr {...C} key={`${runner.selectionId}-slip`} className={open ? '' : 'd-none'}>
        <td
          {...C}
          {...extraTd}
          colSpan={7}
          id={`betslip${runner.selectionId}_${m.exMarketId}`}
          className={[extraTd?.className, open ? (slip.side === 'back' ? 'blue-bet-slip-back' : 'pink-bet-slip-back') : ''].filter(Boolean).join(' ') || undefined}
        >
          {open && <BetSlip attrs={C} bet={slip.bet} onClose={closeSlip} onValue={onValue} />}
        </td>
      </tr>
    );
  };

  const cellActive = (m, runner, side, index) => (
    slip && slip.marketId === m.exMarketId && slip.selectionId === runner.selectionId && slip.side === side && slip.index === index
  );

  const matchOddsCard = (m) => {
    const blocked = m.oddsData.status === 'SUSPENDED' || m.oddsData.status === 'CLOSED';
    return (
      <div {...C} key={m.exMarketId} className="card matchodd matchodd-cont">
        <div {...C} className="card-matchodds outer-divs">
          <strong {...C} className="match-odds outer-div1">
            {m.marketName}{' '}
            <span {...C} className="marketinfo ml-2"><InfoIcon C={C} /></span>
          </strong>
          <div {...C} className="cashout-container outer-div2 not-matched">
            {m.oddsData.runners.length < 3 && <Cashout />}
          </div>
          {m.oddsData.totalMatched > 0 && (
            <span {...C} className="matched-count pull-right outer-div4">
              Matched <strong {...C}>€ {shortNumber(m.oddsData.totalMatched)}</strong>
            </span>
          )}
          {m.news && (
            <marquee {...C} className="pull-right fancy-marquee outer-div3" behavior="scroll" scrollamount="3">
              <strong {...C}>{m.news} </strong>
            </marquee>
          )}
        </div>
        <div {...C} className="card-body p-0">
          <div {...C} className="table-responsive position-relative">
            {blocked && (
              <div {...C} className="suspended unitycss-PipEJ">
                <span {...C} className="stats-text"> {m.oddsData.status === 'CLOSED' ? 'CLOSED' : 'SUSPENDED'} </span>
              </div>
            )}
            <table {...C} className="table table-hover tbl-bets betfair-tbl p-rltv">
              <thead {...C}>
                <th {...C} className="showMinMaxMobile show-xs min-max-mobile"><MinMax m={m} /></th>
                <th {...C} className="hidden-xs boxHide" colSpan={3} />
                <th {...C} className="back-1 mobileTableHead">Back</th>
                <th {...C} className="lay-1 mobileTableHead">Lay</th>
                <th {...C} className="min-max-bet boxHide" colSpan={2}><MinMax m={m} /></th>
              </thead>
              <tbody {...C}>
                {m.oddsData.runners.map((r) => [
                  <tr {...C} key={r.selectionId} className="odd-row" style={{ position: 'relative' }}>
                    <td {...C} className="team-name">
                      <span {...C} className="title matchodds_runner"> {m.runnersData[r.selectionId]} </span>
                      <span {...C} className="d-flex"><span {...C}>{preview(m, r)}</span></span>
                    </td>
                    {LEVELS.map(([side, index]) => {
                      const p = r.price[side][index];
                      const cls = `${side}-${index + 1} count${index > 0 ? ' boxHide' : ''}${cellActive(m, r, side, index) ? ' active' : ''}`;
                      return (
                        <td {...C} key={side + index} className={cls} onClick={() => pickLadder(m, r, side, index)}>
                          <a {...C} className={side}>
                            <span {...C} className={`position-relative ${side === 'back' || index === 0 ? 'match-book-inner-data ' : ''}match-inn-txt-top`} style={{ fontWeight: 700 }}>
                              {p ? p.price : ''}
                            </span>
                            <span {...C} className="position-relative match-inn-txt-btm">{p ? shortNumber(p.size) : ''}</span>
                          </a>
                        </td>
                      );
                    })}
                  </tr>,
                  slipRow(m, r, { className: 'custom-td' }),
                ])}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const bookmakerCard = (m) => {
    const per100 = m.marketType === 'Bookmakers-2';
    return (
      <div {...C} key={m.exMarketId} className="ipl-winner mt-1">
        <div {...C} className="flex-wrap">
          <div {...C}>
            <div {...C} className="card mb-0 matchodd bookmaker-mobile-custom-css">
              <div {...C} className="card-matchodds outer-divs">
                <strong {...C} className="match-odds bookmaker-dark-head">
                  {m.marketName}{' '}
                  <span {...C} className="marketinfo ml-2"><InfoIcon C={C} /></span>
                </strong>
                <div {...C} className="cashout-container outer-div2 not-matched">
                  {m.oddsData.runners.length < 3 && <Cashout />}
                </div>
                {m.oddsData.totalMatched > 0 && (
                  <span {...C} className="matched-count pull-right outer-div4">
                    Matched <strong {...C}>€ {shortNumber(m.oddsData.totalMatched)}</strong>
                  </span>
                )}
                {m.news && (
                  <marquee {...C} className="pull-right fancy-marquee outer-div3 hideDesktopMarque" scrollamount="3" behavior="scroll">
                    <strong {...C} className="bookmakerNews">{m.news} </strong>
                  </marquee>
                )}
              </div>
              <div {...C} className="card-body p-0">
                <div {...C} className="table-responsive position-relative">
                  <div {...C} className="bookmakerBackground">
                    <div {...C} className="team-name">
                      {m.news && (
                        <marquee {...C} className="pull-right fancy-marquee p-0 hideMobileMarque" scrollamount="3" behavior="scroll">
                          <strong {...C} className="bookmakerNews">{m.news} </strong>
                        </marquee>
                      )}
                    </div>
                  </div>
                  <table {...C} className="table table-hover betfair-tbl tbl-bets p-rltv bookmakerBackground" style={{ marginBottom: 0 }}>
                    <thead {...C} className="book-maker-table-thead">
                      <th {...C} className="showMinMaxMobile show-xs min-max-mobile border-bottom-0" style={{ border: 0 }}><MinMax m={m} book /></th>
                      <th {...C} className="boxHide" />
                      <th {...C} className="mobileTableHead bookmakerbacklay" colSpan={2} style={{ textAlign: 'right', paddingRight: 20, backgroundImage: 'var(--market-details-cmp-back-gradient-background)' }}>
                        {' '}Back{' '}
                      </th>
                      <th {...C} className="mobileTableHead bookmakerbacklay d-lg-flex justify-content-between" colSpan={2} style={{ textAlign: 'left', paddingLeft: 20, backgroundImage: 'var(--market-details-cmp-lay-gradient-bk-image)' }}>
                        Lay{' '}
                        <span {...C} className="fancy-info matchoddsminmax w-75 boxHide" id="minMaxBox">
                          <span {...C}>Min/Max</span>
                          <span {...C} id="minMaxInfo">{Number(m.min) === 100 ? '10' : m.min}-{m.max}</span>
                        </span>
                      </th>
                    </thead>
                    <tbody {...C}>
                      {m.oddsData.runners.map((r) => {
                        const st = m.oddsData.status;
                        const suspended = (st !== 'BALLRUN' && r.status === 'SUSPENDED') || st === 'SUSPENDED';
                        const dd = (side, index) => {
                          const p = r.price[side][index];
                          const sel = cellActive(m, r, side, index) ? (side === 'back' ? ' selectBetBack' : ' selectBetLay') : '';
                          return (
                            <dd {...C} key={side + index} className={`count${index > 0 ? ' boxHide' : ''} ${side}_${index + 1}${sel}`} id={side === 'lay' && index === 2 ? 'back_1' : undefined} style={{ cursor: 'pointer' }} onClick={() => pickLadder(m, r, side, index)}>
                              <a {...C} className={side}>
                                <span {...C} className="position-relative match-inn-txt-top" style={{ fontWeight: 700 }}>{p ? p.price : ''}</span>
                                <span {...C} className="position-relative" style={side === 'lay' && index === 1 ? undefined : { fontSize: 11 }}>{p ? shortNumber(p.size) : ''}</span>
                              </a>
                            </dd>
                          );
                        };
                        return [
                          suspended && (
                            <div {...C} key={`${r.selectionId}-s`} className="suspend-bookmaker-external unitycss0-7-22-23" bookmarked_table="">
                              <span {...C} className="stats-text unitycss0-8-23-24" bookmarked_table=""> Suspended </span>
                            </div>
                          ),
                          st === 'BALLRUN' && (
                            <div {...C} key={`${r.selectionId}-b`} className="suspend-bookmaker-external unitycss0-7-22-23" bookmarked_table="">
                              <span {...C} className="stats-text unitycss0-8-23-24" bookmarked_table=""> Ballrun </span>
                            </div>
                          ),
                          <tr {...C} key={r.selectionId} className="odd-row">
                            <td {...C} className="team-name team-width bookmakerNameRunner">
                              <span {...C} className="title">{m.runnersData[r.selectionId]}</span>
                              <span {...C} style={{ display: 'flex' }}>
                                <span {...C} />
                                {preview(m, r, per100)}
                              </span>
                            </td>
                            <td {...C} style={{ padding: 0 }}>
                              <dl {...C} className="back-gradient">{dd('back', 2)}{dd('back', 1)}{dd('back', 0)}</dl>
                            </td>
                            <td {...C} colSpan={3} style={{ padding: 0 }}>
                              <dl {...C} className="lay-gradient">{dd('lay', 0)}{dd('lay', 1)}{dd('lay', 2)}</dl>
                            </td>
                          </tr>,
                          slipRow(m, r),
                        ];
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const first = ladders.find((m) => m.marketType === 'MATCH_ODDS') || ladders[0];
  const start = startDate(matchData?.stime);
  const left = countdown(start, now);
  const started = left === '0';

  return (
    <app-market-details {...host('kmd')} {...KX}>
      {ladders.length > 0 && first && (
        <div {...C} className="card-body p-0 mb-1 mobile-stream time">
          <div {...C} className={`container-main-time ${BANNER[sid] || ''}`}>
            <div {...C} className="d-flex flex-column justify-content-between align-items-center p-3 pt-2" style={{ height: 100 }}>
              <div {...C} className="d-flex justify-content-between w-100">
                <div {...C} className="gameStatus"> {first.oddsData.status} </div>
                <div {...C} className="gameRemainingTime">
                  <span {...C} className="betStart" style={{ color: '#fff' }}> Game time </span> {gameTime(start)}{' '}
                </div>
              </div>
              <div {...C} className={`d-flex justify-content-center align-items-center${sid !== 7 && sid !== 4339 ? ' flex-column' : ''}`}>
                {!started && (
                  <div {...C} className="gameRemainingTime">
                    <span {...C} className="betStart" style={{ color: 'rgb(255, 255, 255)' }}> Count Down </span>
                  </div>
                )}
                {!started && <div {...C} className="gameRemainingTime in_play_betStarted"> {left} </div>}
                {started && (
                  <span {...C} className="betStart in_play_betStarted" style={{ color: 'rgb(255, 255, 255)', fontWeight: 'bold' }}> Bet Started </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div {...C} className={`marketDetailsList-con${ladders.length ? '' : ' d-none'}`}>
        <ul {...C} className="marketDetailsList">
          {['All', 'Popular'].map((k) => (
            <li {...C} key={k} className="marketDetailsListItem" onClick={() => { closeSlip(); setSelected(k); }}>
              <a {...C} className={selected === k ? 'active' : ''}>{k}</a>
            </li>
          ))}
          {ladders.map((m) => (
            <li {...C} key={m.exMarketId} className="marketDetailsListItem menu-item" onClick={() => { closeSlip(); setSelected(m.exMarketId); }}>
              <a {...C} className={selected === m.exMarketId ? 'active' : ''}>{m.marketName}</a>
            </li>
          ))}
        </ul>
      </div>

      {!loading && (
        <div {...C}>
          {shown.map((m) => (m.marketType === 'MATCH_ODDS' ? matchOddsCard(m) : bookmakerCard(m)))}
        </div>
      )}

      <div {...C} className="mobile-query" style={{ marginBottom: 70 }}>
        {fancy.length > 0 && (
          <MarketTabs
            fancy={fancy}
            slip={slip}
            onPick={pickFancy}
            onSlipClose={closeSlip}
          />
        )}
      </div>

      {loading && (
        <div {...C}>
          <div {...C} className="loader-body-marketplace">
            <div {...C} className="body-container shadow">
              <div {...C} className="circle-container">
                <div {...C} className="circle a-slide" data-animation="" style={{ '--bgc': 'var(--loader1-bg)' }} />
                <div {...C} className="circle a-slide a-return" data-animation="" style={{ '--bgc': 'var(--loader2-bg)' }} />
              </div>
              <div {...C} className="loading-text"> Loading... </div>
            </div>
          </div>
        </div>
      )}
    </app-market-details>
  );
}
