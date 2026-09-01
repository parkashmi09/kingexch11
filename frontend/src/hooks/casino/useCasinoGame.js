import { useQuery } from '@tanstack/react-query';
import { getCasinoGameDetails } from '../../apiservices/casinoService';

/**
 * Polls casino game data every 2s.
 * For array-based games (worli/matka) returns the full array.
 * For object-based games (teenpatti, dragon tiger) returns a single object.
 */
export default function useCasinoGame(gameType, { isArray = false } = {}) {
  return useQuery({
    queryKey: ['casinoGame', gameType],
    queryFn: () => getCasinoGameDetails(gameType),
    refetchInterval: 1000,
    select: (res) => {
      const data = res?.data?.data || res?.data || (isArray ? [] : null);
      if (isArray) return Array.isArray(data) ? data : [];
      return data && !Array.isArray(data) ? data : null;
    },
  });
}
