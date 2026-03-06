import { z } from "zod";
import { registry, schemas } from "../../core/openapi.js";
import { loginSchema, registerSchema } from "@stylio/shared/schemas/auth.schema.js";

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Registrar un nuevo salón con su owner",
  description: "Crea el tenant, roles por defecto y el usuario owner. No requiere subdomain.",
  request: {
    body: { content: { "application/json": { schema: registerSchema } } },
  },
  responses: {
    201: {
      description: "Tenant creado exitosamente",
      content: {
        "application/json": {
          schema: z.object({ token: z.string(), tenant: schemas.tenant, user: schemas.user }),
        },
      },
    },
    409: {
      description: "Subdomain ya existe",
      content: { "application/json": { schema: schemas.error } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  summary: "Login con email y password",
  description: "Requiere acceder desde el subdomain del tenant (ej: salon.localhost:3000).",
  request: {
    body: { content: { "application/json": { schema: loginSchema } } },
  },
  responses: {
    200: {
      description: "Credenciales válidas",
      content: {
        "application/json": {
          schema: z.object({ token: z.string(), user: schemas.user }),
        },
      },
    },
    401: {
      description: "Credenciales inválidas",
      content: { "application/json": { schema: schemas.error } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/me",
  tags: ["Auth"],
  summary: "Perfil del usuario autenticado",
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "Datos del usuario",
      content: { "application/json": { schema: z.object({ user: schemas.user }) } },
    },
    401: {
      description: "Token inválido o ausente",
      content: { "application/json": { schema: schemas.error } },
    },
  },
});
