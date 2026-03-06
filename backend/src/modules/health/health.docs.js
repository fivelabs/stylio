import { z } from "zod";
import { registry } from "../../core/openapi.js";

registry.registerPath({
  method: "get",
  path: "/api/health",
  tags: ["Health"],
  summary: "Health check",
  responses: {
    200: {
      description: "API is running",
      content: { "application/json": { schema: z.object({ status: z.string() }) } },
    },
  },
});
