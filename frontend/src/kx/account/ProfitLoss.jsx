import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { isDemoUser } from '../../utils/demoStore';
import { getUserProfitLoss } from '../../apiservices/reportService';
import DataTable from './DataTable';
import DatePicker from './DatePicker';
import { initialRange, dateManager, startOf, endOf, ngNum, reportWindow } from './reports';

const A = ng('kpl');

const COLUMNS = [
  { title: 'Sport Name', key: 'sportName' },
  { title: 'Profit/Loss', key: 'pl' },
  { title: 'Commission', key: 'commission' },
  { title: 'Total P&L', orderable: false },
];

// This app's sport ids (event types) → the reference's sport rows.
const SPORTS = { 4: ['4', 'Cricket'], 1: ['1', 'Soccer'], 2: ['2', 'Tennis'], 10: ['7', 'Horse Racing'], 65: ['4339', 'Greyhound Racing'], 99: ['66102', 'Casino'] };

// This app's P&L items ({ _id: { et }, pnl, commission }) summed per sport, the
// reference's rows. The demo account has none, as there.
async function fetchProfitLoss(range, demo) {
  if (demo) return [];
  const res = await getUserProfitLoss({ from: startOf(range.start).toISOString(), to: endOf(range.end).toISOString() });
  const bySport = new Map();
  (res?.items || []).forEach((item) => {
    const [sportId, sportName] = SPORTS[item._id?.et] || [String(item._id?.et), String(item._id?.et)];
    const row = bySport.get(sportId) || { sportId, sportName, pl: 0, commission: 0 };
    row.pl += item.pnl || 0;
    row.commission += item.commission || 0;
    bySport.set(sportId, row);
  });
  return [...bySport.values()];
}

/** app-profit-loss — My Account › Profit & Loss. */
export default function ProfitLoss() {
  const user = useSelector((s) => s.user.user);
  const demo = isDemoUser(user);
  const [source, setSource] = useState('');
  const [range, setRange] = useState(initialRange);
  const [request, setRequest] = useState(initialRange);
  const [rows, setRows] = useState([]);
  const [draw, setDraw] = useState(0);
  const [opts] = useState(reportWindow);

  useEffect(() => {
    let live = true;
    fetchProfitLoss(request, demo).then((r) => live && setRows(r)).catch(() => live && setRows([]));
    return () => { live = false; };
  }, [request, demo]);

  const picker = (which) => (
    <DatePicker A={A} className="form-control my-date-picker" value={range[which]} opts={opts} onChange={(m) => setRange((r) => ({ ...r, [which]: m.date }))} />
  );

  return (
    <app-profit-loss {...host('kpl')} {...KX}>
      <div {...A} className="cardMain">
        <div {...A} className="row">
          <div {...A} className="col-sm-12 col-md-12 p-mobile-1 card-main-con">
            <div {...A} className="card card-report card-accent-primary">
              <div {...A} className="card-body row p-0 mb-2">
                <div {...A} className="col-md-12 betHistory">
                  <div {...A} className="row">
                    <div {...A} className="col-md-3 col-12 slct-dat">
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
                    <div {...A} className="col-md-3 col-12 mb-2 slct-date-pick slct-date-pick-start">
                      <div {...A} className="form-group mb-0">
                        <div {...A} className="input-group">{picker('start')}</div>
                      </div>
                    </div>
                    <div {...A} className="col-md-3 col-12 mb-2 slct-date-pick slct-date-pick-end">
                      <div {...A} className="form-group mb-0">
                        <div {...A} className="input-group">{picker('end')}</div>
                      </div>
                    </div>
                    <div {...A} className="col-md-3 col-6 gpl-con slct-date-pick-btn">
                      <button {...A} type="button" className="btn btn-primary btnn" disabled={source === ''} onClick={() => { setRequest(range); setDraw((n) => n + 1); }}>
                        <strong {...A}>Get P&amp;L</strong>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div {...A} className="row">
          <div {...A} className="col-sm-12 col-md-12 p-mobile-1">
            <div {...A} className="card card-accent-primary">
              <div {...A} className="card-header account-detail-head">
                <span {...A} className="pl-con">Profit/Loss</span>
              </div>
              <div {...A} className="card-body account-stat-body">
                <div {...A} className="row">
                  <div {...A} className="col-md-12 p-mobile-0">
                    <DataTable
                      A={A}
                      className="row-border no-footer table table-hover table-responsive"
                      columns={COLUMNS}
                      rows={rows}
                      drawKey={draw}
                      renderRows={(page) => page.map((e) => (
                        <tr {...A} key={e.sportId}>
                          <td {...A} className="text-center">
                            {/* The reference drills into the sport's events from here
                                (href="javascript:void(0)", which React blocks). */}
                            <a {...A} href="#" onClick={(ev) => ev.preventDefault()} style={{ color: 'var(--child-navigation-link)', fontWeight: 'bold' }}>{e.sportName}</a>
                          </td>
                          <td {...A} className={`text-center ${e.pl <= 0 ? 'text-danger' : 'text-success'}`} style={{ fontWeight: 'bold' }}>{` ${e.pl}`}</td>
                          <td {...A} className="text-center">{ngNum(e.commission)}</td>
                          <td {...A} className={`text-center ${e.pl - e.commission <= 0 ? 'text-danger' : 'text-success'}`} style={{ fontWeight: 'bold' }}>{` ${ngNum(e.pl - e.commission)}`}</td>
                        </tr>
                      ))}
                      footer={rows.length === 0 && (
                        <tfoot {...A}>
                          <tr {...A}>
                            <td {...A} className="text-center" colSpan={4} rowSpan={1}>No data!</td>
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
      </div>
    </app-profit-loss>
  );
}
