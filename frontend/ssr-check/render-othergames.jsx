// Renders the /othergames/33 branch exactly as App.jsx composes it, so the DOM
// can be diffed against excpeted.txt. Verification harness only — not shipped.
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import OtherGames from '../src/pages/OtherGames.jsx';

// NewsStrip is private to App.jsx; mirrored here so the harness sees the same
// markup. Kept byte-identical with App.jsx on purpose.
function NewsStrip() {
  return (
    <div className="news-box d-none-desktop">
      <div className="news-bar d-none-desktop">
        <div className="marquee-wrapper">
          <div className="marquee-content" style={{ animationDuration: '6.90667s' }}>
            Welcome to new version of TENEXCH, Enjoy more services...
          </div>
        </div>
        <div className="news-title">
          <img src="/assets/icons/speaker.svg" alt="" />
        </div>
      </div>
    </div>
  );
}

// UpcomingFixture fetches; render its shell with one stub fixture so the
// structure is comparable without a network call.
function UpcomingFixtureShell() {
  return (
    <div className="upcoming-fixure d-none-desktop">
      <div className="fixure-title">Upcoming Fixtures</div>
      <div className="fixure-box-container">
        <div id="carousel2" data-ride="carousel" data-interval="3000" className="carousel vert slide">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <div className="fixure-box">
                <a href="/gamedetails/4/123">
                  <div><i className="d-icon mr-2 icon-4"></i>Team A v Team B</div>
                  <div>22/08/2026 19:30:00</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

process.stdout.write(renderToStaticMarkup(
  <MemoryRouter initialEntries={['/othergames/33']}>
    <div className="center-main-content report-container">
      <NewsStrip />
      <UpcomingFixtureShell />
      <OtherGames />
    </div>
  </MemoryRouter>
));
