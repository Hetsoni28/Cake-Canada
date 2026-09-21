import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { variant_id, eggless, frosting_id, design_id, addon_ids, quantity = 1 } = body;

    if (!variant_id) {
      return NextResponse.json({ error: 'variant_id required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Get Variant Base Price
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('price')
      .eq('id', variant_id)
      .single();

    if (variantError || !variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const base_price = Number(variant.price);
    let surcharges = 0;
    let addons_price = 0;
    const breakdown: { name: string; amount: number }[] = [];

    breakdown.push({ name: 'Base Price', amount: base_price });

    // 2. Get Option Prices (Eggless, Frosting, Design)
    if (eggless || frosting_id || design_id) {
      // Handle eggless separately by type if true
      if (eggless) {
        const { data: egglessOpt } = await supabase
          .from('product_option_prices')
          .select('name, surcharge')
          .eq('option_type', 'eggless')
          .single();
          
        if (egglessOpt && Number(egglessOpt.surcharge) > 0) {
          surcharges += Number(egglessOpt.surcharge);
          breakdown.push({ name: egglessOpt.name, amount: Number(egglessOpt.surcharge) });
        }
      }

      // Handle frosting and design by ID
      const optionIds = [frosting_id, design_id].filter(Boolean);
      if (optionIds.length > 0) {
        const { data: options } = await supabase
          .from('product_option_prices')
          .select('id, name, surcharge')
          .in('id', optionIds);
          
        if (options) {
          for (const opt of options) {
            if (Number(opt.surcharge) > 0) {
              surcharges += Number(opt.surcharge);
              breakdown.push({ name: opt.name, amount: Number(opt.surcharge) });
            }
          }
        }
      }
    }

    // 3. Get Addons
    const verifiedAddons = [];
    if (Array.isArray(addon_ids) && addon_ids.length > 0) {
      const { data: addons } = await supabase
        .from('product_addons')
        .select('id, name, price')
        .in('id', addon_ids);
        
      if (addons) {
        // preserve the order of passed addon_ids, or just use DB return order
        for (const addon of addons) {
          const p = Number(addon.price);
          addons_price += p;
          breakdown.push({ name: addon.name, amount: p });
          verifiedAddons.push({ id: addon.id, name: addon.name, price: p });
        }
      }
    }

    const per_item_price = base_price + surcharges + addons_price;
    const total = per_item_price * quantity;

    return NextResponse.json({
      base_price,
      surcharges,
      addons_price,
      per_item_price,
      total,
      breakdown,
      verifiedAddons
    });
    
  } catch (e) {
    console.error('Price check error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
