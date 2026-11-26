import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';

import { signedIn, signedOut } from '../../auth/authSlice';
import { createFavouritesPersistence } from '../favouritesPersistence';
import {
  addFavourite, captureFavouriteDetails, favouritesReducer, removeFavourite, retryFavouriteRestore,
  retryFavouriteWrite, selectFavouriteCount, selectIsFavourite, selectSavedCountries, selectSavedCountry,
  toggleFavourite,
} from '../favouritesSlice';
import { loadFavourites, saveFavourites } from '../favouritesStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const sriLanka = { id: 'LKA', name: 'Sri Lanka', capitals: ['Sri Jayawardenepura Kotte'], region: 'Asia' };
const japan = { id: 'JPN', name: 'Japan', capitals: ['Tokyo'], region: 'Asia' };
const sriLankaDetails = {
  ...sriLanka,
  subregion: 'Southern Asia',
  languages: ['Sinhala', 'Tamil'],
  currencies: [{ code: 'LKR', name: 'Sri Lankan rupee' }],
  timeZones: ['UTC+05:30'],
};
const key = (owner: number) => `globego.favourites.v1.${owner}`;
const getItem = jest.mocked(AsyncStorage.getItem);
const setItem = jest.mocked(AsyncStorage.setItem);
const disk = new Map<string, string>();
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function makeStore() {
  const persistence = createFavouritesPersistence();
  return configureStore({
    reducer: { favourites: favouritesReducer },
    middleware: (middleware) => middleware().prepend(persistence.middleware),
  });
}

function logIn(store: ReturnType<typeof makeStore>, userId = 1) {
  store.dispatch(signedIn({
    user: { id: userId, firstName: 'Demo', lastName: 'User', username: 'demo', email: 'demo@example.com' },
    expiresAt: Date.now() + 60_000,
  }));
}

beforeEach(() => {
  jest.resetAllMocks();
  disk.clear();
  getItem.mockImplementation(async (name) => disk.get(name) ?? null);
  setItem.mockImplementation(async (name, value) => { disk.set(name, value); });
});

describe('favourites state', () => {
  test('adds, deduplicates, and selects countries by alpha-3 code', async () => {
    const store = makeStore();
    logIn(store);
    await flush();
    store.dispatch(addFavourite(sriLanka));
    store.dispatch(addFavourite(japan));
    store.dispatch(addFavourite({ ...sriLanka, name: 'Duplicate' }));
    expect(selectSavedCountries(store.getState())).toEqual([japan, sriLanka]);
    expect(selectFavouriteCount(store.getState())).toBe(2);
    expect(selectIsFavourite(store.getState(), 'LKA')).toBe(true);
    expect(selectSavedCountry(store.getState(), 'LKA')).toEqual(sriLanka);
    await flush();
    expect(setItem).toHaveBeenCalledTimes(2);
  });

  test('removes and toggles by country code', async () => {
    const store = makeStore();
    logIn(store);
    await flush();
    store.dispatch(toggleFavourite(sriLanka));
    store.dispatch(toggleFavourite(sriLanka));
    store.dispatch(toggleFavourite(japan));
    store.dispatch(removeFavourite('JPN'));
    expect(selectFavouriteCount(store.getState())).toBe(0);
    expect(selectIsFavourite(store.getState(), 'JPN')).toBe(false);
    await flush();
  });

  test('adds fetched details to an existing favourite without saving unsaved countries', async () => {
    const store = makeStore();
    logIn(store);
    await flush();
    store.dispatch(captureFavouriteDetails(sriLankaDetails));
    expect(selectFavouriteCount(store.getState())).toBe(0);
    store.dispatch(addFavourite(sriLanka));
    store.dispatch(captureFavouriteDetails(sriLankaDetails));
    await flush();
    expect(selectSavedCountry(store.getState(), 'LKA')).toEqual(sriLankaDetails);
    await expect(loadFavourites(1)).resolves.toEqual({ saved: [sriLankaDetails], recovered: false });
  });
});

describe('AsyncStorage persistence', () => {
  test('saves a versioned snapshot and restores it in a new store', async () => {
    const original = makeStore();
    logIn(original);
    await flush();
    original.dispatch(addFavourite(sriLankaDetails));
    await flush();
    expect(JSON.parse(disk.get(key(1)) ?? 'null')).toEqual({ version: 1, countries: [sriLankaDetails] });
    const reopened = makeStore();
    logIn(reopened);
    expect(reopened.getState().favourites.status).toBe('loading');
    await flush();
    expect(selectSavedCountries(reopened.getState())).toEqual([sriLankaDetails]);
  });

  test('loads empty storage and recovers readable records from corrupted data', async () => {
    await expect(loadFavourites(1)).resolves.toEqual({ saved: [], recovered: false });
    disk.set(key(1), '{');
    await expect(loadFavourites(1)).resolves.toEqual({ saved: [], recovered: true });
    disk.set(key(1), JSON.stringify({ version: 1, countries: [sriLanka, { id: 'bad' }, sriLanka] }));
    await expect(loadFavourites(1)).resolves.toEqual({ saved: [sriLanka], recovered: true });
    expect(setItem).not.toHaveBeenCalled();
  });

  test('clears memory on logout, isolates users, and restores the original user', async () => {
    await saveFavourites(1, [sriLanka]);
    await saveFavourites(2, [japan]);
    const store = makeStore();
    logIn(store);
    await flush();
    expect(selectSavedCountries(store.getState())).toEqual([sriLanka]);
    store.dispatch(signedOut(undefined));
    expect(selectSavedCountries(store.getState())).toEqual([]);
    logIn(store, 2);
    expect(selectSavedCountries(store.getState())).toEqual([]);
    await flush();
    expect(selectSavedCountries(store.getState())).toEqual([japan]);
    store.dispatch(signedOut(undefined));
    logIn(store);
    await flush();
    expect(selectSavedCountries(store.getState())).toEqual([sriLanka]);
    expect(disk.has(key(1)) && disk.has(key(2))).toBe(true);
  });

  test('ignores edits while restoring and ignores a late read for a previous account', async () => {
    let finishRead!: (value: string) => void;
    const delayedRead = new Promise<string>((resolve) => { finishRead = resolve; });
    getItem.mockReturnValueOnce(delayedRead);
    await saveFavourites(2, [japan]);
    setItem.mockClear();
    const store = makeStore();
    logIn(store);
    await flush();
    store.dispatch(addFavourite(sriLanka));
    expect(setItem).not.toHaveBeenCalled();
    store.dispatch(signedOut(undefined));
    logIn(store, 2);
    await flush();
    finishRead(JSON.stringify({ version: 1, countries: [sriLanka] }));
    await flush();
    expect(selectSavedCountries(store.getState())).toEqual([japan]);
  });

  test('serializes writes and waits for them when the same user quickly signs back in', async () => {
    let finishWrite!: () => void;
    const delayedWrite = new Promise<void>((resolve) => { finishWrite = resolve; });
    setItem.mockImplementationOnce(async (name, value) => {
      await delayedWrite;
      disk.set(name, value);
    });
    const store = makeStore();
    logIn(store);
    await flush();
    store.dispatch(addFavourite(sriLanka));
    store.dispatch(addFavourite(japan));
    store.dispatch(removeFavourite('LKA'));
    store.dispatch(signedOut(undefined));
    logIn(store);
    await flush();
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(store.getState().favourites.status).toBe('loading');
    finishWrite();
    await flush();
    expect(setItem).toHaveBeenCalledTimes(3);
    expect(selectSavedCountries(store.getState())).toEqual([japan]);
  });

  test('keeps existing storage safe after a failed read and allows a restore retry', async () => {
    await saveFavourites(1, [sriLanka]);
    setItem.mockClear();
    getItem.mockRejectedValueOnce(new Error('Read unavailable'));
    const store = makeStore();
    logIn(store);
    await flush();
    expect(store.getState().favourites.status).toBe('loadError');
    store.dispatch(addFavourite(japan));
    expect(setItem).not.toHaveBeenCalled();
    store.dispatch(retryFavouriteRestore());
    await flush();
    expect(selectSavedCountries(store.getState())).toEqual([sriLanka]);
  });

  test('keeps edits in memory after a failed write and saves the latest snapshot on retry', async () => {
    setItem.mockRejectedValueOnce(new Error('Write unavailable'));
    const store = makeStore();
    logIn(store);
    await flush();
    store.dispatch(addFavourite(sriLanka));
    await flush();
    expect(selectSavedCountries(store.getState())).toEqual([sriLanka]);
    expect(store.getState().favourites.writeError).toBe(true);
    store.dispatch(retryFavouriteWrite());
    await flush();
    expect(store.getState().favourites.writeError).toBe(false);
    await expect(loadFavourites(1)).resolves.toEqual({ saved: [sriLanka], recovered: false });
  });
});
