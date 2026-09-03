// App.tsx
//
// Root component. Decides between four states: still checking for an
// existing session (isLoading), no one logged in (LoginForm), logged
// in but still on a temporary password (ChangePasswordForm — see
// requirePasswordSet in the backend for why this is enforced, not just
// a UX nicety), or fully logged in (the authenticated view). Real
// pages/routing come later — this is intentionally minimal.

import "./App.css";
import { useAuth } from "./context/AuthContext";
import { LoginForm } from "./components/LoginForm";
import { ChangePasswordForm } from "./components/ChangePasswordForm";

function App() {
  const { user, isLoading, logout } = useAuth();

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

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 560 }}>
      <h1>Overwatch</h1>
      <p>
        Signed in as <strong>{user.name}</strong> ({user.email})
      </p>
      <p style={{ color: "#666" }}>Capabilities: {user.capabilities.join(", ")}</p>
      <button onClick={() => logout()} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
        Sign out
      </button>
    </main>
  );
}

export default App;