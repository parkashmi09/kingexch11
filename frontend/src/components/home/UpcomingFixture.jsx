import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSportData } from '../../apiservices/sportsService';

const SPORT_ICONS = { 1: 'icon-1', 2: 'icon-2', 4: 'icon-4', 8: 'icon-8', 10: 'icon-10', 11: 'icon-11', 15: 'icon-15', 18: 'icon-18', 22: 'icon-22', 59: 'icon-59' };

function UpcomingFixture() {
  const [fixtures, setFixtures] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const sids = [4, 1, 2, 15, 18, 11, 8];
    Promise.all(sids.map(sid =>
      fetchSportData(sid).then(res => {
        const raw = res?.data?.data || res?.data;
        const t1 = raw?.data?.t1 || [];
        return t1.filter(g => !g.iplay).map(g => ({
          gmid: g.gmid,
          sid,
          ename: g.ename,
          stime: g.stime || '',
          icon: SPORT_ICONS[sid] || 'icon-4',
        }));
      }).catch(() => [])
    )).then(results => {
      const all = results.flat().slice(0, 20);
      setFixtures(all);
    });
  }, []);

  useEffect(() => {
    if (fixtures.length <= 1) return;
    const id = setInterval(() => setActiveIdx(i => (i + 1) % fixtures.length), 3000);
    return () => clearInterval(id);
  }, [fixtures.length]);

  if (fixtures.length === 0) return null;

  return (
    <div className="upcoming-fixure d-none-desktop">
      <div className="fixure-title">Upcoming Fixtures</div>
      <div className="fixure-box-container">
        {/* data-ride / data-interval are inert here — the rotation is the
            interval above, not Bootstrap's JS — but the reference ships them on
            this element and `[data-interval]` is part of the markup contract, so
            they are reproduced. `pointer-event` is NOT: Bootstrap adds that at
            runtime on touch, and the reference dumps show it coming and going. */}
        <div id="carousel2" data-ride="carousel" data-interval="3000" className="carousel vert slide">
          <div className="carousel-inner">
            {fixtures.map((f, i) => (
              <div key={f.gmid} className={`carousel-item${i === activeIdx ? ' active' : ''}`}>
                <div className="fixure-box">
                  <Link to={`/gamedetails/${f.sid}/${f.gmid}`}>
                    <div><i className={`d-icon mr-2 ${f.icon}`}></i>{f.ename}</div>
                    <div>{f.stime}</div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpcomingFixture;
