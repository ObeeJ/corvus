"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User { id: string; email: string; plan: string; }
interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  isLoading: boolean;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem("corvus_token");
    const storedUser = localStorage.getItem("corvus_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try { setUser(JSON.parse(storedUser)); } catch {
        localStorage.removeItem("corvus_user");
        localStorage.removeItem("corvus_token");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
    const isDashboard = pathname.startsWith("/dashboard");
    if (!token && isDashboard) router.push("/login");
    else if (token && isAuthRoute) router.push("/dashboard");
  }, [token, pathname, isLoading, router]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("corvus_token", newToken);
    localStorage.setItem("corvus_user", JSON.stringify(newUser));
    import("@sentry/nextjs").then(S => S.setUser({ id: newUser.id, email: newUser.email }));
    router.push("/dashboard");
  };

  const apiFetch = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    }).then(res => {
      // Auto-logout on 401 — token expired or secret changed
      if (res.status === 401 && token) {
        setToken(null);
        setUser(null);
        localStorage.removeItem("corvus_token");
        localStorage.removeItem("corvus_user");
        router.push("/login");
      }
      return res;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("corvus_token");
    localStorage.removeItem("corvus_user");
    import("@sentry/nextjs").then(S => S.setUser(null));
    router.push("/");
  };

  /* Pull a fresh user record (e.g. after a successful upgrade). Returns the new user or null on failure. */
  const refreshUser = async (): Promise<User | null> => {
    try {
      const res = await apiFetch("/api/v1/auth/me");
      if (!res.ok) return null;
      const fresh = (await res.json()) as User;
      setUser(fresh);
      localStorage.setItem("corvus_user", JSON.stringify(fresh));
      return fresh;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshUser, isLoading, apiFetch }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
