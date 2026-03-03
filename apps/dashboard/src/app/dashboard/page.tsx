"use client";

import { AuthGuard } from "@/components/auth-guard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Dashboard will be implemented in the next feature.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
