import { useState } from 'react';
import { useSelector } from 'react-redux';
import Slider from '../Slider';
import { banner, login } from '../assets';
import { announceReady } from '../../utils/bannerCache';
import useViewportWidth, { MOBILE_MAX } from '../useViewport';

// TWO hero sets, and which one you see depends on whether you are signed in.
//
// Signed OUT the reference shows its five `main-banner*` slides; signed IN it
// shows the eleven under /banners. They are cut to different shapes — 3.09:1
// against 6.4:1 on desktop — and since `.banner img` is `width: 100%;
// height: auto` with no CSS height anywhere, that is the whole reason the hero
// is 440px tall before you log in and 226px after. It is deliberate, not drift.
//
// Each set also has its own phone crop, picked by viewport: 1.91:1 signed out,
// 2.56:1 signed in.
//
// Worth knowing if you go checking against the live site: it auto-signs-in a
// demo account, so it looks signed OUT while serving the signed-IN banners.
// Reading the short hero there and matching it is exactly how these got
// flattened to one set. Clear its storage before trusting what you see.
const LOGGED_OUT_EXT = ['jpg', 'webp', 'webp', 'webp', 'webp'];
const LOGGED_IN_SLIDES = [
  '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg', '11.jpeg',
  '16.jpg', '17.jpg', '18.jpg', '19.jpg',
];

const loggedOutSlides = (mobile) =>
  LOGGED_OUT_EXT.map((ext, i) => ({
    bimg: login(`main-banner${mobile ? '-mobile' : ''}${i}.${ext}`),
    ky: `adminwolgn_bnnr_${mobile ? 'mb' : 'dsktp'}_${i}`,
  }));

const loggedInSlides = (mobile) =>
  LOGGED_IN_SLIDES.map((file) => ({
    bimg: banner(`${mobile ? 'mobile' : 'desktop'}_banner_${file}`),
    ky: `bhm_bnnr_${mobile ? 'mb' : 'dsktp'}_${file.split('.')[0]}`,
  }));

function Banner() {
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const width = useViewportWidth();
  const isMobile = width < MOBILE_MAX;
  const [loaded, setLoaded] = useState(false);

  // tenexch's own /user/carousel art is deliberately not used here: it is a
  // single 4.26:1 set with no phone crop, so it would give the hero a third
  // height and shrink to ~101px on a phone. Swapping back to it means cutting
  // banners to the four shapes above first.
  const items = isAuth ? loggedInSlides(isMobile) : loggedOutSlides(isMobile);

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
              // A slide that fails to load must still release the splash, or
              // the page sits behind it until the 6s cap.
              onError={() => announceReady()}
            />
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
