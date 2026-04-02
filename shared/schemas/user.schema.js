import { z } from "zod";

export const createUserSchema = z.object({
  email:      z.email({ error: "Email inválido" }),
  password:   z.string().min(6, { error: "Password mínimo 6 caracteres" }),
  first_name: z.string().min(1, { error: "Nombre requerido" }),
  last_name:  z.string().optional().default(""),
  role_id:    z.number({ coerce: true }).int().positive({ error: "role_id inválido" }),
});

export const updateUserSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name:  z.string().optional(),
  role_id:    z.number({ coerce: true }).int().positive().optional(),
  is_active:  z.boolean().optional(),
});
