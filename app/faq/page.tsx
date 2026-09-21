"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { Navbar } from "@/components/navbar";

const FAQ_ITEMS = [
  {
    q: "How far in advance should I order?",
    a: "We recommend ordering at least 5–7 days in advance for standard cakes, and 2–3 weeks for custom or wedding cakes to ensure availability and allow time for design consultation.",
  },
  {
    q: "Do you offer delivery?",
    a: "Yes! We offer local delivery across the Greater Toronto Area and surrounding cities in Ontario. Delivery fees vary by location and are calculated at checkout.",
  },
  {
    q: "Can I customize the flavour and design?",
    a: "Absolutely. Use our Custom Cake builder to choose your sponge flavour, filling, frosting, size, decorations, and add a personal message. For complex designs, our team will reach out for a consultation.",
  },
  {
    q: "Are eggless options available?",
    a: "Yes, we offer fully eggless cakes across most of our flavours. Look for the Eggless category or select the eggless option when customizing your order.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards. Payment is collected securely at checkout. For large wedding or event orders, a 50% deposit is required at time of booking.",
  },
  {
    q: "Can I pick up my order?",
    a: "Yes, we offer contactless pick-up from our kitchen during business hours (Tuesday–Sunday, 10am–6pm). Select the pick-up option at checkout and you will receive an address and time confirmation by email.",
  },
  {
    q: "How do I store my cake?",
    a: "Cakes should be kept refrigerated and consumed within 3 days. Remove from the fridge 30 minutes before serving for best flavour and texture.",
  },
  {
    q: "What if I need to cancel or modify my order?",
    a: "Cancellations made 72+ hours before the delivery/pick-up date receive a full refund. Changes to flavour or design can be made up to 48 hours before. Unfortunately we cannot accommodate same-day changes.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>
      <Navbar />

      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow" style={{ justifyContent: "center" }}>
            FAQS
          </p>
          <h1>Your questions, answered.</h1>
          <p>Everything you need to know about ordering from Maison Cake Co.</p>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading centered">
          <h2>Common questions</h2>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div className="faq-item" key={index}>
                <button
                  className={`faq-question${isOpen ? " open" : ""}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  {item.q}
                  <ChevronDown size={20} />
                </button>
                <div className={`faq-answer${isOpen ? " open" : ""}`}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
