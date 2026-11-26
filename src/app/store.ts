import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { authApi } from '../features/auth/authApi';
import { authReducer } from '../features/auth/authSlice';
import { countriesApi } from '../features/countries/countriesApi';
import { countryCacheReducer } from '../features/countries/countryCacheSlice';
import { createFavouritesPersistence } from '../features/favourites/favouritesPersistence';
import { favouritesReducer } from '../features/favourites/favouritesSlice';

const favouritesPersistence = createFavouritesPersistence();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [countriesApi.reducerPath]: countriesApi.reducer,
    countryCache: countryCacheReducer,
    favourites: favouritesReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .prepend(favouritesPersistence.middleware)
    .concat(authApi.middleware, countriesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
