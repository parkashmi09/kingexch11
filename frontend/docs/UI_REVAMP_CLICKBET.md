# UI Revamp — Migrating the `1xclickbet` frontend to the ClickBetExchange visual system

**Status:** 🟡 In progress — home route converted (`dd31110`)
**Reference target:** `https://www.clickbetexchenge.com/`
**Codebase:** `D:\CFZ\1xclickbet\frontend` (React 19 + Vite 5)
**Created:** 2026-09-01 · **Revised:** 2026-09-01 after pulling `dd31110`

---

## 0. Progress

Commit `dd31110` "Rebuild the home page on the clickbetexchenge UI" landed the shell and the home
page. **The architecture chosen differs from this document's original recommendation** — see §5,
which has been rewritten to record what was actually done and why it is better.

### Done

| Area | What shipped |
|---|---|
| **Stylesheet split** | `src/styles/clickbet.css` — 8,345 lines, project-owned, carrying the reference's `:root` token block. Global. The 14 tenexch sheets are **no longer imported in `main.jsx`**. |
| **Legacy isolation** | `src/legacyStyles.jsx` mounts the tenexch sheets as `<link>` elements, ref-counted, only while old chrome is on screen. |
| **New component tree** | `src/cb/` — 15 files, ~1,300 lines: `Layout`, `Slider`, `assets.js`, `navItems.js`, `useSportTab.js`, `layout/{Header,Sidebar,Banner,Footer,MobileFooter}`, `home/{Home,PopularGames}`, `sports/{SportList,MarketRow,RacingBoard}`. |
| **Shell** | Header + `marqueebox` (via `react-fast-marquee`), 252px sidebar with `sidebartree`, hero `Banner`, `Footer` with provider grid, and **`MobileFooter` → the `.bottom-nav` bar** that did not exist before. |
| **Home** | Sport tile carousel (`react-slick`), sport pill buttons, logged-out single board vs logged-in stacked boards, promo banner strip, `PopularGames`. |
| **Routing** | `/` and `/home` → `CbLayout`; everything else still → `MainLayout`. |
| **Assets** | 68 files mirrored into `public/newtheme/` under `BRAND='rcl'` / `THEME='baz'`, keeping the source paths byte-identical so lifted markup needs no rewriting. |
| **Deps** | `font-awesome@4.7.0`, `react-slick@0.30.3`, `react-fast-marquee@1.6.5`. |

This closes most of Phases 0–3 for the home route, and resolves open questions 3 and 4 (§13).

### In-Play (`/inplay`) — transcribed from the reference bundle

`src/cb/inplay/InPlay.jsx` is a direct transcription of the reference's In-Play page component
(`LG` in `index-szMe67kU.js`), which is simply:

```
<div>
  <div className="innerbanner"><img src=".../newtheme/common/innerpagebanner/inplay.webp" alt="Banner"/></div>
  <Board sportId="4"/>     Cricket
  <Board sportId="1"/>     Soccer
  <Board sportId="2"/>     Tennis
  <Board sportId="7"/>     Horse Racing     ← racing variant
  <Board sportId="4339"/>  Grey Hound       ← racing variant
  {settings.election.show && <Board sportId="500"/>}   Election
</div>
```

Rules the reference's shared board component (`$r` / `jV`) applies, all now mirrored:

| Rule | Where |
|---|---|
| **Every sport is always rendered.** A sport with nothing live keeps its title and shows its own "No Active Events Found" card. There is no page-level empty state. | `InPlay.jsx` |
| The `1 / X / 2` `backlayHead` row is **dropped** from a board with no live match — bare title over the empty card. | `SportList.jsx` (`inPlay` prop) |
| Board titles are `eventtitle-box mt-0 margintop-2` for the ball sports, `eventtitle-box mt-0` (no `margintop-2`) for the two racing boards. | `SportList` / `RacingBoard` |
| Racing narrows to races that are off (reference: `marketTime - now < 180s`; ours: the feed's `iplay` flag, which already drives the Live badge). Emptied venues and countries drop out. | `RacingBoard.jsx` (`inPlay` prop) |
| The racing board's country groups live **inside** its `sportscardRow`, which gains `p-2` only when it has races. Its empty state is `<div><div className="noevent">…</div></div>` — no `marketOdd`, no nested card. | `RacingBoard.jsx` |
| Racing has no loading or error branch: until the feed answers the board is empty, and an empty board is the "No Active Events Found" card. | `RacingBoard.jsx` |

Verified by diffing the live DOM of `clickbetexchenge.com/inplay` against `localhost/inplay` — the
child list under the page wrapper is identical, class for class.

**Deliberately absent:** the Election board. The reference gates it on an `election.show` flag from
its settings feed; the tenexch backend has no election sport and no such flag.

**Known divergence, not an In-Play issue:** the reference's home board shows *all* of a sport's
events sliced to the first 3 (logged out) / 5 (logged in); ours filters to live events only and
does not slice. That predates this page — see Phase 3.

### Indian Poker (`/indianpoker`) — the reference's casino category page

`src/cb/casino/IndianPoker.jsx` transcribes the reference's casino category page (`FV` in
`index-szMe67kU.js`), the one component that serves all six of its casino menus from a config map
keyed by route param. Its `$i.INDIANPOKER` entry is:

```js
{ menu: 'INDIANPOKER', calltype: 'providers', providers: 'RVGAMES,GAP,AURA',
  partnerFilter: ['RVGAMES','INDIAN POKER II','INDIAN POKER','MAC88'],
  initListFilter: { partner: {...}, category: '' }, displayName: 'Indian Poker' }
```

Page order, all of it reproduced:

| Block | Markup |
|---|---|
| Banner | `casino-content-page rcl` > `row` > `sportbook-livecasino` > `text-center innerbanner` > img `innerpagebanner/indianpoker.webp` |
| Provider pills | `game-type-container position-relative prl5` (+ `show-left-fade` / `show-right-fade`) > `wacfilter-box-scroll` > `wacfilter-box`, with `ALL` first |
| Search | `newsearchbox col-12` > `newsearchbox_search prl5` + `newsearchbox_category prl5` > `catbtn` "Category". `mt5` is added only when the provider row above is absent. |
| Game-type pills | second identical strip |
| Search summary | `mt-4 prl5 wacsearch-result` > `waccasino-search-result` > `waccasino-search-title` + `waccasino-search-count`, shown only while the box has text |
| Grid | `mt-2 mb-2 featured-game1 wac-min-height wac-width-100` > `wac-20` > `wacmain-box` > skeleton, img, `slots__bg` > `slots__overlay` > `a.b2clogin.btn-default` "Play" |
| Loading | banner + `container` + ten `wacmain-box wacmain-box-border` skeleton tiles |
| Category modal | `encasino catmain` dialog > `categorymodel` > `currencybox-header` + `currencybox-body`, with its own search over `categorypopbox > .parent` |

**Phone and desktop both come free.** Every class above is already in `clickbet.css`, including
`.wac-20`'s `16.66%` → `33.33%` breakpoint, so reproducing the markup is the whole responsive job.
Verified by loading our page and the reference's side by side in a 390px iframe — same blocks, same
order, same control positions. `casino-content-page`, `sportbook-livecasino` and `popup-cross` carry
**no CSS at all** in the reference; they are structural hooks, so nothing had to be added.

**Logged in vs logged out.** The page is identical in both, and so is the reference's: it only
withholds a grid behind `Login to access {menu}.` on `providers_lobby` menus, and Indian Poker is a
`providers` menu. The gate is on the tile — a click with no session runs the reference's own line,
`document.getElementById('loginBtn').click()`, which works verbatim because `cb/layout/Header.jsx`
ships that id on its Login button at every width. Signed in, the tile checks the row's
`min_balance` against the header balance and then navigates to the table.

#### What is fed into it, and why

**The two filter rows are the reference's, verbatim and fixed** — not derived from what our catalog
happens to hold, which is how the reference builds its own. Both rows render byte-identical HTML to
the reference's (checked by string comparison against its live DOM):

```
partners    ALL · RVGAMES · INDIAN POKER II · INDIAN POKER · MAC88
gameTypes   ALL · Live Casino · Table Games · Slot · Crash Games
```

The games behind them are ours, from the **Casino Manage catalog** — this platform's own tables.
Each pill is therefore pinned to the reference's label and given a predicate over our data, all of
it in one table in `cb/casino/catalog.js` so it can be re-pointed without touching the page:

| Pill | Filters to | Rows |
|---|---|---|
| RVGAMES | `category === 'our'` | 81 |
| INDIAN POKER II | `category === 'vip'` | 1 |
| INDIAN POKER | `category === 'premium'` | 7 |
| MAC88 | `category === 'virtual'` | 13 |
| Live Casino | dealt-card tables (teenpatti, poker, baccarat, dragon tiger, andar bahar, 32 cards, …) | 64 |
| Table Games | everything else — the wheel, dice and number games | 38 |
| Slot | — | 0 |
| Crash Games | — | 0 |

Two things worth being explicit about:

- **The partner pairing is a label mapping and nothing more.** There is no sense in which our VIP
  tables *are* MAC88's; the four reference partners simply have no counterpart here, so each is
  paired with one of our house sets in list order.
- **Slot and Crash Games are empty on purpose.** This platform *has* both, but they live behind a
  different API (`jsGames`) and launch through an iframe rather than one of our table routes, so
  they are not in this catalog to be filtered. The pills still render, because the row has to read
  the same as the reference's, and select an empty grid. Wiring them to `jsGames` is a follow-up.

Three deliberate deviations, all recorded here so they are not read as drift:

1. **No 24-tile cap.** The reference slices its grid to 24 with nothing to page past them, which
   suits its ~20-game set; our catalog runs to 102 rows, so the cap would put three quarters of it
   out of reach. The grid renders identically either way.
2. **The Category modal drives the same axis as the strip.** The reference's modal filters
   `category` while the strip filters `gameType` — two axes its partner data supports. Ours has one,
   so the modal is a second way into the same four game types rather than a third filter.
3. **`catalog.js` duplicates `tileCategoryOf` from `pages/CasinoHome.jsx`** rather than importing it,
   so `src/cb/` stays free of the page it is going to replace. Collapse the two in Phase 6.

`react-loading-skeleton` is **not** a dependency — its stylesheet is already inside `clickbet.css`,
so the placeholder is one `<span className="react-loading-skeleton">`.

**Not carried over:** the reference's `roulette-gif` launch splash, the game `<iframe>` and its
`popup-cross` close button. Those belong to its third-party launch flow; our tiles navigate to our
own table routes instead.

**Routing:** `/indianpoker` under `CbLayout`, and `navItems.js`'s `indianpoker` entry now points
there instead of `/o_casino`. The reference's own path is `/casino/INDIANPOKER`, which is not
available here — `/casino/:route` is where this app's own tables live.

### Not yet converted

Every other route still renders the old tenexch chrome through `MainLayout`: game details, racing
details, the ~230 casino/slot/virtual screens, all reports and account pages, login/2FA, and the
static policy pages. Phases 4–8 below still stand.

### Two things to pick up

1. **`src/cb/` has no `page-wrapper` padding for the bottom nav.** `MobileFooter` renders a fixed
   bar; confirm the home board's last card isn't sitting under it on a phone (original §2.6).
2. **The mirrored assets are another white-label's brand.** `public/newtheme/rcl/user/logo.svg`
   and `footerlogo.svg` came from the source build (`BRAND = 'rcl'`). They're placeholders that
   work — swapping in 1xclickbet's own logo set is still open question 2, and the `assets.js`
   indirection means it's a one-line `BRAND` change plus the files.

---

## 1. Scope

### In scope
Replace the entire **visual layer** — layout geometry, colour system, typography, component
chrome, spacing, iconography, responsive behaviour — so the rendered result matches the reference.

### Explicitly NOT in scope (must not change)
Business logic stays byte-for-byte identical. If a UI task requires touching one of these, stop
and re-scope.

| Area | Files |
|---|---|
| API layer | `src/apiservices/**` (11 services) |
| State | `src/redux/**` |
| Odds / bet-placement rules | `src/components/betting/placeBet/**`, `usePlaceBetPanel.js` |
| Socket + realtime balance | `App.jsx` socket bootstrap, `subscribeToRealTimeUpdates` |
| Casino result parsing | `src/components/casino/results/resultParsers.js` + ~60 `*Result.jsx` |
| Routing table | `src/routes/*.js` |
| Data hooks | `src/hooks/**` |

Rule of thumb: **JSX structure and `className` strings may change; hooks, handlers, selectors,
effects and network calls may not.**

### Branding note
Reproduce the *layout and colour system*. Do **not** ship the reference site's logo, wordmark,
promotional artwork or marketing copy — those are their brand assets. Substitute 1xclickbet's own
logo/banners at the same dimensions (spec in §7.3). This has zero effect on pixel parity of the
chrome, which is what the task is actually about.

---

## 2. Current architecture — what we're changing

### 2.1 Scale

| Metric | At first draft | After `dd31110` |
|---|---|---|
| JS/JSX source files | 444 | **460** (+16, all in `src/cb/`) |
| `className=` attributes | 8,139 | **8,282** |
| Unique CSS classes used in JSX | 1,041 | **1,153** |
| Legacy CSS (still styling every un-converted route) | 1.8 MB / 14 files | **unchanged** — now `<link>`-mounted, not bundled |
| Project-owned CSS | `App.css` 876 L + `variables.css` 286 L (unimported) | **`src/styles/clickbet.css` — 8,345 L / 212 KB**, token-driven |
| Static assets | 86 MB in `public/assets/` | + 68 files in `public/newtheme/` |

The legacy 1.8 MB has not shrunk yet — Option D moved it out of the bundle and behind a route
condition, but deleting it is still Phase 8 work, gated on Phases 4–7.

### 2.2 How styling works — before and after `dd31110`

This is the single most important thing to understand.

**Before.** `src/main.jsx` imported **fourteen stylesheets from `frontend/reference/`** — a
snapshot of a *previous* reference site (tenexch) — as global CSS, in this order:

```
bootstrap.min.css → all.css → control.css → font.css → color.css → style.css (550 KB)
→ animation.css → animation-mobile.css → responsive.css (222 KB) → main.css
→ wolf-custom.css → ten-custom.css → theme.css → custom.css
→ src/styles/themes/dark.css → src/App.css
```

**Now.** `main.jsx` imports only three things globally: Bootstrap 5.3, Font Awesome 4.7, and
`src/styles/clickbet.css`. The fourteen tenexch sheets are imported **as URLs** (`?url`) by
`src/legacyStyles.jsx` and mounted as `<link>` elements — ref-counted — only while `MainLayout`
is rendered. Convert a page to the `src/cb/` tree and it stops rendering `<LegacyStyles/>`, and
the old rules stop applying to it. They append to `<head>` *after* `clickbet.css`, so on a legacy
route the old cascade still wins exactly as it did.

The remaining structural facts below still apply to every un-converted route.

1. **The old tree has no design system of its own.** `src/styles/variables.css` defines ~90 tokens
   and is still not imported anywhere — it documents the vendored palette rather than driving it.
   Most colours in `reference/style.css` are hardcoded hex, not `var()`. (`clickbet.css` *does*
   carry a real `:root` token block — 105 custom properties — so the new tree is token-driven.)
2. **Every un-converted component is coupled to vendored class names.** `casino-box-odd` (362 uses),
   `casino-bl-box` (352), `sportscardRow`, `center-main-content`, `main-container`, `sidebar-left`,
   `report-container`, `header-casino` — and `App.jsx` branches its routing chrome on them
   (`containerClass` / `renderContent()`, `App.jsx:158-330`).
3. **Layout is decided by sibling selectors.** e.g. `.sidebar-left ~ .main-container` and
   `.header-casino ~ .center-main-content.report-container`. `App.jsx` renders an otherwise-useless
   `<Sidebar/>` on virtual-casino routes *purely so that selector matches*. Any CSS replacement must
   preserve or deliberately replace this contract.
4. **Load choreography is baked into `index.html`.** Critical CSS for the splash/loader is inlined
   in `<head>` because the real CSS ships inside the JS bundle. Its hardcoded fallbacks
   (`#DFE5E5`, `#16191C`) must be updated too, or the first paint flashes the old theme.

### 2.3 Current palette (the "TENEXCH" skin)

| Token | Value |
|---|---|
| `--bg-body` | `#DFE5E5` (grey) |
| `--bg-primary` | `#FFB80C` (amber — brand accent) |
| `--bg-secondary` | `#222222` |
| `--bg-table` | `#FDFBFE` |
| `--text-fancy` | `#FDCF13` |
| `--back` / `--lay` | `#72bbef` / `#f994ba` |
| Success / danger | `#03b37f` / `#fc4242` |

### 2.4 Page surface to be restyled

- **Layout shell (4 files):** `Header.jsx` (785 L — holds `HeaderTop`, `MainHeader`,
  `MobileSidebar`, `MobileUserSidebar`), `Sidebar.jsx`, `SidebarTreeMenus.jsx`, `Footer.jsx`
- **Home (7):** `BannerCarousel`, `SportTabsDesktop`, `SportTabsMobile`, `NewEvents`,
  `UpcomingFixture`, `HomeCasinoCarousel`, `AviatorSvg`
- **Sports/betting (12):** `BetTable`, `MatchRow`, `OddsCell`, `PlaceBetPanel`, `CombinedBetSlip`,
  `HomeBetSlipModal`, `MatchedBetsTable`, `SportDetailView`, `CricketDetailView`, `RacingTable`,
  `GameDetails.jsx` (921 L), `RacingDetails.jsx`
- **Casino (~230):** ~90 game pages, ~60 `BetTable*.jsx`, ~60 `results/*.jsx`, ~30 `rules/*.jsx`,
  plus `CasinoHome.jsx` (653 L), `CasinoVideo`, `CasinoTimer`, `CasinoCards`, modals
- **Reports/account (12):** `AccountStatement`, `CurrentBets`, `ActivityLog`, `LiveCasinoBets`,
  `SportBookBets`, `FraudReport`, `SecurityAuth`, `CasinoResults`, …
- **Auth & static (6):** `Login`, `TwoFactorAuth`, `TermsAndConditions`, `ResponsibleGaming`,
  `policyPageShared`

---

## 3. Reference design system (measured from the live site)

Extracted from `https://www.clickbetexchenge.com/assets/index-BPHPthvp.css` (178 KB, single
bundle) and `index-szMe67kU.js` (1.18 MB). The reference is a **Vite + React SPA — the same stack
as ours**, which makes this a favourable migration.

### 3.1 Stack facts

| | Reference | Ours today | Action |
|---|---|---|---|
| Bootstrap | 5.3.8 (CDN) | 5.3.3 (npm) + `reference/bootstrap.min.css` | Align to 5.3.8, single source |
| Icon font | Font Awesome **4.7** (CDN) | FA **6** React + `.fas` classes from vendored CSS | See §9.1 — class names differ |
| Fonts | Spartan + Inter (Google); **Poppins** as working family; Roboto Condensed for numerics | "Noto Sans" via `index.html` | Swap stack |
| Theme switch | `<body class="dark-theme">` — **vestigial**, no `.dark-theme` rules exist | `data-brand` + `themes/*.css` | Reference is **light-theme only** |
| Toasts | react-toastify | react-toastify + react-hot-toast (`BToast.jsx`) | Keep ours; restyle only |

> The reference ships a light UI; our current skin is dark/amber. This is a **full polarity flip**,
> not a hue tweak — expect every hardcoded colour in the vendored CSS to be wrong.

### 3.2 Colour tokens

**Surfaces**

| Token | Value | Used for |
|---|---|---|
| `--bodybg` | `#F8F7FA` | page background |
| `--primary-bgcolork` | `#FFFFFF` | header, sidebar, cards |
| `--card-bg` | `#FFFFFF` | `.sportscardRow` panels, footer |
| `--secondary-bgcolork` / `--section-bg` | `#3C8ACB` | **brand blue** — section headers, primary buttons |
| `--headermenu-bottomborder` | `#3C8ACB` | active nav underline |
| `--sidemenu-iconbg` | `#1F2C38` | sport-icon chips in the sidebar |
| `--sidetree-bg` | `#2B293C` | expanded sidebar tree nodes |
| `--mobile-footerbg` | `#18162A` | mobile bottom nav |
| `--marquee-bg` | `#002F5E` | news ticker strip |
| `--popup-profilebox` | `#18162A` | profile popover |

**Text**

| Token | Value |
|---|---|
| `--primary-textcolork` | `#1F2C38` |
| `--headermenu-textcolor` | `#000000` |
| `--text-green` | `#05A30B` |
| `--text-red` | `#CA1616` |
| `--minmax-textcolor` | `rgba(0,0,0,.5)` |
| `--fancy-text` | `#BCBCBC` |
| `--minimumamount` | `#3C3C3C` |

**Odds ladder** — hardcoded in the reference, not tokenised:

| Class | Background | Hover |
|---|---|---|
| `.back` | `#72BBEF` | `#95CBF0` @ 20% |
| `.back1` | `#B7D5EB` | — |
| `.lay` | `#FAA9BA` | `#FAA9BA` @ 20% |
| `.lay1` | `#EFD3D9` | — |
| `--bg-1x2` | `#858585` | — |
| `--fancypartbg` | `#CCD5E1` | — |
| `--cashout-btn-bg` | `#D7E8F4` | — |
| `--inplay-horse-btn-bg` | `#B4C1CD` | — |

> **Good news:** the back/lay base colours (`#72bbef` / `#faa9ba`) are **identical to ours**. The
> highest-risk surface — the odds grid — needs essentially no colour work. Only the surrounding
> chrome changes.

**States**

| Token | Value |
|---|---|
| `--suspended-bg` | `rgba(0,0,0,.52)` |
| Suspended label colour | `#FF6464` |
| `--table-border-color` | `#DEE2E6` |
| `--bottomborder` | `#D9D9D9` |
| `--btn-dropshadow` | `drop-shadow(1px 2px 4px #3C8ACB)` |
| `--model-boxshadow` | `#05A30B7A` |
| Skeleton base / highlight | `#EBEBEB` / `#F5F5F5` |

### 3.3 Layout geometry (desktop, ≥1200px)

```
┌──────────────────────────────────────────────────────────────┐
│  header            fixed, top:0, height 70px, bg #FFF        │
├──────────────────────────────────────────────────────────────┤
│  .marqueebox       fixed, top:70px, height 28px, bg #002F5E  │
├───────────────┬──────────────────────────────────────────────┤
│ .sidebar      │  .page-wrapper                               │
│ fixed         │  margin: 98px 0 0 252px                      │
│ top: 98px     │  padding: 0 7px 15px                         │
│ bottom: 0     │                                              │
│ width: 252px  │  ┌────────────────────────────────────────┐  │
│ bg #FFF       │  │ .sportscardRow                         │  │
│ padding 10px  │  │ bg #FFF · radius 10px                  │  │
│ overflow-y:   │  │ shadow 0 0 1rem rgb(0 0 0 / 10%)       │  │
│   auto        │  │ margin 15px 0 · padding 4px 2px 3px    │  │
│ transition    │  └────────────────────────────────────────┘  │
│  .5s ease     │                                              │
├───────────────┴──────────────────────────────────────────────┤
│  .footermain   margin-left: 252px, bg #FFF, padding 10px     │
└──────────────────────────────────────────────────────────────┘
```

Key constants — **these drive everything**:

| Constant | Value |
|---|---|
| Header height | `70px` |
| Marquee height | `28px` |
| **Total top offset** | **`98px`** |
| Sidebar width | `252px` |
| Sidebar transition | `all .5s ease` |
| Content padding | `0 7px 15px` |
| Card radius | `.625rem` (10px) |
| Card shadow | `0 0 1rem rgb(0 0 0 / 10%)` |
| Card vertical rhythm | `margin: 15px 0` |
| Logo slot | `300px` desktop / `220px` compact |
| Hero banner offset | `margin: 99px 0 0 252px` |

### 3.4 Layout geometry (mobile, ≤991px)

- Sidebar becomes an off-canvas drawer (same `.5s ease` slide, `.sidebar-show` toggle).
- `.page-wrapper` and `.footermain` margin-left drop to `0`.
- `.marqueebox` goes `position: relative; top: 0; z-index: 0` — stops being fixed.
- **`.bottom-nav` appears:** `position: fixed; bottom: 0; width: 100%; background: #18162A;`
  `padding: 5px 0 4px; border-top-left-radius: 25px; border-top-right-radius: 25px;`
  `display: flex; justify-content: space-around; align-items: flex-end; z-index: 9`.
  Items are `.nav-item`, with `.nav-item.home` as the raised centre item.
- Card padding-bottom increases to `8px`.

### 3.5 Breakpoints

`1199 · 991 · 767 · 575 · 500 · 480 · 469 · 414 · 390 · 375 · 374 · 320`

The first four are structural. Below `480` is fine-tuning for small phones — mirror those only
where a real overflow appears.

### 3.6 Component inventory (956 classes; the ones that matter)

| Group | Classes |
|---|---|
| Shell | `page-wrapper`, `header-inner`, `logo`, `headermenu`, `header-scroll-menu`, `header-menubox`, `mobile-menu`, `marqueebox`, `marqueetext`, `sidebar`, `sidebartree`, `sidetree`, `tree-node`, `tree-node-group--expanded`, `bottom-nav`, `nav-item`, `footermain`, `footerlogo`, `footer-providers__list`, `partner_logo`, `casinopartnerlogo` |
| Cards / markets | `sportscardRow`, `mainsports`, `mainsports-title`, `rmain-title`, `tournaments-box`(`-head`/`-body`/`-footer`), `marketOdd`, `oddsList`, `oddsRow`, `runnerOdds`, `runnerName`, `backlayHead`, `backlay-header`, `backlayText`, `minMax`, `oddMin`, `suspended`, `eventdetails-45`, `eventdetails-54` |
| Fancy | `fancyList`, `fancybox`, `fancybox-main`, `fancyOdds`, `fancyOdds-row`, `fancyOdds-row-wrapper`, `fancyOdds-group-header`, `fancyOdds-merged-market`, `fancyOdds-multirunner`, `fancyYesNo`, `fancysuspendbox`, `fancypartbg`, `fancy24-width`, `fancy61-width` |
| Bet slip | `betplace-betbox`, `betp-bgbox`(`--odds`), `betlplacestake`, `betname-place`, `betplace-minmax`, `Placebet`, `placebg`, `cancelbg`, `stakebtn`, `keypad-box`, `odds-adj-btn`(`--back`/`--lay`), `mobile-betslip-box`, `mobilebetslip`, `matched-bet-table`, `matched-bet-slips`, `expo-table`, `expo-modal` |
| Casino / slots | `popular-gamebox`, `popularimg`, `gamenamebox`, `gamenamebtn`, `game-type-arrow`(`-left`/`-right`), `game-type-container`, `categorymodel`, `categorypopbox`, `slots__overlay`, `waccasino-search-*`, `sportbook-livecasino` |
| Home | `banner`, `bannerbtn`, `dbanner`, `mbanner`, `innerbanner`, `spbannerbox`, `home-pramotionbanner-box`, `sliderbannerinner-img`, `sportsgamebg`, `sportimg`, `sport-name`, `sportbg-gradiant`, `sports-slider`, `sports-icon`, `sideiconbg` |
| Racing | `Horsemainbox`, `horseracing`, `horse-banner-event-name`, `horse-banner-text`, `horse-event-title-box`, `horse_info-hover`, `horseinplaybtn` |
| Reports | `reporttable`, `reportbtn`, `reportallpopup`, `closingrp-table`, `footer-pagination`, `searchandentries-first`/`-second`, `resport-search`, `wacfilter-box`, `wacmain-box`, `csv-icon`, `pdf-icon`, `excel-icon` |
| Auth / account | `loginbtn`, `loginbtn-new`, `login-register-btn`, `signupbtn`, `password-eye`, `password-rules`, `captchabox`, `profile-menu`, `profile-header`, `popup-profilebox`, `currencybox-header`/`-body`, `paymentbox`, `payment-btn`, `gpay-btn`, `header_Deposit_btn`, `header_Withdrawal_btn`, `header-dw-btn`, `beneficiary-add-new-popup` |
| Vendor | `slick-*` (carousel), `rdt*` (datetime picker), `react-tel-input` (281 rules), `Toastify__*`, `react-loading-skeleton` |

### 3.7 Navigation / IA labels observed

- **Top nav:** Home · Inplay · Sports · Casino · Support · Live · Login · Demo Account
- **Sidebar:** `SPORTS` (Cricket, Soccer, Tennis, Horse Racing, Greyhound, Kabaddi, Football,
  Election) · `POPULAR GAMES` · `CASINO` · `LOBBY`
- **Reports:** Bet History, Account Statement, Profit/Loss, Unsettled Bet, Set Stake,
  Change Password, BALANCE REPORT, GAME REPORT, SETTLEMENT REPORT, User Market Bets
- **Footer:** Supports, Faqs, Blog, ResponsibleGaming, ContactUs, TermsAndCondition, PrivacyPolicy,
  BettingRules, RulesRegulations, DepositsWithdrawRules, CookiePolicy
- **Betting UI:** Back, Lay, Suspended, Book, Stake, Profit, Place Bet, Min / Max, Cash Out,
  Matched Bet, Exposure, P&L, Live Tv, Odds, Stakes, Yes/No
- **Empty states:** "No Data Found", "No open bets for this market.", "This event is no longer
  available.", "No Active Events Found", "No Bet History", "No Profit & Loss Found"
- **Misc:** Download APK, Referral code, Remember me, Resend OTP, Connect with us, PLEASE NOTE,
  language toggle English/Hindi

> We already have equivalents for nearly all of these. Align a label to the reference only when it
> is **generic UI vocabulary** (e.g. "Min / Max"). Do not copy marketing sentences.

---

## 4. Gap analysis — current vs. target

| Dimension | Current | Target | Severity |
|---|---|---|---|
| Theme polarity | dark chrome, amber accent | **light chrome, blue accent** | 🔴 total |
| Body background | `#DFE5E5` | `#F8F7FA` | 🟡 token |
| Accent | `#FFB80C` amber | `#3C8ACB` blue | 🔴 every button/header/tab |
| Header | single row, vendored `header`/`header-casino` variants | 70px bar + separate 28px marquee, `header-inner` | 🔴 rebuild |
| News ticker | inline `NewsStrip`, mobile-only (`App.jsx:70-90`) | fixed `.marqueebox` at `top:70px`, **desktop + mobile** | 🔴 restructure |
| Sidebar | `sidebar-left`, width from vendored CSS, accordion | `.sidebar` 252px fixed @ top 98px, `.sidebartree` nodes on `#2B293C` | 🔴 rebuild |
| Content offset | driven by `.sidebar-left ~ .main-container` sibling selectors | explicit `margin: 98px 0 0 252px` on `.page-wrapper` | 🔴 architecture |
| Mobile nav | `b-sidebar` drawers, no bottom bar | drawer **+ `.bottom-nav`** rounded dark bar | 🔴 new component |
| Cards | vendored panel styles | `.sportscardRow` — white, 10px radius, soft shadow, 15px rhythm | 🟠 systematic |
| Odds cells | `#72bbef` / `#f994ba` | **same** | 🟢 none |
| Suspended overlay | vendored | `rgb(0 0 0/52%)` veil + `#FF6464` label, 40px, 8px radius | 🟡 restyle |
| Fonts | Noto Sans | Poppins (+ Roboto Condensed numerics) | 🟠 global |
| Icons | FA6 React components | FA4 CSS classes | 🟠 audit |
| Footer | 69-line simple footer | `.footermain` + provider logo grid + payment partners | 🟠 rebuild |
| Skeletons | none | `react-loading-skeleton` (`#EBEBEB`/`#F5F5F5`) | 🟡 additive |
| Casino tables (~230 files) | vendored `casino-*` classes | re-skin under new palette | 🟠 bulk, token-driven |

---

## 5. Strategy

Three options were considered.

**Option A — Token swap only.** Redefine variables, override the worst offenders in `App.css`.
*Rejected:* the vendored CSS hardcodes most colours, and the layout geometry genuinely differs
(98/252 offsets, bottom nav, marquee bar). Produces a "close but visibly wrong" result — which
fails the pixel-parity requirement — and leaves 1.8 MB of dead CSS fighting every override.

**Option B — Delete vendored CSS, rewrite from scratch.** Maximum fidelity.
*Rejected as a single step:* 8,139 `className` attributes across 444 files depend on it. A big-bang
cut breaks all ~230 casino screens simultaneously with no way to bisect.

**Option C — Layered strangler.** Add a project-owned layer that loads *after* the vendored CSS and
progressively takes ownership, family by family. This was the original recommendation here.
***Superseded — it does not work.*** The two stylesheets both style bare element selectors and a
large set of the same class names (`.banner`, `.logo`, `.sidebar`, `.title`, `.footer`). Loading
both reshapes whichever one loses the cascade: in practice tenexch's `.banner { display: flex }`
turned the clickbet hero carousel into a flex item and blew its width out to Chrome's layout limit.
Layering cannot be made safe by ordering alone.

### Option D — Route-level strangler with mutually exclusive stylesheets ✅ **ADOPTED (`dd31110`)**

Only one of the two stylesheets is ever live in the document.

- `clickbet.css` is global and owns the app by default.
- The tenexch sheets are imported as URLs and mounted as `<link>`s by `<LegacyStyles/>`, which only
  the old `MainLayout` renders. They are ref-counted, so two legacy routes mounted at once (or a
  remount mid-transition) can't have the first unmount pull the sheets out from under the second.
- The new UI lives in a **parallel tree** at `src/cb/` rather than editing the old components in
  place, so a route is either fully converted or fully legacy — never half-styled.
- Migration advances **route by route** in `App.jsx`: `/` and `/home` point at `CbLayout`, and
  `/*` still falls through to `MainLayout`.

Why this is the better call:
- It removes the cascade-collision class of bug entirely, rather than mitigating it per page. The
  original §9.4 warning about double spacing during the overlap is now structurally impossible.
- Each route converts atomically and is trivially revertible — flip one `<Route>` back.
- The old components stay untouched and keep working, so there is no window where a casino screen
  is half-migrated.

The trade-off it accepts: two component trees coexist for the duration, and shared behaviour
(`useHomeLoad`, `TAB_SPORT_MAP`, redux, the API layer) is imported across the boundary rather than
duplicated — which is exactly right, and is what keeps the "no logic changes" rule intact.

---

## 6. Target CSS architecture

```
src/styles/
├── tokens/
│   ├── palette.css        # raw colour scale, no semantics
│   ├── semantic.css       # --surface-card, --accent, --nav-bg … maps palette → roles
│   ├── typography.css     # font stacks, size scale, weights
│   └── layout.css         # --header-h, --marquee-h, --sidebar-w, --top-offset
├── base/
│   ├── reset.css
│   ├── elements.css       # body, headings, links, scrollbars, d-none-* helpers
│   └── bootstrap-bridge.css   # re-points Bootstrap 5.3.8 vars at our tokens
├── layout/
│   ├── header.css
│   ├── marquee.css
│   ├── sidebar.css
│   ├── bottom-nav.css
│   ├── page-wrapper.css
│   └── footer.css
├── components/
│   ├── card.css           # .sportscardRow and friends
│   ├── odds.css           # back/lay ladder, suspended, min-max
│   ├── fancy.css
│   ├── betslip.css
│   ├── tables.css         # reports
│   ├── forms.css
│   ├── modals.css
│   ├── buttons.css
│   └── skeleton.css
├── pages/
│   ├── home.css
│   ├── detail.css
│   ├── casino.css
│   ├── racing.css
│   ├── reports.css
│   └── auth.css
└── index.css              # single entry, @imports the above in order
```

`main.jsx` becomes:

```js
import 'bootstrap/dist/css/bootstrap.min.css';   // npm, pinned 5.3.8
import './styles/index.css';                      // ← the new system
// vendored reference/*.css imports removed one family at a time
```

**Ordering rule:** `tokens → base → layout → components → pages`. Nothing outside `tokens/`
declares a raw hex value; enforce with lint (§11).

### 6.1 Layout tokens (define once, use everywhere)

```css
:root {
  --header-h: 70px;
  --marquee-h: 28px;
  --top-offset: 98px;          /* header + marquee */
  --sidebar-w: 252px;
  --content-pad: 0 7px 15px;
  --card-radius: 0.625rem;
  --card-shadow: 0 0 1rem rgb(0 0 0 / 10%);
  --card-gap: 15px;
  --shell-transition: all 0.5s ease;
  --bottom-nav-h: 56px;
  --bottom-nav-radius: 25px;
}
```

Every geometry rule references these. Changing the header height must be a one-line edit.

---

## 7. Design token map

### 7.1 Colour — old → new

| Role | Current | **New** |
|---|---|---|
| Page background | `#DFE5E5` | `#F8F7FA` |
| Card / panel | `#FDFBFE` | `#FFFFFF` |
| Header background | vendored dark | `#FFFFFF` |
| Sidebar background | vendored | `#FFFFFF` |
| Brand accent | `#FFB80C` | `#3C8ACB` |
| Section header | `#222222` | `#3C8ACB` |
| Primary text | `#222222` | `#1F2C38` |
| Nav text | — | `#000000` |
| Sidebar icon chip | — | `#1F2C38` |
| Sidebar tree node | — | `#2B293C` |
| Mobile bottom nav | — | `#18162A` |
| Marquee strip | — | `#002F5E` |
| Success text | `#03B37F` | `#05A30B` |
| Danger text | `#FC4242` | `#CA1616` |
| Back | `#72BBEF` | `#72BBEF` *(unchanged)* |
| Back tint | `#72BBEFCC` | `#B7D5EB` |
| Lay | `#F994BA` | `#FAA9BA` |
| Lay tint | `#F994BACC` | `#EFD3D9` |
| Suspended veil | vendored | `rgb(0 0 0 / 52%)` |
| Suspended label | — | `#FF6464` |
| Table border | — | `#DEE2E6` |
| Divider | — | `#D9D9D9` |
| Fancy band | — | `#CCD5E1` |
| Cashout button | — | `#D7E8F4` |
| 1X2 neutral | — | `#858585` |
| Muted / min-max | — | `rgb(0 0 0 / 50%)` |
| Skeleton base / highlight | — | `#EBEBEB` / `#F5F5F5` |

### 7.2 Typography

| Role | Value |
|---|---|
| Primary family | `Poppins, Inter, "Segoe UI", system-ui, sans-serif` |
| Numeric / odds | `"Roboto Condensed", Roboto, sans-serif` |
| Sidebar tree node | `12px / 500`, `padding 2px 5px`, `radius 5px` |
| Suspended label | `.656rem`, `700`, `text-transform: capitalize` |

**Recommendation: self-host** Poppins/Inter into `public/assets/fonts/`. `index.html` already
preconnects to a CDN for banners; adding a render-blocking Google Fonts request in front of the
splash-loader choreography (`main.jsx:60-100`) risks a FOUT during the boot sequence.

### 7.3 Brand assets to produce

Replace, don't copy. Required at these dimensions:

| Asset | Spec | Current path |
|---|---|---|
| Desktop logo | fits `300px` wide slot (`.logo`) | `public/assets/brand/logo.png` |
| Compact logo | fits `220px` | — |
| Mobile drawer logo | header slot in `MobileSidebar` | `public/assets/brand/logo.png` |
| Favicon | 32×32 | `public/assets/tenexch-favicon.png` → rename |
| Bottom-nav icons | 5 items, monochrome on `#18162A` | new |
| Sidebar sport icons | chip on `#1F2C38` | `public/assets/icons/` |
| Login background | desktop + mobile | `login-bg-ten.jpg`, `login-bg-mobile-ten.jpg` |
| Footer provider / payment logos | grid | `public/assets/` |

Also update: `<title>` in `index.html`, the marquee copy in `App.jsx` `NewsStrip` (currently
"Welcome to new version of TENEXCH…"), and the `alt="TENEXCH"` strings in `Header.jsx`.

---

## 8. Phased work plan

Each phase ends in a shippable state. Phases 3+ can partly parallelise.

> **Status after `dd31110`:** Phases 0–3 are essentially complete **for the home route**, though
> delivered through the Option D architecture rather than the token/`index.css` skeleton these
> phase tables describe. Where a task below says "write `tokens/palette.css`", the equivalent
> shipped as the `:root` block at the top of `src/styles/clickbet.css`. Phases 4–8 stand as
> written, with the per-phase note that each converted route now means **a new component under
> `src/cb/` plus a `<Route>` flip**, not an edit to the old component.

### Phase 0 — Groundwork (0.5 day) — ✅ mostly done

Shipped: `clickbet.css` with its `:root` token block, Bootstrap loaded once from npm, Font
Awesome 4.7 added, `src/cb/` tree stood up.
**Still open:** 0.2/0.3 — the baseline and reference screenshot sets. These are the acceptance
artefact for §10 and nothing downstream can be verified without them; capture them before Phase 4.

| # | Task |
|---|---|
| 0.1 | Branch `feat/ui-clickbet`. Tag current `main` as `pre-ui-revamp` for visual diffing. |
| 0.2 | Capture a **baseline screenshot set**: 20 key screens × 3 viewports (1440 / 768 / 390) → `docs/ui-baseline/`. |
| 0.3 | Capture a **reference screenshot set**: same screens on the reference site → `docs/ui-target/`. This is the acceptance artefact. |
| 0.4 | Stand up the `src/styles/` skeleton from §6, with `index.css` imported **last** in `main.jsx`. Empty files are fine. |
| 0.5 | Write `tokens/palette.css` + `semantic.css` + `layout.css` from §3.2 / §6.1. |
| 0.6 | Pin Bootstrap to `5.3.8`; drop `reference/bootstrap.min.css` from `main.jsx`. Smoke-test grid + modals. |
| 0.7 | Add font files + `@font-face` in `tokens/typography.css`. Update `index.html` inline critical CSS (`body`, `.app-splash`) to `#F8F7FA` / `#FFFFFF`. |

**Exit:** app looks unchanged, token layer exists, boot splash is the new colour.

---

### Phase 1 — Shell: header + marquee (2 days) — ✅ done

Shipped as `src/cb/layout/Header.jsx` (`header-inner` / `logo` / `headermenu header-scroll-menu` /
`mobile-menu` / `loginbtngroup`) plus a real `marqueebox` driven by `react-fast-marquee`. Nav
entries come from `src/cb/navItems.js`; the active sport is held in the URL as `?sport=` by
`useSportTab.js`, which is what lets the header, the sidebar and the home pills drive one board
without a shared provider.

Note task 1.6 landed differently: rather than adding `.page-wrapper` *alongside* the legacy
containers, `CbLayout` owns its own `middlepart > page-wrapper` and the legacy containers simply
never render on that route. Cleaner, and only possible because of Option D.

The shell defines the 98px offset every other screen depends on. Do it first.

| # | Task | Files |
|---|---|---|
| 1.1 | Rebuild `HeaderTop` / `MainHeader` markup to `.header-inner > .logo + .headermenu + .header-menubox`; fix at `height:70px`, `bg #FFF`. | `Header.jsx:469-785` |
| 1.2 | Nav items: `.headermenu.header-scroll-menu`; active state = 2px `#3C8ACB` bottom border, text `#000`; horizontal scroll on overflow. | `Header.jsx`, `layout/header.css` |
| 1.3 | Right cluster: balance/exposure box, `.header_Deposit_btn` / `.header_Withdrawal_btn` (`.header-dw-btn`), profile popover on `#18162A` (`.popup-profilebox`), login/demo buttons. | `Header.jsx` |
| 1.4 | **Promote the news ticker to a real bar.** Extract `NewsStrip` from `App.jsx` into `components/layout/Marquee.jsx`; render as `.marqueebox` — fixed, `top:70px`, `height:28px`, `bg #002F5E`, full width, desktop **and** mobile. On ≤991px → `position:relative; top:0; z-index:0`. | `App.jsx:70-90` → new file |
| 1.5 | `.mobile-menu` hamburger; keep existing `MobileSidebar` open/close logic untouched, restyle only. | `Header.jsx:123-336` |
| 1.6 | Introduce `.page-wrapper` with `margin: var(--top-offset) 0 0 var(--sidebar-w); padding: var(--content-pad)`. | `App.jsx`, `layout/page-wrapper.css` |

> ⚠️ **Do not delete `main-container` / `center-main-content` / `report-container` / `header-casino`
> yet.** `App.jsx:158-330` branches on them, and vendored sibling selectors still supply spacing to
> un-migrated pages. Add `.page-wrapper` *alongside*; remove the old classes in Phase 8.

**Exit:** header + marquee pixel-match at all three viewports; content sits at exactly 98px.

---

### Phase 2 — Shell: sidebar + bottom nav + footer (2 days) — ✅ done

Shipped as `src/cb/layout/Sidebar.jsx` (`tree sidebartree` / `tree-node` / `sidetree` /
`sports-icon sideiconbg`, plus the odds-format switch), `Footer.jsx` (`footerlogo`,
`footer-providers__list`, `partner_logo casinopartnerlogo`) and **`MobileFooter.jsx`** — the
`.bottom-nav` bar with its raised `.nav-item.home`, which had no equivalent in the old UI.

**Task 2.6 is still open:** nothing yet reserves the bottom bar's height in the page padding.
Check the home board's last card on a phone before calling this closed.

| # | Task | Files |
|---|---|---|
| 2.1 | `.sidebar`: `position:fixed; top:98px; bottom:0; left:0; width:252px; background:#FFF; padding:10px; overflow-y:auto; transition:all .5s ease; z-index:999`. | `Sidebar.jsx`, `layout/sidebar.css` |
| 2.2 | Sport rows: `.sports-icon.sideiconbg` chip on `#1F2C38` + `.sport-name`. Section heads `SPORTS` / `POPULAR GAMES` / `CASINO`. | `Sidebar.jsx` |
| 2.3 | Tree menu: `.sidebartree` / `.sidetree` (`12px/500`, `padding 2px 5px`, `radius 5px`, bg `#2B293C`), `.tree-node`, `.tree-node-group--expanded`. Keep existing expand/collapse state logic. | `SidebarTreeMenus.jsx` |
| 2.4 | Mobile drawer: same `.5s` slide via `.sidebar-show`; backdrop. Reuse existing `b-sidebar` handlers. | `Header.jsx` `MobileSidebar` |
| 2.5 | **New `BottomNav.jsx`** — fixed, `#18162A`, `border-top-{left,right}-radius:25px`, `justify-content:space-around`, `align-items:flex-end`, `z-index:9`, hidden above 991px. Raised centre `.nav-item.home`. Wire to existing routes. | new `components/layout/BottomNav.jsx` |
| 2.6 | Add `padding-bottom: var(--bottom-nav-h)` to `.page-wrapper` on mobile so the bar never covers content — check casino tables and the bet slip especially. | `layout/page-wrapper.css` |
| 2.7 | Footer: `.footermain` (`margin-left:252px`, `bg #FFF`, `padding:10px`; `0` on mobile), `.footerlogo`, `.footer-providers__list` grid, `.partner_logo` / `.casinopartnerlogo`, link columns per §3.7. | `Footer.jsx` |

> ⚠️ `App.jsx` renders `<Sidebar/>` on virtual-casino routes *only* so `.sidebar-left ~ .main-container`
> matches. Once `.page-wrapper` owns its margins that hack can go — but only after Phase 8 confirms
> nothing else depends on the sibling selector.

**Exit:** full shell matches at 1440 / 768 / 390; bottom nav present on mobile.

---

### Phase 3 — Home (2 days) — ✅ done

Shipped as `src/cb/home/Home.jsx` + `PopularGames.jsx` + `layout/Banner.jsx`, with `Slider.jsx`
wrapping `react-slick`. Covers the sport tile carousel (`sportsgamebg` / `sportimg` / `sport-name` /
`sportbg-gradiant`), the coloured sport pills (`gamenamebox`), the promo strip
(`home-pramotionbanner-box`), and the market boards via `sports/{SportList,MarketRow,RacingBoard}`.

Two behaviours worth knowing, both deliberate and both matching the reference:
- **Logged out** shows one board at a time; **logged in** stacks every sport's board at once.
- `/` renders the In-Play board but highlights nothing in the nav, because In-Play is a route of
  its own in the reference and we don't have it.

Task 3.7 (skeleton loaders) was not part of this commit.

| # | Task | Files |
|---|---|---|
| 3.1 | `.banner` hero — `margin: 99px 0 0 252px`, `padding-top: 28px`; `.dbanner` / `.mbanner` split; `.bannerbtn` CTA. | `BannerCarousel.jsx` |
| 3.2 | Sport tabs → `.sportsgamebg` tiles with `.sportimg` + `.sport-name` + `.sportbg-gradiant` overlay; `.sports-slider` carousel. | `SportTabsDesktop.jsx`, `SportTabsMobile.jsx` |
| 3.3 | Match list cards → `.sportscardRow` + `.mainsports` / `.mainsports-title`; `.tournaments-box` head/body/footer. | `BetTable.jsx`, `MatchRow.jsx` |
| 3.4 | Odds columns → `.oddsList` / `.oddsRow.runnerOdds` with `.eventdetails-45` / `.eventdetails-54` width variants. | `OddsCell.jsx` |
| 3.5 | Casino carousel → `.popular-gamebox` / `.popularimg` / `.gamenamebox` / `.gamenamebtn`. | `HomeCasinoCarousel.jsx` |
| 3.6 | Promo strip → `.home-pramotionbanner-box` / `.sliderbannerinner-img` / `.innerbanner`. | `Home.jsx` |
| 3.7 | Loading states → `react-loading-skeleton` (`#EBEBEB`/`#F5F5F5`) where the reference shows skeletons. | `Home.jsx` (view only) |

> ⚠️ `Home` is remounted via `key={location.key}` (`App.jsx`) to re-run load choreography. Do not
> remove that key while restyling.

---

### Phase 4 — Sports detail + odds + bet slip (3 days)

The highest-risk phase: this is where money is placed.

| # | Task | Files |
|---|---|---|
| 4.1 | Detail shell → `.eventdetail-main` / `.eventdetails-leftside` / `.eventdetails-rightside` / `.eventtitle-box`. | `GameDetails.jsx` (921 L) |
| 4.2 | Market blocks → `.marketOdd`, `.backlay-header`, `.backlayHead` (note: `display:none !important` in the reference — that header row is hidden), `.runnerName`, `.minMax` / `.oddMin`. | `SportDetailView.jsx`, `BetTable.jsx` |
| 4.3 | Back/lay cells — **colours unchanged**; only radius, spacing and hover tints (`#95CBF0`@20% / `#FAA9BA`@20%) change. | `OddsCell.jsx`, `components/odds.css` |
| 4.4 | Suspended overlay → `position:absolute; width:100%; height:40px; background:rgb(0 0 0/52%); color:#FF6464; font-weight:700; font-size:.656rem; text-transform:capitalize; border-radius:.5rem; cursor:no-drop`. | `components/odds.css` |
| 4.5 | Fancy markets → the `.fancyOdds-*` family + `.fancypartbg` `#CCD5E1` band, `.fancyYesNo`, `.fancysuspendbox`, `.fancy24-width` / `.fancy61-width`. | `CricketDetailView.jsx` |
| 4.6 | Bet slip → `.betplace-betbox`, `.betp-bgbox`(`--odds`), `.betlplacestake`, `.betname-place`, `.betplace-minmax`, `.Placebet.placebg` / `.cancelbg`, `.stakebtn`, `.odds-adj-btn--back/--lay`, `.keypad-box`. | `PlaceBetPanel.jsx`, `CombinedBetSlip.jsx`, `HomeBetSlipModal.jsx` |
| 4.7 | Mobile slip → `.mobile-betslip-box` / `.mobilebetslip` (bg `#1F2C38`, active `#3C8ACB`, text `#FFF`). | `PlaceBetPanel.jsx` |
| 4.8 | Matched bets / exposure → `.matched-bet-table`, `.matched-bet-slips`, `.expo-table`, `.expo-modal`. | `MatchedBetsTable.jsx` |
| 4.9 | Cash out → `.cashout-btn` on `#D7E8F4`, `.cashout-dropdown-item`. | `SportDetailView.jsx` |

> 🚨 **Hard rule:** `src/components/betting/placeBet/**` is logic-only. Restyle `PlaceBetPanel.jsx`'s
> markup; do not touch `usePlaceBetPanel.js`, `placeBetRules.js`, `placeBetLiveChecks.js`,
> `bufferTime.js`, `betAttemptTracker.js`. Every stake/odds/exposure number must be identical before
> and after — verify with a side-by-side bet on staging.

---

### Phase 5 — Racing (1 day)

`.Horsemainbox`, `.horseracing`, `.horse-banner-event-name`, `.horse-banner-text`,
`.horse-event-title-box`, `.horse_info-hover` (silks/jockey tooltip), `.horseinplaybtn`,
`--inplay-horse-btn-bg: #B4C1CD`.
Files: `RacingDetails.jsx`, `RacingTable.jsx`.

---

### Phase 6 — Casino, slots, virtual (4 days — the bulk)

~230 files, but almost entirely **token-driven** once the shared primitives are done.

| # | Task |
|---|---|
| 6.1 | Restyle the shared casino primitives **first**: `casino-box-odd` (362 uses), `casino-bl-box` (352), `casino-box-row` (224), `casino-nation-name` (211), `casino-bl-box-item` (194), `casino-result-*`, `casino-container`, `casino-center`, `casino-detail`, `casino-banners`. Getting these right fixes most of the 230 files for free. |
| 6.2 | Casino lobby → `.popular-gamebox`, `.game-type-container`, `.game-type-arrow-left/-right`, `.categorymodel` / `.categorypopbox`, `.waccasino-search-*`. (`CasinoHome.jsx`, 653 L) |
| 6.3 | Slots → `.slots__overlay`, provider rail. (`SlotHome.jsx`, `ProviderCategoryPage.jsx`) |
| 6.4 | Game table chrome → `CasinoVideo`, `CasinoTimer`, `CasinoCards`, `CasinoRightSidebar`, `MatkaLastResults`. |
| 6.5 | Modals → `CasinoPlaceBetModal`, `CasinoMyBetsModal`, `CasinoResultModal`, `CasinoRulesModal`, `CasinoDesktopRules`. |
| 6.6 | **Sweep the ~60 `BetTable*.jsx`.** Most need only class/token alignment. Script the audit: grep for inline `style={{` and hardcoded hex, fix by token. |
| 6.7 | Results (~60 files) + rules (~30 files) — mostly typography and table borders (`#DEE2E6`). |
| 6.8 | Virtual casino (`src/pages/vcasino/`) + `CrashPage` (has its own CSS module — align its variables to the new tokens). |

> Batch 6.6/6.7 with a codemod where possible, but review each game: the card and chip artwork in
> `public/assets/casino/` is sized for the current layout.

---

### Phase 7 — Reports, account, auth, static (2 days)

| # | Task | Files |
|---|---|---|
| 7.1 | Report tables → `.reporttable`, `.closingrp-table`, `.table-sm.table-bordered`, `.footer-pagination`, `.searchandentries-first/-second`, `.resport-search`, `.wacfilter-box`, `.reportbtn`, `.reportallpopup`, export icons. | `AccountStatement`, `CurrentBets`, `ActivityLog`, `LiveCasinoBets`, `SportBookBets`, `FraudReport`, `CasinoResults` |
| 7.2 | Pagination → `--paginationbg #FFF` / `--paginationtextcolor #000`, `.page-link`. | shared |
| 7.3 | Login/register → `.loginbtn-new`, `.login-register-title-header`, `.loogincheckbox`, `.password-eye`, `.password-rules`, `.captchabox`; `--login-input-bg #FFF`, `--login-input-border #2B293C`, `--rememberme-text-color #3C8ACB`. | `Login.jsx`, `TwoFactorAuth.jsx` |
| 7.4 | Account popovers → `.profile-menu`, `.profile-header.popup-profilebox`, `.currencybox-header/-body`, `.paymentbox`, `.payment-btn`, `.gpay-btn`, `.beneficiary-add-new-popup`. | `Header.jsx`, `SecurityAuth.jsx` |
| 7.5 | Static pages → typography scale only. | `TermsAndConditions`, `ResponsibleGaming`, `policyPageShared` |
| 7.6 | Toasts → restyle `BToast.jsx`; keep the single-toaster rule noted in `App.jsx`. | `BToast.jsx` |

---

### Phase 8 — Vendored CSS teardown + hardening (2 days)

| # | Task |
|---|---|
| 8.1 | Remove `reference/*.css` imports from `main.jsx` **one at a time**, last-loaded first (`custom` → `theme` → `ten-custom` → `wolf-custom` → `main` → `responsive` → `animation*` → `style` → `color` → `font` → `control` → `all`). Screenshot-diff after each removal. |
| 8.2 | When a removal breaks something, port the *specific* rule into the right `src/styles/` file — never re-add the whole sheet. |
| 8.3 | Delete `frontend/reference/` (1.8 MB) once all imports are gone. Keep `dfont.ttf` if still referenced. |
| 8.4 | Retire the legacy layout classes: `main-container`, `tenopen`, `tenopenhome`, `logged-in`, `center-main-content`, `center-home-content`, `center-container`, `report-container`, `header-casino`, `sidebar-left`. Simplify `App.jsx`'s `containerClass` + `renderContent()` — a ~170-line readability win. |
| 8.5 | Remove the `<Sidebar/>`-for-selector-only hack on vcasino routes. |
| 8.6 | Rebrand strings/assets: `TENEXCH` → 1xclickbet in `index.html`, `App.jsx` marquee, `Header.jsx` alt text; `tenexch-favicon.png`; `themes/tenexch.css`. |
| 8.7 | Audit `--app-height` usage (`App.jsx`) still holds with the bottom nav present. |
| 8.8 | Bundle-size check — expect a large drop. Record before/after. |

---

## 9. Cross-cutting issues to resolve early

### 9.1 Font Awesome version conflict — ✅ resolved
**Settled the opposite way to this document's original recommendation, and correctly so.**
`font-awesome@4.7.0` is now a real dependency, loaded globally in `main.jsx`, and the `src/cb/`
markup uses FA4 classes (`fa fa-bars`, `fa fa-chevron-left`, `fa fa-bullhorn`) exactly as the
reference does. FA6's React components stay in `package.json` for the legacy tree, which imports
them as components rather than classes — so the two never collide in practice.

The residual risk is the ~85 bare `.fas` class uses in the old tree: those glyphs come from the
*vendored* CSS, not from the npm FA6 package, so they will disappear when `responsive.css` and
friends are finally dropped in Phase 8. Audit them then, not now.

### 9.2 Bootstrap version 🟡
Reference is 5.3.8; we ship 5.3.3. Now loaded **once**, from npm, globally in `main.jsx` — the
vendored copy is only mounted on legacy routes by `<LegacyStyles/>`, where it goes first as before.
Bumping the npm pin to 5.3.8 is still worth doing; watch `.form-control`, `.modal-*`, `.table-*`.

### 9.3 The marquee becomes structural 🔴
Today it's a mobile-only inline strip. In the target it's a **fixed 28px bar** that the 98px offset
depends on. If it's ever conditionally hidden, the offset must become conditional too — otherwise
every page shifts by 28px. Prefer: always render the bar; hide its *content*, not the bar.

### 9.4 Sibling-selector layout contract — ✅ resolved structurally
The original concern was a page taking spacing from the legacy sibling selectors *and*
`.page-wrapper` at once during the overlap. Option D makes that impossible: the two stylesheets are
never live in the same document, so a converted route sees no legacy rules at all.

**The trap this replaced it with is sharper, and worth naming.** The two sheets style many of the
same class names (`.banner`, `.logo`, `.sidebar`, `.title`, `.footer`), so anything that causes
both to be mounted at once silently reshapes one of them — the failure mode already hit once, when
tenexch's `.banner { display: flex }` blew the clickbet hero out to Chrome's layout limit. Two
rules follow:
- **Never import a `reference/*.css` file into a module that a `src/cb/` component can reach.**
  They may only be pulled in as `?url` by `legacyStyles.jsx`.
- **Never render `<LegacyStyles/>` from the new tree**, and don't render a legacy component inside
  a `CbLayout` route — it will be unstyled, which is the *safe* failure, but it will also mount the
  sheets globally if it drags `<LegacyStyles/>` along, which is not.

The ref-counting in `legacyStyles.jsx` handles the legitimate overlap case: two legacy routes
mounted at once, or a remount during a transition.

### 9.5 Boot splash colours — ✅ resolved
`index.html` was rewritten in `dd31110`: the splash and `body` now fall back to `#F8F7FA`, the
old loader rules are gone, and the favicon points at `/favicon.ico`. No first-paint flash.

**One follow-up:** the `<title>` was set to the reference site's own title and tagline. That is
their marketing copy, not ours — replace it with 1xclickbet's own title before anything ships
publicly. Same bucket as the `BRAND = 'rcl'` assets in §0.

### 9.6 `d-none-desktop` / `d-none-mobile` / `d-none-big` / `d-none-small` 🟡
156 + 80 + 64 + 49 uses, all in the **legacy tree**, all supplied by the vendored `responsive.css`.
Under Option D they keep working on legacy routes, so this is no longer urgent — but it becomes a
Phase 8 blocker the moment those sheets are deleted. The `src/cb/` tree should not use them; it has
the reference's own `mobile-hide` / `d-none d-md-block` idioms available.

### 9.8 The two-tree boundary 🟠 *(new)*
`src/cb/` deliberately imports shared logic across the boundary — `TAB_SPORT_MAP` from
`hooks/home/useHomeLoad`, redux selectors, the API services. That is correct and is what keeps the
"no logic changes" rule intact. Two constraints follow:

- **Logic may cross the boundary; styles and chrome may not.** Importing a legacy *component* into
  `src/cb/` drags legacy class names into a document where the legacy stylesheet is not mounted —
  it will render unstyled.
- **Refactoring shared hooks now affects both trees.** `useHomeLoad` is consumed by the old `Home`
  *and* the new `cb/home/Home`. Changing its shape breaks two pages, not one, and one of them is
  the converted route. Treat it as a public API until Phase 8 deletes the old caller.

### 9.7 Inline styles 🟡
Some components carry `style={{...}}` with literal colours (the marquee's `animationDuration`,
several casino tables). Grep and migrate to tokens — inline styles beat the cascade and will
silently keep the old palette.

---

## 10. Pixel-parity workflow

"Exactly the same" needs a measurable definition. Use this loop.

### 10.1 The screen matrix
20 screens × 3 viewports (1440×900 · 768×1024 · 390×844), each logged-out **and** logged-in:

Home · Inplay · Sport (Cricket) · Match detail (with fancy) · Match detail (suspended market) ·
Bet slip open · Horse racing list · Horse race detail · Casino lobby · Casino category ·
A live casino table (Teenpatti 20) · A virtual table · Slots lobby · Login · Account statement ·
Current bets · Profit & loss · Set stake · Change password · Terms page

### 10.2 Loop
1. Screenshot the reference screen → `docs/ui-target/<screen>-<vw>.png`
2. Screenshot ours → `docs/ui-current/<screen>-<vw>.png`
3. Diff (`pixelmatch` / `odiff` / Playwright `toHaveScreenshot`)
4. Log deltas in `docs/ui-diffs/<screen>.md` with the offending selector
5. Fix in the owning `src/styles/` file — never in a component's inline style

### 10.3 Acceptance thresholds

| Element | Tolerance |
|---|---|
| Layout geometry (header/sidebar/offsets/card box) | **0 px** |
| Colours | exact hex |
| Font size / weight / line-height | exact |
| Border radius, shadow | exact |
| Content-driven differences (real odds, event names, our own logo/banners) | ignored |
| Anti-aliasing / font rendering | ≤ 2% pixel delta |

### 10.4 Tooling
Add Playwright with `toHaveScreenshot()` and commit the target set as baselines. This turns "looks
right" into a CI gate and stops Phase 6/7 from regressing Phase 1/2.

---

## 11. Guardrails

| Rule | Enforcement |
|---|---|
| No raw hex outside `src/styles/tokens/` | Stylelint `color-no-hex` with a `tokens/` ignore |
| No new `style={{ color: … }}` in JSX | ESLint rule / PR review |
| No edits under `apiservices/`, `redux/`, `hooks/`, `placeBet/`, `routes/` in a UI PR | CODEOWNERS + PR template checkbox |
| Every PR ships before/after screenshots at 3 viewports | PR template |
| `reference/*.css` import count only ever decreases | CI grep on `main.jsx` |

**Never change during this project:** odds numbers, stake ladder values, exposure/P&L maths, socket
subscription behaviour, or the bet-placement guard rails. A visual regression is recoverable; a
betting-logic regression is not.

---

## 12. Milestones

| Phase | Deliverable | Est. | Status |
|---|---|---|---|
| 0 | Token layer + Bootstrap/fonts aligned | 0.5 d | ✅ done (baselines still owed) |
| 1 | Header + marquee | 2 d | ✅ done |
| 2 | Sidebar + bottom nav + footer | 2 d | ✅ done (2.6 open) |
| 3 | Home | 2 d | ✅ done (skeletons open) |
| 4 | Sports detail + odds + bet slip | 3 d | ⬜ next |
| 5 | Racing | 1 d | ⬜ |
| 6 | Casino / slots / virtual (~230 files) | 4 d | ⬜ |
| 7 | Reports / account / auth / static | 2 d | ⬜ |
| 8 | Legacy CSS teardown + rebrand + hardening | 2 d | ⬜ |
| — | Pixel-diff pass + fixes | 2 d | ⬜ |
| | **Remaining** | **~14 days** | ≈3 weeks, 1 dev |

Two developers can run Phases 4–5 and 6–7 in parallel — the shell they both depend on has landed,
and under Option D each route converts independently, so the parallelism is now cleaner than
originally planned.

**The critical path has moved.** It was Phase 0 → 1 → 2 (the shell). That's done. The new gate is
**the screenshot baselines from tasks 0.2/0.3** — without them, Phases 4–7 have nothing to verify
against, and "pixel-perfect" reverts to opinion. Capture them before Phase 4 starts.

---

## 13. Open questions

**Still open**

1. **Brand identity — now the most urgent item.** Three things currently carry someone else's
   branding rather than 1xclickbet's: the mirrored `public/newtheme/rcl/` logo set
   (`BRAND = 'rcl'` in `assets.js`), the `<title>` in `index.html`, and the footer logo. They work
   as placeholders, and the `assets.js` indirection means swapping them is a one-line `BRAND`
   change plus the files — but they should not reach production. Who is producing the 1xclickbet
   logo, favicon, bottom-nav icons and banner artwork at the §7.3 dimensions?
2. **Dark mode?** `clickbet.css` carries `:root.dark` blocks (lines 66 and 1360) that the reference
   itself never activates. Do we want to light them up, or match the reference and stay light-only?
   *Recommendation:* light only for now — but since the tokens are already there, this is cheap
   later, and cheaper than it would have been under the original plan.
3. **Screenshot baselines** — who captures the 20 × 3 target set, and when? This is now the
   critical-path item (§12).
4. **Feature parity vs. visual parity** — the reference exposes Download APK, referral codes,
   Live TV, an English/Hindi toggle and a deposit/withdraw flow. In scope as *UI shells*, or
   omitted where our backend has no endpoint? `navItems.js` already hits this: sport entries
   resolve to home-board tabs rather than routes, because our data layer has no per-sport routes.
5. **Copy alignment** — adopt the reference's generic UI vocabulary ("Min / Max", "No Data Found")?
   Yes for generic labels; no for marketing sentences and taglines (see item 1).

**Resolved since the first draft**

- ~~Font hosting~~ — moot. `clickbet.css` carries the reference's own font stack; no Google Fonts
  request was added.
- ~~Icon library~~ — FA4 for the new tree, FA6 components for the legacy tree (§9.1).
- ~~Layered vs. mutually exclusive stylesheets~~ — settled as Option D (§5).

---

## Appendix A — Reference source of truth

| | |
|---|---|
| Page | `https://www.clickbetexchenge.com/` |
| CSS bundle | `/assets/index-BPHPthvp.css` — 178 KB, 956 classes, single file |
| JS bundle | `/assets/index-szMe67kU.js` — 1.18 MB, Vite + React |
| External CSS | Bootstrap 5.3.8 (jsDelivr), Font Awesome 4.7 (cdnjs), Google Fonts (Spartan, Inter) |
| Body class | `dark-theme` (no matching rules — light theme in practice) |
| Root mount | `<div id="root">` (ours is `<div id="app">`) |

Bundle hashes change on their redeploys. Re-fetch and re-diff `:root` before Phase 0 if significant
time has passed.

## Appendix B — Files by change volume

| Rank | File | Lines | Phase |
|---|---|---|---|
| 1 | `src/pages/GameDetails.jsx` | 921 | 4 |
| 2 | `src/components/layout/Header.jsx` | 785 | 1, 2 |
| 3 | `src/pages/CasinoHome.jsx` | 653 | 6 |
| 4 | `src/App.jsx` | 456 | 1, 8 |
| 5 | `src/components/betting/*` (10 files) | ~2,000 | 4 |
| 6 | `src/pages/casino/**` (~90 files) | — | 6 |
| 7 | `src/components/casino/**` (~140 files) | — | 6 |
| 8 | `src/components/layout/SidebarTreeMenus.jsx` | 254 | 2 |
| 9 | `src/pages/Login.jsx` | 227 | 7 |
| 10 | `src/components/layout/Sidebar.jsx` | 143 | 2 |
