// Reference assets extracted from kingexch111.com live under public/kingexch/,
// laid out as the reference serves them (assets/ keeps its own paths).
const BASE = '/kingexch';

export const kx = (file) => `${BASE}/${file}`;

// The reference reads its logo from the theme API (`exchangeLogo`); this is
// that file.
export const KX_LOGO = kx('brand/logo.png');
