/**
 * Luxury product category constants.
 *
 * Values use Title Case to match the API enum exactly.
 *
 * @module constants/categories
 */

export const CATEGORIES = [
  "Leather Goods",
  "Jewelry",
  "Watches",
  "Fashion",
  "Accessories",
  "Fragrances",
  "Eyewear",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
