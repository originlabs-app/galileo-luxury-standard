/** Product status matching the Prisma ProductStatus enum */
export enum ProductStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  TRANSFERRED = "TRANSFERRED",
  RECALLED = "RECALLED",
}

/** Product entity matching the Prisma Product model */
export interface Product {
  id: string;
  gtin: string;
  serialNumber: string;
  did: string;
  name: string;
  description: string | null;
  category: string;
  status: ProductStatus;
  brandId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Product Passport entity matching the Prisma ProductPassport model */
export interface ProductPassport {
  id: string;
  productId: string;
  digitalLink: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
