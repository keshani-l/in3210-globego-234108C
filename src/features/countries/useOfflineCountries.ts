import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectSavedCountry } from '../favourites/favouritesSlice';
import { useGetCountriesQuery, useGetCountryQuery } from './countriesApi';
import { restoreCountryDetails } from './countryCacheSlice';
import { countryCodeSchema } from './countrySchemas';

export function useOfflineCountryList() {
  const cache = useAppSelector((state) => state.countryCache.list);
  const { status, pauseRequests } = useAppSelector((state) => state.connectivity);
  const ready = cache.status === 'ready';
  // Resubscribing after reconnect starts one query. RTK Query deduplicates by endpoint and argument.
  const query = useGetCountriesQuery(undefined, { skip: !ready || pauseRequests, refetchOnMountOrArgChange: true });
  return {
    data: cache.entry?.data,
    updatedAt: cache.entry?.updatedAt,
    status,
    pauseRequests,
    ready,
    isFetching: query.isFetching,
    isError: !pauseRequests && query.isError,
    refresh: query.isUninitialized || pauseRequests ? undefined : () => { void query.refetch(); },
  };
}

export function useOfflineCountryDetails(countryId: string) {
  const focused = useIsFocused();
  const dispatch = useAppDispatch();
  const { status, pauseRequests } = useAppSelector((state) => state.connectivity);
  const cache = useAppSelector((state) => state.countryCache.details[countryId]);
  const saved = useAppSelector((state) => selectSavedCountry(state, countryId));
  const summary = useAppSelector((state) => state.countryCache.list.entry?.data.find(({ id }) => id === countryId));
  const validCode = countryCodeSchema.safeParse(countryId).success;
  const ready = !validCode || cache?.status === 'ready';

  useEffect(() => {
    if (validCode) void dispatch(restoreCountryDetails(countryId));
  }, [countryId, dispatch, validCode]);

  const query = useGetCountryQuery(countryId, {
    skip: !focused || !ready || pauseRequests || !validCode,
    refetchOnMountOrArgChange: true,
  });
  const fullDetails = cache?.entry?.data;
  return {
    country: fullDetails ?? saved ?? summary,
    fullDetails,
    hasFullDetails: fullDetails !== undefined || saved?.languages !== undefined,
    saved,
    updatedAt: cache?.entry?.updatedAt,
    status,
    pauseRequests,
    ready,
    isError: !pauseRequests && query.isError,
    notFound: !validCode || (!pauseRequests && query.currentData === null),
    refresh: query.isUninitialized || pauseRequests ? undefined : () => { void query.refetch(); },
  };
}
