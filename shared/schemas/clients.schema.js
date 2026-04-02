import { z } from "zod";

function validateRutDv(rut) {
  const upper = rut.toUpperCase();
  const dv    = upper.slice(-1);
  const body  = upper.slice(0, -1);

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected  = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
  return dv === expected;
}

const rutSchema = z
  .string()
  .regex(/^\d{7,8}[0-9Kk]$/, { error: "RUT inválido. Formato esperado: 12345678K (sin puntos ni guion)" })
  .transform((v) => v.toUpperCase())
  .refine(validateRutDv, { error: "El dígito verificador del RUT es incorrecto" });

export const createClientSchema = z
  .object({
    rut:        rutSchema.optional(),
    first_name: z.string().min(1).max(150).optional(),
    last_name:  z.string().max(150).optional().default(""),
    alias:      z.string().min(1).max(150).optional(),
  })
  .refine(
    (d) => d.first_name?.trim() || d.alias?.trim(),
    { error: "Debes ingresar al menos un nombre o un alias (ej. usuario de Instagram)" }
  );

export const updateClientSchema = z.object({
  rut:        rutSchema.optional(),
  first_name: z.string().min(1).max(150).optional(),
  last_name:  z.string().max(150).optional(),
  alias:      z.string().min(1).max(150).optional().nullable(),
});
