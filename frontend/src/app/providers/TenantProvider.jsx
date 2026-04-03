import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { configureClient } from "@/api/client";
import { tenantService } from "@/api/tenant.service";

const TenantContext = createContext(null);

// VITE_BASE_DOMAIN es opcional — si no está, inferimos el dominio base del hostname actual.
// Esto permite que el build funcione en cualquier dominio sin reconfigurar variables de entorno.
function inferBaseDomain() {
  if (import.meta.env.VITE_BASE_DOMAIN) return import.meta.env.VITE_BASE_DOMAIN;
  const host = window.location.hostname;
  const parts = host.split(".");
  // lashbygyal.stylio.cl → stylio.cl | stylio.cl → stylio.cl | localhost → localhost
  if (parts.length > 2) return parts.slice(-2).join(".");
  return host;
}

const BASE_DOMAIN = inferBaseDomain();

const COLOR_KEYS = [
  "brand",
  "accent",
  "brand-dark",
  "text-primary",
  "canvas",
  "surface",
  "border",
];

export function applyThemeColors(colors) {
  if (!colors) return;
  if (typeof colors === "string") {
    try { colors = JSON.parse(colors); } catch { return; }
  }
  if (typeof colors !== "object") return;
  const root = document.documentElement;
  COLOR_KEYS.forEach((key) => {
    const value = colors[key];
    if (value) root.style.setProperty(`--color-${key}`, value);
  });
}

export function clearThemeColors() {
  const root = document.documentElement;
  COLOR_KEYS.forEach((key) => root.style.removeProperty(`--color-${key}`));
}

function extractSubdomain() {
  const host = window.location.hostname;
  if (host === BASE_DOMAIN || host === `www.${BASE_DOMAIN}`) return null;
  if (host.endsWith(`.${BASE_DOMAIN}`)) return host.slice(0, -(BASE_DOMAIN.length + 1));
  if (BASE_DOMAIN === "localhost" && host.endsWith(".localhost")) return host.replace(".localhost", "");
  return null;
}

function buildApiBase() {
  // En producción VITE_API_PORT no se define → URLs relativas al origen actual (no localhost)
  // En desarrollo definir VITE_API_PORT=3000 en .env.local
  const apiPort = import.meta.env.VITE_API_PORT;
  if (!apiPort) return ""; // producción: URLs relativas, siempre al host correcto
  return `${window.location.protocol}//${window.location.hostname}:${apiPort}`;
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
  const apiBase = buildApiBase();

  const refreshPreferences = useCallback(() => {
    if (!subdomain) return Promise.resolve();

    return tenantService.getPreferences().then((prefsData) => {
      let colors = prefsData?.colors;
      if (typeof colors === "string") {
        try { colors = JSON.parse(colors); } catch { colors = null; }
      }
      const prefs = prefsData ? { ...prefsData, colors } : null;
      setPreferences(prefs);
      if (colors && typeof colors === "object") applyThemeColors(colors);
      else clearThemeColors();
      return prefs;
    });
  }, [subdomain]);

  useEffect(() => {
    configureClient({ base: apiBase });
  }, [apiBase]);

  useEffect(() => {
    if (!subdomain) return;

    Promise.all([tenantService.getCurrent(), tenantService.getPreferences()])
      .then(([tenantData, prefsData]) => {
        setTenant(tenantData.tenant ?? tenantData);

        let colors = prefsData?.colors;
        if (typeof colors === "string") {
          try { colors = JSON.parse(colors); } catch { colors = null; }
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
    <TenantContext.Provider value={{ tenant, preferences, refreshPreferences, subdomain, isTenantApp, apiBase, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}
