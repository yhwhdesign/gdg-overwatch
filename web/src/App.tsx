// App.tsx
//
// Root component. Decides between: still checking for a session
// (isLoading), no one logged in (LoginForm), logged in but on a
// temporary password (ChangePasswordForm), or fully logged in (the
// authenticated view, with a simple admin/dashboard toggle for users
// who have the "admin" capability). There's no real router yet — this
// is intentionally minimal until more pages exist to justify one.

import { useState } from "react";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import { LoginForm } from "./components/LoginForm";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { AdminUsersPage } from "./components/AdminUsersPage";

function App() {
  const { user, isLoading, logout } = useAuth();
  const [view, setView] = useState<"dashboard" | "users">("dashboard");

  if (isLoading) {
    return <main style={{ padding: "2rem" }}>Loading...</main>;
  }

  if (!user) {
    return (
      <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <LoginForm />
      </main>
    );
  }

  if (user.mustChangePassword) {
    return (
      <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <ChangePasswordForm />
      </main>
    );
  }

  const isAdmin = user.capabilities.includes("admin") || user.capabilities.includes("master");

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>Overwatch</h1>
        <button onClick={() => logout()} style={{ padding: "0.4rem 0.8rem", cursor: "pointer" }}>
          Sign out
        </button>
      </div>

      <p style={{ color: "#666" }}>
        Signed in as <strong>{user.name}</strong> ({user.email})
      </p>

      {isAdmin && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <button
            onClick={() => setView("dashboard")}
            style={{ padding: "0.4rem 0.8rem", cursor: "pointer", fontWeight: view === "dashboard" ? 600 : 400 }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView("users")}
            style={{ padding: "0.4rem 0.8rem", cursor: "pointer", fontWeight: view === "users" ? 600 : 400 }}
          >
            Users
          </button>
        </div>
      )}

      {view === "dashboard" && <p style={{ color: "#666" }}>Capabilities: {user.capabilities.join(", ")}</p>}
      {view === "users" && isAdmin && <AdminUsersPage />}
    </main>
  );
}

export default App;