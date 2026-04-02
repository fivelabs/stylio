import { z } from "zod";

export const createServiceSchema = z.object({
  name:        z.string().min(1, { error: "El nombre es requerido" }).max(150),
  description: z.string().max(500).optional().default(""),
  price:       z.number({ error: "El precio debe ser un número" }).min(0, { error: "El precio no puede ser negativo" }),
});

export const updateServiceSchema = z.object({
  name:        z.string().min(1).max(150).optional(),
  description: z.string().max(500).optional(),
  price:       z.number().min(0).optional(),
});
