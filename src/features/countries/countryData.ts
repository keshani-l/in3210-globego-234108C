import { z } from 'zod';

const text = z.string().trim().min(1);
const nonNegativeNumber = z.number().finite().nonnegative();
const optionalText = text.optional().catch(undefined);
const optionalNumber = nonNegativeNumber.optional().catch(undefined);
const textList = z.array(z.unknown()).optional().catch(undefined).transform((values) =>
  (values ?? []).flatMap((value) => {
    const result = text.safeParse(value);
    return result.success ? [result.data] : [];
  }),
);

const countryResponse = z.object({
  cca3: z.string().regex(/^[A-Z]{3}$/),
  name: z.object({ common: text, official: optionalText }),
  capital: textList,
  region: optionalText,
  population: optionalNumber,
  flags: z.object({ png: z.url({ protocol: /^https$/ }).optional().catch(undefined) }).optional().catch(undefined),
});

const detailResponse = countryResponse.extend({
  subregion: optionalText,
  area: optionalNumber,
  languages: z.record(z.string(), z.unknown()).optional().catch(undefined),
  currencies: z.record(z.string(), z.unknown()).optional().catch(undefined),
  timezones: textList,
  independent: z.boolean().optional().catch(undefined),
});

export interface CountrySummary {
  id: string;
  name: string;
  officialName?: string;
  capitals: string[];
  region?: string;
  population?: number;
  flagUrl?: string;
}

interface Currency {
  code: string;
  name?: string;
  symbol?: string;
}

export interface CountryDetails extends CountrySummary {
  subregion?: string;
  area?: number;
  languages: string[];
  currencies: Currency[];
  timeZones: string[];
  independent?: boolean;
}

const currencyResponse = z.object({ name: optionalText, symbol: optionalText });

function toSummary(country: z.output<typeof countryResponse>): CountrySummary {
  return {
    id: country.cca3,
    name: country.name.common,
    officialName: country.name.official,
    capitals: country.capital,
    region: country.region,
    population: country.population,
    flagUrl: country.flags?.png,
  };
}

const listResponse = z.array(countryResponse);

export function parseCountryList(payload: unknown): CountrySummary[] | null {
  const response = listResponse.safeParse(payload);
  if (!response.success) return null;
  const countries = new Map(response.data.map((country) => [country.cca3, toSummary(country)]));
  return [...countries.values()].sort((first, second) => first.name.localeCompare(second.name, 'en'));
}

export function parseCountryDetails(payload: unknown, countryId: string): CountryDetails | null {
  const response = detailResponse.safeParse(Array.isArray(payload) && payload.length === 1 ? payload[0] : payload);
  if (!response.success || response.data.cca3 !== countryId) return null;
  const country = response.data;

  return {
    ...toSummary(country),
    subregion: country.subregion,
    area: country.area,
    languages: textList.parse(Object.values(country.languages ?? {})),
    currencies: Object.entries(country.currencies ?? {}).flatMap(([code, value]) => {
      const currency = currencyResponse.safeParse(value);
      return currency.success ? [{ code, ...currency.data }] : [];
    }),
    timeZones: country.timezones,
    independent: country.independent,
  };
}
