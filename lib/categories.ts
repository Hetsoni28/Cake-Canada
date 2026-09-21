import { createClient } from "./supabase/server";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url, display_order')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return (data || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    image_url: cat.image_url || '',
    sort_order: cat.display_order
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url, display_order')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || '',
    image_url: data.image_url || '',
    sort_order: data.display_order
  };
}
