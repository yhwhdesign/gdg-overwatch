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
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { logger } from "./logger";
import { attachUser } from "./auth/middleware";
import { authRouter } from "./routes/auth";

export function createApp() {
  const app = express();

  // Sets a set of standard security-related HTTP response headers
  // (hides the "X-Powered-By: Express" fingerprint, prevents MIME-type
  // sniffing, blocks the app from being embedded in a hostile iframe,
  // etc.). This is a one-line, zero-cost baseline every Express app
  // should have — it doesn't replace real authentication/authorization,
  // it just closes off a handful of well-known attack surfaces that
  // exist regardless of who's logged in.
  app.use(helmet());

  // Rate limiting: without this, nothing stops one client (an attacker,
  // a buggy script, or a runaway frontend retry loop) from hammering
  // the API thousands of times a second. This matters even before real
  // authentication exists in Phase 2, because unauthenticated endpoints
  // (health checks now, login later) are exactly what gets targeted
  // first. 100 requests per 15 minutes per IP is a generous ceiling for
  // normal use; we'll revisit this number once real usage patterns
  // exist (e.g. a dispatch board polling every 15-30s needs its own
  // higher allowance — see PROJECT_STATE.md's real-time polling
  // decision).
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: true, // returns rate limit info in RateLimit-* headers
    legacyHeaders: false,
  });
  app.use("/api", apiLimiter);

  // Parses incoming JSON request bodies (e.g. from the React frontend)
  // into req.body. The size limit caps how large a single request body
  // can be — without it, express.json() accepts a body of any size,
  // which means someone could send a huge payload just to try to
  // exhaust server memory. 1MB is generous for any JSON payload this
  // app realistically sends today; we'll raise this deliberately if a
  // future feature (e.g. bulk import) genuinely needs more.
  app.use(express.json({ limit: "1mb" }));

  // Automatically logs one structured line per request/response, e.g.
  // method, path, status code, and response time — without us having to
  // add a logger.info(...) call to every single route by hand. This is
  // the first thing you'll look at when something in production behaves
  // unexpectedly: "what requests actually came in, and what did we send
  // back?"
  app.use(pinoHttp({ logger }));

  // CORS: allows the frontend to call this API from a different origin
  // (during local dev, Vite runs on its own port; in production it's
  // usually the same domain, but we keep this explicit either way).
  //
  // IMPORTANT CHANGE FROM PHASE 1: this used to be a wildcard
  // (`cors()` with no options, meaning "allow any origin"). That's no
  // longer possible now that we use cookies for login sessions —
  // browsers refuse to send credentials (cookies) on cross-origin
  // requests unless the server names an EXACT origin, not a wildcard.
  // FRONTEND_URL must be set in the environment (see .env.example);
  // it defaults to Vite's local dev address if unset.
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true, // allows the browser to send/receive the session cookie
    })
  );

  // Parses cookies from incoming requests into req.cookies, so
  // auth/middleware.ts can read the session cookie by name.
  app.use(cookieParser());

  // Runs on every request: looks up the session cookie (if any) and
  // attaches the logged-in user to req.user for any route to use. Does
  // NOT block unauthenticated requests by itself — see requireAuth /
  // requireCapability in auth/middleware.ts for that.
  app.use(attachUser);

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
  app.use("/api/auth", authRouter);

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
    // logger.error (not console.error) so this shows up as a structured,
    // filterable log entry — e.g. { level: "error", msg: "Unhandled error", err: {...} }
    // instead of a plain-text line that's only readable by a human
    // watching the terminal live.
    logger.error({ err }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}