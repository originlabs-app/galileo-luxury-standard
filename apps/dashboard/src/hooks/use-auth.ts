"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  clearTokens,
  isAuthenticated as checkAuth,
  setTokens,
} from "@/lib/auth";

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
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface MeData {
  user: User;
}

// Simple subscription for auth state
let listeners: Array<() => void> = [];
let authSnapshot = { authenticated: checkAuth() };

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
  return { authenticated: false };
}

function notifyListeners() {
  authSnapshot = { authenticated: checkAuth() };
  for (const listener of listeners) {
    listener();
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // Only loading if we have tokens to verify; otherwise we know we're unauthenticated
  const [isLoading, setIsLoading] = useState(() =>
    typeof window !== "undefined" ? checkAuth() : false
  );

  const authState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Fetch user data on mount via useEffect (not during render)
  useEffect(() => {
    if (!checkAuth()) {
      return;
    }

    let cancelled = false;

    api<ApiResponse<MeData>>("/auth/me")
      .then((response) => {
        if (!cancelled) {
          setUser(response.data.user);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          if (error instanceof ApiError && error.status === 401) {
            clearTokens();
            notifyListeners();
          }
          setUser(null);
          setIsLoading(false);
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
    setTokens(response.data.accessToken, response.data.refreshToken);
    setUser(response.data.user);
    notifyListeners();
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    const response = await api<ApiResponse<AuthData>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(params),
      skipAuth: true,
    });
    setTokens(response.data.accessToken, response.data.refreshToken);
    setUser(response.data.user);
    notifyListeners();
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    notifyListeners();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: authState.authenticated,
    login,
    register,
    logout,
  };
}
