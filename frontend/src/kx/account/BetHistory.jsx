import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { ngDate } from '../refApi';
import { isDemoUser } from '../../utils/demoStore';
import { getUserBetHistory, getCurrentSportsBets } from '../../apiservices/reportService';
import { competitionOf, eventOf, marketOf, runnerOf, sideOf, rateOf, stakeOf, lineOf, statusOf } from '../../cb/report/betRows';
import DataTable from './DataTable';
import DatePicker from './DatePicker';
import { initialRange, dateManager, startOf, endOf, useRefSports, ourSportId, reportWindow } from './reports';

const A = ng('kbh');

const time = (k) => (r) => new Date(r[k]).getTime();
const COLUMNS = [
  { title: 'Sport Name', key: 'sportName' },
  { title: 'Event Name', key: 'eventName', style: { minWidth: '120px' } },
  { title: 'Market name', key: 'marketName' },
  { title: 'Selection', key: 'selectionName' },
  { title: 'Type', key: 'type' },
  { title: 'Odds Req.', orderable: false },
  { title: 'Stack', key: 'stake' },
  { title: 'Place Time', key: time('createdAt') },
  { title: 'Matched Time', key: time('matchedTime') },
];

// This app's bets, read into the reference's fields and filtered the way its
// request is (sport, Settle / Void / Unsettled, date range). The demo account
// has none, as there.
async function fetchBets({ range, sport, status }, demo) {
  if (demo) return [];
  const sportId = ourSportId(sport);
  if (sportId == null) return []; // a sport this app has no bets for (casino, lottery, …)
  const from = startOf(range.start);
  const to = endOf(range.end);
  let list;
  if (status === 'unsettle') {
    const res = await getCurrentSportsBets({ page: 1, limit: 1000 });
    list = res?.data || [];
  } else {
    const res = await getUserBetHistory({ fromDate: from.toISOString(), toDate: to.toISOString(), page: 1, limit: 1000, category: 'SPORTS' });
    list = (res?.data || []).filter((b) => (statusOf(b) === 'VOID') === (status === 'void'));
  }
  return list
    .filter((b) => Number(b.sport_id) === sportId)
    .filter((b) => {
      const t = new Date(b.created_at || b.placed_at);
      return t >= from && t <= to;
    })
    .map((b) => {
      const fancy = lineOf(b) !== '-';
      return {
        sportName: competitionOf(b),
        eventName: eventOf(b),
        marketName: marketOf(b),
        selectionName: runnerOf(b),
        type: sideOf(b) === 'Lay' ? 'L' : 'B',
        oddsPrice: fancy ? lineOf(b) : rateOf(b),
        oddsRate: fancy ? rateOf(b) : 0,
        stake: stakeOf(b),
        createdAt: b.created_at || b.placed_at,
        matchedTime: b.matched_at || b.created_at || b.placed_at,
      };
    });
}

/** app-bet-history — My Account › Bets History. */
export default function BetHistory() {
  const user = useSelector((s) => s.user.user);
  const demo = isDemoUser(user);
  const sports = useRefSports();
  const [source, setSource] = useState('');
  const [sport, setSport] = useState('4');
  const [status, setStatus] = useState('settle');
  const [range, setRange] = useState(initialRange);
  const [request, setRequest] = useState(() => ({ range: initialRange(), sport: '4', status: 'settle' }));
  const [rows, setRows] = useState([]);
  const [draw, setDraw] = useState(0);
  const [opts] = useState(reportWindow);

  useEffect(() => {
    let live = true;
    fetchBets(request, demo).then((r) => live && setRows(r)).catch(() => live && setRows([]));
    return () => { live = false; };
  }, [request, demo]);

  const getHistory = () => {
    setRequest({ range, sport, status });
    setDraw((n) => n + 1);
  };

  const picker = (which) => (
    <DatePicker A={A} className="form-control my-date-picker" value={range[which]} opts={opts} onChange={(m) => setRange((r) => ({ ...r, [which]: m.date }))} />
  );

  return (
    <app-bet-history {...host('kbh')} {...KX}>
      <div {...A} className="cardMain">
        <div {...A} className="row">
          <div {...A} className="col-sm-12 col-md-12 p-mobile-1">
            <div {...A} className="card card-report card-accent-primary">
              <div {...A} className="card-body row p-0">
                <div {...A} className="col-md-12 betHistory">
                  <div {...A} className="row">
                    <div {...A} className="col-md-4 col-6 mb-3 slct-dat">
                      <div {...A} className="form-group">
                        <select
                          {...A}
                          id="datasourceSelect"
                          className="form-control custom-select"
                          value={source}
                          onChange={(e) => { setSource(e.target.value); setRange((r) => ({ ...r, start: dateManager(e.target.value) })); }}
                        >
                          <option {...A} value="">Data Source</option>
                          <option {...A} value="LIVE">LIVE DATA</option>
                          <option {...A} value="BACKUP">BACKUP DATA</option>
                          <option {...A} value="OLD">OLD DATA</option>
                        </select>
                      </div>
                    </div>
                    <div {...A} className="col-md-4 col-6 mb-3 slct-dat">
                      <div {...A} className="form-group">
                        <select {...A} name="reportType" className="custom-select form-control" value={sport} onChange={(e) => setSport(e.target.value)}>
                          <option {...A} value="" disabled="disabled">Sport Type</option>
                          {sports.map((s) => (
                            <option {...A} key={s.sportId} value={s.sportId}>{` ${s.sportName} `}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div {...A} className="col-md-4 col-12 mb-3 slct-dat">
                      <div {...A} className="form-group">
                        <select {...A} name="betStatus" className="custom-select form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                          <option {...A} value="" disabled="disabled">Bet Type</option>
                          <option {...A} value="settle"> Settle</option>
                          <option {...A} value="void"> Void</option>
                          <option {...A} value="unsettle"> Unsettled</option>
                        </select>
                      </div>
                    </div>
                    <div {...A} className="col-md-4 col-12 slct-date-con slct-date-con-start">
                      <div {...A} className="form-group mb-0">
                        <div {...A} className="input-group">{picker('start')}</div>
                      </div>
                    </div>
                    <div {...A} className="col-md-4 col-12 slct-date-con slct-date-con-end">
                      <div {...A} className="form-group mb-0">
                        <div {...A} className="input-group">{picker('end')}</div>
                      </div>
                    </div>
                    <div {...A} className="col-md-4 col-6 gethis-con slct-date-con-btn">
                      <button {...A} type="button" className="btn btn-primary btnn" disabled={source === ''} onClick={getHistory}>
                        <strong {...A}>Get History</strong>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div {...A} className="col-sm-12 col-md-12 p-mobile-1">
          <div {...A} className="card card-accent-primary">
            <div {...A} className="card-header account-detail-head">
              <span {...A} className="bethis">Bet History</span>
            </div>
            <div {...A} className="card-body account-stat-body">
              <div {...A} className="row">
                <div {...A} className="col-md-12 p-mobile-0">
                  <DataTable
                    A={A}
                    className="datatable row-border no-footer table table-hover table-responsive"
                    columns={COLUMNS}
                    order={[8, 'desc']}
                    rows={rows}
                    drawKey={draw}
                    renderRows={(page) => page.map((e, i) => (
                      <tr {...A} key={i}>
                        <td {...A} className="text-center">{e.sportName}</td>
                        <td {...A} className="text-center">{e.eventName}</td>
                        <td {...A} className="text-center">{e.marketName}</td>
                        <td {...A} className="text-center">{e.selectionName}</td>
                        <td {...A} className={`text-center ${e.type === 'L' ? 'lay-text' : 'back-text'}`}>
                          <b {...A}>{e.type === 'L' ? 'Lay' : 'Back'}</b>
                        </td>
                        <td {...A} className="text-center">{` ${e.oddsPrice}/${Number(e.oddsRate) !== 0 ? e.oddsRate : 1} `}</td>
                        <td {...A} className="text-center"><b {...A}>{e.stake}</b></td>
                        <td {...A} className="text-center">{ngDate(e.createdAt, 'dd-MM-YYYY H:mm:ss a')}</td>
                        <td {...A} className="text-center">{ngDate(e.matchedTime, 'dd-MM-YYYY H:mm:ss a')}</td>
                      </tr>
                    ))}
                    footer={rows.length === 0 && (
                      <tfoot {...A}>
                        <tr {...A}>
                          <td {...A} colSpan={9} style={{ textAlign: 'center' }} rowSpan={1}>No data!</td>
                        </tr>
                      </tfoot>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-bet-history>
  );
}
