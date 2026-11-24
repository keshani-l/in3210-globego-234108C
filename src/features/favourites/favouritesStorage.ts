import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

import type { FavouriteCountry } from './favouritesSlice';

const text = z.string().trim().min(1);
const savedCountrySchema = z.object({
  id: z.string().regex(/^[A-Z]{3}$/),
  name: text,
  officialName: text.optional(),
  capitals: z.array(text),
  region: text.optional(),
  population: z.number().finite().nonnegative().optional(),
  flagUrl: z.url({ protocol: /^https$/ }).optional(),
  subregion: text.optional(),
  area: z.number().finite().nonnegative().optional(),
  languages: z.array(text).optional(),
  currencies: z.array(z.object({ code: text, name: text.optional(), symbol: text.optional() })).optional(),
  timeZones: z.array(text).optional(),
  independent: z.boolean().optional(),
});

const envelope = z.object({ version: z.literal(1), countries: z.array(z.unknown()) });
const keyFor = (ownerId: number) => `globego.favourites.v1.${ownerId}`;

export async function loadFavourites(ownerId: number): Promise<{ saved: FavouriteCountry[]; recovered: boolean }> {
  const raw = await AsyncStorage.getItem(keyFor(ownerId));
  if (raw === null) return { saved: [], recovered: false };

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { saved: [], recovered: true };
  }
  const parsed = envelope.safeParse(payload);
  if (!parsed.success) return { saved: [], recovered: true };

  const saved = new Map<string, FavouriteCountry>();
  for (const value of parsed.data.countries) {
    const country = savedCountrySchema.safeParse(value);
    if (country.success) saved.set(country.data.id, country.data);
  }
  return { saved: [...saved.values()], recovered: saved.size !== parsed.data.countries.length };
}

export function saveFavourites(ownerId: number, countries: FavouriteCountry[]) {
  return AsyncStorage.setItem(keyFor(ownerId), JSON.stringify({ version: 1, countries }));
}
