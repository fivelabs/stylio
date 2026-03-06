import { z } from "zod";
import { registry, schemas } from "../../core/openapi.js";
import { updatePreferencesSchema } from "@stylio/shared/schemas/preferences.schema.js";

const preferencesResponse = z.object({
  id: z.number(),
  tenant_id: z.number(),
  visible_name: z.string().nullable(),
  colors: z.record(z.string()).nullable(),
  logo_url: z.string().nullable(),
  banner_horizontal_url: z.string().nullable(),
  banner_vertical_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

registry.registerPath({
  method: "get",
  path: "/api/preferences",
  tags: ["Preferences"],
  summary: "Obtener preferencias del salón",
  description:
    "Preferencias de marca del tenant (nombre visible, colores, logos, banners). Público para poder personalizar login/dashboard. Crea un registro por defecto si no existe.",
  responses: {
    200: {
      description: "Preferencias del tenant",
      content: { "application/json": { schema: preferencesResponse } },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/preferences",
  tags: ["Preferences"],
  summary: "Actualizar preferencias del salón",
  description: "Solo el owner puede modificar. Hace upsert por tenant.",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: updatePreferencesSchema } } },
  },
  responses: {
    200: {
      description: "Preferencias actualizadas",
      content: { "application/json": { schema: preferencesResponse } },
    },
    400: {
      description: "Validación fallida",
      content: { "application/json": { schema: schemas.error } },
    },
  },
});
