import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

export const schemas = {
  error: z.object({ error: z.string() }),
  user: z.object({
    id: z.number(),
    email: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    tenant_id: z.number(),
    role_id: z.number(),
    is_owner: z.boolean(),
    is_active: z.boolean(),
  }),
  tenant: z.object({
    id: z.number(),
    name: z.string(),
    subdomain: z.string(),
  }),
};

export function generateSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Stylio API",
      version: "1.0.0",
      description: "API multi-tenant para profesionales de la belleza",
    },
    servers: [{ url: "http://localhost:3000", description: "Local" }],
  });
}
