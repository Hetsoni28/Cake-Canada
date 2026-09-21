"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useCart } from "@/components/cart-provider";
import { MapPin, ShoppingBag, Tag, AlertCircle, Loader2 } from "lucide-react";

interface DeliverySlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
}

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_full_name: string;
  delivery_phone: string;
  delivery_address_1: string;
  delivery_address_2: string;
  delivery_city: string;
  delivery_province: string;
  delivery_postal_code: string;
  delivery_date: string;
  delivery_slot_id: string;
  coupon_code: string;
  customer_note: string;
}

const CANADIAN_PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

// Minimum 2 days from today for order preparation
function getMinDeliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_full_name: "",
    delivery_phone: "",
    delivery_address_1: "",
    delivery_address_2: "",
    delivery_city: "Toronto",
    delivery_province: "Ontario",
    delivery_postal_code: "",
    delivery_date: getMinDeliveryDate(),
    delivery_slot_id: "",
    coupon_code: "",
    customer_note: "",
  });

  // Fetch delivery slots
  useEffect(() => {
    fetch("/api/delivery-slots")
      .then((r) => r.json())
      .then((data) => {
        if (data.slots) setSlots(data.slots);
      })
      .catch(() => {
        // Use static fallback slots if API not ready
        setSlots([
          {
            id: "morning",
            label: "Morning (10am - 12pm)",
            start_time: "10:00",
            end_time: "12:00",
          },
          {
            id: "afternoon",
            label: "Afternoon (12pm - 3pm)",
            start_time: "12:00",
            end_time: "15:00",
          },
          {
            id: "evening",
            label: "Evening (3pm - 6pm)",
            start_time: "15:00",
            end_time: "18:00",
          },
        ]);
      });
  }, []);

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!form.delivery_slot_id) {
      setError("Please select a delivery time slot.");
      return;
    }

    setLoading(true);

    try {
      // Build items array — only send variant_id + quantity (no prices)
      // The server re-calculates all prices from the database
      const checkoutItems = items.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        customization: {},
        addon_ids: [],
      }));

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: checkoutItems,
          ...form,
          // user_id will be added when auth is wired
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error ?? "Checkout failed. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout — Stripe handles payment securely
      if (data.url) {
        window.location.href = data.url;
        // Note: don't setLoading(false) — let the redirect happen
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  if (!items.length) {
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
        <div
          className="shell"
          style={{ padding: "80px 0", textAlign: "center" }}
        >
          <ShoppingBag
            size={48}
            style={{ margin: "0 auto 16px", opacity: 0.3 }}
          />
          <h1 style={{ marginBottom: 12 }}>Your cart is empty</h1>
          <p style={{ color: "var(--taupe)", marginBottom: 28 }}>
            Add some cakes before checking out.
          </p>
          <a href="/cakes" className="btn btn-dark">
            Browse Cakes
          </a>
        </div>
      </main>
    );
  }

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
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <p className="eyebrow">CHECKOUT</p>
            <h1>Complete your order</h1>
          </div>

          {/* Cancelled banner */}
          {typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).get("cancelled") ===
              "true" && (
              <div
                style={{
                  background: "#fff3cd",
                  border: "1px solid #ffc107",
                  borderRadius: 8,
                  padding: "14px 18px",
                  marginBottom: 28,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <AlertCircle
                  size={18}
                  style={{ color: "#856404", flexShrink: 0, marginTop: 2 }}
                />
                <p style={{ fontSize: 14, color: "#856404", margin: 0 }}>
                  Payment was cancelled. Your order has not been placed. Please
                  try again.
                </p>
              </div>
            )}

          <form onSubmit={handleSubmit}>
            <div className="checkout-layout">
              {/* ── LEFT: FORM ── */}
              <div className="checkout-form-col">
                {/* Contact */}
                <div className="checkout-section-card">
                  <h3>Contact details</h3>
                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Full name</label>
                      <input
                        required
                        value={form.customer_name}
                        onChange={(e) => set("customer_name", e.target.value)}
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div className="form-field">
                      <label>Phone</label>
                      <input
                        required
                        type="tel"
                        value={form.customer_phone}
                        onChange={(e) => set("customer_phone", e.target.value)}
                        placeholder="+1 (416) 000-0000"
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Email address</label>
                    <input
                      required
                      type="email"
                      value={form.customer_email}
                      onChange={(e) => set("customer_email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Delivery */}
                <div className="checkout-section-card">
                  <h3>Delivery address</h3>

                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Recipient name</label>
                      <input
                        required
                        value={form.delivery_full_name}
                        onChange={(e) =>
                          set("delivery_full_name", e.target.value)
                        }
                        placeholder="Recipient name"
                      />
                    </div>
                    <div className="form-field">
                      <label>Recipient phone</label>
                      <input
                        required
                        type="tel"
                        value={form.delivery_phone}
                        onChange={(e) => set("delivery_phone", e.target.value)}
                        placeholder="+1 (416) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Address line 1</label>
                    <input
                      required
                      value={form.delivery_address_1}
                      onChange={(e) =>
                        set("delivery_address_1", e.target.value)
                      }
                      placeholder="123 Maple Street, Unit 4"
                    />
                  </div>
                  <div className="form-field">
                    <label>
                      Address line 2{" "}
                      <span style={{ color: "var(--taupe)", fontWeight: 400 }}>
                        (optional)
                      </span>
                    </label>
                    <input
                      value={form.delivery_address_2}
                      onChange={(e) =>
                        set("delivery_address_2", e.target.value)
                      }
                      placeholder="Apt / Suite / Buzzer"
                    />
                  </div>

                  <div className="form-row-3">
                    <div className="form-field">
                      <label>City</label>
                      <input
                        required
                        value={form.delivery_city}
                        onChange={(e) => set("delivery_city", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Province</label>
                      <select
                        required
                        value={form.delivery_province}
                        onChange={(e) =>
                          set("delivery_province", e.target.value)
                        }
                      >
                        {CANADIAN_PROVINCES.map((p) => (
                          <option key={p.code} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Postal code</label>
                      <input
                        required
                        value={form.delivery_postal_code}
                        onChange={(e) =>
                          set(
                            "delivery_postal_code",
                            e.target.value.toUpperCase(),
                          )
                        }
                        placeholder="M5V 2T6"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Date & Slot */}
                <div className="checkout-section-card">
                  <h3>Delivery date & time</h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--taupe)",
                      marginBottom: 20,
                    }}
                  >
                    We require a minimum of 48 hours preparation time. Select
                    your preferred delivery window.
                  </p>
                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Delivery date</label>
                      <input
                        required
                        type="date"
                        min={getMinDeliveryDate()}
                        value={form.delivery_date}
                        onChange={(e) => set("delivery_date", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Time slot</label>
                      <select
                        required
                        value={form.delivery_slot_id}
                        onChange={(e) =>
                          set("delivery_slot_id", e.target.value)
                        }
                      >
                        <option value="">Select a time</option>
                        {slots.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="checkout-section-card">
                  <h3>
                    Order notes{" "}
                    <span
                      style={{
                        color: "var(--taupe)",
                        fontWeight: 400,
                        fontSize: 14,
                      }}
                    >
                      (optional)
                    </span>
                  </h3>
                  <div className="form-field">
                    <label>Cake message or special instructions</label>
                    <textarea
                      rows={3}
                      value={form.customer_note}
                      onChange={(e) => set("customer_note", e.target.value)}
                      placeholder="Happy Birthday Sarah! Please include a candle."
                    />
                  </div>
                </div>
              </div>

              {/* ── RIGHT: ORDER SUMMARY ── */}
              <div className="checkout-summary-col">
                <div className="checkout-summary-card">
                  <h3>Order summary</h3>

                  {/* Cart items */}
                  <div className="checkout-items">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId}`}
                        className="checkout-item-row"
                      >
                        <div>
                          <p className="checkout-item-name">{item.name}</p>
                          <p className="checkout-item-variant">
                            {item.variantLabel} × {item.quantity}
                          </p>
                        </div>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="checkout-divider" />

                  {/* Coupon */}
                  <div className="form-field" style={{ marginBottom: 16 }}>
                    <label
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Tag size={13} /> Coupon code
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={form.coupon_code}
                        onChange={(e) =>
                          set("coupon_code", e.target.value.toUpperCase())
                        }
                        placeholder="WELCOME10"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>

                  <div className="checkout-divider" />

                  {/* Totals */}
                  <div className="checkout-totals">
                    <div className="checkout-total-row">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="checkout-total-row">
                      <span>Delivery fee</span>
                      <span style={{ color: "var(--taupe)" }}>
                        Calculated at payment
                      </span>
                    </div>
                    <div className="checkout-total-row">
                      <span>HST (13%)</span>
                      <span style={{ color: "var(--taupe)" }}>
                        Calculated at payment
                      </span>
                    </div>
                  </div>

                  <div className="checkout-divider" />

                  <div className="checkout-total-row checkout-grand-total">
                    <span>Total</span>
                    <span>Confirmed at payment</span>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      style={{
                        background: "#fff0f0",
                        border: "1px solid #f5c2c2",
                        borderRadius: 8,
                        padding: "12px 16px",
                        marginTop: 16,
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <AlertCircle
                        size={16}
                        style={{
                          color: "#c0392b",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      />
                      <p style={{ fontSize: 13, color: "#c0392b", margin: 0 }}>
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-dark"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      marginTop: 20,
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Loader2 size={16} className="spin" />
                        Redirecting to payment...
                      </span>
                    ) : (
                      "Proceed to Payment →"
                    )}
                  </button>

                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--taupe)",
                      textAlign: "center",
                      marginTop: 12,
                    }}
                  >
                    🔒 Payments are processed securely by Stripe. We never store
                    your card details.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      justifyContent: "center",
                      marginTop: 10,
                    }}
                  >
                    <MapPin size={13} style={{ color: "var(--taupe)" }} />
                    <span style={{ fontSize: 12, color: "var(--taupe)" }}>
                      Delivering across Greater Toronto Area
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
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
