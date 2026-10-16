import { lazy } from 'react';

// The casino site's table pages, by its route (games.js maps each table to one).
export const PAGES = {
  casino3Patti: lazy(() => import('./CasinoTeenPati')), // app-casino-teen-pati
  lucky7: lazy(() => import('./Lucky7')), // app-lucky7
  oneteenpatti: lazy(() => import('./OneTeenPatti')), // app-one-day-dragon-tiger
  casino: lazy(() => import('./TeenPatti')), // app-teenpatti
  baccarat: lazy(() => import('./Baccarat')), // app-baccarat
  andarBahar: lazy(() => import('./AndarBahar')), // app-andar-bahar-casino
  card32: lazy(() => import('./Card32')), // app-card32
  pocker2020: lazy(() => import('./Pocker2020')), // app-pocker2020
  dtl: lazy(() => import('./Dtl')), // app-dtl
  '1daydragontiger': lazy(() => import('./DragonTiger1Day')), // app-dragon-tiger-1-day
  euTeenpatti: lazy(() => import('./EuTeenpatti')), // app-eu-teenpatti
  ammarAkbar: lazy(() => import('./AmmarAkbar')), // app-ammar-akbar
};
