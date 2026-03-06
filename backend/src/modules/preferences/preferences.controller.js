import { Preference } from "./Preference.js";

export async function getPreferences(req, res) {
  const prefs = await Preference.getOrCreateForCurrentTenant();
  res.json(serialize(prefs));
}

export async function updatePreferences(req, res) {
  const prefs = await Preference.upsertForCurrentTenant(req.body);
  res.json(serialize(prefs));
}

function serialize(row) {
  if (!row) return null;
  let colors = row.colors;
  if (typeof colors === "string") {
    try {
      colors = JSON.parse(colors);
    } catch {
      colors = null;
    }
  }
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    visible_name: row.visible_name,
    colors,
    logo_url: row.logo_url,
    banner_horizontal_url: row.banner_horizontal_url,
    banner_vertical_url: row.banner_vertical_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
