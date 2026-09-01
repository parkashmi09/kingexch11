import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Slider from '../Slider';
import { common, user, login } from '../assets';
import { useSportTab } from '../useSportTab';
import { TAB_SPORT_MAP } from '../../hooks/home/useHomeLoad';
import SportList from '../sports/SportList';
import RacingBoard from '../sports/RacingBoard';
import PopularGames from './PopularGames';

// The six tiles in the SPORTS carousel, and the buttons under it. They are the
// same six sports in the same order — `cls` is the reference's per-sport button
// class (it colours each pill), `tab` is the board this app switches to.
const SPORTS = [
  { name: 'Cricket',   img: 'cricket.png',   cls: 'cri', tab: 'cricket' },
  { name: 'Soccer',    img: 'soccer.png',    cls: 'soc', tab: 'football' },
  { name: 'Tennis',    img: 'tennis.png',    cls: 'ten', tab: 'tennis' },
  { name: 'Horse',     img: 'horse.png',     cls: 'hor', tab: 'horseracing' },
  { name: 'GreyHound', img: 'greyhound.png', cls: 'gho', tab: 'greyhoundracing' },
  { name: 'Kabaddi',   img: 'kabaddi.png',   cls: 'kab', tab: 'kabaddi' },
];

// Button labels differ from the tile captions for two of them.
const BUTTON_LABEL = { hor: 'Horse Racing', gho: 'Greyhound' };

// Signed in, the reference stacks every sport's board at once instead of
// showing one at a time.
const LOGGED_IN_BOARDS = [
  { tab: 'cricket',          title: 'Cricket' },
  { tab: 'football',         title: 'Soccer' },
  { tab: 'tennis',           title: 'Tennis' },
  { tab: 'horseracing',      title: 'Horse Racing' },
  { tab: 'greyhoundracing',  title: 'Greyhound' },
];

const BONUS_BANNERS = ['bonus-1.jpg', 'bonus-2.jpg', 'bonus-3.jpg', 'bonus-4.jpg'];

// Racing boards are nested country > venue > race and have no back/lay grid.
const isRacing = (tab) => !!TAB_SPORT_MAP[tab]?.racing;

function Board({ tab, title, showTitle }) {
  const cfg = TAB_SPORT_MAP[tab];
  if (!cfg) return null;
  if (isRacing(tab)) return <RacingBoard sportId={cfg.sid} />;
  return <SportList sportId={cfg.sid} title={title} showTitle={showTitle} pollOnce={cfg.sid === 4} />;
}

function Home() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [activeTab, setActiveTab] = useSportTab();
  const [width, setWidth] = useState(window.innerWidth);
  const sportsSlider = useRef(null);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // In-Play has no tile of its own; landing on it shows the cricket board, which
  // is what the reference's default selection resolves to.
  const shownTab = activeTab === 'inplay' ? 'cricket' : activeTab;

  const tileSettings = { slidesToShow: width >= 768 ? 6 : width >= 500 ? 4 : 3, autoplaySpeed: 3000 };
  const promoSettings = { slidesToShow: width >= 768 ? 3 : 2, autoplaySpeed: 5000 };

  return (
    <>
      {!isAuth && (
        <>
          <div className="maintitle mobilespaceset">
            <div className="d-flex align-items-center">
              <span className="sportsicon">
                <img src={user('sportsgame-icon.svg')} className=" mr-2" alt="sports" />
              </span>
              <h2 className="title">SPORTS</h2>
            </div>
            <div className="popbtnbox">
              <button
                className="game-type-arrow game-type-arrow-left"
                onClick={() => sportsSlider.current?.slickPrev()}
                disabled={width >= 768}
              >
                <i className="fa fa-chevron-left"></i>
              </button>
              <button
                className="game-type-arrow game-type-arrow-right"
                onClick={() => sportsSlider.current?.slickNext()}
                disabled={width >= 768}
              >
                <i className="fa fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div>
            <div className="carousel-inner spbannerbox">
              <Slider sliderRef={sportsSlider} settings={tileSettings}>
                {SPORTS.map((sport) => (
                  <div
                    className="sportsgamebg cursor-pointer"
                    key={`sportimg-${sport.name}`}
                    onClick={() => setActiveTab(sport.tab)}
                  >
                    <div className="sportimg">
                      <img src={common(sport.img)} alt={sport.name} />
                    </div>
                    <div className="sport-name">{sport.name}</div>
                    <div className="sportbg-gradiant"></div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>

          <div className="gamenamebtn">
            <ul>
              {SPORTS.map((sport) => (
                <li
                  key={sport.cls}
                  className={`gamenamebox ${sport.cls} ${shownTab === sport.tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(sport.tab)}
                >
                  {BUTTON_LABEL[sport.cls] || sport.name}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {isAuth ? (
        LOGGED_IN_BOARDS.map((b) => <Board key={b.tab} tab={b.tab} title={b.title} showTitle />)
      ) : (
        <Board tab={shownTab} />
      )}

      {!isAuth && (
        <div className="carousel slide home-pramotionbanner-box">
          <div className="carousel-inner">
            <Slider settings={promoSettings}>
              {BONUS_BANNERS.map((file) => (
                <div className="cursor-pointer sliderbannerinner-img prabanner" key={file}>
                  <img className="sliderimg" style={{ width: '100%' }} src={login(file)} alt={file} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}

      <PopularGames />
    </>
  );
}

export default Home;
