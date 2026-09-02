// App.tsx
//
// This is the root React component. Right now it does exactly one
// meaningful thing: on load, it calls our own backend's health check
// endpoint (/api/health) and shows whether the connection worked.
//
// Why this matters more than it looks like it should: this is the first
// real end-to-end proof that the frontend and backend can talk to each
// other through the exact path (the Vite dev proxy locally, and Vercel's
// routing in production) that every future feature will depend on. If
// this doesn't work, nothing built on top of it will either — so it's
// worth confirming now, before any real feature is built.
import { useEffect, useState } from "react";
import "./App.css";

type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

function App() {
  // `status` tracks the three states any network call can be in:
  // still waiting, succeeded, or failed. Modeling all three explicitly
  // (rather than just "data" and hoping) is what lets us show a loading
  // state and an error state instead of a blank screen — see
  // PROJECT_STATE.md's UX section of the Definition of Done.
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<HealthResponse>;
      })
      .then((data) => {
        setHealth(data);
        setStatus("ok");
      })
      .catch((err) => {
        console.error("Health check failed:", err);
        setStatus("error");
      });
  }, []);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 560 }}>
      <h1>Overwatch</h1>
      <p>Phase 0/1 foundation — frontend/backend connectivity check.</p>

      {status === "loading" && <p>Checking connection to the API...</p>}

      {status === "ok" && health && (
        <div style={{ padding: "1rem", border: "1px solid #16a34a", borderRadius: 8 }}>
          <strong style={{ color: "#16a34a" }}>Connected.</strong>
          <p style={{ margin: "0.5rem 0 0" }}>
            {health.service} responded at {new Date(health.timestamp).toLocaleTimeString()}.
          </p>
        </div>
      )}

      {status === "error" && (
        <div style={{ padding: "1rem", border: "1px solid #dc2626", borderRadius: 8 }}>
          <strong style={{ color: "#dc2626" }}>Could not reach the API.</strong>
          <p style={{ margin: "0.5rem 0 0" }}>
            Make sure the API dev server is running (it starts automatically with
            <code> npm run dev</code> from the repo root).
          </p>
        </div>
      )}
    </main>
  );
}

export default App;
