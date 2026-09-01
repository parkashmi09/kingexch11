import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { user, casinoTile } from '../assets';

// The reference's own popular strip, taken from its casino API
// (gamesbycategory/HOT, the ten entries flagged `isPopular`). Tenexch has no
// popularity flag, so the SELECTION is the reference's — and so is the art,
// because the geometry depends on it: `.popularimg` is `width: 20%; height:
// auto`, so a card's height comes straight from its image's aspect ratio. The
// reference's tiles are portrait 480x640, which is what makes a card 160x213.
// Tenexch's own casino art is landscape 300x160 and rendered cards less than
// half that tall.
//
// Each tile still opens a REAL tenexch game — `route` is this app's own casino
// route for that title, so the strip is clickbet's shelf stocked from tenexch's
// catalogue.
const POPULAR = [
  { id: 18, name: 'Instant Teenpatti', route: '/casino/instantteenpatti' },
  { id: 17, name: 'Worli Matka',       route: '/casino/worli' },
  { id: 15, name: '3 Card Judgement',  route: '/casino/3cardj' },
  { id: 14, name: 'Casino War',        route: '/casino/war' },
  { id: 13, name: 'Bollywood Casino',  route: '/casino/btable' },
  { id: 1,  name: 'Teenpatti One Day', route: '/casino/teen' },
  { id: 2,  name: 'Teenpatti 20-20',   route: '/casino/teen20' },
  { id: 3,  name: 'Dragon Tiger',      route: '/casino/dt20' },
  { id: 4,  name: 'Andar Bahar',       route: '/casino/ab20' },
  { id: 5,  name: '7 Up Down',         route: '/casino/lucky7' },
];

// The strip is a plain horizontal scroller (not a carousel), so the arrows page
// it by a fixed amount and disable themselves at each end.
const PAGE = 750;

function PopularGames() {
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const sync = () => {
    const el = boxRef.current;
    if (!el) return;
    const overflows = el.scrollWidth > el.clientWidth;
    setCanLeft(overflows && el.scrollLeft > 0);
    setCanRight(overflows && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(sync, []);

  const scroll = (dir) => {
    const el = boxRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -PAGE : PAGE, behavior: 'smooth' });
    setTimeout(sync, 500);
  };

  return (
    <>
      <div className="maintitle">
        <div className="d-flex align-items-center">
          <span className="sportsicon">
            <img src={user('populargame-icon.svg')} className=" mr-2" alt="popular" />
          </span>
          <h2 className="title">POPULAR GAMES</h2>
        </div>
        <div className="popbtnbox">
          <button
            className="game-type-arrow game-type-arrow-left"
            onClick={() => scroll('left')}
            disabled={!canLeft}
          >
            <i className="fa fa-chevron-left"></i>
          </button>
          <button
            className="game-type-arrow game-type-arrow-right"
            onClick={() => scroll('right')}
            disabled={!canRight}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="popular-gamebox" ref={boxRef} onScroll={sync}>
        {POPULAR.map((game) => (
          <div className="popularimg" key={game.id}>
            <img src={casinoTile(game.id)} alt="popular1" onClick={() => navigate(game.route)} />
          </div>
        ))}
      </div>
    </>
  );
}

export default PopularGames;
