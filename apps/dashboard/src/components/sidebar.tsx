"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ClipboardList, Home, LogOut, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  {
    label: "Audit log",
    href: "/dashboard/audit",
    icon: ClipboardList,
    roles: ["ADMIN", "BRAND_ADMIN"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const activeBrandName = user?.brand?.name ?? "Unassigned workspace";
  const roleLabel = user?.role?.replaceAll("_", " ").toLowerCase() ?? "viewer";

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Galileo Pilot
        </p>
        <div className="mt-3 rounded-xl border border-border bg-background/70 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Building2 className="size-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-serif text-lg font-semibold text-foreground">
                {activeBrandName}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Single-brand operator workspace
              </p>
            </div>
          </div>
          <Badge variant="outline" className="mt-3">
            {roleLabel}
          </Badge>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems
          .filter(
            (item) =>
              !item.roles || (user?.role && item.roles.includes(user.role)),
          )
          .map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}

        <div className="flex-1" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
