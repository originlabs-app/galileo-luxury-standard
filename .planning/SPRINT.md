# Sprint -- Galileo Protocol

> Current batch of tasks with implementation briefs. The Developer picks from here.
> Created by the Researcher from the BACKLOG. Each task includes a brief: files to modify, approach, patterns, edge cases.
> Archived when all tasks are validated or deferred.

## Sprint #5 -- Dashboard Live Data

**Goal**: Close the pilot dashboard gap -- live data, filtering, and image upload in the dashboard UI. All APIs already exist; this sprint wires the frontend.
**Started**: 2026-03-09
**Status**: active

## Tasks

| # | Task | Epic | Status | Verify | Commit |
|---|------|------|--------|--------|--------|
| 1 | GET /products/stats endpoint | EPIC-002 | todo | Returns counts per status, total verifications, recent events. Brand-scoped for non-ADMIN. | |
| 2 | Dashboard home: live stats + recent activity | EPIC-002 | todo | Stats cards show real numbers from API, activity feed shows recent events with timestamps. | |
| 3 | Dashboard product list: filter UI (status + category dropdowns) | EPIC-002 | todo | Selecting a filter updates the product list. Clearing filter shows all products. | |
| 4 | Dashboard product image upload UI | EPIC-006 | todo | Product create/edit forms allow image upload. Uploaded image visible on product detail. | |
| 5 | E2E Playwright: dashboard stats, filters, upload | EPIC-007 | todo | Automated Playwright specs covering Sprint #5 features. Run with `pnpm --filter dashboard exec playwright test`. | |

### Status values
- `todo` -- Not started
- `in_progress` -- Developer is working on it
- `done` -- Developer committed, awaiting validation
- `validated` -- Tester confirmed it meets verification criteria
- `blocked` -- Cannot proceed, reason in Notes
- `deferred` -- Pushed back to BACKLOG by the Researcher for a future sprint

## Completion Criteria

- [ ] All tasks validated or explicitly deferred
- [ ] All tests pass
- [ ] No P0 bugs introduced
- [ ] CONTEXT.md updated if architecture changed

## Task Briefs

### Brief #1: GET /products/stats Endpoint

**Type**: backend
**Priority**: P2
**Epic**: EPIC-002-product-lifecycle

**Files to modify**:
- `apps/api/src/routes/products/stats.ts` -- NEW: stats route handler
- `apps/api/src/routes/products/index.ts` -- register stats route
- `apps/api/test/products.test.ts` -- add stats tests

**Approach**:

A new GET endpoint that aggregates product data for the dashboard. It returns:
- Product counts grouped by status (DRAFT, ACTIVE, TRANSFERRED, RECALLED)
- Total verification count (VERIFIED events)
- Recent ProductEvents (last 10) for the activity feed

The endpoint is authenticated and brand-scoped: non-ADMIN users see only their brand's data (R31). ADMIN users see all data.

**Step 1: Create `apps/api/src/routes/products/stats.ts`**

```typescript
import type { FastifyInstance } from "fastify";
import { EventType } from "@galileo/shared";

export default async function statsProductRoute(fastify: FastifyInstance) {
  fastify.get(
    "/products/stats",
    {
      onRequest: [fastify.authenticate],
      schema: {
        description:
          "Get aggregated product statistics for the dashboard. " +
          "Brand-scoped for non-ADMIN users.",
        tags: ["Products"],
        security: [{ cookieAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user;

      // brandId null guard: non-ADMIN users without a brandId cannot access
      if (user.role !== "ADMIN" && !user.brandId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "User must belong to a brand",
          },
        });
      }

      // Brand scoping: ADMIN sees all, others see only their brand
      const brandFilter: Record<string, unknown> =
        user.role === "ADMIN" ? {} : { brandId: user.brandId as string };

      // Run all queries in parallel for performance
      const [
        statusCounts,
        verificationCount,
        recentEvents,
      ] = await Promise.all([
        // Product counts by status using groupBy
        fastify.prisma.product.groupBy({
          by: ["status"],
          where: brandFilter,
          _count: { status: true },
        }),

        // Total verification events
        fastify.prisma.productEvent.count({
          where: {
            type: EventType.VERIFIED,
            product: brandFilter,
          },
        }),

        // Recent 10 events for activity feed
        fastify.prisma.productEvent.findMany({
          where: {
            product: brandFilter,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            product: {
              select: { name: true, gtin: true },
            },
          },
        }),
      ]);

      // Transform groupBy result into a flat object
      const byStatus: Record<string, number> = {};
      for (const row of statusCounts) {
        byStatus[row.status] = row._count.status;
      }

      return reply.status(200).send({
        success: true,
        data: {
          byStatus,
          verificationCount,
          recentEvents,
        },
      });
    },
  );
}
```

**Step 2: Register in `apps/api/src/routes/products/index.ts`**

Add import and register alongside existing routes:

```typescript
import statsProductRoute from "./stats.js";
// ... inside productRoutes():
await fastify.register(statsProductRoute);
```

**Step 3: Add tests in `apps/api/test/products.test.ts`**

Add a new describe block within the existing file:

```
~8 tests:
- GET /products/stats returns 200 with byStatus, verificationCount, recentEvents
- byStatus counts match actual product statuses (create 2 DRAFT, mint 1 -> 1 ACTIVE + 1 DRAFT)
- verificationCount reflects VERIFIED events (verify a product, count increments)
- recentEvents returns up to 10 events ordered by createdAt desc
- recentEvents includes product name and gtin
- Brand-scoped: BRAND_ADMIN only sees own brand's stats
- Non-ADMIN without brandId gets 403
- Unauthenticated request gets 401
```

Use `buildApp()` + `cleanDb()` + re-seed pattern (R03, R16). For mint tests, the product must be DRAFT first, then minted via the API endpoint (not direct DB manipulation) to generate the MINTED event.

**Patterns to follow**:
- Brand scoping: ADMIN sees all, others see own brand (R31)
- brandId null guard (same as list.ts, get.ts)
- No body/response JSON schema (R01)
- Parallel queries with `Promise.all` (R33)
- Route as default export async function (standard route pattern)
- Enums from @galileo/shared (R09)
- CSRF: stats route is registered under products/ group which has CSRF hook, but GET requests are exempt from CSRF check by the middleware

**Edge cases**:
- No products: byStatus is `{}`, verificationCount is 0, recentEvents is `[]`
- Missing statuses: only statuses with products appear in byStatus (frontend must default missing keys to 0)
- Brand with no events: recentEvents is empty array
- MINTING status: transient state, may appear in byStatus during concurrent mint operations
- Verification by anonymous user: event exists with `performedBy: null`, still counted

**Verify**: Create products with different statuses. GET /products/stats returns correct byStatus counts. Verify a product -- verificationCount increments. Recent events list shows the latest 10 events with product name and gtin.

---

### Brief #2: Dashboard Home -- Live Stats + Recent Activity

**Type**: UI
**Priority**: P2
**Epic**: EPIC-002-product-lifecycle

**Files to modify**:
- `apps/dashboard/src/app/dashboard/page.tsx` -- replace hardcoded stats with API data, add activity feed

**Approach**:

Replace the hardcoded `stats` array (all zeros) with a `useEffect` fetch to `GET /products/stats`. Map the API response to the 4 stat cards. Populate the activity feed with `recentEvents` from the same endpoint. The page already has the correct UI structure -- we just need to wire it to real data.

**Step 1: Update `apps/dashboard/src/app/dashboard/page.tsx`**

Remove the static `stats` array. Add state and fetch logic:

```typescript
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Shield,
  ArrowRightLeft,
  CheckCircle,
  Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsResponse {
  success: true;
  data: {
    byStatus: Record<string, number>;
    verificationCount: number;
    recentEvents: Array<{
      id: string;
      type: string;
      createdAt: string;
      product: {
        name: string;
        gtin: string;
      };
    }>;
  };
}

const EVENT_LABELS: Record<string, string> = {
  CREATED: "Product created",
  UPDATED: "Product updated",
  MINTED: "Passport minted",
  TRANSFERRED: "Product transferred",
  VERIFIED: "Product verified",
  RECALLED: "Product recalled",
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [byStatus, setByStatus] = useState<Record<string, number>>({});
  const [verificationCount, setVerificationCount] = useState(0);
  const [recentEvents, setRecentEvents] = useState<
    StatsResponse["data"]["recentEvents"]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<StatsResponse>("/products/stats");
      setByStatus(res.data.byStatus);
      setVerificationCount(res.data.verificationCount);
      setRecentEvents(res.data.recentEvents);
    } catch (err) {
      // Silently fail -- show zeros if stats unavailable
      if (!(err instanceof ApiError)) {
        console.error("Failed to load stats", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const displayName = user?.email ?? "there";

  const totalProducts =
    (byStatus.DRAFT ?? 0) +
    (byStatus.ACTIVE ?? 0) +
    (byStatus.TRANSFERRED ?? 0) +
    (byStatus.RECALLED ?? 0) +
    (byStatus.MINTING ?? 0);

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package },
    { label: "Active Passports", value: byStatus.ACTIVE ?? 0, icon: Shield },
    {
      label: "Transferred",
      value: byStatus.TRANSFERRED ?? 0,
      icon: ArrowRightLeft,
    },
    { label: "Verifications", value: verificationCount, icon: CheckCircle },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome message */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s an overview of your Galileo Protocol activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? "—" : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : recentEvents.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {EVENT_LABELS[event.type] ?? event.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.product.name} ({event.product.gtin})
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(event.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard/products">
            {totalProducts > 0 ? "View products" : "Create your first product"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
```

Key changes:
- Import `api` and `ApiError` from `@/lib/api`
- Add `StatsResponse` interface matching the API response
- Fetch stats on mount with `useEffect` + `useCallback`
- Compute `totalProducts` from byStatus values (default missing keys to 0)
- Show loading skeleton ("--") while fetching
- Map `recentEvents` to activity feed list items with relative timestamps
- Show "No recent activity" only when events array is empty after loading
- CTA text changes based on whether products exist

**Patterns to follow**:
- Dashboard data fetching: `api<T>(path)` wrapper (same as products page)
- State management: useState + useEffect + useCallback (same as products page)
- Error handling: silent fail for stats (show zeros), unlike product list which shows error
- Loading state: inline spinner for activity feed, "em dash" for stat values
- No external state library (no TanStack Query yet -- keep consistent with existing pages)

**Edge cases**:
- API returns empty byStatus: all stat values default to 0
- API unreachable: stats show 0, activity feed shows "No recent activity" (graceful degradation)
- Events with unknown type: fallback to raw event.type string
- Long product name in activity feed: CSS will handle truncation naturally
- User without brand: API returns 403, stats show 0 (same behavior as product list)

**E2E validation (R36)**: The Tester MUST validate this task in a real browser:
1. Start dev server (`pnpm dev`)
2. Log in as a brand user who has products
3. Navigate to `/dashboard` -- verify stat cards show real numbers (not all zeros)
4. Verify activity feed shows recent events with product name, GTIN, and relative time
5. Resize to mobile viewport (375px) -- verify stat cards stack vertically, activity feed is readable
6. Log in as a user with no products -- verify stats show 0 and activity says "No recent activity"
7. Take screenshots as evidence

**Verify**: Dashboard home shows real stats from API. Stat cards display Total Products, Active Passports, Transferred, and Verifications with correct counts. Activity feed shows up to 10 recent events with timestamps. Loading state shows dashes and spinner. Empty state shows zeros and "No recent activity".

---

### Brief #3: Dashboard Product List -- Filter UI (Status + Category Dropdowns)

**Type**: UI
**Priority**: P2
**Epic**: EPIC-002-product-lifecycle

**Files to modify**:
- `apps/dashboard/src/app/dashboard/products/page.tsx` -- add filter dropdowns above the table

**Approach**:

Add two Select dropdowns (shadcn `Select` component, already installed) between the page header and the product table. When the user selects a status or category, append `?status=X` and/or `?category=Y` to the API call. A "Clear" button resets both filters. The existing `fetchProducts` function just needs the filter values added to its query string.

**Step 1: Update `apps/dashboard/src/app/dashboard/products/page.tsx`**

Add imports for Select components and filter state:

```typescript
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { type ProductStatus } from "@galileo/shared";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ... existing interfaces (Product, Pagination, ProductsResponse) stay the same ...

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "TRANSFERRED", label: "Transferred" },
  { value: "RECALLED", label: "Recalled" },
];

const CATEGORY_OPTIONS = [
  { value: "Leather Goods", label: "Leather Goods" },
  { value: "Jewelry", label: "Jewelry" },
  { value: "Watches", label: "Watches" },
  { value: "Fashion", label: "Fashion" },
  { value: "Accessories", label: "Accessories" },
  { value: "Fragrances", label: "Fragrances" },
  { value: "Eyewear", label: "Eyewear" },
  { value: "Other", label: "Other" },
];

// ... existing STATUS_STYLES, StatusBadge, formatDate stay the same ...

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();

  const fetchProducts = useCallback(
    async (currentPage: number, status?: string, category?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(PAGE_SIZE),
        });
        if (status) params.set("status", status);
        if (category) params.set("category", category);

        const res = await api<ProductsResponse>(
          `/products?${params.toString()}`,
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
    },
    [],
  );

  useEffect(() => {
    fetchProducts(page, statusFilter, categoryFilter);
  }, [page, statusFilter, categoryFilter, fetchProducts]);

  // Reset to page 1 when filters change
  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategoryFilter(value);
    setPage(1);
  }

  function clearFilters() {
    setStatusFilter(undefined);
    setCategoryFilter(undefined);
    setPage(1);
  }

  const hasActiveFilters = statusFilter || categoryFilter;

  // ... rest of the component (loading, error states) stays the same ...
  // Insert the filter bar between the page header and the product table/empty state
```

Insert the filter bar JSX between the page header `<div>` and the `{hasProducts ? (` conditional:

```tsx
{/* Filters */}
<div className="flex flex-wrap items-center gap-3">
  <Select
    value={statusFilter ?? ""}
    onValueChange={handleStatusChange}
  >
    <SelectTrigger className="w-[160px]">
      <SelectValue placeholder="All statuses" />
    </SelectTrigger>
    <SelectContent>
      {STATUS_OPTIONS.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  <Select
    value={categoryFilter ?? ""}
    onValueChange={handleCategoryChange}
  >
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="All categories" />
    </SelectTrigger>
    <SelectContent>
      {CATEGORY_OPTIONS.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {hasActiveFilters && (
    <Button
      variant="ghost"
      size="sm"
      onClick={clearFilters}
      className="text-muted-foreground"
    >
      <X className="mr-1 size-3" />
      Clear filters
    </Button>
  )}
</div>
```

Important implementation notes:
- The `Select` component from shadcn uses Radix UI which requires `value` to be a string (not undefined for "no selection"). Pass empty string `""` when no filter is active, and use `placeholder` prop on `SelectValue` for the default display text.
- Reset `page` to 1 whenever a filter changes to avoid requesting a page beyond the filtered result set.
- `clearFilters` sets both to `undefined` and resets page.
- The `X` icon import is added at the top (`lucide-react`).
- The `fetchProducts` callback now accepts status and category params, building a URLSearchParams object.

**Patterns to follow**:
- shadcn Select component already installed at `apps/dashboard/src/components/ui/select.tsx`
- Categories from `@galileo/shared` constants (CATEGORIES array, Title Case)
- Status values match ProductStatus enum from `@galileo/shared`
- URLSearchParams for clean query string construction
- Reset page to 1 on filter change (standard UX pattern)
- No body/response JSON schema (R01) -- API already supports these query params from Sprint #4

**Edge cases**:
- Radix Select `value=""` vs `undefined`: Radix requires a controlled value string. Use `""` for "no filter selected" and the `placeholder` prop to show "All statuses"/"All categories". When `onValueChange` fires, the new value is always a non-empty string (one of the options).
- Clearing a single filter: the Radix Select component does not support "deselect" natively. The "Clear filters" button resets both. This is a known UX compromise. A future improvement could add an "All" option to each dropdown.
- MINTING status not shown in filter: MINTING is a transient state (seconds) and not useful for filtering. Excluded from STATUS_OPTIONS intentionally.
- Category values are Title Case strings (e.g. "Leather Goods") matching the API exactly.
- Empty filtered result: shows existing empty state ("No products yet") which is correct.

**E2E validation (R36)**: The Tester MUST validate this task in a real browser:
1. Start dev server (`pnpm dev`)
2. Log in as a brand user with multiple products (different statuses and categories)
3. Navigate to `/dashboard/products`
4. Open the Status dropdown -- verify all options (Draft, Active, Transferred, Recalled) are listed
5. Select "Active" -- verify only active products appear, pagination updates
6. Open the Category dropdown -- verify all 8 categories listed
7. Select a category -- verify products filter correctly (combined status + category)
8. Click "Clear filters" -- verify all products appear again
9. Resize to mobile (375px) -- verify dropdowns wrap to next line, are still usable
10. Test with empty result: select a status/category combo that has no products -- verify empty state shows
11. Take screenshots as evidence

**Verify**: Filter dropdowns appear above the product table. Selecting a status filters the list. Selecting a category filters the list. Both filters can be combined. "Clear filters" button appears when filters are active and resets both. Pagination resets to page 1 on filter change.

---

### Brief #4: Dashboard Product Image Upload UI

**Type**: UI
**Priority**: P2
**Epic**: EPIC-006-data-compliance

**Files to modify**:
- `apps/dashboard/src/app/dashboard/products/new/page.tsx` -- add image upload field to create form
- `apps/dashboard/src/app/dashboard/products/[id]/page.tsx` -- add image upload to edit form + display existing image

**Approach**:

The API endpoint `POST /products/:id/upload` already exists (Sprint #1, multipart form data). The dashboard needs a file input that:
1. Shows a preview of the selected image before upload
2. Uploads the file after product creation (create form) or on demand (edit form)
3. Displays the current product image on the detail page (from `imageUrl`)

**Important**: The `Product` interface in `[id]/page.tsx` (line ~72-86) does NOT include `imageUrl`. The API returns it (from Prisma), but the frontend TypeScript type omits it. The Developer must add `imageUrl: string | null;` to the interface.

**Step 1: Create a reusable ImageUpload component**

Create `apps/dashboard/src/components/image-upload.tsx`:

```typescript
"use client";

import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface ImageUploadProps {
  productId: string;
  currentImageUrl?: string | null;
  onUploadComplete?: (imageUrl: string) => void;
}

export function ImageUpload({
  productId,
  currentImageUrl,
  onUploadComplete,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Upload
      setIsUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/upload`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
            headers: {
              "X-Galileo-Client": "dashboard",
            },
          },
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error?.message ?? "Upload failed");
        }

        const data = await res.json();
        onUploadComplete?.(data.data.imageUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    },
    [productId, onUploadComplete],
  );

  const displayUrl = preview ?? currentImageUrl;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Product Image
      </label>
      {displayUrl ? (
        <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border">
          <img
            src={displayUrl}
            alt="Product"
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-square w-full max-w-[200px] items-center justify-center rounded-lg border border-dashed">
          <ImageIcon className="size-8 text-muted-foreground" />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          asChild
        >
          <label className="cursor-pointer">
            <Upload className="mr-1 size-3" />
            {isUploading ? "Uploading..." : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
```

**Step 2: Add ImageUpload to product detail/edit page**

In `[id]/page.tsx`, import and render `<ImageUpload>` when viewing or editing a product:
- Show current image (from `product.imageUrl`)
- Allow upload (calls POST /products/:id/upload with CSRF header)
- On success, refresh product data to show new image

**Step 3: Add ImageUpload to create form**

In `new/page.tsx`, show the ImageUpload component AFTER product creation:
- Product must exist before upload (API requires product ID)
- After successful POST /products, redirect to detail page where user can upload
- OR: show a two-step flow (create → upload on same page)
- Recommended: redirect to detail page after create, user uploads there

**Patterns to follow**:
- CSRF header `X-Galileo-Client: dashboard` on all mutation requests
- `credentials: "include"` for cookie auth
- Use native `fetch` for multipart (not the `api()` wrapper which sets JSON content-type)
- Image preview via FileReader (no external library)
- Max file size validation client-side (match API limit)

**Edge cases**:
- No product ID yet (create form): disable upload, show after product exists
- Large file: API has size limit -- show error from API response
- Invalid file type: `accept="image/*"` on input + API validates server-side
- Upload fails: show error, keep previous image
- No image: show placeholder icon

**E2E validation (R36)**: The Tester MUST validate this task in a real browser:
1. Start dev server (`pnpm dev`)
2. Create a new product → verify redirect to detail page
3. On detail page, click "Upload image" → select an image file
4. Verify preview appears immediately
5. Verify image persists after page reload (stored via API)
6. Edit an existing product → verify current image is displayed
7. Upload a new image on existing product → verify image updates
8. Test with invalid file (e.g. .txt) → verify rejection
9. Resize to mobile (375px) → verify image and upload button render correctly
10. Take screenshots as evidence

**Verify**: Product create/edit forms show an image upload area. Selecting a file shows preview and uploads to API. Uploaded image visible on product detail page. Error handling for invalid/large files.

---

### Brief #5: E2E Playwright — Dashboard Stats, Filters, Upload

**Type**: testing
**Priority**: P2
**Epic**: EPIC-007-observability-quality

**Files to modify**:
- `apps/dashboard/e2e/dashboard-home.spec.ts` -- NEW: E2E tests for dashboard home (stats + activity)
- `apps/dashboard/e2e/product-filters.spec.ts` -- NEW: E2E tests for product list filters
- `apps/dashboard/e2e/product-upload.spec.ts` -- NEW: E2E tests for image upload
- `apps/dashboard/e2e/product-lifecycle.spec.ts` -- extend existing spec if needed

**Approach**:

Existing E2E infrastructure: `auth.setup.ts` registers a user + saves auth state, `playwright.config.ts` starts API + dashboard servers. Tests run against `http://localhost:3000` with auth cookies.

Write 3 new Playwright spec files that cover all Sprint #5 features. These tests persist and run in every future cycle, protecting the critical dashboard paths.

**Spec 1: `dashboard-home.spec.ts`**

```
describe("Dashboard Home")
  - navigates to /dashboard and sees stat cards (Total Products, Active Passports, Transferred, Verifications)
  - stat cards show real numbers (not zeros) after product lifecycle setup
  - activity feed shows recent events with product name and relative timestamps
  - activity feed shows "No recent activity" for brand with no events
  - stat cards are responsive on mobile viewport (375px)
```

Setup: reuse auth state from `auth.setup.ts`. The product-lifecycle spec already creates + mints a product, so run dashboard-home after to verify stats reflect that data.

**Spec 2: `product-filters.spec.ts`**

```
describe("Product List Filters")
  - filter by status: select "Active" → only active products shown
  - filter by category: select "Leather Goods" → only matching products shown
  - combined filters: status + category → intersection shown
  - clear filters: click "Clear filters" → all products shown again
  - empty result: filter combo with no matches → shows empty state
  - pagination resets to page 1 when filter changes
  - dropdowns are usable on mobile viewport (375px)
```

Setup: create 3+ products with different statuses and categories during test setup.

**Spec 3: `product-upload.spec.ts`**

```
describe("Product Image Upload")
  - create product → navigate to detail → upload image → preview shown
  - uploaded image persists after page reload
  - upload on existing product replaces previous image
  - upload button disabled during upload (loading state)
  - image visible on mobile viewport (375px)
```

Setup: create a product first, then test upload flow. Use a small test image file (create a 1x1 PNG fixture or use `page.setInputFiles()`).

**Patterns to follow**:
- Auth: all specs use `storageState: "playwright/.auth/user.json"` (configured in playwright.config.ts)
- Selectors: prefer `getByRole`, `getByText`, `getByLabel` (accessible selectors)
- Waits: use `expect(locator).toBeVisible({ timeout })` instead of arbitrary waits
- Viewport: test mobile with `page.setViewportSize({ width: 375, height: 812 })`
- Fixtures: create test products via UI (not direct API) to test the full flow
- Isolation: each spec file is independent — creates its own test data

**Edge cases**:
- Race condition: stats endpoint may return before product events are committed — use `expect.poll()` or retry
- File upload: use Playwright's `page.setInputFiles()` to programmatically set the file input
- Flaky selectors: avoid CSS class selectors, use role-based or text-based locators
- Server startup: playwright.config.ts already handles API + dashboard startup with health check

**Verify**: `pnpm --filter dashboard exec playwright test` runs all E2E specs (auth setup + product lifecycle + 3 new specs). All pass. New specs cover dashboard home stats, product filters, and image upload.

## Notes

<!-- Developer and Tester add notes here during the sprint -->
