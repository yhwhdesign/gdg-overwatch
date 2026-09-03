// App.tsx
//
// Root component. Now that Phase 2 has real authentication, this
// decides between three states: still checking for an existing session
// (isLoading), no one logged in (show LoginForm), or someone logged in
// (show a minimal authenticated view). Real pages/routing come later —
// this is intentionally minimal, just enough to prove the whole login
// flow works end to end from the browser, not just via curl.

import "./App.css";
import { useAuth } from "./context/AuthContext";
import { LoginForm } from "./components/LoginForm";

function App() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    // Deliberately brief and unstyled — this only shows for the
    // fraction of a second it takes to check for an existing session,
    // not something worth a full loading-spinner treatment yet.
    return <main style={{ padding: "2rem" }}>Loading...</main>;
  }

  if (!user) {
    return (
      <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <LoginForm />
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