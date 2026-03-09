"use client";

import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";

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

        const res = await fetch(`${API_URL}/products/${productId}/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            "X-Galileo-Client": "dashboard",
          },
        });

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
