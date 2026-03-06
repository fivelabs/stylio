import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color debe ser hex (ej: #3B82F6)")
  .optional();

export const updatePreferencesSchema = z.object({
  visible_name: z.string().max(150).optional(),
  colors: z
    .object({
      brand: hexColor,
      accent: hexColor,
      "brand-dark": hexColor,
      "text-primary": hexColor,
      canvas: hexColor,
      surface: hexColor,
      border: hexColor,
    })
    .strict()
    .optional(),
  logo_url: z.string().url("URL inválida").max(2048).optional().nullable(),
  banner_horizontal_url: z.string().url("URL inválida").max(2048).optional().nullable(),
  banner_vertical_url: z.string().url("URL inválida").max(2048).optional().nullable(),
});
