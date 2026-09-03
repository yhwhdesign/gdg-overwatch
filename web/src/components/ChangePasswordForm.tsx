// components/ChangePasswordForm.tsx
//
// Shown whenever the logged-in user still has mustChangePassword set —
// i.e. they logged in with a temporary password an admin gave them and
// haven't set their own yet. This is intentionally the ONLY thing they
// can do until they finish this form; see requirePasswordSet in the
// backend (auth/middleware.ts) for why that's enforced server-side,
// not just by this component existing.

import { useState, type FormEvent } from "react";
import { useAuth, ApiError } from "../context/AuthContext";

export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      // No currentPassword sent here — this form is only ever shown
      // for the mustChangePassword=true case, where the backend
      // doesn't require it (see routes/auth.ts's change-password
      // handler for the reasoning).
      await changePassword({ newPassword });
    } catch (err) {
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
      <h1 style={{ marginBottom: 0 }}>Set your password</h1>
      <p style={{ marginTop: 0, color: "#666" }}>
        You're using a temporary password. Choose a real one to continue.
      </p>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        New password
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        Confirm new password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
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
        {isSubmitting ? "Saving..." : "Set password"}
      </button>
    </form>
  );
}