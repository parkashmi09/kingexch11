import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Slider from '../Slider';
import { banner } from '../assets';
import { getSlides, warmBanners, bannerSrc, failed, announceReady } from '../../utils/bannerCache';
import useViewportWidth, { MOBILE_MAX } from '../useViewport';

// The hero set mirrored from the reference, in its order.
//
// Desktop and phone get DIFFERENT crops, not one file rescaled — the reference
// keeps two lists and picks by viewport. That choice is what sets the hero's
// HEIGHT: `.banner img` is `width: 100%; height: auto`, with no CSS height
// anywhere, so the image's own aspect ratio is the only thing deciding it.
// Desktop crops are ~6.4:1 (199px at a 1279px column), phone crops 2.56:1
// (168px at 430px).
//
// These are the reference's marketing images and it changes them from its
// admin: an earlier snapshot here was 3.09:1, which rendered the hero at 413px
// — more than twice the height the real site was showing by then. If the two
// drift apart again, re-pull this list rather than adjusting any CSS.
const SLIDES = [
  '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg', '11.jpeg',
  '16.jpg', '17.jpg', '18.jpg', '19.jpg',
];

const themeSlides = (mobile) =>
  SLIDES.map((file) => ({
    bimg: banner(`${mobile ? 'mobile' : 'desktop'}_banner_${file}`),
    ky: `bhm_bnnr_${mobile ? 'mb' : 'dsktp'}_${file.split('.')[0]}`,
    lnkurl: null,
    caption: null,
  }));

function Banner() {
  const navigate = useNavigate();
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const width = useViewportWidth();
  const isMobile = width < MOBILE_MAX;
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

  const items = isAuth && fromApi.length ? fromApi : themeSlides(isMobile);

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
              className={isMobile ? 'mbanner' : 'dbanner'}
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
        // Drives the header's own button rather than holding a second copy of
        // the modal — exactly what the reference does from here.
        <div className="bannerbtn" onClick={() => document.getElementById('loginBtn')?.click()}>
          Login
        </div>
      )}
    </div>
  );
}

export default Banner;
