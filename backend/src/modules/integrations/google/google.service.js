import { google } from "googleapis";
import { env } from "../../../config/env.js";
import { db } from "../../../config/database.js";
import { GoogleIntegration } from "./GoogleIntegration.js";
import { Appointment } from "../../appointments/Appointment.js";
import { runWithTenant } from "../../../core/tenantContext.js";

function createOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
}

function buildEventBody(appointment) {
  return {
    summary:     `${appointment.title} — ${appointment.service}`,
    description: appointment.service,
    start: { dateTime: new Date(appointment.start_at).toISOString(), timeZone: "America/Santiago" },
    end:   { dateTime: new Date(appointment.end_at).toISOString(),   timeZone: "America/Santiago" },
  };
}

async function buildClientForTenant(tenantId) {
  const integration = await GoogleIntegration.findByTenant(tenantId);
  if (!integration) return null;

  const client = createOAuth2Client();
  client.setCredentials({
    access_token:  integration.access_token,
    refresh_token: integration.refresh_token,
    expiry_date:   new Date(integration.token_expiry).getTime(),
  });

  client.on("tokens", async (tokens) => {
    const updates = {};
    if (tokens.access_token) updates.access_token  = tokens.access_token;
    if (tokens.expiry_date)  updates.token_expiry  = new Date(tokens.expiry_date);
    if (Object.keys(updates).length) {
      await db("google_integrations").where({ tenant_id: tenantId }).update(updates);
    }
  });

  return { client, integration };
}

export function getAuthUrl(tenantId, userId) {
  const client = createOAuth2Client();
  const state  = Buffer.from(JSON.stringify({ tenantId, userId })).toString("base64url");
  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    state,
    prompt: "consent",
  });
}

export async function handleOAuthCallback(code, encodedState) {
  const { tenantId, userId } = JSON.parse(
    Buffer.from(encodedState, "base64url").toString(),
  );

  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2Api = google.oauth2({ version: "v2", auth: client });
  const { data: userInfo } = await oauth2Api.userinfo.get();

  const existing = await db("google_integrations").where({ tenant_id: tenantId }).first();
  const record = {
    tenant_id:     tenantId,
    user_id:       userId,
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expiry:  new Date(tokens.expiry_date),
    google_email:  userInfo.email,
    calendar_id:   "primary",
    sync_token:    null,
  };

  if (existing) {
    await db("google_integrations").where({ tenant_id: tenantId }).update(record);
  } else {
    await db("google_integrations").insert(record);
  }

  return { tenantId };
}

export async function getStatus(tenantId) {
  const integration = await GoogleIntegration.findByTenant(tenantId);
  if (!integration) return null;
  return {
    google_email: integration.google_email,
    calendar_id:  integration.calendar_id,
  };
}

export async function disconnect(tenantId) {
  const integration = await GoogleIntegration.findByTenant(tenantId);
  if (!integration) return;

  try {
    const client = createOAuth2Client();
    await client.revokeToken(integration.access_token);
  } catch {}

  await db("google_integrations").where({ tenant_id: tenantId }).delete();
}

export async function syncCreate(tenantId, appointment) {
  const result = await buildClientForTenant(tenantId);
  if (!result) return null;

  const { client, integration } = result;
  const calendar = google.calendar({ version: "v3", auth: client });

  const response = await calendar.events.insert({
    calendarId:  integration.calendar_id || "primary",
    requestBody: buildEventBody(appointment),
  });

  return response.data.id;
}

export async function syncUpdate(tenantId, googleEventId, appointment) {
  if (!googleEventId) return;
  const result = await buildClientForTenant(tenantId);
  if (!result) return;

  const { client, integration } = result;
  const calendar = google.calendar({ version: "v3", auth: client });

  await calendar.events.patch({
    calendarId:  integration.calendar_id || "primary",
    eventId:     googleEventId,
    requestBody: buildEventBody(appointment),
  });
}

export async function syncDelete(tenantId, googleEventId) {
  if (!googleEventId) return;
  const result = await buildClientForTenant(tenantId);
  if (!result) return;

  const { client, integration } = result;
  const calendar = google.calendar({ version: "v3", auth: client });

  await calendar.events.delete({
    calendarId: integration.calendar_id || "primary",
    eventId:    googleEventId,
  });
}

export async function setupWatch(tenantId) {
  if (!env.GOOGLE_WEBHOOK_URL) return null;

  const result = await buildClientForTenant(tenantId);
  if (!result) return null;

  const { client, integration } = result;
  const calendar  = google.calendar({ version: "v3", auth: client });
  const channelId = `stylio-${tenantId}-${Date.now()}`;

  const response = await calendar.events.watch({
    calendarId:  integration.calendar_id || "primary",
    requestBody: {
      id:      channelId,
      type:    "web_hook",
      address: env.GOOGLE_WEBHOOK_URL,
    },
  });

  await db("google_integrations").where({ tenant_id: tenantId }).update({
    watch_channel_id:  channelId,
    watch_resource_id: response.data.resourceId,
    watch_expiry:      new Date(parseInt(response.data.expiration)),
  });

  return response.data;
}

export async function processWebhook(channelId) {
  const match = channelId?.match(/^stylio-(\d+)-/);
  if (!match) return;

  const tenantId    = parseInt(match[1]);
  const result      = await buildClientForTenant(tenantId);
  if (!result) return;

  const { client, integration } = result;
  const calendar = google.calendar({ version: "v3", auth: client });

  const params = { calendarId: integration.calendar_id || "primary", singleEvents: true };
  if (integration.sync_token) {
    params.syncToken = integration.sync_token;
  } else {
    params.timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  let response;
  try {
    response = await calendar.events.list(params);
  } catch (err) {
    if (err?.response?.status === 410) {
      await db("google_integrations").where({ tenant_id: tenantId }).update({ sync_token: null });
    }
    return;
  }

  const tenant = await db("tenants").where({ id: tenantId }).first();
  if (!tenant) return;

  await runWithTenant(tenant, async () => {
    for (const event of response.data.items || []) {
      if (!event.start?.dateTime) continue;

      const existing = await db("appointments")
        .where({ tenant_id: tenantId, google_event_id: event.id })
        .first();

      if (event.status === "cancelled") {
        if (existing) await Appointment.delete(existing.id);
      } else if (existing) {
        await Appointment.update(existing.id, {
          title:    event.summary || "Sin título",
          service:  (event.description || "Google Calendar").split("\n")[0],
          start_at: new Date(event.start.dateTime),
          end_at:   new Date(event.end.dateTime),
        });
      } else {
        await Appointment.create({
          title:           event.summary || "Sin título",
          service:         (event.description || "Google Calendar").split("\n")[0],
          start_at:        new Date(event.start.dateTime),
          end_at:          new Date(event.end.dateTime),
          color:           "brand",
          notes:           null,
          google_event_id: event.id,
        });
      }
    }
  });

  if (response.data.nextSyncToken) {
    await db("google_integrations")
      .where({ tenant_id: tenantId })
      .update({ sync_token: response.data.nextSyncToken });
  }
}
