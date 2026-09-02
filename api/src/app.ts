// app.ts
//
// This file builds the Express application itself — every route and every
// piece of middleware Overwatch's backend uses. It does NOT start a server
// (no app.listen() here). That separation matters:
//
//   - Locally, src/index.ts imports this app and calls app.listen() so you
//     get a normal, always-on server you can watch in your terminal.
//   - In production on Vercel, this same app object gets wrapped by a
//     serverless handler (added when we deploy) instead of calling
//     app.listen(). Vercel invokes it per-request rather than keeping it
//     running continuously.
//
// Keeping the app definition separate from "how it's run" means we can
// change hosting platforms later (see PROJECT_STATE.md's portability
// requirement) without touching any route or middleware code.

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";

export function createApp() {
  const app = express();

  // Parses incoming JSON request bodies (e.g. from the React frontend)
  // into req.body. Without this, req.body would be undefined for any
  // POST/PUT/PATCH request that sends JSON.
  app.use(express.json());

  // CORS: allows the frontend (running on a different origin during local
  // dev — Vite on its own port) to call this API. In production, since
  // the frontend and API deploy together under the same Vercel domain via
  // vercel.json's routing, this is mostly a local-dev convenience. We keep
  // it permissive for now (Phase 0/1) and will tighten it to an explicit
  // allow-list once real user data is flowing (Phase 2 — Identity &
  // Permissions).
  app.use(cors());

  // Health check route. Every real backend needs a simple, unauthenticated
  // endpoint that says "the server is alive and can talk to the database."
  // This is what uptime monitors, deploy scripts, and you (when debugging)
  // hit first. It intentionally does NOT require login — if it did, you
  // couldn't use it to check whether the server is even reachable.
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "overwatch-api",
      timestamp: new Date().toISOString(),
    });
  });

  // --- Future routes get registered here, e.g.: ---
  // app.use("/api/jobs", jobsRouter);
  // app.use("/api/auth", authRouter);

  // Catch-all error handler. Express treats any middleware with FOUR
  // arguments (err, req, res, next) as an error handler, regardless of
  // name — this exact signature is what makes Express route errors here.
  //
  // Why this matters: without this, an unexpected error in any route
  // (a bad database query, a bug, etc.) would either crash the process
  // or leak a raw stack trace back to the client. Neither is acceptable
  // once real users depend on this. For now it just logs and returns a
  // generic message; we'll expand this with structured logging in
  // Phase 1's "Logging" build item.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
