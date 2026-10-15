import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { shortNumber } from './model';
import InfoIcon from './InfoIcon';
import BetSlip from './BetSlip';

const C = ng('kmt');
// Attributes the reference's template carries literally (left over from its
// source); its stylesheet has rules keyed on them.
const T = { '_ngcontent-twt-c3': '' };
const R = { '_ngcontent-cri-c3': '' };

// The reference's fancyMarketList: the tabs over the Fancy Bet list (its
// Popular entry reads "ALL"), and the Sportsbook's own set.
const FANCY_TABS = [
  { mName: 'Popular', id: 'popular' },
  { mName: 'Fancy', id: 'Fancy' },
  { mName: 'Line Markets', id: 'Linemarket' },
  { mName: 'Ball by Ball', id: 'Ballbyball' },
  { mName: 'Meter Markets', id: 'Meter' },
  { mName: 'Khado Markets', id: 'Khado' },
];
const SPORTSBOOK_TABS = [
  { mName: 'All', id: 'ALL' },
  { mName: 'Match', id: 'MATCH' },
  { mName: 'Odds/Evens', id: 'ODDS/EVENS' },
  { mName: 'Batsman', id: 'BATSMAN' },
  { mName: 'Bowler', id: 'BOWLER' },
  { mName: 'Extra', id: 'EXTRA' },
];
// Its shorter names on a phone.
const PHONE_NAMES = { 'Line Markets': 'Line Market', 'Meter Markets': 'Meter', 'Khado Markets': 'Khado' };

const notClosed = (m) => m.oddsData?.status !== 'CLOSED';
const blocked = (m) => m.oddsData?.status === 'SUSPENDED' || m.oddsData?.status === 'BALLRUN';

function filterFancy(markets, tab) {
  if (tab === 'popular') return markets.filter((m) => notClosed(m) && m.oddsType !== 'SPORTSBOOK');
  if (tab === 'Fancy') return markets.filter((m) => m.marketType !== 'Linemarket' && m.oddsType !== 'SPORTSBOOK' && notClosed(m));
  return markets.filter((m) => m.marketType === tab && notClosed(m));
}

/**
 * app-market-tabs — the Fancy Bet / Sportsbook block under the match's
 * books: the two folder tabs, the market-type pills, then one No / Yes row per
 * fancy line, its inline slip opening beneath it. This feed carries no
 * sportsbook markets, so that tab lists none — and, as on the reference, an
 * empty Fancy list opens on the Sportsbook tab.
 */
export default function MarketTabs({ fancy, slip, onPick, onSlipClose }) {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [type, setType] = useState('Fancy');
  const [tab, setTab] = useState('popular');
  const [minMax, setMinMax] = useState(null);
  const [phone, setPhone] = useState(() => window.innerWidth <= 768);
  const [flippedEmpty, setFlippedEmpty] = useState(false);

  useEffect(() => {
    const onResize = () => setPhone(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggle = (next) => {
    onSlipClose();
    setType(next);
    setTab(next === 'SPORTSBOOK' ? 'ALL' : 'popular');
  };

  const rows = type === 'Fancy' ? filterFancy(fancy, tab) : [];
  const popularEmpty = type === 'Fancy' && tab === 'popular' && fancy.length > 0 && rows.length === 0;
  useEffect(() => {
    if (!popularEmpty || flippedEmpty) return;
    setFlippedEmpty(true);
    setType('SPORTSBOOK');
    setTab('ALL');
  }, [popularEmpty, flippedEmpty]);

  const tabs = (type === 'Fancy' ? FANCY_TABS : SPORTSBOOK_TABS).map((t) => ({
    ...t,
    label: t.mName === 'Popular' ? 'ALL' : phone ? PHONE_NAMES[t.mName] || t.mName : t.mName,
  }));

  const selected = (m, side) => slip && slip.rowId === m.exMarketId && slip.side === side && !blocked(m);
  const pick = (m, side) => {
    const p = m.oddsData.runners[0]?.price?.[side]?.[0];
    if (!p || !(p.price > 0)) return;
    onPick(m, side, p);
  };
  const cell = (m, side) => {
    const p = m.oddsData.runners[0]?.price?.[side]?.[0];
    return [p ? ` ${p.price} ` : ' ', p ? ` ${shortNumber(p.size)} ` : ' '];
  };

  return (
    <app-market-tabs {...host('kmt')} {...KX} class="app-market-tabs" style={{ width: '100%' }}>
      <div {...C} className="card mb-0 noborder">
        <div {...C} className="p-rltv">
          <div {...C} className="fancy-head" id="fancyBetHeadNew">
            <h4 {...C} className="in-play" onClick={() => toggle('Fancy')}>
              <span {...C} id="headerName">Fancy Bet</span>
              <a {...C} className="btn-fancybet_rules"><InfoIcon C={C} /></a>
            </h4>
            <h4 {...C} className="in-play-sportbook" onClick={() => toggle('SPORTSBOOK')}>
              <span {...C} id="headerName">Sportsbook</span>
              <a {...C} className="btn-sportsbook_rules"><InfoIcon C={C} /></a>
            </h4>
          </div>
          <div {...C} className={`fancy_bet_tab-wrap ${type === 'Fancy' ? 'fancy_bet_back' : ''}`}>
            <ul {...C} className={`special_bets-tab ${type !== 'Fancy' ? 'bookmakersTabs' : ''}`}>
              {tabs.map((t) => (
                <li {...C} key={t.id} className={tab === t.id ? 'select' : ''} onClick={() => { onSlipClose(); setTab(t.id); }}>
                  <a {...C}>{t.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {type === 'Fancy' && (
        <div {...C} className="card mb-1 fancy-card">
          <div {...C} className="card-header card-accrdn card-fancybet" />
          <div {...C} className="card-body p-0">
            <div {...C} className="table-responsive">
              <div {...C} className="fency-fency-datatable">
                <table {...C} {...T} className={`table table-hover tbl-bets fancy-bet p-rltv ${tab === 'Linemarket' ? 'Linemarket-Selected' : ''}`}>
                  <thead {...C} {...T} className={rows.length ? '' : 'fancyLengthZero'}>
                    {rows.length > 0 && (
                      <tr>
                        <th {...C} {...T} className="minwidth" colSpan={2}>
                          <marquee {...C} {...T} className="pull-right fancy-marquee" scrollamount="“3”" behavior="“scroll”" direction="scroll">
                            <strong {...C} {...T} />
                          </marquee>
                        </th>
                        <th {...C} {...T} className="lay-1"> No </th>
                        <th {...C} {...T} className="back-1"> Yes </th>
                        <th {...C} {...T} className="hidden-xs hiddenMobile fancyminmaxText"> Min/Max </th>
                      </tr>
                    )}
                  </thead>
                  <tbody {...C} {...T}>
                    {rows.map((m, i) => {
                      const [layPrice, laySize] = cell(m, 'lay');
                      const [backPrice, backSize] = cell(m, 'back');
                      const open = slip && slip.rowId === m.exMarketId && !blocked(m);
                      const status = m.oddsData.status;
                      return [
                        <tr {...C} {...T} key={m.exMarketId} className="odd-row 1012023920102051113">
                          <td {...C} {...T} className="team-name valign-middle">
                            <a {...C} {...T} className="title fancy-title"> {m.marketName} </a>
                          </td>
                          <td {...C} {...T} className="valign-middle mbl-book style-oONYR" id="style-oONYR">
                            <button
                              {...C} {...T}
                              className="book-btn btn btn-primary hiddenMobile"
                              onClick={() => { if (!isAuth) navigate('/login'); }}
                            >
                              {' '}Book{' '}
                            </button>
                            <a {...C} className="btn-fancy_info" id="btn-fancy_info" onClick={() => setMinMax(i)} />
                            {minMax === i && (
                              <div {...C} {...R} className="fancy_info-popup fancyminmax-mbl-bg 1012023920104344661 unitycss0-0-0-1 unitycss-1Xsnh style-FQAeR" id="fancy_popup2">
                                <dl {...C} {...R} className="unitycss0-1-1-2 minmax-box" style={{ margin: 0 }}>
                                  <dt {...C} {...R} className="unitycss0-2-2-3 fancyminmaxText"> Min / Max </dt>
                                  <dd {...C} {...R} className="unitycss0-0-0-1 fancyminmaxValue unitycss0-2-2-4 tether-element-attached-top tether-element-attached-center tether-target-attached-top tether-target-attached-center" id="minMax">
                                    {' '}{m.min} - {m.max}{' '}
                                  </dd>
                                </dl>
                                <a {...C} {...R} className="close fancyminmaxText unitycss0-1-1-5" id="close-fancy_info" onClick={() => setMinMax(null)}>
                                  <svg {...C} xmlns="http://www.w3.org/2000/svg" width="9" height="9">
                                    <path {...C} fill="currentColor" fillRule="evenodd" d="M9 .912L5.412 4.5 9 8.088 8.088 9 4.5 5.412.912 9 0 8.088 3.588 4.5 0 .912.912 0 4.5 3.588 8.088 0z" />
                                  </svg>
                                  {' '}Close{' '}
                                </a>
                              </div>
                            )}
                          </td>
                          <td {...C} {...T} className={`lay-1 count 1012023920102051113${selected(m, 'lay') ? ' active' : ''}`} id="fancy1012023920102051113" onClick={() => pick(m, 'lay')}>
                            <a {...C} {...T}>{layPrice}<span {...C} {...T}>{laySize}</span></a>
                          </td>
                          <td {...C} {...T} className={`back-1 count p-rltv 1012023920102051113${selected(m, 'back') ? ' active' : ''}`} id="fancy1012023920102051113" onClick={() => pick(m, 'back')}>
                            {blocked(m) && (
                              <div {...C} {...T} className="spnd-fncy">
                                {status === 'SUSPENDED' && <span {...C} {...T} className="stats-text"> Suspended </span>}
                                {status === 'BALLRUN' && <span {...C} {...T} className="stats-text"> Ballrun </span>}
                              </div>
                            )}
                            <a {...C} {...T}>{backPrice}<span {...C} {...T}>{backSize}</span></a>
                          </td>
                          <td {...C} {...T} className="min-max hidden-xs fancyminmaxValue hiddenMobile"> {m.min} - {m.max} </td>
                        </tr>,
                        m.news ? (
                          <tr key={`${m.exMarketId}-news`}>
                            <td colSpan={5} style={{ padding: 0 }}>
                              <div {...C} className="text-right progress-bar">
                                <marquee {...C} {...T} className="pull-right progress-bar-txt" direction="left" scrollamount="3" behavior="scroll"> {m.news} </marquee>
                              </div>
                            </td>
                          </tr>
                        ) : null,
                        <tr {...C} key={`${m.exMarketId}-slip`} className={open ? '' : 'd-none'}>
                          <td {...C} colSpan={7} id={`betslip${m.oddsData.runners[0]?.selectionId}_${m.exMarketId}`} className={open ? slip.side : ''}>
                            {open && <BetSlip attrs={C} bet={slip.bet} onClose={onSlipClose} />}
                          </td>
                        </tr>,
                      ];
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {type === 'SPORTSBOOK' && (
        <div {...C} className="mb-0 fancy-card">
          <div {...C} className="card-header card-accrdn card-fancybet" />
          <div {...C} className="card-body p-0" />
        </div>
      )}
    </app-market-tabs>
  );
}
