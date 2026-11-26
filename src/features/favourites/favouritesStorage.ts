import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

import { savedCountrySchema } from '../countries/countrySchemas';
import type { FavouriteCountry } from './favouritesSlice';

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
