import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Password mínimo 6 caracteres"),
  first_name: z.string().min(1, "Nombre requerido"),
  last_name: z.string().optional().default(""),
  role_id: z.number({ coerce: true }).int().positive("role_id inválido"),
});

export const updateUserSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().optional(),
  role_id: z.number({ coerce: true }).int().positive().optional(),
  is_active: z.boolean().optional(),
});
