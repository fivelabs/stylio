import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Password requerido"),
});

export const registerSchema = z.object({
  tenant_name: z.string().min(2, "Nombre del negocio requerido"),
  subdomain: z
    .string()
    .min(3, "Subdominio mínimo 3 caracteres")
    .max(30)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Subdominio solo admite letras minúsculas, números y guiones"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Password mínimo 6 caracteres"),
  first_name: z.string().min(1, "Nombre requerido"),
  last_name: z.string().optional().default(""),
});
