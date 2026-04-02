import { api } from "@/api/client";

export const dashboardService = {
  stats() {
    return api("/api/dashboard/stats");
  },

  upcoming(limit = 8) {
    return api(`/api/dashboard/upcoming?limit=${limit}`);
  },
};
