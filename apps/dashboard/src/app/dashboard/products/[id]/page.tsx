"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  Ban,
  Download,
  Edit3,
  Loader2,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  FileEdit,
  Coins,
  X,
  Save,
} from "lucide-react";
import { type ProductStatus } from "@galileo/shared";
import { api, ApiError } from "@/lib/api";
import { API_URL } from "@/lib/constants";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProductPassport {
  id: string;
  productId: string;
  digitalLink: string;
  metadata: Record<string, unknown>;
  txHash: string | null;
  tokenAddress: string | null;
  chainId: number | null;
  mintedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductEvent {
  id: string;
  productId: string;
  type: string;
  data: Record<string, unknown>;
  performedBy: string;
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
  brandId: string;
  walletAddress: string | null;
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

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-[#00FF88]/20 text-[#00FF88] border-[#00FF88]/30",
  TRANSFERRED: "bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/30",
  RECALLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const EVENT_ICON: Record<string, typeof Clock> = {
  CREATED: CheckCircle2,
  UPDATED: FileEdit,
  MINTED: Coins,
  RECALLED: Ban,
  TRANSFERRED: ArrowRightLeft,
  VERIFIED: ShieldCheck,
};

const EVENT_ICON_COLOR: Record<string, string> = {
  CREATED: "text-[#00FF88]",
  UPDATED: "text-blue-400",
  MINTED: "text-yellow-400",
  RECALLED: "text-red-400",
  TRANSFERRED: "text-[#00FFFF]",
  VERIFIED: "text-[#00FF88]",
};

const EVENT_LABEL: Record<string, string> = {
  CREATED: "Product Created",
  UPDATED: "Product Updated",
  MINTED: "Product Minted",
  TRANSFERRED: "Ownership Transferred",
  VERIFIED: "Product Verified",
  RECALLED: "Product Recalled",
};

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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "…";
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);

  // Recall states
  const [isRecalling, setIsRecalling] = useState(false);
  const [recallError, setRecallError] = useState<string | null>(null);

  // Transfer states
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  /* ---------- Data fetching ---------- */

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

  /* ---------- Mint action ---------- */

  async function handleMint() {
    setIsMinting(true);
    setMintError(null);
    try {
      const res = await api<ProductResponse>(`/products/${productId}/mint`, {
        method: "POST",
      });
      setProduct(res.data.product);
    } catch (err) {
      if (err instanceof ApiError) {
        setMintError(err.message);
      } else {
        setMintError("Failed to mint product");
      }
    } finally {
      setIsMinting(false);
    }
  }

  /* ---------- Recall action ---------- */

  async function handleRecall() {
    const reason = window.prompt(
      "Are you sure you want to recall this product?\n\nOptionally enter a reason:",
    );

    // prompt returns null when user clicks Cancel
    if (reason === null) return;

    setIsRecalling(true);
    setRecallError(null);
    try {
      const res = await api<ProductResponse>(`/products/${productId}/recall`, {
        method: "POST",
        body: JSON.stringify({ reason: reason || undefined }),
      });
      setProduct(res.data.product);
    } catch (err) {
      if (err instanceof ApiError) {
        setRecallError(err.message);
      } else {
        setRecallError("Failed to recall product");
      }
    } finally {
      setIsRecalling(false);
    }
  }

  /* ---------- Transfer action ---------- */

  async function handleTransfer() {
    const toAddress = window.prompt(
      "Enter the recipient wallet address (0x...):",
    );

    if (toAddress === null) return;

    if (!/^0x[0-9a-fA-F]{40}$/.test(toAddress)) {
      setTransferError("Invalid Ethereum address");
      return;
    }

    setIsTransferring(true);
    setTransferError(null);
    try {
      const res = await api<ProductResponse>(
        `/products/${productId}/transfer`,
        {
          method: "POST",
          body: JSON.stringify({ toAddress }),
        },
      );
      setProduct(res.data.product);
    } catch (err) {
      if (err instanceof ApiError) {
        setTransferError(err.message);
      } else {
        setTransferError("Failed to transfer product");
      }
    } finally {
      setIsTransferring(false);
    }
  }

  /* ---------- Download QR ---------- */

  async function handleDownloadQR() {
    try {
      const url = `${API_URL}/products/${productId}/qr`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `qr-${product?.gtin ?? productId}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Silently fail — user can retry
    }
  }

  /* ---------- Edit actions ---------- */

  function startEditing() {
    if (!product) return;
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

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!product) return;

    setIsSaving(true);
    setEditError(null);
    try {
      const body: Record<string, string> = {};
      if (editName.trim() !== product.name) body.name = editName.trim();
      if ((editDescription.trim() || "") !== (product.description ?? ""))
        body.description = editDescription.trim();
      if (editCategory !== product.category) body.category = editCategory;

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

  /* ---------- QR code blob URL ---------- */

  const [qrBlobUrl, setQrBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!product || product.status !== "ACTIVE") return;

    let revoked = false;
    const url = `${API_URL}/products/${productId}/qr`;

    fetch(url, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("QR fetch failed");
        return res.blob();
      })
      .then((blob) => {
        if (!revoked) {
          setQrBlobUrl(URL.createObjectURL(blob));
        }
      })
      .catch(() => {
        // Silently fail
      });

    return () => {
      revoked = true;
      setQrBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [product, productId]);

  /* ---------- Loading / Error states ---------- */

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

  const isDraft = product.status === "DRAFT";
  const isActive = product.status === "ACTIVE";
  const passport = product.passport;

  // Sort events chronologically (oldest first)
  const sortedEvents = [...product.events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Back link + header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            {product.name}
          </h1>
          <StatusBadge status={product.status} />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isDraft && !isEditing && (
            <>
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Edit3 className="size-4" />
                Edit
              </Button>
              <Button size="sm" onClick={handleMint} disabled={isMinting}>
                {isMinting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {isMinting ? "Minting…" : "Mint"}
              </Button>
            </>
          )}
          {isActive && (
            <>
              <Button size="sm" onClick={handleDownloadQR}>
                <Download className="size-4" />
                Download QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTransfer}
                disabled={isTransferring}
              >
                {isTransferring ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRightLeft className="size-4" />
                )}
                {isTransferring ? "Transferring…" : "Transfer"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRecall}
                disabled={isRecalling}
              >
                {isRecalling ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Ban className="size-4" />
                )}
                {isRecalling ? "Recalling…" : "Recall"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mint error banner */}
      {mintError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {mintError}
        </div>
      )}

      {/* Recall error banner */}
      {recallError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {recallError}
        </div>
      )}

      {/* Transfer error banner */}
      {transferError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {transferError}
        </div>
      )}

      {/* Image upload section */}
      <Card>
        <CardContent className="pt-6">
          <ImageUpload
            productId={productId}
            currentImageUrl={product.imageUrl}
            onUploadComplete={() => fetchProduct()}
          />
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---- Product Info Card ---- */}
        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Edit Product</CardTitle>
              <CardDescription>
                Modify name, description, and category.
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
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger id="edit-category" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
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
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" size="sm" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {isSaving ? "Saving…" : "Save Changes"}
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
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="text-foreground">{product.name}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">GTIN</dt>
                  <dd className="font-mono text-foreground">{product.gtin}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Serial Number</dt>
                  <dd className="font-mono text-foreground">
                    {product.serialNumber}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">DID</dt>
                  <dd className="break-all font-mono text-xs text-foreground">
                    {product.did}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="text-foreground">{product.category}</dd>
                </div>
                {product.description && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Description</dt>
                    <dd className="text-foreground">{product.description}</dd>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge status={product.status} />
                  </dd>
                </div>
                {product.walletAddress && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Wallet</dt>
                    <dd className="break-all font-mono text-xs text-foreground">
                      {product.walletAddress}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* ---- Passport Card ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              Digital Passport
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDraft ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="rounded-full bg-yellow-500/10 p-3">
                  <Clock className="size-6 text-yellow-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Passport will be activated after minting
                </p>
              </div>
            ) : (
              <dl className="grid gap-4 text-sm">
                {passport?.digitalLink && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Digital Link</dt>
                    <dd className="break-all font-mono text-xs text-foreground">
                      {passport.digitalLink}
                    </dd>
                  </div>
                )}

                {isActive && qrBlobUrl && (
                  <div className="flex justify-center py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrBlobUrl}
                      alt="Product QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg border border-border"
                    />
                  </div>
                )}

                {passport?.txHash && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Transaction Hash</dt>
                    <dd className="break-all font-mono text-xs text-foreground">
                      {truncate(passport.txHash, 42)}
                    </dd>
                  </div>
                )}

                {passport?.tokenAddress && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Token Address</dt>
                    <dd className="break-all font-mono text-xs text-foreground">
                      {passport.tokenAddress}
                    </dd>
                  </div>
                )}

                {passport?.chainId && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Chain ID</dt>
                    <dd className="font-mono text-foreground">
                      {passport.chainId}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---- Event Timeline ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Event Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <div className="relative pl-6">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-0 h-full w-px bg-border" />

              <div className="flex flex-col gap-6">
                {sortedEvents.map((event) => {
                  const Icon = EVENT_ICON[event.type] ?? Clock;
                  const label = EVENT_LABEL[event.type] ?? event.type;
                  const iconColor =
                    EVENT_ICON_COLOR[event.type] ?? "text-muted-foreground";

                  return (
                    <div key={event.id} className="relative flex gap-4">
                      {/* Dot */}
                      <div className="absolute -left-6 flex size-[22px] items-center justify-center rounded-full border border-border bg-card">
                        <Icon className={`size-3 ${iconColor}`} />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(event.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
