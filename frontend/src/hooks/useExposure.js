import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { subscribeToBalanceUpdates } from '../apiservices/authService';

export const useExposure = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [inrBalance, setInrBalance] = useState(0);
  const [netExposure, setNetExposure] = useState(0);
  
  const uid = user?.user_id || user?.id;
  const isDemo = user?.username === 'Demo';

  useEffect(() => {
    if (isDemo || !isAuthenticated || !uid) return;

    const unsubscribe = subscribeToBalanceUpdates(uid, (data) => {
      // The socket emits data.balance (see socketUtils.js: emitBalanceUpdate)
      // data here is balance object: { inr_balance, cash, exposure }
      
      if (data.inr_balance !== undefined) {
        setInrBalance(+data.inr_balance);
        localStorage.setItem('credit_inr', data.inr_balance.toString());
      }
      
      if (data.exposure !== undefined) {
        setNetExposure(+data.exposure);
      }
    });

    return () => { 
      if (unsubscribe) unsubscribe(); 
    };
  }, [uid, isDemo, isAuthenticated]);

  return { inrBalance, netExposure, setInrBalance, setNetExposure };
};

export default useExposure;
