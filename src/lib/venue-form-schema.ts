import { z } from 'zod';

export const moneySchema = z
  .string()
  .trim()
  .regex(
    /^\d+(\.\d{1,2})?$/,
    'Musbat son kiriting (masalan: 150000 yoki 150000.50).',
  )
  .refine(
    (value) =>
      Number.isFinite(Number(value)) &&
      Number(value) >= 0 &&
      Number(value) <= 1e12,
    'Narx 0 dan 1 000 000 000 000 gacha bo‘lishi kerak.',
  );
const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => !value || (/^https?:\/\//.test(value) && URL.canParse(value)),
    'To‘g‘ri http yoki https havolasini kiriting.',
  );

export const venueFormSchema = z.object({
  venue_type: z.enum(['HALL', 'BAR']),
  name: z
    .string()
    .trim()
    .min(3, 'Nom kamida 3 belgidan iborat bo‘lishi kerak.')
    .max(200),
  description: z
    .string()
    .trim()
    .min(10, 'Tavsif kamida 10 belgidan iborat bo‘lishi kerak.'),
  region: z.string().min(1, 'Viloyatni tanlang.'),
  district: z.string().min(1, 'Tumanni tanlang.'),
  address: z.string().trim().min(5, 'Aniq manzilni kiriting.'),
  capacity: z
    .number({ error: 'Sig‘imni kiriting.' })
    .int('Butun son kiriting.')
    .min(1, 'Sig‘im kamida 1 kishi bo‘lishi kerak.')
    .max(100000),
  required_deposit: moneySchema,
  price_per_unit: z.union([z.literal(''), moneySchema]),
  map_link: optionalUrl,
  video_url: optionalUrl,
  amenities: z.array(z.string()),
});

export type VenueFormValues = z.infer<typeof venueFormSchema>;
