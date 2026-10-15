import { KX } from '../ng';
import { openAgeModal } from '../ageModal';
import OldCasino from '../dashboard/OldCasino';

/** /livecasino — the sidebar's Casino: the reference routes it to app-old-casino alone. */
export default function LiveCasino() {
  return <OldCasino C={{}} root={KX} onLocked={openAgeModal} />;
}
