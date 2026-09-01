import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserOpenBetsGrouped } from '../apiservices/sportsService';
import { logout } from './userSlice';

const initialState = {
  matchedBets: [],
  unmatchedBets: [],
  loading: false,
  error: null,
};

const normalizeBet = (bet) => ({
  id: bet.id,
  event_id: bet.eventid,
  teamName: bet.selection_name,
  selection_name: bet.selection_name,
  odds: parseFloat(bet.odds) || 0,
  stake: parseFloat(bet.stake_amount) || 0,
  matchedStake: parseFloat(bet.stake_amount) || 0,
  betType: bet.bet_type,
  marketType: bet.market_type || bet.game_type,
  market_type: bet.market_type,
  game_type: bet.game_type,
  market_id: bet.match_id,
  match_title: bet.match_title,
  team_one: bet.team_one,
  team_two: bet.team_two,
  fancy_name: bet.fancy_name,
  liability: parseFloat(bet.liability) || 0,
  timestamp: bet.created_at,
  status: bet.status,
  unmatched: bet.unmatched === true,
  // The price the user ASKED for (odds column keeps the original clicked odds)
  unmatched_odds: bet.unmatched_odds != null ? parseFloat(bet.unmatched_odds) : null,
});

export const fetchMatchedBetsThunk = createAsyncThunk(
  'matchedBets/fetchMatchedBets',
  async ({ eventId, userId }, { rejectWithValue }) => {
    try {
      const response = await getUserOpenBetsGrouped(eventId, userId);
      if (response.success) {
        return {
          matchedBets: (response.data?.matchedBets || []).map(normalizeBet),
          unmatchedBets: (response.data?.unmatchedBets || []).map(normalizeBet),
        };
      }
      return rejectWithValue(response.error || 'Failed to fetch matched bets');
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch matched bets');
    }
  }
);

const matchedBetsSlice = createSlice({
  name: 'matchedBets',
  initialState,
  reducers: {
    addMatchedBet: (state, action) => {
      state.matchedBets.unshift(action.payload);
    },
    removeMatchedBet: (state, action) => {
      state.matchedBets = state.matchedBets.filter(bet => bet.id !== action.payload);
    },
    clearMatchedBets: (state) => {
      state.matchedBets = [];
      state.unmatchedBets = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchedBetsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchedBetsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.matchedBets = action.payload.matchedBets;
        state.unmatchedBets = action.payload.unmatchedBets;
      })
      .addCase(fetchMatchedBetsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout must drop demo/real bets so books don't leak into the next session
      .addCase(logout, (state) => {
        state.matchedBets = [];
        state.unmatchedBets = [];
      });
  },
});

export const { addMatchedBet, removeMatchedBet, clearMatchedBets } = matchedBetsSlice.actions;
export default matchedBetsSlice.reducer;
