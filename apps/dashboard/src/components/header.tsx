"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/products": "Products",
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-background px-6">
      <h2 className="font-serif text-xl font-semibold text-foreground">
        {title}
      </h2>
    </header>
  );
}
