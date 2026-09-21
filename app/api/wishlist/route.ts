import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET — fetch wishlist for authenticated user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      id, created_at,
      products (
        id, name, slug, base_price,
        product_images ( image_url, is_primary, display_order ),
        product_variants ( price, weight_kg )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — add product to wishlist
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { product_id }: { product_id: string } = await req.json();
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 });

  const { data, error } = await supabase
    .from('wishlists')
    .insert({ user_id: user.id, product_id })
    .select('id')
    .single();

  if (error?.code === '23505') {
    // Already wishlisted — idempotent
    return NextResponse.json({ already_exists: true });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}

// DELETE — remove from wishlist
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { product_id }: { product_id: string } = await req.json();
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', product_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ removed: true });
}
