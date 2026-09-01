import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import stakeButtonReducer from './stakeButtonSlice';
import matchedBetsReducer from './matchedBetsSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    stakeButtons: stakeButtonReducer,
    matchedBets: matchedBetsReducer,
  },
});

export default store;
