import { api } from "@/api/client";

export const clientsService = {
  list({ page = 1, limit = 20, sort_by, sort_dir, q } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (sort_by) params.set("sort_by", sort_by);
    if (sort_dir) params.set("sort_dir", sort_dir);
    if (q?.trim()) params.set("q", q.trim());
    return api(`/api/clients?${params}`);
  },

  create(body) {
    return api("/api/clients", { method: "POST", body: JSON.stringify(body) });
  },

  update(id, body) {
    return api(`/api/clients/${id}`, { method: "PUT", body: JSON.stringify(body) });
  },

  delete(id) {
    return api(`/api/clients/${id}`, { method: "DELETE" });
  },
};
