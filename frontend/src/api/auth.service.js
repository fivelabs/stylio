import { api } from "@/api/client";

export const authService = {
  login(email, password) {
    return api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(payload) {
    return api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        tenant_name: payload.tenant_name,
        subdomain: payload.subdomain,
        email: payload.email,
        password: payload.password,
        first_name: payload.first_name,
        last_name: payload.last_name ?? "",
      }),
    });
  },

  me() {
    return api("/api/auth/me");
  },
};
