import { api } from "@/api/client";

const _hostParts = window.location.hostname.split(".");
const BASE_DOMAIN = import.meta.env.VITE_BASE_DOMAIN ||
  (_hostParts.length > 2 ? _hostParts.slice(-2).join(".") : window.location.hostname);
const API_PORT = import.meta.env.VITE_API_PORT || "";

export const billingService = {
  getStatus() {
    return api("/api/billing/status");
  },

  getPortalUrl(path = "") {
    const qs = path ? `?path=${encodeURIComponent(path)}` : "";
    return api(`/api/billing/portal${qs}`);
  },

  getSubscriptionDetails() {
    return api("/api/billing/subscription");
  },

  // Llamado desde dentro del tenant app (api client ya configurado)
  getCheckoutUrl() {
    return api("/api/billing/checkout");
  },

  /**
   * Llamado desde la landing page justo después del registro,
   * cuando el api client aún apunta al dominio raíz.
   */
  async getNewTenantCheckoutUrl(subdomain, token) {
    const portSuffix = API_PORT ? `:${API_PORT}` : "";
    const base = `${window.location.protocol}//${subdomain}.${BASE_DOMAIN}${portSuffix}`;
    const res = await fetch(`${base}/api/billing/checkout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data.url;
  },
};
