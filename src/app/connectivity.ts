import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ConnectionStatus = 'unknown' | 'online' | 'offline';

export function connectionStatus(state: { isConnected: boolean | null; isInternetReachable: boolean | null }): ConnectionStatus {
  if (state.isConnected === false || state.isInternetReachable === false) return 'offline';
  if (state.isConnected === true || state.isInternetReachable === true) return 'online';
  return 'unknown';
}

const initialState: { status: ConnectionStatus; pauseRequests: boolean } = {
  status: 'unknown',
  pauseRequests: false,
};

const connectivity = createSlice({
  name: 'connectivity',
  initialState,
  reducers: {
    connectivityChanged(state, { payload }: PayloadAction<ConnectionStatus>) {
      state.status = payload;
      if (payload !== 'unknown') state.pauseRequests = payload === 'offline';
    },
  },
});

export const { connectivityChanged } = connectivity.actions;
export const connectivityReducer = connectivity.reducer;
