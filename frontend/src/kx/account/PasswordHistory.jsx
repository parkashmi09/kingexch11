import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ng, host, KX } from '../ng';
import { ngDate } from '../refApi';
import { isDemoUser } from '../../utils/demoStore';
import { getUserActivityLogs } from '../../apiservices/reportService';
import DataTable from './DataTable';

const A = ng('kph');

const COLUMNS = [
  { title: 'Date/Time', key: (r) => new Date(r.createdAt).getTime() },
  { title: 'Remark', key: 'remark' },
];

// This app keeps password changes in the activity log (logType "password").
// The demo account has none, as there.
async function fetchHistory(demo) {
  if (demo) return [];
  const to = new Date();
  const from = new Date(to.getFullYear() - 1, to.getMonth(), to.getDate());
  const res = await getUserActivityLogs({ startDate: from.toISOString().slice(0, 10), endDate: to.toISOString().slice(0, 10), logType: 'password', page: 1, limit: 1000 });
  const list = res?.success ? res.data?.logs ?? res.data ?? [] : [];
  return list.map((l) => ({ createdAt: l.createdAt, remark: l.remark || l.description || l.message || 'Password Changed' }));
}

/** app-password-history — My Account › Password History. */
export default function PasswordHistory() {
  const user = useSelector((s) => s.user.user);
  const demo = isDemoUser(user);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let live = true;
    fetchHistory(demo).then((r) => live && setRows(r)).catch(() => live && setRows([]));
    return () => { live = false; };
  }, [demo]);

  return (
    <app-password-history {...host('kph')} {...KX}>
      <div {...A} className="cardMain">
        <div {...A} className="row">
          <div {...A} className="col-sm-12 col-md-12 p-mobile-1">
            <div {...A} className="card card-accent-primary">
              <div {...A} className="card-header account-detail-head">
                <span {...A} className="pass-con">Password Change History</span>
              </div>
              <div {...A} className="card-body account-stat-body">
                <div {...A} className="row">
                  <div {...A} className="col-md-12 p-mobile-0">
                    <DataTable
                      A={A}
                      className="row-border no-footer table table-hover table-responsive"
                      columns={COLUMNS}
                      order={[0, 'desc']}
                      rows={rows}
                      ownBody
                      renderRows={(page) => page.map((e, i) => (
                        <tr {...A} key={i}>
                          <td {...A} className="text-center" role="cell">
                            <span {...A}>{ngDate(e.createdAt, 'YYYY-MM-dd H:mm:ss')}</span>
                          </td>
                          <td {...A} className="text-center" role="cell">{e.remark}</td>
                        </tr>
                      ))}
                      footer={rows.length === 0 && (
                        <tfoot {...A}>
                          <tr {...A}>
                            <td {...A} colSpan={2} style={{ textAlign: 'center' }} rowSpan={1}>No data!</td>
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
    </app-password-history>
  );
}
