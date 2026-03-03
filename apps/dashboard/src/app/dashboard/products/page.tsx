"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { type ProductStatus } from "@galileo/shared";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  gtin: string;
  serialNumber: string;
  status: ProductStatus;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductsResponse {
  success: true;
  data: {
    products: Product[];
    pagination: Pagination;
  };
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-[#00FF88]/20 text-[#00FF88] border-[#00FF88]/30",
  TRANSFERRED: "bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/30",
  RECALLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"}
    >
      {status}
    </Badge>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api<ProductsResponse>(
        `/products?page=${currentPage}&limit=${PAGE_SIZE}`,
      );
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load products");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => fetchProducts(page)}
        >
          Retry
        </Button>
      </div>
    );
  }

  const hasProducts = products.length > 0 || (pagination && pagination.total > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product digital passports
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="size-4" />
            New Product
          </Link>
        </Button>
      </div>

      {hasProducts ? (
        <>
          {/* Product table */}
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>GTIN</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/products/${product.id}`)
                    }
                  >
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {product.gtin}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {product.serialNumber}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(product.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} products
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <Package className="size-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-serif text-xl font-semibold text-foreground">
            No products yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Create your first product to start building digital passports
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/products/new">
              <Plus className="size-4" />
              Create Product
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
