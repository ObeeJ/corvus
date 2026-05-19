"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
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
  const tokenRef = useRef<string | null>(null);

  // Keep ref in sync so apiFetch always uses latest token without stale closure
  useEffect(() => { tokenRef.current = token; }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("corvus_token");
    const storedUser = localStorage.getItem("corvus_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      tokenRef.current = storedToken;
      try { setUser(JSON.parse(storedUser)); } catch {
        localStorage.removeItem("corvus_user");
        localStorage.removeItem("corvus_token");
      }
    }
    setIsLoading(false);
  }, []);

  // Route protection
  useEffect(() => {
    if (isLoading) return;
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
    const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/billing");
    if (!token && isDashboard) router.push("/login");
    else if (token && isAuthRoute) router.push("/dashboard");
  }, [token, pathname, isLoading, router]);

  // Silent token refresh every 20 minutes (token expires in 24h)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenRef.current}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
          tokenRef.current = data.token;
          setUser(data.user);
          localStorage.setItem("corvus_token", data.token);
          localStorage.setItem("corvus_user", JSON.stringify(data.user));
        }
      } catch { /* silent — user will be prompted on next 401 */ }
    }, 20 * 60 * 1000); // 20 minutes
    return () => clearInterval(interval);
  }, [token]);

  const apiFetch = useCallback((url: string, options: RequestInit = {}) => {
    const currentToken = tokenRef.current;
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        ...(options.headers || {}),
      },
    }).then(res => {
      // Auto-logout on 401
      if (res.status === 401 && currentToken) {
        setToken(null);
        setUser(null);
        tokenRef.current = null;
        localStorage.removeItem("corvus_token");
        localStorage.removeItem("corvus_user");
        router.push("/login");
      }
      // On 402 (quota exceeded) redirect to billing
      if (res.status === 402) {
        router.push("/billing?quota=exceeded");
      }
      return res;
    });
  }, [router]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    tokenRef.current = newToken;
    setUser(newUser);
    localStorage.setItem("corvus_token", newToken);
    localStorage.setItem("corvus_user", JSON.stringify(newUser));
    import("@sentry/nextjs").then(S => S.setUser({ id: newUser.id, email: newUser.email }));
    router.push("/dashboard");
  };

  const logout = () => {
    setToken(null);
    tokenRef.current = null;
    setUser(null);
    localStorage.removeItem("corvus_token");
    localStorage.removeItem("corvus_user");
    import("@sentry/nextjs").then(S => S.setUser(null));
    router.push("/");
  };

  // Fetch fresh user from DB — used after billing upgrade to reflect new plan immediately
  const refreshUser = async (): Promise<User | null> => {
    try {
      const res = await apiFetch("/api/v1/auth/me");
      if (!res.ok) return null;
      const fresh = (await res.json()) as User;
      setUser(fresh);
      localStorage.setItem("corvus_user", JSON.stringify(fresh));
      return fresh;
    } catch { return null; }
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
