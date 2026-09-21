import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { MapPin, CheckCircle, Package, Clock } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  delivery_date: string;
  delivery_slot_label: string | null;
  delivery_address_line_1: string;
  delivery_city: string;
  delivery_province: string;
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
}

async function OrderDetails({ orderId }: { orderId: string }) {
  const { data: order } = (await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single()) as { data: Order | null };

  if (!order) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ color: "var(--taupe)" }}>
          Order not found. Check your confirmation email for details.
        </p>
        <a
          href="/cakes"
          className="btn btn-dark"
          style={{ marginTop: 24, display: "inline-flex" }}
        >
          Back to Shop
        </a>
      </div>
    );
  }

  const isPaid = order.payment_status === "PAID";

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Status Banner */}
      <div
        style={{
          background: isPaid ? "var(--cream)" : "#fff9e6",
          border: `1px solid ${isPaid ? "var(--border)" : "#ffc107"}`,
          borderRadius: 12,
          padding: "32px",
          textAlign: "center",
          marginBottom: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <CheckCircle
            size={52}
            style={{ color: isPaid ? "var(--caramel)" : "#ffc107" }}
          />
        </div>
        <h1 style={{ marginBottom: 8, fontSize: 26 }}>
          {isPaid ? "Order confirmed!" : "Order received!"}
        </h1>
        <p style={{ color: "var(--taupe)", marginBottom: 0 }}>
          {isPaid
            ? `Thank you, ${order.customer_name.split(" ")[0]}! Your order has been confirmed and our team is on it.`
            : "We received your order and are awaiting payment confirmation."}
        </p>
      </div>

      {/* Order Number */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <p className="eyebrow">ORDER NUMBER</p>
          <p
            style={{
              fontSize: 22,
              fontWeight: 600,
              fontFamily: "var(--font-heading)",
              letterSpacing: 1,
            }}
          >
            {order.order_number}
          </p>
        </div>
        <span
          style={{
            background: isPaid ? "#e8f5e9" : "#fff3cd",
            color: isPaid ? "#2e7d32" : "#856404",
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          {order.status}
        </span>
      </div>

      {/* Info Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div
          className="checkout-section-card"
          style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
        >
          <Package
            size={20}
            style={{ color: "var(--caramel)", flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>
              Delivery address
            </p>
            <p
              style={{
                color: "var(--taupe)",
                fontSize: 13,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {order.delivery_address_line_1}
              <br />
              {order.delivery_city}, {order.delivery_province}
            </p>
          </div>
        </div>

        <div
          className="checkout-section-card"
          style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
        >
          <Clock
            size={20}
            style={{ color: "var(--caramel)", flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>
              Delivery window
            </p>
            <p
              style={{
                color: "var(--taupe)",
                fontSize: 13,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {new Date(order.delivery_date).toLocaleDateString("en-CA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              <br />
              {order.delivery_slot_label ?? "Time TBC"}
            </p>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="checkout-section-card">
        <h3 style={{ marginBottom: 20 }}>Payment summary</h3>
        <div className="checkout-totals">
          <div className="checkout-total-row">
            <span>Subtotal</span>
            <span>${Number(order.subtotal).toFixed(2)} CAD</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="checkout-total-row" style={{ color: "#2e7d32" }}>
              <span>Discount</span>
              <span>-${Number(order.discount_amount).toFixed(2)} CAD</span>
            </div>
          )}
          <div className="checkout-total-row">
            <span>Delivery fee</span>
            <span>${Number(order.delivery_fee).toFixed(2)} CAD</span>
          </div>
          <div className="checkout-total-row">
            <span>Tax (HST)</span>
            <span>${Number(order.tax_amount).toFixed(2)} CAD</span>
          </div>
        </div>
        <div className="checkout-divider" />
        <div className="checkout-total-row checkout-grand-total">
          <span>Total paid</span>
          <span>${Number(order.total_amount).toFixed(2)} CAD</span>
        </div>
      </div>

      {/* Email note */}
      <p
        style={{
          fontSize: 13,
          color: "var(--taupe)",
          textAlign: "center",
          marginTop: 24,
          lineHeight: 1.8,
        }}
      >
        A confirmation has been sent to <strong>{order.customer_email}</strong>.
        <br />
        Our team will reach out if there are any questions about your order.
      </p>

      {/* CTA */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginTop: 32,
        }}
      >
        <a href="/account/orders" className="btn btn-outline">
          View My Orders
        </a>
        <a href="/cakes" className="btn btn-dark">
          Continue Shopping
        </a>
      </div>
    </div>
  );
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; session_id?: string }>;
}) {
  const { order_id } = await searchParams;

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      <div
        style={{
          background: "var(--espresso)",
          color: "#fff",
          textAlign: "center",
          padding: "10px",
          fontSize: "13px",
        }}
      >
        Free delivery on orders over $80 within the GTA 🍰
      </div>
      <Navbar />

      <section className="section shell">
        <Suspense
          fallback={
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "var(--taupe)" }}>
                Loading your order details...
              </p>
            </div>
          }
        >
          {order_id ? (
            <OrderDetails orderId={order_id} />
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                maxWidth: 520,
                margin: "0 auto",
              }}
            >
              <CheckCircle
                size={52}
                style={{ color: "var(--caramel)", margin: "0 auto 20px" }}
              />
              <h1 style={{ marginBottom: 12 }}>Thank you for your order!</h1>
              <p style={{ color: "var(--taupe)", marginBottom: 28 }}>
                Check your email for order confirmation details.
              </p>
              <a href="/cakes" className="btn btn-dark">
                Continue Shopping
              </a>
            </div>
          )}
        </Suspense>
      </section>

      <footer className="footer">
        <div className="shell footer-grid">
          <div>
            <div className="brand">
              MAISON<span>CAKE CO.</span>
            </div>
            <p>Handcrafted cakes made for life&apos;s sweetest moments.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <a href="/cakes">All Cakes</a>
            <a href="/categories/birthday">Birthday</a>
            <a href="/custom-cake">Custom Cakes</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
            <a href="/faq">FAQs</a>
          </div>
          <div>
            <h4>Contact</h4>
            <p>
              <MapPin size={15} /> Canada
            </p>
            <p>hello@maisoncakeco.ca</p>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Maison Cake Co.</span>
          <span>Privacy · Terms</span>
        </div>
      </footer>
    </main>
  );
}
