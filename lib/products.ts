import { createClient } from './supabase/server';

export interface ProductVariant {
  id: string;
  weight: string;
  flavor?: string;
  price: number;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  base_price: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_available?: boolean;
  is_customizable?: boolean;
  is_eggless_available?: boolean;
  category_id: string;
  category_slug: string;
  rating: number;
  review_count: number;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface ProductFilters {
  search?: string;
  category?: string; // category slug
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc';
  page?: number;
  limit?: number;
}

export interface ProductsResult {
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
}

// ─── DB column names discovered from live schema ───────────────────────────
// product_images: uses `storage_path` (not image_url), `display_order` (not sort_order)
// product_variants: uses `display_order` (not sort_order)

function mapProduct(row: Record<string, any>): Product {
  const variants: ProductVariant[] = ((row.product_variants ?? []) as Record<string, any>[])
    .filter((v) => v.is_available)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((v) => ({
      id:     v.id,
      weight: v.weight_kg != null ? `${v.weight_kg} kg` : v.name,
      flavor: v.flavor ?? undefined,
      price:  Number(v.price),
    }));

  const images: ProductImage[] = ((row.product_images ?? []) as Record<string, any>[])
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((img) => ({
      id:         img.id,
      image_url:  img.storage_path as string,
      alt_text:   img.alt_text ?? undefined,
      sort_order: img.display_order ?? 0,
    }));

  return {
    id:               row.id,
    name:             row.name,
    slug:             row.slug,
    description:      row.description ?? '',
    short_description:row.short_description ?? '',
    base_price:       Number(row.base_price),
    is_featured:      row.is_featured,
    is_best_seller:   row.is_best_seller,
    is_available:     row.is_available ?? true,
    is_customizable:  row.is_customizable ?? false,
    is_eggless_available: row.is_eggless_available ?? false,
    category_id:      row.category_id ?? '',
    category_slug:    (row.categories as { slug: string } | null)?.slug ?? '',
    rating:           0,
    review_count:     0,
    variants,
    images,
  };
}

// Base select string — used by all queries
function makeSelect(inner = false) {
  const join = inner ? 'categories!inner' : 'categories!category_id';
  return `
    *,
    ${join}(id, name, slug),
    product_variants(id, name, weight_kg, flavor, price, display_order, is_available),
    product_images(id, storage_path, alt_text, is_primary, display_order)
  `;
}

export async function getProducts(filters?: ProductFilters): Promise<ProductsResult> {
  const supabase = await createClient();
  const page    = filters?.page  ?? 1;
  const limit   = filters?.limit ?? 12;
  const offset  = (page - 1) * limit;

  // Use inner join when filtering by category so non-matching rows are excluded
  const hasCategory = Boolean(filters?.category);
  let query = supabase
    .from('products')
    .select(makeSelect(hasCategory), { count: 'exact' })
    .eq('is_available', true);

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (hasCategory) {
    query = query.eq('categories.slug', filters!.category!);
  }

  switch (filters?.sort) {
    case 'price_asc':  query = query.order('base_price', { ascending: true });  break;
    case 'price_desc': query = query.order('base_price', { ascending: false }); break;
    case 'newest':     query = query.order('created_at', { ascending: false }); break;
    case 'name_asc':   query = query.order('name',       { ascending: true });  break;
    default:           query = query.order('is_featured', { ascending: false }); break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error('getProducts error:', error.message);
    return { products: [], total: 0, totalPages: 0, page };
  }

  const total = count ?? 0;
  return {
    products:   (data ?? []).map(mapProduct),
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(makeSelect(false))
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return mapProduct(data);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(makeSelect(false))
    .eq('is_available', true)
    .eq('is_featured', true)
    .limit(8);

  if (error) return [];
  return (data ?? []).map(mapProduct);
}

export async function getBestSellers(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(makeSelect(false))
    .eq('is_available', true)
    .eq('is_best_seller', true)
    .limit(8);

  if (error) return [];
  return (data ?? []).map(mapProduct);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const res = await getProducts({ category: categorySlug, limit: 100 });
  return res.products;
}

export type { Product as default };
