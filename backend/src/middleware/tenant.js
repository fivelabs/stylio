import { Tenant } from "../modules/tenants/Tenant.js";
import { runWithTenant } from "../core/tenantContext.js";
import { env } from "../config/env.js";

const TENANT_FREE = [
  "/api/health",
  "/api/auth/register",
  "/api/integrations/google/callback",
  "/api/integrations/google/webhook",
  "/api/billing/webhook",
];

export function tenantMiddleware(req, res, next) {
  if (TENANT_FREE.some((p) => req.path.startsWith(p))) {
    return runWithTenant(null, next);
  }

  const subdomain = extractSubdomain(req);
  if (!subdomain) {
    return res.status(400).json({ error: "Subdomain required" });
  }

  Tenant.findOne({ subdomain, is_active: 1 })
    .then((tenant) => {
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      req.tenant = tenant;
      runWithTenant(tenant, next);
    })
    .catch(next);
}

function extractSubdomain(req) {
  const host = (req.hostname || "").split(":")[0];
  const base = env.TENANT_BASE_DOMAIN;

  if (host === base) return null;

  if (host.endsWith(`.${base}`)) {
    return host.slice(0, -(base.length + 1));
  }

  if (base === "localhost" && host.endsWith(".localhost")) {
    return host.replace(".localhost", "");
  }

  return null;
}
