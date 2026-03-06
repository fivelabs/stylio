import swaggerUi from "swagger-ui-express";

import "../modules/health/health.docs.js";
import "../modules/auth/auth.docs.js";
import "../modules/tenants/tenant.docs.js";
import "../modules/users/user.docs.js";

import "../modules/preferences/preferences.docs.js";
import { generateSpec } from "./openapi.js";

const spec = generateSpec();

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(spec);
