import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      items, // [{variant_id, quantity, customization?, addon_ids?}]
      customer_name,
      customer_email,
      customer_phone,
      delivery_full_name,
      delivery_phone,
      delivery_address_1,
      delivery_address_2,
      delivery_city,
      delivery_province,
      delivery_postal_code,
      delivery_date,
      delivery_slot_id,
      coupon_code,
      customer_note,
      user_id,
    } = body;

    // ── 1. Validate required fields ──────────────────────────────
    if (
      !items?.length ||
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !delivery_full_name ||
      !delivery_phone ||
      !delivery_address_1 ||
      !delivery_city ||
      !delivery_province ||
      !delivery_postal_code ||
      !delivery_date ||
      !delivery_slot_id
    ) {
      return NextResponse.json(
        { error: "Missing required checkout fields" },
        { status: 400 },
      );
    }

    // ── 2. Create pending order via secure server-side DB function ──
    // Prices are NEVER taken from the client — the DB function
    // looks them up from product_variants and recalculates everything.
    const { data: orderData, error: orderError } = await supabaseAdmin.rpc(
      "create_pending_order",
      {
        p_user_id: user_id ?? null,
        p_customer_name: customer_name,
        p_customer_email: customer_email,
        p_customer_phone: customer_phone,
        p_delivery_full_name: delivery_full_name,
        p_delivery_phone: delivery_phone,
        p_delivery_address_1: delivery_address_1,
        p_delivery_address_2: delivery_address_2 ?? null,
        p_delivery_city: delivery_city,
        p_delivery_province: delivery_province,
        p_delivery_postal_code: delivery_postal_code,
        p_delivery_date: delivery_date,
        p_delivery_slot_id: delivery_slot_id,
        p_coupon_code: coupon_code ?? null,
        p_customer_note: customer_note ?? null,
        p_items: items,
      },
    );

    if (orderError) {
      console.error("DB order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order. Please try again." },
        { status: 500 },
      );
    }

    const order = orderData?.[0];

    if (!order?.success) {
      return NextResponse.json(
        { error: order?.error ?? "Order creation failed" },
        { status: 400 },
      );
    }

    // ── 3. Create Stripe Checkout Session ────────────────────────
    // total_amount is the server-calculated total in CAD dollars.
    // We convert to cents (Stripe uses smallest currency unit).
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "cad",

      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `Order ${order.order_number} — Maison Cake Co.`,
              description:
                "Handcrafted cakes made for life's sweetest moments.",
              images: [
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
              ],
            },
            // ⚠️ Price is taken from the server-calculated order total — never the client
            unit_amount: Math.round(order.total_amount * 100),
          },
          quantity: 1,
        },
      ],

      // Pass order IDs into Stripe metadata — used by the webhook to update the DB
      metadata: {
        order_id: order.order_id,
        order_number: order.order_number,
      },

      payment_intent_data: {
        metadata: {
          order_id: order.order_id,
          order_number: order.order_number,
        },
      },

      customer_email: customer_email,

      // Stripe redirects here after payment
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation?order_id=${order.order_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?cancelled=true`,

      // Session expires after 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,

      billing_address_collection: "auto",
      phone_number_collection: { enabled: false }, // We already collect phone
    });

    // ── 4. Save Stripe session ID to the order row ───────────────
    await supabaseAdmin
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.order_id);

    // ── 5. Return Stripe Checkout URL to the client ──────────────
    return NextResponse.json({
      url: session.url,
      order_id: order.order_id,
      order_number: order.order_number,
    });
  } catch (err: unknown) {
    console.error("Checkout route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
