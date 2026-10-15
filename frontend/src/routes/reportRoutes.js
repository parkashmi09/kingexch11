import { lazy } from 'react';

// Report & settings routes — config-driven, lazy-loaded for code splitting.
const reportRoutes = [
  { path: '/report/currentbets', Component: lazy(() => import('../pages/CurrentBets')) },
  { path: '/report/casinoresult', Component: lazy(() => import('../pages/CasinoResults')) },
  { path: '/report/casinoresult/:gameType', Component: lazy(() => import('../pages/CasinoResults')) },
  { path: '/report/livecasinoresult', Component: lazy(() => import('../pages/LiveCasinoBets')) },
  { path: '/report/sportbookresult', Component: lazy(() => import('../pages/SportBookBets')) },
  { path: '/settings/secureauth', Component: lazy(() => import('../pages/SecurityAuth')) },
  { path: '/report/fraud-report', Component: lazy(() => import('../pages/FraudReport')) },
];

export default reportRoutes;
