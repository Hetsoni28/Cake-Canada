"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    // At this point the user has an active recovery session from the callback
    const { error: authError } = await supabase.auth.updateUser({
      password: form.password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setDone(true);

    // Auto-redirect after 3s
    setTimeout(() => {
      window.location.href = "/account";
    }, 3000);
  }

  if (done) {
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
          <div className="auth-card" style={{ textAlign: "center" }}>
            <CheckCircle
              size={52}
              style={{ color: "var(--caramel)", margin: "0 auto 20px" }}
            />
            <h1>Password updated!</h1>
            <p
              style={{
                color: "var(--taupe)",
                marginBottom: 24,
                lineHeight: 1.8,
              }}
            >
              Your password has been changed successfully. Redirecting you to
              your account...
            </p>
            <a
              href="/account"
              className="btn btn-dark"
              style={{ display: "inline-flex" }}
            >
              Go to My Account
            </a>
          </div>
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

      <div className="auth-page">
        <div className="auth-card">
          <div
            className="brand"
            style={{ textAlign: "center", marginBottom: 28 }}
          >
            MAISON<span>CAKE CO.</span>
          </div>
          <h1>Set new password</h1>
          <p style={{ color: "var(--taupe)", marginBottom: 24, fontSize: 15 }}>
            Choose a strong password for your account.
          </p>

          {error && (
            <div className="form-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="password">New password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="At least 8 characters"
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
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                placeholder="••••••••"
              />
              {form.confirmPassword &&
                form.password !== form.confirmPassword && (
                  <p style={{ fontSize: 12, color: "#e53935", marginTop: 4 }}>
                    Passwords do not match
                  </p>
                )}
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
                  <Loader2 size={16} className="spin" /> Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
