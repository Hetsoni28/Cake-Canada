"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { MapPin, Mail, Clock, Phone } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General Enquiry",
    message: "",
  });
  const [status, setStatus] = useState({ submitted: false, submitting: false });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ submitted: false, submitting: true });
    setTimeout(() => {
      setStatus({ submitted: true, submitting: false });
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      {/* ── Announcement bar ── */}
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Page Hero ── */}
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">GET IN TOUCH</p>
          <h1>We&apos;d love to hear from you.</h1>
          <p>
            Whether you have a question about a custom cake, want to place an
            order, or simply want to say hello — we&apos;re always happy to
            chat.
          </p>
        </div>
      </section>

      {/* ── Contact layout ── */}
      <section className="section shell">
        <div className="contact-layout">
          {/* Left — info */}
          <div className="contact-info">
            <h2>Say hello.</h2>
            <p>
              Reach out to us for anything from custom cake enquiries to general
              questions. We aim to respond within one business day and love
              hearing from our community.
            </p>

            <div className="contact-details">
              {/* Location */}
              <div className="contact-detail-item">
                <MapPin size={20} />
                <div>
                  <strong>Location</strong>
                  <p>Greater Toronto Area, Ontario, Canada</p>
                </div>
              </div>

              {/* Email */}
              <div className="contact-detail-item">
                <Mail size={20} />
                <div>
                  <strong>Email</strong>
                  <a href="mailto:hello@maisoncakeco.ca">
                    hello@maisoncakeco.ca
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="contact-detail-item">
                <Phone size={20} />
                <div>
                  <strong>Phone</strong>
                  <p>+1 (416) 555-0198</p>
                </div>
              </div>

              {/* Hours */}
              <div className="contact-detail-item">
                <Clock size={20} />
                <div>
                  <strong>Hours</strong>
                  <p>Tue–Sun: 10am–6pm EST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form card */}
          <div className="contact-form-card">
            <h3>Send a message</h3>

            {status.submitted ? (
              <div className="form-success">
                Thank you for reaching out! We&apos;ll get back to you within
                one business day. ✨
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                  >
                    <option>General Enquiry</option>
                    <option>Custom Cake Order</option>
                    <option>Wedding Cake</option>
                    <option>Delivery Question</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help…"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="form-submit"
                  disabled={status.submitting}
                >
                  {status.submitting ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Find us / Map section ── */}
      <section className="section cream">
        <div className="shell">
          <div className="section-heading centered">
            <p className="eyebrow">FIND US</p>
            <h2>Located in the GTA.</h2>
          </div>

          <div
            style={{
              background: "var(--cream)",
              border: "1px solid var(--border)",
              height: 350,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
              color: "var(--taupe)",
              fontSize: 14,
            }}
          >
            <MapPin size={32} style={{ color: "var(--caramel)", opacity: 0.5 }} />
            <span>
              Map coming soon —{" "}
              <a
                href="mailto:hello@maisoncakeco.ca"
                style={{ color: "var(--caramel)" }}
              >
                hello@maisoncakeco.ca
              </a>
            </span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
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
