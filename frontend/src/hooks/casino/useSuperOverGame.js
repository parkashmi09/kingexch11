import { useQuery } from '@tanstack/react-query';
import { getCasinoGameDetails } from '../../apiservices/casinoService';

/**
 * Custom hook for SuperOver games (superover3 etc.).
 * The API returns { t1: {...}, t2: [...] } instead of the standard { mid, sub } shape.
 *
 * Returns:
 *   t1  — game metadata { card, ft, lt, gmid, ename, gtype, scard }
 *   t2  — array of market objects (bookmaker, fancy, fancy1)
 *   loading — boolean
 */
export default function useSuperOverGame(gameType) {
  const { data, isLoading } = useQuery({
    queryKey: ['superOverGame', gameType],
    queryFn: () => getCasinoGameDetails(gameType),
    refetchInterval: 2000,
    select: (res) => {
      const raw = res?.data?.data || res?.data || {};
      const t1 = raw?.t1?.[0] || raw?.t1 || {};
      const t2 = Array.isArray(raw?.t2) ? raw.t2 : [];
      return { t1, t2 };
    },
  });

  return {
    t1: data?.t1 || {},
    t2: data?.t2 || [],
    loading: isLoading,
  };
}
