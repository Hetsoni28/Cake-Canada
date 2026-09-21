import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { code, subtotal = 0 }: { code: string; subtotal?: number } = await req.json();

    if (!code?.trim()) {
      return NextResponse.json({ valid: false, message: 'Please enter a coupon code.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, message: 'Coupon code not found or no longer active.' });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired.' });
    }

    if (coupon.max_uses && coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({ valid: false, message: 'This coupon has reached its usage limit.' });
    }

    if (subtotal < Number(coupon.min_order_value)) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order of $${coupon.min_order_value} required for this coupon.`
      });
    }

    const discount_value = Number(coupon.discount_value);
    const discount = coupon.discount_type === 'percentage'
      ? parseFloat((subtotal * discount_value / 100).toFixed(2))
      : Math.min(discount_value, subtotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value,
      discount,
      message: coupon.discount_type === 'percentage'
        ? `${discount_value}% off applied!`
        : `$${discount_value} off applied!`,
    });
  } catch (e: any) {
    return NextResponse.json({ valid: false, message: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
