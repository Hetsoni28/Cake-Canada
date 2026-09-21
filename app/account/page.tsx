"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  Loader2,
  CheckCircle,
  Heart,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
}

const SIDEBAR_LINKS = [
  { href: "/account", icon: User, label: "My Profile", active: true },
  {
    href: "/account/orders",
    icon: Package,
    label: "Order History",
    active: false,
  },
  {
    href: "/account/wishlist",
    icon: Heart,
    label: "My Wishlist",
    active: false,
  },
  {
    href: "/account/addresses",
    icon: MapPin,
    label: "Saved Addresses",
    active: false,
  },
  {
    href: "/account/settings",
    icon: Settings,
    label: "Settings",
    active: false,
  },
];

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .eq("id", user.id)
        .single();

      const p: Profile = {
        id: user.id,
        full_name: data?.full_name ?? null,
        email: user.email ?? "",
        phone: data?.phone ?? null,
      };
      setProfile(p);
      setForm({ full_name: p.full_name ?? "", phone: p.phone ?? "" });
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
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

      <div className="page-hero">
        <div className="shell">
          <p className="eyebrow">MY ACCOUNT</p>
          <h1>
            {loading
              ? "Loading..."
              : `Hello, ${profile?.full_name?.split(" ")[0] ?? "there"}.`}
          </h1>
        </div>
      </div>

      <section className="section shell">
        <div className="account-layout">
          {/* Sidebar */}
          <aside className="account-sidebar">
            <h3>Navigation</h3>
            <nav className="account-nav">
              {SIDEBAR_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={link.active ? "active" : ""}
                  >
                    <Icon size={15} /> {link.label}
                  </a>
                );
              })}
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  color: "var(--taupe)",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="account-section">
            <h2>My Profile</h2>

            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "var(--taupe)",
                  padding: "40px 0",
                }}
              >
                <Loader2 size={20} className="spin" /> Loading profile...
              </div>
            ) : (
              <div className="custom-form-card">
                {error && (
                  <div className="form-error" style={{ marginBottom: 16 }}>
                    {error}
                  </div>
                )}
                {saved && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#2e7d32",
                      background: "#e8f5e9",
                      border: "1px solid #c8e6c9",
                      borderRadius: 8,
                      padding: "12px 16px",
                      marginBottom: 16,
                    }}
                  >
                    <CheckCircle size={16} /> Profile saved!
                  </div>
                )}

                <form onSubmit={handleSave}>
                  <div className="form-field">
                    <label>Full name</label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, full_name: e.target.value }))
                      }
                      placeholder="Your name"
                    />
                  </div>

                  <div className="form-field">
                    <label>Email address</label>
                    <input
                      type="email"
                      value={profile?.email ?? ""}
                      disabled
                      style={{
                        background: "var(--cream)",
                        color: "var(--taupe)",
                      }}
                    />
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--taupe)",
                        marginTop: 4,
                      }}
                    >
                      Email cannot be changed here. Contact support if needed.
                    </p>
                  </div>

                  <div className="form-field">
                    <label>
                      Phone number{" "}
                      <span style={{ color: "var(--taupe)", fontWeight: 400 }}>
                        (optional)
                      </span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="+1 (416) 000-0000"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="form-submit"
                  >
                    {saving ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          justifyContent: "center",
                        }}
                      >
                        <Loader2 size={16} className="spin" /> Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </form>

                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid var(--border)",
                    margin: "28px 0",
                  }}
                />

                <div>
                  <h3 style={{ fontSize: 15, marginBottom: 8 }}>Password</h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--taupe)",
                      marginBottom: 12,
                    }}
                  >
                    Change your account password.
                  </p>
                  <a
                    href="/auth/forgot-password"
                    className="btn btn-outline btn-sm"
                  >
                    Change Password
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
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
            <p>Canada</p>
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
