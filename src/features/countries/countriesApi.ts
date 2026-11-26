import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { countryDetailsReceived, countryListReceived } from './countryCacheSlice';
import { saveCountryDetails, saveCountryList } from './countryCacheStorage';
import { parseCountryDetails, parseCountryList, type CountryDetails, type CountrySummary } from './countryData';

const listFields = 'cca3,name,capital,region,flags,population';
const detailFields = `${listFields},subregion,area,languages,currencies,timezones,independent`;
const invalidResponse = { status: 'CUSTOM_ERROR', error: 'INVALID_COUNTRY_RESPONSE' } as const;

export const countriesApi = createApi({
  reducerPath: 'countriesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://pw-d20261017a29.plainwork-apps.workers.dev/v3.1/',
    timeout: 12000,
  }),
  endpoints: (build) => ({
    getCountries: build.query<CountrySummary[], void>({
      async queryFn(_arg, api, _options, request) {
        const result = await request({ url: 'all', params: { fields: listFields } });
        if (result.error) return { error: result.error };
        const countries = parseCountryList(result.data);
        if (countries === null || countries.length === 0) return { error: invalidResponse };
        if (!api.signal.aborted) {
          const entry = { data: countries, updatedAt: Date.now() };
          api.dispatch(countryListReceived(entry));
          void saveCountryList(entry).catch(() => {});
        }
        return { data: countries };
      },
    }),
    getCountry: build.query<CountryDetails | null, string>({
      async queryFn(countryId, api, _options, request) {
        if (!/^[A-Z]{3}$/.test(countryId)) return { data: null };
        const result = await request({ url: `alpha/${countryId}`, params: { fields: detailFields } });
        if (result.error?.status === 404) return { data: null };
        if (result.error) return { error: result.error };
        const country = parseCountryDetails(result.data, countryId);
        if (country === null) return { error: invalidResponse };
        if (!api.signal.aborted) {
          const entry = { data: country, updatedAt: Date.now() };
          api.dispatch(countryDetailsReceived(entry));
          void saveCountryDetails(entry).catch(() => {});
        }
        return { data: country };
      },
    }),
  }),
});

export const { useGetCountriesQuery, useGetCountryQuery } = countriesApi;
