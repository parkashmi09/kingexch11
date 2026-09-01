import { lazy } from 'react';

// Virtual Casino routes — the /vcasino/* family. Config-driven and lazy-loaded
// like casinoRoutes, but a separate list because these pages share nothing with
// the /casino/* tables: no video stream, no casino-table markup, and their own
// full-width layout branch in App.jsx.
//
// Paths are the routes stored on the Casino Manage catalog rows (category
// 'virtual'), so a tile on /o_casino lands here without any mapping.
const vcasinoRoutes = [
  { path: '/vcasino/lucky7', Component: lazy(() => import('../pages/vcasino/VLucky7')) },
  { path: '/vcasino/trio', Component: lazy(() => import('../pages/vcasino/VTrio')) },
  { path: '/vcasino/dtl20', Component: lazy(() => import('../pages/vcasino/VDtl20')) },
  { path: '/vcasino/teenmuf', Component: lazy(() => import('../pages/vcasino/VMuflis')) },
];

export default vcasinoRoutes;
