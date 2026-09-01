// Asset paths for the clickbet UI.
//
// The source build serves every image from https://images.rajabet.fun/<path>.
// We mirrored the files this UI actually uses into public/ under the SAME
// paths, so the only difference is the missing host — keeping the paths
// identical means markup lifted from the reference needs no rewriting, and a
// later re-pull of an asset drops straight into place.
//
// `BRAND` / `THEME` stand in for the reference's build-time label constants
// (kr = "RCL", the white-label id), which is what selects the logo + banner
// folder.
export const BRAND = 'rcl';
export const THEME = 'baz'; // the odds-icon set (bm / fancy / tv badges)

/** Shared icon used by every label: /newtheme/common/<file> */
export const common = (file) => `/newtheme/common/${file}`;

/** Brand-specific user chrome: logo, section icons. */
export const user = (file) => `/newtheme/${BRAND}/user/${file}`;

/** Logged-out banners + bonus strip. */
export const login = (file) => `/newtheme/${BRAND}/login/${file}`;

/** Home hero slides. Separate desktop and mobile crops, picked by viewport. */
export const banner = (file) => `/banners/${file}`;

/** Odds-row market badges (bookmaker / fancy / tv). */
export const oddsIcon = (file) => `/newtheme/${THEME}/user/${file}`;

/** Casino tile art, keyed by the provider's game id. */
export const casinoTile = (gameId) => `/casino/ciptahubimg/${gameId}.webp`;
