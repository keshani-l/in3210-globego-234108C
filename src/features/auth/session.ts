import { jwtDecode } from 'jwt-decode';
import { z } from 'zod';

export const profileSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
});

export const storedSessionSchema = z.object({
  accessToken: z.string().min(1),
  user: profileSchema,
});

export type StoredSession = z.infer<typeof storedSessionSchema>;
export type UserProfile = z.infer<typeof profileSchema>;

export function getSessionExpiry(accessToken: string, now = Date.now()): number | null {
  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(accessToken)) return null;
  try {
    const { exp } = jwtDecode(accessToken);
    const expiresAt = typeof exp === 'number' ? exp * 1000 : NaN;
    return Number.isSafeInteger(expiresAt) && expiresAt > now && expiresAt - now <= 2_147_483_647
      ? expiresAt
      : null;
  } catch {
    return null;
  }
}
