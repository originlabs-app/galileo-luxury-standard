/** RBAC roles matching the Prisma schema Role enum */
export enum Role {
  ADMIN = "ADMIN",
  BRAND_ADMIN = "BRAND_ADMIN",
  OPERATOR = "OPERATOR",
  VIEWER = "VIEWER",
}

/** User entity matching the Prisma User model */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  brandId: string | null;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Safe user representation without sensitive fields */
export interface UserPublic {
  id: string;
  email: string;
  role: Role;
  brandId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
