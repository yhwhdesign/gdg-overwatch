// middleware.ts
//
// Pieces of Express middleware that everything else builds on:
//
//   1. attachUser — runs on EVERY request. Reads the session cookie (if
//      any), looks up the user, and attaches it to req.user. It does
//      NOT block unauthenticated requests — it just makes "who is this,
//      if anyone" available to whatever route handles the request next.
//
//   2. requireAuth / requirePasswordSet / requireCapability — used
//      explicitly on routes that need protection.

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

// Blocks the request unless the logged-in user has already set their
// own real password — i.e. blocks anyone still on an admin-issued
// temporary password from doing anything except changing it.
//
// WHY THIS IS ENFORCED HERE, NOT JUST IN THE FRONTEND:
// A frontend redirect to "set your password" is just UX — a
// technically savvy person (or a temp password shared more widely than
// intended) could still call the real API directly and skip that
// screen entirely. This middleware makes the restriction real: even
// with a valid, logged-in session, a temp-password account can only
// reach the routes inside routes/auth.ts (change-password, logout, me)
// until they set a real password.
//
// Apply this on business routes (jobs, admin actions, etc.) alongside
// requireAuth/requireCapability. Deliberately NOT applied inside
// routes/auth.ts itself, since those are exactly the routes a
// must-change-password user still needs to reach.
export function requirePasswordSet(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  if (req.user.mustChangePassword) {
    res.status(403).json({
      error: "You must set a new password before continuing.",
      mustChangePassword: true,
    });
    return;
  }
  next();
}

// True if the user has the MASTER capability — the only capability
// that can assign/change anyone's capabilities. Exported as a plain
// function (not just middleware) because routes/users.ts needs to
// check this conditionally, partway through a handler, not as a
// blanket gate on an entire route.
export function isMaster(user: User): boolean {
  return user.capabilities.includes(CAPABILITIES.MASTER);
}

// Blocks the request unless the logged-in user has the named
// capability — with a deliberate two-tier override hierarchy:
//
//   - MASTER satisfies ANY capability check, including a check for
//     MASTER itself.
//   - ADMIN satisfies any capability check EXCEPT a check for MASTER
//     specifically. This is what makes "admins can't change roles"
//     actually true: the "change capabilities" action is gated on
//     requireCapability(CAPABILITIES.MASTER) (or the isMaster() helper
//     above), which ADMIN's override deliberately does not reach.
//
// Always implies being logged in first.
//
// Usage: app.post("/api/jobs/:id/status", requireCapability("jobs:edit_status"), handler)
export function requireCapability(capability: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Not logged in" });
      return;
    }

    const caps = req.user.capabilities;
    const hasDirectly = caps.includes(capability);
    const hasMasterOverride = caps.includes(CAPABILITIES.MASTER);
    const hasAdminOverride = capability !== CAPABILITIES.MASTER && caps.includes(CAPABILITIES.ADMIN);

    if (!hasDirectly && !hasMasterOverride && !hasAdminOverride) {
      res.status(403).json({ error: "You don't have permission to do that" });
      return;
    }
    next();
  };
}