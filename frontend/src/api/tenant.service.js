import { api } from "@/api/client";

export const tenantService = {
  getCurrent() {
    return api("/api/tenants/current");
  },

  getPreferences() {
    return api("/api/preferences").catch(() => null);
  },
};
