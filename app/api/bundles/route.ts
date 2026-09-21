import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: bundles, error } = await supabase
      .from('occasion_bundles')
      .select(`
        id, name, description, emoji, discount_pct, display_order,
        bundle_items (
          addon_id,
          product_addons ( id, name, price )
        )
      `)
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;

    // Shape bundles with computed prices
    const shaped = (bundles ?? []).map((b) => {
      const items = (b.bundle_items ?? [])
        .map((bi: any) => bi.product_addons)
        .filter(Boolean);

      const total_original  = items.reduce((s: number, a: any) => s + Number(a.price), 0);
      const total_discounted = parseFloat(
        (total_original * (1 - Number(b.discount_pct) / 100)).toFixed(2)
      );
      const saving = parseFloat((total_original - total_discounted).toFixed(2));

      return {
        id:               b.id,
        name:             b.name,
        description:      b.description,
        emoji:            b.emoji,
        discount_pct:     Number(b.discount_pct),
        items,
        total_original,
        total_discounted,
        saving,
        addon_ids: items.map((a: any) => a.id),
      };
    });

    return NextResponse.json(shaped);
  } catch (e: any) {
    console.error('Bundles error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
