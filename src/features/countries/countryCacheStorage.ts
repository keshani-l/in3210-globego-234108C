import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

import type { CountryDetails, CountrySummary } from './countryData';
import { countryCodeSchema, countryDetailsSchema, countrySummarySchema } from './countrySchemas';

export type CacheEntry<T> = { data: T; updatedAt: number };

const prefix = 'globego.countries.v1';
const listKey = `${prefix}.list`;
const detailsKey = (id: string) => `${prefix}.details.${id}`;
const listSchema = z.array(countrySummarySchema).min(1)
  .refine((countries) => new Set(countries.map(({ id }) => id)).size === countries.length);
const pendingWrites = new Map<string, Promise<void>>();

async function read<T>(key: string, data: z.ZodType<T>): Promise<CacheEntry<T> | null> {
  try {
    await pendingWrites.get(key);
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    const parsed = z.object({ version: z.literal(1), updatedAt: z.number().int().positive(), data })
      .safeParse(JSON.parse(raw));
    return parsed.success ? { data: parsed.data.data, updatedAt: parsed.data.updatedAt } : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, entry: CacheEntry<T>) {
  const value = JSON.stringify({ version: 1, ...entry });
  const previous = pendingWrites.get(key) ?? Promise.resolve();
  const next = previous.catch(() => {}).then(() => AsyncStorage.setItem(key, value));
  pendingWrites.set(key, next);
  return next.finally(() => {
    if (pendingWrites.get(key) === next) pendingWrites.delete(key);
  });
}

export const readCountryList = () => read(listKey, listSchema);
export const readCountryDetails = (id: string) => countryCodeSchema.safeParse(id).success
  ? read(detailsKey(id), countryDetailsSchema.refine((country) => country.id === id))
  : Promise.resolve(null);

export function saveCountryList(entry: CacheEntry<CountrySummary[]>) {
  return listSchema.safeParse(entry.data).success ? write(listKey, entry) : Promise.resolve();
}

export function saveCountryDetails(entry: CacheEntry<CountryDetails>) {
  return countryDetailsSchema.safeParse(entry.data).success ? write(detailsKey(entry.data.id), entry) : Promise.resolve();
}
