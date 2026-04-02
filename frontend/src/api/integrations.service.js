import { api } from "@/api/client";

export const googleCalendarService = {
  getStatus() {
    return api("/api/integrations/google/status");
  },

  getAuthUrl() {
    return api("/api/integrations/google/auth");
  },

  disconnect() {
    return api("/api/integrations/google", { method: "DELETE" });
  },
};
