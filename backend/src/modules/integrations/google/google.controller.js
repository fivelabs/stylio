import { env } from "../../../config/env.js";
import { db } from "../../../config/database.js";
import * as googleService from "./google.service.js";

function frontendUrl(subdomain, path) {
  const host = `${subdomain}.${env.TENANT_BASE_DOMAIN}`;
  const port = env.APP_FRONTEND_PORT !== "80" && env.APP_FRONTEND_PORT !== "443"
    ? `:${env.APP_FRONTEND_PORT}`
    : "";
  return `http://${host}${port}${path}`;
}

export function getAuthUrl(req, res) {
  if (!env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: "Google Calendar no está configurado en el servidor" });
  }
  const url = googleService.getAuthUrl(req.tenant.id, req.user.userId);
  res.json({ url });
}

export async function handleCallback(req, res) {
  const { code, state, error } = req.query;

  if (error || !code || !state) {
    return res.status(400).send("OAuth error: " + (error || "missing params"));
  }

  try {
    const { tenantId } = await googleService.handleOAuthCallback(code, state);

    const tenant = await db("tenants").where({ id: tenantId }).first();
    if (!tenant) return res.status(404).send("Tenant not found");

    googleService.setupWatch(tenantId).catch(() => {});

    res.redirect(frontendUrl(tenant.subdomain, "/configuracion?google=connected"));
  } catch (err) {
    const stateData = (() => {
      try { return JSON.parse(Buffer.from(state, "base64url").toString()); } catch { return null; }
    })();

    if (stateData?.tenantId) {
      const tenant = await db("tenants").where({ id: stateData.tenantId }).first().catch(() => null);
      if (tenant) {
        return res.redirect(
          frontendUrl(tenant.subdomain, `/configuracion?google=error&msg=${encodeURIComponent(err.message)}`),
        );
      }
    }

    res.status(500).send("Error al conectar Google Calendar: " + err.message);
  }
}

export async function getStatus(req, res) {
  const status = await googleService.getStatus(req.tenant.id);
  res.json(status ? { connected: true, ...status } : { connected: false });
}

export async function disconnectGoogle(req, res) {
  await googleService.disconnect(req.tenant.id);
  res.status(204).end();
}

export function handleWebhook(req, res) {
  res.status(200).end();
  const channelId = req.headers["x-goog-channel-id"];
  googleService.processWebhook(channelId).catch(() => {});
}
