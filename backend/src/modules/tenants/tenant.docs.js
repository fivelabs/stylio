import { registry, schemas } from "../../core/openapi.js";

registry.registerPath({
  method: "get",
  path: "/api/tenants/current",
  tags: ["Tenants"],
  summary: "Tenant actual (según subdomain)",
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "Datos del tenant",
      content: { "application/json": { schema: schemas.tenant } },
    },
    401: {
      description: "Token inválido o ausente",
      content: { "application/json": { schema: schemas.error } },
    },
  },
});
