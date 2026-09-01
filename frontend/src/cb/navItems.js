import { common } from './assets';

// The top nav / sidebar entries, in the reference's order.
//
// The reference builds this list at runtime from its own menu API; ours is
// static because the tenexch backend has no equivalent endpoint. Each entry
// carries where it goes in THIS app:
//   `tab`   — a home-board sport tab (see TAB_SPORT_MAP in hooks/home/useHomeLoad)
//   `route` — a real tenexch route
//
// Sport entries deliberately resolve to the home board rather than to routes of
// their own: tenexch renders every sport through the home page's tab switch, so
// giving them URLs would mean inventing routes the data layer doesn't have.
export const SPORT_NAV = [
  { key: 'inplay',           label: 'In-Play',   icon: 'inplay-icon.png',      alt: 'inplay',      tab: 'inplay' },
  { key: 'cpl',              label: 'CPL 2026',  icon: 'winner-icon.png',      alt: 'winnericon',  route: '/cpl' },
  { key: 'cricket',          label: 'Cricket',   icon: 'cricket-icon.png',     alt: 'cricket',     route: '/game/4' },
  { key: 'football',         label: 'Soccer',    icon: 'soccer-icon.png',      alt: 'soccer',      route: '/game/1' },
  { key: 'tennis',           label: 'Tennis',    icon: 'tennis-icon.png',      alt: 'tennis',      route: '/game/2' },
  { key: 'horseracing',      label: 'Horse',     icon: 'horse-icon.png',       alt: 'horse',       route: '/race/10' },
  { key: 'greyhoundracing',  label: 'Greyhound', icon: 'greyhound-icon.png',   alt: 'greyhound',   route: '/race/65' },
];

// Casino entries map onto the routes tenexch already ships.
export const CASINO_NAV = [
  { key: 'indianpoker', label: 'Indian Poker', icon: 'indianpoker-icon.png', route: '/o_casino' },
  { key: 'aviator',     label: 'Aviator',      icon: 'aviator-icon.png',     route: '/crash' },
  { key: 'chickenroad', label: 'Chicken Road', icon: 'chickenroll-icon.png', route: '/crash' },
  { key: 'livecasino',  label: 'Live Casino',  icon: 'livecasino-icon.png',  route: '/casino/LIVECASINO' },
  { key: 'intcasino',   label: 'Int.Casino',   icon: 'intcasino-icon.png',   route: '/o_casino' },
  { key: 'slot',        label: 'Slot',         icon: 'slot-icon.png',        route: '/o_slot' },
];

export const HEADER_NAV = [...SPORT_NAV, ...CASINO_NAV];

// The phone strip is NOT the desktop list at a smaller size: the reference
// folds Soccer / Tennis / Horse / Greyhound into one "Sports" entry that opens
// a dropdown, so the row still fits without scrolling past the casino links.
export const MOBILE_SPORT_GROUP = ['football', 'tennis', 'horseracing', 'greyhoundracing'];

export const GROUPED_SPORTS = SPORT_NAV.filter((s) => MOBILE_SPORT_GROUP.includes(s.key));

// What stays inline on the phone strip, either side of that group.
export const MOBILE_NAV_LEAD = SPORT_NAV.filter((s) => !MOBILE_SPORT_GROUP.includes(s.key));

export const iconSrc = (item) => common(item.icon);
