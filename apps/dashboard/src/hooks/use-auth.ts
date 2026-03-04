"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearLegacyTokens } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  role: string;
  brand?: {
    id: string;
    name: string;
    did: string;
  } | null;
}

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  email: string;
  password: string;
  brandName?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface AuthData {
  user: User;
}

interface MeData {
  user: User;
}

// Single auth state type — no separate isLoading or dual source of truth (C9 fix).
type AuthState =
  | { state: "loading"; user: null }
  | { state: "authenticated"; user: User }
  | { state: "unauthenticated"; user: null };

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({ state: "loading", user: null });

  // Clear legacy localStorage tokens and fetch user on mount
  useEffect(() => {
    clearLegacyTokens();

    let cancelled = false;

    api<ApiResponse<MeData>>("/auth/me")
      .then((response) => {
        if (!cancelled) {
          setAuth({ state: "authenticated", user: response.data.user });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuth({ state: "unauthenticated", user: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (params: LoginParams) => {
    const response = await api<ApiResponse<AuthData>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(params),
      skipAuth: true,
    });
    setAuth({ state: "authenticated", user: response.data.user });
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    const response = await api<ApiResponse<AuthData>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(params),
      skipAuth: true,
    });
    setAuth({ state: "authenticated", user: response.data.user });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors — server might already be logged out
    }
    setAuth({ state: "unauthenticated", user: null });
  }, []);

  return {
    user: auth.user,
    isLoading: auth.state === "loading",
    isAuthenticated: auth.state === "authenticated",
    login,
    register,
    logout,
  };
}
