/**
 * Luxury product category constants.
 *
 * @module constants/categories
 */

export const CATEGORIES = [
  "watches",
  "jewelry",
  "leather-goods",
  "fashion",
  "accessories",
  "fragrances",
  "cosmetics",
  "silk-goods",
  "ready-to-wear",
  "eyewear",
  "shoes",
  "fine-art",
  "wine-spirits",
  "collectibles",
] as const;

export type Category = (typeof CATEGORIES)[number];
