import { z } from 'zod';

const text = z.string().trim().min(1);
export const countryCodeSchema = z.string().regex(/^[A-Z]{3}$/);
export const countrySummarySchema = z.object({
  id: countryCodeSchema,
  name: text,
  officialName: text.optional(),
  capitals: z.array(text),
  region: text.optional(),
  population: z.number().finite().nonnegative().optional(),
  flagUrl: z.url({ protocol: /^https$/ }).optional(),
});

const detailFields = {
  subregion: text.optional(),
  area: z.number().finite().nonnegative().optional(),
  languages: z.array(text),
  currencies: z.array(z.object({ code: text, name: text.optional(), symbol: text.optional() })),
  timeZones: z.array(text),
  independent: z.boolean().optional(),
};

export const countryDetailsSchema = countrySummarySchema.extend(detailFields);
export const savedCountrySchema = countrySummarySchema.extend(z.object(detailFields).partial().shape);
