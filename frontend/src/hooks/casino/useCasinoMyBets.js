import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getMyBets, getMatchExposure } from '../../apiservices/casinoService';
import { isDemoUser, getDemoCasinoBets } from '../../utils/demoStore';
import { computeUserBook, getMarketsForGame } from '../../utils/casinoBook';

/**
 * Polls my bets + exposures every 3s when authenticated and matchId is available.
 * Demo mode reads bets from the local demo store instead (no API).
 * Returns { myBets, exposures, refetch }.
 */
// gameType + gameObj (live sub[]) pass karo to book open bets se CALCULATE
// hoti hai (back S: +(o-1)*st on S, -st on same market; lay ulta). Na pass
// karo to purana get-exposure endpoint mapping chalta hai (legacy pages).
export default function useCasinoMyBets(matchId, isAuth, gameType = null, gameObj = null) {
  const user = useSelector((s) => s.user.user);
  const userId = user?.user_id || user?.id || '';
  const isDemo = localStorage.getItem('token') === 'demo-token' && isDemoUser(user);
  const enabled = Boolean(isAuth && matchId && userId && !isDemo);

  // My bets
  const { data: betsData, refetch } = useQuery({
    queryKey: ['casinoMyBets', matchId, userId],
    queryFn: () => getMyBets(userId, String(matchId)),
    enabled,
    refetchInterval: enabled ? 3000 : false,
  });

  const useComputedBook = Boolean(gameType && gameObj);

  // Exposures endpoint — sirf legacy mode me (computed book wale pages skip)
  const { data: expData } = useQuery({
    queryKey: ['casinoExposure', matchId, userId],
    queryFn: () => getMatchExposure(userId, String(matchId)),
    enabled: enabled && !useComputedBook,
    refetchInterval: enabled && !useComputedBook ? 3000 : false,
  });

  const myBets = isDemo
    ? getDemoCasinoBets(matchId).map((b) => ({
        nation: b.nat, amount: b.stake, rate: b.odds, type: b.betType, ...b,
      }))
    : (betsData?.bets || []);

  const exposures = useMemo(() => {
    if (useComputedBook) {
      const book = computeUserBook(myBets, getMarketsForGame(gameType, gameObj));
      // 0 wali entries bhi rakho — table book-black 0 dikhata hai
      return book;
    }
    const expMap = {};
    if (expData?.success && expData?.data) {
      console.log('[Casino Exposure] Raw API response:', expData.data);
      expData.data.forEach((item) => {
        const name = item.team_name || '';
        const exp = parseFloat(item.exposure_amount) || 0;
        if (name && exp !== 0) {
          expMap[name] = exp;
          expMap[name.toLowerCase()] = exp;
          // "3 Card Total 19" → also map as "3 Card Total"
          const baseMatch = name.match(/^(.+?)\s+\d+$/);
          if (baseMatch) {
            expMap[baseMatch[1]] = (expMap[baseMatch[1]] || 0) + exp;
          }
        }
      });
      console.log('[Casino Exposure] Mapped exposures:', expMap);
    }
    return expMap;
  }, [expData, useComputedBook, myBets, gameType, gameObj]);

  return { myBets, exposures, refetch };
}
