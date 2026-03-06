import { z } from "zod";
import { registry, schemas } from "../../core/openapi.js";
import { createUserSchema, updateUserSchema } from "@stylio/shared/schemas/user.schema.js";

registry.registerPath({
  method: "get",
  path: "/api/users",
  tags: ["Users"],
  summary: "Listar usuarios del salón",
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "Lista de usuarios",
      content: { "application/json": { schema: z.array(schemas.user) } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/users/{id}",
  tags: ["Users"],
  summary: "Obtener un usuario por ID",
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Datos del usuario",
      content: { "application/json": { schema: schemas.user } },
    },
    404: {
      description: "Usuario no encontrado",
      content: { "application/json": { schema: schemas.error } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/users",
  tags: ["Users"],
  summary: "Crear usuario (staff) en el salón",
  description: "Solo el owner puede crear usuarios. El nuevo usuario se asocia al tenant actual.",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createUserSchema } } },
  },
  responses: {
    201: {
      description: "Usuario creado",
      content: { "application/json": { schema: schemas.user } },
    },
    409: {
      description: "Email ya en uso",
      content: { "application/json": { schema: schemas.error } },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/users/{id}",
  tags: ["Users"],
  summary: "Actualizar un usuario",
  description: "No se puede modificar la cuenta del owner.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: updateUserSchema } } },
  },
  responses: {
    200: {
      description: "Usuario actualizado",
      content: { "application/json": { schema: schemas.user } },
    },
    403: {
      description: "No se puede modificar al owner",
      content: { "application/json": { schema: schemas.error } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/users/{id}",
  tags: ["Users"],
  summary: "Desactivar un usuario",
  description: "Soft-delete: marca al usuario como inactivo. No se puede desactivar al owner.",
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Usuario desactivado",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    403: {
      description: "No se puede desactivar al owner",
      content: { "application/json": { schema: schemas.error } },
    },
  },
});
