import { useQuery } from '@tanstack/react-query';
import { getLastResults } from '../../apiservices/casinoService';

/**
 * Polls last results every 1s (paused while the tab is hidden; deduped
 * across components by queryKey; structural sharing keeps renders cheap
 * when the payload hasn't changed).
 * Optional transform function for game-specific result mapping.
 */
export default function useCasinoLastResults(gameType, { transform } = {}) {
  return useQuery({
    queryKey: ['casinoLastResults', gameType],
    queryFn: () => getLastResults(gameType),
    refetchInterval: 1000,
    select: (res) => {
      const items = res?.data?.data?.res || res?.data?.res || res?.data || [];
      return transform ? items.map(transform) : items;
    },
  });
}
