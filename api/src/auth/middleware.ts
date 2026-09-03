// middleware.ts
//
// Two pieces of Express middleware that everything else builds on:
//
//   1. attachUser — runs on EVERY request. Reads the session cookie (if
//      any), looks up the user, and attaches it to req.user. It does
//      NOT block unauthenticated requests — it just makes "who is this,
//      if anyone" available to whatever route handles the request next.
//
//   2. requireAuth / requireCapability — used explicitly on routes that
//      need protection. requireAuth blocks anyone without a valid
//      session. requireCapability blocks anyone without a specific
//      named permission (see the capabilities comment in schema.prisma
//      for why we use named capabilities instead of a single role).

import type { Request, Response, NextFunction } from "express";
import type { User } from "@prisma/client";
import { getUserForSessionToken, SESSION_COOKIE_NAME } from "./sessions";
import { CAPABILITIES } from "./capabilities";

// Extends Express's Request type so `req.user` is recognized by
// TypeScript everywhere in the app, instead of needing an `as any` cast
// every time a route reads it.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (token) {
    const user = await getUserForSessionToken(token);
    if (user) {
      req.user = user;
    }
  }

  next();
}

// Blocks the request entirely unless attachUser found a valid,
// logged-in user. Use this on any route that should never be reachable
// by a logged-out visitor.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  next();
}

// Blocks the request unless the logged-in user has the named
// capability (or is an admin, which satisfies any capability check).
// Always implies requireAuth's check too.
//
// Usage: app.post("/api/jobs/:id/status", requireCapability("jobs:edit_status"), handler)
export function requireCapability(capability: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Not logged in" });
      return;
    }
    if (!req.user.capabilities.includes(capability) && !req.user.capabilities.includes(CAPABILITIES.ADMIN)) {
      res.status(403).json({ error: "You don't have permission to do that" });
      return;
    }
    next();
  };
}