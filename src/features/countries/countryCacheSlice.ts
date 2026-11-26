import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { readCountryDetails, readCountryList, type CacheEntry } from './countryCacheStorage';
import type { CountryDetails, CountrySummary } from './countryData';

type Resource<T> = { status: 'idle' | 'loading' | 'ready'; entry?: CacheEntry<T> };
type CountryCacheState = {
  list: Resource<CountrySummary[]>;
  details: Partial<Record<string, Resource<CountryDetails>>>;
};
type ThunkState = { state: { countryCache: CountryCacheState } };

export const restoreCountryList = createAsyncThunk<CacheEntry<CountrySummary[]> | null, void, ThunkState>(
  'countryCache/restoreList', readCountryList,
  { condition: (_, { getState }) => getState().countryCache.list.status === 'idle' },
);

export const restoreCountryDetails = createAsyncThunk<CacheEntry<CountryDetails> | null, string, ThunkState>(
  'countryCache/restoreDetails', readCountryDetails,
  { condition: (id, { getState }) => getState().countryCache.details[id] === undefined },
);

const initialState: CountryCacheState = { list: { status: 'idle' }, details: {} };

const slice = createSlice({
  name: 'countryCache',
  initialState,
  reducers: {
    countryListReceived(state, { payload }: PayloadAction<CacheEntry<CountrySummary[]>>) {
      state.list = { status: 'ready', entry: payload };
    },
    countryDetailsReceived(state, { payload }: PayloadAction<CacheEntry<CountryDetails>>) {
      state.details[payload.data.id] = { status: 'ready', entry: payload };
    },
  },
  extraReducers: (build) => build
    .addCase(restoreCountryList.pending, (state) => { state.list.status = 'loading'; })
    .addCase(restoreCountryList.fulfilled, (state, { payload }) => {
      if (state.list.status === 'loading') state.list = { status: 'ready', entry: payload ?? undefined };
    })
    .addCase(restoreCountryDetails.pending, (state, { meta }) => {
      state.details[meta.arg] = { status: 'loading' };
    })
    .addCase(restoreCountryDetails.fulfilled, (state, { meta, payload }) => {
      if (state.details[meta.arg]?.status === 'loading') {
        state.details[meta.arg] = { status: 'ready', entry: payload ?? undefined };
      }
    }),
});

export const { countryListReceived, countryDetailsReceived } = slice.actions;
export const countryCacheReducer = slice.reducer;
