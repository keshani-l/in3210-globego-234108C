import type { CountrySummary } from './countryData';

export const regions = ['All', 'Asia', 'Europe', 'Africa', 'Americas', 'Oceania', 'Antarctic'] as const;
export type RegionFilter = (typeof regions)[number];

function searchable(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function filterCountries(countries: readonly CountrySummary[], search: string, region: RegionFilter) {
  const query = searchable(search.trim());
  return countries.filter((country) => {
    if (region !== 'All' && country.region !== region) return false;
    if (!query) return true;
    return [country.name, country.officialName, ...country.capitals].some(
      (value) => value !== undefined && searchable(value).includes(query),
    );
  });
}

const numberFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 2 });

export function formatCountryNumber(value?: number) {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? numberFormatter.format(value) : 'Unavailable';
}
