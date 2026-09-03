// routes/auth.ts
//
// The endpoints that make up login and account credentials: POST /login
// (check credentials, start a session), POST /logout (end a session),
// GET /me (who is currently logged in, if anyone), and POST
// /change-password (set a new password — required immediately for
// anyone still on an admin-issued temporary password).

import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../db";
import { verifyPassword, hashPassword } from "../auth/passwords";
import { createSession, deleteSession, SESSION_COOKIE_NAME } from "../auth/sessions";
import { requireAuth } from "../auth/middleware";
import { toPublicUser } from "../auth/publicUser";
import { logger } from "../logger";

export const authRouter = Router();

// Login gets its OWN, much stricter rate limit than the general API
// limit (100 requests/15min). Without this, someone could try
// thousands of password guesses against one account within the
// general limit's generous allowance. 10 attempts per 15 minutes per
// IP is enough for a real user who fat-fingers their password a few
// times, but not enough to make brute-forcing practical.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait before trying again." },
});

authRouter.post("/login", loginLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // SECURITY: deliberately vague on failure, and identical whether the
  // email doesn't exist OR the password is wrong. If we said "no
  // account with that email" vs "wrong password" as different messages,
  // an attacker could use that difference to discover which emails are
  // real accounts (this is called a user-enumeration vulnerability).
  // One generic message for both cases closes that off.
  const genericFailureResponse = () => {
    res.status(401).json({ error: "Invalid email or password" });
  };

  if (!user || !user.isActive) {
    genericFailureResponse();
    return;
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    genericFailureResponse();
    return;
  }

  const { token, expiresAt } = await createSession(user.id);

  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true, // JavaScript in the browser can never read this cookie — blocks a whole category of token-theft via XSS
    secure: process.env.NODE_ENV === "production", // only sent over HTTPS in production; allowed over plain HTTP for local dev
    sameSite: "strict", // the browser will not send this cookie on requests originating from another site — this is our primary CSRF defense
    expires: expiresAt,
    path: "/",
  });

  logger.info({ userId: user.id }, "User logged in");

  res.json(toPublicUser(user));
});

authRouter.post("/logout", requireAuth, async (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (token) {
    await deleteSession(token);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, (req: Request, res: Response) => {
  // requireAuth guarantees req.user exists by this point.
  res.json(toPublicUser(req.user!));
});

// Sets a new password. Two distinct cases, both handled by this one
// endpoint:
//
//   1. mustChangePassword is true (admin created this account with a
//      temporary password): no currentPassword needed — they proved
//      who they are moments ago by logging in with the temp password
//      to even reach this authenticated endpoint.
//   2. mustChangePassword is false (a voluntary password change from
//      someone already fully set up): currentPassword IS required, as
//      a re-authentication step before allowing a sensitive change —
//      this stops someone who found an unlocked, already-logged-in
//      browser session from locking the real owner out by changing
//      their password.
authRouter.post("/change-password", requireAuth, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body ?? {};
  const user = req.user!;

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters" });
    return;
  }

  if (!user.mustChangePassword) {
    if (typeof currentPassword !== "string") {
      res.status(400).json({ error: "Current password is required" });
      return;
    }
    const currentMatches = await verifyPassword(currentPassword, user.passwordHash);
    if (!currentMatches) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
  }

  const newHash = await hashPassword(newPassword);
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash, mustChangePassword: false },
  });

  logger.info({ userId: user.id }, "Password changed");

  res.json(toPublicUser(updatedUser));
});