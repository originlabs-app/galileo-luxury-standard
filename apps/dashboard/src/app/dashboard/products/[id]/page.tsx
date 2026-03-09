"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Loader2, Save, X } from "lucide-react";
import { type ProductStatus } from "@galileo/shared";
import { api, ApiError } from "@/lib/api";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProductPassport {
  id: string;
  digitalLink: string;
}

interface ProductEvent {
  id: string;
  type: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  gtin: string;
  serialNumber: string;
  did: string;
  description: string | null;
  category: string;
  status: ProductStatus;
  imageUrl: string | null;
  passport: ProductPassport | null;
  events: ProductEvent[];
  createdAt: string;
  updatedAt: string;
}

interface ProductResponse {
  success: true;
  data: {
    product: Product;
  };
}

const CATEGORY_OPTIONS = [
  { value: "Leather Goods", label: "Leather Goods" },
  { value: "Jewelry", label: "Jewelry" },
  { value: "Watches", label: "Watches" },
  { value: "Fashion", label: "Fashion" },
  { value: "Accessories", label: "Accessories" },
  { value: "Fragrances", label: "Fragrances" },
  { value: "Eyewear", label: "Eyewear" },
  { value: "Other", label: "Other" },
] as const;

const EVENT_LABEL: Record<string, string> = {
  CREATED: "Identity established",
  UPDATED: "Record details updated",
  MINTED: "Lifecycle mint recorded",
  TRANSFERRED: "Ownership transfer recorded",
  VERIFIED: "Verification recorded",
  RECALLED: "Recall recorded",
};

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function IdentityField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all font-mono text-sm text-foreground">{value}</dd>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api<ProductResponse>(`/products/${productId}`);
      setProduct(res.data.product);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load product");
      }
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  function startEditing() {
    if (!product) {
      return;
    }

    setEditName(product.name);
    setEditDescription(product.description ?? "");
    setEditCategory(product.category);
    setEditError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditError(null);
  }

  async function handleSaveEdit(event: FormEvent) {
    event.preventDefault();
    if (!product) {
      return;
    }

    setIsSaving(true);
    setEditError(null);

    try {
      const body: Record<string, string> = {};
      if (editName.trim() !== product.name) {
        body.name = editName.trim();
      }
      if ((editDescription.trim() || "") !== (product.description ?? "")) {
        body.description = editDescription.trim();
      }
      if (editCategory !== product.category) {
        body.category = editCategory;
      }

      if (Object.keys(body).length === 0) {
        setIsEditing(false);
        return;
      }

      const res = await api<ProductResponse>(`/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      setProduct(res.data.product);
      setIsEditing(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setEditError(err.message);
      } else {
        setEditError("Failed to update product");
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-destructive">
          {error ?? "Product not found"}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.push("/dashboard/products")}
        >
          Back to Products
        </Button>
      </div>
    );
  }

  const sortedEvents = [...product.events].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1 space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Product record
          </p>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            {product.name}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Identity is locked. Use this view to refine descriptive metadata and
            assets without changing the permanent GTIN plus serial baseline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/products/${product.id}/identity`}>
              View identity checkpoint
            </Link>
          </Button>
          {!isEditing && (
            <Button size="sm" onClick={startEditing}>
              <Edit3 className="size-4" />
              Edit details
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              Identity baseline
            </CardTitle>
            <CardDescription>
              These identifiers are permanent for this item in Phase 1.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm">
              <IdentityField label="GTIN" value={product.gtin} />
              <IdentityField label="Serial number" value={product.serialNumber} />
              <IdentityField label="Galileo DID" value={product.did} />
              {product.passport?.digitalLink && (
                <IdentityField
                  label="GS1 Digital Link"
                  value={product.passport.digitalLink}
                />
              )}
            </dl>
          </CardContent>
        </Card>

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">
                Edit descriptive metadata
              </CardTitle>
              <CardDescription>
                Name, category, and description can evolve after identity is
                established.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveEdit}>
              <CardContent className="flex flex-col gap-4">
                {editError && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {editError}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger id="edit-category" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(event) =>
                      setEditDescription(event.target.value)
                    }
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" size="sm" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {isSaving ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEditing}
                  >
                    <X className="size-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">
                Descriptive metadata
              </CardTitle>
              <CardDescription>
                Editable context that supports the product record without
                changing identity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="text-foreground">{product.name}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="text-foreground">{product.category}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Description</dt>
                  <dd className="text-foreground">
                    {product.description || "No description added yet."}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Record status</dt>
                  <dd className="text-foreground">{product.status}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd className="text-foreground">
                    {formatDateTime(product.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Product imagery</CardTitle>
          <CardDescription>
            Upload or replace supporting visuals for the record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            productId={productId}
            currentImageUrl={product.imageUrl}
            onUploadComplete={() => fetchProduct()}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Record history</CardTitle>
          <CardDescription>
            Lifecycle events can appear here later, but Phase 1 keeps the
            interface centered on identity and metadata readiness.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {EVENT_LABEL[event.type] ?? event.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.type}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(event.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
