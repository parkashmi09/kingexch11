import { useParams } from 'react-router-dom';
import { common } from '../assets';
import { TAB_SPORT_MAP } from '../../hooks/home/useHomeLoad';
import SportList from '../sports/SportList';
import RacingBoard from '../sports/RacingBoard';

// One sport's own page: a banner, then that sport's board. `/race/:sportId` is
// the reference's route — its Horse and Greyhound nav entries point here.
//
// Keyed by tenexch's sport id, since that is what the board fetches with.
const SPORTS = {
  10: { tab: 'horseracing', title: 'Horse Racing', banner: 'horse' },
  65: { tab: 'greyhoundracing', title: 'Grey Hound', banner: 'greyhound' },
  4: { tab: 'cricket', title: 'Cricket', banner: 'cricket' },
  1: { tab: 'football', title: 'Soccer', banner: 'soccer' },
  2: { tab: 'tennis', title: 'Tennis', banner: 'tennis' },
};

/**
 * A sport page.
 *
 * Racing gets the venue-card board here — country, then a card per course with
 * its race times. That layout is the reference's own (its stylesheet carries
 * `horserace-cityname` and `horseinplaybtn`), but it does not appear on the
 * reference's home board, which renders every sport through the back/lay list.
 * Ours used to put it on home; this is where it belongs.
 *
 * Every other sport takes the ordinary list, exactly as the reference does.
 */
function Race() {
  const { sportId } = useParams();
  const sport = SPORTS[Number(sportId)];
  const cfg = sport && TAB_SPORT_MAP[sport.tab];

  if (!sport || !cfg) {
    return (
      <div className="border-radius-0 m-0 sportscardRow">
        <div className="noevent">No Active Events Found </div>
      </div>
    );
  }

  return (
    <div>
      <div className="innerbanner">
        <img alt="Banner" src={common(`innerpagebanner/${sport.banner}.webp`)} />
      </div>
      {cfg.racing ? (
        <>
          <div className="eventtitle-box mt-0 margintop-2">{sport.title}</div>
          <RacingBoard sportId={cfg.sid} />
        </>
      ) : (
        <SportList sportId={cfg.sid} title={sport.title} showTitle />
      )}
    </div>
  );
}

export default Race;
