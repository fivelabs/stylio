import { api } from "@/api/client";

export const salesService = {
  summary() {
    return api("/api/sales/summary");
  },

  chart() {
    return api("/api/sales/chart");
  },

  list({ page = 1, limit = 20, sort_by, sort_dir, q, from, to } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (sort_by)  params.set("sort_by",  sort_by);
    if (sort_dir) params.set("sort_dir", sort_dir);
    if (q?.trim()) params.set("q", q.trim());
    if (from) params.set("from", from);
    if (to)   params.set("to",   to);
    return api(`/api/sales?${params}`);
  },
};
