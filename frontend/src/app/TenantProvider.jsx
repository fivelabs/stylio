import { createContext, useContext, useEffect, useState } from "react";

const TenantContext = createContext(null);

const BASE_DOMAIN = import.meta.env.VITE_BASE_DOMAIN || "localhost";

const COLOR_KEYS = [
  "brand",
  "accent",
  "brand-dark",
  "text-primary",
  "canvas",
  "surface",
  "border",
];

function applyThemeColors(colors) {
  if (!colors) return;
  if (typeof colors === "string") {
    try {
      colors = JSON.parse(colors);
    } catch {
      return;
    }
  }
  if (typeof colors !== "object") return;
  const root = document.documentElement;
  COLOR_KEYS.forEach((key) => {
    const value = colors[key];
    if (value) root.style.setProperty(`--color-${key}`, value);
  });
}

function clearThemeColors() {
  const root = document.documentElement;
  COLOR_KEYS.forEach((key) => root.style.removeProperty(`--color-${key}`));
}

function extractSubdomain() {
  const host = window.location.hostname;

  if (host === BASE_DOMAIN || host === `www.${BASE_DOMAIN}`) return null;

  if (host.endsWith(`.${BASE_DOMAIN}`)) {
    return host.slice(0, -(BASE_DOMAIN.length + 1));
  }

  if (BASE_DOMAIN === "localhost" && host.endsWith(".localhost")) {
    return host.replace(".localhost", "");
  }

  return null;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}

export function TenantProvider({ children }) {
  const [subdomain] = useState(extractSubdomain);
  const [tenant, setTenant] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(!!subdomain);
  const [error, setError] = useState(null);

  const isTenantApp = !!subdomain;
  const apiPort = import.meta.env.VITE_API_PORT || "3000";
  const apiBase = isTenantApp
    ? `${window.location.protocol}//${subdomain}.${BASE_DOMAIN}:${apiPort}`
    : `${window.location.protocol}//${BASE_DOMAIN}:${apiPort}`;

  useEffect(() => {
    if (!subdomain) return;

    Promise.all([
      fetch(`${apiBase}/api/tenants/current`, { headers: { "Content-Type": "application/json" } }).then((res) => {
        if (!res.ok) throw new Error("Tenant not found");
        return res.json();
      }),
      fetch(`${apiBase}/api/preferences`, { headers: { "Content-Type": "application/json" } }).then((res) => {
        if (!res.ok) return null;
        return res.json();
      }),
    ])
      .then(([tenantData, prefsData]) => {
        setTenant(tenantData.tenant ?? tenantData);
        let colors = prefsData?.colors;
        if (typeof colors === "string") {
          try {
            colors = JSON.parse(colors);
          } catch {
            colors = null;
          }
        }
        const prefs = prefsData ? { ...prefsData, colors } : null;
        setPreferences(prefs);
        if (colors && typeof colors === "object") applyThemeColors(colors);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [subdomain, apiBase]);

  useEffect(() => {
    if (!isTenantApp) clearThemeColors();
  }, [isTenantApp]);

  return (
    <TenantContext.Provider value={{ tenant, preferences, subdomain, isTenantApp, apiBase, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}
