"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { ArrowRight, Check, MapPin } from "lucide-react";

const STEPS = [
  "Choose Your Cake",
  "Size & Portions",
  "Design & Message",
  "Delivery Details",
];

type FormState = {
  flavour: string;
  sponge: string;
  weight: string;
  dietary: string;
  message: string;
  decoration: string;
  deliveryDate: string;
  slot: string;
  address: string;
  instructions: string;
};

const initialForm: FormState = {
  flavour: "",
  sponge: "",
  weight: "",
  dietary: "",
  message: "",
  decoration: "",
  deliveryDate: "",
  slot: "",
  address: "",
  instructions: "",
};

const todayISO = new Date().toISOString().split("T")[0];

export default function CustomCakePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, 3));
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit() {
    alert("Order submitted! We will be in touch shortly.");
  }

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      {/* Announcement */}
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>

      <Navbar />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow" style={{ justifyContent: "center" }}>
            CUSTOM CAKES
          </p>
          <h1>Design your perfect cake.</h1>
          <p>
            Tell us your vision — flavour, size, design, and delivery. We'll
            handle the rest, crafted fresh just for you.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="section">
        <div className="shell">
          <div className="custom-form-layout">
            {/* ── Left: form ── */}
            <div>
              {/* Step progress indicators */}
              <div className="custom-form-steps">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={
                      "custom-step-indicator" +
                      (step > i ? " done" : step === i ? " active" : "")
                    }
                  />
                ))}
              </div>

              {/* Step label */}
              <p className="eyebrow">
                STEP {step + 1} OF {STEPS.length} — {STEPS[step]}
              </p>

              {/* Card */}
              <div className="custom-form-card">
                {/* ── Step 0: Flavour & Sponge ── */}
                {step === 0 && (
                  <>
                    <h3>What flavour would you like?</h3>

                    <div className="variant-group">
                      <span className="variant-label">Sponge</span>
                      <div className="variant-options">
                        {["Vanilla", "Chocolate", "Red Velvet", "Lemon", "Caramel"].map(
                          (opt) => (
                            <button
                              key={opt}
                              className={
                                "variant-btn" +
                                (form.flavour === opt ? " selected" : "")
                              }
                              onClick={() => set("flavour", opt)}
                            >
                              {opt}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="variant-group">
                      <span className="variant-label">Filling</span>
                      <div className="variant-options">
                        {[
                          "Buttercream",
                          "Cream Cheese",
                          "Ganache",
                          "Fresh Cream",
                          "Jam & Cream",
                        ].map((opt) => (
                          <button
                            key={opt}
                            className={
                              "variant-btn" +
                              (form.sponge === opt ? " selected" : "")
                            }
                            onClick={() => set("sponge", opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Step 1: Size & Dietary ── */}
                {step === 1 && (
                  <>
                    <h3>Size &amp; Portions</h3>

                    <div className="variant-group">
                      <span className="variant-label">Weight</span>
                      <div className="variant-options">
                        {[
                          { label: "500g", sub: "4–6 portions" },
                          { label: "1 kg", sub: "8–12 portions" },
                          { label: "2 kg", sub: "16–20 portions" },
                          { label: "3 kg", sub: "24–30 portions" },
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            className={
                              "variant-btn" +
                              (form.weight === opt.label ? " selected" : "")
                            }
                            onClick={() => set("weight", opt.label)}
                          >
                            {opt.label}
                            <span
                              style={{
                                display: "block",
                                fontSize: 10,
                                opacity: 0.7,
                                marginTop: 2,
                              }}
                            >
                              {opt.sub}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="variant-group">
                      <span className="variant-label">Dietary</span>
                      <div className="variant-options">
                        {["Standard", "Eggless", "Vegan"].map((opt) => (
                          <button
                            key={opt}
                            className={
                              "variant-btn" +
                              (form.dietary === opt ? " selected" : "")
                            }
                            onClick={() => set("dietary", opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Step 2: Design & Message ── */}
                {step === 2 && (
                  <>
                    <h3>Design &amp; Message</h3>

                    <div className="form-field">
                      <label htmlFor="cake-message">Cake Message</label>
                      <textarea
                        id="cake-message"
                        placeholder="e.g. Happy Birthday Sarah! 🎂"
                        value={form.message}
                        onChange={(e) => set("message", e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="decoration">Decoration Style</label>
                      <select
                        id="decoration"
                        value={form.decoration}
                        onChange={(e) => set("decoration", e.target.value)}
                      >
                        <option value="">Select a style…</option>
                        <option value="Minimalist & Elegant">
                          Minimalist &amp; Elegant
                        </option>
                        <option value="Floral & Romantic">
                          Floral &amp; Romantic
                        </option>
                        <option value="Fun & Colourful">
                          Fun &amp; Colourful
                        </option>
                        <option value="Custom (consultation required)">
                          Custom (consultation required)
                        </option>
                      </select>
                    </div>

                    <p style={{ color: "var(--taupe)", fontSize: 13, margin: 0 }}>
                      Reference images can be shared via email after order
                      confirmation.
                    </p>
                  </>
                )}

                {/* ── Step 3: Delivery Details ── */}
                {step === 3 && (
                  <>
                    <h3>Delivery Details</h3>

                    <div className="form-field">
                      <label htmlFor="delivery-date">Delivery Date</label>
                      <input
                        id="delivery-date"
                        type="date"
                        min={todayISO}
                        value={form.deliveryDate}
                        onChange={(e) => set("deliveryDate", e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="time-slot">Time Slot</label>
                      <select
                        id="time-slot"
                        value={form.slot}
                        onChange={(e) => set("slot", e.target.value)}
                      >
                        <option value="">Select a time slot…</option>
                        <option value="Morning (10am–12pm)">
                          Morning (10am–12pm)
                        </option>
                        <option value="Afternoon (12pm–4pm)">
                          Afternoon (12pm–4pm)
                        </option>
                        <option value="Evening (4pm–7pm)">
                          Evening (4pm–7pm)
                        </option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="address">Delivery Address</label>
                      <textarea
                        id="address"
                        rows={3}
                        placeholder="Street address, city, postal code…"
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="instructions">Special Instructions</label>
                      <textarea
                        id="instructions"
                        rows={2}
                        placeholder="Any allergies, access notes, or requests…"
                        value={form.instructions}
                        onChange={(e) => set("instructions", e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="custom-step-nav">
                {step > 0 ? (
                  <button className="btn-outline-sm" onClick={prev}>
                    Back
                  </button>
                ) : (
                  <span />
                )}

                {step < 3 ? (
                  <button className="btn btn-dark" onClick={next}>
                    Continue <ArrowRight size={15} />
                  </button>
                ) : (
                  <button className="btn btn-dark" onClick={handleSubmit}>
                    Place Order <Check size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="order-summary-card">
              <h3>Order Summary</h3>

              {[
                { label: "Flavour", value: form.flavour },
                { label: "Filling", value: form.sponge },
                { label: "Size", value: form.weight },
                { label: "Dietary", value: form.dietary },
                {
                  label: "Message",
                  value: form.message
                    ? form.message.slice(0, 28) +
                      (form.message.length > 28 ? "…" : "")
                    : "",
                },
                { label: "Decoration", value: form.decoration },
                { label: "Date", value: form.deliveryDate },
              ].map(({ label, value }) => (
                <div className="summary-row" key={label}>
                  <span>{label}</span>
                  <strong>{value || "–"}</strong>
                </div>
              ))}

              <div className="summary-total">
                <span>Total</span>
                <span>Calculated at checkout</span>
              </div>

              <p
                style={{
                  color: "var(--blush)",
                  fontSize: 11,
                  marginTop: 16,
                  lineHeight: 1.6,
                }}
              >
                Final price depends on size and customization. A quote will be
                confirmed by our team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="shell footer-grid">
          <div>
            <div className="brand">
              MAISON<span>CAKE CO.</span>
            </div>
            <p>Handcrafted cakes made for life's sweetest moments.</p>
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
