import { useState } from 'react';
import { useSelector } from 'react-redux';
import Slider from '../Slider';
import { banner } from '../assets';
import { announceReady } from '../../utils/bannerCache';
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
  const isAuth = useSelector((s) => s.user.isAuthenticated);
  const width = useViewportWidth();
  const isMobile = width < MOBILE_MAX;
  const [loaded, setLoaded] = useState(false);

  // The SAME set signed in or out.
  //
  // This used to swap to tenexch's /user/carousel art once you logged in, and
  // the hero visibly changed size at that moment: those images are 1900x446
  // (4.26:1) against the mirrored set's ~6.4:1, and there is no mobile crop
  // among them at all. Desktop jumped 199px -> 300px and a phone dropped
  // 168px -> ~101px, purely because the artwork was a different shape. With no
  // CSS height anywhere on the hero, matching the art is the only way to hold
  // the height steady.
  //
  // Pointing this back at the operator's own banners is a one-line change —
  // they just need cutting to the same two ratios first, desktop and mobile
  // separately, or the jump comes straight back.
  const items = themeSlides(isMobile);

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
