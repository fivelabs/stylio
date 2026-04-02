const TOKEN_KEY = "stylio_token";
const REFRESH_KEY = "stylio_refresh";

let baseURL = "";
let onUnauthorized = null;
let onSubscriptionRequired = null;
let refreshPromise = null;

export function configureClient({ base, onAuthError, onSubscriptionError } = {}) {
  if (base !== undefined) baseURL = base;
  if (onAuthError !== undefined) onUnauthorized = onAuthError;
  if (onSubscriptionError !== undefined) onSubscriptionRequired = onSubscriptionError;
}

export function getStoredTokens() {
  return {
    token: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
  };
}

export function persistTokens(token, refreshToken) {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function attemptRefresh() {
  const { refreshToken } = getStoredTokens();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${baseURL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Refresh failed");

  persistTokens(data.token, data.refresh_token);
  return data.token;
}

async function refreshOrLogout() {
  try {
    return await attemptRefresh();
  } catch {
    clearTokens();
    onUnauthorized?.();
    throw new Error("Sesión expirada");
  }
}

export async function api(path, options = {}) {
  const { token } = getStoredTokens();
  const url = `${baseURL}${path}`;

  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && token) {
    if (!refreshPromise) refreshPromise = refreshOrLogout().finally(() => { refreshPromise = null; });

    try {
      const newToken = await refreshPromise;
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } catch {
      throw new Error("Sesión expirada");
    }
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 402) {
    onSubscriptionRequired?.();
    throw new Error("subscription_required");
  }

  if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`);

  return data;
}
