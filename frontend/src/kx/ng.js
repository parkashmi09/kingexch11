// Angular's emulated view encapsulation, reproduced.
//
// The kingexch111 reference is an Angular app: every element a component renders
// carries that component's `_ngcontent-xxx` attribute, and every rule of the
// component's stylesheet is suffixed with `[_ngcontent-xxx]`. A rule therefore
// only matches inside its own component, and each compound selector weighs one
// attribute more than it reads.
//
// The component stylesheets under ./css are generated from the reference bundle
// with that attribute renamed to `data-<scope>` (scripts/kx-template.mjs
// <selector> --css=<scope>), so spreading `ng(scope)` onto every element of the
// matching React component gives the same matches at the same specificity —
// which is what keeps the rebuilt markup pixel-identical without renaming a
// single class.
//
//   const C = ng('kdh');
//   <div {...C} className="site-header app-header">
//
// A child component's host element carries the parent's scope AND its own host
// scope, exactly as Angular stamps it: `{...C} {...host('khn')}`.

export const ng = (scope) => ({ [`data-${scope}`]: '' });

export const host = (scope) => ({ [`data-${scope}-host`]: '' });

// Every kingexch component root also carries `data-kx`: it gates the rules that
// must not leak into the parts of the app still on the old UI (FA 5 glyphs, the
// reference body's inherited typography — see css/kx-base.css).
export const KX = { 'data-kx': '' };
