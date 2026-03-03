"use client";

import { useParams } from "next/navigation";
import { Package } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <Package className="size-8 text-muted-foreground" />
      </div>
      <h2 className="mt-4 font-serif text-xl font-semibold text-foreground">
        Product Detail
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Product ID: {params.id}
      </p>
    </div>
  );
}
