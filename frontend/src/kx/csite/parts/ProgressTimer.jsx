import { ng, host } from '../../ng';

const P = ng('cpt');

/**
 * app-progress-timer of the casino site: the round countdown ring — two
 * half-discs turning once over `--timerValue`, red under 6 seconds, the
 * seconds left in the middle.
 *
 * The reference ships it standalone (no table page mounts it; app-video-simple
 * draws its own copy of the ring, see VideoSimple.jsx).
 *
 * Props: { attrs, timeLeft, fullTime }
 *   timeLeft — seconds left (shown modulo 60, as the reference formats it)
 *   fullTime — one turn of the ring in seconds (the reference fixes it at 10)
 */
export default function ProgressTimer({ attrs, timeLeft, fullTime }) {
  const left = Number(timeLeft) % 60 || 0;
  const red = left < 6 ? 'spanColorRed' : undefined;
  return (
    <app-progress-timer {...attrs} {...host('cpt')}>
      <div {...P} className="block">
        <div {...P} className="timer-group" style={{ '--timerValue': `${Number(fullTime) || 10}s` }}>
          <div {...P} className="timer minute">
            <div {...P} className="hand"><span {...P} className={red}></span></div>
            <div {...P} className="hand"><span {...P} className={red}></span></div>
          </div>
          <div {...P} className="face">
            <p {...P} id="lazy" className={left < 6 ? 'heart' : undefined}> {left}</p>
          </div>
        </div>
      </div>
    </app-progress-timer>
  );
}
