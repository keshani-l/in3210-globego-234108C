import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { store } from '../../../app/store';
import { authApi } from '../authApi';
import { endSession, restoreSession } from '../sessionActions';
import { readSession, saveSession } from '../sessionStorage';

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'device-only',
}));

const user = { id: 1, firstName: 'Emily', lastName: 'Johnson', username: 'emilys', email: 'demo@example.com' };
function makeToken(exp: number) {
  const payload = btoa(JSON.stringify({ exp })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.signature`;
}

beforeEach(() => {
  Platform.OS = 'android';
  jest.resetAllMocks();
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
});

describe('session storage', () => {
  test('saves to SecureStore and restores the native profile without a network request', async () => {
    const exp = Math.floor(Date.now() / 1000) + 60;
    const session = { user, accessToken: makeToken(exp) };
    await saveSession(session);
    const [key, value, options] = jest.mocked(SecureStore.setItemAsync).mock.calls[0];
    expect(JSON.parse(value)).toEqual(session);
    expect(options?.keychainAccessible).toBe(SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY);
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(value);
    const network = jest.spyOn(globalThis, 'fetch');
    try {
      await store.dispatch(restoreSession());
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(key, options);
      expect(store.getState().auth).toEqual({ status: 'signedIn', user, expiresAt: exp * 1000 });
      expect(JSON.stringify(store.getState())).not.toContain(session.accessToken);
      expect(network).not.toHaveBeenCalled();
    } finally {
      network.mockRestore();
    }
  });

  test.each(['expired', 'malformed'])('discards %s native session data', async (kind) => {
    const expired = { user, accessToken: makeToken(Math.floor(Date.now() / 1000) - 1) };
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(kind === 'expired' ? JSON.stringify(expired) : '{');
    await expect(readSession()).resolves.toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
  });

  test('discards a native record with an invalid token', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify({ user, accessToken: 'invalid' }));
    await expect(readSession()).resolves.toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
  });

  test('logout removes secure data and resets auth state and API cache', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify({ user, accessToken: makeToken(Math.floor(Date.now() / 1000) + 60) }));
    await store.dispatch(restoreSession());
    await store.dispatch(authApi.endpoints.login.initiate(0));
    expect(Object.keys(store.getState().authApi.mutations)).toHaveLength(1);
    await store.dispatch(endSession('logout'));
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
    expect(store.getState().auth.status).toBe('signedOut');
    expect(store.getState().authApi.mutations).toEqual({});
  });

  test('keeps web sessions in memory and clears them on logout', async () => {
    Platform.OS = 'web';
    const session = { user, accessToken: makeToken(Math.floor(Date.now() / 1000) + 60) };
    await saveSession(session);
    await expect(readSession()).resolves.toEqual(session);
    await store.dispatch(endSession('logout'));
    await expect(readSession()).resolves.toBeNull();
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  test('reports a native logout failure and allows a retry', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify({ user, accessToken: makeToken(Math.floor(Date.now() / 1000) + 60) }));
    await store.dispatch(restoreSession());
    jest.mocked(SecureStore.deleteItemAsync).mockRejectedValueOnce(new Error('Secure storage unavailable'));
    await expect(store.dispatch(endSession('logout'))).rejects.toThrow('Secure storage unavailable');
    expect(store.getState().auth.status).toBe('signedIn');
    await store.dispatch(endSession('logout'));
    expect(store.getState().auth.status).toBe('signedOut');
  });
});
