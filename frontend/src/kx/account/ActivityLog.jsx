import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { ngDate } from '../refApi';
import { isDemoUser, getDemoLogins } from '../../utils/demoStore';
import { getUserActivityLogs } from '../../apiservices/reportService';

const A = ng('kal');

// This app's login log (logType "endlogin"), read into the reference's fields.
// The demo account lists its own logins from this browser.
async function fetchLogins(demo) {
  if (demo) return getDemoLogins();
  const to = new Date();
  const from = new Date(to.getFullYear() - 1, to.getMonth(), to.getDate());
  const res = await getUserActivityLogs({ startDate: from.toISOString().slice(0, 10), endDate: to.toISOString().slice(0, 10), logType: 'endlogin', page: 1, limit: 100 });
  const list = res?.success ? res.data?.logs ?? res.data ?? [] : [];
  return list.map((l) => ({
    logMessage: l.logMessage || 'Login Successful',
    createdAt: l.createdAt,
    ip: l.ip_address ?? l.ip ?? '',
    isp: l.isp ?? '',
    city: l.city ?? '',
    state: l.state ?? '',
    country: l.country ?? '',
  }));
}

/** app-activity-log — My Account › Activity Log. */
export default function ActivityLog() {
  const user = useSelector((s) => s.user.user);
  const demo = isDemoUser(user);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let live = true;
    fetchLogins(demo).then((r) => live && setLogs(r)).catch(() => {});
    return () => { live = false; };
  }, [demo]);

  return (
    <app-activity-log {...host('kal')} {...KX}>
      <div {...A} className="main">
        <div {...A} className="animated fadeIn divider-top">
          <div {...A} className="row" style={{ marginTop: '23px' }}>
            <div {...A} className="col-sm-12 col-md-12 p-mobile-1 main-card-con">
              <div {...A} className="card card-accent-primary">
                <div {...A} className="card-header account-detail-head">
                  <span {...A} className="acc-inn-head">Activity Log</span>
                </div>
                <div {...A} className="card-body account-stat-body">
                  <div {...A} className="row">
                    <div {...A} className="col-md-12 p-mobile-1">
                      <div {...A} className="table-responsive">
                        <table {...A} className="table table-bordered">
                          {/* The reference puts the <th>s straight in <thead>
                              (no row), which renders as this one row. */}
                          <thead {...A}>
                            <tr>
                              <th {...A} style={{ minWidth: '160px' }}>Login Date &amp; Time</th>
                              <th {...A} className="ls">Login Status</th>
                              <th {...A}>IP Address</th>
                              <th {...A} style={{ width: '100px' }}>ISP</th>
                              <th {...A}>City/State/Country</th>
                            </tr>
                          </thead>
                          <tbody {...A}>
                            {logs.map((n, i) => (
                              <tr {...A} key={i}>
                                <td {...A}>{ngDate(n.createdAt, 'dd-MM-YYYY H:mm:ss')}</td>
                                <td {...A}>
                                  <span {...A} className={n.logMessage === 'Login Successful' ? 'login-success' : 'text-danger'}>
                                    <b {...A}>{n.logMessage}</b>
                                  </span>
                                </td>
                                <td {...A}>{n.ip}</td>
                                <td {...A}>{n.isp}</td>
                                <td {...A}>{`${n.city}/${n.state}/${n.country}`}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-activity-log>
  );
}
