"use client";

import { usePathname } from "next/navigation";
import { WalletConnection } from "@/components/wallet-connection";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/products": "Products",
  "/dashboard/products/new": "New Product",
};

function resolveTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Products sub-pages
  if (pathname.startsWith("/dashboard/products")) return "Products";

  return "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = resolveTitle(pathname);
  const activeBrandName = user?.brand?.name ?? "Unassigned workspace";
  const roleLabel = user?.role?.replaceAll("_", " ").toLowerCase() ?? "viewer";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {activeBrandName}
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {title}
          </h2>
          <Badge variant="secondary">{roleLabel}</Badge>
        </div>
      </div>
      <WalletConnection />
    </header>
  );
}
