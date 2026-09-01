import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './redux/store';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
// The tenexch stylesheets are NOT imported here any more. They and the clickbet
// sheet below style the same element and class names, so only one of them may
// apply at a time; src/legacyStyles.jsx mounts the old set as <link>s for the
// routes that still need it. See the note at the top of that file.
//
// Bootstrap is the one exception - both UIs are built on it, and the reference
// loads the same 5.3 line - so it stays global and goes first.
import 'bootstrap/dist/css/bootstrap.min.css';
// Font Awesome 4.7 supplies the `fa fa-*` glyphs the clickbet markup uses (the
// reference pulls the same version off cdnjs).
import 'font-awesome/css/font-awesome.min.css';
// The clickbet UI itself. Slick, the marquee and the skeleton styles are all
// already inside it - those libraries need no CSS of their own.
import './styles/clickbet.css';
// The shared bet slip is still a tenexch component; these are the only rules
// from those sheets it needs, carved out so it renders correctly here. See the
// header of the file.
import './cb/betslip-legacy.css';
import './cb/casino-tiles.css';
import './config';

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Boot choreography:
//   gif loader → themed splash (bg-body) → real page revealed.
//
// On home the splash now doubles as the banner's loading time: index.html
// starts fetching the first banner during HTML parse, and the splash only
// closes once that image has actually landed ('banner-ready'). So the page is
// never revealed with an empty banner box. Capped both ways — never a flash,
// never a trap.
// Warm the home banners from wherever the user starts — login, casino, a detail
// page, anywhere. Navigating to home later then costs nothing: the list and the
// first image are already in cache, so the carousel paints on mount instead of
// kicking off an API call plus a CDN download.
// NOT warmed any more: the clickbet hero ships its own mirrored art, so
// nothing on these routes reads /user/carousel. Warming it cost an API call
// plus an image prefetch on every page load for a list no one rendered. The old
// BannerCarousel still calls warmBanners() itself if a legacy route mounts it.
// warmBanners();

const loader = document.getElementById('ten-loader');
const splash = document.getElementById('app-splash');

const BOOT_MIN_MS = 1200; // the loader is never shown shorter than this
const BOOT_MAX_MS = 6000; // dead CDN / no cache: reveal anyway
const isHome = window.location.pathname === '/';

let revealed = false;
function reveal() {
  if (revealed) return;
  revealed = true;
  if (loader) loader.style.display = 'none';
  if (!splash) {
    document.body.classList.remove('app-loading');
    return;
  }
  splash.classList.add('hidden');
  setTimeout(() => {
    splash.style.display = 'none';
    // Reveal the app shell (.wrapper is display:none while `app-loading`
    // is set) only AFTER the splash has fully faded out — never while the
    // splash is still on screen.
    document.body.classList.remove('app-loading');
  }, 300);
}

const bootStart = performance.now();
function revealAfterMin() {
  const waited = performance.now() - bootStart;
  if (waited >= BOOT_MIN_MS) reveal();
  else setTimeout(reveal, BOOT_MIN_MS - waited);
}

if (isHome) {
  if (window.__bannerReady) revealAfterMin();
  else window.addEventListener('banner-ready', revealAfterMin, { once: true });
  setTimeout(reveal, BOOT_MAX_MS);
} else {
  setTimeout(reveal, 2000); // no banner here — old fixed timing
}
