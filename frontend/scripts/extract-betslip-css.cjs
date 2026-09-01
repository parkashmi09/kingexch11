// Pull the bet-slip rules out of the tenexch stylesheets so the slip can be
// styled on the clickbet routes without loading those sheets wholesale.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCES = [
  'reference/style.css',
  'reference/ten-custom.css',
  'reference/responsive.css',
  'reference/wolf-custom.css',
  'src/App.css',
];

// Classes that belong to the slip and appear nowhere else in the new UI.
const SLIP_CLASSES = [
  'home-bet-slip', 'bet-slip', 'bet-slip-container', 'bet-amount-box',
  'bet-buttons', 'bet-input', 'bet-input-box', 'bet-nation', 'bet-team',
  'bet-team-name', 'odds-box', 'place-bet-btn', 'possible-win', 'row5',
];
const CLASS_RE = new RegExp('\\.(' + SLIP_CLASSES.join('|') + ')(?![\\w-])');

// Split a stylesheet into top-level blocks, keeping @media wrappers intact.
function splitBlocks(css) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '{') { depth++; }
    else if (c === '}') {
      depth--;
      if (depth === 0) { out.push(css.slice(start, i + 1).trim()); start = i + 1; }
    }
  }
  return out.filter(Boolean);
}

const selectorOf = (block) => block.slice(0, block.indexOf('{'));

let kept = [];
const keptSelectors = new Set();

for (const rel of SOURCES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const block of splitBlocks(css)) {
    const sel = selectorOf(block);
    if (sel.trim().startsWith('@media')) {
      // Keep only the matching inner rules of a media query.
      const inner = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}'));
      const innerKept = splitBlocks(inner).filter((b) => CLASS_RE.test(selectorOf(b)));
      if (innerKept.length) {
        innerKept.forEach((b) => keptSelectors.add(selectorOf(b).trim()));
        kept.push(`${sel.trim()} {\n${innerKept.map((b) => '  ' + b).join('\n')}\n}`);
      }
      continue;
    }
    if (sel.trim().startsWith('@')) continue; // @keyframes etc — none needed
    if (CLASS_RE.test(sel)) {
      keptSelectors.add(sel.trim());
      kept.push(block);
    }
  }
}

// Guard: none of these selectors may touch a class the clickbet UI uses.
const clickbet = fs.readFileSync(path.join(ROOT, 'src/styles/clickbet.css'), 'utf8');
const clickbetClasses = new Set(
  (clickbet.match(/\.[A-Za-z_][\w-]*/g) || []).map((c) => c.slice(1))
);
const collisions = new Set();
for (const sel of keptSelectors) {
  for (const c of sel.match(/\.[A-Za-z_][\w-]*/g) || []) {
    const name = c.slice(1);
    if (clickbetClasses.has(name)) collisions.add(name);
  }
}

console.log('rules kept:', kept.length);
console.log('collisions with clickbet.css classes:', [...collisions].join(', ') || 'NONE');

const header = `/* ─────────────────────────────────────────────────────────────────────────
   Bet-slip styles, carved out of the tenexch stylesheets.

   The slip itself (components/betting/HomeBetSlipModal) is shared with the old
   UI and still does the real work — odds, stake ladder, validation, placement.
   Its LOOK, though, lived entirely in the tenexch sheets, which no longer load
   on the clickbet routes, so the slip rendered as an unstyled block over a
   black page on both the home board and the event pages.

   Rather than reload those whole sheets (that is precisely what
   src/legacyStyles.jsx exists to avoid), only the rules whose selectors name a
   slip class are extracted here. The extraction is mechanical and re-runnable,
   and it is checked against clickbet.css so none of these class names can
   collide with the new UI. Regenerate with: node scripts/extract-betslip-css.cjs

   This is a bridge: when the slip itself is rebuilt on the clickbet design,
   this file goes away with it.
   ───────────────────────────────────────────────────────────────────────── */
`;

// Hand-written addition, kept here so regenerating cannot drop it.
//
// Every tenexch modal renders a BARE `.modal-backdrop`, with no `show` class —
// their house convention, and their stylesheet styles the bare class. On the
// clickbet routes that stylesheet is gone and clickbet.css styles the bare
// class too, but opaque and with no opacity of its own, so the backdrop blacked
// the whole page out instead of dimming it; Bootstrap's 50% only arrives via
// `.show`, which this markup never carries.
//
// Scoped to bare backdrops so nothing that DOES carry `.show` (the clickbet
// login modal, for one) is touched. It reaches the bet slip, the account
// panel's dialogs and any other tenexch modal opened from the new UI.
const EXTRA = `
.modal-backdrop:not(.show) {
  opacity: var(--bs-backdrop-opacity, 0.5);
}
`;

fs.writeFileSync(
  path.join(ROOT, 'src/cb/betslip-legacy.css'),
  header + kept.join('\n') + '\n' + EXTRA
);
console.log('written src/cb/betslip-legacy.css');
