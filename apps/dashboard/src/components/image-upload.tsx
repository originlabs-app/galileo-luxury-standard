"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type ProductMediaDescriptor } from "@galileo/shared";
import { Image as ImageIcon, Upload } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UploadResponse {
  success: true;
  data: {
    upload: {
      imageCid: string;
      imageUrl: string;
    };
  };
}

interface ImageUploadProps {
  productId: string;
  currentImageUrl?: string | null;
  currentMedia?: ProductMediaDescriptor[];
  onUploadComplete?: () => void;
}

export function ImageUpload({
  productId,
  currentImageUrl,
  currentMedia = [],
  onUploadComplete,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [altText, setAltText] = useState("");

  const primaryImage = useMemo(
    () =>
      currentMedia.find((media) => media.kind === "image" && media.position === 0) ??
      currentMedia.find((media) => media.kind === "image"),
    [currentMedia],
  );

  useEffect(() => {
    setAltText(primaryImage?.alt ?? "");
  }, [primaryImage]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const trimmedAltText = altText.trim();

      if (!trimmedAltText) {
        setError("Add alt text before uploading linked media.");
        e.target.value = "";
        return;
      }

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

        const data = (await res.json()) as UploadResponse;
        const mediaWithoutPrimaryImage = currentMedia.filter(
          (media) => !(media.kind === "image" && media.position === 0),
        );

        await api(`/products/${productId}`, {
          method: "PATCH",
          body: JSON.stringify({
            media: [
              {
                kind: "image",
                url: data.data.upload.imageUrl,
                cid: data.data.upload.imageCid,
                alt: trimmedAltText,
                position: 0,
              },
              ...mediaWithoutPrimaryImage,
            ],
          }),
        });

        onUploadComplete?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    },
    [altText, currentMedia, productId, onUploadComplete],
  );

  const displayUrl = preview ?? currentImageUrl;

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <Label>Linked media draft</Label>
        <p className="text-sm text-muted-foreground">
          Upload the primary product image and store the shared passport media
          descriptor while the record stays in DRAFT.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`media-alt-${productId}`}>Media alt text</Label>
        <Input
          id={`media-alt-${productId}`}
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          placeholder="Front-facing product image"
        />
      </div>

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
            {isUploading ? "Uploading..." : "Upload linked image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </Button>
      </div>
      {primaryImage?.cid ? (
        <p className="text-xs text-muted-foreground">
          Current linked CID: {primaryImage.cid}
        </p>
      ) : null}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
