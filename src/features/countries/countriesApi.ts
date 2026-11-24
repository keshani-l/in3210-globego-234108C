import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
      async queryFn(_arg, _api, _options, request) {
        const result = await request({ url: 'all', params: { fields: listFields } });
        if (result.error) return { error: result.error };
        const countries = parseCountryList(result.data);
        return countries === null ? { error: invalidResponse } : { data: countries };
      },
    }),
    getCountry: build.query<CountryDetails | null, string>({
      async queryFn(countryId, _api, _options, request) {
        if (!/^[A-Z]{3}$/.test(countryId)) return { data: null };
        const result = await request({ url: `alpha/${countryId}`, params: { fields: detailFields } });
        if (result.error?.status === 404) return { data: null };
        if (result.error) return { error: result.error };
        const country = parseCountryDetails(result.data, countryId);
        return country === null ? { error: invalidResponse } : { data: country };
      },
    }),
  }),
});

export const { useGetCountriesQuery, useGetCountryQuery } = countriesApi;
