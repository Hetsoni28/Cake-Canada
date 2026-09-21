import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CUSTOM_CAKE_WEIGHTS } from '@/lib/custom-cake';

// GET: return the weight pricing tiers (so client never hardcodes prices)
export async function GET() {
  return NextResponse.json(CUSTOM_CAKE_WEIGHTS);
}

// POST: compute server-verified price for a custom cake
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      weight_label,   // e.g. "1 kg"
      eggless,        // boolean
      frosting_id,    // UUID | ""
      design_id,      // UUID | ""
      addon_ids,      // string[]
      bundle_id,      // UUID | "" — if bundle selected, use bundle addons + discount
      quantity = 1,
    } = body;

    // 1. Base price from weight
    const weightConfig = CUSTOM_CAKE_WEIGHTS.find(w => w.label === weight_label);
    if (!weightConfig) {
      return NextResponse.json({ error: 'Invalid weight' }, { status: 400 });
    }

    const base_price = weightConfig.base_price;
    const breakdown: { name: string; amount: number }[] = [
      { name: `Custom Cake (${weight_label})`, amount: base_price }
    ];
    let surcharges = 0;
    let addons_price = 0;
    let bundle_discount = 0;

    const supabase = await createClient();

    // 2. Option surcharges (eggless, frosting, design)
    if (eggless) {
      const { data: opt } = await supabase
        .from('product_option_prices')
        .select('name, surcharge')
        .eq('option_type', 'eggless')
        .single();
      if (opt && Number(opt.surcharge) > 0) {
        surcharges += Number(opt.surcharge);
        breakdown.push({ name: opt.name, amount: Number(opt.surcharge) });
      }
    }

    const optionIds = [frosting_id, design_id].filter(Boolean);
    if (optionIds.length > 0) {
      const { data: opts } = await supabase
        .from('product_option_prices')
        .select('id, name, surcharge')
        .in('id', optionIds);
      for (const opt of opts ?? []) {
        if (Number(opt.surcharge) > 0) {
          surcharges += Number(opt.surcharge);
          breakdown.push({ name: opt.name, amount: Number(opt.surcharge) });
        }
      }
    }

    // 3. Individual add-ons
    const verifiedAddons: { id: string; name: string; price: number }[] = [];
    const effectiveAddonIds = Array.isArray(addon_ids) ? addon_ids : [];

    if (effectiveAddonIds.length > 0) {
      const { data: addons } = await supabase
        .from('product_addons')
        .select('id, name, price')
        .in('id', effectiveAddonIds);
      for (const a of addons ?? []) {
        addons_price += Number(a.price);
        breakdown.push({ name: a.name, amount: Number(a.price) });
        verifiedAddons.push({ id: a.id, name: a.name, price: Number(a.price) });
      }
    }

    // 4. Bundle pricing (replaces individual addons if bundle selected)
    if (bundle_id) {
      const { data: bundle } = await supabase
        .from('occasion_bundles')
        .select(`id, name, discount_pct, bundle_items(addon_id, product_addons(id, name, price))`)
        .eq('id', bundle_id)
        .single();

      if (bundle) {
        // Calculate bundle items total + apply discount
        const bundleItems = (bundle.bundle_items ?? [])
          .map((bi: any) => bi.product_addons)
          .filter(Boolean);
        const bundle_original = bundleItems.reduce((s: number, a: any) => s + Number(a.price), 0);
        bundle_discount = parseFloat((bundle_original * Number(bundle.discount_pct) / 100).toFixed(2));

        // Add bundle items if not already in individual addons
        for (const a of bundleItems) {
          if (!verifiedAddons.find(v => v.id === a.id)) {
            addons_price += Number(a.price);
            verifiedAddons.push({ id: a.id, name: a.name, price: Number(a.price) });
          }
        }

        breakdown.push({ name: `${bundle.name} Bundle Discount (${bundle.discount_pct}% off)`, amount: -bundle_discount });
      }
    }

    const per_item_price = parseFloat((base_price + surcharges + addons_price - bundle_discount).toFixed(2));
    const total = parseFloat((per_item_price * quantity).toFixed(2));

    return NextResponse.json({
      base_price,
      surcharges,
      addons_price,
      bundle_discount,
      per_item_price,
      total,
      breakdown,
      verifiedAddons,
    });
  } catch (e: any) {
    console.error('Custom price check error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
