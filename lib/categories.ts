import { STATIC_CATEGORIES, type Category } from "./data";

export async function getCategories(): Promise<Category[]> {
  return STATIC_CATEGORIES;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  return STATIC_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export type { Category };
