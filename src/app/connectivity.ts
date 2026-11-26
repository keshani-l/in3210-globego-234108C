import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ConnectionStatus = 'unknown' | 'online' | 'offline';

export function connectionStatus(isConnected: boolean | null): ConnectionStatus {
  if (isConnected === false) return 'offline';
  if (isConnected === true) return 'online';
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
