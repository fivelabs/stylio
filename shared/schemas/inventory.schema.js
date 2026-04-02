import { z } from "zod";

export const createInventoryItemSchema = z.object({
  name:                z.string().min(1, { error: "El nombre es requerido" }).max(150),
  description:         z.string().max(500).optional().default(""),
  unit:                z.string().min(1, { error: "La unidad es requerida" }).max(30).default("unidades"),
  stock:               z.number({ error: "El stock inicial debe ser un número" }).min(0).default(0),
  low_stock_threshold: z.number().min(0).nullable().optional(),
  cost:                z.number({ error: "El costo debe ser un número" }).min(0).default(0),
});

export const updateInventoryItemSchema = z.object({
  name:                z.string().min(1).max(150).optional(),
  description:         z.string().max(500).optional(),
  unit:                z.string().min(1).max(30).optional(),
  low_stock_threshold: z.number().min(0).nullable().optional(),
  cost:                z.number().min(0).optional(),
});

export const createMovementSchema = z.object({
  type:     z.enum(["in", "out"], { error: "El tipo debe ser 'in' o 'out'" }),
  quantity: z.number({ error: "La cantidad debe ser un número" }).positive({ error: "La cantidad debe ser mayor a 0" }),
  note:     z.string().max(300).optional().default(""),
  cost:     z.number({ error: "El costo debe ser un número" }).min(0).optional(),
});
