import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import api from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("cn_token");
    if (!token) {
      setUser(null);
      setOrganization(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/users/me");
      setUser(data.user);
      setOrganization(data.organization);
    } catch {
      localStorage.removeItem("cn_token");
      setUser(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("cn_token", data.token);
    setUser(data.user);
    setOrganization(data.organization);
    return data;
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("cn_token", data.token);
    setUser(data.user);
    setOrganization(data.organization);
    return data;
  }

  function logout() {
    localStorage.removeItem("cn_token");
    setUser(null);
    setOrganization(null);
  }

  const value = useMemo(
    () => ({
      user,
      organization,
      loading,
      login,
      register,
      logout,
      refresh,
      isAdmin: user?.role === "admin",
      isManager: user?.role === "compliance_manager" || user?.role === "admin",
    }),
    [user, organization, loading, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
