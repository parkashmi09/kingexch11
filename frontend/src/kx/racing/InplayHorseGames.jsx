import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useRacingData from '../../hooks/useRacingData';
import { bToastError } from '../../components/BToast';
import { ng, host, KX } from '../ng';
import { isDesktop, isMobile } from '../exchange';
import { RACING, startDate } from '../racing';
import { shortNumber, gameTime } from '../market/model';
import InfoIcon from '../market/InfoIcon';
import BetSlip from '../market/BetSlip';

const C = ng('kih');

// Silks are served per market: race_icons/{marketId}/{runner sid}.png.
const SILK_BASE = 'https://sitethemedata.com/race_icons/';
const BANNER = { 4: 'time-cricket-banner', 1: 'time-soccer-banner', 2: 'time-tennis-banner', 7: 'time-horse-banner' };
// back 3, back 2, back 1 | lay 1, lay 2, lay 3, with the reference's classes.
const LEVELS = [['back', 2, 'back-0'], ['back', 1, 'back-1'], ['back', 0, 'back-2'], ['lay', 0, 'lay-0'], ['lay', 1, 'lay-1'], ['lay', 2, 'lay-2']];

const pad = (n) => String(n).padStart(2, '0');
// DecimalPipe: the default "1.0-3", and an explicit "1.1-1" / "1.2-2".
const decimal = (n, min = 0, max = 3) => (n == null || Number.isNaN(Number(n)) ? ''
  : Number(n).toLocaleString('en-US', { minimumFractionDigits: min, maximumFractionDigits: max }));
// DatePipe "dd-MM-YYYY h:mm".
const removalTime = (d) => (d ? `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${d.getHours() % 12 || 12}:${pad(d.getMinutes())}` : '');
// The countdownBetStart pipe: "hh:mm:ss" to five minutes before the off, then "0".
function betStartCountdown(d, now) {
  if (!d) return 'Invalid date';
  const z = Math.max(d.getTime() - 5 * 6e4 - now, 0);
  if (z < 1000) return '0';
  return `${pad(Math.floor(z / 36e5))}:${pad(Math.floor((z % 36e5) / 6e4))}:${pad(Math.floor((z % 6e4) / 1e3))}`;
}

const isOpen = (m) => m.oddsData.status === 'OPEN' || m.oddsData.status === 'ONLINE';

function level(section, name) {
  const o = (section.odds || []).find((x) => x.oname === name);
  return o ? { price: Number(o.odds) || 0, size: Number(o.size) || 0 } : null;
}

// Our race feed → the reference's racing markets: { exMarketId, marketName,
// marketType (PLACE for the place books), min, max, news, oddsData, runnersData,
// racingInfo: { [selectionId]: { CLOTH_NUMBER, STALL_DRAW, COLOURS_FILENAME,
// JOCKEY_NAME, TRAINER_NAME, AGE } } }. A greyhound card carries none of the
// form, so it has no racingInfo.
function toRaceModel(markets) {
  return [...(markets || [])].sort((a, b) => (a.sno ?? 0) - (b.sno ?? 0)).map((m) => {
    const sections = m.section || [];
    const informed = sections.some((s) => s.cno || s.sdraw || s.himg || s.jname || s.tname);
    return {
      exMarketId: String(m.mid),
      marketName: m.mname === 'MATCH_ODDS' ? 'Match Odds' : m.mname,
      marketType: /top \d|place/i.test(m.mname) ? 'PLACE' : 'MATCH_ODDS',
      oddsType: 'MATCH_ODDS',
      popular: true,
      min: m.min,
      max: m.max,
      news: m.rem || '',
      oddsData: {
        status: String(m.status || 'OPEN').toUpperCase(),
        totalMatched: 0,
        runners: sections.map((s) => {
          const g = String(s.gstatus || '').toUpperCase();
          const removed = startDate(s.rdt);
          return {
            selectionId: String(s.sid),
            status: g === 'REMOVED' ? 'REMOVED' : g === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
            adjustmentFactor: Number(s.adfa) || 0,
            removalDate: removed && removed.getFullYear() > 1900 ? removed : null,
            price: {
              back: ['back1', 'back2', 'back3'].map((n) => level(s, n)),
              lay: ['lay1', 'lay2', 'lay3'].map((n) => level(s, n)),
            },
            _section: s,
          };
        }),
      },
      runnersData: Object.fromEntries(sections.map((s) => [String(s.sid), s.nat])),
      racingInfo: informed ? Object.fromEntries(sections.map((s) => [String(s.sid), {
        CLOTH_NUMBER: s.cno || '',
        STALL_DRAW: s.sdraw || '',
        COLOURS_FILENAME: s.himg ? `${SILK_BASE}${m.mid}/${s.sid}.png` : '',
        JOCKEY_NAME: s.jname || '',
        TRAINER_NAME: s.tname || '',
        AGE: s.hage || '',
      }])) : null,
      _market: m,
    };
  });
}

/**
 * app-inplay-horse-games — one race (the reference's
 * /horse-racing/inplayHorseGame/:eventId/:sportId): the off-time banner, the
 * market pills (phone), then every book of the race on the racing card —
 * cloth number over stall draw, the silk, the runner, six prices, and the
 * jockey / trainer / age tags beneath. A withdrawn runner is veiled with its
 * "REMOVED n% date" deduction. Striking a price opens the slip under that
 * runner; while a stake is typed the market's runners preview it.
 */
export default function InplayHorseGames() {
  const { eventId, sportId } = useParams();
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const sid = RACING[sportId]?.sid;
  const { markets, race, loading, noMarkets } = useRacingData(eventId, sid);
  const all = useMemo(() => toRaceModel(markets), [markets]);
  const [selected, setSelected] = useState(() => ({ id: isMobile ? 'Popular' : 'All' }));
  const [activeItem, setActiveItem] = useState('');
  const [slip, setSlip] = useState(null);
  const [value, setValue] = useState({ stake: 0, price: 0 });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // A race with no books: the reference says so and goes home.
  useEffect(() => {
    if (!sid || noMarkets) {
      bToastError('No Markets are active');
      navigate('/');
    }
  }, [sid, noMarkets, navigate]);

  const closeSlip = useCallback(() => { setSlip(null); setValue({ stake: 0, price: 0 }); }, []);
  const onValue = useCallback((v) => setValue(v), []);

  const title = [race?.cname, race?.venue].filter(Boolean).join(' > ');
  const start = startDate(race?.stime);
  const matchOdds = all.filter((m) => m.marketType === 'MATCH_ODDS');
  const shown = selected.id === 'All' ? all
    : selected.id === 'Popular' ? all.filter((m) => m.popular)
      : all.filter((m) => m.exMarketId === selected.id && m.marketType === selected.type);
  const pick = (id, type = '') => setSelected({ id, type });

  const openBetslip = (m, runner, side, index) => {
    const p = runner.price[side][index];
    if (!p || !p.price) { closeSlip(); return; }
    const market = m._market;
    setTimeout(() => document.getElementById('betslip')?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'end' }), 100);
    setValue({ stake: 0, price: p.price });
    setSlip({
      marketId: m.exMarketId,
      selectionId: runner.selectionId,
      side,
      bet: {
        team: runner._section.nat,
        betType: side,
        odds: p.price,
        size: p.size,
        market_id: market.mid,
        selectionId: runner._section.sid,
        marketType: 'MATCH_ODDS',
        mname: market.mname,
        gtype: market.gtype,
        market,
        section: runner._section,
        runners: (market.section || []).map((r) => r.nat).filter(Boolean),
        event_id: eventId,
        event_name: title,
        match_title: title,
        match_start_time: race?.stime || '',
        sid,
        sports: sid === 10 ? 'Horse Racing' : 'Greyhound Racing',
        game_type: 'MATCH',
        team_one: '',
        team_two: '',
      },
    });
  };

  // The stake preview beside each runner of the market the slip is on.
  const preview = (m, runner) => {
    if (!slip || slip.marketId !== m.exMarketId || !value.stake) return null;
    const mine = slip.selectionId === runner.selectionId;
    const win = decimal((value.price - 1) * value.stake, 2, 2);
    const stake = decimal(value.stake, 2, 2);
    if (m.marketType !== 'PLACE') {
      return (
        <span {...C} style={{ display: 'flex', padding: 0 }}>
          {mine
            ? <span {...C} className="plus-book d-flex" style={{ marginRight: 5 }}><span {...C} className="plus-book">{`  (${win})`}</span></span>
            : <span {...C} className="minus-book d-flex"><span {...C} className="minus-book">{` (${stake}) `}</span></span>}
        </span>
      );
    }
    const cls = (plus) => (plus ? 'plus-book' : 'minus-book');
    return (
      <span {...C} style={{ display: 'flex', padding: 0 }}>
        {mine
          ? <span {...C} className={`d-flex ${cls(slip.side === 'back')}`} style={{ marginRight: 5 }}><span {...C} className={cls(slip.side === 'back')}>{`  (${win})`}</span></span>
          : <span {...C} className={`d-flex ${cls(slip.side === 'lay')}`}><span {...C} className={cls(slip.side === 'lay')}>{` (${stake})`}</span></span>}
      </span>
    );
  };

  const runnerRow = (m, r) => {
    const info = m.racingInfo?.[r.selectionId];
    const slipOpen = slip && slip.selectionId === r.selectionId && slip.marketId === m.exMarketId && isOpen(m);
    return [
      <div {...C} key={r.selectionId} className="item marketdetails-page d-flex position-relative">
        {r.status === 'REMOVED' && r.removalDate && r.adjustmentFactor && m.oddsData.status !== 'SUSPENDED' && (
          <div {...C} className="suspended-full">
            <span {...C} className="stats-text"> Non Runner {decimal(r.adjustmentFactor, 1, 1)}% {removalTime(r.removalDate)} </span>
          </div>
        )}
        {r.status === 'REMOVED' && r.adjustmentFactor > 0 && (
          <div {...C} className="suspended-full">
            <span {...C} className="stats-text"> REMOVED {decimal(r.adjustmentFactor, 1, 1)}% {removalTime(r.removalDate)} </span>
          </div>
        )}
        <div {...C} className="item-section">
          <div {...C} className="item-section-container">
            <span {...C} className="home-inplay-item">
              <span {...C} className="item-section-span-1">
                <span {...C} className="event-name-css">
                  <div {...C} className="d-flex">
                    {m.racingInfo && (
                      <div {...C} className="d-flex">
                        {(info?.CLOTH_NUMBER || info?.STALL_DRAW) && (
                          <div {...C} className="horseNumber">
                            {info.CLOTH_NUMBER && <p {...C} className="d-inline" style={{ margin: 0, fontWeight: 700 }}>{` ${info.CLOTH_NUMBER}`}</p>}
                            {info.STALL_DRAW && <p {...C} style={{ margin: 0, fontWeight: 'normal' }}>{` (${info.STALL_DRAW})`}</p>}
                          </div>
                        )}
                        <div {...C} className="d-flex justify-content-center align-items-center">
                          {info?.COLOURS_FILENAME && (
                            <img {...C} className="jursey-img" src={info.COLOURS_FILENAME} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                          )}
                        </div>
                      </div>
                    )}
                    <div {...C} className="w-100">
                      <span {...C} className="team-name d-flex justify-content-between">
                        <b {...C}>{`    ${m.runnersData[r.selectionId]} `}</b>
                      </span>
                      <span {...C} className="d-flex">
                        {m.marketType !== 'PLACE' && <span {...C}>{preview(m, r)}</span>}
                      </span>
                      {m.marketType === 'PLACE' && <span {...C}>{preview(m, r)}</span>}
                    </div>
                  </div>
                </span>
              </span>
            </span>
          </div>
        </div>
        <div {...C} className="bet-item-container">
          {r.status === 'SUSPENDED' && <div {...C} className="suspended"><span {...C} className="stats-text"> Suspended </span></div>}
          {m.oddsData.status === 'SUSPENDED' && <div {...C} className="suspended"><span {...C} className="stats-text"> Suspended </span></div>}
          <div {...C} className="bet-item-section bet-item-sec-con">
            <div {...C} className="bet-item-section">
              {LEVELS.map(([side, index, cls]) => {
                const p = r.price[side][index];
                return (
                  <span {...C} key={cls} className={`bet-buttons col-${side} ${cls}`} onClick={() => openBetslip(m, r, side, index)}>
                    <a {...C} className={side} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <span {...C} className="button button-justify-content">
                        <div {...C} className="button-price"> {p ? decimal(p.price) : ''} </div>
                        <div {...C} className="button-size"> {p ? shortNumber(p.size) : ''} </div>
                      </span>
                    </a>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>,
      m.racingInfo && (
        <div {...C} key={`${r.selectionId}-info`}>
          <div {...C} className="JockeyContainer">
            <ul {...C} cla="jockey-list">
              {info?.JOCKEY_NAME && <li {...C} className="jokeyTags ms-1"><b {...C}>Jockey : </b><span {...C} className="jokeydetail">{` ${info.JOCKEY_NAME}`}</span></li>}
              {info?.TRAINER_NAME && <li {...C} className="jokeyTags ms-1"><b {...C}>Trainer : </b><span {...C} className="jokeydetail">{info.TRAINER_NAME}</span></li>}
              {info?.AGE && <li {...C} className="jokeyTags ms-1"><b {...C}>Age : </b><span {...C}>{info.AGE}</span></li>}
            </ul>
          </div>
        </div>
      ),
      slipOpen && (
        <div {...C} key={`${r.selectionId}-slip`} id="betslip">
          <div {...C}>
            <BetSlip attrs={C} bet={slip.bet} onClose={closeSlip} onValue={onValue} />
          </div>
        </div>
      ),
    ];
  };

  const marketCard = (m) => (
    <div {...C} key={m.exMarketId} className="container-main">
      <div {...C} className="tablcon">
        <div {...C} className="inner-tabl-con">
          <div {...C} className="title-head">
            <strong {...C} className="left-head">
              {` ${m.marketName} `}
              <span {...C} className="icon-con" data-bs-toggle="modal" data-bs-target="#exampleModal"><InfoIcon C={C} /></span>
            </strong>
            <span {...C} className="right-head"> Matched <strong {...C}>{`€ ${shortNumber(m.oddsData.totalMatched)}`}</strong></span>
          </div>
          {isMobile && m.news && (
            <marquee {...C} className="pull-right fancy-marquee outer-div3" direction="scroll"><strong {...C}>{`${m.news} `}</strong></marquee>
          )}
          <div {...C} className="content-container one-con-main">
            <div {...C} className="row-one">
              <div {...C} className={`left-col${isDesktop ? ' d-flex align-items-center' : ''}`}>
                <div {...C} className="min-max-con show-xs">
                  <span {...C}>Min/Max</span>
                  <span {...C} className="text-dark">{`${m.min}-${m.max} `}</span>
                </div>
                {isDesktop && m.news && (
                  <marquee {...C} className="pull-right fancy-marquee" direction="scroll"><strong {...C}>{`${m.news} `}</strong></marquee>
                )}
              </div>
              <div {...C} className="right-col">
                <div {...C} className="inner-row">
                  <div {...C} className="one-col">Back</div>
                  <div {...C} className="two-col">Lay</div>
                  <div {...C} className="three-col">
                    <div {...C} className="min-max-con">
                      <span {...C}>Min/Max</span>
                      <span {...C} className="text-dark">{`${m.min}-${m.max} `}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {m.oddsData.runners.map((r) => runnerRow(m, r))}
          </div>
        </div>
      </div>
    </div>
  );

  const first = matchOdds[0];
  const left = betStartCountdown(start, now);
  const racing = sportId === '7' || sportId === '4339';
  const showLoader = loading && !all.length;

  return (
    <app-inplay-horse-games {...host('kih')} {...KX}>
      <div {...C} className="card-body p-0 mb-1 mobile-stream time">
        {first && (
          <div {...C} className={`container-main-time ${BANNER[sportId] || ''}`}>
            <div {...C} className="d-flex flex-column justify-content-between align-items-center p-3 pt-2" style={{ height: 100 }}>
              <div {...C} className="d-flex justify-content-between w-100">
                <div {...C} className="gameStatus"> {first.oddsData.status} </div>
                <div {...C} className="gameRemainingTime">
                  <span {...C} className="betStart" style={{ color: '#ff5' }}> Game time </span> {gameTime(start)}{' '}
                </div>
              </div>
              <div {...C} className={`d-flex justify-content-center align-items-center${racing ? '' : ' flex-column'}`}>
                {left !== '0' && (
                  <div {...C} className="gameRemainingTime">
                    <span {...C} className="betStart" style={{ color: 'rgb(255, 255, 255)' }}> Time Remaining </span>{'   '}
                  </div>
                )}
                {left !== '0' && <div {...C} className="gameRemainingTime in_play_betStarted"> {left} </div>}
                {left === '0' && (
                  <span {...C} className="betStart in_play_betStarted" style={{ color: 'rgb(255, 255, 255)', fontWeight: 'bold' }}> Bet Started </span>
                )}
              </div>
              {racing && left !== '0' && (
                <div {...C} className="d-flex justify-content-center w-100">
                  <div {...C} className="gameRemainingTime">
                    <span {...C} className="betStart" style={{ color: '#ff0' }}> Bet Start in </span>{'   '}
                    <span {...C}>{left}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!isDesktop && (
        <div {...C} className="position-relative">
          {isAuth && (
            <div {...C} className="game-highlight-wrap horse-racing-title">
              <span {...C}>Horse Racing</span>
              <span {...C} className={`icon${activeItem === 'tabs' ? ' selectedItem' : ''}`} _ngcontent-dsh-c3="" style={{ float: 'right', fontWeight: 'bold', fontSize: 16 }} onClick={() => setActiveItem(activeItem === 'tabs' ? '' : 'tabs')}>
                <i {...C} className="fa fa-television" _ngcontent-dsh-c3="" />
              </span>
            </div>
          )}
          <div {...C} className="accordion-body" id="tabs" style={activeItem === 'tabs' ? { display: 'block' } : undefined}>
            <div {...C} className="d-flex tabTv">
              <div {...C} className="items tvTabsActive" style={{ borderRight: 0 }}> Watch Live </div>
            </div>
          </div>
        </div>
      )}

      <div {...C}>
        <ul {...C} className="marketDetailsList">
          <li {...C} className="marketDetailsListItem" onClick={() => pick('All')}>
            <a {...C} className={selected.id === 'All' ? 'active' : ''}>All</a>
          </li>
          <li {...C} className="marketDetailsListItem" onClick={() => pick('Popular')}>
            <a {...C} className={selected.id === 'Popular' ? 'active' : ''}>Popular</a>
          </li>
          {all.map((m) => (
            <li {...C} key={m.exMarketId} className="marketDetailsListItem" onClick={() => pick(m.exMarketId, m.marketType)}>
              <a {...C} className={selected.id === m.exMarketId ? 'active' : ''}>{m.marketName}</a>
            </li>
          ))}
        </ul>
      </div>

      {!showLoader && (
        <div {...C} className="card mb-0 matchodd matchodd-card" style={{ position: 'relative' }}>
          {shown.filter((m) => m.oddsData.status !== 'CLOSED').map(marketCard)}
        </div>
      )}

      {showLoader && (
        <div {...C} className="loaderPostion" style={{ marginTop: 180 }}>
          <div {...C} className="loader-body-marketplace">
            <div {...C} className="body-container shadow">
              <div {...C} className="circle-container">
                <div {...C} className="circle a-slide" data-animation="" style={{ '--bgc': 'linear-gradient(180deg, #2A3A43 27%, #1C282D 83%)' }} />
                <div {...C} className="circle a-slide a-return" data-animation="" style={{ '--bgc': 'linear-gradient(-180deg, #fd8f3b 0%, #fd3523 100%)' }} />
              </div>
              <div {...C} className="loading-text"> Loading... </div>
            </div>
          </div>
        </div>
      )}
    </app-inplay-horse-games>
  );
}
