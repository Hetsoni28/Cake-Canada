import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Stripe Webhook Handler
 *
 * Security model:
 * 1. Read raw body as text — MUST happen before any JSON parsing
 * 2. Verify Stripe-Signature header using STRIPE_WEBHOOK_SECRET
 * 3. Only then process the event
 * 4. Use idempotency (raw_event_id) to avoid double-processing
 *
 * This is the ONLY place that sets payment_status = 'PAID' in the DB.
 * The client can NEVER directly update payment status.
 */
export async function POST(request: NextRequest) {
  // ── 1. Read raw body (required for signature verification) ────
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Webhook: missing Stripe-Signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Webhook: STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  // ── 2. Verify Stripe signature ────────────────────────────────
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    // Return 400 — Stripe will retry if we return 5xx
    return NextResponse.json(
      { error: `Signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  console.log(`Stripe webhook received: ${event.type} [${event.id}]`);

  // ── 3. Handle events ──────────────────────────────────────────
  try {
    switch (event.type) {
      // ✅ Payment completed successfully
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only process if actually paid (some sessions use separate payment steps)
        if (session.payment_status !== "paid") {
          console.log(`Session ${session.id} not yet paid — skipping`);
          break;
        }

        const orderId = session.metadata?.order_id;

        if (!orderId) {
          console.error(
            `Webhook: no order_id in session metadata for ${session.id}`,
          );
          // Return 200 so Stripe doesn't keep retrying for this non-actionable error
          return NextResponse.json({ received: true });
        }

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : ((session.payment_intent as Stripe.PaymentIntent | null)?.id ??
              "");

        const amountPaidCAD = (session.amount_total ?? 0) / 100;

        // ── Confirm order via secure DB function ──────────────────
        // This function:
        // 1. Checks idempotency (won't double-process same event)
        // 2. Verifies amount matches the DB total
        // 3. Sets order status = CONFIRMED, payment_status = PAID
        // 4. Creates payments row
        // 5. Marks slot reservation as CONSUMED
        const { data: confirmData, error: confirmError } =
          await supabaseAdmin.rpc("confirm_order_payment", {
            p_order_id: orderId,
            p_stripe_payment_intent_id: paymentIntentId,
            p_stripe_checkout_session_id: session.id,
            p_amount_paid: amountPaidCAD,
            p_raw_event_id: event.id,
          });

        if (confirmError) {
          console.error(
            `Webhook: DB error confirming order ${orderId}:`,
            confirmError,
          );
          // Return 500 so Stripe retries
          return NextResponse.json({ error: "DB error" }, { status: 500 });
        }

        const result = confirmData?.[0];

        if (!result?.success && result?.error !== "Already processed") {
          console.error(
            `Webhook: failed to confirm order ${orderId}:`,
            result?.error,
          );
          return NextResponse.json(
            { error: result?.error ?? "Confirmation failed" },
            { status: 500 },
          );
        }

        console.log(
          `✅ Order ${orderId} confirmed — payment ${amountPaidCAD} CAD`,
        );
        break;
      }

      // ❌ Session expired without payment — release slot
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          // Release the delivery slot reservation
          await supabaseAdmin
            .from("delivery_slot_reservations")
            .update({ status: "EXPIRED" })
            .eq("order_id", orderId)
            .eq("status", "ACTIVE");

          // Mark order as cancelled
          await supabaseAdmin
            .from("orders")
            .update({
              status: "CANCELLED",
              cancelled_at: new Date().toISOString(),
            })
            .eq("id", orderId)
            .eq("status", "PENDING");

          console.log(`Session expired — order ${orderId} cancelled`);
        }
        break;
      }

      // ❌ Payment intent failed
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;
        console.log(
          `Payment failed for order ${orderId ?? "unknown"}: ${paymentIntent.last_payment_error?.message}`,
        );
        break;
      }

      // 💸 Refund issued
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : null;

        if (paymentIntentId) {
          const isFullRefund = charge.refunded;
          const newStatus = isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED";

          await supabaseAdmin
            .from("payments")
            .update({
              status: newStatus,
              refunded_at: new Date().toISOString(),
            })
            .eq("provider_payment_id", paymentIntentId);

          if (isFullRefund) {
            await supabaseAdmin
              .from("orders")
              .update({ payment_status: "REFUNDED" })
              .eq("stripe_payment_intent_id", paymentIntentId);
          }

          console.log(`Refund processed for payment_intent ${paymentIntentId}`);
        }
        break;
      }

      default:
        // Unhandled event type — just acknowledge
        console.log(`Unhandled webhook event: ${event.type}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook handler error for ${event.type}:`, message);
    // Return 500 so Stripe retries
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
