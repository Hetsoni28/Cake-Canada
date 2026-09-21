import type { Metadata } from "next";
import { ArrowRight, MapPin, Package, Settings, User } from "lucide-react";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "My Orders",
};

const DEMO_ORDERS = [
  {
    id: "ORD-2026-001",
    date: "September 14, 2026",
    status: "Delivered",
    items: ["Chocolate Truffle (1 kg)", "Strawberry Dream (500g)"],
    total: "$127.00",
  },
  {
    id: "ORD-2026-002",
    date: "September 8, 2026",
    status: "Preparing",
    items: ["Velvet Bloom (1 kg)"],
    total: "$92.00",
  },
];

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-ivory text-espresso">
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>
      <Navbar />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">MY ACCOUNT</p>
          <h1>Order History.</h1>
        </div>
      </section>

      {/* Account Layout */}
      <section className="section shell">
        <div className="account-layout">
          {/* Sidebar */}
          <aside className="account-sidebar">
            <h3>Navigation</h3>
            <nav className="account-nav">
              <a href="/account">
                <User size={14} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
                My Profile
              </a>
              <a href="/account/orders" className="active">
                <Package size={14} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
                Order History
              </a>
              <a href="/account/addresses">
                <MapPin size={14} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
                Saved Addresses
              </a>
              <a href="/account/settings">
                <Settings size={14} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
                Settings
              </a>
              <a
                href="/auth/login"
                style={{
                  fontSize: 13,
                  color: "var(--taupe)",
                  marginTop: 16,
                  display: "block",
                  padding: "9px 12px",
                }}
              >
                Sign Out
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="account-section">
            <h2>Your Orders</h2>

            {/* Supabase Notice */}
            <div
              style={{
                background: "var(--cream)",
                border: "1px solid var(--border)",
                padding: "20px 24px",
                marginBottom: 28,
              }}
            >
              <p style={{ fontSize: 13, color: "var(--taupe)", margin: 0 }}>
                Connect your Supabase project to enable account management,
                order history, and saved addresses.{" "}
                <a href="/faq" style={{ color: "var(--caramel)", fontWeight: 600 }}>
                  Learn more.
                </a>
              </p>
            </div>

            {/* Orders List */}
            <div className="orders-list">
              {DEMO_ORDERS.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <p className="order-number">{order.id}</p>
                      <p className="order-date">{order.date}</p>
                    </div>
                    <span className="order-status-badge">{order.status}</span>
                  </div>
                  <p className="order-items-preview">{order.items.join(", ")}</p>
                  <p className="order-total">{order.total}</p>
                  <a className="text-link" href="#" style={{ marginTop: 14 }}>
                    View details <ArrowRight size={14} />
                  </a>
                </div>
              ))}
            </div>

            {/* Demo notice */}
            <p
              style={{
                marginTop: 24,
                fontSize: 12,
                color: "var(--taupe)",
                fontStyle: "italic",
              }}
            >
              The orders above are for demonstration purposes. Your real order history will appear here once Supabase is connected.
            </p>
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
