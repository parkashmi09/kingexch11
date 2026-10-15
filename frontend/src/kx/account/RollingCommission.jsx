import { useState } from 'react';
import { ng, host, KX } from '../ng';
import DatePicker from './DatePicker';
import { initialRange, dateManager, useRefSports, reportWindow } from './reports';

const A = ng('krc');

/**
 * app-rolling-commission — My Account › Rolling Commission.
 *
 * The reference totals stake and commission per market type from its
 * betsRollingCommission feed; this app's backend has no rolling commission, so
 * the table always reads "No data!" (as the reference's demo account does).
 */
export default function RollingCommission() {
  const sports = useRefSports();
  const [source, setSource] = useState('');
  const [sport, setSport] = useState('4');
  const [range, setRange] = useState(initialRange);
  const [opts] = useState(reportWindow);
  const rollingTotal = [];

  const picker = (which) => (
    <DatePicker A={A} className="form-control my-date-picker" value={range[which]} opts={opts} onChange={(m) => setRange((r) => ({ ...r, [which]: m.date }))} />
  );

  return (
    <app-rolling-commission {...host('krc')} {...KX}>
      <div {...A} className="cardMain">
        <div {...A} className="row">
          <div {...A} className="col-sm-12 col-md-12 p-mobile-1">
            <div {...A} className="card card-report card-accent-primary">
              <div {...A} className="card-body row p-0">
                <div {...A} className="col-md-12 betHistory">
                  <div {...A} className="row">
                    <div {...A} className="col-md-4 col-6 mb-3 slct-dat-con">
                      <div {...A} className="form-group">
                        <select
                          {...A}
                          id="datasourceSelect"
                          className="form-control custom-select"
                          value={source}
                          onChange={(e) => { setSource(e.target.value); setRange((r) => ({ ...r, start: dateManager(e.target.value) })); }}
                        >
                          <option {...A} disabled value="">Data Source</option>
                          <option {...A} value="LIVE">LIVE DATA</option>
                          <option {...A} value="BACKUP">BACKUP DATA</option>
                          <option {...A} value="OLD">OLD DATA</option>
                        </select>
                      </div>
                    </div>
                    <div {...A} className="col-md-4 col-6 mb-3 slct-date-con">
                      <div {...A} className="form-group">
                        <select {...A} id="sportSelect" name="betType" className="form-control custom-select" value={sport} onChange={(e) => setSport(e.target.value)}>
                          <option {...A} value="" disabled>Select Sport</option>
                          {sports.map((s) => (
                            <option {...A} key={s.sportId} value={s.sportId}>{` ${s.sportName} `}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div {...A} className="col-md-4 col-12 mb-2 slct-date-con slct-date-con-start">
                      <div {...A} className="form-group mb-0">
                        <div {...A} className="input-group">{picker('start')}</div>
                      </div>
                    </div>
                    <div {...A} className="col-md-4 col-12 date-con slct-date-con slct-date-con-end">
                      <div {...A} className="form-group mb-0">
                        <div {...A} className="input-group">{picker('end')}</div>
                      </div>
                    </div>
                    <div {...A} className="col-md-4 col-6 mt-1 slct-date-con slct-date-con-btn">
                      <button {...A} type="button" className="btn btn-primary" disabled={source === ''}>
                        <strong {...A}>Get Commission</strong>
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
            <div {...A} className="card card-accent-primary card-accent-primary-mobile">
              <div {...A} className="card-header account-detail-head">
                <span {...A} className="roll-spn">Rolling Commission</span>
              </div>
              <div {...A} className="card-body account-stat-body">
                <div {...A} className="row rowtwo">
                  <div {...A} className="col-md-12 p-mobile-0">
                    <table {...A} className="row-border no-footer table table-hover table-responsive table-bordered t-two">
                      <thead {...A}>
                        <tr {...A}>
                          <th {...A} className="text-center">Type</th>
                          <th {...A} className="text-center">Total Stack</th>
                          <th {...A} className="text-center">Total Commission</th>
                        </tr>
                      </thead>
                      {rollingTotal.length !== 0 ? (
                        <tbody {...A}>
                          {rollingTotal.map((e) => (
                            <tr {...A} key={e.marketType} className="text-center">
                              <td {...A} style={{ textTransform: 'capitalize' }}>{e.marketType}</td>
                              <td {...A}>{e.stake}</td>
                              <td {...A}>{e.commission}</td>
                            </tr>
                          ))}
                        </tbody>
                      ) : (
                        <tbody {...A}>
                          <tr {...A}>
                            <td {...A} className="text-center" colSpan={3}>No data!</td>
                          </tr>
                        </tbody>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-rolling-commission>
  );
}
