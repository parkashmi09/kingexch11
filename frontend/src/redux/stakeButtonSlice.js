import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getStakeButtonValues } from '../apiservices/stakeButtonService';

const DEFAULT_GAME_BUTTONS = [
  { label: '+1000', value: 1000 },
  { label: '+2000', value: 2000 },
  { label: '+5000', value: 5000 },
  { label: '+10000', value: 10000 },
  { label: '+20000', value: 20000 },
  { label: '+25000', value: 25000 },
];

export const fetchStakeButtonsThunk = createAsyncThunk(
  'stakeButtons/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getStakeButtonValues();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const stakeButtonSlice = createSlice({
  name: 'stakeButtons',
  initialState: {
    gameButtons: DEFAULT_GAME_BUTTONS,
    casinoButtons: [],
    loaded: false,
    error: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchStakeButtonsThunk.fulfilled, (state, action) => {
      const data = action.payload;
      if (data?.game_buttons && Array.isArray(data.game_buttons)) {
        const buttons = data.game_buttons
          .filter(b => b.value > 0)
          .map(b => ({ label: `+${b.value}`, value: b.value }));
        if (buttons.length > 0) state.gameButtons = buttons;
      }
      if (data?.casino_buttons && Array.isArray(data.casino_buttons)) {
        state.casinoButtons = data.casino_buttons.filter(b => b.value > 0);
      }
      state.loaded = true;
    });
    builder.addCase(fetchStakeButtonsThunk.rejected, (state) => {
      // Keep the defaults on screen, but do NOT mark this loaded: App only
      // dispatches while `loaded` is false, so latching it here would leave the
      // account stuck on defaults for the whole session after one failed call
      // (a request fired mid-login, a dropped connection).
      state.error = true;
    });
    // Signing out drops the previous account's ladder. Without this, `loaded`
    // stayed true across a logout and the NEXT user to sign in kept seeing the
    // buttons of the one before them — App never refetches once loaded.
    builder.addCase('user/logout', (state) => {
      state.gameButtons = DEFAULT_GAME_BUTTONS;
      state.casinoButtons = [];
      state.loaded = false;
      state.error = false;
    });
  },
});

export default stakeButtonSlice.reducer;
