import { z } from "zod";

export const loginSchema = z.object({
  email:    z.email({ error: "Email inválido" }),
  password: z.string().min(1, { error: "Password requerido" }),
});

export const registerSchema = z.object({
  tenant_name: z.string().min(2, { error: "Nombre del negocio requerido" }),
  subdomain: z
    .string()
    .min(3, { error: "Subdominio mínimo 3 caracteres" })
    .max(30)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: "Subdominio solo admite letras minúsculas, números y guiones" }),
  email:      z.email({ error: "Email inválido" }),
  password:   z.string().min(6, { error: "Password mínimo 6 caracteres" }),
  first_name: z.string().min(1, { error: "Nombre requerido" }),
  last_name:  z.string().optional().default(""),
});
