import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CartItem } from '@/lib/cart';

// Constants — server-side only, never leaked to client
const DELIVERY_FREE_THRESHOLD = 80;  // orders >= $80 get free delivery
const DELIVERY_FEE = 8.99;
const TAX_RATE = 0.13;               // 13% HST (Ontario)

export async function POST(req: Request) {
  try {
    const { items, coupon_code }: { items: CartItem[]; coupon_code?: string } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const supabase = await createClient();

    // ── 1. Re-verify every item's server price ──────────────────────────────
    let subtotal = 0;
    const verifiedItems: (CartItem & { verified_price: number })[] = [];

    for (const item of items) {
      let itemPrice = item.serverVerifiedPrice;

      // For regular products, re-verify via variant price from DB
      if (item.productId !== 'custom-cake' && item.variantId) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('price')
          .eq('id', item.variantId)
          .single();
        if (variant) {
          // Use stored server-verified price (already includes surcharges/addons)
          // We trust serverVerifiedPrice for configured items; base variant is the minimum
          itemPrice = Math.max(itemPrice, Number(variant.price));
        }
      }

      subtotal += itemPrice * item.quantity;
      verifiedItems.push({ ...item, verified_price: itemPrice });
    }

    // ── 2. Delivery fee ─────────────────────────────────────────────────────
    const delivery_fee = subtotal >= DELIVERY_FREE_THRESHOLD ? 0 : DELIVERY_FEE;

    // ── 3. Coupon discount ──────────────────────────────────────────────────
    let discount = 0;
    let appliedCoupon = null;

    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (coupon) {
        const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
        const isExhausted = coupon.max_uses && coupon.times_used >= coupon.max_uses;
        const meetsMinimum = subtotal >= Number(coupon.min_order_value);

        if (!isExpired && !isExhausted && meetsMinimum) {
          if (coupon.discount_type === 'percentage') {
            discount = parseFloat((subtotal * Number(coupon.discount_value) / 100).toFixed(2));
          } else {
            discount = Math.min(Number(coupon.discount_value), subtotal);
          }
          appliedCoupon = {
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: Number(coupon.discount_value),
          };
        }
      }
    }

    // ── 4. Tax on (subtotal - discount + delivery) ──────────────────────────
    const taxable = Math.max(0, subtotal - discount) + delivery_fee;
    const tax = parseFloat((taxable * TAX_RATE).toFixed(2));

    // ── 5. Grand total ──────────────────────────────────────────────────────
    const grand_total = parseFloat((Math.max(0, subtotal - discount) + delivery_fee + tax).toFixed(2));

    return NextResponse.json({
      subtotal:       parseFloat(subtotal.toFixed(2)),
      delivery_fee:   parseFloat(delivery_fee.toFixed(2)),
      discount:       parseFloat(discount.toFixed(2)),
      tax:            tax,
      grand_total,
      coupon:         appliedCoupon,
      free_delivery_threshold: DELIVERY_FREE_THRESHOLD,
      items_verified: verifiedItems.length,
    });
  } catch (e: any) {
    console.error('Cart total error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
