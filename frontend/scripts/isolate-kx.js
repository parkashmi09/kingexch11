// PostCSS plugin: keeps the old UI's stylesheets out of the kingexch components.
//
// The app is being converted page by page to the kingexch111 design (src/kx).
// Until it is done, the clickbet sheets still load globally, and their bare
// class/element rules (`.form-group`, `input`, `a`…) would also match inside
// the rebuilt components and pull them off the reference. Every selector in
// those sheets gets `:where(:not([data-kx], [data-kx] *))` on its subject, so
// nothing under a `[data-kx]` root matches. :where() weighs nothing, so the
// rules behave exactly as before everywhere else.
//
// The page scrollbar is the one thing the kingexch layout owns outside a
// component: the reference leaves it to the browser (15px on desktop), while
// clickbet's bare `::-webkit-scrollbar` rules thin every scrollbar to 0.3em —
// 11px of page width that shifts everything right-aligned in the header. So
// those bare rules also skip <html> and <body> (Chrome styles the viewport
// scrollbar from either).
//
// Delete this plugin (and its entry in vite.config.js) once the clickbet
// sheets are gone.

const GUARD = ':where(:not([data-kx], [data-kx] *))';
const PAGE_SCROLLBAR_GUARD = ':where(:not(html, body, [data-kx], [data-kx] *))';
const LEGACY_PSEUDO_ELEMENTS = /^:(before|after|first-line|first-letter)\b/i;

// Index in `sel` where the guard goes: before the subject compound's first
// pseudo-element (they must stay last), else the very end.
export function insertionPoint(sel) {
  let depthParen = 0;
  let depthBracket = 0;
  let quote = null;
  let compoundStart = 0;
  for (let i = 0; i < sel.length; i++) {
    const ch = sel[i];
    if (quote) { if (ch === '\\') i++; else if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '\\') { i++; continue; }
    if (ch === '(') depthParen++;
    else if (ch === ')') depthParen--;
    else if (ch === '[') depthBracket++;
    else if (ch === ']') depthBracket--;
    else if (!depthParen && !depthBracket && /[\s>+~]/.test(ch)) compoundStart = i + 1;
  }
  // Scan the subject compound for its first pseudo-element.
  depthParen = 0; depthBracket = 0; quote = null;
  for (let i = compoundStart; i < sel.length; i++) {
    const ch = sel[i];
    if (quote) { if (ch === '\\') i++; else if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '\\') { i++; continue; }
    if (ch === '(') depthParen++;
    else if (ch === ')') depthParen--;
    else if (ch === '[') depthBracket++;
    else if (ch === ']') depthBracket--;
    else if (ch === ':' && !depthParen && !depthBracket) {
      if (sel[i + 1] === ':' || LEGACY_PSEUDO_ELEMENTS.test(sel.slice(i))) return i;
    }
  }
  return sel.length;
}

export function guardSelector(sel) {
  const s = sel.trim();
  const at = insertionPoint(s);
  const guard = /^::-webkit-scrollbar/.test(s) ? PAGE_SCROLLBAR_GUARD : GUARD;
  return s.slice(0, at) + guard + s.slice(at);
}

/** @param {(file: string) => boolean} include which source files to guard */
export default function isolateKx(include) {
  return {
    postcssPlugin: 'isolate-kx',
    Once(root) {
      const file = (root.source?.input?.file || '').replace(/\\/g, '/');
      if (!include(file)) return;
      root.walkRules((rule) => {
        const parent = rule.parent;
        if (parent?.type === 'atrule' && /keyframes$/i.test(parent.name)) return;
        rule.selectors = rule.selectors.map(guardSelector);
      });
    },
  };
}
isolateKx.postcss = true;
