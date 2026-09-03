// routes/auth.ts
//
// The three endpoints that make up login: POST /login (check
// credentials, start a session), POST /logout (end a session),
// GET /me (who is currently logged in, if anyone).

import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../db";
import { verifyPassword } from "../auth/passwords";
import { createSession, deleteSession, SESSION_COOKIE_NAME } from "../auth/sessions";
import { requireAuth } from "../auth/middleware";
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

  // Never return passwordHash, even hashed, to the client — there's no
  // legitimate reason the frontend needs it, and it's one less place a
  // sensitive value could leak (e.g. into browser dev tools, error
  // reporting tools, etc.).
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    capabilities: user.capabilities,
  });
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
  const user = req.user!;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    capabilities: user.capabilities,
  });
});