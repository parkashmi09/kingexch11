import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Slider from '../Slider';
import { login } from '../assets';
import { getSlides, warmBanners, bannerSrc, failed, announceReady } from '../../utils/bannerCache';

// The theme's own hero set — five slides, shipped with the skin rather than
// fetched. This is what the reference shows to a LOGGED-OUT visitor: its banner
// component only asks the admin feed for images once you are signed in, and
// falls back to these files (`main-banner0…4`) otherwise.
const THEME_SLIDES = ['main-banner0.jpg', 'main-banner1.webp', 'main-banner2.webp', 'main-banner3.webp', 'main-banner4.webp']
  .map((f, i) => ({ bimg: login(f), ky: `theme_bnnr_${i}`, lnkurl: null, caption: null }));

function Banner() {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const [slides, setSlides] = useState(() => getSlides());
  const [loaded, setLoaded] = useState(false);
  // Slides whose image 404'd. The carousel list outlives the files it points
  // at — several entries the API returns are already dead — and a broken slide
  // collapses the banner to nothing, so they are dropped as they fail.
  const [dead, setDead] = useState(() => new Set());

  // Only signed-in visitors get the admin feed, so only they need it fetched.
  // warmBanners() is already fired at app boot; calling it again just adopts the
  // in-flight promise, so this costs a re-render once the list lands.
  useEffect(() => {
    if (!isAuth) return undefined;
    let alive = true;
    Promise.resolve(warmBanners()).then(() => {
      if (alive) setSlides(getSlides());
    });
    return () => { alive = false; };
  }, [isAuth]);

  const fromApi = (slides || [])
    .filter((s) => s.img && !failed.has(s.img))
    .map((s, i) => ({
      bimg: bannerSrc(s.img),
      ky: `admin_bnnr_${s.id ?? i}`,
      lnkurl: s.href || null,
      caption: s.caption || null,
    }))
    .filter((s) => !dead.has(s.bimg));

  const items = isAuth && fromApi.length ? fromApi : THEME_SLIDES;

  const openLink = (url) => {
    if (url.includes('http')) window.open(url, '_blank');
    else navigate(url);
  };

  return (
    <div className="banner">
      <Slider settings={{ dots: true, autoplaySpeed: 5000 }}>
        {items.map((item) => (
          <div className="loginimages" key={item.ky}>
            <img
              className={window.innerWidth < 768 ? 'mbanner' : 'dbanner'}
              src={item.bimg}
              alt={item.ky}
              onLoad={() => {
                setLoaded(true);
                // Closes the boot splash. main.jsx holds it on the home route
                // until the first banner has actually painted, so whichever
                // component renders that banner has to be the one to say so.
                announceReady();
              }}
              onError={() => {
                setDead((prev) => new Set(prev).add(item.bimg));
                // A dead first slide must still release the splash, or the page
                // sits behind it until the 6s cap.
                announceReady();
              }}
            />
            {isAuth && !!item.lnkurl && (
              <div className="bannerbtn" onClick={() => openLink(item.lnkurl)}>
                {item.caption ? item.caption : 'Check'}
              </div>
            )}
          </div>
        ))}
      </Slider>
      {/* Logged out, the banner carries one call to action of its own. It waits
          for the first image so the button never floats over an empty box. */}
      {!isAuth && loaded && (
        <div className="bannerbtn" onClick={() => navigate('/login')}>
          Login
        </div>
      )}
    </div>
  );
}

export default Banner;
