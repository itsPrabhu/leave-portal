import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setToken, getToken } from "@/lib/api/client";
import type { Role, User } from "@/types";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role: Role; department?: string; rollNo?: string }) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try {
      const { user } = await api.get<{ user: User }>("/auth/me");
      setUser(user);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    const { token, user } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
    setToken(token);
    setUser(user);
    return user;
  };

  const register: AuthCtx["register"] = async (data) => {
    const { token, user } = await api.post<{ token: string; user: User }>("/auth/register", data);
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = () => { setToken(null); setUser(null); };

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, hasRole, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
