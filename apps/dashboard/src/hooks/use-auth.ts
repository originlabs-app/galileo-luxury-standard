"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
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

type AuthState = "loading" | "authenticated" | "unauthenticated";

// Simple subscription for auth state
let listeners: Array<() => void> = [];
let authSnapshot: { state: AuthState } = { state: "loading" };

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return authSnapshot;
}

function getServerSnapshot() {
  return { state: "loading" as AuthState };
}

function setAuthState(state: AuthState) {
  authSnapshot = { state };
  for (const listener of listeners) {
    listener();
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Clear legacy localStorage tokens and fetch user on mount
  useEffect(() => {
    clearLegacyTokens();

    let cancelled = false;

    api<ApiResponse<MeData>>("/auth/me")
      .then((response) => {
        if (!cancelled) {
          setUser(response.data.user);
          setIsLoading(false);
          setAuthState("authenticated");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
          setAuthState("unauthenticated");
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
    setUser(response.data.user);
    setAuthState("authenticated");
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    const response = await api<ApiResponse<AuthData>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(params),
      skipAuth: true,
    });
    setUser(response.data.user);
    setAuthState("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors — server might already be logged out
    }
    setUser(null);
    setAuthState("unauthenticated");
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: authState.state === "authenticated",
    login,
    register,
    logout,
  };
}
