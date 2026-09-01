import { useMemo } from 'react';
import { CASINO_STREAM_BASE } from '../../config';

/**
 * Returns the casino stream URL for a given game type.
 */
export default function useCasinoStream(gameType) {
  const streamUrl = useMemo(() => `${CASINO_STREAM_BASE}${gameType}`, [gameType]);
  return { streamUrl };
}
