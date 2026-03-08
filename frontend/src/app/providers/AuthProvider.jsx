import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTenant } from "@/app/providers/TenantProvider";
import { configureClient, persistTokens, clearTokens, getStoredTokens } from "@/api/client";
import { authService } from "@/api/auth.service";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const { apiBase } = useTenant();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!getStoredTokens().token);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  useMemo(() => {
    configureClient({ base: apiBase, onAuthError: logout });
  }, [apiBase, logout]);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    persistTokens(data.token, data.refresh_token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    persistTokens(data.token, data.refresh_token);
    setUser(data.user);
    return data;
  }, []);

  useEffect(() => {
    const { token } = getStoredTokens();
    if (!token) {
      setLoading(false);
      return;
    }

    authService.me()
      .then((data) => setUser(data.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [apiBase, logout]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
