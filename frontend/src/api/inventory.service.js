import { api } from "@/api/client";

export const inventoryService = {
  // ── Items ──────────────────────────────────────────────────────────────────
  list({ page = 1, limit = 20, sort_by, sort_dir, q } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (sort_by) params.set("sort_by", sort_by);
    if (sort_dir) params.set("sort_dir", sort_dir);
    if (q?.trim()) params.set("q", q.trim());
    return api(`/api/inventory?${params}`);
  },

  get(id) {
    return api(`/api/inventory/${id}`);
  },

  create(body) {
    return api("/api/inventory", { method: "POST", body: JSON.stringify(body) });
  },

  update(id, body) {
    return api(`/api/inventory/${id}`, { method: "PUT", body: JSON.stringify(body) });
  },

  delete(id) {
    return api(`/api/inventory/${id}`, { method: "DELETE" });
  },

  // ── Movements ──────────────────────────────────────────────────────────────
  listMovements(id, { page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({ page, limit });
    return api(`/api/inventory/${id}/movements?${params}`);
  },

  addMovement(id, body) {
    return api(`/api/inventory/${id}/movements`, {
      method: "POST",
      body:   JSON.stringify(body),
    });
  },
};
