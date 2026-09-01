import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './redux/store';
import App from './App';
import { warmBanners } from './utils/bannerCache';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
import 'hooper/dist/hooper.css';
import '../reference/bootstrap.min.css';
import '../reference/all.css';
import '../reference/control.css';
import '../reference/font.css';
import '../reference/color.css';
import '../reference/style.css';
import '../reference/animation.css';
import '../reference/animation-mobile.css';
import '../reference/responsive.css';
import '../reference/main.css';
import '../reference/wolf-custom.css';
import '../reference/ten-custom.css';
import '../reference/theme.css';
import '../reference/custom.css';
import './styles/themes/dark.css';
import './App.css';
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
warmBanners();

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
