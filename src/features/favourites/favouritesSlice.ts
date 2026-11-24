import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { signedIn, signedOut } from '../auth/authSlice';
import type { CountryDetails, CountrySummary } from '../countries/countryData';

export type FavouriteCountry = CountrySummary & Partial<CountryDetails>;

const countries = createEntityAdapter<FavouriteCountry>({
  sortComparer: (first, second) => first.name.localeCompare(second.name, 'en'),
});

function initialState(session = 0, ownerId: number | null = null) {
  return countries.getInitialState({
    session,
    ownerId,
    status: (ownerId === null ? 'idle' : 'loading') as 'idle' | 'loading' | 'ready' | 'loadError',
    recovered: false,
    writeError: false,
    revision: 0,
  });
}

export type FavouritesState = ReturnType<typeof initialState>;

const slice = createSlice({
  name: 'favourites',
  initialState: initialState(),
  reducers: {
    addFavourite(state, { payload }: PayloadAction<FavouriteCountry>) {
      if (state.status !== 'ready' || state.entities[payload.id]) return;
      countries.addOne(state, payload);
      state.revision++;
    },
    removeFavourite(state, { payload }: PayloadAction<string>) {
      if (state.status !== 'ready' || !state.entities[payload]) return;
      countries.removeOne(state, payload);
      state.revision++;
    },
    toggleFavourite(state, { payload }: PayloadAction<FavouriteCountry>) {
      if (state.status !== 'ready') return;
      if (state.entities[payload.id]) countries.removeOne(state, payload.id);
      else countries.addOne(state, payload);
      state.revision++;
    },
    captureFavouriteDetails(state, { payload }: PayloadAction<CountryDetails>) {
      const previous = state.entities[payload.id];
      if (state.status !== 'ready' || !previous || previous.languages !== undefined) return;
      countries.setOne(state, payload);
      state.revision++;
    },
    restoredFavourites(state, { payload }: PayloadAction<{ session: number; saved: FavouriteCountry[]; recovered: boolean }>) {
      if (state.status !== 'loading' || state.session !== payload.session) return;
      countries.setAll(state, payload.saved);
      state.status = 'ready';
      state.recovered = payload.recovered;
    },
    failedFavouriteRestore(state, { payload }: PayloadAction<number>) {
      if (state.status === 'loading' && state.session === payload) state.status = 'loadError';
    },
    retryFavouriteRestore(state) {
      if (state.status === 'loadError') state.status = 'loading';
    },
    settledFavouriteWrite(state, { payload }: PayloadAction<{ session: number; revision: number; failed: boolean }>) {
      if (state.session !== payload.session || state.revision !== payload.revision) return;
      state.writeError = payload.failed;
      if (!payload.failed) state.recovered = false;
    },
    retryFavouriteWrite(state) {
      if (state.status === 'ready') state.writeError = false;
    },
  },
  extraReducers: (build) => build
    .addCase(signedIn, (state, action) => {
      if (state.ownerId !== action.payload.user.id) return initialState(state.session + 1, action.payload.user.id);
    })
    .addCase(signedOut, (state) => initialState(state.session + 1)),
});

export const {
  addFavourite, removeFavourite, toggleFavourite, captureFavouriteDetails, restoredFavourites,
  failedFavouriteRestore, retryFavouriteRestore, settledFavouriteWrite, retryFavouriteWrite,
} = slice.actions;

export const favouritesReducer = slice.reducer;
export const selectFavouritesState = (state: { favourites: FavouritesState }) => state.favourites;
export const {
  selectAll: selectSavedCountries,
  selectTotal: selectFavouriteCount,
  selectById: selectSavedCountry,
} = countries.getSelectors(selectFavouritesState);

export const selectIsFavourite = (state: { favourites: FavouritesState }, countryId: string) =>
  selectSavedCountry(state, countryId) !== undefined;
