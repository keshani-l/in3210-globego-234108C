import type { AppDispatch } from '../../app/store';
import { authApi } from './authApi';
import { signedIn, signedOut } from './authSlice';
import { getSessionExpiry } from './session';
import { clearSession, readSession } from './sessionStorage';

export const restoreSession = () => async (dispatch: AppDispatch) => {
  try {
    const session = await readSession();
    const expiresAt = session ? getSessionExpiry(session.accessToken) : null;
    if (session && expiresAt !== null) {
      dispatch(signedIn({ user: session.user, expiresAt }));
      return;
    }
    dispatch(signedOut(undefined));
  } catch {
    dispatch(signedOut('GlobeGo could not restore your session. Please sign in again.'));
  }
};

let clearingSession: Promise<void> | undefined;

export const endSession = (reason: 'logout' | 'expired') => async (dispatch: AppDispatch) => {
  clearingSession ??= clearSession().finally(() => { clearingSession = undefined; });
  try {
    await clearingSession;
  } catch (error) {
    if (reason === 'logout') throw error;
    // An expired token cannot pass the local restore check even if deletion fails.
  }
  dispatch(authApi.util.resetApiState());
  dispatch(signedOut(reason === 'expired' ? 'Your session expired. Please sign in again.' : undefined));
};
