import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { common, oddsIcon } from '../assets';
import { formatGameDate } from '../../utils/betTableData';

// Desktop shows the kickoff inline next to the team names; the phone layout
// moves it to its own line under them, next to the competition. Same breakpoint
// the reference uses.
const DESKTOP_MIN = 768;

function useIsDesktop() {
  const [wide, setWide] = useState(window.innerWidth > DESKTOP_MIN);
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth > DESKTOP_MIN);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return wide;
}

// "01 Sept 14:30" — the reference's compact kickoff label.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
function kickoff(stime) {
  const m = String(stime || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!m) {
    const { day, time } = formatGameDate(stime);
    return time ? `${day} ${time}` : day;
  }
  let hour = Number(m[4]);
  const ap = (m[7] || '').toUpperCase();
  if (ap === 'PM' && hour !== 12) hour += 12;
  if (ap === 'AM' && hour === 12) hour = 0;
  return `${String(Number(m[2])).padStart(2, '0')} ${MONTHS[Number(m[1]) - 1]} ${String(hour).padStart(2, '0')}:${m[5]}`;
}

// One market's six price cells. Column order is team 1 / draw / team 2, each as
// a back+lay pair — the same three markets tenexch's board calls o1 / oX / o2.
function OddsRow({ match, onCellClick }) {
  const cells = [
    ['1', 'back', match.o1.back], ['1', 'lay', match.o1.lay],
    ['X', 'back', match.oX.back], ['X', 'lay', match.oX.lay],
    ['2', 'back', match.o2.back], ['2', 'lay', match.o2.lay],
  ];
  return (
    <ul className="oddsRow runnerOdds">
      {cells.map(([col, side, cell], i) => (
        <li
          key={i}
          className={`${side} 2.24`}
          onClick={(e) => {
            e.stopPropagation();
            if (cell.odds) onCellClick(match, { side, col, odds: cell.odds, size: cell.size });
          }}
        >
          {cell.odds || ''}
        </li>
      ))}
      {match.suspended && <span className="suspended h-29">SUSPENDED</span>}
    </ul>
  );
}

function MarketRow({ match, isLast, onCellClick }) {
  const navigate = useNavigate();
  const desktop = useIsDesktop();
  const open = () => navigate(match.href, { state: match._raw ? { game: match._raw } : undefined });
  const time = kickoff(match.date);

  return (
    <>
      <div className="oddsList" onClick={open}>
        <div className="runnerName displayflex">
          <h3 className="vsName">
            {match.inplay ? <span className="livebtn ">Live</span> : desktop && `${time}  | `} {match.teams}{' '}
          </h3>
          <div className="oddsmarket-icon">
            {match.icons?.f && (
              <span className="p-fancy">
                <img src={oddsIcon('fancy-icon1.svg')} className="oddsicons " alt="Fancy Icon" />
              </span>
            )}
            {match.icons?.bm && (
              <span className="bm1">
                <img src={oddsIcon('bm-icon1.svg')} className=" oddsicons" alt="BM Icon" />
              </span>
            )}
            {match.icons?.f1 && (
              <span className="fancy1 mr-1">
                <img src={oddsIcon('fancy-icon1.svg')} className="oddsicons " alt="Fancy Icon" />
              </span>
            )}
            {match.icons?.tv && (
              <span className="l-tv">
                <img src={oddsIcon('tv-icon1.svg')} className="oddsicons " alt="TV Icon" />
              </span>
            )}
          </div>
        </div>

        {!desktop && (
          <div className="runnername w-100">
            <span className="text-black cursor-pointer timetitle" role="button" tabIndex={0}>
              <img src={common('watch.png')} className="timewatch-icon" alt="sports" /> {`${time} | `}
              {match.league}
            </span>
          </div>
        )}

        <OddsRow match={match} onCellClick={onCellClick} />
      </div>
      {!isLast && <div className="border-bottom-1"> </div>}
    </>
  );
}

export default MarketRow;
