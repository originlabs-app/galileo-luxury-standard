"use client";

import { Package } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <Package className="size-8 text-muted-foreground" />
      </div>
      <h2 className="mt-4 font-serif text-xl font-semibold text-foreground">
        No products yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Products will appear here once created
      </p>
    </div>
  );
}
