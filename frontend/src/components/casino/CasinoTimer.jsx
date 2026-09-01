import { memo } from 'react';

function timerColor(timeLeft) {
  if (timeLeft <= 5) return 'red';
  if (timeLeft <= 10) return 'orange';
  return 'green';
}

export const DesktopTimer = memo(function DesktopTimer({ timeLeft = 0, fullTime = 30 }) {
  const color = timerColor(timeLeft);
  const dashArray = fullTime > 0 ? ((timeLeft / fullTime) * 283).toFixed(0) : 0;
  const digits = String(timeLeft).split('');

  return (
    <div className="casino-timer d-none-mobile">
      <div className="base-timer">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="base-timer__svg">
          <g className="base-timer__circle">
            <circle cx="50" cy="50" r="45" className="base-timer__path-elapsed"></circle>
            <path
              strokeDasharray={`${dashArray} 283`}
              d={`
        M 50, 50
        m -45, 0
        a 45,45 0 1,0 90,0
        a 45,45 0 1,0 -90,0
      `}
              className={`base-timer__path-remaining ${color}`}
            ></path>
          </g>
        </svg>
        <span className={`base-timer__label ${color}`}>
          {digits.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </span>
      </div>
    </div>
  );
});

export const MobileTimer = memo(function MobileTimer({ timeLeft = 0, fullTime = 30 }) {
  const color = timerColor(timeLeft);
  const pct = fullTime > 0 ? ((timeLeft / fullTime) * 100).toFixed(2) : 0;

  return (
    <div className="progress mobile-timer d-none-big">
      <div className={`progress-bar bg-${color === 'green' ? 'success' : color === 'orange' ? 'warning' : 'danger'}`} style={{ width: `${pct}%` }}></div>
    </div>
  );
});

export const MobileDigitTimer = memo(function MobileDigitTimer({ timeLeft = 0 }) {
  if (timeLeft <= 0 || timeLeft > 3) return null;

  return (
    <div className="casino-time-digit d-none-desktop">
      {timeLeft}
    </div>
  );
});

// Default export for backwards compat
const CasinoTimer = memo(function CasinoTimer({ timeLeft = 0, fullTime = 30 }) {
  return (
    <>
      <DesktopTimer timeLeft={timeLeft} fullTime={fullTime} />
      <MobileTimer timeLeft={timeLeft} fullTime={fullTime} />
    </>
  );
});

export default CasinoTimer;
