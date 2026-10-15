import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';

/**
 * The kingexch111 header, as the reference's app-layout mounts it: the phone
 * header (app-header) then the desktop one (app-desktop-header). Both are always
 * rendered; app-layout's stylesheet shows one per viewport (992px split).
 *
 * Their stylesheets are imported from main.jsx, after Bootstrap — see there.
 */
export default function KxHeader() {
  return (
    <>
      <MobileHeader />
      <DesktopHeader />
    </>
  );
}
