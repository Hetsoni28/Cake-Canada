"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    const { error: authError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        // After email verification the user is redirected here
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // name is stored in auth.users raw_user_meta_data
        // and our handle_new_user() trigger copies it to profiles.full_name
        data: { full_name: form.name.trim() },
      },
    });

    setLoading(false);

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError("An account with this email already exists. Try signing in.");
      } else {
        setError(authError.message);
      }
      return;
    }

    // Show "check your email" confirmation
    setSuccess(true);
  }

  if (success) {
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
            <h1>Check your email</h1>
            <p
              style={{
                color: "var(--taupe)",
                lineHeight: 1.8,
                marginBottom: 24,
              }}
            >
              We&apos;ve sent a verification link to{" "}
              <strong>{form.email}</strong>. Click the link in the email to
              activate your account.
            </p>
            <p
              style={{ fontSize: 13, color: "var(--taupe)", marginBottom: 28 }}
            >
              Didn&apos;t receive it? Check your spam folder, or{" "}
              <button
                onClick={() => setSuccess(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--caramel)",
                  cursor: "pointer",
                  fontSize: 13,
                  padding: 0,
                }}
              >
                try again
              </button>
              .
            </p>
            <a
              href="/auth/login"
              className="btn btn-dark"
              style={{ display: "inline-flex" }}
            >
              Back to Sign In
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
          <h1>Create your account.</h1>
          <p style={{ color: "var(--taupe)", marginBottom: 24, fontSize: 15 }}>
            Join to save orders and speed up checkout.
          </p>

          {error && (
            <div className="form-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Jane Smith"
              />
            </div>

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
              <label htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  minLength={8}
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
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength indicator */}
              {form.password && (
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background:
                          getPasswordStrength(form.password) >= level
                            ? level <= 1
                              ? "#e53935"
                              : level <= 2
                                ? "#f9a825"
                                : level <= 3
                                  ? "#66bb6a"
                                  : "#2e7d32"
                            : "var(--border)",
                        transition: "background 0.2s",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm password</label>
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
                  <Loader2 size={16} className="spin" /> Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p
            style={{
              fontSize: 12,
              color: "var(--taupe)",
              marginTop: 16,
              lineHeight: 1.6,
            }}
          >
            By creating an account you agree to our{" "}
            <a href="#" style={{ color: "var(--caramel)" }}>
              Terms
            </a>{" "}
            and{" "}
            <a href="#" style={{ color: "var(--caramel)" }}>
              Privacy Policy
            </a>
            .
          </p>

          <p className="auth-link">
            Already have an account? <a href="/auth/login">Sign in</a>
          </p>
        </div>
      </div>
    </main>
  );
}

function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}
