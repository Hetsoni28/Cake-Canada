import {
  STATIC_PRODUCTS,
  STATIC_CATEGORIES,
  type Product,
  type Category,
} from "./data";

// ─── Products ───────────────────────────────────────────────────────────────
// These functions use static data now. Once NEXT_PUBLIC_SUPABASE_URL is set
// they can be swapped to use the Supabase client from lib/supabase/server.ts

export async function getProducts(): Promise<Product[]> {
  return STATIC_PRODUCTS;
}

export async function getBestSellers(): Promise<Product[]> {
  return STATIC_PRODUCTS.filter((p) => p.is_best_seller);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return STATIC_PRODUCTS.filter((p) => p.is_featured);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return STATIC_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByCategory(
  categorySlug: string,
): Promise<Product[]> {
  return STATIC_PRODUCTS.filter((p) => p.category_slug === categorySlug);
}

export type { Product };
