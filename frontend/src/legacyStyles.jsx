import { useEffect } from 'react';

// ── Legacy (tenexch) stylesheets, loaded ONLY on the routes still using them ──
//
// The clickbet rebuild and the old tenexch UI cannot share a document: both are
// full-page stylesheets that style bare element selectors and a good number of
// the same class names (`.banner`, `.logo`, `.sidebar`, `.title`, `.footer`…).
// Loading both globally silently reshapes whichever one loses — e.g. tenexch's
// `.banner { display: flex }` turned the clickbet hero carousel into a flex
// item and blew its width up to Chrome's layout limit.
//
// So the tenexch sheets are imported as URLs rather than bundled into the entry,
// and mounted as <link> elements by <LegacyStyles/> — which only the old
// MainLayout renders. Convert a page to the clickbet UI and it simply stops
// rendering that component, and these rules stop applying to it.
//
// They are appended to <head>, i.e. AFTER clickbet.css, so on a legacy route the
// old rules still win exactly as they did before.
import bootstrapUrl from '../reference/bootstrap.min.css?url';
import allUrl from '../reference/all.css?url';
import controlUrl from '../reference/control.css?url';
import fontUrl from '../reference/font.css?url';
import colorUrl from '../reference/color.css?url';
import styleUrl from '../reference/style.css?url';
import animationUrl from '../reference/animation.css?url';
import animationMobileUrl from '../reference/animation-mobile.css?url';
import responsiveUrl from '../reference/responsive.css?url';
import mainUrl from '../reference/main.css?url';
import wolfUrl from '../reference/wolf-custom.css?url';
import tenUrl from '../reference/ten-custom.css?url';
import themeUrl from '../reference/theme.css?url';
import customUrl from '../reference/custom.css?url';
import hooperUrl from 'hooper/dist/hooper.css?url';
import darkThemeUrl from './styles/themes/dark.css?url';
import appUrl from './App.css?url';

// Load order is the one main.jsx used before the split — several of these sheets
// depend on overriding an earlier one.
const SHEETS = [
  hooperUrl, bootstrapUrl, allUrl, controlUrl, fontUrl, colorUrl, styleUrl,
  animationUrl, animationMobileUrl, responsiveUrl, mainUrl, wolfUrl, tenUrl,
  themeUrl, customUrl, darkThemeUrl, appUrl,
];

const MARK = 'data-legacy-style';

/**
 * Mounts the tenexch stylesheets for as long as it is rendered.
 *
 * Reference-counted: two legacy routes rendering at once (or a remount during a
 * transition) must not have the first unmount pull the sheets out from under
 * the second.
 */
let mounted = 0;

export default function LegacyStyles() {
  useEffect(() => {
    mounted += 1;
    if (mounted === 1) {
      SHEETS.forEach((href) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute(MARK, '');
        document.head.appendChild(link);
      });
    }
    return () => {
      mounted -= 1;
      if (mounted === 0) {
        document.head.querySelectorAll(`link[${MARK}]`).forEach((el) => el.remove());
      }
    };
  }, []);

  return null;
}
