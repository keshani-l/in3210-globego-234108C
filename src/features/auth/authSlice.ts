import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { UserProfile } from './session';

type AuthState =
  | { status: 'restoring' }
  | { status: 'signedOut'; notice?: string }
  | { status: 'signedIn'; user: UserProfile; expiresAt: number };

const authSlice = createSlice({
  name: 'auth',
  initialState: { status: 'restoring' } as AuthState,
  reducers: {
    signedIn: (_, action: PayloadAction<{ user: UserProfile; expiresAt: number }>): AuthState => ({
      status: 'signedIn',
      ...action.payload,
    }),
    signedOut: (_, action: PayloadAction<string | undefined>): AuthState => ({
      status: 'signedOut',
      notice: action.payload,
    }),
  },
});

export const { signedIn, signedOut } = authSlice.actions;
export const authReducer = authSlice.reducer;
