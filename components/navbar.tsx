"use client";

import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "./cart-provider";
import { createBrowserClient } from "@supabase/ssr";

interface UserState {
  name: string | null;
  email: string;
  role: string | null;
}

export function Navbar() {
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserState | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Load auth state on mount
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", authUser.id)
        .single();

      setUser({
        name: profile?.full_name ?? authUser.user_metadata?.full_name ?? null,
        email: authUser.email ?? "",
        role: profile?.role ?? null,
      });
    }

    loadUser();

    // Listen for auth changes (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    setUserMenuOpen(false);
    // POST to server route so cookies are cleared server-side too
    await fetch('/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <>
      <header className="navbar">
        <div className="shell nav-inner">
          <a href="/" className="brand">
            MAISON<span>CAKE CO.</span>
          </a>

          <nav className="nav-links" aria-label="Main navigation">
            <a href="/cakes">Cakes</a>
            <a href="/categories">Collections</a>
            <a href="/custom-cake">Custom Cake</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>

          <div className="nav-actions">
            <button aria-label="Search">
              <Search size={18} />
            </button>
            <button aria-label="Wishlist">
              <Heart size={18} />
            </button>
            <button
              aria-label="Open cart"
              onClick={openCart}
              className="cart-btn"
              style={{ position: "relative" }}
            >
              <ShoppingBag size={18} />
              {count > 0 && <span className="nav-cart-badge">{count}</span>}
            </button>

            {/* ── Auth section ── */}
            {user ? (
              <div style={{ position: "relative" }}>
                {/* Avatar button */}
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-label="Account menu"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "var(--espresso)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {initials ?? <User size={15} />}
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 10px)",
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                      minWidth: 210,
                      zIndex: 600,
                      overflow: "hidden",
                      animation: "fade-in 0.15s ease",
                    }}
                  >
                    {/* User info header */}
                    <div
                      style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                        {user.name ?? "My Account"}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: 12,
                          color: "var(--taupe)",
                        }}
                      >
                        {user.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    {[
                      { href: "/account", icon: User, label: "My Profile" },
                      {
                        href: "/account/orders",
                        icon: ShoppingBag,
                        label: "Order History",
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 16px",
                            fontSize: 14,
                            color: "var(--espresso)",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "var(--cream)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "none";
                          }}
                        >
                          <Icon size={15} style={{ opacity: 0.7 }} />{" "}
                          {item.label}
                        </a>
                      );
                    })}

                    {/* Admin link — only for OWNER */}
                    {user.role === "OWNER" && (
                      <a
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 16px",
                          fontSize: 14,
                          color: "var(--caramel)",
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            "var(--cream)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            "none";
                        }}
                      >
                        <LayoutDashboard size={15} style={{ opacity: 0.85 }} />{" "}
                        Admin Dashboard
                      </a>
                    )}

                    <div
                      style={{
                        height: 1,
                        background: "var(--border)",
                        margin: "4px 0",
                      }}
                    />

                    {/* Sign out */}
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 16px",
                        fontSize: 14,
                        color: "#c62828",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "#fce4ec";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "none";
                      }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}

                {/* Backdrop to close */}
                {userMenuOpen && (
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 599 }}
                    onClick={() => setUserMenuOpen(false)}
                  />
                )}
              </div>
            ) : (
              <a className="nav-cta" href="/auth/login">
                Sign In
              </a>
            )}
          </div>

          <button
            className="mobile-menu"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="cart-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <nav
        className={`mobile-nav-drawer${mobileOpen ? " mobile-nav-drawer--open" : ""}`}
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav-header">
          <span className="brand">
            MAISON<span>CAKE CO.</span>
          </span>
          <button aria-label="Close menu" onClick={() => setMobileOpen(false)}>
            <X size={22} />
          </button>
        </div>
        <div className="mobile-nav-links">
          {[
            ["Cakes", "/cakes"],
            ["Collections", "/categories"],
            ["Custom Cake", "/custom-cake"],
            ["About", "/about"],
            ["Contact", "/contact"],
            ["FAQ", "/faq"],
          ].map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMobileOpen(false)}>
              {label}
            </a>
          ))}
          <a
            href={user ? "/account" : "/auth/login"}
            onClick={() => setMobileOpen(false)}
          >
            {user ? "My Account" : "Sign In"}
          </a>
        </div>
        <a
          className="btn btn-dark"
          href="/cakes"
          onClick={() => setMobileOpen(false)}
          style={{ margin: "0 24px" }}
        >
          Order a Cake
        </a>
      </nav>
    </>
  );
}
