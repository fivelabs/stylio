import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useTenant } from "@/app/TenantProvider";

const AuthContext = createContext(null);

const TOKEN_KEY = "stylio_token";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const { apiBase } = useTenant();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(!!token);

  const persist = useCallback((newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${apiBase}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    persist(data.token);
    setUser(data.user);
    return data;
  }, [apiBase, persist]);

  const register = useCallback(async (payload) => {
    const res = await fetch(`${apiBase}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    persist(data.token);
    setUser(data.user);
    return data;
  }, [apiBase, persist]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${apiBase}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Session expired");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token, apiBase, logout]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
