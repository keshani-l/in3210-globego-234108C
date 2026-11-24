import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { z } from 'zod';

import { signedIn } from './authSlice';
import { getSessionExpiry, profileSchema } from './session';
import { saveSession } from './sessionStorage';
import type { LoginFields, RegistrationFields } from './validation';

type RegistrationRequest = Omit<RegistrationFields, 'confirmPassword'>;
const loginResponse = profileSchema.extend({ accessToken: z.string() });
const registrationResponse = z.object({ id: z.number().int().positive() });

let nextRequestId = 0;
// RTK Query records mutation arguments in Redux actions. Pass an ID so it never sees a password.
const loginRequests = new Map<number, LoginFields>();
const registrationRequests = new Map<number, RegistrationRequest>();

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://dummyjson.com/',
    credentials: 'omit',
    timeout: 15000,
  }),
  endpoints: (build) => ({
    login: build.mutation<null, number>({
      async queryFn(id, { dispatch }, _options, request) {
        const body = loginRequests.get(id);
        loginRequests.delete(id);
        if (!body) return { error: { status: 'CUSTOM_ERROR', error: 'REQUEST_MISSING' } };

        const result = await request({ url: 'auth/login', method: 'POST', body });
        if (result.error) return { error: sanitizeError(result.error.status) };

        const parsed = loginResponse.safeParse(result.data);
        if (!parsed.success) return { error: { status: 'CUSTOM_ERROR', error: 'INVALID_RESPONSE' } };

        const { accessToken, ...user } = parsed.data;
        const expiresAt = getSessionExpiry(accessToken);
        if (expiresAt === null) return { error: { status: 'CUSTOM_ERROR', error: 'INVALID_RESPONSE' } };

        try {
          await saveSession({ accessToken, user });
        } catch {
          return { error: { status: 'CUSTOM_ERROR', error: 'SESSION_WRITE_FAILED' } };
        }

        dispatch(signedIn({ user, expiresAt }));
        return { data: null };
      },
    }),
    register: build.mutation<null, number>({
      async queryFn(id, _api, _options, request) {
        const body = registrationRequests.get(id);
        registrationRequests.delete(id);
        if (!body) return { error: { status: 'CUSTOM_ERROR', error: 'REQUEST_MISSING' } };

        const result = await request({ url: 'users/add', method: 'POST', body });
        if (result.error) return { error: sanitizeError(result.error.status) };
        if (!registrationResponse.safeParse(result.data).success) {
          return { error: { status: 'CUSTOM_ERROR', error: 'INVALID_RESPONSE' } };
        }
        return { data: null };
      },
    }),
  }),
});

// The API may echo submitted data. Keep only the status in the Redux action.
function sanitizeError(status: number | string) {
  if (typeof status === 'number') return { status, data: null };
  return { status: 'CUSTOM_ERROR' as const, error: status };
}

export function prepareLogin(fields: LoginFields) {
  const id = ++nextRequestId;
  loginRequests.set(id, fields);
  return id;
}

export function prepareRegistration({ firstName, lastName, email, password }: RegistrationFields) {
  const id = ++nextRequestId;
  registrationRequests.set(id, { firstName, lastName, email, password });
  return id;
}

export function authErrorMessage(error: unknown, operation: 'login' | 'register') {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    if (operation === 'login' && (error.status === 400 || error.status === 401)) {
      return 'That username or password is incorrect. Try again.';
    }
    if (error.status === 429) return 'Too many attempts. Wait a moment and try again.';
    if ('error' in error) {
      if (error.error === 'FETCH_ERROR' || error.error === 'TIMEOUT_ERROR') {
        return 'Could not reach DummyJSON. Check your connection and try again.';
      }
      if (error.error === 'SESSION_WRITE_FAILED') {
        return 'GlobeGo could not save your session securely. Please try again.';
      }
    }
  }
  return operation === 'login'
    ? 'GlobeGo could not sign you in. Please try again.'
    : 'GlobeGo could not complete the demo registration. Please try again.';
}
