import { describe, expect, test } from '@jest/globals';

import { parseCountryDetails, parseCountryList, type CountrySummary } from '../countryData';
import { filterCountries, formatCountryNumber } from '../countryDiscovery';

const sriLanka = {
  cca3: 'LKA',
  name: { common: 'Sri Lanka', official: 'Democratic Socialist Republic of Sri Lanka' },
  capital: ['Sri Jayawardenepura Kotte'],
  region: 'Asia',
  population: 21763170,
  flags: { png: 'https://flagcdn.com/w320/lk.png' },
};

describe('country response transformation', () => {
  test('projects and sorts the country list by common name', () => {
    const result = parseCountryList([sriLanka, { cca3: 'ALA', name: { common: 'Åland Islands' } }]);
    expect(result?.map(({ id }) => id)).toEqual(['ALA', 'LKA']);
    expect(result?.[1]).toEqual({
      id: 'LKA',
      name: 'Sri Lanka',
      officialName: 'Democratic Socialist Republic of Sri Lanka',
      capitals: ['Sri Jayawardenepura Kotte'],
      region: 'Asia',
      population: 21763170,
      flagUrl: 'https://flagcdn.com/w320/lk.png',
    });
  });

  test('accepts a real empty list and rejects an error payload or malformed country', () => {
    expect(parseCountryList([])).toEqual([]);
    expect(parseCountryList({ success: false, data: null })).toBeNull();
    expect(parseCountryList([{ cca3: 'LKA' }])).toBeNull();
  });

  test('normalizes the detail object and a one-element array', () => {
    const payload = {
      ...sriLanka,
      subregion: 'Southern Asia',
      area: 65610,
      languages: { sin: 'Sinhala', tam: 'Tamil' },
      currencies: { LKR: { name: 'Sri Lankan rupee', symbol: 'Rs' } },
      timezones: ['UTC+05:30'],
      independent: false,
    };
    const parsed = parseCountryDetails(payload, 'LKA');
    expect(parsed).toMatchObject({
      id: 'LKA',
      subregion: 'Southern Asia',
      area: 65610,
      languages: ['Sinhala', 'Tamil'],
      currencies: [{ code: 'LKR', name: 'Sri Lankan rupee', symbol: 'Rs' }],
      timeZones: ['UTC+05:30'],
      independent: false,
    });
    expect(parseCountryDetails([payload], 'LKA')).toEqual(parsed);
    expect(parseCountryDetails(payload, 'JPN')).toBeNull();
  });

  test('handles unavailable and malformed optional information while keeping zero', () => {
    const result = parseCountryDetails({
      cca3: 'ATA',
      name: { common: 'Antarctica', official: null },
      region: '',
      flags: { png: 'file:///flag.png' },
      capital: [null, ' '],
      population: 0,
      area: -1,
      independent: null,
      currencies: { XYZ: null },
    }, 'ATA');
    expect(result).toEqual({
      id: 'ATA', name: 'Antarctica', officialName: undefined, flagUrl: undefined, region: undefined,
      capitals: [], population: 0, subregion: undefined, area: undefined, independent: undefined,
      currencies: [], languages: [], timeZones: [],
    });
  });
});

describe('local country discovery', () => {
  const countries: CountrySummary[] = [
    { id: 'LKA', name: 'Sri Lanka', capitals: ['Sri Jayawardenepura Kotte'], region: 'Asia' },
    { id: 'ALA', name: 'Åland Islands', capitals: ['Mariehamn'], region: 'Europe' },
    { id: 'ATA', name: 'Antarctica', capitals: [], region: 'Antarctic' },
  ];

  test('searches names and capitals regardless of case, whitespace, or diacritics', () => {
    expect(filterCountries(countries, '  ALAND ', 'All').map(({ id }) => id)).toEqual(['ALA']);
    expect(filterCountries(countries, 'KOTTE', 'All').map(({ id }) => id)).toEqual(['LKA']);
  });

  test('filters by region and combines the region with the search query', () => {
    expect(filterCountries(countries, '', 'Antarctic').map(({ id }) => id)).toEqual(['ATA']);
    expect(filterCountries(countries, 'Kotte', 'Asia').map(({ id }) => id)).toEqual(['LKA']);
    expect(filterCountries(countries, 'Kotte', 'Europe')).toEqual([]);
  });

  test('formats populations with separators and handles zero and missing values', () => {
    expect(formatCountryNumber(21763170)).toBe('21,763,170');
    expect(formatCountryNumber(0)).toBe('0');
    expect(formatCountryNumber()).toBe('Unavailable');
  });
});
