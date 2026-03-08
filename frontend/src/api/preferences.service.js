import { api } from "@/api/client";

export const preferencesService = {
  get() {
    return api("/api/preferences");
  },

  update(body) {
    return api("/api/preferences", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
};
