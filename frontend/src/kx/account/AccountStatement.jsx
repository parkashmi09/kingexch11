import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { ngDate } from '../refApi';
import { isDemoUser } from '../../utils/demoStore';
import { getUserAccountStatement } from '../../apiservices/reportService';
import DataTable from './DataTable';
import DatePicker from './DatePicker';
import { initialRange, dateManager, startOf, endOf, ngNum, reportWindow } from './reports';

const A = ng('kas');

const COLUMNS = [
  { title: 'Date/Time', key: (r) => new Date(r.createdAt).getTime() },
  { title: 'Deposit', key: 'deposit' },
  { title: 'Withdraw', key: 'withdraw' },
  { title: 'Balance', key: 'bankBalance' },
  { title: 'Remarks', key: 'remark' },
  { title: 'From/To', key: null },
];

const amount = (v) => (v == null || v === '-' || v === '' ? null : v);

// This app's statement rows, read into the reference's fields. The demo
// account has none, as there.
async function fetchStatement(range, demo) {
  if (demo) return [];
  const res = await getUserAccountStatement({
    fromDate: startOf(range.start).toISOString(),
    toDate: endOf(range.end).toISOString(),
    page: 1,
    limit: 1000,
    reportType: 'ALL',
  });
  const list = res?.success && Array.isArray(res.data) ? res.data : [];
  return list.map((r) => ({
    createdAt: r.date,
    deposit: amount(r.credit),
    withdraw: amount(r.debit),
    bankBalance: r.closing,
    remark: r.description || r.fromto || r.remark,
  }));
}

/** app-account-statement — My Account › Account Statement. */
export default function AccountStatement() {
  const user = useSelector((s) => s.user.user);
  const demo = isDemoUser(user);
  const [source, setSource] = useState('');
  const [range, setRange] = useState(initialRange);
  const [rows, setRows] = useState([]);
  const [draw, setDraw] = useState(0);
  const [opts] = useState(reportWindow);

  // ngOnInit draws once with the default range; Get Statement redraws.
  useEffect(() => {
    let live = true;
    fetchStatement(range, demo).then((r) => live && setRows(r)).catch(() => live && setRows([]));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw, demo]);

  return (
    <app-account-statement {...host('kas')} {...KX}>
      <div {...A} className="cardMain">
        <div {...A} className="row">
          <div {...A} className="col-sm-12 col-md-12 p-mobile-1">
            <div {...A} className="card card-report card-accent-primary">
              <div {...A} className="card-body row p-0 mb-2">
                <div {...A} className="col-md-12 betHistory">
                  <div {...A} className="row">
                    <div {...A} className="col-md-3 col-12 mb-2 slct-dat">
                      <div {...A} className="form-group">
                        <select
                          {...A}
                          id="dataSourceSelect"
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
                    <div {...A} className="col-md-3 col-12 mb-2 pick-date-slct">
                      <div {...A} className="form-group mb-0">
                        <div {...A} className="input-group">
                          <DatePicker A={A} className="form-control my-date-picker picker-border" value={range.start} opts={opts} onChange={(m) => setRange((r) => ({ ...r, start: m.date }))} />
                        </div>
                      </div>
                    </div>
                    <div {...A} className="col-md-3 col-12 mb-2 pick-date-slct-two">
                      <div {...A} className="form-group mb-0">
                        <div {...A} className="input-group">
                          <DatePicker A={A} className="form-control my-date-picker picker-border" value={range.end} opts={opts} onChange={(m) => setRange((r) => ({ ...r, end: m.date }))} />
                        </div>
                      </div>
                    </div>
                    <div {...A} className="col-md-3 col-6 button-con">
                      <button {...A} type="button" className="btn btn-primary btnn" disabled={source === ''} onClick={() => setDraw((n) => n + 1)}>
                        <strong {...A}>Get Statement</strong>
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
              <div {...A} className="card-header account-detail-head">Account Statement</div>
              <div {...A} className="card-body account-stat-body">
                <div {...A} className="row">
                  <div {...A} className="col-md-12 p-mobile-0">
                    <DataTable
                      A={A}
                      className="row-border no-footer table table-hover table-responsive innertable"
                      columns={COLUMNS}
                      order={[0, 'desc']}
                      rows={rows}
                      drawKey={draw}
                      ownBody
                      renderRows={(page) => page.map((e, i) => (
                        <tr {...A} key={i}>
                          <td {...A} className="text-center">{`${ngDate(e.createdAt, 'dd-MM-YYYY H:mm:ss')} `}</td>
                          <td {...A} className="text-center">{e.deposit || '0'}</td>
                          <td {...A} className="text-center"><b {...A} className="text-danger">{`(${e.withdraw || '0'})`}</b></td>
                          <td {...A} className="text-center">{ngNum(e.bankBalance)}</td>
                          <td {...A} className="text-center">{e.remark || 'NA'}</td>
                          <td {...A} className="text-center">
                            <span {...A} className="from">
                              {'Master '}
                              <i {...A} className="fa fa-arrow-circle-o-right" aria-hidden="true" />
                            </span>
                            <span {...A} className="to ms-2">exchange</span>
                          </td>
                        </tr>
                      ))}
                      footer={rows.length === 0 && (
                        <tfoot {...A}>
                          <tr {...A}>
                            <td {...A} colSpan={6} style={{ textAlign: 'center' }} rowSpan={1}>No data!</td>
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
    </app-account-statement>
  );
}
