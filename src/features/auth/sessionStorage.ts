import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { getSessionExpiry, storedSessionSchema, type StoredSession } from './session';

const SESSION_KEY = 'globego.session.v1';
const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

// A browser refresh clears this module and signs the user out.
let webSession: StoredSession | null = null;

export async function saveSession(session: StoredSession) {
  if (Platform.OS === 'web') {
    webSession = session;
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), options);
}

export async function clearSession() {
  if (Platform.OS === 'web') {
    webSession = null;
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY, options);
}

export async function readSession(): Promise<StoredSession | null> {
  const raw = Platform.OS === 'web' ? null : await SecureStore.getItemAsync(SESSION_KEY, options);
  if (Platform.OS !== 'web' && raw === null) return null;

  let candidate: unknown = webSession;
  if (raw !== null) {
    try {
      candidate = JSON.parse(raw);
    } catch {
      candidate = null;
    }
  }

  if (candidate === null && raw === null) return null;
  const parsed = storedSessionSchema.safeParse(candidate);
  if (parsed.success && getSessionExpiry(parsed.data.accessToken) !== null) return parsed.data;

  await clearSession();
  return null;
}
