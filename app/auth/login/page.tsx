"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    if (authError) {
      setLoading(false);
      // Friendly error messages
      if (authError.message.includes("Invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else if (authError.message.includes("Email not confirmed")) {
        setError(
          "Please verify your email address before signing in. Check your inbox.",
        );
      } else {
        setError(authError.message);
      }
      return;
    }

    // Success — middleware will redirect, but also navigate manually
    const next =
      new URLSearchParams(window.location.search).get("next") ?? "/account";
    window.location.href = next;
  }

  // Check for error from callback (e.g. auth_failed)
  const urlError =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("error")
      : null;

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

      <div className="auth-page">
        <div className="auth-card">
          <div
            className="brand"
            style={{ textAlign: "center", marginBottom: 28 }}
          >
            MAISON<span>CAKE CO.</span>
          </div>
          <h1>Welcome back.</h1>
          <p style={{ color: "var(--taupe)", marginBottom: 24, fontSize: 15 }}>
            Sign in to manage your orders and preferences.
          </p>

          {/* URL error (from callback) */}
          {urlError === "auth_failed" && (
            <div className="form-error" style={{ marginBottom: 16 }}>
              Authentication failed. Please try again or contact support.
            </div>
          )}

          {/* Auth error */}
          {error && (
            <div className="form-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="you@example.com"
              />
            </div>

            <div className="form-field">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label htmlFor="password" style={{ margin: 0 }}>
                  Password
                </label>
                <a
                  href="/auth/forgot-password"
                  style={{
                    fontSize: 12,
                    color: "var(--caramel)",
                    textDecoration: "none",
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--taupe)",
                    padding: 0,
                  }}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="form-submit">
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  <Loader2 size={16} className="spin" /> Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="auth-link">
            Don&apos;t have an account? <a href="/auth/signup">Create one</a>
          </p>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--border)",
              margin: "20px 0",
            }}
          />

          <a
            className="btn btn-outline"
            href="/cakes"
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            Continue as Guest
          </a>
        </div>
      </div>
    </main>
  );
}
