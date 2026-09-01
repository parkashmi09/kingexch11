import { Children } from 'react';
import Slick from 'react-slick';

// The reference's one carousel wrapper — every slider on the page (hero banner,
// sports tiles, promo strip) goes through it, so they all share these defaults
// and differ only by what each caller overrides.
const DEFAULTS = {
  dots: false,
  infinite: true,
  speed: 300,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 5000,
};

function Slider({ children, sliderRef, settings = {}, className = '' }) {
  const spec = { ...DEFAULTS, ...settings };

  // A track with no more slides than it shows has nowhere to go, and the
  // reference leaves it alone: its build of react-slick drops `infinite` in
  // that case, so no clones are rendered and autoplay never advances. Our
  // react-slick (0.30) clones unconditionally, which is what set the six
  // SPORTS tiles rotating when the real page holds them still — the same
  // settings, a different library version. Applying the rule here restores the
  // reference's behaviour for every carousel at once:
  //   banner  5 slides / shows 1 → infinite  (5 + 1 pre + 1 post = 7 slides)
  //   promo   4 slides / shows 3 → infinite  (4 + 3 + 3 = 10 slides)
  //   sports  6 slides / shows 6 → static    (6 slides, no clones)
  const count = Children.count(children);
  if (spec.infinite && count <= spec.slidesToShow) spec.infinite = false;

  return (
    <Slick ref={sliderRef} {...spec} className={className}>
      {children}
    </Slick>
  );
}

export default Slider;
