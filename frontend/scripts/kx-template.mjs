// Decompiles one Angular (Ivy) component of the kingexch111 reference bundle back
// into readable markup, so the React rebuild can copy its structure exactly.
//
//   node scripts/kx-template.mjs <selector>            markup of that component
//   node scripts/kx-template.mjs <selector> --css      its component stylesheet
//   node scripts/kx-template.mjs --list                every component selector
//
// Reads reference/kingexch/main.min.js (the untouched production bundle; the
// pretty-printed main.js beside it is for grepping and does not parse). The
// lazy routes' chunks are in reference/kingexch/chunks/: add --src=chunks/<n>.js.
//
// Output conventions: <ng-if fn="x3"> / <ng-for fn=".."> wrap structural
// templates, {{ }} marks a text node filled at runtime, (click) etc. list the
// element's event listeners, [prop] its property bindings.
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import * as acorn from 'acorn';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const srcArg = process.argv.find((a) => a.startsWith('--src='));
const src = fs.readFileSync(path.join(ROOT, 'reference/kingexch', srcArg ? srcArg.slice(6) : 'main.min.js'), 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' });

// ── generic AST helpers ──────────────────────────────────────────────────────
function walk(node, fn, parents = []) {
  if (!node || typeof node.type !== 'string') return;
  if (fn(node, parents) === false) return;
  const next = [...parents, node];
  for (const k in node) {
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === 'string' && walk(c, fn, next));
    else if (v && typeof v.type === 'string' && k !== 'parent') walk(v, fn, next);
  }
}
const lit = (n) => {
  if (!n) return undefined;
  if (n.type === 'Literal') return n.value;
  if (n.type === 'UnaryExpression' && n.operator === '!' && n.argument.type === 'Literal') return !n.argument.value;
  if (n.type === 'UnaryExpression' && n.operator === '-' && n.argument.type === 'Literal') return -n.argument.value;
  if (n.type === 'ArrayExpression') return n.elements.map(lit);
  if (n.type === 'TemplateLiteral') return n.quasis.map((q) => q.value.cooked).join('${}');
  return undefined;
};
const prop = (obj, name) => obj.properties?.find((p) => (p.key?.name ?? p.key?.value) === name)?.value;

// ── find component definitions (ɵɵdefineComponent calls with selectors) ──────
const comps = [];
walk(ast, (n, parents) => {
  if (n.type !== 'ObjectExpression') return;
  const sel = prop(n, 'selectors');
  const tpl = prop(n, 'template');
  if (!sel || !tpl) return;
  const selectors = lit(sel);
  comps.push({ selector: selectors?.[0]?.[0], def: n, parents });
});

if (process.argv[2] === '--list') {
  console.log(comps.map((c) => c.selector).filter(Boolean).join('\n'));
  process.exit(0);
}

const want = process.argv[2];
const comp = comps.find((c) => c.selector === want);
if (!comp) { console.error(`no component "${want}" (try --list)`); process.exit(1); }

// --css=<scope>: the component stylesheet with Angular's emulated encapsulation
// rewritten onto our own attribute, so specificity stays exactly the reference's:
//   [_ngcontent-%COMP%] → [data-<scope>]   (every element the component renders)
//   [_nghost-%COMP%]    → [data-<scope>-host]
// and its scoped @keyframes names → <scope>_<name>.
const cssArg = process.argv.find((a) => a.startsWith('--css'));
if (cssArg) {
  const scope = cssArg.split('=')[1] || 'ng';
  const styles = (lit(prop(comp.def, 'styles')) || []).join('\n')
    .replace(/\[_ngcontent-%COMP%\]/g, `[data-${scope}]`)
    .replace(/\[_nghost-%COMP%\]/g, `[data-${scope}-host]`)
    .replace(/_ngcontent-%COMP%_/g, `${scope}_`);
  const { default: postcss } = await import('postcss');
  const root = postcss.parse(styles);
  // A handful of component rules carry no encapsulation attribute at all (they
  // were ::ng-deep in the source), so in the reference they are global. Here
  // they are confined to kingexch subtrees, or they would also restyle the old
  // UI (whose elements don't have the theme variables they use). --where
  // confines them through :where(), so they keep the reference's specificity
  // (needed where global styles.css rules compete with them); --where=host
  // confines them to the component's own host, for a lazy page's rules, which
  // the reference only has loaded while that page is shown.
  const whereArg = process.argv.find((a) => a.startsWith('--where'));
  const confine = !whereArg ? '[data-kx]' : whereArg === '--where=host' ? `:where([data-${scope}-host])` : ':where([data-kx])';
  root.walkRules((rule) => {
    if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    rule.selectors = rule.selectors.map((s) => (s.includes('[data-') ? s : `${confine} ${s.trim()}`));
  });
  root.walk((n) => {
    n.raws.before = n.type === 'decl' ? '\n' + '  '.repeat(depthOf(n)) : '\n' + '  '.repeat(depthOf(n));
    if (n.type !== 'decl') n.raws.after = '\n' + '  '.repeat(depthOf(n));
    if (n.type === 'rule') n.raws.between = ' ';
    if (n.type === 'decl') n.raws.between = ': ';
    if (n.type === 'rule' || n.type === 'atrule') n.raws.semicolon = true;
  });
  console.log(`/* Generated by scripts/kx-template.mjs ${want} --css=${scope} — do not edit by hand. */` + root.toString() + '\n');
  process.exit(0);
}
function depthOf(n) { let d = 0; for (let p = n.parent; p && p.type !== 'root'; p = p.parent) d++; return d; }

const consts = lit(prop(comp.def, 'consts')) ?? [];

// Template functions referenced by ɵɵtemplate live as function declarations in
// the enclosing module scope; index every function declaration by name, keeping
// the one nearest (before) the component, since minified names repeat.
const fnDecls = {};
walk(ast, (n) => {
  if (n.type === 'FunctionDeclaration' && n.id) (fnDecls[n.id.name] ||= []).push(n);
});
const resolveFn = (name) => {
  const list = fnDecls[name] || [];
  let best = null;
  for (const f of list) if (f.start < comp.def.start && (!best || f.start > best.start)) best = f;
  return best || list[0];
};

// ── attribute arrays → HTML attributes ───────────────────────────────────────
// Ivy AttributeMarker: 0 namespaced, 1 classes, 2 styles, 3 bindings, 4 template, 5 projectAs, 6 i18n
function attrs(idx) {
  const a = idx == null ? [] : consts[idx] || [];
  const out = { attrs: [], classes: [], styles: [], bindings: [], template: [] };
  let mode = -1;
  for (let i = 0; i < a.length; i++) {
    const v = a[i];
    if (typeof v === 'number') { mode = v; continue; }
    if (mode === -1) { out.attrs.push([v, a[++i]]); }
    else if (mode === 0) { out.attrs.push([`${a[i]}:${a[i + 1]}`, a[i + 2]]); i += 2; mode = -1; }
    else if (mode === 1) out.classes.push(v);
    else if (mode === 2) { out.styles.push(`${v}: ${a[++i]}`); }
    else if (mode === 3) out.bindings.push(v);
    else if (mode === 4) out.template.push(v);
  }
  return out;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
function openTag(tag, idx, extra = []) {
  const a = attrs(idx);
  const parts = [tag];
  const clsAttr = a.attrs.find(([k]) => k === 'class');
  const classes = [...(clsAttr ? [clsAttr[1]] : []), ...a.classes].join(' ').trim();
  if (classes) parts.push(`class="${esc(classes)}"`);
  for (const [k, v] of a.attrs) if (k !== 'class') parts.push(v === '' ? k : `${k}="${esc(v)}"`);
  if (a.styles.length) parts.push(`style="${esc(a.styles.join('; '))}"`);
  for (const b of [...new Set([...a.bindings, ...extra])]) parts.push(b.startsWith('(') ? b : `[${b}]`);
  return parts.join(' ');
}

// ── instruction stream ───────────────────────────────────────────────────────
// Flatten `e.a(..)(..)(..), e.b(..)` into [{name, args}] in evaluation order.
function flattenCalls(node, out) {
  if (!node) return;
  if (node.type === 'SequenceExpression') return node.expressions.forEach((x) => flattenCalls(x, out));
  if (node.type === 'LogicalExpression') { flattenCalls(node.left, out); flattenCalls(node.right, out); return; }
  if (node.type === 'ExpressionStatement') return flattenCalls(node.expression, out);
  if (node.type === 'BlockStatement') return node.body.forEach((s) => flattenCalls(s, out));
  if (node.type === 'VariableDeclaration') return; // `const t = e.RV6()` etc.
  if (node.type !== 'CallExpression') return;
  const chain = [];
  let c = node;
  while (c.type === 'CallExpression') { chain.unshift(c); c = c.callee; }
  if (c.type !== 'MemberExpression') return;
  const name = c.property.name;
  for (const call of chain) out.push({ name, args: call.arguments });
}

// The creation block is `if (1 & rf) {...}` or `1 & rf && (...)`.
function creationOf(fn) {
  let found = null;
  walk(fn.body, (n) => {
    if (found) return false;
    const isRf = (t) => t?.type === 'BinaryExpression' && t.operator === '&' && t.left.type === 'Literal' && t.left.value === 1;
    if (n.type === 'IfStatement' && isRf(n.test)) { found = n.consequent; return false; }
    if (n.type === 'LogicalExpression' && n.operator === '&&' && isRf(n.left)) { found = n.right; return false; }
    if (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') return false;
  });
  return found;
}

const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'col', 'path', 'use', 'feOffset', 'feComposite', 'feColorMatrix', 'circle', 'rect', 'line', 'polygon', 'polyline', 'ellipse', 'stop']);

function render(fn, depth, seen = new Set()) {
  const body = creationOf(fn);
  if (!body) return '';
  const ins = [];
  flattenCalls(body, ins);
  let out = '';
  const pad = () => '  '.repeat(depth);
  const stack = [];
  const pendingListeners = [];
  const flushListeners = () => {
    if (!pendingListeners.length || !out.endsWith('>\n')) return;
    // attach (event) markers to the element that was just opened
    const at = out.lastIndexOf('>\n');
    const selfClose = out[at - 1] === '/';
    const pos = selfClose ? at - 2 : at;
    out = out.slice(0, pos) + ' ' + pendingListeners.map((e) => `(${e})`).join(' ') + out.slice(pos);
    pendingListeners.length = 0;
  };
  for (const { name, args } of ins) {
    const a = args.map(lit);
    switch (name) {
      case 'j41': // elementStart(index, tag, attrs)
        flushListeners();
        out += `${pad()}<${openTag(a[1], a[2])}>\n`; stack.push(a[1]); depth++; break;
      case 'qex': // elementContainerStart(index, attrs) — <ng-container>
        flushListeners();
        out += `${pad()}<${openTag('ng-container', a[1])}>\n`; stack.push('ng-container'); depth++; break;
      case 'k0s': case 'bVm': // elementEnd / elementContainerEnd
        flushListeners();
        depth--; out += `${pad()}</${stack.pop()}>\n`; break;
      case 'nrm': case 'xUc': // element (start+end)
        flushListeners();
        out += VOID.has(a[1]) ? `${pad()}<${openTag(a[1], a[2])} />\n` : `${pad()}<${openTag(a[1], a[2])}></${a[1]}>\n`; break;
      case 'EFF': // text
        flushListeners();
        out += `${pad()}${a[1] != null ? a[1] : '{{ }}'}\n`; break;
      case 'bIt': pendingListeners.push(a[0]); flushListeners(); break;
      case 'DNE': { // template(index, fn, decls, vars, tag, constIndex)
        flushListeners();
        const fname = args[1]?.name;
        const at = attrs(a[5]);
        const kind = at.template.includes('ngFor') || at.template.includes('ngForOf') ? 'ng-for' : at.template.includes('ngIf') ? 'ng-if' : 'ng-template';
        out += `${pad()}<${kind} fn="${fname}">\n`;
        const f = fname && resolveFn(fname);
        if (f && !seen.has(fname)) out += render(f, depth + 1, new Set([...seen, fname]));
        out += `${pad()}</${kind}>\n`;
        break;
      }
      default: break;
    }
  }
  return out;
}

const tplNode = prop(comp.def, 'template');
console.log(render(tplNode, 0));
