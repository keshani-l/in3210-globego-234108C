import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';

import { connectionStatus, connectivityChanged, connectivityReducer } from '../../../app/connectivity';
import { signedIn } from '../../auth/authSlice';
import { favouritesReducer, restoredFavourites, selectIsFavourite, toggleFavourite } from '../../favourites/favouritesSlice';
import { countriesApi } from '../countriesApi';
import { countryCacheReducer, restoreCountryDetails, restoreCountryList } from '../countryCacheSlice';
import { readCountryDetails, readCountryList, saveCountryDetails, saveCountryList } from '../countryCacheStorage';
import { filterCountries } from '../countryDiscovery';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const disk = new Map<string, string>();
const listKey = 'globego.countries.v1.list';
const lkaKey = 'globego.countries.v1.details.LKA';
const updatedAt = 1_790_000_000_000;
const sriLanka = { id: 'LKA', name: 'Sri Lanka', capitals: ['Sri Jayawardenepura Kotte'], region: 'Asia' };
const france = { id: 'FRA', name: 'France', capitals: ['Paris'], region: 'Europe' };
const details = { ...sriLanka, languages: ['Sinhala', 'Tamil'], currencies: [], timeZones: ['UTC+05:30'] };
const apiRow = { cca3: 'LKA', name: { common: 'Sri Lanka' }, capital: sriLanka.capitals, region: 'Asia' };

function makeStore() {
  return configureStore({
    reducer: { countryCache: countryCacheReducer, connectivity: connectivityReducer, favourites: favouritesReducer, [countriesApi.reducerPath]: countriesApi.reducer },
    middleware: (middleware) => middleware().concat(countriesApi.middleware),
  });
}

beforeEach(() => {
  disk.clear();
  jest.mocked(AsyncStorage.getItem).mockImplementation(async (key) => disk.get(key) ?? null);
  jest.mocked(AsyncStorage.setItem).mockImplementation(async (key, value) => { disk.set(key, value); });
});

afterEach(() => { jest.restoreAllMocks(); });

test('stores and restores a versioned country list and its update time', async () => {
  await saveCountryList({ data: [sriLanka, france], updatedAt });
  expect(JSON.parse(disk.get(listKey)!)).toEqual({ version: 1, updatedAt, data: [sriLanka, france] });
  const store = makeStore();
  await store.dispatch(restoreCountryList());
  expect(store.getState().countryCache.list.entry).toEqual({ data: [sriLanka, france], updatedAt });
});

test('restores details by country code and rejects records stored under the wrong code', async () => {
  await saveCountryDetails({ data: details, updatedAt });
  const store = makeStore();
  await store.dispatch(restoreCountryDetails('LKA'));
  expect(store.getState().countryCache.details.LKA?.entry).toEqual({ data: details, updatedAt });
  disk.set('globego.countries.v1.details.FRA', disk.get(lkaKey)!);
  await expect(readCountryDetails('FRA')).resolves.toBeNull();
});

test('treats missing, corrupted, and unsupported cached data as absent', async () => {
  await expect(readCountryList()).resolves.toBeNull();
  disk.set(listKey, '{');
  await expect(readCountryList()).resolves.toBeNull();
  disk.set(listKey, JSON.stringify({ version: 2, updatedAt, data: [sriLanka] }));
  await expect(readCountryList()).resolves.toBeNull();
});

test('leaves the last good list and details intact after network and invalid responses', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(Response.json([apiRow]))
    .mockResolvedValueOnce(Response.json({ ...apiRow, languages: { sin: 'Sinhala' } }))
    .mockResolvedValueOnce(Response.json([], { status: 200 }))
    .mockResolvedValueOnce(Response.json({ message: 'Unavailable' }, { status: 503 }))
    .mockResolvedValueOnce(Response.json({ message: 'Not Found' }, { status: 404 }));
  const store = makeStore();
  const list = await store.dispatch(countriesApi.endpoints.getCountries.initiate(undefined, { subscribe: false }));
  const detail = await store.dispatch(countriesApi.endpoints.getCountry.initiate('LKA', { subscribe: false }));
  expect(list.isSuccess && detail.isSuccess).toBe(true);
  const snapshot = store.getState().countryCache;
  const storedList = await readCountryList();
  const storedDetails = await readCountryDetails('LKA');
  await store.dispatch(countriesApi.endpoints.getCountries.initiate(undefined, { subscribe: false, forceRefetch: true }));
  await store.dispatch(countriesApi.endpoints.getCountry.initiate('LKA', { subscribe: false, forceRefetch: true }));
  await store.dispatch(countriesApi.endpoints.getCountry.initiate('LKA', { subscribe: false, forceRefetch: true }));
  expect(fetch).toHaveBeenCalledTimes(5);
  expect(store.getState().countryCache).toBe(snapshot);
  await expect(readCountryList()).resolves.toEqual(storedList);
  await expect(readCountryDetails('LKA')).resolves.toEqual(storedDetails);
  store.dispatch(countriesApi.util.resetApiState());
});

test('restored countries still support name, capital, region, and favourite changes offline', async () => {
  await saveCountryList({ data: [sriLanka, france], updatedAt });
  const fetch = jest.spyOn(globalThis, 'fetch');
  const store = makeStore();
  store.dispatch(connectivityChanged('offline'));
  store.dispatch(signedIn({
    user: { id: 1, username: 'demo', firstName: 'Demo', lastName: 'User', email: 'demo@example.com' },
    expiresAt: updatedAt,
  }));
  store.dispatch(restoredFavourites({ session: store.getState().favourites.session, saved: [], recovered: false }));
  await store.dispatch(restoreCountryList());
  const cached = store.getState().countryCache.list.entry?.data ?? [];
  expect(filterCountries(cached, 'France', 'All')).toEqual([france]);
  expect(filterCountries(cached, 'Kotte', 'Europe')).toEqual([]);
  const match = filterCountries(cached, 'Kotte', 'Asia');
  expect(match).toEqual([sriLanka]);
  store.dispatch(toggleFavourite(match[0]));
  expect(selectIsFavourite(store.getState(), 'LKA')).toBe(true);
  expect(fetch).not.toHaveBeenCalled();
});

test('pauses requests on confirmed disconnect and unpauses once on confirmed reconnection', () => {
  const store = makeStore();
  const report = (connected: boolean | null) => store.dispatch(connectivityChanged(connectionStatus(connected)));
  report(null);
  expect(store.getState().connectivity).toEqual({ status: 'unknown', pauseRequests: false });
  report(false);
  expect(store.getState().connectivity).toEqual({ status: 'offline', pauseRequests: true });
  report(null);
  expect(store.getState().connectivity).toEqual({ status: 'unknown', pauseRequests: true });
  report(true);
  const reconnected = store.getState().connectivity;
  expect(reconnected).toEqual({ status: 'online', pauseRequests: false });
  report(true);
  expect(store.getState().connectivity).toBe(reconnected);
});
