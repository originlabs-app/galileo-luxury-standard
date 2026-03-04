"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateGtin } from "@galileo/shared";
import { api, ApiError } from "@/lib/api";
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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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

interface FormErrors {
  name?: string;
  gtin?: string;
  serialNumber?: string;
  category?: string;
}

interface CreateProductResponse {
  success: true;
  data: {
    product: { id: string };
  };
}

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [gtin, setGtin] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!gtin.trim()) {
      newErrors.gtin = "GTIN is required";
    } else if (!validateGtin(gtin.trim())) {
      newErrors.gtin = "Invalid GTIN: check digit verification failed";
    }

    if (!serialNumber.trim()) {
      newErrors.serialNumber = "Serial number is required";
    }

    if (!category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await api<CreateProductResponse>("/products", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          gtin: gtin.trim(),
          serialNumber: serialNumber.trim(),
          category,
          description: description.trim() || undefined,
        }),
      });

      router.push(`/dashboard/products/${res.data.product.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">
            Create New Product
          </CardTitle>
          <CardDescription>
            Register a new product with its GTIN and serial number to create a
            digital passport.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-6">
            {serverError && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Product name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name)
                    setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            {/* GTIN */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="gtin">GTIN</Label>
              <Input
                id="gtin"
                type="text"
                placeholder="13 or 14 digit GTIN"
                value={gtin}
                onChange={(e) => {
                  setGtin(e.target.value);
                  if (errors.gtin)
                    setErrors((prev) => ({ ...prev, gtin: undefined }));
                }}
                aria-invalid={!!errors.gtin}
                aria-describedby={errors.gtin ? "gtin-error" : undefined}
              />
              {errors.gtin && (
                <p id="gtin-error" className="text-sm text-destructive">
                  {errors.gtin}
                </p>
              )}
            </div>

            {/* Serial Number */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                type="text"
                placeholder="Unique serial number"
                value={serialNumber}
                onChange={(e) => {
                  setSerialNumber(e.target.value);
                  if (errors.serialNumber)
                    setErrors((prev) => ({
                      ...prev,
                      serialNumber: undefined,
                    }));
                }}
                aria-invalid={!!errors.serialNumber}
                aria-describedby={
                  errors.serialNumber ? "serialNumber-error" : undefined
                }
              />
              {errors.serialNumber && (
                <p
                  id="serialNumber-error"
                  className="text-sm text-destructive"
                >
                  {errors.serialNumber}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value);
                  if (errors.category)
                    setErrors((prev) => ({ ...prev, category: undefined }));
                }}
              >
                <SelectTrigger
                  id="category"
                  className="w-full"
                  aria-invalid={!!errors.category}
                  aria-describedby={
                    errors.category ? "category-error" : undefined
                  }
                >
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
              {errors.category && (
                <p id="category-error" className="text-sm text-destructive">
                  {errors.category}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create Product"}
              </Button>
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/products">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
