"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

// useSyncExternalStore with getServerSnapshot returning false and
// getSnapshot returning true avoids the hydration mismatch lint-safely:
// SSR and first client render both get false (not mounted), then React
// re-renders with true after hydration completes.
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // SSR and first client render both return null — no hydration mismatch.
  // After hydration, useSyncExternalStore returns true and we show real content.
  if (!mounted || isLoading) {
    return null;
  }

  // Not authenticated after check — render nothing while redirect happens
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
