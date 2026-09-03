// logger.ts
//
// A single, shared, structured logger for the whole backend. Every other
// file that needs to log something imports THIS, instead of calling
// console.log/console.error directly. That matters for a few reasons:
//
//   1. Structured output (JSON) instead of free-text sentences means logs
//      can actually be searched/filtered later — e.g. "show me every
//      error where event = 'hcp.sync_failed'" — instead of grepping
//      through a wall of unstructured strings.
//   2. One place to change HOW we log (format, level, destination) if
//      that ever needs to change, instead of hunting through every file.
//   3. It's much harder to accidentally log a secret when logging goes
//      through a deliberate call site instead of ad-hoc console.log
//      calls sprinkled through the codebase.
//
// We use Pino because it's the current industry-standard structured
// logger for Node: fast, minimal overhead, JSON by default, and it
// works fine both in a long-running local dev server AND inside a
// short-lived Vercel serverless function (no persistent file handles or
// background flushing to worry about).

import pino from "pino";

// Log level policy:
//   - "debug" locally, so you can see everything while developing.
//   - "info" in production, so routine noise doesn't drown out what
//     actually matters. "error"/"warn" always come through regardless
//     of environment.
const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: isProduction ? "info" : "debug",

  // Attaches these fields to every single log line automatically, so
  // you never have to remember to add "which service is this from" by
  // hand — useful once there's more than one service/process running.
  base: {
    service: "overwatch-api",
  },

  // SECURITY: strip sensitive header values out of every log line
  // before it's ever written anywhere, regardless of what code path
  // produced the log. pino-http (used in app.ts) logs the full request
  // and response headers by default for debugging convenience — which
  // means without this, a session cookie or Authorization bearer token
  // would get written to logs in plaintext the moment real login exists
  // in Phase 2. `remove: true` deletes the field entirely rather than
  // replacing it with a placeholder, so it never appears in output at
  // all.
  redact: {
    paths: [
      "req.headers.cookie",
      'req.headers["set-cookie"]',
      "req.headers.authorization",
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },

  // pino-pretty makes local dev logs human-readable (colored, one line
  // per entry) instead of raw JSON, which is hard to eyeball while
  // you're actively coding. In production we want the raw JSON, since
  // that's what log platforms (like Vercel's dashboard) parse and index.
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
});

// A hard rule worth stating explicitly in code, not just in
// PROJECT_STATE.md: NEVER pass secrets, tokens, passwords, or full
// customer records into logger calls. Log identifiers (job id, user id,
// event name) — not the sensitive payload itself. If you need to debug
// a specific record's contents, do it locally and temporarily, never
// as a committed logger.info(...) call.