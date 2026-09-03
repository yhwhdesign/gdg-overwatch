// components/LoginForm.tsx
//
// A plain login form. Deliberately simple — no "forgot password" or
// "sign up" links, since Overwatch has no self-signup (accounts are
// created by an admin via the seed script / future admin tooling) and
// password reset is a feature we haven't built yet, not something to
// fake a link to.

import { useState, type FormEvent } from "react";
import { useAuth, ApiError } from "../context/AuthContext";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      // ApiError's message is the server's actual response (e.g.
      // "Invalid email or password" or the rate-limit message) — safe
      // to show directly since the backend already wrote it to be
      // user-facing and non-revealing (see routes/auth.ts's comment on
      // why login failures are deliberately generic).
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.75rem" }}
    >
      <h1 style={{ marginBottom: 0 }}>Overwatch</h1>
      <p style={{ marginTop: 0, color: "#666" }}>Sign in to continue.</p>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
      </label>

      {error && (
        <div style={{ color: "#dc2626", fontSize: "0.9rem" }} role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{ padding: "0.6rem", fontSize: "1rem", cursor: isSubmitting ? "not-allowed" : "pointer" }}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}