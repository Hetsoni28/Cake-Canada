"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        // After clicking the link → /auth/callback → redirects to reset-password
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      },
    );

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // Always show success (security: don't reveal if email exists)
    setSent(true);
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

          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "var(--cream)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Mail size={28} style={{ color: "var(--caramel)" }} />
              </div>
              <h1>Check your email</h1>
              <p
                style={{
                  color: "var(--taupe)",
                  lineHeight: 1.8,
                  marginBottom: 28,
                }}
              >
                If an account exists for <strong>{email}</strong>, we&apos;ve
                sent a password reset link. It expires in 1 hour.
              </p>
              <p style={{ fontSize: 13, color: "var(--taupe)" }}>
                Didn&apos;t get it? Check your spam folder.
              </p>
              <a
                href="/auth/login"
                className="btn btn-dark"
                style={{ display: "inline-flex", marginTop: 24 }}
              >
                Back to Sign In
              </a>
            </div>
          ) : (
            <>
              <h1>Reset your password</h1>
              <p
                style={{
                  color: "var(--taupe)",
                  marginBottom: 24,
                  fontSize: 15,
                }}
              >
                Enter your email and we&apos;ll send you a reset link.
              </p>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="form-submit"
                >
                  {loading ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      <Loader2 size={16} className="spin" /> Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <p className="auth-link">
                <a href="/auth/login">Back to Sign In</a>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
